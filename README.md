# 🍽️ HỆ THỐNG ĐẶT HÀNG TRỰC TUYẾN VÀ ĐIỀU PHỐI ĐƠN HÀNG ĐA CHI NHÁNH CHO CHUỖI FnB

## 📌 Giới thiệu

**Xây dựng hệ thống đặt hàng trực tuyến và điều phối đơn hàng đa chi nhánh cho chuỗi FnB** là dự án phát triển ứng dụng web nhằm hỗ trợ hoạt động đặt món trực tuyến, quản lý đơn hàng và điều phối đơn hàng giữa các chi nhánh trong cùng một hệ thống.

Hệ thống hướng đến việc tối ưu hóa quy trình tiếp nhận và xử lý đơn hàng, hỗ trợ quản lý hoạt động kinh doanh tại từng chi nhánh, đồng thời mang lại trải nghiệm đặt hàng thuận tiện cho khách hàng.

Dự án được xây dựng bằng Django và triển khai trực tuyến trên Render.

## 🎯 Mục tiêu dự án

- Xây dựng website đặt hàng trực tuyến dành cho khách hàng.
- Quản lý thông tin tài khoản và phân quyền người dùng theo vai trò.
- Hỗ trợ quản lý nhiều chi nhánh trong cùng một hệ thống.
- Hỗ trợ tiếp nhận, quản lý và theo dõi trạng thái đơn hàng.
- Xây dựng giao diện quản trị riêng cho từng nhóm người dùng.
- Hỗ trợ hoạt động quản lý và điều phối đơn hàng trong chuỗi FnB.

## ✨ Chức năng hệ thống

### 1. Khách hàng (Customer)

- Truy cập trang chủ và giao diện đặt hàng trực tuyến.
- Xem thông tin món ăn và lựa chọn sản phẩm.
- Thực hiện các thao tác đặt hàng theo chức năng được triển khai.
- Quản lý tài khoản và thông tin cá nhân theo quyền được cấp.

### 2. Nhân viên chi nhánh (Branch Staff)

- Hỗ trợ xử lý các đơn hàng thuộc chi nhánh được phân công.
- Theo dõi thông tin và trạng thái đơn hàng theo quyền hạn.
- Hỗ trợ quy trình phục vụ và xử lý đơn hàng tại chi nhánh.

### 3. Quản trị viên chi nhánh (Branch Admin)

- Quản lý hoạt động của chi nhánh được phân công.
- Quản lý tài khoản nhân viên thuộc phạm vi chi nhánh.
- Hỗ trợ theo dõi và quản lý đơn hàng của chi nhánh.
- Thực hiện các thao tác quản trị trong phạm vi được cấp quyền.

### 4. Nhân viên giao hàng (Delivery)

- Hỗ trợ quy trình tiếp nhận và xử lý đơn giao hàng.
- Theo dõi thông tin đơn hàng được phân công.
- Cập nhật trạng thái giao hàng theo chức năng được triển khai.

### 5. Quản trị viên hệ thống (Super Admin)

- Quản lý tổng thể hệ thống.
- Theo dõi hoạt động của các chi nhánh.
- Quản lý dữ liệu và tài khoản theo quyền quản trị hệ thống.
- Hỗ trợ giám sát hoạt động chung của hệ thống.

> **Lưu ý:** Các chức năng thực tế phụ thuộc vào mức độ hoàn thiện của từng module trong mã nguồn.

## 🛠️ Công nghệ sử dụng

| Công nghệ | Vai trò |
|---|---|
| Python | Ngôn ngữ lập trình chính |
| Django | Framework phát triển ứng dụng web |
| HTML5 | Xây dựng cấu trúc giao diện |
| CSS3 | Thiết kế và định dạng giao diện |
| JavaScript | Xử lý tương tác phía trình duyệt |
| SQLite hoặc cơ sở dữ liệu được cấu hình | Lưu trữ dữ liệu ứng dụng |
| Gunicorn | Chạy ứng dụng Django trên môi trường triển khai |
| WhiteNoise | Hỗ trợ phục vụ file tĩnh |
| Git và GitHub | Quản lý mã nguồn và làm việc nhóm |
| Render | Triển khai ứng dụng trực tuyến |

## 🏗️ Cấu trúc dự án

Cấu trúc tổng quan của dự án:

```text
Xay-dung-he-thong-dat-hang-truc-tuyen-va-dieu-phoi-don-hang-da-chi-nhanh-cho-chuoi-FnB/
│
├── requirements.txt
├── prototype.html
│
└── myproject/
    ├── manage.py
    │
    ├── myproject/
    │   ├── settings.py
    │   ├── urls.py
    │   ├── wsgi.py
    │   └── ...
    │
    ├── accounts/
    ├── branches/
    ├── customers/
    ├── dashboard/
    ├── delivery/
    └── orders/
```

**Vai trò của các thành phần chính:**

- `manage.py`: Công cụ thực hiện các lệnh quản lý Django.
- `myproject/settings.py`: Cấu hình ứng dụng, database, static files và các thành phần liên quan.
- `myproject/urls.py`: Khai báo và điều hướng URL cấp dự án.
- `accounts/`: Quản lý tài khoản và các thành phần liên quan đến người dùng.
- `branches/`: Quản lý thông tin chi nhánh.
- `customers/`: Xử lý các chức năng phía khách hàng.
- `dashboard/`: Các thành phần liên quan đến giao diện quản trị.
- `delivery/`: Các thành phần liên quan đến giao hàng.
- `orders/`: Các thành phần liên quan đến đơn hàng.
- `requirements.txt`: Danh sách thư viện Python cần thiết.

*Cấu trúc trên mang tính tổng quan; các file và module cụ thể có thể thay đổi theo phiên bản mã nguồn.*

## ⚙️ Cài đặt và chạy dự án trên máy tính

### 1. Yêu cầu hệ thống

- Python tương thích với phiên bản Django trong `requirements.txt`.
- Git.
- Visual Studio Code hoặc IDE Python tương đương.

### 2. Tải mã nguồn

```bash
git clone https://github.com/nextzenarationgg/Xay-dung-he-thong-dat-hang-truc-tuyen-va-dieu-phoi-don-hang-da-chi-nhanh-cho-chuoi-FnB.git
```

Di chuyển vào thư mục dự án:

```bash
cd Xay-dung-he-thong-dat-hang-truc-tuyen-va-dieu-phoi-don-hang-da-chi-nhanh-cho-chuoi-FnB
```

### 3. Tạo môi trường ảo

```bash
python -m venv .venv
```

Kích hoạt môi trường ảo trên Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

### 4. Cài đặt thư viện

```bash
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### 5. Di chuyển vào thư mục Django

```bash
cd myproject
```

### 6. Khởi tạo database

```bash
python manage.py migrate
```

### 7. Tạo tài khoản quản trị

```bash
python manage.py createsuperuser
```

Làm theo hướng dẫn trong terminal để tạo tài khoản.

### 8. Chạy ứng dụng

```bash
python manage.py runserver
```

Mở trình duyệt và truy cập:

```text
http://127.0.0.1:8000/
```

> Nếu dự án yêu cầu biến môi trường hoặc cấu hình database riêng, hãy thiết lập các giá trị tương ứng trước khi chạy ứng dụng.

## 🛒 Đặt hàng (giai đoạn 1)

Danh mục món ăn, giỏ hàng theo tài khoản khách hàng và đơn hàng được lưu bằng Django database. Sau khi cập nhật mã nguồn, chạy migration để tạo các bảng và nạp danh mục món mẫu:

```bash
cd myproject
python manage.py migrate
```

Các API khách hàng hiện có:

- `GET /api/products/`: danh mục món đang bán.
- `GET /api/cart/`: giỏ hàng của tài khoản đang đăng nhập.
- `POST /api/cart/items/<product_code>/`: thêm món; `PATCH` cập nhật số lượng; `DELETE` xóa món.
- `GET /api/orders/`: lịch sử đơn của tài khoản đang đăng nhập.
- `POST /api/orders/`: tạo đơn từ giỏ hàng; máy chủ tự tính giá theo danh mục trong database.
- `GET /api/orders/<code>/`: xem đơn của chính tài khoản đó.

### Tiếp nhận và xử lý đơn tại chi nhánh

Đơn mới vào hộp đơn chung của các chi nhánh. Nhân viên đã được gán `BranchMembership` có thể xem đơn chờ; chi nhánh nào nhận trước sẽ được gán đơn đó. Chỉ chi nhánh đã nhận mới được chuyển trạng thái theo thứ tự `Đã xác nhận` → `Đang chuẩn bị` → `Sẵn sàng giao`. Sau đó chi nhánh chọn shipper thuộc chính chi nhánh; đơn chuyển sang `Đang giao`, rồi nhân viên xác nhận `Hoàn thành`. Các trạng thái và shipper được lưu trong database.

- `GET /api/branch/orders/`: danh sách đơn chờ chung và đơn của chi nhánh đang đăng nhập.
- `POST /api/branch/orders/<code>/claim/`: nhận một đơn chờ; yêu cầu đăng nhập bằng tài khoản nhân viên chi nhánh.
- `POST /api/branch/orders/<code>/status/`: chuyển đơn sang `preparing` hoặc `ready`; chỉ chi nhánh sở hữu đơn được cập nhật.
- `POST /api/branch/orders/<code>/assign-shipper/`: gán shipper bằng `{"shipper_id": <id>}` cho đơn `ready`, sau đó chuyển đơn sang `delivering`.

Tài khoản shipper cần có role `delivery` và `BranchMembership` gắn với chi nhánh. Chưa có điều phối tự động hoặc giao diện/tài khoản shipper riêng; nhân viên chi nhánh cập nhật trạng thái hoàn tất giao. Phí giao hàng đang cố định 15.000đ. Tiền mặt khi nhận hàng được ghi nhận là phương thức thanh toán; chuyển khoản, MoMo và thẻ chỉ là lựa chọn mô phỏng, chưa kết nối cổng thanh toán thật.

## 🌐 Triển khai trực tuyến

Dự án được cấu hình để triển khai trên nền tảng Render.

**Website:**  
https://xay-dung-he-thong-dat-hang-truc-tuyen-va.onrender.com

**Các thành phần triển khai chính:**

- GitHub: Lưu trữ mã nguồn và hỗ trợ quy trình cập nhật dự án.
- Render: Build và chạy ứng dụng web.
- Gunicorn: Khởi chạy ứng dụng Django.
- WhiteNoise: Hỗ trợ phục vụ CSS, JavaScript và các file tĩnh đã được thu thập.

Cấu hình triển khai cần phù hợp với cấu trúc thư mục thực tế của repository.

Ví dụ, nếu Render sử dụng thư mục gốc repository làm Root Directory, lệnh khởi chạy có thể được cấu hình như sau:

```bash
cd myproject && gunicorn myproject.wsgi:application
```

Build Command cần cài thư viện, chạy database migration và thu thập file tĩnh:

```bash
pip install -r requirements.txt && cd myproject && python manage.py migrate && python manage.py collectstatic --noinput
```

Nếu triển khai SQLite trên Render Free, database file nằm trên ổ đĩa tạm và dữ liệu giỏ hàng/đơn hàng có thể mất sau khi service khởi động lại, ngủ hoặc triển khai lại. Cần chuyển sang database bên ngoài hoặc ổ đĩa persistent phù hợp nếu cần giữ dữ liệu lâu dài.

**Lưu ý về database:** Database trên môi trường triển khai cần được cấu hình riêng và bảo đảm lưu trữ bền vững. Nếu sử dụng SQLite trên hệ thống tệp không được lưu trữ bền vững, dữ liệu có thể bị mất khi dịch vụ được khởi tạo lại hoặc triển khai lại. PostgreSQL là lựa chọn phù hợp khi cần lưu trữ dữ liệu đơn hàng và khách hàng lâu dài.

## 🔐 Phân quyền người dùng

Hệ thống định hướng phân chia quyền truy cập theo các vai trò:

| Vai trò | Phạm vi hoạt động |
|---|---|
| `customer` | Khách hàng |
| `branch_staff` | Nhân viên chi nhánh |
| `delivery` | Nhân viên giao hàng |
| `branch_admin` | Quản trị viên chi nhánh |
| `super_admin` | Quản trị viên hệ thống |

Việc phân quyền giúp giới hạn quyền truy cập vào các chức năng theo vai trò và phạm vi quản lý của người dùng.

## 👥 Thành viên dự án

Dự án được thực hiện theo hình thức làm việc nhóm.

Các thành viên cùng tham gia xây dựng, phát triển và hoàn thiện hệ thống thông qua GitHub.

*Danh sách thành viên và phân công công việc sẽ được cập nhật theo thực tế của nhóm.*

## 🚀 Định hướng phát triển

- Hoàn thiện các chức năng đặt hàng và quản lý đơn hàng.
- Hoàn thiện quy trình điều phối đơn hàng giữa các chi nhánh.
- Nâng cao khả năng theo dõi trạng thái đơn hàng.
- Hoàn thiện giao diện quản trị cho từng vai trò.
- Tối ưu giao diện trên máy tính và thiết bị di động.
- Tăng cường bảo mật và kiểm soát quyền truy cập.
- Hoàn thiện cấu hình database và khả năng lưu trữ dữ liệu lâu dài.
- Tối ưu hiệu năng và độ ổn định khi triển khai trực tuyến.

## 📄 Giấy phép

Dự án được phát triển phục vụ mục đích học tập và xây dựng đồ án.

Thông tin về giấy phép sử dụng và phân phối mã nguồn sẽ được bổ sung theo quyết định của nhóm.