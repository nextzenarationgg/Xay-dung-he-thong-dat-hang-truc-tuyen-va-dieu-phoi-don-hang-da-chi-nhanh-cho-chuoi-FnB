from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("orders", "0013_alter_order_payment_method_label"),
    ]

    operations = [
        migrations.AddField(
            model_name="dineinorder",
            name="payment_method",
            field=models.CharField(
                blank=True,
                choices=[("cash", "Tiền mặt"), ("qr", "Quét QR")],
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name="dineinorder",
            name="payment_status",
            field=models.CharField(
                choices=[("pending", "Chờ thanh toán"), ("paid", "Đã thanh toán")],
                default="pending",
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name="dineinorder",
            name="status",
            field=models.CharField(
                choices=[
                    ("pending", "Mới nhận"),
                    ("preparing", "Đang chuẩn bị"),
                    ("served", "Đã phục vụ"),
                    ("completed", "Hoàn thành"),
                    ("cancelled", "Đã hủy"),
                ],
                default="pending",
                max_length=20,
            ),
        ),
        migrations.CreateModel(
            name="DineInPaymentTransaction",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("invoice_number", models.CharField(max_length=64, unique=True)),
                ("amount", models.PositiveBigIntegerField()),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("pending", "Đang chờ"),
                            ("paid", "Đã thanh toán"),
                            ("voided", "Đã hủy"),
                        ],
                        default="pending",
                        max_length=20,
                    ),
                ),
                ("provider_order_id", models.CharField(blank=True, max_length=128)),
                (
                    "provider_transaction_id",
                    models.CharField(blank=True, max_length=128),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("paid_at", models.DateTimeField(blank=True, null=True)),
                (
                    "orders",
                    models.ManyToManyField(
                        related_name="payment_transactions",
                        to="orders.dineinorder",
                    ),
                ),
                (
                    "table",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="payment_transactions",
                        to="orders.table",
                    ),
                ),
            ],
        ),
    ]
