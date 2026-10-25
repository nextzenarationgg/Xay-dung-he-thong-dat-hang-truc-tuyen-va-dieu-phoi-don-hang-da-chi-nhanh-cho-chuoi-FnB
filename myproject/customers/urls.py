from django.urls import path
from orders import views as order_views

from . import views_prototype

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
    path(
        "api/branch/orders/<str:code>/claim/",
        order_views.claim_branch_order,
        name="claim_branch_order",
    ),
    path(
        "api/branch/orders/<str:code>/assign-shipper/",
        order_views.assign_branch_shipper,
        name="assign_branch_shipper",
    ),
    path(
        "api/branch/orders/<str:code>/status/",
        order_views.update_branch_order_status,
        name="update_branch_order_status",
    ),
]