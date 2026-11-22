from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.shortcuts import render, redirect
from django.core.exceptions import PermissionDenied
from django.http import Http404, JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.http import require_http_methods
from django.utils import timezone
import json

from accounts.models import BranchMembership, User
from branches.models import Branch
from orders.models import Order, DispatchLog

User = get_user_model()


@login_required
def branch_admin_dashboard(request):
    if request.user.role not in ['branch_admin', 'branch_staff']:
        raise PermissionDenied
    try:
        membership = BranchMembership.objects.select_related('branch').get(user=request.user)
    except BranchMembership.DoesNotExist:
        raise PermissionDenied

    branch_name = membership.branch.name
    if branch_name.startswith('Miêu Quán '):
        branch_name = branch_name[len('Miêu Quán '):]
    return render(request, 'branch_staff/branch.html', {'branch_name': branch_name})


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
        user = authenticate(request, username=username, password=password)
        if user is not None and user.is_active:
            if user.role in ['branch_admin', 'branch_staff', 'super_admin']:
                login(request, user)
                if user.role in ['branch_admin', 'branch_staff']:
                    return redirect('branch_admin_dashboard')
                return redirect('system_admin_dashboard')
            error = 'Tài khoản không có quyền quản trị.'
        else:
            error = 'Tên đăng nhập hoặc mật khẩu không đúng.'
    return render(request, 'dashboard/login.html', {'error': error})


@login_required
def employee_list(request):
    if request.user.role != 'branch_admin':
        raise PermissionDenied
    try:
        membership = BranchMembership.objects.select_related('branch').get(user=request.user)
    except BranchMembership.DoesNotExist:
        raise PermissionDenied

    employees = User.objects.filter(branch_membership__branch=membership.branch, role='branch_staff').order_by('username')
    return render(request, 'dashboard/employee_list.html', {'employees': employees, 'branch': membership.branch})


def logout_view(request):
    logout(request)
    return redirect('login')


PAGE_CONFIG = {
    'home': ('prototype/pages/home.html', 'customer'),
    'menu': ('prototype/pages/menu.html', 'customer'),
    'dish': ('prototype/pages/dish.html', 'customer'),
    'cart': ('prototype/pages/cart.html', 'customer'),
    'checkout': ('prototype/pages/checkout.html', 'customer'),
    'orders': ('prototype/pages/orders.html', 'customer'),
    'offers': ('prototype/pages/offers.html', 'customer'),
    'account': ('prototype/pages/account.html', 'customer'),
    'b-dash': ('prototype/pages/b_dash.html', 'branch_admin'),
    'b-orders': ('prototype/pages/b_orders.html', 'branch_admin'),
    'b-menu': ('prototype/pages/b_menu.html', 'branch_admin'),
    'b-inv': ('prototype/pages/b_inv.html', 'branch_admin'),
    'b-ship': ('prototype/pages/b_ship.html', 'branch_staff'),
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
    allowed_roles = {
        'customer': [],
        'branch_admin': ['branch_admin'],
        'branch_staff': ['branch_staff', 'branch_admin'],
        'super_admin': ['super_admin'],
    }
    if page_group != 'customer':
        if request.user.role not in allowed_roles[page_group]:
            raise PermissionDenied
    return render(request, template_name, {'page_key': page_key, 'page_group': page_group})


# ================= API CHO ADMIN TỔNG =================

@login_required
@require_http_methods(["GET", "PATCH"])
def api_admin_branches(request):
    if request.user.role != 'super_admin':
        return JsonResponse({"error": "Permission denied"}, status=403)

    if request.method == "GET":
        data = []
        data.append({
            "id": "ALL", "name": "Hộp chung (Chờ điều phối)", "address": "Toàn hệ thống",
            "is_active": True, "is_accepting_orders": True, "max_capacity": 0,
            "active_orders": 0, "phone": "N/A", "staff_count": 0, "lat": 0, "lng": 0
        })
        
        branches = Branch.objects.all().order_by('id')
        for b in branches:
            active_orders = Order.objects.filter(
                branch=b, status__in=['pending', 'confirmed', 'preparing', 'ready', 'delivering']
            ).count()
            staff_count = BranchMembership.objects.filter(branch=b).count()
            name = b.name
            if name.startswith('Miêu Quán '):
                name = name[len('Miêu Quán '):]

            data.append({
                "id": str(b.id), "name": name, "address": b.address,
                "is_active": b.is_active, "is_accepting_orders": b.is_accepting_orders,
                "max_capacity": b.max_capacity, "active_orders": active_orders,
                "phone": b.phone or "Chưa có", "staff_count": staff_count,
                "lat": float(b.latitude) if b.latitude else 21.0285,
                "lng": float(b.longitude) if b.longitude else 105.8542
            })
        return JsonResponse({"branches": data})
        
    elif request.method == "PATCH":
        try:
            payload = json.loads(request.body)
            branch_id = payload.get("branch_id")
            if branch_id == "ALL":
                return JsonResponse({"error": "Không thể sửa hộp chung"}, status=400)
            branch = Branch.objects.get(id=branch_id)
            if "is_active" in payload:
                branch.is_active = payload["is_active"]
            if "is_accepting_orders" in payload:
                branch.is_accepting_orders = payload["is_accepting_orders"]
            branch.save()
            return JsonResponse({"success": True})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)


@login_required
@require_http_methods(["GET", "PATCH"])
def api_admin_users(request):
    if request.user.role != 'super_admin':
        return JsonResponse({"error": "Permission denied"}, status=403)

    if request.method == "GET":
        users = User.objects.all().order_by('id')
        data = []
        role_map = {
            'customer': 'Khách hàng', 'branch_staff': 'Nhân viên chi nhánh',
            'delivery': 'Giao hàng', 'branch_admin': 'Quản trị chi nhánh', 'super_admin': 'Quản trị tổng'
        }
        for u in users:
            branch_name = "—"
            if hasattr(u, 'branch_membership') and u.branch_membership:
                branch_name = u.branch_membership.branch.name
                if branch_name.startswith('Miêu Quán '):
                    branch_name = branch_name[len('Miêu Quán '):]
            data.append({
                "id": str(u.id), "full_name": u.get_full_name() or u.username,
                "role": role_map.get(u.role, u.role), "branch": branch_name,
                "email": u.email or "Chưa có email", "is_active": u.is_active,
                "date_joined": u.date_joined.strftime('%d.%m.%Y')
            })
        return JsonResponse({"users": data})

    elif request.method == "PATCH":
        try:
            payload = json.loads(request.body)
            user = User.objects.get(id=payload.get("user_id"))
            if "is_active" in payload:
                user.is_active = payload["is_active"]
            user.save()
            return JsonResponse({"success": True})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)


@login_required
@require_http_methods(["GET"])
def api_admin_orders(request):
    if request.user.role != 'super_admin':
        return JsonResponse({"error": "Permission denied"}, status=403)
    
    status_map = {
        'pending': 0, 'confirmed': 1, 'preparing': 2, 'ready': 3,
        'delivering': 4, 'completed': 5, 'cancelled': -1
    }
    pay_map = {'cod': 'Tiền mặt', 'qr': 'Chuyển khoản', 'momo': 'Ví MoMo', 'card': 'Thẻ ngân hàng'}
    
    orders_qs = Order.objects.all().select_related('customer', 'branch', 'shipper').prefetch_related('items', 'dispatch_logs').order_by('-created_at')[:100]
    
    data = []
    now = timezone.now()
    for o in orders_qs:
        items_data = [[item.product_code, item.quantity] for item in o.items.all()]
        st = status_map.get(o.status, 0)
        ago = max(0, int((now - o.created_at).total_seconds() / 60))
        
        snap = []
        for log in o.dispatch_logs.all():
            snap.append({
                "id": str(log.chosen_branch.id) if log.chosen_branch else "",
                "ok": True, "score": float(log.score) if log.score else 0,
                "dist": float(log.distance_km) if log.distance_km else 0, "why": log.reason
            })
        if not snap and o.branch:
            snap.append({"id": str(o.branch.id), "ok": True, "score": 100, "dist": 2.0, "why": "Tự động"})

        audit = [{"t": o.created_at.strftime('%H:%M'), "who": "Khách hàng", "ev": "Đặt đơn " + o.code}]
        if o.accepted_at:
            audit.append({"t": o.accepted_at.strftime('%H:%M'), "who": "Chi nhánh", "ev": "Đã xác nhận đơn"})
        if o.status == 'completed':
            audit.append({"t": o.created_at.strftime('%H:%M'), "who": "Shipper", "ev": "Giao thành công"})

        data.append({
            "no": o.code, "cust": o.customer.get_full_name() or o.customer.username,
            "tel": o.recipient_phone, "br": str(o.branch.id) if o.branch else "ALL",
            "items": items_data, "st": st, "pay": pay_map.get(o.payment_method, o.payment_method),
            "ps": "Đã thanh toán" if o.payment_status == 'paid' else "Chờ thanh toán",
            "t": o.created_at.strftime('%H:%M'), "ago": ago,
            "lat": float(o.delivery_lat) if o.delivery_lat else 21.0285,
            "lng": float(o.delivery_lng) if o.delivery_lng else 105.8542,
            "address": o.delivery_address,
            "sub": o.subtotal, "fee": o.delivery_fee, "disc": o.discount, "total": o.total,
            "note": o.note, "ship": o.shipper.username if o.shipper else None,
            "pt": [150, 272], "snap": snap, "audit": audit
        })
    return JsonResponse({"orders": data})


@login_required
@require_http_methods(["POST"])
def api_admin_reassign_order(request):
    if request.user.role != 'super_admin':
        return JsonResponse({"error": "Permission denied"}, status=403)
    try:
        payload = json.loads(request.body)
        order_code = payload.get("order_code")
        new_branch_id = payload.get("branch_id")
        
        if new_branch_id == "ALL":
            return JsonResponse({"error": "Không thể chuyển về Hộp chung"}, status=400)
            
        order = Order.objects.get(code=order_code)
        branch = Branch.objects.get(id=new_branch_id)
        order.branch = branch
        order.save()
        
        DispatchLog.objects.create(
            order=order, chosen_branch=branch, reason="manual",
            breakdown={"message": "Chuyển bếp thủ công bởi Quản trị"}
        )
        return JsonResponse({"success": True})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)