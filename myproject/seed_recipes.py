from orders.models import Product, ProductIngredient
from branches.models import Branch, Ingredient

print("Bắt đầu chạy script định lượng món ăn...")

# 1. Danh sách nguyên liệu cơ bản
base_ingredients = {
    "Thịt bò": "kg", "Bánh phở": "kg", "Hành lá": "kg", 
    "Gạo": "kg", "Thịt xá xíu": "kg", "Trứng": "quả",
    "Thịt heo xay": "kg", "Bánh tráng": "cái", "Rau sống": "kg",
    "Mỳ gói": "gói", "Hải sản": "kg", "Rau cải": "kg",
    "Bún": "kg", "Đậu hũ": "miếng", "Thịt chân giò": "kg",
    "Trà khô": "kg", "Đá": "kg"
}

# 2. Tự động tạo nguyên liệu trong kho
branches = Branch.objects.all()
for b in branches:
    for ing_name, unit in base_ingredients.items():
        Ingredient.objects.get_or_create(
            branch=b, name=ing_name, 
            defaults={"unit": unit, "quantity": 100, "min_quantity": 10}
        )
print(f"-> Đã chuẩn bị kho nguyên liệu cho {branches.count()} chi nhánh.")

# 3. Gán định lượng cho món ăn
products = Product.objects.all()
count = 0

for p in products:
    name = p.name.lower()
    ProductIngredient.objects.filter(product=p).delete()
    
    if "phở" in name:
        ProductIngredient.objects.create(product=p, ingredient_name="Bánh phở", quantity_per_portion=0.2, unit="kg")
        ProductIngredient.objects.create(product=p, ingredient_name="Thịt bò", quantity_per_portion=0.1, unit="kg")
        ProductIngredient.objects.create(product=p, ingredient_name="Hành lá", quantity_per_portion=0.03, unit="kg")
        count += 1
    elif "cơm" in name:
        ProductIngredient.objects.create(product=p, ingredient_name="Gạo", quantity_per_portion=0.15, unit="kg")
        ProductIngredient.objects.create(product=p, ingredient_name="Thịt xá xíu", quantity_per_portion=0.1, unit="kg")
        ProductIngredient.objects.create(product=p, ingredient_name="Trứng", quantity_per_portion=1, unit="quả")
        count += 1
    elif "nem" in name:
        ProductIngredient.objects.create(product=p, ingredient_name="Thịt heo xay", quantity_per_portion=0.15, unit="kg")
        ProductIngredient.objects.create(product=p, ingredient_name="Bánh tráng", quantity_per_portion=2, unit="cái")
        ProductIngredient.objects.create(product=p, ingredient_name="Rau sống", quantity_per_portion=0.05, unit="kg")
        count += 1
    elif "mỳ" in name or "mì" in name:
        ProductIngredient.objects.create(product=p, ingredient_name="Mỳ gói", quantity_per_portion=1, unit="gói")
        ProductIngredient.objects.create(product=p, ingredient_name="Hải sản", quantity_per_portion=0.1, unit="kg")
        ProductIngredient.objects.create(product=p, ingredient_name="Rau cải", quantity_per_portion=0.05, unit="kg")
        count += 1
    elif "bún" in name:
        ProductIngredient.objects.create(product=p, ingredient_name="Bún", quantity_per_portion=0.2, unit="kg")
        ProductIngredient.objects.create(product=p, ingredient_name="Đậu hũ", quantity_per_portion=2, unit="miếng")
        ProductIngredient.objects.create(product=p, ingredient_name="Thịt chân giò", quantity_per_portion=0.1, unit="kg")
        count += 1
    elif "trà" in name or "nước" in name:
        ProductIngredient.objects.create(product=p, ingredient_name="Trà khô", quantity_per_portion=0.005, unit="kg")
        ProductIngredient.objects.create(product=p, ingredient_name="Đá", quantity_per_portion=0.2, unit="kg")
        count += 1

print(f"-> Đã cập nhật xong công thức cho {count} món ăn.")