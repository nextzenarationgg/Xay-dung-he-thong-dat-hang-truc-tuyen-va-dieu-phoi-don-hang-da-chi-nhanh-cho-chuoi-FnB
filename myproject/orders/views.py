import json
import re
import os
import requests
from datetime import date
from functools import wraps
from django.contrib.auth.decorators import login_required

from django.db import transaction
from django.db.models import Count, Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.http import require_http_methods
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt

from accounts.models import BranchMembership
from branches.models import Branch, Ingredient
from orders.services.dispatch import is_valid_vn_coords, select_best_branch
from .models import (
    Cart, CartItem, DispatchLog, Order, OrderItem, Product, ProductIngredient,
    Table, DineInOrder, DineInOrderItem
)

DELIVERY_FEE = 15000
VOUCHERS = {
    "MIEU10": {"kind": "percent", "value": 10, "maximum": 30000, "minimum": 99000, "expires": date(2026, 10, 31)},
    "FREESHIP": {"kind": "shipping", "minimum": 120000, "expires": date(2026, 11, 15)},
    "CHAO20": {"kind": "amount", "value": 20000, "minimum": 60000, "expires": date(2026, 12, 31)},
    "CUOITUAN15": {"kind": "percent", "value": 15, "maximum": 45000, "minimum": 150000, "expires": date(2026, 11, 30), "weekend": True},
}

def customer_api(view):
    @wraps(view)
    def wrapped(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Vui lòng đăng nhập để tiếp tục."}, status=401)
        if request.user.role != "customer":
            return JsonResponse({"error": "Chức năng này chỉ dành cho tài khoản khách hàng."}, status=403)
        return view(request, *args, **kwargs)
    return wrapped

def branch_api(view):
    @wraps(view)
    def wrapped(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Vui lòng đăng nhập để tiếp tục."}, status=401)
        if request.user.role not in ("branch_admin", "branch_staff"):
            return JsonResponse({"error": "Chức năng này chỉ dành cho nhân viên chi nhánh."}, status=403)
        try:
            request.branch_membership = BranchMembership.objects.select_related("branch").get(
                user=request.user,
            )
        except BranchMembership.DoesNotExist:
            return JsonResponse({"error": "Tài khoản chưa được gán vào chi nhánh."}, status=403)
        if not request.branch_membership.branch.is_active:
            return JsonResponse({"error": "Chi nhánh của tài khoản hiện không hoạt động."}, status=403)
        return view(request, *args, **kwargs)
    return wrapped

def parse_json(request):
    try:
        data = json.loads(request.body or b"{}")
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None, JsonResponse({"error": "Dữ liệu gửi lên không hợp lệ."}, status=400)
    if not isinstance(data, dict):
        return None, JsonResponse({"error": "Dữ liệu gửi lên phải có định dạng đối tượng."}, status=400)
    return data, None

def text_value(data, key):
    value = data.get(key, "")
    return value.strip() if isinstance(value, str) else ""

def cart_payload(cart):
    items = list(
        cart.items.select_related("product")
        .filter(product__is_active=True)
        .order_by("product__name")
    )
    serialized = [
        {
            "product_code": item.product_id,
            "name": item.product.name,
            "category": item.product.category,
            "price": item.product.price,
            "quantity": item.quantity,
            "note": item.note,
            "line_total": item.product.price * item.quantity,
        }
        for item in items
    ]
    return {
        "items": serialized,
        "count": sum(item["quantity"] for item in serialized),
        "subtotal": sum(item["line_total"] for item in serialized),
    }

@require_http_methods(["GET"])
def product_list(request):
    products = Product.objects.filter(is_active=True).order_by("code")
    return JsonResponse(
        {
            "products": [
                {
                    "code": product.code,
                    "name": product.name,
                    "category": product.category,
                    "price": product.price,
                    "description": product.description,
                    "image_url": product.image.url if product.image else None, # THÊM DÒNG NÀY
                }
                for product in products
            ]
        }
    )

def order_payload(order):
    return {
        "code": order.code,
        "status": order.status,
        "status_label": order.get_status_display(),
        "payment_method": order.payment_method,
        "payment_method_label": order.get_payment_method_display(),
        "payment_status": order.payment_status,
        "recipient_name": order.recipient_name,
        "recipient_phone": order.recipient_phone,
        "delivery_address": order.delivery_address,
        "note": order.note,
        "voucher_code": order.voucher_code,
        "subtotal": order.subtotal,
        "delivery_fee": order.delivery_fee,
        "discount": order.discount,
        "total": order.total,
        "created_at": order.created_at.isoformat(),
        "branch_name": order.branch.name if order.branch_id else None,
        "accepted_at": order.accepted_at.isoformat() if order.accepted_at else None,
        "shipper_id": order.shipper_id,
        "shipper_name": (
            order.shipper.get_full_name() or order.shipper.username if order.shipper_id else None
        ),
        "shipper_phone": order.shipper.phone if order.shipper_id else None,
        "items": [
            {
                "product_code": item.product_code,
                "name": item.product_name,
                "unit_price": item.unit_price,
                "quantity": item.quantity,
                "note": item.note,
                "line_total": item.line_total,
            }
            for item in order.items.all()
        ],
    }

@require_http_methods(["GET"])
@branch_api
def branch_order_list(request):
    branch = request.branch_membership.branch
    shippers = (
        BranchMembership.objects.filter(
            branch=branch,
            user__role="delivery",
            user__is_active=True,
        )
        .select_related("user")
        .order_by("user__username")
    )
    active_shipper_loads = dict(
        Order.objects.filter(
            branch=branch,
            status=Order.Status.DELIVERING,
        ).values("shipper_id").annotate(total=Count("id")).values_list("shipper_id", "total")
    )
    orders = (
        Order.objects.filter(
            Q(branch=branch) | Q(branch__isnull=True, status=Order.Status.PENDING)
        )
        .select_related("branch", "shipper")
        .prefetch_related("items")
    )
    return JsonResponse(
        {
            "branch": {"id": branch.pk, "name": branch.name},
            "orders": [order_payload(order) for order in orders],
            "shippers": [
                {
                    "id": membership.user_id,
                    "name": membership.user.get_full_name() or membership.user.username,
                    "phone": membership.user.phone or "",
                    "active_orders": active_shipper_loads.get(membership.user_id, 0),
                }
                for membership in shippers
            ],
        }
    )

@require_http_methods(["POST"])
@branch_api
def claim_branch_order(request, code):
    branch = request.branch_membership.branch
    now = timezone.now()
    
    with transaction.atomic():
        order = Order.objects.select_for_update().filter(code=code).first()
        if not order:
            return JsonResponse({"error": "Đơn hàng không tồn tại."}, status=404)
            
        if order.branch and order.branch != branch:
            return JsonResponse({"error": "Đơn đã được chi nhánh khác nhận."}, status=409)
            
        if order.status != Order.Status.PENDING:
            return JsonResponse({"error": "Đơn không còn chờ tiếp nhận."}, status=409)

        order.branch = branch
        order.accepted_by = request.user
        order.accepted_at = now
        order.status = Order.Status.CONFIRMED
        order.save()

        for item in order.items.all():
            if not item.product:
                continue
                
            recipes = ProductIngredient.objects.filter(product=item.product)
            for recipe in recipes:
                ing = Ingredient.objects.select_for_update().filter(
                    branch=branch, 
                    name__iexact=recipe.ingredient_name
                ).first()
                
                if ing:
                    total_deduct = recipe.quantity_per_portion * item.quantity
                    ing.quantity = max(0, ing.quantity - total_deduct)
                    ing.save()

    order = Order.objects.select_related("branch", "shipper").prefetch_related("items").get(code=code)
    return JsonResponse({"order": order_payload(order)})

@require_http_methods(["POST"])
@branch_api
def assign_branch_shipper(request, code):
    data, error = parse_json(request)
    if error:
        return error
    shipper_id = data.get("shipper_id")
    if isinstance(shipper_id, bool) or not str(shipper_id).isdigit():
        return JsonResponse({"error": "Vui lòng chọn shipper hợp lệ."}, status=400)

    branch = request.branch_membership.branch
    shipper_membership = BranchMembership.objects.filter(
        user_id=int(shipper_id),
        branch=branch,
        user__role="delivery",
        user__is_active=True,
    ).first()
    if shipper_membership is None:
        return JsonResponse({"error": "Shipper không thuộc chi nhánh hoặc đã ngừng hoạt động."}, status=400)

    updated = Order.objects.filter(
        code=code,
        branch=branch,
        status=Order.Status.READY,
        shipper__isnull=True,
    ).update(
        shipper=shipper_membership.user,
        status=Order.Status.DELIVERING,
    )
    if not updated:
        return JsonResponse(
            {"error": "Đơn không còn sẵn sàng giao hoặc đã được phân công shipper."},
            status=409,
        )
    order = Order.objects.select_related("branch", "shipper").prefetch_related("items").get(code=code)
    return JsonResponse({"order": order_payload(order)})

@require_http_methods(["POST"])
@branch_api
def update_branch_order_status(request, code):
    data, error = parse_json(request)
    if error:
        return error
    next_status = text_value(data, "status")
    allowed_transitions = {
        Order.Status.CONFIRMED: Order.Status.PREPARING,
        Order.Status.PREPARING: Order.Status.READY,
        Order.Status.DELIVERING: Order.Status.COMPLETED,
    }
    if next_status not in allowed_transitions.values():
        return JsonResponse({"error": "Trạng thái tiếp theo không hợp lệ."}, status=400)

    branch = request.branch_membership.branch
    current_status = next(
        status for status, target in allowed_transitions.items() if target == next_status
    )
    order_filter = Order.objects.filter(
        code=code,
        branch=branch,
        status=current_status,
    )
    if next_status == Order.Status.COMPLETED:
        order_filter = order_filter.filter(shipper__isnull=False)
    updated = order_filter.update(status=next_status)
    if not updated:
        return JsonResponse(
            {"error": "Đơn không thuộc chi nhánh này hoặc trạng thái đã thay đổi."},
            status=409,
        )
    order = Order.objects.select_related("branch", "shipper").prefetch_related("items").get(code=code)
    return JsonResponse({"order": order_payload(order)})

def calculate_discount(code, subtotal, today):
    if not code:
        return 0, ""
    voucher = VOUCHERS.get(code)
    if voucher is None:
        raise ValueError("Mã giảm giá không hợp lệ.")
    if today > voucher["expires"]:
        raise ValueError("Mã giảm giá đã hết hạn.")
    if subtotal < voucher["minimum"]:
        raise ValueError(f"Đơn hàng chưa đạt mức tối thiểu để dùng mã {code}.")
    if voucher.get("weekend") and today.weekday() < 5:
        raise ValueError("Mã CUOITUAN15 chỉ áp dụng vào thứ Bảy và Chủ nhật.")
    if voucher["kind"] == "shipping":
        return DELIVERY_FEE, code
    if voucher["kind"] == "amount":
        return voucher["value"], code
    discount = (subtotal * voucher["value"] + 50) // 100
    return min(discount, voucher["maximum"]), code

@require_http_methods(["GET"])
@customer_api
def cart_detail(request):
    cart, _ = Cart.objects.get_or_create(customer=request.user)
    return JsonResponse(cart_payload(cart))

@require_http_methods(["POST", "PATCH", "DELETE"])
@customer_api
def cart_item(request, product_code):
    product = Product.objects.filter(code=product_code, is_active=True).first()
    if product is None:
        return JsonResponse({"error": "Món ăn không tồn tại hoặc hiện không được bán."}, status=404)
    cart, _ = Cart.objects.get_or_create(customer=request.user)

    if request.method == "DELETE":
        CartItem.objects.filter(cart=cart, product=product).delete()
        return JsonResponse(cart_payload(cart))

    data, error = parse_json(request)
    if error:
        return error
    raw_quantity = data.get("quantity", 1)
    if isinstance(raw_quantity, bool) or not str(raw_quantity).isdigit():
        return JsonResponse({"error": "Số lượng phải là số nguyên."}, status=400)
    quantity = int(raw_quantity)
    if quantity < 1 or quantity > 20:
        return JsonResponse({"error": "Mỗi món chỉ được đặt từ 1 đến 20 phần."}, status=400)
    note = text_value(data, "note")
    if len(note) > 500:
        return JsonResponse({"error": "Ghi chú món ăn vượt quá 500 ký tự."}, status=400)

    item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        defaults={"quantity": quantity, "note": note},
    )
    if not created:
        item.quantity = min(20, item.quantity + quantity) if request.method == "POST" else quantity
        update_fields = ["quantity"]
        if "note" in data:
            item.note = note
            update_fields.append("note")
        item.save(update_fields=update_fields)
    return JsonResponse(cart_payload(cart))

@require_http_methods(["GET", "POST"])
@customer_api
def order_list_create(request):
    if request.method == "GET":
        orders = request.user.orders.select_related("branch").prefetch_related("items").all()
        return JsonResponse({"orders": [order_payload(order) for order in orders]})

    data, error = parse_json(request)
    if error:
        return error
    recipient_name = text_value(data, "recipient_name")
    recipient_phone = re.sub(r"\s+", "", text_value(data, "recipient_phone"))
    delivery_address = text_value(data, "delivery_address")
    note = text_value(data, "note")
    voucher_code = text_value(data, "voucher_code").upper()
    payment_method = text_value(data, "payment_method")

    raw_lat = data.get("delivery_lat")
    raw_lng = data.get("delivery_lng")
    if raw_lat is None or raw_lng is None:
        return JsonResponse({"error": "Vui lòng chọn vị trí giao hàng trên bản đồ."}, status=400)
    try:
        delivery_lat = float(raw_lat)
        delivery_lng = float(raw_lng)
    except (TypeError, ValueError):
        return JsonResponse({"error": "Tọa độ giao hàng không hợp lệ."}, status=400)
    if not is_valid_vn_coords(delivery_lat, delivery_lng):
        return JsonResponse({"error": "Vị trí giao hàng nằm ngoài phạm vi phục vụ (Việt Nam)."}, status=400)

    if not recipient_name:
        return JsonResponse({"error": "Vui lòng nhập họ tên người nhận."}, status=400)
    if not re.fullmatch(r"0\d{9,10}", recipient_phone):
        return JsonResponse({"error": "Số điện thoại phải gồm 10 hoặc 11 chữ số và bắt đầu bằng 0."}, status=400)
    if not delivery_address:
        return JsonResponse({"error": "Vui lòng nhập địa chỉ giao hàng."}, status=400)
    if len(note) > 500 or len(delivery_address) > 500:
        return JsonResponse({"error": "Ghi chú hoặc địa chỉ vượt quá độ dài cho phép."}, status=400)
    if payment_method not in Order.PaymentMethod.values:
        return JsonResponse({"error": "Phương thức thanh toán không hợp lệ."}, status=400)

    with transaction.atomic():
        cart = Cart.objects.select_for_update().filter(customer=request.user).first()
        if cart is None:
            return JsonResponse({"error": "Giỏ hàng đang trống."}, status=400)
        cart_items = list(cart.items.select_related("product").order_by("product_id"))
        if not cart_items:
            return JsonResponse({"error": "Giỏ hàng đang trống."}, status=400)
        if any(not item.product.is_active for item in cart_items):
            return JsonResponse({"error": "Một món trong giỏ hiện không còn được bán."}, status=400)

        subtotal = sum(item.product.price * item.quantity for item in cart_items)
        try:
            discount, voucher_code = calculate_discount(voucher_code, subtotal, timezone.localdate())
        except ValueError as exc:
            return JsonResponse({"error": str(exc)}, status=400)

        order = Order.objects.create(
            customer=request.user,
            payment_method=payment_method,
            recipient_name=recipient_name,
            recipient_phone=recipient_phone,
            delivery_address=delivery_address,
            delivery_lat=delivery_lat,
            delivery_lng=delivery_lng,
            note=note,
            voucher_code=voucher_code,
            subtotal=subtotal,
            delivery_fee=DELIVERY_FEE,
            discount=discount,
            total=max(0, subtotal + DELIVERY_FEE - discount),
        )
        OrderItem.objects.bulk_create([
            OrderItem(
                order=order, product=item.product,
                product_code=item.product.code, product_name=item.product.name,
                unit_price=item.product.price, quantity=item.quantity, note=item.note,
            ) for item in cart_items
        ])
        cart.items.all().delete()

    best_branch, reason, breakdown = select_best_branch(order)
    if best_branch is not None:
        Order.objects.filter(code=order.code, branch__isnull=True).update(branch=best_branch)
        order.refresh_from_db()

    DispatchLog.objects.create(
        order=order,
        chosen_branch=order.branch,
        score=breakdown.get("score"),
        distance_km=breakdown.get("distance_km"),
        reason=reason,
        breakdown=breakdown,
    )

    return JsonResponse({"order": order_payload(order)}, status=201)

@require_http_methods(["GET"])
@customer_api
def order_detail(request, code):
    order = get_object_or_404(
        Order.objects.select_related("branch").prefetch_related("items"),
        code=code,
        customer=request.user,
    )
    return JsonResponse({"order": order_payload(order)})


# ================= QUẢN LÝ NGUYÊN VẬT LIỆU =================
@require_http_methods(["GET", "POST"])
@branch_api
def branch_ingredient_list(request):
    branch = request.branch_membership.branch
    
    if request.method == "GET":
        items = Ingredient.objects.filter(branch=branch).order_by('name')
        return JsonResponse({
            "ingredients": [
                {
                    "id": i.id, 
                    "name": i.name, 
                    "unit": i.unit, 
                    "quantity": float(i.quantity), 
                    "min_quantity": float(i.min_quantity)
                } for i in items
            ]
        })
        
    data, error = parse_json(request)
    if error: return error
    
    name = text_value(data, "name")
    unit = text_value(data, "unit")
    try:
        min_q = float(data.get("min_quantity", 0))
    except ValueError:
        min_q = 0
    
    if not name or not unit:
        return JsonResponse({"error": "Vui lòng nhập tên và đơn vị tính."}, status=400)
        
    item, created = Ingredient.objects.get_or_create(
        branch=branch, 
        name=name,
        defaults={"unit": unit, "min_quantity": min_q}
    )
    
    if not created:
        return JsonResponse({"error": "Nguyên liệu này đã tồn tại trong chi nhánh."}, status=400)
        
    return JsonResponse({
        "id": item.id, "name": item.name, "unit": item.unit, 
        "quantity": float(item.quantity), "min_quantity": float(item.min_quantity)
    }, status=201)

@require_http_methods(["PATCH", "DELETE"])
@branch_api
def branch_ingredient_detail(request, pk):
    branch = request.branch_membership.branch
    item = get_object_or_404(Ingredient, pk=pk, branch=branch)
    
    if request.method == "DELETE":
        item.delete()
        return JsonResponse({"ok": True})
        
    data, error = parse_json(request)
    if error: return error
    
    if "quantity" in data:
        try: item.quantity = float(data["quantity"])
        except ValueError: pass
    if "min_quantity" in data:
        try: item.min_quantity = float(data["min_quantity"])
        except ValueError: pass
    if "name" in data:
        item.name = text_value(data, "name")
    if "unit" in data:
        item.unit = text_value(data, "unit")
        
    item.save()
    return JsonResponse({
        "id": item.id, "name": item.name, "unit": item.unit, 
        "quantity": float(item.quantity), "min_quantity": float(item.min_quantity)
    })

# ================= LỊCH SỬ ĐƠN HÀNG CHI NHÁNH =================
@require_http_methods(["GET"])
@branch_api
def branch_order_history(request):
    branch = request.branch_membership.branch
    orders = Order.objects.filter(branch=branch).order_by('-created_at').prefetch_related('items')[:50]
    
    data = []
    for order in orders:
        order_items = []
        total_ingredients = {}
        
        for item in order.items.all():
            item_ingredients = []
            recipes = ProductIngredient.objects.filter(product=item.product)
            
            for recipe in recipes:
                deducted = float(recipe.quantity_per_portion * item.quantity)
                item_ingredients.append({
                    "name": recipe.ingredient_name,
                    "quantity": deducted,
                    "unit": recipe.unit
                })
                
                key = f"{recipe.ingredient_name}_{recipe.unit}"
                if key not in total_ingredients:
                    total_ingredients[key] = {"name": recipe.ingredient_name, "unit": recipe.unit, "total": 0}
                total_ingredients[key]["total"] += deducted
                
            order_items.append({
                "name": item.product_name,
                "quantity": item.quantity,
                "ingredients": item_ingredients
            })
            
        data.append({
            "code": order.code,
            "created_at": order.created_at.isoformat(),
            "status": order.get_status_display(),
            "items": order_items,
            "total_ingredients": list(total_ingredients.values())
        })
        
    return JsonResponse({"history": data})

# ================= QUẢN LÝ BÀN (NHÂN VIÊN) =================
@require_http_methods(["GET", "POST"])
@branch_api
def branch_table_list(request):
    branch = request.branch_membership.branch
    
    if request.method == "GET":
        tables = Table.objects.filter(branch=branch).order_by('name')
        return JsonResponse({
            "tables": [
                {
                    "id": t.id, "name": t.name, "qr_code": str(t.qr_code), 
                    "status": t.status, "status_label": t.get_status_display()
                } for t in tables
            ]
        })
        
    data, error = parse_json(request)
    if error: return error
    
    name = text_value(data, "name")
    if not name:
        return JsonResponse({"error": "Vui lòng nhập tên bàn."}, status=400)
        
    if Table.objects.filter(branch=branch, name=name).exists():
        return JsonResponse({"error": "Tên bàn này đã tồn tại trong chi nhánh."}, status=400)
        
    table = Table.objects.create(branch=branch, name=name)
    return JsonResponse({
        "id": table.id, "name": table.name, "qr_code": str(table.qr_code), 
        "status": table.status, "status_label": table.get_status_display()
    }, status=201)

@require_http_methods(["PATCH", "DELETE"])
@branch_api
def branch_table_detail(request, pk):
    branch = request.branch_membership.branch
    table = get_object_or_404(Table, pk=pk, branch=branch)
    
    if request.method == "DELETE":
        table.delete()
        return JsonResponse({"ok": True})
        
    data, error = parse_json(request)
    if error: return error
    
    if "name" in data: table.name = text_value(data, "name")
    if "status" in data: table.status = data["status"]
    table.save()
    return JsonResponse({"ok": True})

# ================= QUẢN LÝ ĐƠN GỌI MÓN TẠI BÀN (NHÂN VIÊN) =================
def dine_in_order_payload(order):
    return {
        "id": order.id,
        "table_name": order.table.name,
        "status": order.status,
        "status_label": order.get_status_display(),
        "created_at": order.created_at.isoformat(),
        "total": order.total,
        "note": order.note,
        "items": [
            {
                "name": item.product_name, "quantity": item.quantity, 
                "unit_price": item.unit_price, "line_total": item.line_total, "note": item.note
            } for item in order.items.all()
        ]
    }

@require_http_methods(["GET"])
@branch_api
def branch_dine_in_orders(request):
    branch = request.branch_membership.branch
    orders = DineInOrder.objects.filter(branch=branch).select_related('table').prefetch_related('items')[:50]
    return JsonResponse({"orders": [dine_in_order_payload(o) for o in orders]})

@require_http_methods(["POST"])
@branch_api
def update_dine_in_order_status(request, pk):
    branch = request.branch_membership.branch
    order = get_object_or_404(DineInOrder, pk=pk, branch=branch)
    
    data, error = parse_json(request)
    if error: return error
    new_status = data.get("status")
    
    if new_status not in DineInOrder.Status.values:
        return JsonResponse({"error": "Trạng thái không hợp lệ."}, status=400)
        
    with transaction.atomic():
        old_status = order.status
        order.status = new_status
        
        # Nếu chuyển từ PENDING sang PREPARING (Nhận đơn) -> Trừ kho
        if old_status == DineInOrder.Status.PENDING and new_status == DineInOrder.Status.PREPARING:
            for item in order.items.all():
                if not item.product: continue
                recipes = ProductIngredient.objects.filter(product=item.product)
                for recipe in recipes:
                    ing = Ingredient.objects.select_for_update().filter(
                        branch=branch, name__iexact=recipe.ingredient_name
                    ).first()
                    if ing:
                        total_deduct = recipe.quantity_per_portion * item.quantity
                        ing.quantity = max(0, ing.quantity - total_deduct)
                        ing.save()

        # Nếu chuyển sang Đã phục vụ hoặc Hủy thì giải phóng bàn
        if new_status in [DineInOrder.Status.SERVED, DineInOrder.Status.CANCELLED]:
            order.table.status = Table.Status.EMPTY
            order.table.save()
            
        order.save()
    return JsonResponse({"ok": True})

# ================= DÀNH CHO KHÁCH HÀNG QUÉT MÃ QR =================
@require_http_methods(["GET"])
def public_table_info(request, qr_code):
    table = get_object_or_404(Table, qr_code=qr_code)
    return JsonResponse({
        "table_id": table.id,
        "table_name": table.name,
        "branch_name": table.branch.name,
        "status": table.status
    })

@csrf_exempt
@require_http_methods(["POST"])
def public_create_dine_in_order(request):
    data, error = parse_json(request)
    if error: return error
    
    qr_code = data.get("qr_code")
    note = data.get("note", "")
    items_data = data.get("items", [])
    
    if not qr_code or not items_data:
        return JsonResponse({"error": "Thiếu thông tin bàn hoặc món ăn."}, status=400)
        
    table = get_object_or_404(Table, qr_code=qr_code)
    
    if table.status != Table.Status.OCCUPIED:
        table.status = Table.Status.OCCUPIED
        table.save()
        
    with transaction.atomic():
        order = DineInOrder.objects.create(
            branch=table.branch, table=table, note=note, total=0
        )
        
        total = 0
        for item in items_data:
            product = get_object_or_404(Product, code=item.get("product_code"))
            qty = int(item.get("quantity", 1))
            DineInOrderItem.objects.create(
                order=order, product=product, product_name=product.name,
                unit_price=product.price, quantity=qty, note=item.get("note", "")
            )
            total += product.price * qty
            
        order.total = total
        order.save()
        
    return JsonResponse({"ok": True, "order_id": order.id})

# ================= QUẢN LÝ THỰC ĐƠN (CHỈNH SỬA MÓN) =================
@login_required
@require_http_methods(["GET", "POST"])
def branch_product_update(request, code):
    # Chỉ super_admin mới có quyền
    if request.user.role != 'super_admin':
        return JsonResponse({"error": "Chỉ quản trị viên tổng mới có quyền sửa món ăn."}, status=403)
        
    product = get_object_or_404(Product, code=code)
    
    if request.method == "GET":
        recipes = ProductIngredient.objects.filter(product=product)
        return JsonResponse({
            "code": product.code,
            "name": product.name,
            "image_url": product.image.url if product.image else None,
            "recipes": [
                {"name": r.ingredient_name, "qty": float(r.quantity_per_portion), "unit": r.unit} 
                for r in recipes
            ]
        })
        
    try:
        name = request.POST.get("name", "").strip()
        if name:
            product.name = name
            
        if 'image' in request.FILES:
            product.image = request.FILES['image']
            
        product.save()
        return JsonResponse({"ok": True, "name": product.name, "image_url": product.image.url if product.image else None})
    except Exception as e:
        return JsonResponse({"error": f"Lỗi lưu ảnh: {str(e)}"}, status=500)


@login_required
@require_http_methods(["POST"])
def branch_product_recipe_update(request, code):
    # Chỉ super_admin mới có quyền
    if request.user.role != 'super_admin':
        return JsonResponse({"error": "Chỉ quản trị viên tổng mới có quyền sửa công thức."}, status=403)
        
    product = get_object_or_404(Product, code=code)
    data, error = parse_json(request)
    if error: return error
    
    recipes_data = data.get("recipes", [])
    
    try:
        with transaction.atomic():
            ProductIngredient.objects.filter(product=product).delete()
            for r in recipes_data:
                name = r.get("name", "").strip()
                qty = float(r.get("qty", 0))
                unit = r.get("unit", "").strip()
                if name and qty > 0 and unit:
                    ProductIngredient.objects.create(
                        product=product, ingredient_name=name, quantity_per_portion=qty, unit=unit
                    )
        return JsonResponse({"ok": True})
    except Exception as e:
        return JsonResponse({"error": f"Lỗi lưu công thức: {str(e)}"}, status=500)

# ================= GOGODUK & NOMINATIM PROXY API =================
GOGODUK_BASE = "https://api.gogoduk.com"

@require_http_methods(["GET"])
def gogoduk_proxy_suggest(request):
    input_text = request.GET.get("input", "").strip()
    if len(input_text) < 2:
        return JsonResponse({"predictions": []})
    
    params = {"input": input_text, "lang": "vi", "country": "VN"}
    try:
        r = requests.get(
            f"{GOGODUK_BASE}/v1/suggest",
            params=params,
            headers={"X-API-Key": settings.GOGODUK_API_KEY},
            timeout=5,
        )
        return JsonResponse(r.json(), status=r.status_code)
    except requests.RequestException as e:
        return JsonResponse({"error": str(e)}, status=502)

@require_http_methods(["GET"])
def gogoduk_proxy_resolve(request):
    place_id = request.GET.get("id", "").strip()
    if not place_id:
        return JsonResponse({"error": "Thiếu placeId"}, status=400)
    
    try:
        r = requests.get(
            f"{GOGODUK_BASE}/v1/place/resolve",
            params={"id": place_id, "lang": "vi"},
            headers={"X-API-Key": settings.GOGODUK_API_KEY},
            timeout=5,
        )
        return JsonResponse(r.json(), status=r.status_code)
    except requests.RequestException as e:
        return JsonResponse({"error": str(e)}, status=502)

@require_http_methods(["GET"])
def nominatim_proxy_reverse(request):
    lat = request.GET.get("lat")
    lon = request.GET.get("lon")
    if not lat or not lon:
        return JsonResponse({"error": "Thiếu tọa độ"}, status=400)
    
    try:
        r = requests.get(
            "https://nominatim.openstreetmap.org/reverse",
            params={"lat": lat, "lon": lon, "format": "json", "accept-language": "vi", "addressdetails": 1},
            headers={'User-Agent': 'MieuQuanApp/1.0 (admin@mieuquan.vn)'},
            timeout=5,
        )
        return JsonResponse(r.json(), status=r.status_code)
    except requests.RequestException as e:
        return JsonResponse({"error": str(e)}, status=502)