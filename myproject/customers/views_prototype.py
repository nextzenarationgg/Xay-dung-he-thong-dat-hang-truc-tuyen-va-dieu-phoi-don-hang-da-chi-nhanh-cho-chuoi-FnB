from django.contrib.auth import authenticate, get_user_model, login, logout
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.shortcuts import redirect, render
from django.views.decorators.http import require_POST

User = get_user_model()


def home(request):
    customer_authenticated = (
        request.user.is_authenticated and request.user.role == "customer"
    )
    customer_data = None
    if customer_authenticated:
        customer_data = {
            "name": request.user.get_full_name() or request.user.username,
            "email": request.user.email,
            "phone": request.user.phone or "",
        }

    return render(
        request,
        "customer/customer.html",
        {
            "customer_authenticated": customer_authenticated,
            "customer_data": customer_data,
        },
    )


@require_POST
def logout_customer(request):
    logout(request)
    return redirect("customer_home")


def signin_signup(request):
    if request.user.is_authenticated and request.user.role == "customer":
        return redirect("customer_home")

    auth_error = ""
    auth_tab = "login"
    if request.method == "POST":
        action = request.POST.get("action", "login")
        if action == "register":
            auth_tab = "register"
            full_name = request.POST.get("full_name", "").strip()
            phone = request.POST.get("phone", "").strip()
            email = request.POST.get("email", "").strip().lower()
            password = request.POST.get("password", "")
            password_confirmation = request.POST.get(
                "password_confirmation", ""
            )

            if not full_name or not phone or not email or not password:
                auth_error = "Vui lòng điền đầy đủ họ tên, số điện thoại, email và mật khẩu."
            elif not phone.isdigit() or len(phone) not in (10, 11) or not phone.startswith("0"):
                auth_error = "Số điện thoại phải gồm 10 hoặc 11 chữ số và bắt đầu bằng 0."
            else:
                try:
                    validate_email(email)
                except ValidationError:
                    auth_error = "Email không hợp lệ."

            if not auth_error and password != password_confirmation:
                auth_error = "Mật khẩu nhập lại không khớp."
            if not auth_error and request.POST.get("terms") != "on":
                auth_error = "Vui lòng đồng ý với điều khoản sử dụng."
            if not auth_error and User.objects.filter(phone=phone).exists():
                auth_error = "Số điện thoại này đã được đăng ký."
            if not auth_error and User.objects.filter(email__iexact=email).exists():
                auth_error = "Email này đã được đăng ký."

            username = f"customer_{phone}"
            if not auth_error and User.objects.filter(username=username).exists():
                auth_error = "Không thể tạo tài khoản với số điện thoại này."
            if not auth_error:
                candidate = User(
                    username=username,
                    email=email,
                    phone=phone,
                    first_name=full_name,
                )
                try:
                    validate_password(password, user=candidate)
                except ValidationError as error:
                    auth_error = " ".join(error.messages)

            if not auth_error:
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    phone=phone,
                    password=password,
                    first_name=full_name,
                )
                login(request, user)
                return redirect("customer_home")
        else:
            identifier = request.POST.get("username", "").strip()
            password = request.POST.get("password", "")
            user = authenticate(request, username=identifier, password=password)

            if user is None and "@" in identifier:
                usernames = list(
                    User.objects.filter(email__iexact=identifier)
                    .values_list("username", flat=True)[:2]
                )
                if len(usernames) == 1:
                    user = authenticate(
                        request,
                        username=usernames[0],
                        password=password,
                    )

            if user is None:
                phone_user = User.objects.filter(phone=identifier).first()
                if phone_user is not None:
                    user = authenticate(
                        request,
                        username=phone_user.username,
                        password=password,
                    )

            if user is not None and user.is_active and user.role == "customer":
                login(request, user)
                return redirect("customer_home")

            auth_error = "Tên đăng nhập, email, số điện thoại hoặc mật khẩu không đúng."

    return render(
        request,
        "customer/customer_signin_signup.html",
        {"auth_error": auth_error, "auth_tab": auth_tab},
    )