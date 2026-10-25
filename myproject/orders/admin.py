from django.contrib import admin

from .models import Cart, CartItem, Order, OrderItem, Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "category", "price", "is_active")
    list_filter = ("category", "is_active")
    search_fields = ("code", "name")


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product_code", "product_name", "unit_price", "quantity")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "code",
        "customer",
        "status",
        "payment_method",
        "total",
        "created_at",
    )
    list_filter = ("status", "payment_method", "created_at")
    search_fields = ("code", "recipient_name", "recipient_phone", "customer__username")
    readonly_fields = ("code", "subtotal", "delivery_fee", "discount", "total", "created_at")
    inlines = (OrderItemInline,)


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("customer", "updated_at")
    search_fields = ("customer__username",)
    inlines = (CartItemInline,)
