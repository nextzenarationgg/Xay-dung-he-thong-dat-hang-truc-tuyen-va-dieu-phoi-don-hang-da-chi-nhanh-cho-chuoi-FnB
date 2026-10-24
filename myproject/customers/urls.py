from django.urls import path
from . import views_prototype

urlpatterns = [
    path("", views_prototype.home, name="customer_home"),
    path("customer/signin/", views_prototype.signin_signup, name="customer_signin_signup"),
    path("customer/logout/", views_prototype.logout_customer, name="customer_logout"),
]