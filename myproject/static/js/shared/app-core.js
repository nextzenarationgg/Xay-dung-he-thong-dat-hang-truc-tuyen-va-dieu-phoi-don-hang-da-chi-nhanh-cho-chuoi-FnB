'use strict';
var PAGE_ROLE='customer',PAGE_HOME='home';
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var money=function(n){return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,'.')+'đ'};
var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var dec=function(n,d){return Number(n).toFixed(d==null?1:d).replace('.',',')};
var ic=function(n){return '<svg class="ic" aria-hidden="true"><use href="#i-'+n+'"/></svg>'};
var cat=function(){return '<svg viewBox="0 0 120 120" aria-hidden="true"><use href="#cat"/></svg>'};

/* ================= DATA ================= */
var CATS=[['com','Cơm thố'],['my','Mỳ cay'],['bun','Bún & nem'],['bite','Ăn vặt'],['drink','Đồ uống'],['sweet','Tráng miệng']];
var CATN={};CATS.forEach(function(c){CATN[c[0]]=c[1]});
var D=[
 {id:'d1',n:'Cơm thố xá xíu',c:'com',p:59000,k:'#9b2f24',t:12,pop:1,tag:'Bán chạy',sub:'Xá xíu mật ong, trứng ốp la, dưa leo',desc:'Xá xíu ướp ngũ vị, nướng than rồi quét mật ong, xếp trên cơm thố nén nóng. Kèm trứng ốp la lòng đào, dưa leo và nước sốt hành phi.'},
 {id:'d2',n:'Cơm thố sườn nướng mật ong',c:'com',p:65000,k:'#8a4a22',t:14,pop:4,tag:'',sub:'Sườn cốt lết nướng, rau củ xào',desc:'Sườn cốt lết ướp mật ong và sả, nướng vừa chín tới, ăn cùng cơm thố nóng và rau củ xào bơ.'},
 {id:'d3',n:'Nem nướng Nha Trang',c:'bun',p:79000,k:'#b8651e',t:15,pop:2,tag:'Đặc sản',sub:'8 xiên, bánh tráng chiên, rau sống',desc:'Nem nướng thơm mùi sả, cuốn cùng bánh tráng chiên giòn, rau sống, dưa chua và chấm nước lèo đậu phộng đặc trưng Nha Trang.'},
 {id:'d4',n:'Mỳ cay hải sản',c:'my',p:55000,k:'#c63d1c',t:10,pop:3,tag:'Cay',sub:'Tôm, mực, chả cá, trứng lòng đào',desc:'Sợi mỳ dai trong nước dùng cay Hàn Quốc, thêm tôm, mực, chả cá và trứng lòng đào. Chọn cấp độ cay từ 0 đến 7.'},
 {id:'d5',n:'Mỳ cay bò Mỹ',c:'my',p:59000,k:'#b83a1d',t:10,pop:6,tag:'Cay',sub:'Bò Mỹ thái lát, kim chi, nấm',desc:'Bò Mỹ thái lát mỏng nhúng tái, kim chi cải thảo và nấm kim châm trong nước dùng cay đậm vị.'},
 {id:'d6',n:'Bún đậu mắm tôm (mẹt vừa)',c:'bun',p:89000,k:'#d9a431',t:16,pop:5,tag:'Đặc sản',sub:'Đậu rán, chả cốm, dồi, bún lá',desc:'Mẹt vừa cho 2 người gồm đậu phụ rán giòn, chả cốm, dồi sụn, thịt chân giò, bún lá và rau thơm. Mắm tôm pha chanh, quất, ớt.'},
 {id:'d7',n:'Bún chả nem cua bể',c:'bun',p:58000,k:'#a95a22',t:13,pop:9,tag:'',sub:'Chả viên, chả miếng, nem cua bể',desc:'Chả thịt nướng than hoa ăn cùng bún tươi, nem cua bể rán giòn, nước chấm chua ngọt và đu đủ xanh ngâm.'},
 {id:'d8',n:'Gỏi cuốn tôm thịt (4 cuốn)',c:'bite',p:45000,k:'#e58a8a',t:8,pop:8,tag:'',sub:'Tôm, thịt luộc, bún, rau thơm',desc:'Bốn cuốn tôm thịt cuộn bún và rau thơm trong bánh tráng mỏng. Chấm tương đen hoặc mắm nêm.'},
 {id:'d9',n:'Chân gà sả tắc',c:'bite',p:69000,k:'#a3411f',t:12,pop:7,tag:'Ăn vặt',sub:'Chân gà rút xương, sả, tắc, ớt',desc:'Chân gà rút xương ngâm sả tắc chua cay, giòn sần sật. Nên ăn lạnh.'},
 {id:'d10',n:'Trà đào cam sả',c:'drink',p:35000,k:'#f0a35e',t:5,pop:10,tag:'',v:'tea',sub:'Đào ngâm, cam vàng, sả đập dập',desc:'Trà đen ủ lạnh, đào ngâm giòn, lát cam vàng và sả đập dập thơm.'},
 {id:'d11',n:'Trà sữa nướng Miêu',c:'drink',p:39000,k:'#c58a58',t:6,pop:11,tag:'Mới',v:'milk',sub:'Trà sữa nướng, trân châu đen',desc:'Trà sữa nướng caramel kiểu Miêu Quán, thêm trân châu đen nấu mỗi sáng.'},
 {id:'d12',n:'Cà phê muối',c:'drink',p:32000,k:'#5e3a21',t:5,pop:12,tag:'',v:'coffee',sub:'Cà phê phin, kem muối béo nhẹ',desc:'Cà phê phin đậm, phủ lớp kem muối béo nhẹ. Uống lúc kem còn mịn.'},
 {id:'d13',n:'Chè khúc bạch hạnh nhân',c:'sweet',p:38000,k:'#f6efe0',t:6,pop:13,tag:'',v:'che',sub:'Khúc bạch, nhãn, hạnh nhân lát',desc:'Khúc bạch mềm mịn, nhãn ngâm, hạnh nhân lát và nước đường phèn mát.'},
 {id:'d14',n:'Bánh flan caramel',c:'sweet',p:25000,k:'#e8b04c',t:4,pop:14,tag:'',v:'flan',sub:'Flan trứng sữa, caramel đắng nhẹ',desc:'Flan trứng sữa mịn, caramel đắng nhẹ, dùng lạnh.'}
];
D.forEach(function(d){d.global=true});
var DM={};D.forEach(function(d){DM[d.id]=d});
var BR=[
 {id:'CN01',n:'Thạch Khôi',addr:'Số 58 Quốc lộ 5, Phường Thạch Khôi, TP. Hải Phòng',lat:20.9122,lng:106.3715,x:130,y:250,open:true,accepting:true,radius:6.5,cap:14,base:4,prep:12,hours:'08:00 – 22:30',mgr:'Nguyễn Thị Hằng',tel:'0220 3555 101',staff:11},
 {id:'CN02',n:'Hải Tân',addr:'Số 25 Nguyễn Lương Bằng, Phường Hải Tân, TP. Hải Phòng',lat:20.9389,lng:106.3302,x:290,y:170,open:true,accepting:true,radius:6,cap:12,base:6,prep:11,hours:'08:00 – 22:00',mgr:'Phạm Văn Đức',tel:'0220 3555 102',staff:9},
 {id:'CN03',n:'Lê Thanh Nghị',addr:'Số 112 Lê Thanh Nghị, Phường Lê Thanh Nghị, TP. Hải Phòng',lat:20.9261,lng:106.3097,x:385,y:235,open:true,accepting:true,radius:6,cap:12,base:9,prep:13,hours:'09:00 – 22:00',mgr:'Lê Thu Trang',tel:'0220 3555 103',staff:10},
 {id:'CN04',n:'Tứ Minh',addr:'Số 14 Nguyễn Thị Duệ, Phường Tứ Minh, TP. Hải Phòng',lat:20.9547,lng:106.3188,x:470,y:120,open:true,accepting:true,radius:7.5,cap:10,base:4,prep:14,hours:'08:30 – 21:30',mgr:'Đỗ Quang Huy',tel:'0220 3555 104',staff:7},
 {id:'CN05',n:'Nam Đồng',addr:'Số 203 Điện Biên Phủ, Phường Nam Đồng, TP. Hải Phòng',lat:20.9338,lng:106.3405,x:300,y:335,open:true,accepting:true,radius:7,cap:10,base:3,prep:10,hours:'08:00 – 22:00',mgr:'Vũ Minh Châu',tel:'0220 3555 105',staff:6}
];
var BM={};BR.forEach(function(b){BM[b.id]=b});
var ADDR={
 A1:{l:'Nhà riêng',a:'Số 18, KDC Thạch Khôi, Phường Thạch Khôi, TP. Hải Phòng',pt:[150,272],d:{CN01:1.2,CN02:3.4,CN03:5.1,CN04:6.8,CN05:7.9}},
 A2:{l:'Văn phòng',a:'Số 25 Nguyễn Lương Bằng, Phường Hải Tân, TP. Hải Phòng',pt:[300,150],d:{CN01:3.6,CN02:.9,CN03:2.7,CN04:3.3,CN05:5.8}},
 A3:{l:'Phòng trọ',a:'Số 7, ngõ 120 Điện Biên Phủ, Phường Nam Đồng, TP. Hải Phòng',pt:[318,352],d:{CN01:7.2,CN02:4.1,CN03:3,CN04:2.8,CN05:.8}},
 A4:{l:'Nhà bạn',a:'Số 90 Lê Thanh Nghị, Phường Lê Thanh Nghị, TP. Hải Phòng',pt:[398,216],d:{CN01:5,CN02:2.5,CN03:.7,CN04:3.9,CN05:3.2}},
 A5:{l:'Công ty',a:'Số 33 Nguyễn Thị Duệ, Phường Tứ Minh, TP. Hải Phòng',pt:[484,104],d:{CN01:6.6,CN02:3.9,CN03:3.7,CN04:.9,CN05:2.6}}
};
var ST=['Chờ xác nhận','Đã xác nhận','Đang chuẩn bị','Sẵn sàng giao','Đang giao','Hoàn thành'];
var STC=['warn','terra','terra','ok','ok','mute'];
var VC={
 MIEU10:{t:'pct',v:10,max:30000,min:99000,d:'Giảm 10%, tối đa 30.000đ cho đơn từ 99.000đ',exp:'31.10.2026'},
 FREESHIP:{t:'ship',min:120000,d:'Miễn phí giao hàng cho đơn từ 120.000đ',exp:'15.11.2026'},
 CHAO20:{t:'amt',v:20000,min:60000,d:'Giảm 20.000đ cho đơn đầu tiên từ 60.000đ',exp:'31.12.2026'},
 CUOITUAN15:{t:'pct',v:15,max:45000,min:150000,d:'Giảm 15% vào thứ Bảy, Chủ nhật, tối đa 45.000đ',exp:'30.11.2026'}
};
var SHIP=[
 ['S1','Nguyễn Văn Hùng','CN01','0912 000 111'],['S2','Trần Đức Anh','CN01','0912 000 112'],['S3','Lê Thị Mai','CN01','0912 000 113'],
 ['S4','Phạm Quang Vinh','CN02','0912 000 114'],['S5','Hoàng Thế Sơn','CN02','0912 000 115'],['S6','Bùi Văn Tiến','CN03','0912 000 116'],
 ['S7','Đinh Công Thành','CN03','0912 000 117'],['S8','Ngô Xuân Bắc','CN04','0912 000 118'],['S9','Vũ Hải Đăng','CN05','0912 000 119']
].map(function(s){return {id:s[0],n:s[1],br:s[2],tel:s[3]}});
var SM={};SHIP.forEach(function(s){SM[s.id]=s});
var AV={};BR.forEach(function(b){AV[b.id]={};D.forEach(function(d){AV[b.id][d.id]='on'})});
AV.CN03.d3='off';AV.CN02.d6='off';AV.CN04.d13='low';AV.CN05.d9='off';AV.CN01.d13='low';

var RULES={wd:40,wl:35,wp:25,maxKm:8,maxPrep:60,maxLoad:90};
var RULES0=JSON.parse(JSON.stringify(RULES));

/* ================= STATE ================= */
var S={key:PAGE_HOME,par:null,dev:false,cart:[['d1',1],['d3',2]],voucher:null,maxP:0,sort:'pop',addr:'A1',q:'',cat:'all',catHide:{},onlyAvail:false,
 co:{name:'Nguyễn Minh Khôi',phone:'0912345658',email:'',note:'',pay:'cod'},dq:1,spice:2,dnote:'',accTab:'profile',
 br:'CN01',bq:'',bst:'all',bpay:'all',bsel:null,bmq:'',binvQ:'',
 aSel:'CN01',aq:'',aBr:'all',aSt:'all',aPay:'all',aLayer:null,aPc:'all',aUr:'all',auq:'',apq:'',aRange:'7',
 sample:[['d1',1],['d3',2]],sampleAddr:'A1',simN:0,feed:[],
 disp:null,last:null,reviews:[
  {no:'MQ-261009-0376',dish:'Cơm thố xá xíu',star:5,text:'Cơm nóng, xá xíu mềm, giao nhanh hơn dự kiến.',date:'09.10.2026'},
  {no:'MQ-261005-0128',dish:'Mỳ cay hải sản',star:4,text:'Cay đúng cấp 3, mực hơi ít nhưng nước dùng ngon.',date:'05.10.2026'}],
 rv:{star:5,text:'',no:''},saved:['A1','A2','A5'],defAddr:'A1'};

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
function prepOf(o){return o.prep||Math.round(BM[o.br].prep+8+o.items.length*2)}
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
  /* tạm thời dùng AV mặc định để lịch sử điều phối phản ánh trạng thái lúc đặt */
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

/* ================= ART ================= */
var BG={com:'#ead3ab',my:'#f0c9b3',bun:'#d6dfc3',bite:'#ebdab9',drink:'#d0dadd',sweet:'#f0dad5'};
function P(a){return a*Math.PI/180}
var AR={
com:function(d){var s='<circle cx="100" cy="100" r="86" fill="#7a4126"/><circle cx="100" cy="100" r="79" fill="#a65a33"/><circle cx="100" cy="100" r="66" fill="#f7f1e3"/>';
 for(var i=0;i<6;i++){var a=i*60-10,x=100+36*Math.cos(P(a)),y=100+36*Math.sin(P(a));s+='<g transform="translate('+x.toFixed(1)+' '+y.toFixed(1)+') rotate('+(a+90)+')"><rect x="-15" y="-8" width="30" height="16" rx="6" fill="'+d.k+'"/><rect x="-15" y="-8" width="30" height="5" rx="3" fill="#fff" opacity=".2"/></g>'}
 s+='<circle cx="100" cy="100" r="19" fill="#fff8e6"/><circle cx="100" cy="100" r="8" fill="#f2b632"/>';
 for(var j=0;j<10;j++){var b=j*36+12;s+='<circle cx="'+(100+55*Math.cos(P(b))).toFixed(1)+'" cy="'+(100+55*Math.sin(P(b))).toFixed(1)+'" r="2.6" fill="#5a9a3d"/>'}
 return s},
my:function(d){var s='<circle cx="100" cy="100" r="86" fill="#2a1d18"/><circle cx="100" cy="100" r="78" fill="'+d.k+'"/><circle cx="100" cy="100" r="74" fill="none" stroke="#e8a15a" stroke-width="3" opacity=".35"/>';
 [[52,86],[56,104],[60,122],[66,70]].forEach(function(p){s+='<path d="M'+p[0]+' '+p[1]+' q14 -22 28 0 t28 0 t28 0" fill="none" stroke="#f2c867" stroke-width="5.5" stroke-linecap="round"/>'});
 s+='<ellipse cx="130" cy="68" rx="15" ry="11" fill="#fff6e4"/><circle cx="130" cy="68" r="6" fill="#f2a516"/>';
 s+='<path d="M64 134 q8 -16 22 -8 q-2 12 -16 14z" fill="#f08a7a"/><path d="M92 140 q10 -14 22 -6 q-4 12 -18 12z" fill="#f08a7a"/>';
 for(var i=0;i<14;i++){var a=i*26,r=40+(i%4)*8;s+='<circle cx="'+(100+r*Math.cos(P(a))).toFixed(1)+'" cy="'+(100+r*Math.sin(P(a))).toFixed(1)+'" r="1.8" fill="'+(i%3?'#6aa84a':'#7a1a0e')+'"/>'}
 return s},
bun:function(d){var s='<circle cx="100" cy="100" r="86" fill="#f4ecd8"/><circle cx="100" cy="100" r="86" fill="none" stroke="#d3c19a" stroke-width="3"/>',i;
 if(d.id==='d6'){
  [[56,60],[92,52],[128,64]].forEach(function(p){s+='<rect x="'+p[0]+'" y="'+p[1]+'" width="30" height="30" rx="5" fill="#e0a73a"/><rect x="'+(p[0]+4)+'" y="'+(p[1]+4)+'" width="22" height="22" rx="3" fill="none" stroke="#c9902a" opacity=".6"/>'});
  [[50,108],[86,112]].forEach(function(p){s+='<rect x="'+p[0]+'" y="'+p[1]+'" width="30" height="30" rx="4" fill="#fffdf6" stroke="#e6dcc3"/><path d="M'+(p[0]+4)+' '+(p[1]+10)+'h22M'+(p[0]+4)+' '+(p[1]+20)+'h22" stroke="#eee4cc"/>'});
  s+='<circle cx="146" cy="126" r="20" fill="#8a7a98"/><circle cx="146" cy="126" r="14" fill="#a595b2"/>';
  [[70,162],[104,160],[134,158]].forEach(function(p){s+='<ellipse cx="'+p[0]+'" cy="'+p[1]+'" rx="11" ry="7" fill="#c4572f" transform="rotate(-20 '+p[0]+' '+p[1]+')"/>'});
  for(i=0;i<7;i++)s+='<ellipse cx="'+(50+i*17)+'" cy="'+(34+(i%2)*6)+'" rx="8" ry="4" fill="#5c9a46" transform="rotate('+(i*20-50)+' '+(50+i*17)+' 34)"/>';
 }else{
  for(var r=0;r<4;r++){var y=58+r*22;s+='<g transform="rotate(-8 100 '+y+')"><rect x="52" y="'+(y-8)+'" width="86" height="16" rx="8" fill="'+d.k+'"/><rect x="56" y="'+(y-6)+'" width="78" height="5" rx="3" fill="#fff" opacity=".22"/></g>'}
  s+='<circle cx="150" cy="130" r="17" fill="#7c3a1a"/><circle cx="150" cy="130" r="11" fill="#9a5028"/>';
  for(i=0;i<8;i++)s+='<ellipse cx="'+(46+i*14)+'" cy="'+(150+(i%2)*6)+'" rx="9" ry="4.5" fill="#5c9a46" transform="rotate('+(i*25-90)+' '+(46+i*14)+' 150)"/>';
  s+='<circle cx="62" cy="40" r="16" fill="#fffaf0" stroke="#e5d8b8"/>';
 }
 return s},
bite:function(d){var s='<circle cx="100" cy="100" r="86" fill="#f5eedb"/><circle cx="100" cy="100" r="86" fill="none" stroke="#d7c79f" stroke-width="3"/>';
 if(d.id==='d8'){for(var i=0;i<4;i++){var y=54+i*24;s+='<g transform="rotate(-10 100 '+y+')"><rect x="46" y="'+(y-9)+'" width="96" height="18" rx="9" fill="#f7efe0" stroke="#e6dac0"/><circle cx="64" cy="'+y+'" r="4" fill="'+d.k+'"/><circle cx="82" cy="'+y+'" r="4" fill="'+d.k+'"/><path d="M98 '+y+'h34" stroke="#79ad5a" stroke-width="4" stroke-linecap="round"/></g>'}
  s+='<circle cx="160" cy="150" r="18" fill="#5a2a14"/><circle cx="160" cy="150" r="12" fill="#7a3d1e"/>';
 }else{for(var j=0;j<7;j++){var a=j*51+10,x=100+44*Math.cos(P(a)),y2=100+44*Math.sin(P(a));s+='<g transform="translate('+x.toFixed(1)+' '+y2.toFixed(1)+') rotate('+a+')"><path d="M-16 -7 q16 -10 32 0 q4 7 -2 10 q-12 4 -26 2 q-8 -4 -4 -12z" fill="'+d.k+'"/><circle cx="14" cy="-3" r="5" fill="'+d.k+'"/></g>'}
  s+='<circle cx="100" cy="100" r="16" fill="#6aa84a"/><circle cx="100" cy="100" r="9" fill="#e4eec2"/>';
  for(var m=0;m<6;m++)s+='<circle cx="'+(78+m*9)+'" cy="'+(100+((m%2)?6:-6))+'" r="2.4" fill="#c7351e"/>';}
 return s},
drink:function(d){var s='<circle cx="100" cy="100" r="84" fill="#eef2f4" stroke="#c4ced3" stroke-width="3"/><circle cx="100" cy="100" r="74" fill="'+d.k+'"/>',i;
 if(d.v==='coffee'){s+='<circle cx="100" cy="100" r="62" fill="#f3e9d4"/><circle cx="100" cy="100" r="48" fill="#fbf4e4"/><circle cx="100" cy="100" r="30" fill="#f1e5c9"/>';
  for(i=0;i<12;i++)s+='<circle cx="'+(100+55*Math.cos(P(i*30))).toFixed(1)+'" cy="'+(100+55*Math.sin(P(i*30))).toFixed(1)+'" r="1.6" fill="#9d8057"/>'}
 else if(d.v==='milk'){for(i=0;i<22;i++){var a=i*47,r=14+(i*13)%52;s+='<circle cx="'+(100+r*Math.cos(P(a))).toFixed(1)+'" cy="'+(100+r*Math.sin(P(a))).toFixed(1)+'" r="5.5" fill="#2b1b12"/>'}
  s+='<circle cx="140" cy="62" r="10" fill="#f0e2c8" opacity=".7"/>'}
 else{[[70,78],[112,66],[96,116],[128,108]].forEach(function(p){s+='<rect x="'+p[0]+'" y="'+p[1]+'" width="22" height="22" rx="4" fill="#fff" opacity=".5" transform="rotate('+(p[0]%40)+' '+(p[0]+11)+' '+(p[1]+11)+')"/>'});
  s+='<circle cx="76" cy="132" r="19" fill="#f6a43a"/><circle cx="76" cy="132" r="13" fill="#fcc66a"/>';
  for(i=0;i<6;i++)s+='<path d="M76 132 L'+(76+13*Math.cos(P(i*60))).toFixed(1)+' '+(132+13*Math.sin(P(i*60))).toFixed(1)+'" stroke="#f6a43a"/>';
  s+='<path d="M120 124 q10 6 18 -4" stroke="#6aa84a" stroke-width="4" fill="none"/>'}
 s+='<circle cx="140" cy="56" r="8" fill="none" stroke="#e44d4d" stroke-width="5"/>';
 return s},
sweet:function(d){var s='<circle cx="100" cy="100" r="86" fill="#f6efe2" stroke="#d9cdb2" stroke-width="3"/>',j;
 if(d.v==='flan'){s+='<circle cx="100" cy="100" r="54" fill="#e8b04c"/><circle cx="100" cy="100" r="46" fill="#f0c668"/><path d="M62 92 q38 -34 76 0 q4 22 -8 40 q-30 14 -60 0 q-12 -18 -8 -40z" fill="#8a4a16"/><path d="M80 118 q4 18 8 22 M120 112 q2 14 -2 24" stroke="#8a4a16" stroke-width="6" stroke-linecap="round" fill="none"/><circle cx="100" cy="96" r="9" fill="#c0392b"/>'}
 else{s+='<circle cx="100" cy="100" r="64" fill="#fdf8ee" stroke="#e9dfc8" stroke-width="2"/>';
  [[70,76],[96,68],[122,80],[84,102],[112,108],[70,122],[100,128]].forEach(function(p,i){s+='<rect x="'+p[0]+'" y="'+p[1]+'" width="20" height="20" rx="4" fill="'+(i%2?'#ffffff':'#f9eef0')+'" stroke="#eadfcf" transform="rotate('+(i*13)+' '+(p[0]+10)+' '+(p[1]+10)+')"/>'});
  [[58,100],[132,100],[100,56]].forEach(function(p){s+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="8" fill="#efe0c2"/><circle cx="'+p[0]+'" cy="'+p[1]+'" r="3" fill="#6b3d1c"/>'});
  for(j=0;j<7;j++)s+='<ellipse cx="'+(70+j*10)+'" cy="'+(140-(j%3)*4)+'" rx="7" ry="3" fill="#e6c58a" transform="rotate('+(j*30)+' '+(70+j*10)+' 140)"/>'}
 return s}
};
function art(id){var d=DM[id];return '<svg viewBox="0 0 200 200" role="img" aria-label="Minh họa '+esc(d.n)+'"><rect width="200" height="200" fill="'+BG[d.c]+'"/>'+AR[d.c](d)+'</svg>'}
function fold(s){return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d')}

/* ================= HELPERS ================= */
var V={},ACT={},INP={},LAY={};
function pill(t,c){return '<span class="pill '+(c||'mute')+'">'+t+'</span>'}
function stPill(st){return st===-1?pill('Đã hủy','bad'):pill(ST[st],STC[st])}
function ph(eye,title,right){return '<div class="ph"><div class="grow"><div class="cap">'+eye+'</div><h1 class="h1">'+title+'</h1></div>'+(right||'')+'</div>'}
function roleOf(k){return k.indexOf('b-')===0?'branch':(k.indexOf('a-')===0?'admin':'customer')}
function isCustomerAuthenticated(){return document.body.dataset.customerAuthenticated==='true'}
function requiresCustomerLogin(k){return ['account','orders','cart','checkout','dispatch','tracking'].indexOf(k)!==-1}
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

/* ================= SHELL ================= */
function topbar(){
  var r=roleOf(S.key),home={customer:'home',branch:'b-dash',admin:'a-ctrl'}[r];
  return '<header class="top"><div class="top-in"><button class="brand" data-act="go" data-k="'+home+'" aria-label="Miêu Quán">'+cat()+'<span><span class="wm">MIÊU QUÁN</span><span class="wm-sub">Điều phối bếp thông minh</span></span></button>'+
  '<button class="tool" data-act="theme">SÁNG / TỐI</button>'+(r==='customer'?custNav():'')+'</div></header>';
}
function sideNav(items,cur){return '<nav class="snav" aria-label="Điều hướng">'+items.map(function(x){return '<button class="'+(cur===x[0]?'on':'')+'" data-act="go" data-k="'+x[0]+'">'+ic(x[2])+'<span>'+x[1]+'</span>'+(x[3]?'<span class="ct">'+x[3]+'</span>':'')+'</button>'}).join('')+'</nav>'}
var app=$('#app');
function render(o){
  o=o||{};var ae=document.activeElement,fid=ae&&ae.id,sp=ae&&ae.selectionStart,y=window.scrollY;
  var v=V[S.key];if(!v||roleOf(S.key)!==PAGE_ROLE){S.key=PAGE_HOME;S.par=null;v=V[PAGE_HOME]}
  var r=roleOf(S.key),h=v.html();
  app.innerHTML=topbar()+(r==='customer'?'<main class="wrap pg">'+h+'</main>':'<div class="console">'+(r==='branch'?sideBranch():sideAdmin())+'<main class="cmain">'+h+'</main></div>');
  renderLayer();devUpd();
  if(v.after)v.after();
  if(fid){var e=document.getElementById(fid);if(e&&e!==document.activeElement){e.focus();try{if(sp!=null&&e.setSelectionRange)e.setSelectionRange(sp,sp)}catch(x){}}}
  window.scrollTo(0,o.top?0:y);
}
function renderLayer(){
  var L=$('#layer'),l=S.layer;
  if(!l){L.innerHTML='';return}
  L.innerHTML='<div class="ovl" data-act="closeLayer"></div>'+LAY[l.k](l);
}
function devUpd(){
  var d=$('#dev'),v=V[S.key];
  if(!S.dev||!v||!v.dj){d.hidden=true;return}
  d.hidden=false;d.innerHTML='<b>URL</b> GET '+v.dj[0]+'<br><b>Template</b> templates/'+v.dj[1]+'<br><b>View</b> '+v.dj[2]+'<br><b>CSS</b> static/css/mq.css (token + Bootstrap override)';
}
function setHash(){try{var h=S.key+(S.par?'.'+S.par:'');if(location.hash!=='#'+h)history.replaceState(null,'','#'+h)}catch(e){}}
function stopDisp(){clearTimeout(dispT);dispT=null}
var dispT=null;
function go(k,par){
  if(requiresCustomerLogin(k)&&!isCustomerAuthenticated()){
    window.location.assign(document.body.dataset.signinUrl||'/customer/signin/');
    return;
  }
  if(roleOf(k)!==PAGE_ROLE)return;
  if(k!=='dispatch')stopDisp();
  S.key=k;S.par=par==null?null:par;S.layer=null;
  if(k==='dish'){S.dq=1;S.dnote=''}
  render({top:true});setHash();
}


/* ================= SHARED ACTIONS ================= */
ACT.go=function(d){go(d.k,d.p)};
ACT.role=function(d){go({customer:'home',branch:'b-dash',admin:'a-ctrl'}[d.r])};
ACT.dev=function(){S.dev=!S.dev;render()};
ACT.theme=function(){try{var r=document.documentElement,cur=r.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');r.setAttribute('data-theme',cur==='dark'?'light':'dark')}catch(e){}};
ACT.closeLayer=function(){S.layer=null;renderLayer()};
INP.brsel=function(v){S.br=v;S.bsel=null;render()};

/* ================= EVENT DELEGATION ================= */
document.addEventListener('click',function(e){var el=e.target.closest('[data-act]');if(!el)return;var f=ACT[el.dataset.act];if(f){e.preventDefault();f(el.dataset,el,e)}});
document.addEventListener('input',function(e){var el=e.target.closest('[data-in]');if(el&&INP[el.dataset.in])INP[el.dataset.in](el.value,el,e)});
document.addEventListener('keydown',function(e){if(e.key==='Enter'){var el=e.target;if(el&&el.matches&&el.matches('[data-act][tabindex]')){e.preventDefault();el.dispatchEvent(new MouseEvent('click',{bubbles:true}))}}if(e.key==='Escape'&&S.layer){S.layer=null;renderLayer()}});

/* ================= APP INITIALIZATION ================= */
function fromHash(){
  var h=(location.hash||'').slice(1);if(!h)return false;
  var i=h.indexOf('.'),k=i<0?h:h.slice(0,i),p=i<0?null:h.slice(i+1);
  if(requiresCustomerLogin(k)&&!isCustomerAuthenticated()){
    window.location.replace(document.body.dataset.signinUrl||'/customer/signin/');
    return false;
  }
  if(V[k]&&roleOf(k)===PAGE_ROLE){S.key=k;S.par=p;if(k==='dish')S.dq=1;return true}return false;
}
function initApp(){
  S.key=PAGE_HOME;S.par=null;
  if(!fromHash())setHash();render({top:true});
  window.addEventListener('hashchange',function(){var h=(location.hash||'').slice(1),cur=S.key+(S.par?'.'+S.par:'');if(h!==cur){if(fromHash()){stopDisp();S.layer=null;render({top:true})}else setHash()}});
}
