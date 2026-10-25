from django.db import migrations


PRODUCTS = [
    ("d1", "Cơm thố xá xíu", "com", 59000, "Xá xíu mật ong, trứng ốp la, dưa leo"),
    ("d2", "Cơm thố sườn nướng mật ong", "com", 65000, "Sườn cốt lết nướng, rau củ xào"),
    ("d3", "Nem nướng Nha Trang", "bun", 79000, "8 xiên, bánh tráng chiên, rau sống"),
    ("d4", "Mỳ cay hải sản", "my", 55000, "Tôm, mực, chả cá, trứng lòng đào"),
    ("d5", "Mỳ cay bò Mỹ", "my", 59000, "Bò Mỹ thái lát, kim chi, nấm"),
    ("d6", "Bún đậu mắm tôm (mẹt vừa)", "bun", 89000, "Đậu rán, chả cốm, dồi, bún lá"),
    ("d7", "Bún chả nem cua bể", "bun", 58000, "Chả viên, chả miếng, nem cua bể"),
    ("d8", "Gỏi cuốn tôm thịt (4 cuốn)", "bite", 45000, "Tôm, thịt luộc, bún, rau thơm"),
    ("d9", "Chân gà sả tắc", "bite", 69000, "Chân gà rút xương, sả, tắc, ớt"),
    ("d10", "Trà đào cam sả", "drink", 35000, "Đào ngâm, cam vàng, sả đập dập"),
    ("d11", "Trà sữa nướng Miêu", "drink", 39000, "Trà sữa nướng, trân châu đen"),
    ("d12", "Cà phê muối", "drink", 32000, "Cà phê phin, kem muối béo nhẹ"),
    ("d13", "Chè khúc bạch hạnh nhân", "sweet", 38000, "Khúc bạch, nhãn, hạnh nhân lát"),
    ("d14", "Bánh flan caramel", "sweet", 25000, "Flan trứng sữa, caramel đắng nhẹ"),
]


def seed_products(apps, schema_editor):
    Product = apps.get_model("orders", "Product")
    Product.objects.using(schema_editor.connection.alias).bulk_create(
        [
            Product(
                code=code,
                name=name,
                category=category,
                price=price,
                description=description,
            )
            for code, name, category, price, description in PRODUCTS
        ],
        ignore_conflicts=True,
    )


class Migration(migrations.Migration):
    dependencies = [("orders", "0001_initial")]

    operations = [migrations.RunPython(seed_products, migrations.RunPython.noop)]
