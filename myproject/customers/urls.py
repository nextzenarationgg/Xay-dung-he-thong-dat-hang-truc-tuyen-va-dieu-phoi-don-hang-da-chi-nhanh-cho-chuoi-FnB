from django.urls import path
from . import views_prototype
from orders import views as order_views
from orders.views import (
    gogoduk_proxy_suggest, gogoduk_proxy_resolve, nominatim_proxy_reverse,
    branch_ingredient_list, branch_ingredient_detail, branch_order_history,
    branch_table_list, branch_table_detail, branch_dine_in_orders, 
    update_dine_in_order_status, public_table_info, public_create_dine_in_order,
    branch_product_update, branch_product_recipe_update  # Thêm 2 hàm mới cho việc sửa món
)

urlpatterns = [
    path("", views_prototype.home, name="customer_home"),
    path("customer/signin/", views_prototype.signin_signup, name="customer_signin_signup"),
    path("customer/logout/", views_prototype.logout_customer, name="customer_logout"),
    
    path("api/products/", order_views.product_list, name="product_list"),
    path("api/cart/", order_views.cart_detail, name="cart_detail"),
    path("api/cart/items/<str:product_code>/", order_views.cart_item, name="cart_item"),
    path("api/orders/", order_views.order_list_create, name="order_list_create"),
    path("api/orders/<str:code>/", order_views.order_detail, name="order_detail"),
    path("api/branch/orders/", order_views.branch_order_list, name="branch_order_list"),
    
    path('qr-menu/<uuid:qr_code>/', views_prototype.qr_menu, name='qr_menu'),
    
    # API Địa chỉ
    path('api/gogoduk/suggest/', gogoduk_proxy_suggest, name='gogoduk_suggest'),
    path('api/gogoduk/resolve/', gogoduk_proxy_resolve, name='gogoduk_resolve'),
    path('api/nominatim/reverse/', nominatim_proxy_reverse, name='nominatim_reverse'),
    
    # API Nguyên vật liệu & Lịch sử
    path('api/branch/ingredients/', branch_ingredient_list, name='branch_ingredient_list'),
    path('api/branch/ingredients/<int:pk>/', branch_ingredient_detail, name='branch_ingredient_detail'),
    path('api/branch/order-history/', branch_order_history, name='branch_order_history'),
    
    # API Bàn & Đơn gọi món tại bàn (Dành cho Nhân viên)
    path('api/branch/tables/', branch_table_list, name='branch_table_list'),
    path('api/branch/tables/<int:pk>/', branch_table_detail, name='branch_table_detail'),
    path('api/branch/dine-in-orders/', branch_dine_in_orders, name='branch_dine_in_orders'),
    path('api/branch/dine-in-orders/<int:pk>/status/', update_dine_in_order_status, name='update_dine_in_order_status'),
    
    # API Public (Dành cho Khách quét QR)
    path('api/public/table/<uuid:qr_code>/', public_table_info, name='public_table_info'),
    path('api/public/dine-in-orders/', public_create_dine_in_order, name='public_create_dine_in_order'),

    # API Sửa thông tin món ăn & Định lượng nguyên liệu
    path('api/branch/products/<str:code>/update/', branch_product_update, name='branch_product_update'),
    path('api/branch/products/<str:code>/recipe/', branch_product_recipe_update, name='branch_product_recipe_update'),

    # API Cập nhật trạng thái đơn ship / Gán shipper
    path("api/branch/orders/<str:code>/claim/", order_views.claim_branch_order, name="claim_branch_order"),
    path("api/branch/orders/<str:code>/assign-shipper/", order_views.assign_branch_shipper, name="assign_branch_shipper"),
    path("api/branch/orders/<str:code>/status/", order_views.update_branch_order_status, name="update_branch_order_status"),
]