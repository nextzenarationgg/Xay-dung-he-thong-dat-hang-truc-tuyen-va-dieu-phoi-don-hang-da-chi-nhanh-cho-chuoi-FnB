from django.contrib import admin

from .models import Cart, CartItem, Order, OrderItem, PaymentTransaction, Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "category", "price", "is_active")
    list_filter = ("category", "is_active")
    search_fields = ("code", "name")


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product_code", "product_name", "unit_price", "quantity")


class PaymentTransactionInline(admin.TabularInline):
    model = PaymentTransaction
    extra = 0
    readonly_fields = (
        "invoice_number",
        "amount",
        "status",
        "provider_order_id",
        "provider_transaction_id",
        "created_at",
        "paid_at",
    )
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "code",
        "customer",
        "status",
        "payment_method",
        "payment_status",
        "total",
        "created_at",
    )
    list_filter = ("status", "payment_method", "payment_status", "created_at")
    search_fields = ("code", "recipient_name", "recipient_phone", "customer__username")
    readonly_fields = ("code", "subtotal", "delivery_fee", "discount", "total", "created_at")
    inlines = (OrderItemInline, PaymentTransactionInline)


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("customer", "updated_at")
    search_fields = ("customer__username",)
    inlines = (CartItemInline,)
