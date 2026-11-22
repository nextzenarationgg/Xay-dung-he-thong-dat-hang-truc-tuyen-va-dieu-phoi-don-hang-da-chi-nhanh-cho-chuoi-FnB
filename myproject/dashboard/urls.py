
from django.urls import path
from . import views

urlpatterns = [
    path(
        'login/',
        views.login_view,
        name='login'
    ),

    path(
        'logout/',
        views.logout_view,
        name='logout'
    ),

    path(
        'branch-admin/',
        views.branch_admin_dashboard,
        name='branch_admin_dashboard'
    ),

    path(
        'system-admin/',
        views.system_admin_dashboard,
        name='system_admin_dashboard'
    ),

    path(
        'branch-admin/employees/',
        views.employee_list,
        name='employee_list'
    ),

    # Các page prototype
    path(
        'prototype/<str:page_key>/',
        views.prototype_page,
        name='prototype_page'
    ),
    path('api/admin/branches/', views.api_admin_branches, name='api_admin_branches'),
    path('api/admin/users/', views.api_admin_users, name='api_admin_users'),
    path('api/admin/orders/', views.api_admin_orders, name='api_admin_orders'),
    path('api/admin/reassign/', views.api_admin_reassign_order, name='api_admin_reassign_order'),
]
