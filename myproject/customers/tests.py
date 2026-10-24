from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse


User = get_user_model()


class CustomerSigninTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="customer-test",
            email="customer@example.com",
            password="test-password-123",
            first_name="Minh",
            last_name="Nguyen",
            role="customer",
            phone="0912345678",
        )

    def test_signin_with_email_starts_customer_session(self):
        response = self.client.post(
            reverse("customer_signin_signup"),
            {"username": self.user.email, "password": "test-password-123"},
        )

        self.assertRedirects(response, reverse("customer_home"))
        self.assertEqual(
            str(self.client.session["_auth_user_id"]),
            str(self.user.pk),
        )

    def test_signin_with_phone_starts_customer_session(self):
        response = self.client.post(
            reverse("customer_signin_signup"),
            {"username": self.user.phone, "password": "test-password-123"},
        )

        self.assertRedirects(response, reverse("customer_home"))
        self.assertEqual(
            str(self.client.session["_auth_user_id"]),
            str(self.user.pk),
        )

    def test_invalid_signin_shows_error(self):
        response = self.client.post(
            reverse("customer_signin_signup"),
            {"username": self.user.username, "password": "wrong-password"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Tên đăng nhập, email, số điện thoại hoặc mật khẩu không đúng.")

    def test_home_includes_signed_in_customer_profile(self):
        self.client.force_login(self.user)

        response = self.client.get(reverse("customer_home"))

        self.assertContains(response, 'data-customer-authenticated="true"')
        self.assertContains(response, "Minh Nguyen")
        self.assertContains(response, "customer@example.com")
        self.assertContains(response, "0912345678")

    def test_anonymous_home_marks_customer_as_signed_out(self):
        response = self.client.get(reverse("customer_home"))

        self.assertContains(response, 'data-customer-authenticated="false"')

    def test_customer_can_log_out(self):
        self.client.force_login(self.user)

        response = self.client.post(reverse("customer_logout"))

        self.assertRedirects(response, reverse("customer_home"))
        self.assertNotIn("_auth_user_id", self.client.session)

    def test_customer_logout_requires_post(self):
        self.client.force_login(self.user)

        response = self.client.get(reverse("customer_logout"))

        self.assertEqual(response.status_code, 405)
        self.assertIn("_auth_user_id", self.client.session)

    def test_registration_creates_session_and_returns_home(self):
        response = self.client.post(
            reverse("customer_signin_signup"),
            {
                "action": "register",
                "full_name": "Nguyen Van A",
                "phone": "0987654321",
                "email": "new-customer@example.com",
                "password": "Strong-Difficult-Pass-9482",
                "password_confirmation": "Strong-Difficult-Pass-9482",
                "terms": "on",
            },
        )

        new_user = User.objects.get(phone="0987654321")
        self.assertRedirects(response, reverse("customer_home"))
        self.assertEqual(
            str(self.client.session["_auth_user_id"]),
            str(new_user.pk),
        )
        self.assertEqual(new_user.email, "new-customer@example.com")

    def test_registration_error_keeps_register_tab_selected(self):
        response = self.client.post(
            reverse("customer_signin_signup"),
            {
                "action": "register",
                "full_name": "Nguyen Van B",
                "phone": "0123456789",
                "email": "another@example.com",
                "password": "Strong-Difficult-Pass-9482",
                "password_confirmation": "Strong-Difficult-Pass-9482",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'data-auth-tab="register"')
        self.assertContains(response, "Vui lòng đồng ý với điều khoản sử dụng.")
