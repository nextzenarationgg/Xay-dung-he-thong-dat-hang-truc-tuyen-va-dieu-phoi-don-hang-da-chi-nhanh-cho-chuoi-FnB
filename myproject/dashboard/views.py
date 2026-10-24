
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.shortcuts import render, redirect
from django.core.exceptions import PermissionDenied
from django.http import Http404
from django.contrib.auth import authenticate, login, logout

from accounts.models import BranchMembership

User = get_user_model()


@login_required
def branch_admin_dashboard(request):
    if request.user.role not in ['branch_admin', 'branch_staff']:
        raise PermissionDenied

    try:
        membership = BranchMembership.objects.select_related(
            'branch'
        ).get(user=request.user)
    except BranchMembership.DoesNotExist:
        raise PermissionDenied

    branch_name = membership.branch.name
    if branch_name.startswith('Miêu Quán '):
        branch_name = branch_name[len('Miêu Quán '):]

    return render(
        request,
        'branch_staff/branch.html',
        {'branch_name': branch_name},
    )


@login_required
def system_admin_dashboard(request):
    if request.user.role != 'super_admin':
        raise PermissionDenied

    return render(request, 'super_admin/admin.html')


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
            if user.role in ['branch_admin', 'branch_staff', 'super_admin']:
                login(request, user)

                if user.role in ['branch_admin', 'branch_staff']:
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


# Các page prototype và nhóm CSS/JS tương ứng
PAGE_CONFIG = {
    # Khách hàng
    'home': ('prototype/pages/home.html', 'customer'),
    'menu': ('prototype/pages/menu.html', 'customer'),
    'dish': ('prototype/pages/dish.html', 'customer'),
    'cart': ('prototype/pages/cart.html', 'customer'),
    'checkout': ('prototype/pages/checkout.html', 'customer'),
    'dispatch': ('prototype/pages/dispatch.html', 'customer'),
    'tracking': ('prototype/pages/tracking.html', 'customer'),
    'orders': ('prototype/pages/orders.html', 'customer'),
    'offers': ('prototype/pages/offers.html', 'customer'),
    'account': ('prototype/pages/account.html', 'customer'),

    # Quản lý chi nhánh
    'b-dash': ('prototype/pages/b_dash.html', 'branch_admin'),
    'b-orders': ('prototype/pages/b_orders.html', 'branch_admin'),
    'b-menu': ('prototype/pages/b_menu.html', 'branch_admin'),
    'b-inv': ('prototype/pages/b_inv.html', 'branch_admin'),
    'b-ship': ('prototype/pages/b_ship.html', 'branch_staff'),

    # Quản trị hệ thống
    'a-ctrl': ('prototype/pages/a_ctrl.html', 'super_admin'),
    'a-disp': ('prototype/pages/a_disp.html', 'super_admin'),
    'a-br': ('prototype/pages/a_br.html', 'super_admin'),
    'a-prod': ('prototype/pages/a_prod.html', 'super_admin'),
    'a-ord': ('prototype/pages/a_ord.html', 'super_admin'),
    'a-usr': ('prototype/pages/a_usr.html', 'super_admin'),
    'a-rep': ('prototype/pages/a_rep.html', 'super_admin'),
    'a-cfg': ('prototype/pages/a_cfg.html', 'super_admin'),
}


@login_required
def prototype_page(request, page_key):
    config = PAGE_CONFIG.get(page_key)

    if config is None:
        raise Http404('Không tìm thấy trang')

    template_name, page_group = config

    # Phân quyền theo nhóm page
    allowed_roles = {
        'customer': [],
        'branch_admin': ['branch_admin'],
        'branch_staff': ['branch_staff', 'branch_admin'],
        'super_admin': ['super_admin'],
    }

    if page_group != 'customer':
        if request.user.role not in allowed_roles[page_group]:
            raise PermissionDenied

    return render(
        request,
        template_name,
        {
            'page_key': page_key,
            'page_group': page_group,
        }
    )
