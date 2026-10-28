from django.db import models


class Branch(models.Model):
    name = models.CharField(max_length=150)
    address = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)

    # === Trường phục vụ điều phối ===
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    max_capacity = models.PositiveSmallIntegerField(default=20)
    is_accepting_orders = models.BooleanField(default=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)  # 0.00–5.00
    rating_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name
class Ingredient(models.Model):
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='ingredients')
    name = models.CharField(max_length=150)
    unit = models.CharField(max_length=20) # kg, hộp, lọ, cái...
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    min_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('branch', 'name')

    def __str__(self):
        return f"{self.name} ({self.branch.name})"