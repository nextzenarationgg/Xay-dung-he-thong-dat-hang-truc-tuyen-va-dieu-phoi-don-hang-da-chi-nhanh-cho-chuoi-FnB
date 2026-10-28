"""
Điều phối đơn hàng tự động — chọn chi nhánh tốt nhất trong bán kính 10 km.

Công thức: Score = 0.50*D + 0.25*L + 0.15*R + 0.10*A (thang 0-100 mỗi thành phần)

- D: Khoảng cách (Haversine) — phi tuyến (^1.5), phạt mạnh khoảng cách xa
- L: Tải công việc — 100 khi rảnh, 0 khi đầy
- R: Đánh giá — Bayesian average để tránh nhiễu mẫu nhỏ
- A: Sẵn sàng — 100 nếu is_accepting_orders=True (đã lọc cứng trước)
"""

import math

from branches.models import Branch
from orders.models import Order


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


def select_best_branch(order, debug=False):
    """
    Trả về tuple (branch_or_none, reason, breakdown_dict).

    reason ∈ {"ok", "missing_coordinates", "invalid_coordinates", "no_candidate"}
    """
    if order.delivery_lat is None or order.delivery_lng is None:
        return None, "missing_coordinates", {}

    lat = float(order.delivery_lat)
    lng = float(order.delivery_lng)
    if not is_valid_vn_coords(lat, lng):
        return None, "invalid_coordinates", {}

    candidates = Branch.objects.filter(
        is_active=True,
        is_accepting_orders=True,
        latitude__isnull=False,
        longitude__isnull=False,
    )

    scored = []
    for branch in candidates:
        load = _active_load(branch)
        capacity = branch.max_capacity or 0
        if capacity <= 0 or load >= capacity:
            continue

        dist = haversine_km(lat, lng, float(branch.latitude), float(branch.longitude))
        if dist > MAX_DISTANCE_KM:
            continue

        D = _distance_score(dist)
        L = 100.0 * (1 - load / capacity)
        R = _rating_score(branch)
        A = 100.0

        score = (WEIGHTS["D"] * D + WEIGHTS["L"] * L
                 + WEIGHTS["R"] * R + WEIGHTS["A"] * A)

        scored.append({
            "branch": branch, "score": score,
            "D": D, "L": L, "R": R, "A": A,
            "distance_km": round(dist, 3),
            "load": load, "max_capacity": capacity,
        })

    if not scored:
        return None, "no_candidate", {}

    scored.sort(key=lambda x: (-x["score"], x["distance_km"]))
    best = scored[0]

    breakdown = {
        "chosen_branch_id": best["branch"].pk,
        "score": round(best["score"], 2),
        "D": round(best["D"], 2),
        "L": round(best["L"], 2),
        "R": round(best["R"], 2),
        "A": round(best["A"], 2),
        "distance_km": best["distance_km"],
        "load": best["load"],
        "max_capacity": best["max_capacity"],
        "candidates": [
            {
                "branch_id": c["branch"].pk,
                "branch_name": c["branch"].name,
                "score": round(c["score"], 2),
                "distance_km": c["distance_km"],
                "D": round(c["D"], 2),
                "R": round(c["R"], 2),
            }
            for c in scored
        ],
    }

    if debug:
        print(f"\n=== DISPATCH DEBUG order={order.code} ===")
        print(f"  Khách @ ({lat:.4f}, {lng:.4f})")
        for c in scored:
            print(f"  {c['branch'].name:30s} | d={c['distance_km']:.2f}km | "
                  f"D={c['D']:5.1f} L={c['L']:5.1f} R={c['R']:5.1f} | score={c['score']:.2f}")
        print(f"  → Chọn: {best['branch'].name} (score={best['score']:.2f})\n")

    return best["branch"], "ok", breakdown