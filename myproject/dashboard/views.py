from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.shortcuts import render, redirect, get_object_or_404
from django.core.exceptions import PermissionDenied
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout

from accounts.models import BranchMembership

# Create your views here.
User = get_user_model()

@login_required
def branch_admin_dashboard(request):
    if request.user.role != 'branch_admin':
        raise PermissionDenied

    return render(request, 'dashboard/branch_admin.html')


@login_required
def system_admin_dashboard(request):
    if request.user.role != 'super_admin':
        raise PermissionDenied

    return render(request, 'dashboard/system_admin.html')

def login_view(request):
    error = ''

    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(
            request,
            username=username,
            password=password
        )

        if user is not None and user.is_active:
            if user.role in ['branch_admin', 'super_admin']:
                login(request, user)

                if user.role == 'branch_admin':
                    return redirect('branch_admin_dashboard')

                return redirect('system_admin_dashboard')

            error = 'Tài khoản không có quyền quản trị.'
        else:
            error = 'Tên đăng nhập hoặc mật khẩu không đúng.'

    return render(
        request,
        'dashboard/login.html',
        {'error': error}
    )

@login_required
def employee_list(request):
    if request.user.role != 'branch_admin':
        raise PermissionDenied

    try:
        membership = BranchMembership.objects.select_related(
            'branch'
        ).get(user=request.user)
    except BranchMembership.DoesNotExist:
        raise PermissionDenied

    # Chỉ lấy nhân viên thuộc chi nhánh này
    employees = User.objects.filter(
        branch_membership__branch=membership.branch,
        role='branch_staff'
    ).order_by('username')

    return render(
        request,
        'dashboard/employee_list.html',
        {
            'employees': employees,
            'branch': membership.branch,
        }
    )


def logout_view(request):
    logout(request)
    return redirect('login')