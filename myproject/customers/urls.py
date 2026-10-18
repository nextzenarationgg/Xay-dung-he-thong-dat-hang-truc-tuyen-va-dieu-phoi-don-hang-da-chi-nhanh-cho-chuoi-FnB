from django.urls import path
from . import views_prototype

urlpatterns = [
    path("", views_prototype.home, name="customer_home"),
]