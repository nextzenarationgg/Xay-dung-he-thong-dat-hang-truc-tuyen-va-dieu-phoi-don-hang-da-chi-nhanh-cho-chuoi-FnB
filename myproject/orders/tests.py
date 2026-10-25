import json

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from accounts.models import BranchMembership
from branches.models import Branch
from .models import Cart, CartItem, Order, OrderItem, Product

User = get_user_model()


class CustomerOrderingApiTests(TestCase):
    def setUp(self):
        self.customer = User.objects.create_user(
            username="order-customer",
            password="test-password-123",
            role="customer",
        )
        self.other_customer = User.objects.create_user(
            username="other-customer",
            password="test-password-123",
            role="customer",
        )
        self.product = Product.objects.create(
            code="test-dish",
            name="Cơm thố xá xíu",
            category="com",
            price=59000,
        )
        self.client.force_login(self.customer)

    def post_json(self, url, data):
        return self.client.post(
            url,
            data=json.dumps(data),
            content_type="application/json",
        )

    def test_anonymous_customer_cannot_read_cart_or_orders(self):
        self.client.logout()

        cart_response = self.client.get(reverse("cart_detail"))
        order_response = self.client.get(reverse("order_list_create"))

        self.assertEqual(cart_response.status_code, 401)
        self.assertEqual(order_response.status_code, 401)

    def test_non_customer_user_cannot_mutate_cart(self):
        staff = User.objects.create_user(
            username="branch-staff",
            password="test-password-123",
            role="branch_staff",
        )
        self.client.force_login(staff)

        response = self.post_json(
            reverse("cart_item", args=[self.product.code]),
            {"quantity": 1},
        )

        self.assertEqual(response.status_code, 403)
        self.assertFalse(Cart.objects.exists())

    def test_customer_can_add_update_and_remove_cart_items(self):
        url = reverse("cart_item", args=[self.product.code])

        add_response = self.post_json(url, {"quantity": 2, "price": 1, "note": "Ít rau"})
        self.assertEqual(add_response.status_code, 200)
        self.assertEqual(add_response.json()["subtotal"], 118000)
        self.assertEqual(add_response.json()["items"][0]["note"], "Ít rau")

        update_response = self.client.patch(
            url,
            data=json.dumps({"quantity": 3}),
            content_type="application/json",
        )
        self.assertEqual(update_response.json()["items"][0]["quantity"], 3)
        self.assertEqual(update_response.json()["subtotal"], 177000)

        remove_response = self.client.delete(url)
        self.assertEqual(remove_response.json()["items"], [])

    def test_cart_rejects_unknown_products_and_invalid_quantities(self):
        unknown_response = self.post_json(
            reverse("cart_item", args=["unknown"]),
            {"quantity": 1},
        )
        invalid_quantity_response = self.post_json(
            reverse("cart_item", args=[self.product.code]),
            {"quantity": 21},
        )

        self.assertEqual(unknown_response.status_code, 404)
        self.assertEqual(invalid_quantity_response.status_code, 400)
        self.assertFalse(CartItem.objects.exists())

    def test_checkout_persists_order_snapshot_and_clears_cart(self):
        cart = Cart.objects.create(customer=self.customer)
        CartItem.objects.create(cart=cart, product=self.product, quantity=2, note="Không lấy hành")

        response = self.post_json(
            reverse("order_list_create"),
            {
                "recipient_name": "Nguyễn Minh",
                "recipient_phone": "0912345678",
                "delivery_address": "12 Phố Huế, Hà Nội",
                "payment_method": "momo",
                "note": "Gọi trước khi giao",
                "voucher_code": "",
                "client_total": 1,
            },
        )

        self.assertEqual(response.status_code, 201)
        order_data = response.json()["order"]
        order = Order.objects.get(code=order_data["code"])
        item = OrderItem.objects.get(order=order)
        self.assertEqual(order.customer, self.customer)
        self.assertEqual(order.status, Order.Status.PENDING)
        self.assertEqual(order.payment_status, "pending")
        self.assertEqual(order.subtotal, 118000)
        self.assertEqual(order.delivery_fee, 15000)
        self.assertEqual(order.total, 133000)
        self.assertEqual(item.unit_price, self.product.price)
        self.assertEqual(item.quantity, 2)
        self.assertEqual(item.note, "Không lấy hành")
        self.assertFalse(cart.items.exists())

    def test_checkout_rejects_invalid_input_without_clearing_cart(self):
        cart = Cart.objects.create(customer=self.customer)
        CartItem.objects.create(cart=cart, product=self.product, quantity=1)

        response = self.post_json(
            reverse("order_list_create"),
            {
                "recipient_name": "Nguyễn Minh",
                "recipient_phone": "invalid",
                "delivery_address": "12 Phố Huế, Hà Nội",
                "payment_method": "cod",
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(Order.objects.exists())
        self.assertTrue(cart.items.exists())

    def test_customer_order_list_does_not_expose_another_customers_orders(self):
        order = Order.objects.create(
            customer=self.other_customer,
            payment_method=Order.PaymentMethod.CASH,
            recipient_name="Khách khác",
            recipient_phone="0912345678",
            delivery_address="Hà Nội",
            subtotal=59000,
            delivery_fee=15000,
            total=74000,
        )

        response = self.client.get(reverse("order_list_create"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["orders"], [])
        self.assertEqual(
            self.client.get(reverse("order_detail", args=[order.code])).status_code,
            404,
        )

    def test_customer_can_read_own_order_history_and_detail(self):
        order = Order.objects.create(
            customer=self.customer,
            payment_method=Order.PaymentMethod.CASH,
            recipient_name="Khách hàng",
            recipient_phone="0912345678",
            delivery_address="Hà Nội",
            subtotal=59000,
            delivery_fee=15000,
            total=74000,
        )
        OrderItem.objects.create(
            order=order,
            product=self.product,
            product_code=self.product.code,
            product_name=self.product.name,
            unit_price=self.product.price,
            quantity=1,
        )

        list_response = self.client.get(reverse("order_list_create"))
        detail_response = self.client.get(reverse("order_detail", args=[order.code]))

        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(list_response.json()["orders"][0]["code"], order.code)
        self.assertEqual(detail_response.status_code, 200)
        self.assertEqual(detail_response.json()["order"]["items"][0]["product_code"], self.product.code)

    def test_product_catalog_is_readable_without_sign_in(self):
        self.client.logout()

        response = self.client.get(reverse("product_list"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["products"][0]["code"], "d1")


class BranchOrderApiTests(TestCase):
    def setUp(self):
        self.branch = Branch.objects.create(name="Miêu Quán Cầu Giấy", address="Hà Nội")
        self.other_branch = Branch.objects.create(name="Miêu Quán Ba Đình", address="Hà Nội")
        self.staff = User.objects.create_user(
            username="branch-order-staff",
            role="branch_staff",
        )
        BranchMembership.objects.create(user=self.staff, branch=self.branch)
        self.other_staff = User.objects.create_user(
            username="other-branch-staff",
            role="branch_staff",
        )
        BranchMembership.objects.create(user=self.other_staff, branch=self.other_branch)
        self.shipper = User.objects.create_user(
            username="branch-shipper",
            first_name="Nguyễn",
            last_name="Giao Hàng",
            phone="0912345678",
            role="delivery",
        )
        BranchMembership.objects.create(user=self.shipper, branch=self.branch)
        self.customer = User.objects.create_user(username="branch-order-customer", role="customer")

    def create_order(self, **kwargs):
        defaults = {
            "customer": self.customer,
            "payment_method": Order.PaymentMethod.CASH,
            "recipient_name": "Khách đặt món",
            "recipient_phone": "0912345678",
            "delivery_address": "12 Phố Huế, Hà Nội",
            "subtotal": 59000,
            "delivery_fee": 15000,
            "total": 74000,
        }
        defaults.update(kwargs)
        return Order.objects.create(**defaults)

    def test_branch_inbox_includes_unclaimed_and_own_orders_only(self):
        unclaimed = self.create_order()
        own_order = self.create_order(branch=self.branch)
        self.create_order(branch=self.other_branch)

        self.client.force_login(self.staff)
        response = self.client.get(reverse("branch_order_list"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["branch"]["id"], self.branch.pk)
        self.assertEqual(
            {order["code"] for order in response.json()["orders"]},
            {unclaimed.code, own_order.code},
        )
        self.assertEqual(
            response.json()["shippers"],
            [
                {
                    "id": self.shipper.pk,
                    "name": "Nguyễn Giao Hàng",
                    "phone": "0912345678",
                    "active_orders": 0,
                }
            ],
        )

    def test_first_branch_to_claim_shared_order_owns_it(self):
        order = self.create_order()
        self.client.force_login(self.staff)

        response = self.client.post(reverse("claim_branch_order", args=[order.code]))

        self.assertEqual(response.status_code, 200)
        order.refresh_from_db()
        self.assertEqual(order.branch, self.branch)
        self.assertEqual(order.accepted_by, self.staff)
        self.assertIsNotNone(order.accepted_at)
        self.assertEqual(order.status, Order.Status.CONFIRMED)

        self.client.force_login(self.other_staff)
        losing_claim = self.client.post(reverse("claim_branch_order", args=[order.code]))
        self.assertEqual(losing_claim.status_code, 409)
        self.assertNotIn(
            order.code,
            {item["code"] for item in self.client.get(reverse("branch_order_list")).json()["orders"]},
        )

    def test_branch_can_advance_only_its_order_through_preparation(self):
        order = self.create_order(branch=self.branch, status=Order.Status.CONFIRMED)
        self.client.force_login(self.staff)

        preparing = self.client.post(
            reverse("update_branch_order_status", args=[order.code]),
            data=json.dumps({"status": Order.Status.PREPARING}),
            content_type="application/json",
        )
        ready = self.client.post(
            reverse("update_branch_order_status", args=[order.code]),
            data=json.dumps({"status": Order.Status.READY}),
            content_type="application/json",
        )

        self.assertEqual(preparing.status_code, 200)
        self.assertEqual(ready.status_code, 200)
        order.refresh_from_db()
        self.assertEqual(order.status, Order.Status.READY)

        invalid_transition = self.client.post(
            reverse("update_branch_order_status", args=[order.code]),
            data=json.dumps({"status": "not-a-status"}),
            content_type="application/json",
        )
        self.assertEqual(invalid_transition.status_code, 400)

        skipped_transition = self.client.post(
            reverse("update_branch_order_status", args=[order.code]),
            data=json.dumps({"status": Order.Status.COMPLETED}),
            content_type="application/json",
        )
        self.assertEqual(skipped_transition.status_code, 409)

        self.client.force_login(self.other_staff)
        wrong_branch = self.client.post(
            reverse("update_branch_order_status", args=[order.code]),
            data=json.dumps({"status": Order.Status.PREPARING}),
            content_type="application/json",
        )
        self.assertEqual(wrong_branch.status_code, 409)

    def test_ready_order_can_be_assigned_to_a_shipper_from_its_branch(self):
        order = self.create_order(branch=self.branch, status=Order.Status.READY)
        self.client.force_login(self.staff)

        response = self.client.post(
            reverse("assign_branch_shipper", args=[order.code]),
            data=json.dumps({"shipper_id": self.shipper.pk}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        order.refresh_from_db()
        self.assertEqual(order.shipper, self.shipper)
        self.assertEqual(order.status, Order.Status.DELIVERING)
        self.assertEqual(response.json()["order"]["shipper_name"], "Nguyễn Giao Hàng")
        persisted_order = next(
            item
            for item in self.client.get(reverse("branch_order_list")).json()["orders"]
            if item["code"] == order.code
        )
        self.assertEqual(persisted_order["status"], Order.Status.DELIVERING)
        self.assertEqual(persisted_order["shipper_id"], self.shipper.pk)

    def test_shipper_assignment_rejects_other_branch_and_duplicate_assignment(self):
        other_shipper = User.objects.create_user(username="other-shipper", role="delivery")
        BranchMembership.objects.create(user=other_shipper, branch=self.other_branch)
        order = self.create_order(branch=self.branch, status=Order.Status.READY)
        self.client.force_login(self.staff)
        url = reverse("assign_branch_shipper", args=[order.code])

        wrong_branch = self.client.post(
            url,
            data=json.dumps({"shipper_id": other_shipper.pk}),
            content_type="application/json",
        )
        self.assertEqual(wrong_branch.status_code, 400)

        assigned = self.client.post(
            url,
            data=json.dumps({"shipper_id": self.shipper.pk}),
            content_type="application/json",
        )
        duplicate = self.client.post(
            url,
            data=json.dumps({"shipper_id": self.shipper.pk}),
            content_type="application/json",
        )
        self.assertEqual(assigned.status_code, 200)
        self.assertEqual(duplicate.status_code, 409)

    def test_assigned_order_can_be_completed_and_persists(self):
        order = self.create_order(
            branch=self.branch,
            shipper=self.shipper,
            status=Order.Status.DELIVERING,
        )
        unassigned_order = self.create_order(
            branch=self.branch,
            status=Order.Status.DELIVERING,
        )
        self.client.force_login(self.staff)

        unassigned_completion = self.client.post(
            reverse("update_branch_order_status", args=[unassigned_order.code]),
            data=json.dumps({"status": Order.Status.COMPLETED}),
            content_type="application/json",
        )
        response = self.client.post(
            reverse("update_branch_order_status", args=[order.code]),
            data=json.dumps({"status": Order.Status.COMPLETED}),
            content_type="application/json",
        )

        self.assertEqual(unassigned_completion.status_code, 409)
        self.assertEqual(response.status_code, 200)
        order.refresh_from_db()
        self.assertEqual(order.status, Order.Status.COMPLETED)
        persisted_order = next(
            item
            for item in self.client.get(reverse("branch_order_list")).json()["orders"]
            if item["code"] == order.code
        )
        self.assertEqual(persisted_order["status"], Order.Status.COMPLETED)

    def test_branch_api_rejects_customers_and_membershipless_staff(self):
        self.client.force_login(self.customer)
        forbidden = self.client.get(reverse("branch_order_list"))
        self.assertEqual(forbidden.status_code, 403)

        unassigned_staff = User.objects.create_user(
            username="unassigned-branch-staff",
            role="branch_staff",
        )
        self.client.force_login(unassigned_staff)
        no_membership = self.client.get(reverse("branch_order_list"))
        self.assertEqual(no_membership.status_code, 403)

        self.client.logout()
        anonymous = self.client.get(reverse("branch_order_list"))
        self.assertEqual(anonymous.status_code, 401)
