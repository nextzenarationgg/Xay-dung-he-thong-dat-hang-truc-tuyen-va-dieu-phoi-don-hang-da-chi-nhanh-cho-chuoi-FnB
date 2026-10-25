import secrets

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
