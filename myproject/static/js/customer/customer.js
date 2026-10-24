'use strict';
/* ================= CUSTOMER MODULE ================= */
function custNav(){
  var g={dish:'menu',cart:'cart',checkout:'cart',dispatch:'cart',tracking:'orders'}[S.key]||S.key;
  var it=[['home','Trang chủ'],['menu','Thực đơn'],['orders','Đơn hàng của tôi'],['offers','Ưu đãi'],['account','Tài khoản']];
  return '<nav class="cnav" aria-label="Điều hướng khách hàng">'+it.map(function(x){return '<button class="'+(g===x[0]?'on':'')+'" data-act="go" data-k="'+x[0]+'">'+x[1]+'</button>'}).join('')+'<button class="cartb'+(g==='cart'?' on':'')+'" data-act="go" data-k="cart">Giỏ hàng <span class="badge">'+cartCount()+'</span></button></nav>';
}
ACT.add=function(d){cartAdd(d.id,1);toast('Đã thêm '+DM[d.id].n);render()};
ACT.inc=function(d){cartAdd(d.id,1);render()};
ACT.dec=function(d){var l=S.cart.filter(function(i){return i[0]===d.id})[0];if(l){if(l[1]>1)l[1]--;else S.cart=S.cart.filter(function(i){return i!==l})}render()};
ACT.rm=function(d){S.cart=S.cart.filter(function(i){return i[0]!==d.id});render()};
ACT.dish=function(d){go('dish',d.id)};
INP.addr=function(v){S.addr=v;render()};

/* ================= CUSTOMER: HOME ================= */
V.home={dj:['/','customer/home.html','HomeView.as_view()'],html:function(){
  var items=S.cart.length?S.cart:[['d1',1]];
  var res=evalBranches(items,S.addr),win=res.filter(function(r){return r.ok})[0];
  var near=BR.map(function(b){return {b:b,d:ADDR[S.addr].d[b.id]}}).sort(function(a,b){return a.d-b.d});
  var ring='<svg class="ring" viewBox="0 0 200 200" aria-hidden="true"><defs><path id="rp" d="M100 100m-90 0a90 90 0 1 1 180 0a90 90 0 1 1-180 0"/></defs><text><textPath href="#rp" textLength="556" lengthAdjust="spacing">MIÊU QUÁN · ĐÚNG BẾP · ĐÚNG GIỜ · ĐIỀU PHỐI THÔNG MINH · HẢI PHÒNG ·</textPath></text></svg>';
  var tk=win?'':'';
  var hero='<section class="hero"><div><div class="cap" style="margin-bottom:18px">Chuỗi bếp Hải Phòng · 5 chi nhánh · Thứ Hai 12.10.2026</div>'+
   '<h1 class="hero-h"><span class="l1">Miêu Quán <b>–</b></span>Điều phối <span class="it u">thông minh,</span> đúng bếp phù hợp</h1>'+
   '<p class="lead" style="margin:22px 0 26px">Mỗi đơn được kiểm tra vùng giao, món còn hàng, tải bếp và thời gian chuẩn bị trong vài giây, rồi giao cho bếp phù hợp nhất với địa chỉ của bạn.</p>'+
   '<form class="searchbar" data-form="hsearch" role="search"><input id="hq" type="search" placeholder="Tìm cơm thố, nem nướng, mỳ cay, bún đậu…" aria-label="Tìm món"><button class="btn terra" type="submit" data-act="hsearch">Tìm món<span>&nbsp;→</span></button></form>'+
   '<div class="row" style="margin-top:16px">'+['Cơm thố','Nem nướng','Mỳ cay','Bún đậu'].map(function(t){return '<button class="chip" data-act="hchip" data-q="'+t+'">'+t+'</button>'}).join('')+'</div></div>'+
   '<div class="emb"><div class="disc"></div><div class="cat">'+cat()+'</div>'+ring+'<div class="stamp">Điều phối<br>đơn hàng siêu tốc</div>'+tk+'</div></section>';
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
   '<div class="plate" style="margin-top:22px"><div class="row" style="margin-bottom:12px"><div class="grow"><div class="cap">Chạy thật với giỏ hàng hiện tại</div><b>'+esc(itemsText(items))+'</b> <span class="dim">· giao tới '+esc(ADDR[S.addr].l)+'</span></div><button class="btn sm" data-act="go" data-k="menu">Đổi món</button></div>'+gateMatrix(res)+'</div></section>';
  var foot='<footer class="foot"><span class="mono">MIÊU QUÁN · Hải Phòng</span><span>Hotline 1900 5555 05</span><span>Dữ liệu và thanh toán trong bản mẫu này là mô phỏng.</span></footer>';
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
  var c=calc(S.cart,{dist:estDist()});
  return '<aside class="mcart plate" aria-label="Giỏ hàng"><div class="row" style="margin-bottom:6px"><b class="h3">Giỏ hàng</b><span class="badge right">'+cartCount()+'</span></div>'+
  (S.cart.length?S.cart.map(function(i){var d=DM[i[0]];return '<div class="ml"><span>'+esc(d.n)+'</span><b class="mono nw">'+money(d.p*i[1])+'</b><div class="q"><button data-act="dec" data-id="'+d.id+'" aria-label="Giảm">−</button><span>'+i[1]+'</span><button data-act="inc" data-id="'+d.id+'" aria-label="Tăng">+</button></div></div>'}).join('')+
   '<div class="tot" style="margin-top:8px"><span class="dim">Tạm tính</span><b class="mono">'+money(c.sub)+'</b></div><div class="mono dim" style="font-size:11.5px;margin-bottom:12px">Phí giao và ưu đãi tính ở giỏ hàng</div><button class="btn terra blk" data-act="go" data-k="cart">Xem giỏ hàng →</button>':'<div class="empty" style="margin-top:10px">Chưa có món nào. Chọn món bên trái để bắt đầu.</div>')+'</aside>';
}
V.menu={dj:['/thuc-don/','customer/menu.html','MenuListView'],html:function(){
  var l=filtered(),cnt={all:D.length};CATS.forEach(function(c){cnt[c[0]]=D.filter(function(d){return d.c===c[0]}).length});
  var rail='<div class="rail"><div class="fld"><label for="mq">Tìm món</label><input id="mq" class="in" type="search" data-in="q" value="'+esc(S.q)+'" placeholder="Ví dụ: com tho, mi cay…"></div>'+
   '<div class="cats">'+[['all','Tất cả']].concat(CATS).map(function(c){return '<button class="'+(S.cat===c[0]?'on':'')+'" data-act="mcat" data-c="'+c[0]+'"><span>'+c[1]+'</span><span class="mono dim">'+cnt[c[0]]+'</span></button>'}).join('')+'</div>'+
   '<div class="row" style="justify-content:space-between"><span style="font-size:13.5px;font-weight:600">Chỉ món còn hàng</span><button class="sw'+(S.onlyAvail?' on':'')+'" data-act="monly" aria-pressed="'+S.onlyAvail+'" aria-label="Chỉ món còn hàng"></button></div>'+
   '<div class="fld"><label for="mp">Giá</label><select id="mp" class="in" data-in="maxp"><option value="0">Mọi mức giá</option>'+[40,60,80].map(function(v){return '<option value="'+v+'"'+(S.maxP===v?' selected':'')+'>Đến '+v+'.000đ</option>'}).join('')+'</select></div>'+
   '<div class="fld"><label for="ms">Sắp xếp</label><select id="ms" class="in" data-in="sort">'+[['pop','Bán chạy nhất'],['asc','Giá tăng dần'],['desc','Giá giảm dần']].map(function(o){return '<option value="'+o[0]+'"'+(S.sort===o[0]?' selected':'')+'>'+o[1]+'</option>'}).join('')+'</select></div></div>';
  var c=calc(S.cart,{dist:estDist()});
  return ph('Thực đơn · '+l.length+' món','Chọn món, <span class="it">bếp để chúng tôi lo</span>')+
   '<div class="mg">'+rail+'<section>'+(l.length?'<div class="dgrid">'+l.map(dishCard).join('')+'</div>':'<div class="empty">Không có món khớp bộ lọc. Thử bỏ bớt bộ lọc hoặc đổi từ khóa.</div>')+'</section>'+miniCart()+'</div>'+
   (S.cart.length?'<div class="mbar"><div class="grow"><div class="cap" style="color:inherit;opacity:.7">'+cartCount()+' món</div><b class="num" style="font-size:22px">'+money(c.sub)+'</b></div><button class="btn terra" data-act="go" data-k="cart">Xem giỏ hàng →</button></div>':'');
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
ACT.addq=function(d){var x=DM[d.id];cartAdd(d.id,S.dq);
  if(x.c==='my')S.inote[d.id]='Cấp độ cay '+S.spice+(S.dnote?' · '+S.dnote:'');else if(S.dnote)S.inote[d.id]=S.dnote;
  toast('Đã thêm '+S.dq+' × '+x.n);S.dq=1;render()};
S.inote={};

/* ================= CUSTOMER: CART ================= */
S.vin='';
function tmin(s){var m=/^(\d\d):(\d\d)/.exec(s||'');return m?(+m[1])*60+(+m[2]):NOW}
function applyV(code){
  code=String(code||'').trim().toUpperCase();
  if(!VC[code]){toast('Mã "'+code+'" không tồn tại hoặc đã hết hạn');return}
  S.voucher=code;S.vin='';var c=calc(S.cart,{dist:estDist()});
  toast(c.msg?c.msg:'Đã áp dụng mã '+code);render();
}
V.cart={dj:['/gio-hang/','customer/cart.html','CartView'],html:function(){
  if(!S.cart.length)return ph('Giỏ hàng','Giỏ hàng <span class="it">đang trống</span>')+'<div class="empty">Bạn chưa chọn món nào.<br><br><button class="btn terra" data-act="go" data-k="menu">Chọn món →</button></div>';
  var c=calc(S.cart,{dist:estDist()});
  var lines=S.cart.map(function(i){var d=DM[i[0]];return '<div class="cl2"><div class="art">'+art(d.id)+'</div><div style="min-width:0"><b>'+esc(d.n)+'</b><div class="dim" style="font-size:12.5px">'+money(d.p)+' / phần'+(S.inote[d.id]?' · '+esc(S.inote[d.id]):'')+'</div></div><div class="q"><button data-act="dec" data-id="'+d.id+'" aria-label="Giảm">−</button><span>'+i[1]+'</span><button data-act="inc" data-id="'+d.id+'" aria-label="Tăng">+</button></div><b class="mono nw">'+money(d.p*i[1])+'</b><button class="chip" data-act="rm" data-id="'+d.id+'">Xóa</button></div>'}).join('');
  var vl=S.voucher&&VC[S.voucher];
  return ph('Giỏ hàng · '+cartCount()+' món','Kiểm tra lại <span class="it">trước khi đặt</span>')+
  '<div class="two"><section>'+lines+'<div class="row" style="margin-top:18px"><button class="btn ghost sm" data-act="go" data-k="menu">← Chọn thêm món</button></div></section>'+
  '<aside class="plate"><div class="fld"><label for="vc">Mã giảm giá</label><div class="row" style="flex-wrap:nowrap"><input id="vc" class="in" data-in="vin" value="'+esc(S.vin)+'" placeholder="Nhập mã, ví dụ MIEU10"><button class="btn" data-act="applyv">Áp dụng</button></div></div>'+
  '<div class="row" style="margin:10px 0 14px">'+Object.keys(VC).map(function(k){return '<button class="chip'+(S.voucher===k?' on':'')+'" data-act="usev" data-c="'+k+'">'+k+'</button>'}).join('')+'</div>'+
  (vl?'<div class="mono dim" style="font-size:12px;margin-bottom:10px">'+esc(vl.d)+(c.msg?'<br><span style="color:var(--bad)">'+esc(c.msg)+'</span>':'')+'</div>':'')+
  '<div class="tot"><span class="dim">Tạm tính</span><b class="mono">'+money(c.sub)+'</b></div>'+
  '<div class="tot"><span class="dim">Giảm giá</span><b class="mono">'+(c.disc?'− '+money(c.disc):'0đ')+'</b></div>'+
  '<div class="tot"><span class="dim">Phí giao hàng (ước tính)</span><b class="mono">'+money(c.fee)+'</b></div>'+
  '<div class="tot big"><span class="cap">Tổng cộng</span><span class="num">'+money(c.total)+'</span></div>'+
  '<p class="mono dim" style="font-size:11.5px;margin:10px 0 16px">Phí giao được tính lại theo khoảng cách từ bếp được chọn.</p><button class="btn terra blk" data-act="go" data-k="checkout">Tiến hành thanh toán →</button></aside></div>';
}};
INP.vin=function(v){S.vin=v};
ACT.applyv=function(){applyV(S.vin||($('#vc')&&$('#vc').value))};
ACT.usev=function(d){applyV(d.c)};

/* ================= CUSTOMER: CHECKOUT ================= */
function gateMini(res){
  var win=res.filter(function(r){return r.ok})[0];
  return res.map(function(r){return '<div class="il" style="'+(r.ok?'':'opacity:.55')+'"><span><b>'+(r===win?'▸ ':'')+esc(r.b.n)+'</b> <span class="mono dim" style="font-size:11px">'+dec(r.dist)+' km</span>'+(r.ok?'':'<span class="rsn">'+esc(r.reasons[0])+'</span>')+'</span><b class="mono">'+(r.ok?r.score:'×')+'</b></div>'}).join('');
}
V.checkout={dj:['/dat-hang/','customer/checkout.html','CheckoutView (POST → DispatchService.assign)'],html:function(){
  if(!S.cart.length)return V.cart.html();
  var dist=estDist(),c=calc(S.cart,{dist:dist}),res=evalBranches(S.cart,S.addr),win=res.filter(function(r){return r.ok})[0];
  var addrs=S.saved.map(function(k){var a=ADDR[k],md=Math.min.apply(null,BR.map(function(b){return a.d[b.id]}));return '<button class="'+(S.addr===k?'on':'')+'" data-act="caddr" data-k2="'+k+'"><b>'+esc(a.l)+'</b><span>'+esc(a.a)+'</span><span>Bếp gần nhất cách '+dec(md)+' km</span></button>'}).join('');
  var pay=[['cod','Tiền mặt','Trả khi nhận hàng'],['qr','Chuyển khoản QR','Mô phỏng, không trừ tiền thật'],['momo','Ví MoMo','Mô phỏng, không trừ tiền thật'],['card','Thẻ ngân hàng','Mô phỏng, không trừ tiền thật']].map(function(p){return '<button class="'+(S.co.pay===p[0]?'on':'')+'" data-act="cpay" data-p2="'+p[0]+'"><b>'+p[1]+'</b><span>'+p[2]+'</span></button>'}).join('');
  return ph('Thanh toán · bước cuối','Giao tới <span class="it">đâu?</span>')+
  '<div class="two"><section class="col" style="gap:26px">'+
  '<div><div class="cap" style="margin-bottom:10px">Người nhận</div><div class="f2"><div class="fld"><label for="cn">Họ và tên</label><input id="cn" class="in" data-in="co_name" value="'+esc(S.co.name)+'" autocomplete="name"></div><div class="fld"><label for="cp">Số điện thoại</label><input id="cp" class="in" data-in="co_phone" value="'+esc(S.co.phone)+'" inputmode="tel" autocomplete="tel"></div></div></div>'+
  '<div><div class="cap" style="margin-bottom:10px">Địa chỉ giao hàng</div><div class="pay" style="grid-template-columns:1fr">'+addrs+'</div></div>'+
  '<div class="fld"><label for="cnote">Ghi chú cho đơn</label><textarea id="cnote" class="in" data-in="co_note" placeholder="Ví dụ: gọi trước khi đến, để hàng ở bảo vệ">'+esc(S.co.note)+'</textarea></div>'+
  '<div><div class="cap" style="margin-bottom:10px">Phương thức thanh toán</div><div class="pay">'+pay+'</div></div></section>'+
  '<aside class="col"><div class="plate"><div class="cap" style="margin-bottom:8px">Đơn của bạn</div>'+S.cart.map(function(i){return '<div class="il"><span>'+esc(DM[i[0]].n)+' <span class="dim">× '+i[1]+'</span></span><b class="mono">'+money(DM[i[0]].p*i[1])+'</b></div>'}).join('')+
  '<div class="tot" style="margin-top:8px"><span class="dim">Giảm giá'+(S.voucher?' ('+S.voucher+')':'')+'</span><b class="mono">'+(c.disc?'− '+money(c.disc):'0đ')+'</b></div><div class="tot"><span class="dim">Phí giao (ước tính)</span><b class="mono">'+money(c.fee)+'</b></div><div class="tot big"><span class="cap">Tổng cộng</span><span class="num">'+money(c.total)+'</span></div></div>'+
  '<div class="plate ink"><div class="cap">Chọn bếp tự động</div><h3 class="h3" style="margin:8px 0 8px">Bạn không cần chọn chi nhánh.</h3><p style="font-size:13.5px;opacity:.85">Sau khi đặt, Miêu Quán kiểm tra chi nhánh mở cửa, trong vùng giao, đủ món và chưa quá tải, rồi chấm điểm khoảng cách ('+RULES.wd+'), tải bếp ('+RULES.wl+') và thời gian chuẩn bị ('+RULES.wp+'). Đơn đi tới bếp điểm cao nhất.</p>'+
  '<div style="margin-top:12px;background:var(--paper);color:var(--ink);padding:10px 12px"><div class="cap" style="margin-bottom:4px">Dự kiến hiện tại</div>'+gateMini(res)+'</div></div>'+
  '<button class="btn terra blk" data-act="place" style="padding:16px">Đặt hàng và điều phối →</button>'+
  '<p class="mono dim" style="font-size:11.5px">Kết quả thật được chốt ngay khi bạn đặt hàng và có thể khác dự kiến nếu tải bếp thay đổi.</p></aside></div>';
}};
INP.co_name=function(v){S.co.name=v};INP.co_phone=function(v){S.co.phone=v};INP.co_note=function(v){S.co.note=v};
ACT.caddr=function(d){S.addr=d.k2;render()};
ACT.cpay=function(d){S.co.pay=d.p2;render()};
ACT.place=function(){
  if(!S.co.name.trim()){toast('Vui lòng nhập họ và tên người nhận');return}
  if(!/^0\d{9,10}$/.test(S.co.phone.replace(/\s/g,''))){toast('Số điện thoại chưa đúng, cần 10 hoặc 11 chữ số bắt đầu bằng 0');return}
  var res=evalBranches(S.cart,S.addr),win=res.filter(function(r){return r.ok})[0]||null;
  S.disp={id:Date.now(),res:res,win:win,step:0,done:false,order:null,items:S.cart.map(function(i){return i.slice()}),addr:S.addr,co:JSON.parse(JSON.stringify(S.co)),voucher:S.voucher};
  go('dispatch');
};

/* ================= CUSTOMER: DISPATCH ================= */
var ANG=[205,330,75,20,140],ORDN=193;
V.dispatch={dj:['/dat-hang/dieu-phoi/','customer/dispatch.html','DispatchView (poll GET /api/dispatch/<id>/ mỗi 1 giây)'],html:function(){
  var d=S.disp;
  if(!d)return ph('Điều phối','Chưa có <span class="it">đơn nào</span>')+'<div class="empty">Hãy đặt hàng từ giỏ hàng để xem quá trình điều phối.<br><br><button class="btn terra" data-act="go" data-k="cart">Về giỏ hàng</button></div>';
  var blips=d.res.map(function(r,i){var a=ANG[i%5],rad=clamp(r.dist/9,.08,1)*43;return '<div class="blip" id="bl'+i+'" style="left:'+(50+rad*Math.cos(P(a))).toFixed(1)+'%;top:'+(50+rad*Math.sin(P(a))).toFixed(1)+'%"><i></i><em>'+esc(r.b.n)+' · '+dec(r.dist)+' km</em></div>'}).join('');
  var rings='<svg class="rg" viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width=".35"><circle cx="50" cy="50" r="11"/><circle cx="50" cy="50" r="22"/><circle cx="50" cy="50" r="33"/><circle cx="50" cy="50" r="44"/><path d="M50 4v92M4 50h92M17 17l66 66M83 17L17 83"/></g><g fill="currentColor" style="font:2.4px IBM Plex Mono,monospace"><text x="51" y="37.6">2 km</text><text x="51" y="26.6">4 km</text><text x="51" y="15.6">6 km</text><text x="51" y="6.2">9 km</text></g></svg>';
  var steps=['Kiểm tra vùng phục vụ','Kiểm tra món còn hàng','Đo khoảng cách và tải bếp','Chốt chi nhánh'].map(function(t,i){return '<li id="ds'+i+'"><div class="mk"><b>'+(i+1)+'</b></div><div><b>'+t+'</b><div class="rs"></div></div></li>'}).join('');
  return ph('Đơn của '+esc(d.co.name),'Đang tìm <span class="it">bếp phù hợp</span>')+
  '<div class="dp"><div class="radar" id="radar"><div class="sweep"></div>'+rings+'<div class="me" title="Địa chỉ của bạn"></div>'+blips+'</div>'+
  '<div><ol class="dsteps">'+steps+'</ol><p class="mono dim" style="font-size:12px;margin-top:14px">Giao tới: '+esc(ADDR[d.addr].a)+'</p></div></div><div id="dres" style="margin-top:36px"></div>';
},after:function(){var d=S.disp;if(!d)return;dispApply();if(!d.done&&!dispT)dispTimer()}};
function dispTimer(){
  var d=S.disp;if(!d||d.done)return;
  dispT=setTimeout(function(){dispT=null;if(S.disp!==d||S.key!=='dispatch')return;d.step++;dispApply();if(d.step<4)dispTimer()},1150);
}
function dispApply(){
  var d=S.disp;if(!d)return;var st=d.step,res=d.res;
  var n1=res.filter(function(r){return r.gates.open&&r.gates.area}).length,n2=res.filter(function(r){return r.gates.open&&r.gates.area&&r.gates.items}).length,n3=res.filter(function(r){return r.ok}).length;
  var txt=[n1+'/5 chi nhánh đang mở và nằm trong vùng giao',n2+' chi nhánh đủ '+d.items.length+' món trong giỏ',n3+' chi nhánh đủ điều kiện, chấm điểm '+RULES.wd+' / '+RULES.wl+' / '+RULES.wp,d.win?'Chọn Miêu Quán '+d.win.b.n+', điểm '+d.win.score:'Chưa có chi nhánh phù hợp'];
  for(var i=0;i<4;i++){var li=$('#ds'+i);if(!li)continue;li.className=i<st?'ok':(i===st?'act':'');$('.rs',li).textContent=i<st?txt[i]:(i===st?'Đang kiểm tra…':'');$('.mk b',li).textContent=i<st?'✓':String(i+1)}
  res.forEach(function(r,i){var el=$('#bl'+i);if(!el)return;
    var x=(st>=1&&(!r.gates.open||!r.gates.area))||(st>=2&&!r.gates.items)||(st>=3&&!r.gates.load);
    el.className='blip'+(st>=1?' on':'')+(x?' x':'')+(st>=4&&d.win===r?' win':'')});
  var rd=$('#radar');if(rd)rd.classList.toggle('done',st>=4);
  if(st>=4)finishDisp();
}
function finishDisp(){
  var d=S.disp;d.done=true;
  if(d.win&&!d.order){
    var co=d.co,no='MQ-261012-0'+(ORDN++),w=d.win;
    var o=mkO(no,co.name,co.phone.replace(/\s/g,'').slice(-3),w.b.id,d.items,0,PAYL[co.pay],0,d.addr,hm(NOW+1));
    var c=calc(d.items,{dist:w.dist,voucher:d.voucher});
    o.sub=c.sub;o.fee=c.fee;o.disc=c.disc;o.total=c.total;o.note=co.note;o.mine=true;o.prep=w.prep;o.ps=co.pay==='cod'?'Thu khi giao':'Đã thanh toán (mô phỏng)';
    o.snap=d.res.map(function(r){return {id:r.b.id,ok:r.ok,score:r.score,dist:r.dist,why:r.reasons[0]||''}});
    o.audit=buildAudit(o);orders.unshift(o);
    d.order=no;S.last=no;S.cart=[];S.voucher=null;S.inote={};
  }
  var box=$('#dres');if(!box||box.dataset.done)return;box.dataset.done='1';
  if(!d.win){box.innerHTML='<div class="plate reveal"><div class="cap">Kết quả điều phối</div><h2 class="h2" style="margin:8px 0 10px">Chưa có bếp nào nhận được đơn này</h2><p class="lead" style="margin-bottom:16px">Các chi nhánh đều bị loại vì hết món, ngoài vùng giao hoặc quá tải. Đơn chưa được tạo và bạn không bị tính tiền. Bạn có thể bỏ bớt món hết hàng hoặc chọn địa chỉ khác.</p>'+gateMatrix(d.res)+'<div class="row" style="margin-top:16px"><button class="btn terra" data-act="go" data-k="cart">Quay lại giỏ hàng</button></div></div>';return}
  var w=d.win,o=oBy(d.order);
  box.innerHTML='<div class="plate reveal"><div class="row" style="align-items:flex-start;gap:24px"><div class="grow"><div class="cap">Đã chọn bếp · đơn '+o.no+'</div><h2 class="h2" style="margin:8px 0 6px">Miêu Quán <span class="it">'+esc(w.b.n)+'</span></h2><p class="dim">'+esc(w.b.addr)+'</p></div><div class="row mono" style="gap:22px"><div><div class="cap">Khoảng cách</div><b class="num" style="font-size:26px">'+dec(w.dist)+' km</b></div><div><div class="cap">Chuẩn bị</div><b class="num" style="font-size:26px">~'+w.prep+"'"+'</b></div><div><div class="cap">Điểm</div><b class="num" style="font-size:26px">'+w.score+'</b></div></div></div><hr class="foil" style="margin:18px 0">'+gateMatrix(d.res)+'<div class="row" style="margin-top:18px"><button class="btn terra" data-act="go" data-k="tracking" data-p="'+o.no+'">Theo dõi đơn hàng →</button><button class="btn ghost" data-act="go" data-k="home">Về trang chủ</button></div></div>';
}

/* ================= CUSTOMER: TRACKING ================= */
function routeMap(o){
  var b=BM[o.br],a=o.pt||ADDR[o.ak].pt,minx=Math.min(b.x,a[0])-45,miny=Math.min(b.y,a[1])-45,w=Math.abs(b.x-a[0])+90,h=Math.abs(b.y-a[1])+90;
  if(w<150){minx-=(150-w)/2;w=150}if(h<110){miny-=(110-h)/2;h=110}
  var fs=(w/26).toFixed(1),g='';
  for(var i=0;i<12;i++){g+='<path class="gl" d="M'+(minx+i*w/10)+' '+miny+'v'+h+'M'+minx+' '+(miny+i*h/8)+'h'+w+'"/>'}
  return '<svg class="map" viewBox="'+minx.toFixed(1)+' '+miny.toFixed(1)+' '+w.toFixed(1)+' '+h.toFixed(1)+'" role="img" aria-label="Sơ đồ tuyến giao từ chi nhánh đến địa chỉ">'+g+'<line class="ln" x1="'+b.x+'" y1="'+b.y+'" x2="'+a[0]+'" y2="'+a[1]+'"/><rect x="'+(b.x-5)+'" y="'+(b.y-5)+'" width="10" height="10" fill="#F4E4AE" transform="rotate(45 '+b.x+' '+b.y+')"/><text x="'+(b.x+9)+'" y="'+(b.y-8)+'" font-size="'+fs+'">'+esc(b.n)+'</text><circle class="odr" cx="'+a[0]+'" cy="'+a[1]+'" r="5"/><circle class="od" cx="'+a[0]+'" cy="'+a[1]+'" r="3.5"/><text x="'+(a[0]+8)+'" y="'+(a[1]+14)+'" font-size="'+fs+'">Địa chỉ giao</text></svg>';
}
V.tracking={dj:['/don-hang/<str:code>/','customer/tracking.html','OrderTrackingView'],html:function(){
  var o=oBy(S.par||S.last)||oBy('MQ-261012-0184'),b=BM[o.br];
  var labels=ST.map(function(s,j){var tm=j===0?o.audit[0].t:(o.audit[j+1]&&j<=o.st?o.audit[j+1].t:'');return '<li class="'+(o.st<0?'future':(j<o.st?'done':(j===o.st?'cur':'future')))+(j<=o.st&&j<o.st?'':'')+'"><i></i><b>'+s+'</b><span>'+(j<=o.st&&o.st>=0?(tm||'—'):'dự kiến')+'</span></li>'}).join('');
  var eta=o.st>=0&&o.st<5?hm(tmin(o.t)+prepOf(o)+Math.round(o.dist*4)+4):null;
  var sh=o.ship?SM[o.ship]:null;
  var say=o.st===-1?'Đơn đã bị chi nhánh hủy. Tiền (nếu đã thanh toán) sẽ được hoàn trong 1 đến 3 ngày làm việc.':['Chi nhánh đã nhận đơn và đang chờ xác nhận.','Chi nhánh đã xác nhận, bếp sắp bắt đầu.','Bếp đang chế biến món của bạn.','Món đã xong, đang chờ shipper nhận.','Shipper đang trên đường giao tới bạn.','Đơn đã giao thành công. Cảm ơn bạn đã ăn ở Miêu Quán.'][o.st];
  return '<div class="ph"><div class="grow"><div class="cap">Theo dõi đơn hàng · đặt lúc '+esc(o.t)+'</div><div class="ordno">'+o.no+'</div></div><div>'+stPill(o.st)+'</div></div>'+
  '<div class="bento"><section class="plate s8"><div class="cap" style="margin-bottom:16px">Tiến trình</div><ol class="tl">'+labels+'</ol><hr class="rule" style="margin:20px 0 16px"><div class="row"><p class="grow" style="font-weight:600">'+say+'</p>'+(o.st>=0&&o.st<5?'<button class="btn sm" data-act="demoadv" data-no="'+o.no+'">Mô phỏng bước tiếp theo</button>':'')+'</div></section>'+
  '<aside class="plate ink s4"><div class="cap">Bếp phụ trách</div><h2 class="h2" style="margin:8px 0 6px">Miêu Quán '+esc(b.n)+'</h2><p style="font-size:13.5px;opacity:.8">'+esc(b.addr)+'</p><div class="row mono" style="margin:14px 0;gap:22px"><div><div class="cap">Chuẩn bị</div><b class="num" style="font-size:28px">~'+prepOf(o)+"'"+'</b></div><div><div class="cap">'+(eta?'Dự kiến giao':'Cách bạn')+'</div><b class="num" style="font-size:28px">'+(eta||dec(o.dist)+' km')+'</b></div></div>'+routeMap(o)+'</aside>'+
  '<section class="plate s8"><div class="cap" style="margin-bottom:8px">Món trong đơn</div>'+o.items.map(function(i){var d=DM[i[0]];return '<div class="il"><span>'+esc(d.n)+' <span class="dim">× '+i[1]+'</span></span><b class="mono">'+money(d.p*i[1])+'</b></div>'}).join('')+(o.note?'<div class="il"><span class="dim">Ghi chú</span><span>'+esc(o.note)+'</span></div>':'')+
  '<div class="tot" style="margin-top:8px"><span class="dim">Tạm tính</span><span class="mono">'+money(o.sub)+'</span></div><div class="tot"><span class="dim">Phí giao</span><span class="mono">'+money(o.fee)+'</span></div><div class="tot"><span class="dim">Giảm giá</span><span class="mono">'+(o.disc?'− '+money(o.disc):'0đ')+'</span></div><div class="tot big"><span class="cap">Tổng</span><span class="num">'+money(o.total)+'</span></div></section>'+
  '<aside class="plate s4"><div class="cap" style="margin-bottom:8px">Giao và thanh toán</div><div class="il"><span class="dim">Địa chỉ</span><span style="text-align:right">'+esc(ADDR[o.ak].a)+'</span></div><div class="il"><span class="dim">Thanh toán</span><span>'+esc(o.pay)+'</span></div><div class="il"><span class="dim">Trạng thái tiền</span><span>'+esc(o.ps)+'</span></div><div class="il"><span class="dim">Shipper</span><span>'+(sh?esc(sh.n)+' · '+sh.tel:'Chưa phân công')+'</span></div></aside></div>';
}};
ACT.demoadv=function(d){var o=oBy(d.no);if(o&&advance(o,'Hệ thống (mô phỏng)')){toast('Đơn chuyển sang: '+ST[o.st])}render()};

/* ================= CUSTOMER: ORDERS ================= */
function myOrders(){return orders.filter(function(o){return o.cust==='Nguyễn Minh Khôi'})}
V.orders={dj:['/don-hang/','customer/order_list.html','OrderListView'],html:function(){
  var l=myOrders();
  return ph('Lịch sử · '+l.length+' đơn','Đơn hàng <span class="it">của tôi</span>')+
  '<div class="col" style="gap:18px">'+l.map(function(o){return '<article class="plate"><div class="row" style="align-items:flex-start"><div class="grow" style="min-width:200px"><div class="row" style="gap:10px"><b class="num" style="font-size:22px">'+o.no+'</b>'+stPill(o.st)+'</div><div class="mono dim" style="font-size:12px;margin:6px 0 10px">'+esc(o.t)+' · Miêu Quán '+esc(BM[o.br].n)+' · '+dec(o.dist)+' km</div><div style="font-size:14px">'+esc(itemsText(o.items))+'</div></div><div class="tr"><div class="num" style="font-size:26px">'+money(o.total)+'</div><div class="mono dim" style="font-size:12px;margin-top:4px">'+esc(o.pay)+'</div></div></div><div class="acts" style="margin-top:16px"><button class="btn sm" data-act="go" data-k="tracking" data-p="'+o.no+'">Theo dõi</button><button class="btn sm ghost" data-act="reorder" data-no="'+o.no+'">Đặt lại</button>'+(o.st===5?'<button class="btn sm ghost" data-act="torev" data-no="'+o.no+'">Viết đánh giá</button>':'')+'</div></article>'}).join('')+'</div>';
}};
ACT.reorder=function(d){var o=oBy(d.no);o.items.forEach(function(i){cartAdd(i[0],i[1])});toast('Đã thêm các món của đơn '+o.no+' vào giỏ');go('cart')};
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
    body='<div class="bento"><div class="plate s7"><div class="f2"><div class="fld"><label for="pn">Họ và tên</label><input id="pn" class="in" value="'+esc(S.co.name)+'" data-in="co_name"></div><div class="fld"><label for="pp">Số điện thoại</label><input id="pp" class="in" value="'+esc(S.co.phone)+'" data-in="co_phone"></div><div class="fld" style="grid-column:1/-1"><label for="pe">Email</label><input id="pe" class="in" value="khoi.nguyen@example.vn"></div></div><div class="row" style="margin-top:18px"><button class="btn terra" data-act="saveprof">Lưu thay đổi</button></div></div>'+
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


initApp();
