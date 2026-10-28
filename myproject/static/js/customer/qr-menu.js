'use strict';
const qrCode = document.body.getAttribute('data-qr');
let products = [];
let cart = {}; // { product_code: { item, qty } }

// Tải thông tin bàn và menu
Promise.all([
  fetch('/api/public/table/' + qrCode + '/').then(r => r.json()),
  fetch('/api/products/').then(r => r.json())
]).then(([tableData, productData]) => {
  document.getElementById('table-title').innerText = tableData.table_name;
  document.getElementById('branch-title').innerText = tableData.branch_name;
  products = productData.products;
  renderProducts();
}).catch(err => {
  alert("Mã QR không hợp lệ hoặc lỗi kết nối!");
});

function renderProducts() {
  const grid = document.getElementById('qr-products');
  grid.innerHTML = products.map(p => `
    <div class="qr-card">
      <img src="https://source.unsplash.com/random/300x200/?food,${encodeURIComponent(p.name)}" alt="${p.name}">
      <div class="qr-card-info">
        <div class="qr-card-title">${p.name}</div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
          <span class="qr-card-price">${new Intl.NumberFormat('vi-VN').format(p.price)}đ</span>
          <button class="qr-add-btn" onclick="addToCart('${p.code}')">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

function addToCart(code) {
  if (!cart[code]) {
    const p = products.find(x => x.code === code);
    cart[code] = { item: p, qty: 0 };
  }
  cart[code].qty++;
  updateCartUI();
  // Hiệu ứng toast nhỏ
  const btn = event.target;
  btn.innerText = '✓';
  setTimeout(() => btn.innerText = '+', 500);
}

function removeFromCart(code) {
  if (cart[code]) {
    cart[code].qty--;
    if (cart[code].qty <= 0) delete cart[code];
    updateCartUI();
  }
}

function updateCartUI() {
  let count = 0, total = 0;
  Object.values(cart).forEach(c => {
    count += c.qty;
    total += c.item.price * c.qty;
  });

  document.getElementById('cart-count').innerText = count;
  document.getElementById('cart-total').innerText = new Intl.NumberFormat('vi-VN').format(total) + 'đ';

  const cartItemsDiv = document.getElementById('cart-items');
  if (count === 0) {
    cartItemsDiv.innerHTML = '<div style="text-align:center;color:#999;padding:20px 0">Giỏ hàng trống</div>';
  } else {
    cartItemsDiv.innerHTML = Object.values(cart).map(c => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #eee">
        <div>
          <div style="font-weight:600">${c.item.name}</div>
          <div style="color:#c0392b;font-size:14px">${new Intl.NumberFormat('vi-VN').format(c.item.price)}đ</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <button onclick="removeFromCart('${c.item.code}')" style="width:28px;height:28px;border-radius:50%;border:1px solid #ddd;background:white">-</button>
          <span style="font-weight:bold;width:20px;text-align:center">${c.qty}</span>
          <button onclick="addToCart('${c.item.code}')" style="width:28px;height:28px;border-radius:50%;border:1px solid #ddd;background:white">+</button>
        </div>
      </div>
    `).join('');
  }
}

function openCart() {
  if (Object.keys(cart).length === 0) return alert('Vui lòng chọn món trước!');
  document.getElementById('cart-overlay').style.display = 'block';
  document.getElementById('cart-panel').classList.add('open');
}

function closeCart() {
  document.getElementById('cart-overlay').style.display = 'none';
  document.getElementById('cart-panel').classList.remove('open');
}

function submitOrder(btn) {
  const items = Object.values(cart).map(c => ({ product_code: c.item.code, quantity: c.qty }));
  const note = document.getElementById('order-note').value;
  
  btn.innerText = 'Đang gửi...';
  btn.disabled = true;

  fetch('/api/public/dine-in-orders/', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ qr_code: qrCode, items: items, note: note })
  }).then(r => {
    // Kiểm tra xem server có trả về lỗi 403 (CSRF) hay không
    if (!r.ok) {
        return r.text().then(text => { throw new Error("Lỗi Server: " + r.status); });
    }
    return r.json();
  }).then(data => {
    if (data.ok) {
      alert('Đã gửi đơn xuống bếp thành công!');
      window.location.reload();
    } else {
      alert(data.error || 'Có lỗi xảy ra');
      btn.innerText = 'Gửi đơn xuống bếp';
      btn.disabled = false;
    }
  }).catch(err => {
    console.error(err);
    alert('Không thể gửi đơn. Vui lòng thử lại!');
    btn.innerText = 'Gửi đơn xuống bếp';
    btn.disabled = false;
  });
}