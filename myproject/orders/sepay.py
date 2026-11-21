import base64
import hashlib
import hmac

from django.conf import settings
from django.urls import reverse


CHECKOUT_URLS = {
    "sandbox": "https://pay-sandbox.sepay.vn/v1/checkout/init",
    "production": "https://pay.sepay.vn/v1/checkout/init",
}

SIGNED_FIELDS = (
    "order_amount",
    "merchant",
    "currency",
    "operation",
    "order_description",
    "order_invoice_number",
    "customer_id",
    "payment_method",
    "success_url",
    "error_url",
    "cancel_url",
)


def checkout_configuration_error():
    required = (
        settings.SEPAY_MERCHANT_ID,
        settings.SEPAY_MERCHANT_SECRET_KEY,
        settings.SEPAY_IPN_SECRET_KEY,
        settings.SEPAY_PUBLIC_BASE_URL,
    )
    if not all(required):
        return "Thanh toán QR chưa được cấu hình đầy đủ trên máy chủ."
    if settings.SEPAY_ENVIRONMENT not in CHECKOUT_URLS:
        return "Môi trường SePay phải là sandbox hoặc production."
    return ""


def build_checkout_data(order, payment):
    base_url = settings.SEPAY_PUBLIC_BASE_URL.rstrip("/")
    fields = {
        "order_amount": str(payment.amount),
        "merchant": settings.SEPAY_MERCHANT_ID,
        "currency": "VND",
        "operation": "PURCHASE",
        "order_description": f"Thanh toan don hang {order.code}",
        "order_invoice_number": payment.invoice_number,
        "customer_id": str(order.customer_id),
        "payment_method": "BANK_TRANSFER",
        "success_url": base_url + reverse(
            "sepay_payment_return",
            kwargs={"result": "success", "invoice_number": payment.invoice_number},
        ),
        "error_url": base_url + reverse(
            "sepay_payment_return",
            kwargs={"result": "error", "invoice_number": payment.invoice_number},
        ),
        "cancel_url": base_url + reverse(
            "sepay_payment_return",
            kwargs={"result": "cancel", "invoice_number": payment.invoice_number},
        ),
        "lang": "vi",
    }
    signed_values = [
        f"{name}={fields[name]}"
        for name in SIGNED_FIELDS
        if fields.get(name) not in (None, "", 0, "0")
    ]
    signed_string = ",".join(signed_values)
    digest = hmac.new(
        settings.SEPAY_MERCHANT_SECRET_KEY.encode("utf-8"),
        signed_string.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    fields["signature"] = base64.b64encode(digest).decode("ascii")
    return {
        "action": CHECKOUT_URLS[settings.SEPAY_ENVIRONMENT],
        "method": "POST",
        "fields": fields,
    }


def valid_ipn_secret(value):
    expected = settings.SEPAY_IPN_SECRET_KEY
    return bool(expected) and hmac.compare_digest(value or "", expected)
