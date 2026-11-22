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
  grid.innerHTML = products.map(p => {
    var imgSrc = p.image_url ? (window.location.origin + p.image_url + '?t=' + Date.now()) : 'https://placehold.co/300x300?text=Anh+Mon';
    
    return `
    <div class="qr-card">
      <img src="${imgSrc}" alt="${p.name}" loading="lazy">
      <div class="qr-card-info">
        <div class="qr-card-title">${p.name}</div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
          <span class="qr-card-price">${new Intl.NumberFormat('vi-VN').format(p.price)}đ</span>
          <button class="qr-add-btn" onclick="addToCart('${p.code}')">+</button>
        </div>
      </div>
    </div>
  `}).join('');
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
    cartItemsDiv.innerHTML = '<div style="text-align:center;color:#999;padding:30px 0;font-size:15px;">Giỏ hàng đang trống</div>';
  } else {
    cartItemsDiv.innerHTML = Object.values(cart).map(c => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #f0f0f0">
        <div style="flex:1; padding-right: 10px;">
          <div style="font-weight:600; font-size:15px; color:#333; margin-bottom:4px;">${c.item.name}</div>
          <div style="color:#c0392b;font-size:14px;font-weight:600;">${new Intl.NumberFormat('vi-VN').format(c.item.price)}đ</div>
        </div>
        <div style="display:flex;align-items:center;gap:12px; background: #f8f9fa; padding: 4px; border-radius: 20px;">
          <button onclick="removeFromCart('${c.item.code}')" style="width:28px;height:28px;border-radius:50%;border:none;background:white;box-shadow:0 1px 3px rgba(0,0,0,0.1); font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center;">-</button>
          <span style="font-weight:700;width:16px;text-align:center; font-size: 15px;">${c.qty}</span>
          <button onclick="addToCart('${c.item.code}')" style="width:28px;height:28px;border-radius:50%;border:none;background:#c0392b;color:white;box-shadow:0 1px 3px rgba(0,0,0,0.1); font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center;">+</button>
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