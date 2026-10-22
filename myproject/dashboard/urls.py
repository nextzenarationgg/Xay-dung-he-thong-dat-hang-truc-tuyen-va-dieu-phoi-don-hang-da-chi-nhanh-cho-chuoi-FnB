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
]