/* ================= SHARED HELPERS ================= */

var $ = function (s, r) {
    return (r || document).querySelector(s);
};

var $$ = function (s, r) {
    return Array.prototype.slice.call(
        (r || document).querySelectorAll(s)
    );
};

var money = function (n) {
    return String(Math.round(n))
        .replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
};

var clamp = function (v, a, b) {
    return Math.max(a, Math.min(b, v));
};

var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;'
        }[c];
    });
};

var dec = function (n, d) {
    return Number(n)
        .toFixed(d == null ? 1 : d)
        .replace('.', ',');
};

var ic = function (n) {
    return '<svg class="ic" aria-hidden="true">' +
        '<use href="#i-' + n + '"/>' +
        '</svg>';
};

var cat = function () {
    return '<svg viewBox="0 0 120 120" aria-hidden="true">' +
        '<use href="#cat"/>' +
        '</svg>';
};
/* ================= ENGINE ================= */
function isAv(bid,did){return DM[did].global&&AV[bid][did]!=='off'}
function dishBranches(did){return BR.filter(function(b){return b.open&&b.accepting&&isAv(b.id,did)}).length}
var orders=[];
function liveLoad(b){return b.base+orders.filter(function(o){return o.br===b.id&&o.st>=0&&o.st<=3}).length}
function evalBranches(items,ak,R){
  R=R||RULES;var out=[];
  var tmax=Math.max.apply(null,items.map(function(i){return DM[i[0]].t}).concat([5]));
  BR.forEach(function(b){
    var dist=ADDR[ak].d[b.id],load=liveLoad(b),pct=load/b.cap;
    var prep=Math.round(b.prep+load*1.4+tmax*.6);
    var miss=items.filter(function(i){return !isAv(b.id,i[0])}).map(function(i){return DM[i[0]].n});
    var gates={open:b.open&&b.accepting,area:dist<=b.radius,items:!miss.length,load:pct*100<=R.maxLoad};
    var why=[];
    if(!b.open)why.push('Đang đóng cửa');else if(!b.accepting)why.push('Tạm ngưng nhận đơn');
    if(!gates.area)why.push('Ngoài vùng giao ('+dec(b.radius)+' km)');
    if(!gates.items)why.push('Hết '+miss[0]+(miss.length>1?' +'+(miss.length-1):''));
    if(!gates.load)why.push('Quá tải '+Math.round(pct*100)+'%');
    var sd=clamp(1-dist/R.maxKm,0,1),sl=clamp(1-pct,0,1),sp=clamp(1-prep/R.maxPrep,0,1);
    var W=(R.wd+R.wl+R.wp)||1;
    var score=Math.round(100*(R.wd*sd+R.wl*sl+R.wp*sp)/W);
    out.push({b:b,dist:dist,load:load,pct:pct,prep:prep,miss:miss,gates:gates,reasons:why,ok:!why.length,sd:sd,sl:sl,sp:sp,score:score});
  });
  out.sort(function(x,y){return (y.ok-x.ok)||(y.score-x.score)||(x.dist-y.dist)});
  return out;
}
function feeOf(d){return d<=3?15000:15000+Math.ceil(d-3)*4000}
function calc(items,o){
  o=o||{};var sub=items.reduce(function(s,i){return s+DM[i[0]].p*i[1]},0);
  var dist=o.dist==null?2:o.dist,fee=feeOf(dist),disc=0,msg='';
  var vc=o.voucher===undefined?S.voucher:o.voucher;
  if(vc&&VC[vc]){var v=VC[vc];
    if(sub<v.min){msg='Cần đơn từ '+money(v.min)+' để dùng '+vc}
    else if(v.t==='pct')disc=Math.min(Math.round(sub*v.v/100),v.max);
    else if(v.t==='amt')disc=v.v;
    else if(v.t==='ship'){disc=fee;}
  }
  return {sub:sub,fee:fee,disc:disc,msg:msg,total:Math.max(0,sub+fee-disc)};
}
function estDist(){
  var r=evalBranches(S.cart,S.addr);var ok=r.filter(function(x){return x.ok})[0];
  return ok?ok.dist:Math.min.apply(null,r.map(function(x){return x.dist}));
}
function cartCount(){return S.cart.reduce(function(s,i){return s+i[1]},0)}
function hm(min){var m=((min%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')}
var NOW=10*60+6;
function itemsText(items){return items.map(function(i){return DM[i[0]].n+' ×'+i[1]}).join(', ')}
function buildAudit(o){
  var b=BM[o.br],a=[],t0=NOW-o.ago,w=[1,2,5,7,6,6];
  var topc=o.snap?o.snap.filter(function(s){return s.id===o.br})[0]:null;
  a.push({t:hm(t0),who:'Khách hàng',ev:'Đặt đơn '+o.no+' ('+o.pay+')'});
  a.push({t:hm(t0),who:'Hệ thống',ev:'Điều phối tự động: chọn CN '+b.n+(topc?' · điểm '+topc.score:'')+' · '+dec(o.dist)+' km'});
  var acc=['Chi nhánh xác nhận đơn','Bắt đầu chế biến','Món sẵn sàng giao',(o.ship?'Giao cho '+SM[o.ship].n:'Giao cho shipper'),'Giao thành công'],t=t0;
  for(var i=0;i<o.st&&i<5;i++){t+=w[i+1]||5;a.push({t:hm(t),who:i<3?'CN '+b.n:(i===3?'CN '+b.n:'Shipper'),ev:acc[i]})}
  if(o.st===-1)a.push({t:hm(t0+3),who:'CN '+b.n,ev:'Hủy đơn'});
  return a;
}
function mkO(no,cust,tail,br,items,st,pay,ago,ak,when){
  var d=ADDR[ak].d[br],c=calc(items,{dist:d,voucher:null});
  var o={no:no,cust:cust,tel:'09•• ••• '+tail,br:br,items:items,st:st,pay:pay,ps:pay==='Tiền mặt'?(st===5?'Đã thu':'Thu khi giao'):'Đã thanh toán',
   t:when||hm(NOW-ago),ago:ago,ak:ak,dist:d,sub:c.sub,fee:c.fee,disc:c.disc,total:c.total,note:'',ship:null,pt:ADDR[ak].pt};
  o.snap=evalBranches(items,ak).map(function(r){return {id:r.b.id,ok:r.ok,score:r.score,dist:r.dist,why:r.reasons[0]||''}});
  return o;
}
(function seed(){
  var R=[
   ['MQ-261012-0181','Trần Thị Lan','412','CN01',[['d1',2],['d10',2]],5,'Chuyển khoản',54,'A1'],
   ['MQ-261012-0182','Phạm Quốc Huy','097','CN02',[['d6',1],['d12',1]],5,'Tiền mặt',46,'A2'],
   ['MQ-261012-0183','Lê Thu Hà','230','CN01',[['d4',1],['d9',1]],4,'Ví MoMo',38,'A1'],
   ['MQ-261012-0184','Nguyễn Minh Khôi','658','CN01',[['d3',2],['d11',1],['d14',1]],4,'Ví MoMo',33,'A1'],
   ['MQ-261012-0185','Đỗ Anh Tuấn','881','CN03',[['d2',1],['d5',1]],3,'Tiền mặt',27,'A4'],
   ['MQ-261012-0186','Vũ Hoài Nam','145','CN01',[['d1',1],['d8',2]],3,'Chuyển khoản',22,'A1'],
   ['MQ-261012-0187','Bùi Thanh Mai','702','CN04',[['d7',2]],2,'Tiền mặt',19,'A5'],
   ['MQ-261012-0188','Hoàng Gia Bảo','339','CN01',[['d5',2],['d13',2]],2,'Ví MoMo',14,'A1'],
   ['MQ-261012-0189','Ngô Phương Anh','516','CN03',[['d3',1],['d6',1],['d10',2]],2,'Chuyển khoản',12,'A4'],
   ['MQ-261012-0190','Đặng Văn Long','084','CN01',[['d4',2]],1,'Tiền mặt',9,'A1'],
   ['MQ-261012-0191','Mai Khánh Linh','927','CN05',[['d2',2],['d12',2]],0,'Ví MoMo',6,'A3'],
   ['MQ-261012-0192','Trịnh Đức Minh','463','CN01',[['d9',1],['d1',1]],0,'Tiền mặt',3,'A1']
  ];
  R.forEach(function(r){orders.push(mkO.apply(null,r))});
  orders[2].ship='S1';orders[3].ship='S2';orders[0].ship='S1';orders[1].ship='S4';
  orders[3].note='Gọi trước khi giao, cổng sắt màu xanh';orders[7].note='Ít cay, thêm đá riêng';orders[11].note='Không lấy đũa';
  [['MQ-261009-0376','CN01',[['d1',1],['d12',1]],'18:42','09.10','A1','Ví MoMo'],
   ['MQ-261005-0128','CN02',[['d4',1],['d10',1]],'12:15','05.10','A2','Tiền mặt'],
   ['MQ-260927-0553','CN01',[['d3',1],['d6',1],['d14',2]],'19:20','27.09','A1','Chuyển khoản']].forEach(function(h){
    var o=mkO(h[0],'Nguyễn Minh Khôi','658',h[1],h[2],5,h[6],4000,h[5],h[4]+' · '+h[3]);o.hist=true;o.ship=h[1]==='CN01'?'S3':'S5';orders.push(o)});
  orders.forEach(function(o){o.audit=buildAudit(o)});
})();
var INV0=[['Gạo thơm','kg',42,20],['Thịt xá xíu','kg',6.5,8],['Sườn cốt lết','kg',11,6],['Thịt nem nướng','kg',8,5],['Mỳ tươi','kg',15,10],['Hải sản đông lạnh','kg',4,5],['Bò Mỹ thái lát','kg',5,4],['Đậu phụ','bìa',60,40],['Mắm tôm','lọ',12,6],['Bún tươi','kg',18,12],['Trà đào ngâm','hộp',9,10],['Trứng gà','quả',120,60],['Sữa đặc','hộp',14,8],['Cốc giấy 500ml','cái',380,200]];
var INV={};BR.forEach(function(b,bi){INV[b.id]=INV0.map(function(r,i){
  var f=bi===0?1:(0.7+((i*7+bi*5)%9)/16);var q=bi===0?r[2]:Math.round(r[2]*f*10)/10;return {n:r[0],u:r[1],q:q,min:r[3]}})});
var USERS=[
 ['U001','Nguyễn Minh Khôi','Khách hàng','—','khoi.nguyen@example.vn','Hoạt động','12.03.2026'],
 ['U002','Trần Thị Lan','Khách hàng','—','lan.tran@example.vn','Hoạt động','02.05.2026'],
 ['U003','Phạm Quốc Huy','Khách hàng','—','huy.pham@example.vn','Hoạt động','19.06.2026'],
 ['U004','Nguyễn Thị Hằng','Nhân viên chi nhánh','CN01','hang.nt@mieuquan.vn','Hoạt động','10.01.2025'],
 ['U005','Phạm Văn Đức','Nhân viên chi nhánh','CN02','duc.pv@mieuquan.vn','Hoạt động','21.02.2025'],
 ['U006','Lê Thu Trang','Nhân viên chi nhánh','CN03','trang.lt@mieuquan.vn','Hoạt động','05.04.2025'],
 ['U007','Nguyễn Văn Hùng','Giao hàng','CN01','hung.nv@mieuquan.vn','Hoạt động','14.03.2025'],
 ['U008','Trần Đức Anh','Giao hàng','CN01','anh.td@mieuquan.vn','Hoạt động','30.03.2025'],
 ['U009','Phạm Quang Vinh','Giao hàng','CN02','vinh.pq@mieuquan.vn','Tạm khóa','11.07.2025'],
 ['U010','Đỗ Quang Huy','Nhân viên chi nhánh','CN04','huy.dq@mieuquan.vn','Hoạt động','02.08.2025'],
 ['U011','Vũ Minh Châu','Nhân viên chi nhánh','CN05','chau.vm@mieuquan.vn','Hoạt động','17.09.2025'],
 ['U012','Lê Quỳnh Anh','Quản trị','Toàn chuỗi','anh.lq@mieuquan.vn','Hoạt động','01.01.2025']
].map(function(u){return {id:u[0],n:u[1],role:u[2],br:u[3],mail:u[4],st:u[5],at:u[6]}});

var REV={};BR.forEach(function(b,bi){var a=[];for(var i=0;i<14;i++){var base=[9.2,7.4,6.1,5.2,4.4][bi];a.push(Math.round((base+Math.sin(i*1.3+bi)*1.4+(i%7>=5?1.6:0))*10)/10)}REV[b.id]=a});
var HOURS=[1,2,3,3,4,2,2,3,5,8,9,7,4,2];
var HLOAD={CN01:[.18,.22,.35,.5,.4,.3,.34,.55,.7,.82,.9,.74,.6,.5],CN02:[.1,.18,.3,.38,.3,.25,.3,.5,.62,.7,.66,.58,.5,.44],CN03:[.2,.3,.46,.62,.58,.5,.55,.76,.9,.98,.97,.94,.9,.92],CN04:[.08,.14,.24,.3,.26,.2,.22,.4,.52,.6,.56,.5,.46,.5],CN05:[.06,.1,.2,.28,.22,.18,.2,.34,.44,.5,.46,.42,.4,.4]};

/* ================= HELPERS ================= */
var V={},ACT={},INP={},LAY={};
function pill(t,c){return '<span class="pill '+(c||'mute')+'">'+t+'</span>'}
function stPill(st){return st===-1?pill('Đã hủy','bad'):pill(ST[st],STC[st])}
function ph(eye,title,right){return '<div class="ph"><div class="grow"><div class="cap">'+eye+'</div><h1 class="h1">'+title+'</h1></div>'+(right||'')+'</div>'}
function roleOf(k){return k.indexOf('b-')===0?'branch':(k.indexOf('a-')===0?'admin':'customer')}
function oBy(no){return orders.filter(function(o){return o.no===no})[0]}
function loadCls(p){return p>=.9?'bad':(p>=.75?'warn':'ok')}
function branchOpt(sel,all){return (all?'<option value="all"'+(sel==='all'?' selected':'')+'>Tất cả chi nhánh</option>':'')+BR.map(function(b){return '<option value="'+b.id+'"'+(sel===b.id?' selected':'')+'>'+b.id+' · '+b.n+'</option>'}).join('')}
var PAYL={cod:'Tiền mặt',qr:'Chuyển khoản',momo:'Ví MoMo',card:'Thẻ ngân hàng'};
var toastT;
function toast(m){var t=$('#toast');t.innerHTML='<div class="toast">'+esc(m)+'</div>';clearTimeout(toastT);toastT=setTimeout(function(){t.innerHTML=''},2600)}
function gateMatrix(res){
  var win=res.filter(function(r){return r.ok})[0];
  var g=function(v){return '<span class="g'+(v?'':' n')+'">'+(v?'✓':'×')+'</span>'};
  return '<div class="tw"><table class="gm"><thead><tr><th>Chi nhánh</th><th>Mở cửa</th><th>Trong vùng giao</th><th>Đủ món</th><th>Không quá tải</th><th>Điểm điều phối</th></tr></thead><tbody>'+
  res.map(function(r){return '<tr class="'+(r.ok?(r===win?'win':''):'x')+'"><td><b class="nm">'+esc(r.b.n)+'</b><br><span class="mono dim" style="font-size:11px">'+dec(r.dist)+' km · tải '+Math.round(r.pct*100)+'% · ~'+r.prep+' phút</span>'+(r.ok?'':'<span class="rsn">'+esc(r.reasons[0])+'</span>')+'</td><td>'+g(r.gates.open)+'</td><td>'+g(r.gates.area)+'</td><td>'+g(r.gates.items)+'</td><td>'+g(r.gates.load)+'</td><td>'+(r.ok?'<div class="sc"><div class="meter '+(r===win?'terra':'')+'"><i style="width:'+r.score+'%"></i></div><b>'+r.score+'</b></div>':'<span class="dim">—</span>')+'</td></tr>'}).join('')+'</tbody></table></div>';
}
function dishCard(d){
  var n=dishBranches(d.id),off=n===0;
  return '<article class="dish'+(off?' off':'')+'" data-act="dish" data-id="'+d.id+'" tabindex="0"><div class="art">'+art(d.id)+(d.tag?'<span class="tagc pill terra solid"><span>'+d.tag+'</span></span>':'')+'</div><div class="db"><div class="dn">'+esc(d.n)+'</div><div class="ds">'+esc(d.sub)+'</div><div class="dr"><span class="price">'+money(d.p)+'</span>'+(off?pill('Tạm hết','bad'):'<button class="btn sm" data-act="add" data-id="'+d.id+'">+ Thêm</button>')+'</div><div class="av"><span class="dot'+(n<3?' warn':'')+(off?' bad':'')+'"></span>'+(off?'Hết ở mọi chi nhánh':'Còn tại '+n+'/5 chi nhánh')+'</div></div></article>';
}
function cartAdd(id,q){var l=S.cart.filter(function(i){return i[0]===id})[0];if(l)l[1]=clamp(l[1]+q,1,20);else S.cart.push([id,q])}
function advance(o,who){
  if(o.st<0||o.st>=5)return false;
  o.st++;var b=BM[o.br];
  if(o.st===4&&!o.ship){var busy=orders.filter(function(x){return x.st===4&&x.ship}).map(function(x){return x.ship});
    var f=SHIP.filter(function(s){return s.br===o.br&&busy.indexOf(s.id)<0})[0]||SHIP.filter(function(s){return s.br===o.br})[0];o.ship=f?f.id:null}
  var ev=['','Chi nhánh xác nhận đơn','Bắt đầu chế biến','Món sẵn sàng giao','Giao cho '+(o.ship?SM[o.ship].n:'shipper'),'Giao thành công'][o.st];
  var t=NOW+1+o.audit.length;
  o.audit.push({t:hm(t),who:o.st>=4?'Shipper':(who||'CN '+b.n),ev:ev});
  if(o.st===5&&o.pay==='Tiền mặt')o.ps='Đã thu';
  return true;
}
function cancelOrder(o){if(o.st<0||o.st>2)return;o.st=-1;o.audit.push({t:hm(NOW+1+o.audit.length),who:'CN '+BM[o.br].n,ev:'Hủy đơn'})}