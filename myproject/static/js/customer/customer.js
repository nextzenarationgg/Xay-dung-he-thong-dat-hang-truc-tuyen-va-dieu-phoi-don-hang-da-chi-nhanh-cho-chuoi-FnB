'use strict';
/* ================= CUSTOMER MODULE ================= */
var dbOrders=[];
var cartSummary={count:0,subtotal:0};

function apiRequest(url,method,data){
  var options={method:method,credentials:'same-origin',headers:{Accept:'application/json'}};
  if(method!=='GET'){
    var csrf=$('#customer-logout-form input[name="csrfmiddlewaretoken"]');
    options.headers['X-CSRFToken']=csrf?csrf.value:'';
  }
  if(data!==undefined){
    options.headers['Content-Type']='application/json';
    options.body=JSON.stringify(data);
  }
  return fetch(url,options).then(function(response){
    return response.text().then(function(text){
      var payload={};
      if(text){
        try{payload=JSON.parse(text)}catch(error){
          throw new Error(response.ok?'Máy chủ trả về dữ liệu không đọc được.':'Máy chủ trả lỗi ('+response.status+').');
        }
      }
      if(!response.ok)throw new Error(payload.error||'Yêu cầu thất bại ('+response.status+').');
      return payload;
    });
  });
}

var cartQueue=Promise.resolve();
function cartRequest(url,method,data){
  var operation=cartQueue.then(function(){return apiRequest(url,method,data)});
  cartQueue=operation.then(function(){},function(){});
  return operation;
}
function syncCart(payload){
  S.cart=payload.items.map(function(item){return [item.product_code,item.quantity]});
  cartSummary.count=payload.count;
  cartSummary.subtotal=payload.subtotal;
  S.inote={};
  payload.items.forEach(function(item){if(item.note)S.inote[item.product_code]=item.note});
}
function applyCatalog(products){
  products.forEach(function(product){
    var dish=DM[product.code];
    if(dish){
      dish.n=product.name;
      dish.c=product.category;
      dish.p=product.price;
      dish.sub=product.description;
    }
  });
}
function reportApiError(error){toast(error.message||'Không thể kết nối máy chủ. Vui lòng thử lại.')}
function custNav(){
  var g={dish:'menu',cart:'cart',checkout:'cart'}[S.key]||S.key;
  var it=[['home','Trang chủ'],['menu','Thực đơn'],['orders','Đơn hàng của tôi'],['offers','Ưu đãi'],['account','Tài khoản']];
  var authenticated=isCustomerAuthenticated();
  if(!authenticated)it=it.filter(function(x){return x[0]!=='orders'&&x[0]!=='offers'});
  return '<nav class="cnav" aria-label="Điều hướng khách hàng">'+it.map(function(x){return '<button class="'+(g===x[0]?'on':'')+'" data-act="go" data-k="'+x[0]+'">'+x[1]+'</button>'}).join('')+(authenticated?'<button class="cartb'+(g==='cart'?' on':'')+'" data-act="go" data-k="cart">Giỏ hàng <span class="badge">'+cartSummary.count+'</span></button>':'')+'</nav>';
}

ACT.add=function(d){
  if(!isCustomerAuthenticated()){go('account');return}
  cartRequest('/api/cart/items/'+encodeURIComponent(d.id)+'/','POST',{quantity:1}).then(function(payload){syncCart(payload);toast('Đã thêm '+DM[d.id].n);render()}).catch(reportApiError);
};
ACT.inc=function(d){
  cartRequest('/api/cart/items/'+encodeURIComponent(d.id)+'/','POST',{quantity:1}).then(function(payload){syncCart(payload);render()}).catch(reportApiError);
};
ACT.dec=function(d){
  var line=S.cart.filter(function(i){return i[0]===d.id})[0];
  if(!line)return;
  var quantity=line[1]-1;
  var method=quantity<1?'DELETE':'PATCH';
  cartRequest('/api/cart/items/'+encodeURIComponent(d.id)+'/',method,quantity<1?undefined:{quantity:quantity}).then(function(payload){syncCart(payload);render()}).catch(reportApiError);
};
ACT.rm=function(d){
  cartRequest('/api/cart/items/'+encodeURIComponent(d.id)+'/','DELETE').then(function(payload){syncCart(payload);render()}).catch(reportApiError);
};
ACT.dish=function(d){go('dish',d.id)};
INP.addr=function(v){S.addr=v;render()};

/* ================= CUSTOMER: HOME ================= */
V.home={dj:['/','customer/home.html','HomeView.as_view()'],html:function(){
  var items=S.cart.length?S.cart:[['d1',1]];
  var res=evalBranches(items,S.addr),win=res.filter(function(r){return r.ok})[0];
  var near=BR.map(function(b){return {b:b,d:ADDR[S.addr].d[b.id]}}).sort(function(a,b){return a.d-b.d});
  var ring='<svg class="ring" viewBox="0 0 200 200" aria-hidden="true"><defs><path id="rp" d="M100 100m-90 0a90 90 0 1 1 180 0a90 90 0 1 1-180 0"/></defs><text><textPath href="#rp" textLength="556" lengthAdjust="spacing">MIÊU QUÁN · ĐÚNG BẾP · ĐÚNG GIỜ · ĐIỀU PHỐI THÔNG MINH · HÀ NỘI ·</textPath></text></svg>';
  var hero='<section class="hero"><div><div class="cap" style="margin-bottom:18px">Chuỗi bếp Hà Nội · 5 chi nhánh · Thứ Hai 12.10.2026</div>'+
   '<h1 class="hero-h"><span class="l1">Miêu Quán <b>–</b></span>Điều phối <span class="it u">thông minh,</span> đúng bếp phù hợp</h1>'+
   '<p class="lead" style="margin:22px 0 26px">Mỗi đơn được kiểm tra vùng giao, món còn hàng, tải bếp và thời gian chuẩn bị trong vài giây, rồi giao cho bếp phù hợp nhất với địa chỉ của bạn.</p>'+
   '<form class="searchbar" data-form="hsearch" role="search"><input id="hq" type="search" placeholder="Tìm cơm thố, nem nướng, mỳ cay, bún đậu…" aria-label="Tìm món"><button class="btn terra" type="submit" data-act="hsearch">Tìm món<span>&nbsp;→</span></button></form>'+
   '<div class="row" style="margin-top:16px">'+['Cơm thố','Nem nướng','Mỳ cay','Bún đậu'].map(function(t){return '<button class="chip" data-act="hchip" data-q="'+t+'">'+t+'</button>'}).join('')+'</div></div>'+
   '<div class="emb"><div class="disc"></div><div class="cat">'+cat()+'</div>'+ring+'<div class="stamp">Điều phối<br>đơn hàng siêu tốc</div></div></section>';
  var cats='<section class="sec"><div class="sech"><h2 class="h2">Chọn theo <span class="it">khẩu vị</span></h2><hr class="foil"></div><div class="catstrip">'+CATS.map(function(c){var first=D.filter(function(d){return d.c===c[0]})[0];return '<button data-act="hcat" data-c="'+c[0]+'"><div class="art">'+art(first.id)+'</div><div class="cl"><b>'+c[1]+'</b><span class="cap">'+D.filter(function(d){return d.c===c[0]}).length+' món</span></div></button>'}).join('')+'</div></section>';
  var nearH='<section class="sec"><div class="sech"><h2 class="h2">Chi nhánh <span class="it">gần bạn</span></h2><hr class="foil"></div><div class="bento"><div class="plate s5"><div class="fld"><label for="addrsel">Giao đến</label><select id="addrsel" class="in" data-in="addr">'+Object.keys(ADDR).map(function(k){return '<option value="'+k+'"'+(S.addr===k?' selected':'')+'>'+ADDR[k].l+' · '+ADDR[k].a+'</option>'}).join('')+'</select></div><p class="dim" style="margin-top:14px;font-size:13.5px">Khoảng cách tính theo đường đi từ chi nhánh đến địa chỉ giao. Hệ thống vẫn tự chọn bếp, danh sách này giúp bạn biết bếp nào đang gần.</p></div>'+
   '<div class="plate s7 flat"><div class="brlist">'+near.map(function(x){var b=x.b,p=liveLoad(b)/b.cap,st=!b.open?['Đóng cửa','mute']:(!b.accepting?['Tạm ngưng','warn']:(p*100>RULES.maxLoad?['Quá tải','bad']:['Đang mở','ok']));
    return '<div class="brl"><div class="km">'+dec(x.d)+'<span class="cap" style="display:block">km</span></div><div style="min-width:0"><b>Miêu Quán '+esc(b.n)+'</b><div class="dim" style="font-size:12.5px">'+esc(b.addr)+'</div><div class="meter '+loadCls(p)+'" style="margin-top:8px;max-width:240px"><i style="width:'+Math.round(p*100)+'%"></i></div></div><div class="tr">'+pill(st[0],st[1])+'<div class="mono dim" style="font-size:11px;margin-top:6px">'+b.hours+'</div></div></div>'}).join('')+'</div></div></div></section>';
  var feat='<section class="sec"><div class="sech"><h2 class="h2">Món <span class="it">nên thử</span></h2><hr class="foil"><button class="btn ghost sm" data-act="go" data-k="menu">Xem toàn bộ thực đơn →</button></div><div class="feat"><div class="big">'+dishCard(DM.d1)+'</div>'+['d3','d4','d6','d12'].map(function(i){return '<div>'+dishCard(DM[i])+'</div>'}).join('')+'</div></section>';
  var how='<section class="sec"><div class="sech"><h2 class="h2">Cách Miêu Quán <span class="it">chọn bếp</span></h2><hr class="foil"></div><div class="steps4">'+
   '<div><div class="num">1</div><h3 class="h3" style="margin:10px 0 6px">Lọc điều kiện</h3><p class="dim" style="font-size:13.5px">Chi nhánh phải đang mở, nằm trong vùng giao, đủ món bạn chọn và chưa quá tải.</p></div>'+
   '<div><div class="num">2</div><h3 class="h3" style="margin:10px 0 6px">Chấm điểm</h3><p class="dim" style="font-size:13.5px">Khoảng cách '+RULES.wd+', tải bếp '+RULES.wl+', thời gian chuẩn bị '+RULES.wp+'. Trọng số do quản trị chỉnh.</p></div>'+
   '<div><div class="num">3</div><h3 class="h3" style="margin:10px 0 6px">Chọn điểm cao nhất</h3><p class="dim" style="font-size:13.5px">Đơn được giao cho bếp xếp hạng đầu. Hòa điểm thì chọn bếp gần hơn.</p></div>'+
   '<div><div class="num">4</div><h3 class="h3" style="margin:10px 0 6px">Theo dõi</h3><p class="dim" style="font-size:13.5px">Bạn thấy bếp được chọn, thời gian chuẩn bị và từng bước giao hàng.</p></div></div>'+
   '<div class="plate" style="margin-top:22px"><div class="row" style="margin-bottom:12px"><div class="grow"><div class="cap">Mô phỏng điều kiện chi nhánh</div><b>'+esc(itemsText(items))+'</b> <span class="dim">· giao tới '+esc(ADDR[S.addr].l)+'</span><div class="mono dim" style="font-size:11.5px;margin-top:4px">Bản xem trước này chưa tham gia xử lý đơn hàng.</div></div><button class="btn sm" data-act="go" data-k="menu">Đổi món</button></div>'+gateMatrix(res)+'</div></section>';
  var foot='<footer class="foot"><span class="mono">MIÊU QUÁN · Hà Nội</span><span>Hotline 1900 5555 05</span><span>Dữ liệu và thanh toán trong bản mẫu này là mô phỏng.</span></footer>';
  return hero+cats+nearH+feat+how+foot;
}};
ACT.hsearch=function(){var i=$('#hq');S.q=i?i.value:'';S.cat='all';go('menu')};
ACT.hchip=function(d){S.q=d.q;S.cat='all';go('menu')};
ACT.hcat=function(d){S.cat=d.c;S.q='';go('menu')};
document.addEventListener('submit',function(e){var f=e.target.closest('[data-form]');if(!f)return;e.preventDefault();var n=f.dataset.form;if(n==='hsearch')ACT.hsearch()});

/* ================= CUSTOMER: MENU ================= */
function filtered(){
  var q=fold(S.q.trim());
  var l=D.filter(function(d){return (S.cat==='all'||d.c===S.cat)&&!S.catHide[d.c]&&(!q||fold(d.n+' '+d.sub+' '+CATN[d.c]).indexOf(q)>-1)&&(!S.maxP||d.p<=S.maxP*1000)&&(!S.onlyAvail||dishBranches(d.id)>0)});
  l.sort(function(a,b){return S.sort==='asc'?a.p-b.p:(S.sort==='desc'?b.p-a.p:a.pop-b.pop)});
  return l;
}
function miniCart(){
  return '<aside class="mcart plate" aria-label="Giỏ hàng"><div class="row" style="margin-bottom:6px"><b class="h3">Giỏ hàng</b><span class="badge right">'+cartSummary.count+'</span></div>'+
  (S.cart.length?S.cart.map(function(i){var d=DM[i[0]];return '<div class="ml"><span>'+esc(d.n)+'</span><b class="mono nw">'+money(d.p*i[1])+'</b><div class="q"><button data-act="dec" data-id="'+d.id+'" aria-label="Giảm">−</button><span>'+i[1]+'</span><button data-act="inc" data-id="'+d.id+'" aria-label="Tăng">+</button></div></div>'}).join('')+
   '<div class="tot" style="margin-top:8px"><span class="dim">Tạm tính</span><b class="mono">'+money(cartSummary.subtotal)+'</b></div><div class="mono dim" style="font-size:11.5px;margin-bottom:12px">Phí giao và ưu đãi được máy chủ tính khi đặt hàng</div><button class="btn terra blk" data-act="go" data-k="cart">Xem giỏ hàng →</button>':'<div class="empty" style="margin-top:10px">Chưa có món nào. Chọn món bên trái để bắt đầu.</div>')+'</aside>';
}
V.menu={dj:['/thuc-don/','customer/menu.html','MenuListView'],html:function(){
  var l=filtered(),cnt={all:D.length};CATS.forEach(function(c){cnt[c[0]]=D.filter(function(d){return d.c===c[0]}).length});
  var rail='<div class="rail"><div class="fld"><label for="mq">Tìm món</label><input id="mq" class="in" type="search" data-in="q" value="'+esc(S.q)+'" placeholder="Ví dụ: com tho, mi cay…"></div>'+
   '<div class="cats">'+[['all','Tất cả']].concat(CATS).map(function(c){return '<button class="'+(S.cat===c[0]?'on':'')+'" data-act="mcat" data-c="'+c[0]+'"><span>'+c[1]+'</span><span class="mono dim">'+cnt[c[0]]+'</span></button>'}).join('')+'</div>'+
   '<div class="row" style="justify-content:space-between"><span style="font-size:13.5px;font-weight:600">Chỉ món còn hàng</span><button class="sw'+(S.onlyAvail?' on':'')+'" data-act="monly" aria-pressed="'+S.onlyAvail+'" aria-label="Chỉ món còn hàng"></button></div>'+
   '<div class="fld"><label for="mp">Giá</label><select id="mp" class="in" data-in="maxp"><option value="0">Mọi mức giá</option>'+[40,60,80].map(function(v){return '<option value="'+v+'"'+(S.maxP===v?' selected':'')+'>Đến '+v+'.000đ</option>'}).join('')+'</select></div>'+
   '<div class="fld"><label for="ms">Sắp xếp</label><select id="ms" class="in" data-in="sort">'+[['pop','Bán chạy nhất'],['asc','Giá tăng dần'],['desc','Giá giảm dần']].map(function(o){return '<option value="'+o[0]+'"'+(S.sort===o[0]?' selected':'')+'>'+o[1]+'</option>'}).join('')+'</select></div></div>';
  return ph('Thực đơn · '+l.length+' món','Chọn món, <span class="it">bếp để chúng tôi lo</span>')+
   '<div class="mg">'+rail+'<section>'+(l.length?'<div class="dgrid">'+l.map(dishCard).join('')+'</div>':'<div class="empty">Không có món khớp bộ lọc. Thử bỏ bớt bộ lọc hoặc đổi từ khóa.</div>')+'</section>'+miniCart()+'</div>'+
   (S.cart.length?'<div class="mbar"><div class="grow"><div class="cap" style="color:inherit;opacity:.7">'+cartSummary.count+' món</div><b class="num" style="font-size:22px">'+money(cartSummary.subtotal)+'</b></div><button class="btn terra" data-act="go" data-k="cart">Xem giỏ hàng →</button></div>':'');
}};
INP.q=function(v){S.q=v;render()};
INP.maxp=function(v){S.maxP=+v;render()};
INP.sort=function(v){S.sort=v;render()};
ACT.mcat=function(d){S.cat=d.c;render()};
ACT.monly=function(){S.onlyAvail=!S.onlyAvail;render()};

/* ================= CUSTOMER: DISH ================= */
V.dish={dj:['/thuc-don/<slug:dish>/','customer/dish_detail.html','DishDetailView'],html:function(){
  var d=DM[S.par]||D[0],n=dishBranches(d.id),off=n===0;
  var rel=D.filter(function(x){return x.c!==d.c}).sort(function(a,b){return a.pop-b.pop}).slice(0,3);
  return '<div class="row" style="margin-bottom:18px"><button class="btn ghost sm" data-act="go" data-k="menu">← Thực đơn</button><span class="cap">'+CATN[d.c]+'</span></div>'+
  '<div class="dd"><div class="art">'+art(d.id)+(d.tag?'<span class="tagc pill terra solid"><span>'+d.tag+'</span></span>':'')+'</div>'+
  '<div class="col" style="gap:18px"><div><div class="cap">Món '+CATN[d.c].toLowerCase()+' · ảnh minh họa</div><h1 class="h1" style="margin-top:8px">'+esc(d.n)+'</h1></div>'+
  '<div class="row"><span class="num" style="font-size:40px">'+money(d.p)+'</span>'+(off?pill('Tạm hết','bad'):pill('Còn tại '+n+'/5 chi nhánh','ok'))+'</div>'+
  '<p class="lead">'+esc(d.desc)+'</p>'+
  '<div class="row mono dim" style="font-size:12.5px"><span>Chuẩn bị khoảng '+d.t+' phút</span><span>·</span><span>Bếp được chọn tự động khi đặt hàng</span></div><hr class="rule">'+
  (d.c==='my'?'<div class="fld"><label>Cấp độ cay</label><div class="spice">'+[0,1,2,3,4,5,6,7].map(function(i){return '<button class="'+(S.spice===i?'on':'')+'" data-act="spice" data-i="'+i+'">'+i+'</button>'}).join('')+'</div></div>':'')+
  '<div class="fld"><label for="dn">Ghi chú cho bếp</label><textarea id="dn" class="in" data-in="dnote" placeholder="Ví dụ: ít hành, không rau mùi">'+esc(S.dnote)+'</textarea></div>'+
  '<div class="row"><div class="q"><button data-act="dq" data-v="-1" aria-label="Giảm">−</button><span>'+S.dq+'</span><button data-act="dq" data-v="1" aria-label="Tăng">+</button></div><button class="btn terra grow" data-act="addq" data-id="'+d.id+'"'+(off?' disabled':'')+'>Thêm vào giỏ · '+money(d.p*S.dq)+'</button></div></div></div>'+
  '<section class="sec"><div class="sech"><h2 class="h2">Thường gọi <span class="it">kèm</span></h2><hr class="foil"></div><div class="dgrid" style="max-width:760px">'+rel.map(dishCard).join('')+'</div></section>';
}};
INP.dnote=function(v){S.dnote=v};
ACT.spice=function(d){S.spice=+d.i;render()};
ACT.dq=function(d){S.dq=clamp(S.dq+ +d.v,1,20);render()};
ACT.addq=function(d){if(!isCustomerAuthenticated()){go('account');return}var x=DM[d.id];
  var note=x.c==='my'?'Cấp độ cay '+S.spice+(S.dnote?' · '+S.dnote:''):S.dnote;
  cartRequest('/api/cart/items/'+encodeURIComponent(d.id)+'/','POST',{quantity:S.dq,note:note}).then(function(payload){
    syncCart(payload);toast('Đã thêm '+S.dq+' × '+x.n);S.dq=1;render();
  }).catch(reportApiError)};
S.inote={};

/* ================= CUSTOMER: CART ================= */
S.vin='';
function applyV(code){
  code=String(code||'').trim().toUpperCase();
  S.voucher=code||null;S.vin='';
  toast(code?'Mã sẽ được máy chủ kiểm tra khi đặt hàng.':'Đã bỏ mã giảm giá');
  render();
}
V.cart={dj:['/gio-hang/','customer/cart.html','CartView'],html:function(){
  if(!S.cart.length)return ph('Giỏ hàng','Giỏ hàng <span class="it">đang trống</span>')+'<div class="empty">Bạn chưa chọn món nào.<br><br><button class="btn terra" data-act="go" data-k="menu">Chọn món →</button></div>';
  var lines=S.cart.map(function(i){var d=DM[i[0]];return '<div class="cl2"><div class="art">'+art(d.id)+'</div><div style="min-width:0"><b>'+esc(d.n)+'</b><div class="dim" style="font-size:12.5px">'+money(d.p)+' / phần'+(S.inote[d.id]?' · '+esc(S.inote[d.id]):'')+'</div></div><div class="q"><button data-act="dec" data-id="'+d.id+'" aria-label="Giảm">−</button><span>'+i[1]+'</span><button data-act="inc" data-id="'+d.id+'" aria-label="Tăng">+</button></div><b class="mono nw">'+money(d.p*i[1])+'</b><button class="chip" data-act="rm" data-id="'+d.id+'">Xóa</button></div>'}).join('');
  var vl=S.voucher&&VC[S.voucher];
  return ph('Giỏ hàng · '+cartSummary.count+' món','Kiểm tra lại <span class="it">trước khi đặt</span>')+
  '<div class="two"><section>'+lines+'<div class="row" style="margin-top:18px"><button class="btn ghost sm" data-act="go" data-k="menu">← Chọn thêm món</button></div></section>'+
  '<aside class="plate"><div class="fld"><label for="vc">Mã giảm giá</label><div class="row" style="flex-wrap:nowrap"><input id="vc" class="in" data-in="vin" value="'+esc(S.vin)+'" placeholder="Nhập mã, ví dụ MIEU10"><button class="btn" data-act="applyv">Áp dụng</button></div></div>'+
  '<div class="row" style="margin:10px 0 14px">'+Object.keys(VC).map(function(k){return '<button class="chip'+(S.voucher===k?' on':'')+'" data-act="usev" data-c="'+k+'">'+k+'</button>'}).join('')+'</div>'+
  (vl?'<div class="mono dim" style="font-size:12px;margin-bottom:10px">'+esc(vl.d)+'<br>Mã được máy chủ kiểm tra khi đặt hàng.</div>':(S.voucher?'<div class="mono dim" style="font-size:12px;margin-bottom:10px">Mã '+esc(S.voucher)+' sẽ được máy chủ kiểm tra khi đặt hàng.</div>':''))+
  '<div class="tot"><span class="dim">Tạm tính</span><b class="mono">'+money(cartSummary.subtotal)+'</b></div>'+
  '<p class="mono dim" style="font-size:11.5px;margin:10px 0 16px">Phí giao, ưu đãi và tổng tiền được máy chủ tính khi tạo đơn.</p><button class="btn terra blk" data-act="go" data-k="checkout">Tiến hành thanh toán →</button></aside></div>';
}};
INP.vin=function(v){S.vin=v};
ACT.applyv=function(){applyV(S.vin||($('#vc')&&$('#vc').value))};
ACT.usev=function(d){applyV(d.c)};

/* ================= CUSTOMER: CHECKOUT ================= */
V.checkout={dj:['/dat-hang/','customer/checkout.html','POST /api/orders/'],html:function(){
  if(!S.cart.length)return V.cart.html();
  if(!S.co)S.co={};
  if(S.co.address===undefined)S.co.address='';
  if(S.co.searchQuery===undefined)S.co.searchQuery='';
  if(S.co.suggestions===undefined)S.co.suggestions=[];

  var pay=[['cod','Tiền mặt','Trả khi nhận hàng'],['qr','Chuyển khoản QR','Mô phỏng, không trừ tiền thật'],['momo','Ví MoMo','Mô phỏng, không trừ tiền thật'],['card','Thẻ ngân hàng','Mô phỏng, không trừ tiền thật']].map(function(p){return '<button class="'+(S.co.pay===p[0]?'on':'')+'" data-act="cpay" data-p2="'+p[0]+'"><b>'+p[1]+'</b><span>'+p[2]+'</span></button>'}).join('');

  return ph('Xác nhận đơn hàng','Giao tới <span class="it">đâu?</span>')+
  '<div class="two"><section class="col" style="gap:26px">'+
  '<div><div class="cap" style="margin-bottom:10px">Người nhận</div><div class="f2"><div class="fld"><label for="cn">Họ và tên</label><input id="cn" class="in" data-in="co_name" value="'+esc(S.co.name)+'" autocomplete="name"></div><div class="fld"><label for="cp">Số điện thoại</label><input id="cp" class="in" data-in="co_phone" value="'+esc(S.co.phone)+'" inputmode="tel" autocomplete="tel"></div></div></div>'+

  '<div><div class="cap" style="margin-bottom:10px">Địa chỉ giao hàng <span style="color:#c0392b">*</span></div>'+
    '<div style="position:relative">'+
      '<span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#999;pointer-events:none;font-size:15px">🔍</span>'+
      '<input id="addr-search" class="in" placeholder="Nhập địa chỉ, ví dụ: 12 Phố Huế, Hà Nội" autocomplete="off" style="padding-left:38px" value="'+esc(S.co.searchQuery||'')+'">'+
      '<span id="addr-search-loading" style="display:none;position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:11px;color:#999">Đang tìm...</span>'+
      '<div id="addr-suggestions" style="display:none;position:absolute;top:100%;left:0;right:0;background:#fff;border:1px solid rgba(0,0,0,.12);border-radius:8px;margin-top:4px;z-index:2000;max-height:340px;overflow-y:auto;box-shadow:0 4px 16px rgba(0,0,0,.08)"></div>'+
    '</div>'+
    '<div id="addr-display" style="margin-top:10px;padding:10px 12px;background:#f0f9f0;border:1px solid #c8e6c8;border-radius:8px;font-size:13.5px;'+(S.co.address?'':'display:none')+'">'+
      '<div style="display:flex;align-items:flex-start;gap:8px">'+
        '<span style="color:#2e7d32;font-size:16px;flex:none">✓</span>'+
        '<div style="flex:1;min-width:0">'+
          '<div style="font-weight:600;color:#1b5e20;font-size:12px;margin-bottom:2px">Địa chỉ giao hàng</div>'+
          '<div id="checkout-address" style="color:#333">'+esc(S.co.address||'')+'</div>'+
        '</div>'+
      '</div>'+
    '</div>'+
    '<div class="row" style="margin:12px 0 8px;gap:8px;flex-wrap:wrap">'+
      '<span class="dim" style="font-size:12.5px;flex:1;min-width:180px">Hoặc click lên bản đồ / kéo ghim để chọn vị trí chính xác.</span>'+
      '<button class="chip" type="button" data-act="usemylocation">📌 Vị trí hiện tại</button>'+
    '</div>'+
    '<div id="checkout-map" style="height:340px;border-radius:12px;overflow:hidden;border:1px solid rgba(0,0,0,.12);position:relative;z-index:1"></div>'+
  '</div>'+

  '<div class="fld"><label for="cnote">Ghi chú cho đơn</label><textarea id="cnote" class="in" data-in="co_note" placeholder="Ví dụ: gọi trước khi đến, để hàng ở bảo vệ">'+esc(S.co.note)+'</textarea></div>'+
  '<div><div class="cap" style="margin-bottom:10px">Phương thức thanh toán</div><div class="pay">'+pay+'</div></div></section>'+
  '<aside class="col"><div class="plate"><div class="cap" style="margin-bottom:8px">Đơn của bạn</div>'+S.cart.map(function(i){return '<div class="il"><span>'+esc(DM[i[0]].n)+' <span class="dim">× '+i[1]+'</span></span><b class="mono">'+money(DM[i[0]].p*i[1])+'</b></div>'}).join('')+
  '<div class="tot" style="margin-top:8px"><span class="dim">Tạm tính</span><b class="mono">'+money(cartSummary.subtotal)+'</b></div><p class="mono dim" style="font-size:11.5px;margin-top:10px">Phí giao, ưu đãi và tổng tiền sẽ do máy chủ xác nhận.</p></div>'+
  '<button class="btn terra blk" data-act="place" style="padding:16px">Xác nhận đặt hàng →</button>'+
  '</aside></div>';
}};
INP.co_name=function(v){S.co.name=v};
INP.co_phone=function(v){S.co.phone=v};
INP.co_note=function(v){S.co.note=v};
ACT.cpay=function(d){S.co.pay=d.p2;render()};

/* --- Bind search input --- */
document.addEventListener('input',function(e){
  if(e.target&&e.target.id==='addr-search'){
    _onAddrSearchInput(e.target.value);
  }
});
document.addEventListener('keydown',function(e){
  if(e.target&&e.target.id==='addr-search'){
    if(e.key==='Enter'&&S.co&&S.co.suggestions&&S.co.suggestions.length>0){
      e.preventDefault();
      ACT.mapsugg({i:0});
    }else if(e.key==='Escape'){
      if(S.co){S.co.suggestions=[];_renderSuggestions();}
    }
  }
});
document.addEventListener('click',function(e){
  if(!e.target.closest('#addr-search')&&!e.target.closest('#addr-suggestions')){
    if(S.co&&S.co.suggestions&&S.co.suggestions.length>0){
      S.co.suggestions=[];
      _renderSuggestions();
    }
  }
});

/* --- GoGoDuk: Suggest + Resolve --- */
var _gogodukCache = {};

function _onAddrSearchInput(v){
  if(!S.co)S.co={};
  S.co.searchQuery=v;
  if(S._addrSearchTimeout)clearTimeout(S._addrSearchTimeout);
  if(!v||v.trim().length<2){
    S.co.suggestions=[];
    _updateSearchLoading(false);
    _renderSuggestions();
    return;
  }
  _updateSearchLoading(true);
  var query=v.trim();
  S._addrSearchTimeout=setTimeout(function(){_searchAddressGogoDuk(query)},350);
}

function _updateSearchLoading(loading){
  var el=document.getElementById('addr-search-loading');
  if(el)el.style.display=loading?'inline':'none';
}

function _renderSuggestions(){
  var container=document.getElementById('addr-suggestions');
  if(!container)return;
  if(!S.co||!S.co.suggestions||!S.co.suggestions.length){
    container.style.display='none';
    container.innerHTML='';
    return;
  }
  container.innerHTML=S.co.suggestions.map(function(s,i){
    return '<div data-act="mapsugg" data-i="'+i+'" style="padding:12px 14px;border-bottom:1px solid rgba(0,0,0,.06);cursor:pointer;font-size:13.5px;transition:background .12s" onmouseover="this.style.background=\'#f5f5f5\'" onmouseout="this.style.background=\'\'">'+
        '<div style="display:flex;gap:8px;align-items:flex-start">'+
          '<span style="color:#c0392b;font-size:14px;flex:none;margin-top:1px">📍</span>'+
          '<div style="flex:1;min-width:0">'+
            '<div style="font-weight:600;color:#222;line-height:1.3">'+esc(s.title)+'</div>'+
            (s.subtitle?'<div style="font-size:12px;color:#888;margin-top:3px;line-height:1.3">'+esc(s.subtitle)+'</div>':'')+
          '</div>'+
        '</div>'+
      '</div>';
  }).join('');
  container.style.display='block';
}

function _searchAddressGogoDuk(query){
  var url = '/api/gogoduk/suggest/?input=' + encodeURIComponent(query);
  fetch(url, { credentials: 'same-origin' })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (!S.co || S.co.searchQuery !== query) return;
      var rawPreds = data.predictions || (data.result && data.result.predictions) || [];
      var predictions = rawPreds.map(function (p) {
        return {
          placeId: p.placeId,
          title: p.mainText || p.text,
          subtitle: p.secondaryText || '',
          fullAddress: p.text,
          lat: null,
          lng: null
        };
      });
      S.co.suggestions = predictions;
      _updateSearchLoading(false);
      _renderSuggestions();
      if (predictions.length === 0) {
        toast('Không tìm thấy địa chỉ. Thử nhập tên đường hoặc quận.');
      }
    })
    .catch(function (err) {
      console.error('[GoGoDuk suggest] error:', err);
      if (!S.co || S.co.searchQuery !== query) return;
      S.co.suggestions = [];
      _updateSearchLoading(false);
      _renderSuggestions();
      toast('Lỗi kết nối dịch vụ địa chỉ. Vui lòng chọn trên bản đồ.');
    });
}

function _resolvePlace(placeId) {
  if (_gogodukCache[placeId]) return Promise.resolve(_gogodukCache[placeId]);
  var url = '/api/gogoduk/resolve/?id=' + encodeURIComponent(placeId);
  return fetch(url, { credentials: 'same-origin' })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var result = data.result || data.data || data;
      var coords = {
        lat: result.lat || result.latitude,
        lon: result.lon || result.lng || result.longitude,
        address: result.address || result.name || ''
      };
      if (coords.lat != null && coords.lon != null) {
        _gogodukCache[placeId] = coords;
      }
      return coords;
    });
}

/* Hàm reverse geocode chuẩn xác (dùng BigDataCloud để không bao giờ lỗi) */
function _reverseGeocode(lat, lng) {
  var key = lat.toFixed(4) + ',' + lng.toFixed(4);
  if (_gogodukCache[key]) return Promise.resolve(_gogodukCache[key]);

  // BigDataCloud: Miễn phí, không cần API key, tốc độ nhanh, hỗ trợ tiếng Việt
  var bdcUrl = 'https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' + lat + '&longitude=' + lng + '&localityLanguage=vi';
  
  return fetch(bdcUrl)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var parts = [];
      if (data.locality) parts.push(data.locality);
      if (data.city && data.city !== data.locality) parts.push(data.city);
      if (data.principalSubdivision && data.principalSubdivision !== data.city) parts.push(data.principalSubdivision);
      
      if (parts.length === 0) throw new Error('no bdc address');
      
      var addr = parts.join(', ');
      _gogodukCache[key] = addr;
      return addr;
    })
    .catch(function () {
      // Dự phòng nếu BDC lỗi: Gọi qua proxy Nominatim của Django
      return fetch('/api/nominatim/reverse/?lat=' + lat + '&lon=' + lng, { credentials: 'same-origin' })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data && data.display_name) {
             _gogodukCache[key] = data.display_name;
             return data.display_name;
          }
          throw new Error('no nominatim address');
        })
        .catch(function () { return null; });
    });
}

ACT.mapsugg=function(d){
  if(!S.co||!S.co.suggestions)return;
  var s=S.co.suggestions[+d.i];
  if(!s)return;
  
  if(s.lat!=null&&s.lng!=null){
    _applySuggestion(s);
    return;
  }

  _updateSearchLoading(true);
  _resolvePlace(s.placeId)
    .then(function(coords){
      if(!coords||coords.lat==null){
        toast('Không lấy được tọa độ. Vui lòng chọn trên bản đồ.');
        _updateSearchLoading(false);
        return;
      }
      s.lat=coords.lat;
      s.lng=coords.lon;
      s.fullAddress=coords.address||s.fullAddress;
      _applySuggestion(s);
      _updateSearchLoading(false);
    })
    .catch(function(){
      toast('Lỗi khi lấy tọa độ. Vui lòng chọn trên bản đồ.');
      _updateSearchLoading(false);
    });
};

function _applySuggestion(s){
  S.co.lat=s.lat;
  S.co.lng=s.lng;
  S.co.address=s.fullAddress;
  S.co.searchQuery=s.title;
  S.co.suggestions=[];
  if(checkoutMapInstance){
    checkoutMapInstance.setView([s.lat,s.lng],16);
    _ensureMarker(s.lat,s.lng);
    setTimeout(function(){checkoutMapInstance.invalidateSize();},150);
  }
  render();
}

function _updateAddressSpan(addr){
  S.co.address=addr;
  var wrapper=document.getElementById('addr-display');
  if(wrapper)wrapper.style.display='block';
  var el=document.getElementById('checkout-address');
  if(el)el.textContent=addr;
}

/* --- Nút Vị trí hiện tại --- */
ACT.usemylocation=function(){
  if(!navigator.geolocation){toast('Trình duyệt không hỗ trợ định vị');return}

  if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    toast('Tính năng định vị chỉ hoạt động trên HTTPS hoặc localhost');
    return;
  }

  toast('Đang lấy vị trí...');
  _updateAddressSpan('Đang xác định địa chỉ...');
  var inputEl = document.getElementById('addr-search');
  if (inputEl) inputEl.value = 'Đang lấy vị trí...';

  navigator.geolocation.getCurrentPosition(function(pos){
    var lat=pos.coords.latitude, lng=pos.coords.longitude;
    if(lat<8||lat>24||lng<102||lng>110){
      toast('Vị trí hiện tại nằm ngoài Việt Nam');
      _updateAddressSpan('');
      if (inputEl) inputEl.value = '';
      return;
    }
    S.co.lat=lat; S.co.lng=lng;
    
    if(checkoutMapInstance){
      checkoutMapInstance.setView([lat,lng],16);
      _ensureMarker(lat,lng);
      setTimeout(function(){ checkoutMapInstance.invalidateSize(); }, 150);
    }
    
    _updateAddressSpan('Đang tìm địa chỉ cho vị trí này...');
    if (inputEl) inputEl.value = 'Đang tìm địa chỉ...';
    
    _reverseGeocode(lat,lng).then(function(addr){
      var finalAddr = addr || 'Vị trí trên bản đồ';
      
      S.co.address = finalAddr;
      S.co.searchQuery = finalAddr;
      
      _updateAddressSpan(finalAddr);
      if (inputEl) inputEl.value = finalAddr;
      
      toast('Đã chọn vị trí hiện tại');
    }).catch(function(){
      var fallbackAddr = 'Vị trí trên bản đồ';
      S.co.address = fallbackAddr;
      S.co.searchQuery = fallbackAddr;
      _updateAddressSpan(fallbackAddr);
      if (inputEl) inputEl.value = fallbackAddr;
    });
  }, function(err){
    var msg = 'Không lấy được vị trí.';
    if(err.code === 1) msg = 'Bạn đã từ chối quyền truy cập vị trí.';
    else if(err.code === 2) msg = 'Không thể xác định vị trí.';
    else if(err.code === 3) msg = 'Hết thời gian chờ.';
    toast(msg);
    _updateAddressSpan('');
    if (inputEl) inputEl.value = '';
  }, {enableHighAccuracy:true, timeout:15000, maximumAge:0});
};

ACT.place=function(){
  if(!S.co.name.trim()){toast('Vui lòng nhập họ và tên người nhận');return}
  if(!/^0\d{9,10}$/.test(S.co.phone.replace(/\s/g,''))){toast('Số điện thoại chưa đúng, cần 10 hoặc 11 chữ số bắt đầu bằng 0');return}
  if(!S.cart.length){toast('Giỏ hàng đang trống');return}
  if(!S.co.address||!S.co.address.trim()){toast('Vui lòng nhập hoặc chọn địa chỉ giao hàng');return}
  if(S.co.lat==null||S.co.lng==null){toast('Vui lòng chọn vị trí giao hàng trên bản đồ');return}
  apiRequest('/api/orders/','POST',{
    recipient_name:S.co.name,recipient_phone:S.co.phone,
    delivery_address:S.co.address,delivery_lat:S.co.lat,delivery_lng:S.co.lng,
    note:S.co.note,payment_method:S.co.pay,voucher_code:S.voucher||''
  }).then(function(payload){
    dbOrders.unshift(payload.order);
    S.cart=[];cartSummary={count:0,subtotal:0};S.voucher=null;S.inote={};
    S.co.address='';S.co.searchQuery='';S.co.suggestions=[];
    S.co.lat=null;S.co.lng=null;
    var branchMsg=payload.order.branch_name?(' · Bếp: '+payload.order.branch_name):' · Đơn vào hàng chờ (ngoài bán kính 10km)';
    toast('Đã tạo đơn hàng '+payload.order.code+branchMsg);
    go('orders');
  }).catch(reportApiError);
};

/* ================= CUSTOMER: ORDERS ================= */
function myOrders(){return orders.filter(function(o){return o.cust==='Nguyễn Minh Khôi'})}
V.orders={dj:['/don-hang/','customer/order_list.html','OrderListView'],html:function(){
  var content=dbOrders.length?'<div class="col" style="gap:18px">'+dbOrders.map(function(order){
    var lines=order.items.map(function(item){return esc(item.name)+' × '+item.quantity+(item.note?' · '+esc(item.note):'')}).join(', ');
    var statusClass=order.status==='completed'?'ok':'terra';
    return '<article class="plate"><div class="row" style="align-items:flex-start"><div class="grow" style="min-width:200px"><div class="row" style="gap:10px"><b class="num" style="font-size:22px">'+esc(order.code)+'</b>'+pill(esc(order.status_label),statusClass)+'</div><div class="mono dim" style="font-size:12px;margin:6px 0 10px">'+esc(new Date(order.created_at).toLocaleString('vi-VN'))+'</div><div style="font-size:14px">'+lines+'</div><div class="dim" style="font-size:13px;margin-top:8px">'+esc(order.delivery_address)+'</div></div><div class="tr"><div class="num" style="font-size:26px">'+money(order.total)+'</div><div class="mono dim" style="font-size:12px;margin-top:4px">'+esc(order.payment_method_label)+'</div></div></div><div class="mono dim" style="font-size:12px;margin-top:12px">Phí giao '+money(order.delivery_fee)+' · Giảm '+money(order.discount)+' · Trạng thái thanh toán: chưa xử lý</div></article>';
  }).join('')+'</div>':'<div class="empty">Bạn chưa có đơn hàng nào.<br><br><button class="btn terra" data-act="go" data-k="menu">Chọn món →</button></div>';
  return ph('Lịch sử · '+dbOrders.length+' đơn','Đơn hàng <span class="it">của tôi</span>')+content;
}};
ACT.torev=function(d){S.accTab='reviews';S.rv.no=d.no;go('account')};

/* ================= CUSTOMER: OFFERS ================= */
function voucherCard(k){
  var v=VC[k],on=S.voucher===k;
  return '<div class="vch"><div class="l"><div class="code">'+k+'</div><p style="margin:8px 0 6px">'+esc(v.d)+'</p><span class="cap">Hạn dùng '+v.exp+'</span></div><div class="r"><button class="btn'+(on?' ghost':' terra')+' sm blk" data-act="usev2" data-c="'+k+'">'+(on?'Đang chọn':'Dùng mã')+'</button><button class="btn ghost sm blk" data-act="copyv" data-c="'+k+'">Sao chép</button></div></div>';
}
V.offers={dj:['/uu-dai/','customer/offers.html','OfferListView'],html:function(){
  return ph('Ưu đãi · '+Object.keys(VC).length+' mã khả dụng','Mã giảm giá <span class="it">dành cho bạn</span>')+
  '<div class="bento" style="margin-bottom:28px"><div class="plate terra s7"><div class="cap">Đang diễn ra</div><h2 class="h2" style="margin:8px 0">Miễn phí giao cho đơn từ 120.000đ</h2><p style="opacity:.9;max-width:50ch">Áp dụng với mọi chi nhánh, tới hết 15.11.2026. Dùng mã FREESHIP ở giỏ hàng.</p></div><div class="plate s5"><div class="cap">Điểm tích lũy</div><div class="num" style="font-size:54px;margin:8px 0">1.280</div><div class="meter terra"><i style="width:64%"></i></div><p class="mono dim" style="font-size:12px;margin-top:8px">Còn 720 điểm để lên hạng Mèo Vàng</p></div></div>'+
  '<div class="bento">'+Object.keys(VC).map(function(k){return '<div class="s6">'+voucherCard(k)+'</div>'}).join('')+'</div>';
}};
ACT.usev2=function(d){S.voucher=d.c;toast('Đã chọn mã '+d.c+', sẽ áp dụng ở giỏ hàng');render()};
ACT.copyv=function(d){try{navigator.clipboard.writeText(d.c).then(function(){toast('Đã sao chép '+d.c)},function(){toast('Mã của bạn: '+d.c)})}catch(e){toast('Mã của bạn: '+d.c)}};

/* ================= CUSTOMER: ACCOUNT ================= */
V.account={dj:['/tai-khoan/','customer/account.html','AccountView (tabs: ?tab=profile|addresses|reviews|codes)'],html:function(){
  var tabs=[['profile','Hồ sơ'],['addr','Địa chỉ đã lưu'],['reviews','Đánh giá'],['codes','Mã giảm giá']];
  var body='';
  if(S.accTab==='profile'){
    body='<div class="bento"><div class="plate s7"><div class="f2"><div class="fld"><label for="pn">Họ và tên</label><input id="pn" class="in" value="'+esc(S.co.name)+'" data-in="co_name"></div><div class="fld"><label for="pp">Số điện thoại</label><input id="pp" class="in" value="'+esc(S.co.phone)+'" data-in="co_phone"></div><div class="fld" style="grid-column:1/-1"><label for="pe">Email</label><input id="pe" class="in" value="'+esc(S.co.email)+'"></div></div><div class="row" style="margin-top:18px;justify-content:space-between"><button class="btn terra" data-act="saveprof">Lưu thay đổi</button><button class="btn terra" type="submit" form="customer-logout-form">Đăng xuất</button></div></div>'+
     '<div class="plate ink s5"><div class="cap">Hạng thành viên</div><div class="num" style="font-size:44px;margin:8px 0">Mèo Bạc</div><p style="opacity:.8;font-size:13.5px">14 đơn đã hoàn thành · 1.280 điểm. Mỗi 1.000đ chi tiêu được 1 điểm.</p></div></div>';
  }else if(S.accTab==='addr'){
    body='<div class="bento"><div class="s7 col">'+S.saved.map(function(k){var a=ADDR[k];return '<div class="plate"><div class="row"><div class="grow"><b>'+esc(a.l)+'</b> '+(S.defAddr===k?pill('Mặc định','terra'):'')+'<div class="dim" style="font-size:13.5px;margin-top:4px">'+esc(a.a)+'</div></div><div class="acts"><button class="btn sm ghost" data-act="defaddr" data-k2="'+k+'"'+(S.defAddr===k?' disabled':'')+'>Đặt mặc định</button><button class="btn sm ghost" data-act="rmaddr" data-k2="'+k+'"'+(S.defAddr===k?' disabled':'')+'>Xóa</button></div></div></div>'}).join('')+'</div>'+
     '<div class="plate s5"><div class="cap" style="margin-bottom:12px">Thêm địa chỉ</div><div class="col"><div class="fld"><label for="nl">Tên gọi</label><input id="nl" class="in" placeholder="Ví dụ: Nhà ngoại"></div><div class="fld"><label for="ns">Số nhà, tên đường</label><input id="ns" class="in" placeholder="Ví dụ: Số 5, ngõ 12 Lê Thanh Nghị"></div><div class="fld"><label for="na">Khu vực</label><select id="na" class="in">'+Object.keys(ADDR).slice(0,5).map(function(k){return '<option value="'+k+'">'+esc(ADDR[k].a.split(', ').slice(-2)[0])+'</option>'}).join('')+'</select></div><button class="btn terra" data-act="addaddr">Lưu địa chỉ</button></div></div></div>';
  }else if(S.accTab==='reviews'){
    var done=myOrders().filter(function(o){return o.st===5});
    body='<div class="bento"><div class="s7 col">'+S.reviews.map(function(r){return '<div class="plate"><div class="row"><b>'+esc(r.dish)+'</b><span class="stars">'+'★'.repeat(r.star)+'<span style="opacity:.3">'+'★'.repeat(5-r.star)+'</span></span><span class="mono dim right" style="font-size:12px">'+r.date+'</span></div><p style="margin-top:8px">'+esc(r.text)+'</p><div class="mono dim" style="font-size:11.5px;margin-top:8px">Đơn '+r.no+'</div></div>'}).join('')+'</div>'+
     '<div class="plate s5"><div class="cap" style="margin-bottom:12px">Viết đánh giá</div><div class="col"><div class="fld"><label for="rn">Đơn đã hoàn thành</label><select id="rn" class="in" data-in="rv_no">'+done.map(function(o){return '<option value="'+o.no+'"'+(S.rv.no===o.no?' selected':'')+'>'+o.no+' · '+esc(DM[o.items[0][0]].n)+'</option>'}).join('')+'</select></div><div class="fld"><label>Điểm</label><div class="spice">'+[1,2,3,4,5].map(function(i){return '<button class="'+(S.rv.star===i?'on':'')+'" data-act="rvstar" data-i="'+i+'">'+i+' ★</button>'}).join('')+'</div></div><div class="fld"><label for="rt">Nhận xét</label><textarea id="rt" class="in" data-in="rv_text" placeholder="Món ăn, thời gian giao, đóng gói…">'+esc(S.rv.text)+'</textarea></div><button class="btn terra" data-act="sendrv">Gửi đánh giá</button></div></div></div>';
  }else{
    body='<div class="bento">'+Object.keys(VC).map(function(k){return '<div class="s6">'+voucherCard(k)+'</div>'}).join('')+'</div>';
  }
  return ph('Tài khoản · '+esc(S.co.name),'Của <span class="it">bạn</span>')+'<div class="tabs" role="tablist">'+tabs.map(function(t){return '<button class="'+(S.accTab===t[0]?'on':'')+'" role="tab" data-act="acctab" data-t="'+t[0]+'">'+t[1]+'</button>'}).join('')+'</div>'+body;
}};
ACT.acctab=function(d){S.accTab=d.t;render()};
ACT.saveprof=function(){toast('Đã lưu hồ sơ')};
ACT.defaddr=function(d){S.defAddr=d.k2;S.addr=d.k2;toast('Đã đặt làm địa chỉ mặc định');render()};
ACT.rmaddr=function(d){S.saved=S.saved.filter(function(k){return k!==d.k2});if(S.addr===d.k2)S.addr=S.defAddr;render()};
ACT.addaddr=function(){
  var l=$('#nl').value.trim(),s=$('#ns').value.trim(),base=ADDR[$('#na').value];
  if(!l||!s){toast('Nhập tên gọi và số nhà, tên đường');return}
  var key='X'+Date.now(),dd={};Object.keys(base.d).forEach(function(b){dd[b]=Math.round((base.d[b]+.3)*10)/10});
  ADDR[key]={l:l,a:s+', '+base.a.split(', ').slice(-2).join(', '),pt:[base.pt[0]+9,base.pt[1]+9],d:dd};S.saved.push(key);toast('Đã lưu địa chỉ mới');render();
};
INP.rv_no=function(v){S.rv.no=v};INP.rv_text=function(v){S.rv.text=v};
ACT.rvstar=function(d){S.rv.star=+d.i;render()};
ACT.sendrv=function(){
  var no=S.rv.no||($('#rn')&&$('#rn').value);if(!no){toast('Chưa có đơn hoàn thành để đánh giá');return}
  if(!S.rv.text.trim()){toast('Hãy viết vài dòng nhận xét');return}
  var o=oBy(no);S.reviews.unshift({no:no,dish:DM[o.items[0][0]].n,star:S.rv.star,text:S.rv.text.trim(),date:'12.10.2026'});S.rv={star:5,text:'',no:''};toast('Cảm ơn bạn đã đánh giá');render();
};

var customerDataNode=document.getElementById('customer-data');
if(customerDataNode){
  var customerData=JSON.parse(customerDataNode.textContent);
  if(customerData){
    S.co.name=customerData.name;
    S.co.email=customerData.email;
    S.co.phone=customerData.phone;
  }
}

S.cart=[];
dbOrders=[];
var startupRequests=[apiRequest('/api/products/','GET')];
if(isCustomerAuthenticated()){
  startupRequests.push(apiRequest('/api/cart/','GET'));
  startupRequests.push(apiRequest('/api/orders/','GET'));
}
Promise.all(startupRequests).then(function(results){
  applyCatalog(results[0].products);
  if(isCustomerAuthenticated()){
    syncCart(results[1]);
    dbOrders=results[2].orders;
  }
  initApp();
}).catch(function(error){
  reportApiError(error);
  initApp();
});

/* ================= LEAFLET MAP PICKER ================= */
var checkoutMapInstance=null;
var checkoutMarkerInstance=null;

function destroyCheckoutMap(){
  checkoutMarkerInstance=null;
  if(checkoutMapInstance){checkoutMapInstance.remove();checkoutMapInstance=null}
}

function _ensureMarker(lat,lng){
  if(!checkoutMapInstance)return;
  if(checkoutMarkerInstance){
    checkoutMarkerInstance.setLatLng([lat,lng]);
  }else{
    checkoutMarkerInstance=L.marker([lat,lng],{draggable:true}).addTo(checkoutMapInstance);
    _bindMarkerEvents();
  }
}

function _bindMarkerEvents(){
  if(!checkoutMarkerInstance)return;
  checkoutMarkerInstance.off('dragend');
  checkoutMarkerInstance.on('dragend',function(e){
    var ll=e.target.getLatLng();
    S.co.lat=ll.lat;S.co.lng=ll.lng;
    _updateAddressSpan('Đang tìm địa chỉ...');
    _reverseGeocode(ll.lat,ll.lng).then(function(addr){
      _updateAddressSpan(addr||('Vị trí đã chọn ('+ll.lat.toFixed(5)+', '+ll.lng.toFixed(5)+')'));
    });
  });
}

function initCheckoutMap(){
  destroyCheckoutMap();
  var mapEl=document.getElementById('checkout-map');
  if(!mapEl||typeof L==='undefined')return;
  if(mapEl._leaflet_id)return;

  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });

  if(!S.co)S.co={};
  var hasCoords=(S.co.lat!=null&&S.co.lng!=null);
  var centerLat=hasCoords?S.co.lat:21.0285;
  var centerLng=hasCoords?S.co.lng:105.8542;
  
  checkoutMapInstance=L.map('checkout-map',{zoomControl:true, attributionControl:false}).setView([centerLat,centerLng],hasCoords?16:13);
  
  // Máy chủ ảnh OpenStreetMap.DE (Miễn phí, không cần API key, không bị chặn)
  L.tileLayer('https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png', {
    subdomains: 'abc',
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(checkoutMapInstance);

  L.control.attribution({ prefix: false, position: 'bottomright' }).addTo(checkoutMapInstance);

  if(hasCoords){
    checkoutMarkerInstance=L.marker([S.co.lat,S.co.lng],{draggable:true}).addTo(checkoutMapInstance);
    _bindMarkerEvents();
  }
  
  checkoutMapInstance.on('click',function(e){
    S.co.lat=e.latlng.lat;S.co.lng=e.latlng.lng;
    _ensureMarker(e.latlng.lat,e.latlng.lng);
    _updateAddressSpan('Đang tìm địa chỉ...');
    _reverseGeocode(e.latlng.lat,e.latlng.lng).then(function(addr){
      _updateAddressSpan(addr||('Vị trí đã chọn ('+e.latlng.lat.toFixed(5)+', '+e.latlng.lng.toFixed(5)+')'));
    });
  });

  setTimeout(function() {
    if (checkoutMapInstance) {
      checkoutMapInstance.invalidateSize();
    }
  }, 300);
}

function setupMapObserver(){
  var target=document.getElementById('app')||document.body;
  var observer=new MutationObserver(function(){
    var mapEl=document.getElementById('checkout-map');
    if(mapEl&&!mapEl._leaflet_id)initCheckoutMap();
    else if(!mapEl&&checkoutMapInstance)destroyCheckoutMap();
  });
  observer.observe(target,{childList:true,subtree:true});
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',setupMapObserver);
}else{
  setupMapObserver();
}