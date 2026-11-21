from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("orders", "0012_merge_payment_and_table_status"),
    ]

    operations = [
        migrations.AlterField(
            model_name="order",
            name="payment_method",
            field=models.CharField(
                choices=[
                    ("cod", "Tiền mặt khi nhận hàng"),
                    ("qr", "Chuyển khoản QR"),
                    ("momo", "Ví MoMo (mô phỏng)"),
                    ("card", "Thẻ ngân hàng (mô phỏng)"),
                ],
                max_length=10,
            ),
        ),
    ]
