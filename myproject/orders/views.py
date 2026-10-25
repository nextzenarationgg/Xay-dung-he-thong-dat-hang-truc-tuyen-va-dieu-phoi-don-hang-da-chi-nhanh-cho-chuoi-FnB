import json
import re
from datetime import date
from functools import wraps

from django.db import transaction
from django.db.models import Count, Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.http import require_http_methods

from accounts.models import BranchMembership
from .models import Cart, CartItem, Order, OrderItem, Product

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
    claimed = Order.objects.filter(
        code=code,
        branch__isnull=True,
        status=Order.Status.PENDING,
    ).update(
        branch=branch,
        accepted_by=request.user,
        accepted_at=now,
        status=Order.Status.CONFIRMED,
    )
    if not claimed:
        return JsonResponse(
            {"error": "Đơn đã được chi nhánh khác nhận hoặc không còn chờ tiếp nhận."},
            status=409,
        )
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
            discount, voucher_code = calculate_discount(
                voucher_code,
                subtotal,
                timezone.localdate(),
            )
        except ValueError as exc:
            return JsonResponse({"error": str(exc)}, status=400)

        order = Order.objects.create(
            customer=request.user,
            payment_method=payment_method,
            recipient_name=recipient_name,
            recipient_phone=recipient_phone,
            delivery_address=delivery_address,
            note=note,
            voucher_code=voucher_code,
            subtotal=subtotal,
            delivery_fee=DELIVERY_FEE,
            discount=discount,
            total=max(0, subtotal + DELIVERY_FEE - discount),
        )
        OrderItem.objects.bulk_create(
            [
                OrderItem(
                    order=order,
                    product=item.product,
                    product_code=item.product.code,
                    product_name=item.product.name,
                    unit_price=item.product.price,
                    quantity=item.quantity,
                    note=item.note,
                )
                for item in cart_items
            ]
        )
        cart.items.all().delete()

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
