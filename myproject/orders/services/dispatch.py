"""
Điều phối đơn hàng tự động — chọn chi nhánh tốt nhất trong bán kính 10 km.

Công thức: Score = 0.50*D + 0.25*L + 0.15*R + 0.10*A (thang 0-100 mỗi thành phần)

- D: Khoảng cách (Haversine) — phi tuyến (^1.5), phạt mạnh khoảng cách xa
- L: Tải công việc — 100 khi rảnh, 0 khi đầy
- R: Đánh giá — Bayesian average để tránh nhiễu mẫu nhỏ
- A: Sẵn sàng — 100 nếu is_accepting_orders=True (đã lọc cứng trước)
"""

import math

from branches.models import Branch, Ingredient
from orders.models import Order, ProductIngredient


WEIGHTS = {"D": 0.50, "L": 0.25, "R": 0.15, "A": 0.10}
MAX_DISTANCE_KM = 10.0
DISTANCE_EXPONENT = 1.5  # phạt mạnh khoảng cách xa

PRIOR_RATING = 3.5
PRIOR_COUNT = 5

ACTIVE_STATUSES = [
    Order.Status.PENDING,
    Order.Status.CONFIRMED,
    Order.Status.PREPARING,
    Order.Status.READY,
    Order.Status.DELIVERING,
]

VN_LAT_RANGE = (8.0, 24.0)
VN_LNG_RANGE = (102.0, 110.0)


def haversine_km(lat1, lng1, lat2, lng2):
    """Khoảng cách đường chim bay (km) giữa hai tọa độ."""
    R = 6371.0
    p1 = math.radians(lat1)
    p2 = math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def is_valid_vn_coords(lat, lng):
    return (VN_LAT_RANGE[0] <= lat <= VN_LAT_RANGE[1]
            and VN_LNG_RANGE[0] <= lng <= VN_LNG_RANGE[1])


def _distance_score(dist_km):
    """Điểm khoảng cách 0-100, phi tuyến ^1.5 — phạt mạnh khoảng cách xa."""
    if dist_km >= MAX_DISTANCE_KM:
        return 0.0
    ratio = 1.0 - dist_km / MAX_DISTANCE_KM
    return 100.0 * (ratio ** DISTANCE_EXPONENT)


def _active_load(branch):
    return Order.objects.filter(branch=branch, status__in=ACTIVE_STATUSES).count()


def _rating_score(branch):
    """Bayesian average — tránh 1 đánh giá 5★ ăn điểm hơn 100 đánh giá 4.8★."""
    r = float(branch.rating or 0)
    n = branch.rating_count or 0
    adjusted = (r * n + PRIOR_RATING * PRIOR_COUNT) / (n + PRIOR_COUNT)
    return 20 * adjusted


def _has_enough_ingredients(branch, order):
    """
    Kiểm tra xem chi nhánh có đủ nguyên liệu để làm tất cả các món trong đơn hàng hay không.
    Trả về True nếu đủ, False nếu thiếu bất kỳ nguyên liệu nào.
    """
    # Nếu order chưa được lưu vào DB (chưa có pk), hoặc không có items
    if not order.pk:
        # Trường hợp gọi preview (không có items thực tế trong DB), ta bỏ qua kiểm tra
        return True

    # Lấy danh sách sản phẩm và số lượng cần làm
    product_qtys = {}
    for item in order.items.all():
        if item.product_id:
            product_qtys[item.product_id] = product_qtys.get(item.product_id, 0) + item.quantity

    if not product_qtys:
        return True

    # Lấy tất cả công thức của các món trong đơn
    recipes = ProductIngredient.objects.filter(product_id__in=product_qtys.keys())
    
    # Tính tổng nguyên liệu cần thiết
    required_ingredients = {}
    for recipe in recipes:
        qty_needed = float(recipe.quantity_per_portion) * product_qtys[recipe.product_id]
        key = recipe.ingredient_name.lower()
        required_ingredients[key] = required_ingredients.get(key, 0.0) + qty_needed

    if not required_ingredients:
        return True

    # Lấy kho hiện tại của chi nhánh
    branch_ingredients = {
        ing.name.lower(): float(ing.quantity) 
        for ing in Ingredient.objects.filter(branch=branch)
    }

    # Kiểm tra xem có đủ từng loại nguyên liệu không
    for ing_name, qty_needed in required_ingredients.items():
        # Nếu kho không có nguyên liệu này, hoặc số lượng ít hơn cần thiết -> False
        if branch_ingredients.get(ing_name, 0.0) < qty_needed:
            return False
            
    return True


def select_best_branch(order, debug=False):
    """
    Trả về tuple (branch_or_none, reason, breakdown_dict).
    """
    if order.delivery_lat is None or order.delivery_lng is None:
        return None, "missing_coordinates", {}

    lat = float(order.delivery_lat)
    lng = float(order.delivery_lng)
    if not is_valid_vn_coords(lat, lng):
        return None, "invalid_coordinates", {}

    candidates = Branch.objects.filter(is_active=True) # Lấy tất cả chi nhánh đang active

    scored = []
    for branch in candidates:
        # 1. Kiểm tra nguyên liệu
        has_ingredients = _has_enough_ingredients(branch, order)
        
        # 2. Kiểm tra tải
        load = _active_load(branch)
        capacity = branch.max_capacity or 0
        is_overloaded = (capacity <= 0 or load >= capacity)
        
        # 3. Kiểm tra khoảng cách
        dist = haversine_km(lat, lng, float(branch.latitude) if branch.latitude else 0, float(branch.longitude) if branch.longitude else 0)
        is_too_far = dist > MAX_DISTANCE_KM
        
        # 4. Kiểm tra trạng thái nhận đơn
        is_accepting = branch.is_accepting_orders

        # Đánh giá xem chi nhánh có hợp lệ không
        is_valid = has_ingredients and not is_overloaded and not is_too_far and is_accepting
        
        reason = None
        if not is_accepting: reason = "Tạm ngưng nhận đơn"
        elif is_too_far: reason = f"Ngoài bán kính {MAX_DISTANCE_KM}km"
        elif not has_ingredients: reason = "Thiếu nguyên liệu"
        elif is_overloaded: reason = "Quá tải"
        
        D = _distance_score(dist)
        L = 100.0 * (1 - load / capacity) if capacity > 0 else 0
        R = _rating_score(branch)
        A = 100.0 if is_accepting else 0

        score = (WEIGHTS["D"] * D + WEIGHTS["L"] * L + WEIGHTS["R"] * R + WEIGHTS["A"] * A) if is_valid else 0

        scored.append({
            "branch": branch, 
            "score": score,
            "D": D, "L": L, "R": R, "A": A,
            "distance_km": round(dist, 3),
            "load": load, 
            "max_capacity": capacity,
            "is_valid": is_valid,
            "reason": reason,
            "pct_load": round(load / capacity * 100) if capacity > 0 else 0
        })

    # Sắp xếp: Hợp lệ lên trước, sau đó đến điểm cao, sau đó đến gần hơn
    scored.sort(key=lambda x: (not x["is_valid"], -x["score"], x["distance_km"]))

    valid_branches = [c for c in scored if c["is_valid"]]
    best = valid_branches[0] if valid_branches else None

    breakdown = {
        "chosen_branch_id": best["branch"].pk if best else None,
        "score": round(best["score"], 2) if best else 0,
        "distance_km": best["distance_km"] if best else 0,
        "candidates": [
            {
                "branch_id": c["branch"].pk,
                "branch_name": c["branch"].name,
                "address": c["branch"].address,
                "score": round(c["score"], 2),
                "distance_km": c["distance_km"],
                "is_valid": c["is_valid"],
                "reason": c["reason"],
                "pct_load": c["pct_load"]
            }
            for c in scored
        ],
    }

    return (best["branch"] if best else None), ("ok" if best else "no_candidate"), breakdown