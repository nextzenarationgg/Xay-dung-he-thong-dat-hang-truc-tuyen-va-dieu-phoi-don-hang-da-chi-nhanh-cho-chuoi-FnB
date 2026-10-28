import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("branches", "0002_branch_dispatch_fields"),
        ("orders", "0005_order_shipper"),
    ]

    operations = [
        migrations.AddField(
            model_name="order", name="delivery_lat",
            field=models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AddField(
            model_name="order", name="delivery_lng",
            field=models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True),
        ),
        migrations.CreateModel(
            name="DispatchLog",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("score", models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ("distance_km", models.DecimalField(blank=True, decimal_places=2, max_digits=6, null=True)),
                ("reason", models.CharField(max_length=50)),
                ("breakdown", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("chosen_branch", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="dispatch_logs", to="branches.branch")),
                ("order", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="dispatch_logs", to="orders.order")),
            ],
            options={"ordering": ("-created_at",)},
        ),
    ]