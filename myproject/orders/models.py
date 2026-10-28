import secrets
import uuid

from django.conf import settings
from django.db import models
from django.db.models import Q
from django.utils import timezone

from branches.models import Branch

def generate_order_code():
    return f"MQ-{timezone.localdate():%Y%m%d}-{secrets.token_hex(3).upper()}"

class Product(models.Model):
    code = models.CharField(max_length=20, primary_key=True)
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=30)
    price = models.PositiveIntegerField()
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='products/', null=True, blank=True) # Đã thêm trường ảnh
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("name",)

    def __str__(self):
        return self.name

class Cart(models.Model):
    customer = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="shopping_cart",
    )
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart for {self.customer}"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name="cart_items")
    quantity = models.PositiveSmallIntegerField()
    note = models.CharField(max_length=500, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=("cart", "product"), name="unique_cart_product"),
            models.CheckConstraint(
                condition=Q(quantity__gte=1) & Q(quantity__lte=20),
                name="cart_quantity_between_1_and_20",
            ),
        ]

    def __str__(self):
        return f"{self.product} × {self.quantity}"

class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Chờ tiếp nhận"
        CONFIRMED = "confirmed", "Đã xác nhận"
        PREPARING = "preparing", "Đang chuẩn bị"
        READY = "ready", "Sẵn sàng giao"
        DELIVERING = "delivering", "Đang giao"
        COMPLETED = "completed", "Hoàn thành"
        CANCELLED = "cancelled", "Đã hủy"

    class PaymentMethod(models.TextChoices):
        CASH = "cod", "Tiền mặt khi nhận hàng"
        BANK_TRANSFER = "qr", "Chuyển khoản (mô phỏng)"
        MOMO = "momo", "Ví MoMo (mô phỏng)"
        CARD = "card", "Thẻ ngân hàng (mô phỏng)"

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="orders",
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.PROTECT,
        related_name="orders",
        null=True,
        blank=True,
    )
    accepted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="accepted_orders",
        null=True,
        blank=True,
    )
    shipper = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="delivery_orders",
        null=True,
        blank=True,
    )
    accepted_at = models.DateTimeField(null=True, blank=True)
    code = models.CharField(max_length=24, unique=True, default=generate_order_code)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    payment_method = models.CharField(max_length=10, choices=PaymentMethod.choices)
    payment_status = models.CharField(max_length=20, default="pending")
    recipient_name = models.CharField(max_length=150)
    recipient_phone = models.CharField(max_length=20)
    delivery_address = models.CharField(max_length=500)
    delivery_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    delivery_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    note = models.CharField(max_length=500, blank=True)
    voucher_code = models.CharField(max_length=30, blank=True)
    subtotal = models.PositiveBigIntegerField()
    delivery_fee = models.PositiveBigIntegerField()
    discount = models.PositiveBigIntegerField(default=0)
    total = models.PositiveBigIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return self.code

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        related_name="order_items",
        null=True,
        blank=True,
    )
    product_code = models.CharField(max_length=20)
    product_name = models.CharField(max_length=200)
    unit_price = models.PositiveIntegerField()
    quantity = models.PositiveSmallIntegerField()
    note = models.CharField(max_length=500, blank=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=Q(quantity__gte=1) & Q(quantity__lte=20),
                name="order_quantity_between_1_and_20",
            ),
        ]

    @property
    def line_total(self):
        return self.unit_price * self.quantity

    def __str__(self):
        return f"{self.product_name} × {self.quantity}"

class DispatchLog(models.Model):
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name="dispatch_logs",
    )
    chosen_branch = models.ForeignKey(
        Branch, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="dispatch_logs",
    )
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    distance_km = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    reason = models.CharField(max_length=50)
    breakdown = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"Dispatch {self.order.code} ({self.reason})"

# ================= ĐỊNH LƯỢNG MÓN ĂN (RECIPE) =================
class ProductIngredient(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='recipe_items')
    ingredient_name = models.CharField(max_length=150)
    quantity_per_portion = models.DecimalField(max_digits=10, decimal_places=3, default=0) 
    unit = models.CharField(max_length=20)

    class Meta:
        unique_together = ('product', 'ingredient_name')

    def __str__(self):
        return f"{self.product.name} - {self.ingredient_name}"

# ================= PHỤC VỤ TẠI QUÁN (DINE-IN) =================
class Table(models.Model):
    class Status(models.TextChoices):
        EMPTY = "empty", "Trống"
        OCCUPIED = "occupied", "Có khách"

    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='tables')
    name = models.CharField(max_length=50) 
    qr_code = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.EMPTY)
    
    class Meta:
        unique_together = ('branch', 'name')
        
    def __str__(self):
        return f"{self.branch.name} - {self.name}"

class DineInOrder(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Mới nhận"
        PREPARING = "preparing", "Đang chuẩn bị"
        SERVED = "served", "Đã phục vụ"
        CANCELLED = "cancelled", "Đã hủy"

    branch = models.ForeignKey(Branch, on_delete=models.PROTECT, related_name='dine_in_orders')
    table = models.ForeignKey(Table, on_delete=models.PROTECT, related_name='orders')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    total = models.PositiveBigIntegerField(default=0)
    note = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"Đơn {self.id} - {self.table.name}"

class DineInOrderItem(models.Model):
    order = models.ForeignKey(DineInOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, related_name='dine_in_items')
    product_name = models.CharField(max_length=200)
    unit_price = models.PositiveIntegerField()
    quantity = models.PositiveSmallIntegerField()
    note = models.CharField(max_length=500, blank=True)

    @property
    def line_total(self):
        return self.unit_price * self.quantity