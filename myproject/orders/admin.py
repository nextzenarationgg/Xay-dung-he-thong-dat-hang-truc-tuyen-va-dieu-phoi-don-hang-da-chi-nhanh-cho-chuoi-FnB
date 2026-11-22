from django.contrib import admin
from .models import Cart, CartItem, Order, OrderItem, PaymentTransaction, Product, ProductIngredient

# [THÊM MỚI] Tạo bảng Inline để hiển thị công thức ngay trong trang Món ăn
class ProductIngredientInline(admin.TabularInline):
    model = ProductIngredient
    extra = 1 # Số dòng trống mặc định để thêm mới
    fields = ('ingredient_name', 'quantity_per_portion', 'unit') # Các cột hiển thị

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "category", "price", "is_active", "image_url")
    list_filter = ("category", "is_active")
    search_fields = ("code", "name")
    inlines = [ProductIngredientInline] # [THÊM MỚI] Gắn bảng công thức vào đây


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