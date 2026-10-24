(function(){
'use strict';
var PAGE_ROLE='branch',PAGE_HOME='b-dash';
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
var S={key:PAGE_HOME,par:null,dev:false,cart:[['d1',1],['d3',2]],voucher:null,maxP:0,sort:'pop',addr:'A1',q:'',cat:'all',onlyAvail:false,
 co:{name:'Nguyễn Minh Khôi',phone:'0912345658',note:'',pay:'cod'},dq:1,spice:2,dnote:'',accTab:'profile',
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
function custNav(){
  var g={dish:'menu',cart:'cart',checkout:'cart',dispatch:'cart',tracking:'orders'}[S.key]||S.key;
  var it=[['home','Trang chủ'],['menu','Thực đơn'],['orders','Đơn hàng của tôi'],['offers','Ưu đãi'],['account','Tài khoản']];
  return '<nav class="cnav" aria-label="Điều hướng khách hàng">'+it.map(function(x){return '<button class="'+(g===x[0]?'on':'')+'" data-act="go" data-k="'+x[0]+'">'+x[1]+'</button>'}).join('')+'<button class="cartb'+(g==='cart'?' on':'')+'" data-act="go" data-k="cart">Giỏ hàng <span class="badge">'+cartCount()+'</span></button></nav>';
}
function topbar(){
  var r=roleOf(S.key),home={customer:'home',branch:'b-dash',admin:'a-ctrl'}[r];
  return '<header class="top"><div class="top-in"><button class="brand" data-act="go" data-k="'+home+'" aria-label="Miêu Quán">'+cat()+'<span><span class="wm">MIÊU QUÁN</span><span class="wm-sub">Điều phối bếp thông minh</span></span></button>'+
  '<button class="tool" data-act="theme">SÁNG / TỐI</button>'+(r==='customer'?custNav():'')+'</div></header>';
}
function sideNav(items,cur){return '<nav class="snav" aria-label="Điều hướng">'+items.map(function(x){return '<button class="'+(cur===x[0]?'on':'')+'" data-act="go" data-k="'+x[0]+'">'+ic(x[2])+'<span>'+x[1]+'</span>'+(x[3]?'<span class="ct">'+x[3]+'</span>':'')+'</button>'}).join('')+'</nav>'}
function sideBranch(){
  var b=BM[S.br],nw=orders.filter(function(o){return o.br===b.id&&o.st===0}).length,rd=orders.filter(function(o){return o.br===b.id&&o.st===3&&!o.ship}).length;
  var branchLabel=app.getAttribute('data-branch-name');
  return '<aside class="side"><div class="sh"><div class="cap">Bảng điều khiển chi nhánh</div>'+(branchLabel?'<div class="branch-name">CN '+esc(branchLabel)+'</div>':'<select id="brsel" data-in="brsel" aria-label="Chọn chi nhánh">'+branchOpt(S.br)+'</select>')+'</div>'+
  sideNav([['b-dash','Tổng quan chi nhánh','grid'],['b-orders','Đơn hàng','box',nw||''],['b-menu','Thực đơn chi nhánh','dish'],['b-inv','Kho hàng','store'],['b-ship','Giao hàng','truck',rd||'']],S.key)+
  '<div class="tog"><button class="sw'+(b.accepting?' on':'')+'" data-act="accept" data-id="'+b.id+'" aria-label="Nhận đơn" aria-pressed="'+b.accepting+'"></button><span>'+(b.accepting?'Đang nhận đơn':'Tạm ngưng nhận đơn')+'</span></div></aside>';
}
function sideAdmin(){
  var ov=BR.filter(function(b){return liveLoad(b)/b.cap>RULES.maxLoad/100}).length;
  return '<aside class="side"><div class="sh"><div class="cap">Trung tâm điều hành</div><div style="font:800 17px var(--f-d);font-stretch:112%;margin-top:6px">Toàn chuỗi · 5 chi nhánh</div></div>'+
  sideNav([['a-ctrl','Tổng quan toàn chuỗi','radar',ov||''],['a-disp','Điều phối đơn','list'],['a-br','Chi nhánh','pin'],['a-prod','Món ăn','dish'],['a-ord','Đơn hàng','box'],['a-usr','Người dùng','user'],['a-rep','Báo cáo','chart'],['a-cfg','Cấu hình','cog']],S.key)+'</aside>';
}
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
  if(roleOf(k)!==PAGE_ROLE)return;
  if(k!=='dispatch')stopDisp();
  S.key=k;S.par=par==null?null:par;S.layer=null;
  if(k==='dish'){S.dq=1;S.dnote=''}
  render({top:true});setHash();
}

/* ================= GENERIC ACTIONS ================= */
ACT.go=function(d){go(d.k,d.p)};
ACT.role=function(d){go({customer:'home',branch:'b-dash',admin:'a-ctrl'}[d.r])};
ACT.dev=function(){S.dev=!S.dev;render()};
ACT.theme=function(){try{var r=document.documentElement,cur=r.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');r.setAttribute('data-theme',cur==='dark'?'light':'dark')}catch(e){}};
ACT.closeLayer=function(){S.layer=null;renderLayer()};
ACT.accept=function(d){var b=BM[d.id];b.accepting=!b.accepting;toast(b.n+(b.accepting?': đã mở nhận đơn':': tạm ngưng nhận đơn, điều phối sẽ bỏ qua chi nhánh này'));render()};
ACT.add=function(d){cartAdd(d.id,1);toast('Đã thêm '+DM[d.id].n);render()};
ACT.inc=function(d){cartAdd(d.id,1);render()};
ACT.dec=function(d){var l=S.cart.filter(function(i){return i[0]===d.id})[0];if(l){if(l[1]>1)l[1]--;else S.cart=S.cart.filter(function(i){return i!==l})}render()};
ACT.rm=function(d){S.cart=S.cart.filter(function(i){return i[0]!==d.id});render()};
ACT.dish=function(d){go('dish',d.id)};
INP.brsel=function(v){S.br=v;S.bsel=null;render()};
INP.addr=function(v){S.addr=v;render()};
document.addEventListener('click',function(e){var el=e.target.closest('[data-act]');if(!el)return;var f=ACT[el.dataset.act];if(f){e.preventDefault();f(el.dataset,el,e)}});
document.addEventListener('input',function(e){var el=e.target.closest('[data-in]');if(el&&INP[el.dataset.in])INP[el.dataset.in](el.value,el,e)});
document.addEventListener('keydown',function(e){if(e.key==='Enter'){var el=e.target;if(el&&el.matches&&el.matches('[data-act][tabindex]')){e.preventDefault();el.dispatchEvent(new MouseEvent('click',{bubbles:true}))}}if(e.key==='Escape'&&S.layer){S.layer=null;renderLayer()}});

/* ================= CUSTOMER: HOME ================= */
V.home={dj:['/','customer/home.html','HomeView.as_view()'],html:function(){
  var items=S.cart.length?S.cart:[['d1',1]];
  var res=evalBranches(items,S.addr),win=res.filter(function(r){return r.ok})[0];
  var near=BR.map(function(b){return {b:b,d:ADDR[S.addr].d[b.id]}}).sort(function(a,b){return a.d-b.d});
  var ring='<svg class="ring" viewBox="0 0 200 200" aria-hidden="true"><defs><path id="rp" d="M100 100m-90 0a90 90 0 1 1 180 0a90 90 0 1 1-180 0"/></defs><text><textPath href="#rp" textLength="556" lengthAdjust="spacing">MIÊU QUÁN · ĐÚNG BẾP · ĐÚNG GIỜ · ĐIỀU PHỐI THÔNG MINH · HẢI PHÒNG ·</textPath></text></svg>';
  var tk=win?'<div class="tk plate" style="padding:12px 14px"><div class="cap">Ví dụ điều phối</div><div style="font:800 17px/1.15 var(--f-d);font-stretch:110%;margin:6px 0 2px">Miêu Quán '+esc(win.b.n)+'</div><div class="mono dim" style="font-size:12px">'+dec(win.dist)+' km · tải '+Math.round(win.pct*100)+'% · ~'+win.prep+' phút chuẩn bị</div><div class="meter terra" style="margin-top:10px"><i style="width:'+win.score+'%"></i></div><div class="row" style="justify-content:space-between;margin-top:6px"><span class="cap">Điểm phù hợp</span><b class="num" style="font-size:22px">'+win.score+'</b></div></div>':'';
  var hero='<section class="hero"><div><div class="cap" style="margin-bottom:18px">Chuỗi bếp Hải Phòng · 5 chi nhánh · Thứ Hai 12.10.2026</div>'+
   '<h1 class="hero-h"><span class="l1">Miêu Quán <b>–</b></span>Điều phối <span class="it u">thông minh,</span> đúng bếp phù hợp</h1>'+
   '<p class="lead" style="margin:22px 0 26px">Mỗi đơn được kiểm tra vùng giao, món còn hàng, tải bếp và thời gian chuẩn bị trong vài giây, rồi giao cho bếp phù hợp nhất với địa chỉ của bạn.</p>'+
   '<form class="searchbar" data-form="hsearch" role="search"><input id="hq" type="search" placeholder="Tìm cơm thố, nem nướng, mỳ cay, bún đậu…" aria-label="Tìm món"><button class="btn terra" type="submit" data-act="hsearch">Tìm món<span>&nbsp;→</span></button></form>'+
   '<div class="row" style="margin-top:16px">'+['Cơm thố','Nem nướng','Mỳ cay','Bún đậu'].map(function(t){return '<button class="chip" data-act="hchip" data-q="'+t+'">'+t+'</button>'}).join('')+'</div></div>'+
   '<div class="emb"><div class="disc"></div><div class="cat">'+cat()+'</div>'+ring+'<div class="stamp">Điều phối<br>tự động · 2,4 giây</div>'+tk+'</div></section>';
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
function prepOf(o){return o.prep||Math.round(BM[o.br].prep+8+o.items.length*2)}
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

/* ================= BRANCH ================= */
var NEXT=['Xác nhận đơn','Bắt đầu chế biến','Đánh dấu sẵn sàng giao','Giao cho shipper','Hoàn thành giao'];
function bOrd(bid){return orders.filter(function(o){return o.br===bid&&!o.hist})}
function sla(o){return o.st===0?5:(o.st===1?10:Math.max(8,prepOf(o)-4))}
function slaState(o){if(o.st<0||o.st>2)return null;var r=o.ago/sla(o);return r>=1?['Trễ','bad']:(r>=.75?['Sắp trễ','warn']:null)}
function invLow(bid){return INV[bid].filter(function(r){return r.q<r.min*1.25})}
function shipBusy(){return orders.filter(function(o){return o.st===4&&o.ship}).map(function(o){return o.ship})}
V['b-dash']={dj:['/chi-nhanh/tong-quan/','branch/dashboard.html','BranchDashboardView (HTMX hx-trigger="every 15s")'],html:function(){
  var b=BM[S.br],os=bOrd(b.id);
  var branchName=app.getAttribute('data-branch-name')||b.n;
  var nw=os.filter(function(o){return o.st===0}),pr=os.filter(function(o){return o.st===1||o.st===2}),rd=os.filter(function(o){return o.st===3}),sh=os.filter(function(o){return o.st===4});
  var load=liveLoad(b),pct=load/b.cap,cls=loadCls(pct);
  var q=os.filter(function(o){return o.st>=0&&o.st<=2}).sort(function(x,y){return (y.ago/sla(y)+(y.st===0?.3:0))-(x.ago/sla(x)+(x.st===0?.3:0))});
  var segs='<div class="segs '+cls+'" aria-label="Tải bếp">'+Array.apply(null,Array(b.cap)).map(function(_,i){return '<i class="'+(i<load?'f':'')+'"></i>'}).join('')+'</div>';
  var hr=['08','09','10','11','12','13','14','15','16','17','18','19','20','21'],nowI=2,mx=Math.max.apply(null,HOURS);
  var bars='<div class="bars">'+HOURS.map(function(v,i){return '<i class="'+(i===nowI?'now':(i>nowI?'fut':''))+'" style="height:'+(i>nowI?100:Math.round(v/mx*100))+'%" title="'+hr[i]+'h: '+v+' đơn"></i>'}).join('')+'</div><div class="axis">'+hr.map(function(h,i){return '<span>'+(i%2?'':h)+'</span>'}).join('')+'</div>';
  var low=invLow(b.id),offs=D.filter(function(d){return AV[b.id][d.id]!=='on'});
  var qh=q.length?q.map(function(o,i){var s=slaState(o);return '<div class="qi'+(s&&s[1]==='bad'?' late':'')+'"><div class="rk">'+(i+1)+'</div><div style="min-width:0"><div class="row" style="gap:8px"><b>'+o.no.slice(-4)+'</b><span class="dim">· '+esc(o.cust)+'</span>'+stPill(o.st)+(s?pill(s[0],s[1]):'')+'</div><div class="dim" style="font-size:13px;margin-top:3px">'+esc(itemsText(o.items))+'</div><div class="mono dim" style="font-size:11.5px;margin-top:3px">Chờ '+o.ago+' phút · '+dec(o.dist)+' km · '+money(o.total)+'</div></div><button class="btn sm'+(o.st===0?' terra':'')+'" data-act="adv" data-no="'+o.no+'">'+NEXT[o.st]+'</button></div>'}).join(''):'<div class="empty">Không có đơn nào đang chờ xử lý.</div>';
  return ph('Chi nhánh '+b.id+' · '+esc(b.addr),'Miêu Quán <span class="it">'+esc(branchName)+'</span>','<div class="row"><span class="pill '+(b.accepting?'ok':'warn')+'">'+(b.accepting?'Đang nhận đơn':'Tạm ngưng')+'</span><span class="mono dim" style="font-size:12px">'+b.hours+'</span></div>')+
  '<div class="bento">'+
  '<div class="plate s3'+(nw.length?' terra':'')+'"><div class="kpi"><span class="cap">Đơn mới</span><span class="num">'+nw.length+'</span><span class="d">'+(nw.length?'Cần xác nhận ngay':'Không có đơn chờ')+'</span></div></div>'+
  '<div class="plate s3"><div class="kpi"><span class="cap">Đang chuẩn bị</span><span class="num">'+pr.length+'</span><span class="d">Ước tính ~'+Math.round(b.prep+load*1.4)+' phút cho đơn mới</span></div></div>'+
  '<div class="plate s3"><div class="kpi"><span class="cap">Sẵn sàng giao</span><span class="num">'+rd.length+'</span><span class="d">'+rd.filter(function(o){return !o.ship}).length+' đơn chưa có shipper</span></div></div>'+
  '<div class="plate ink s3"><div class="kpi"><span class="cap">Đang giao</span><span class="num">'+sh.length+'</span><span class="d" style="color:inherit;opacity:.7">'+shipBusy().filter(function(id){return SM[id].br===b.id}).length+'/'+SHIP.filter(function(s){return s.br===b.id}).length+' shipper đang bận</span></div></div>'+
  '<section class="plate s7 r2"><div class="row" style="margin-bottom:6px"><h2 class="h3">Hàng đợi ưu tiên</h2><span class="cap right">Xếp theo mức sát hạn xử lý</span></div><div class="queue">'+qh+'</div></section>'+
  '<section class="plate s5"><div class="row" style="margin-bottom:12px"><h2 class="h3">Tải bếp</h2><b class="num right" style="font-size:30px">'+Math.round(pct*100)+'%</b></div>'+segs+'<div class="row mono dim" style="font-size:12px;margin-top:10px;justify-content:space-between"><span>'+load+' / '+b.cap+' đơn đồng thời</span><span>Ngưỡng loại: '+RULES.maxLoad+'%</span></div>'+(pct*100>RULES.maxLoad?'<p style="color:var(--bad);font-weight:600;margin-top:10px;font-size:13.5px">Đang quá ngưỡng, điều phối sẽ không giao thêm đơn cho bếp này.</p>':'')+'</section>'+
  '<section class="plate s5"><div class="row" style="margin-bottom:12px"><h2 class="h3">Đơn theo giờ</h2><span class="cap right">Hôm nay</span></div>'+bars+'</section>'+
  '<section class="plate s6"><div class="row" style="margin-bottom:8px"><h2 class="h3">Kho sắp hết</h2><button class="btn ghost sm right" data-act="go" data-k="b-inv">Mở kho</button></div>'+(low.length?low.map(function(r){return '<div class="il"><span>'+esc(r.n)+'</span><span class="mono">'+r.q+' / '+r.min+' '+r.u+' '+pill(r.q<r.min?'Thiếu':'Sắp hết',r.q<r.min?'bad':'warn')+'</span></div>'}).join(''):'<div class="empty">Kho đủ hàng.</div>')+'</section>'+
  '<section class="plate s6"><div class="row" style="margin-bottom:8px"><h2 class="h3">Món không bán đủ</h2><button class="btn ghost sm right" data-act="go" data-k="b-menu">Quản lý</button></div>'+(offs.length?offs.map(function(d){return '<div class="il"><span>'+esc(d.n)+'</span>'+pill(AV[b.id][d.id]==='off'?'Hết':'Sắp hết',AV[b.id][d.id]==='off'?'bad':'warn')+'</div>'}).join(''):'<div class="empty">Tất cả món đang bán bình thường.</div>')+'</section></div>';
}};
ACT.adv=function(d){var o=oBy(d.no);if(o&&advance(o)){toast('Đơn '+o.no.slice(-4)+': '+ST[o.st])}render()};

/* ---- branch orders ---- */
V['b-orders']={dj:['/chi-nhanh/don-hang/','branch/orders.html','BranchOrderListView (?status=&q=&pay=) + POST /don-hang/<id>/status/'],html:function(){
  var b=BM[S.br],all=bOrd(b.id);
  var q=fold(S.bq.trim());
  var l=all.filter(function(o){return (S.bst==='all'||String(o.st)===S.bst)&&(S.bpay==='all'||o.pay===S.bpay)&&(!q||fold(o.no+' '+o.cust+' '+itemsText(o.items)).indexOf(q)>-1)}).sort(function(x,y){return x.ago-y.ago});
  var cnt=function(s){return all.filter(function(o){return String(o.st)===s}).length};
  var chips=[['all','Tất cả',all.length]].concat(ST.map(function(s,i){return [String(i),s,cnt(String(i))]})).concat([['-1','Đã hủy',cnt('-1')]]);
  var sel=oBy(S.bsel);if(!sel||sel.br!==b.id||sel.hist)sel=l[0]||null;
  var det='';
  if(sel){var a=ADDR[sel.ak],canC=sel.st>=0&&sel.st<=2,nx=sel.st>=0&&sel.st<5;
    det='<aside class="plate" style="position:sticky;top:96px"><div class="row"><b class="num" style="font-size:22px">'+sel.no+'</b>'+stPill(sel.st)+'</div><div class="mono dim" style="font-size:12px;margin:6px 0 14px">Đặt lúc '+esc(sel.t)+' · '+esc(sel.pay)+' · '+esc(sel.ps)+'</div>'+
    '<div class="cap">Khách hàng</div><div style="margin:4px 0 12px"><b>'+esc(sel.cust)+'</b> · <span class="mono">'+esc(sel.tel)+'</span><div class="dim" style="font-size:13px">'+esc(a.a)+' · '+dec(sel.dist)+' km</div>'+(sel.note?'<div style="margin-top:6px;padding:6px 8px;background:var(--paper-2);font-size:13px">Ghi chú: '+esc(sel.note)+'</div>':'')+'</div>'+
    '<div class="cap">Món</div>'+sel.items.map(function(i){var d=DM[i[0]];return '<div class="il"><span>'+esc(d.n)+' <b class="mono">× '+i[1]+'</b></span><span class="mono">'+money(d.p*i[1])+'</span></div>'}).join('')+
    '<div class="tot big"><span class="cap">Tổng</span><span class="num" style="font-size:24px">'+money(sel.total)+'</span></div>'+
    '<div class="cap" style="margin:14px 0 8px">Chuyển trạng thái hợp lệ</div><div class="row" style="gap:4px;margin-bottom:14px">'+ST.map(function(s,i){var cur=i===sel.st,nxt=i===sel.st+1&&sel.st>=0;return '<span class="pill '+(cur?'terra solid':(nxt?'ok':'mute'))+'" style="'+(cur||nxt?'':'opacity:.4')+'">'+(cur?'<span>'+s+'</span>':s)+'</span>'}).join('')+'</div>'+
    '<div class="acts"><button class="btn terra" data-act="adv" data-no="'+sel.no+'"'+(nx?'':' disabled')+'>'+(nx?NEXT[sel.st]:'Không còn bước tiếp')+'</button><button class="btn ghost" data-act="cancelo" data-no="'+sel.no+'"'+(canC?'':' disabled')+'>Hủy đơn</button></div>'+
    (sel.st===3?'<p class="mono dim" style="font-size:11.5px;margin-top:10px">Cần phân công shipper ở mục Giao hàng.</p>':'')+
    '<div class="cap" style="margin:18px 0 8px">Nhật ký</div><ul class="audit">'+sel.audit.map(function(x){return '<li><time>'+x.t+' · '+esc(x.who)+'</time>'+esc(x.ev)+'</li>'}).join('')+'</ul></aside>';
  }
  return ph('Chi nhánh '+b.id+' · '+all.length+' đơn hôm nay','Quản lý <span class="it">đơn hàng</span>')+
  '<div class="row" style="margin-bottom:16px">'+chips.map(function(c){return '<button class="chip'+(S.bst===c[0]?' on':'')+'" data-act="bst" data-s="'+c[0]+'">'+c[1]+'<span class="n">'+c[2]+'</span></button>'}).join('')+'</div>'+
  '<div class="row" style="margin-bottom:18px"><div class="fld grow" style="max-width:340px"><label for="bq">Tìm đơn</label><input id="bq" class="in" type="search" data-in="bq" value="'+esc(S.bq)+'" placeholder="Mã đơn, khách, món…"></div><div class="fld"><label for="bp">Thanh toán</label><select id="bp" class="in" data-in="bpay">'+['all','Tiền mặt','Chuyển khoản','Ví MoMo'].map(function(p){return '<option value="'+p+'"'+(S.bpay===p?' selected':'')+'>'+(p==='all'?'Tất cả':p)+'</option>'}).join('')+'</select></div></div>'+
  '<div class="split"><section class="plate tight"><div class="tw"><table class="tbl"><thead><tr><th>Mã đơn</th><th>Giờ</th><th>Khách</th><th>Món</th><th class="tr">Tổng</th><th>Trạng thái</th></tr></thead><tbody>'+
  (l.length?l.map(function(o){var s=slaState(o);return '<tr data-act="bsel" data-no="'+o.no+'" class="'+(sel&&sel.no===o.no?'sel':'')+'"><td class="nm mono">'+o.no.slice(-4)+'</td><td class="mono">'+esc(o.t)+'</td><td>'+esc(o.cust)+'<div class="sub">'+esc(o.pay)+'</div></td><td style="max-width:220px"><div class="sub" style="color:var(--ink-2)">'+esc(itemsText(o.items))+'</div></td><td class="tr mono nw">'+money(o.total)+'</td><td>'+stPill(o.st)+(s?' '+pill(s[0],s[1]):'')+'</td></tr>'}).join(''):'<tr><td colspan="6"><div class="empty">Không có đơn khớp bộ lọc.</div></td></tr>')+'</tbody></table></div></section>'+(det||'<div class="empty">Chọn một đơn để xem chi tiết.</div>')+'</div>';
}};
INP.bq=function(v){S.bq=v;render()};INP.bpay=function(v){S.bpay=v;render()};
ACT.bst=function(d){S.bst=d.s;render()};
ACT.bsel=function(d){S.bsel=d.no;render()};
ACT.cancelo=function(d){var o=oBy(d.no);cancelOrder(o);toast('Đã hủy đơn '+o.no.slice(-4));render()};

/* ---- branch menu ---- */
V['b-menu']={dj:['/chi-nhanh/thuc-don/','branch/menu_availability.html','BranchMenuView + POST /api/branch-menu/<dish>/'],html:function(){
  var b=BM[S.br],q=fold(S.bmq.trim()),l=D.filter(function(d){return !q||fold(d.n).indexOf(q)>-1});
  var cnt={on:0,low:0,off:0};D.forEach(function(d){cnt[d.global?AV[b.id][d.id]:'off']++});
  var seg=function(d,v,t){var cur=AV[b.id][d.id]===v;return '<button class="'+(cur?'on':'')+'" data-act="avset" data-id="'+d.id+'" data-v="'+v+'"'+(d.global?'':' disabled')+'>'+t+'</button>'};
  return ph('Chi nhánh '+b.id+' · '+esc(b.n),'Thực đơn <span class="it">chi nhánh</span>')+
  '<div class="bento" style="margin-bottom:22px"><div class="plate s3"><div class="kpi"><span class="cap">Đang bán</span><span class="num">'+cnt.on+'</span></div></div><div class="plate s3"><div class="kpi"><span class="cap">Sắp hết</span><span class="num">'+cnt.low+'</span></div></div><div class="plate s3"><div class="kpi"><span class="cap">Hết hàng</span><span class="num">'+cnt.off+'</span></div></div>'+
  '<div class="plate sunk s3"><div class="cap">Hai lớp trạng thái</div><p style="font-size:12.5px;margin-top:6px"><b>Toàn chuỗi</b> do quản trị đặt. <b>Tại chi nhánh</b> do bếp quản lý. Món bị tắt ở đây sẽ bị loại khi điều phối cho bếp này.</p></div></div>'+
  '<div class="fld" style="max-width:340px;margin-bottom:16px"><label for="bmq">Tìm món</label><input id="bmq" class="in" type="search" data-in="bmq" value="'+esc(S.bmq)+'" placeholder="Tên món…"></div>'+
  '<section class="plate tight"><div class="tw"><table class="tbl"><thead><tr><th>Món</th><th>Danh mục</th><th class="tr">Giá chuỗi</th><th>Toàn chuỗi</th><th>Tại chi nhánh</th></tr></thead><tbody>'+
  l.map(function(d){return '<tr><td><div class="row" style="flex-wrap:nowrap"><div class="art" style="width:44px;height:44px;aspect-ratio:auto;border:1.5px solid var(--edge);flex:none">'+art(d.id)+'</div><b class="nm">'+esc(d.n)+'</b></div></td><td>'+CATN[d.c]+'</td><td class="tr mono">'+money(d.p)+'</td><td>'+(d.global?pill('Đang bán','ok'):pill('Quản trị ngưng','bad'))+'</td><td><div class="seg" style="'+(d.global?'':'opacity:.4')+'">'+seg(d,'on','Còn')+seg(d,'low','Sắp hết')+seg(d,'off','Hết')+'</div></td></tr>'}).join('')+'</tbody></table></div></section>';
}};
INP.bmq=function(v){S.bmq=v;render()};
ACT.avset=function(d){AV[S.br][d.id]=d.v;toast(DM[d.id].n+' tại '+BM[S.br].n+': '+({on:'còn hàng',low:'sắp hết',off:'hết hàng, điều phối sẽ loại bếp này với đơn có món này'})[d.v]);render()};

/* ---- branch inventory ---- */
function stepOf(u){return {kg:1,'hộp':5,'lọ':5,'bìa':10,'quả':12,'cái':50}[u]||1}
V['b-inv']={dj:['/chi-nhanh/kho/','branch/inventory.html','InventoryListView + POST /kho/<id>/adjust/'],html:function(){
  var b=BM[S.br],q=fold(S.binvQ.trim()),all=INV[b.id],low=invLow(b.id);
  var l=all.filter(function(r){return !q||fold(r.n).indexOf(q)>-1});
  return ph('Chi nhánh '+b.id+' · '+all.length+' nguyên liệu','Kho <span class="it">hàng</span>')+
  (low.length?'<div class="plate" style="margin-bottom:20px;border-color:var(--bad)"><div class="row"><b style="color:var(--bad)">Cảnh báo tồn kho thấp</b><span class="dim" style="font-size:13.5px">'+low.map(function(r){return esc(r.n)}).join(', ')+'</span></div></div>':'')+
  '<div class="fld" style="max-width:340px;margin-bottom:16px"><label for="iq">Tìm nguyên liệu</label><input id="iq" class="in" type="search" data-in="binvq" value="'+esc(S.binvQ)+'" placeholder="Gạo, xá xíu, mỳ…"></div>'+
  '<section class="plate tight"><div class="tw"><table class="tbl"><thead><tr><th>Nguyên liệu</th><th class="tr">Tồn</th><th>Đơn vị</th><th class="tr">Tối thiểu</th><th style="min-width:140px">Mức tồn</th><th>Trạng thái</th><th>Điều chỉnh</th></tr></thead><tbody>'+
  l.map(function(r){var i=all.indexOf(r),p=clamp(r.q/(r.min*2.5),0,1),st=r.q<r.min?['Thiếu','bad']:(r.q<r.min*1.25?['Sắp hết','warn']:['Đủ','ok']);
   return '<tr><td class="nm">'+esc(r.n)+'</td><td class="tr mono"><b>'+r.q+'</b></td><td>'+r.u+'</td><td class="tr mono dim">'+r.min+'</td><td><div class="meter '+st[1]+'"><i style="width:'+Math.round(p*100)+'%"></i></div></td><td>'+pill(st[0],st[1])+'</td><td><div class="acts"><button class="btn sm ghost" data-act="invadj" data-i="'+i+'" data-v="-1">− '+stepOf(r.u)+'</button><button class="btn sm" data-act="invadj" data-i="'+i+'" data-v="2">Nhập +'+stepOf(r.u)*2+'</button></div></td></tr>'}).join('')+'</tbody></table></div></section>';
}};
INP.binvq=function(v){S.binvQ=v;render()};
ACT.invadj=function(d){var r=INV[S.br][+d.i],s=stepOf(r.u)*(+d.v);r.q=Math.max(0,Math.round((r.q+s)*10)/10);toast(r.n+': '+(s>0?'nhập thêm '+s:'xuất '+(-s))+' '+r.u);render()};

/* ---- delivery ---- */
function shipOpts(bid){var busy=shipBusy();return SHIP.filter(function(s){return s.br===bid}).map(function(s){return '<option value="'+s.id+'">'+esc(s.n)+(busy.indexOf(s.id)>-1?' · đang giao':' · rảnh')+'</option>'}).join('')}
V['b-ship']={dj:['/chi-nhanh/giao-hang/','branch/delivery.html','DeliveryBoardView + POST /giao-hang/<id>/assign/'],html:function(){
  var b=BM[S.br],os=bOrd(b.id),wait=os.filter(function(o){return o.st===3&&!o.ship}),run=os.filter(function(o){return o.st===4}),done=os.filter(function(o){return o.st===5}),busy=shipBusy();
  var ro=SHIP.filter(function(s){return s.br===b.id});
  return ph('Chi nhánh '+b.id+' · '+ro.length+' shipper','Giao <span class="it">hàng</span>')+
  '<div class="bento"><section class="plate s6"><div class="row" style="margin-bottom:8px"><h2 class="h3">Chờ phân công</h2><span class="pill warn right">'+wait.length+' đơn</span></div>'+
  (wait.length?wait.map(function(o){return '<div class="il" style="align-items:center;flex-wrap:wrap"><span><b class="mono">'+o.no.slice(-4)+'</b> · '+esc(o.cust)+'<div class="sub dim" style="font-size:12px">'+esc(ADDR[o.ak].a)+' · '+dec(o.dist)+' km</div></span><span class="row" style="flex-wrap:nowrap"><select id="sh_'+o.no+'" class="in" style="width:auto;padding:7px 8px">'+shipOpts(b.id)+'</select><button class="btn sm terra" data-act="assign" data-no="'+o.no+'">Giao</button></span></div>'}).join(''):'<div class="empty">Không có đơn nào chờ shipper.</div>')+'</section>'+
  '<section class="plate s6"><div class="row" style="margin-bottom:8px"><h2 class="h3">Đang giao</h2><span class="pill ok right">'+run.length+' đơn</span></div>'+
  (run.length?run.map(function(o){var s=SM[o.ship];return '<div class="il" style="align-items:center;flex-wrap:wrap"><span><b class="mono">'+o.no.slice(-4)+'</b> · '+esc(o.cust)+'<div class="sub dim" style="font-size:12px">'+(s?esc(s.n)+' · '+s.tel:'')+' · '+dec(o.dist)+' km</div></span><span class="acts"><button class="btn sm" data-act="adv" data-no="'+o.no+'">Hoàn thành</button><button class="btn sm ghost" data-act="issue">Báo sự cố</button></span></div>'}).join(''):'<div class="empty">Chưa có đơn đang giao.</div>')+'</section>'+
  '<section class="plate s5"><h2 class="h3" style="margin-bottom:8px">Shipper</h2>'+ro.map(function(s){var n=orders.filter(function(o){return o.st===4&&o.ship===s.id}).length;return '<div class="il"><span><b>'+esc(s.n)+'</b><div class="mono dim" style="font-size:11.5px">'+s.tel+'</div></span>'+pill(n?'Đang giao '+n:'Rảnh',n?'warn':'ok')+'</div>'}).join('')+'</section>'+
  '<section class="plate s7"><h2 class="h3" style="margin-bottom:8px">Lịch sử giao hôm nay</h2><div class="tw"><table class="tbl"><thead><tr><th>Đơn</th><th>Khách</th><th>Shipper</th><th class="tr">Thu hộ</th></tr></thead><tbody>'+
  (done.length?done.map(function(o){return '<tr><td class="mono nm">'+o.no.slice(-4)+'</td><td>'+esc(o.cust)+'</td><td>'+(o.ship?esc(SM[o.ship].n):'—')+'</td><td class="tr mono">'+(o.pay==='Tiền mặt'?money(o.total):'0đ')+'</td></tr>'}).join(''):'<tr><td colspan="4" class="dim">Chưa có đơn hoàn thành.</td></tr>')+'</tbody></table></div></section></div>';
}};
ACT.assign=function(d){var o=oBy(d.no),sel=$('#sh_'+d.no);o.ship=sel?sel.value:null;advance(o);toast('Đã giao đơn '+o.no.slice(-4)+' cho '+SM[o.ship].n);render()};
ACT.issue=function(){toast('Đã ghi nhận sự cố và thông báo quản trị (mô phỏng)')};

/* ================= ADMIN: CONTROL ROOM ================= */
S.aFeat=null;S.manual=0;S.aDisp=null;
var SIMN=['Lương Bảo Châu','Tạ Quốc Việt','Kiều Thanh Tâm','Đoàn Hữu Phước','Cao Mỹ Duyên','Lý Trọng Nghĩa'];
var SIMI=[[['d1',1],['d10',1]],[['d6',1],['d3',1]],[['d4',2],['d9',1]],[['d2',1],['d11',2]],[['d3',2],['d14',2]],[['d5',1],['d8',1],['d12',1]]];
var SIMA=['A1','A2','A4','A5','A3','A1'];
function simOrder(){
  var i=S.simN%SIMN.length,items=SIMI[i],ak=SIMA[i],res=evalBranches(items,ak),w=res.filter(function(r){return r.ok})[0];
  S.simN++;
  if(!w){toast('Đơn mô phỏng không có bếp phù hợp ('+ADDR[ak].l+')');return null}
  var no='MQ-261012-0'+(ORDN++),o=mkO(no,SIMN[i],String(100+S.simN*37).slice(-3),w.b.id,items,0,['Ví MoMo','Tiền mặt','Chuyển khoản'][i%3],0,ak,hm(NOW+1+S.simN));
  o.mine=false;o.prep=w.prep;o.snap=res.map(function(r){return {id:r.b.id,ok:r.ok,score:r.score,dist:r.dist,why:r.reasons[0]||''}});o.audit=buildAudit(o);orders.unshift(o);
  S.aFeat=o.no;toast('Đơn '+no.slice(-4)+' → Miêu Quán '+w.b.n+' (điểm '+w.score+')');return o;
}
function allocEvent(o){
  var ok=o.snap.filter(function(s){return s.ok}),win=o.snap.filter(function(s){return s.id===o.br})[0],ex=o.snap.length-ok.length,chips=[];
  if(o.manual)chips.push('Chuyển thủ công');
  else if(ok.length===1)chips.push('Bếp duy nhất đủ điều kiện');
  else if(win&&win.dist<=Math.min.apply(null,ok.map(function(s){return s.dist})))chips.push('Gần nhất');
  if(win)chips.push('Điểm '+win.score);if(ex)chips.push('Loại '+ex+' bếp');
  return chips;
}
function mapSvg(){
  var g='';for(var i=0;i<=12;i++)g+='<path class="gl" d="M'+i*50+' 0v420M0 '+i*35+'h600"/>';
  var live=orders.filter(function(o){return !o.hist&&o.st>=0&&o.st<=3});
  var circles=BR.map(function(b){return '<circle class="sa" cx="'+b.x+'" cy="'+b.y+'" r="'+(b.radius*13)+'"/>'}).join('');
  var lines=live.map(function(o,i){var b=BM[o.br],p=o.pt;return '<line class="ln" style="opacity:'+(o.no===S.aFeat?1:.45)+'" x1="'+b.x+'" y1="'+b.y+'" x2="'+(p[0]+(i*7)%12-6)+'" y2="'+(p[1]+(i*11)%12-6)+'"/>'}).join('');
  var dots=live.map(function(o,i){var p=o.pt,x=p[0]+(i*7)%12-6,y=p[1]+(i*11)%12-6;return '<circle class="od" cx="'+x+'" cy="'+y+'" r="3"/>'+(i<4||o.no===S.aFeat?'<circle class="odr" cx="'+x+'" cy="'+y+'" r="4"/>':'')}).join('');
  var nodes=BR.map(function(b){
    var p=liveLoad(b)/b.cap,col=p*100>RULES.maxLoad?'#F58C83':(p>.75?'#EBB65A':'#7ED2A2'),C=2*Math.PI*21,sel=S.aSel===b.id;
    return '<g class="bn" data-act="asel" data-id="'+b.id+'" tabindex="0" role="button" aria-label="'+esc(b.n)+', tải '+Math.round(p*100)+'%"><circle cx="'+b.x+'" cy="'+b.y+'" r="29" fill="transparent"/>'+(sel?'<circle cx="'+b.x+'" cy="'+b.y+'" r="27" fill="none" stroke="#F4E4AE" stroke-width="1" stroke-dasharray="2 3"/>':'')+
    '<circle cx="'+b.x+'" cy="'+b.y+'" r="21" fill="#0B1327" stroke="rgba(255,255,255,.18)" stroke-width="5"/><circle cx="'+b.x+'" cy="'+b.y+'" r="21" fill="none" stroke="'+col+'" stroke-width="5" stroke-dasharray="'+(p*C).toFixed(1)+' '+C.toFixed(1)+'" transform="rotate(-90 '+b.x+' '+b.y+')"/>'+
    '<rect x="'+(b.x-6)+'" y="'+(b.y-6)+'" width="12" height="12" fill="'+(b.open&&b.accepting?'#F4E4AE':'#7b8398')+'" transform="rotate(45 '+b.x+' '+b.y+')"/><text x="'+b.x+'" y="'+(b.y+43)+'" text-anchor="middle" font-size="12" font-weight="600">'+esc(b.n)+'</text><text x="'+b.x+'" y="'+(b.y+56)+'" text-anchor="middle" font-size="10" style="fill:'+col+'">'+Math.round(p*100)+'% · '+liveLoad(b)+'/'+b.cap+'</text></g>';}).join('');
  return '<svg class="map" viewBox="0 0 600 420" role="img" aria-label="Sơ đồ mạng lưới 5 chi nhánh, đơn đang xử lý và tải bếp">'+g+'<path class="rv" d="M0 345 C120 315 200 372 320 318 S520 280 600 246"/><path class="rd" d="M0 120 L600 300"/><path class="rd" d="M110 0 C180 150 260 250 330 420"/>'+circles+lines+dots+nodes+'<text x="12" y="408" font-size="9" style="fill:rgba(240,230,208,.5)">SƠ ĐỒ MINH HỌA · 1 ô = 3,8 km · vòng nét đứt = vùng giao</text></svg>';
}
V['a-ctrl']={dj:['/quan-tri/','admin/control_room.html','ControlRoomView (hx-get /quan-tri/panels/ mỗi 5 giây)'],html:function(){
  var live=orders.filter(function(o){return !o.hist}),act=live.filter(function(o){return o.st>=0&&o.st<=4}),late=act.filter(function(o){var s=slaState(o);return s&&s[1]==='bad'});
  var rev=24300000+live.reduce(function(s,o){return s+(o.st>=0?o.total:0)},0);
  var n=206+live.length,auto=100-(8+S.manual)*100/n;
  var b=BM[S.aSel]||BR[0],bo=bOrd(b.id),bl=liveLoad(b);
  var feat=oBy(S.aFeat)||live[0],res=feat?evalBranches(feat.items,feat.ak):[],win=res.filter(function(r){return r.ok})[0];
  var feed=live.slice().sort(function(x,y){return x.ago-y.ago}).slice(0,9).map(function(o){var w=o.snap.filter(function(s){return s.id===o.br})[0];return '<div class="fi"><time>'+esc(o.t)+'</time><div><b>'+o.no.slice(-4)+'</b> → Miêu Quán '+esc(BM[o.br].n)+' <span style="color:var(--side-dim)">· '+dec(o.dist)+' km</span><div>'+allocEvent(o).map(function(c){return '<span class="chp">'+esc(c)+'</span>'}).join('')+'</div></div></div>'}).join('');
  var al='';
  BR.forEach(function(x){var p=liveLoad(x)/x.cap;
    if(p*100>RULES.maxLoad)al+='<div class="alr"><i></i><div><b>'+esc(x.n)+' quá tải '+Math.round(p*100)+'%</b><div style="color:var(--side-dim);font-size:12px">Vượt ngưỡng '+RULES.maxLoad+'%, đang bị loại khỏi điều phối</div></div><button class="btn sm ghost" data-act="accept" data-id="'+x.id+'">'+(x.accepting?'Ngưng nhận':'Mở lại')+'</button></div>';
    else if(p>.75)al+='<div class="alr w"><i></i><div><b>'+esc(x.n)+' gần ngưỡng '+Math.round(p*100)+'%</b><div style="color:var(--side-dim);font-size:12px">Nên giảm trọng số tải hoặc tăng nhân sự</div></div><button class="btn sm ghost" data-act="asel" data-id="'+x.id+'">Xem</button></div>'});
  if(late.length)al+='<div class="alr"><i></i><div><b>'+late.length+' đơn đã trễ hạn xử lý</b><div style="color:var(--side-dim);font-size:12px">'+late.map(function(o){return o.no.slice(-4)}).join(', ')+'</div></div><button class="btn sm ghost" data-act="go" data-k="a-ord">Xem</button></div>';
  BR.forEach(function(x){var l=invLow(x.id).length;if(l>=4)al+='<div class="alr w"><i></i><div><b>'+esc(x.n)+': '+l+' nguyên liệu dưới ngưỡng</b><div style="color:var(--side-dim);font-size:12px">Có thể hết món trong ca chiều</div></div><span class="pill warn">Kho</span></div>'});
  if(!al)al='<div style="color:var(--side-dim);padding:10px 0">Không có cảnh báo.</div>';
  var hr=['08','09','10','11','12','13','14','15','16','17','18','19','20','21'];
  var heat='<div class="heat" style="margin-bottom:5px"><span></span>'+hr.map(function(h,i){return '<span class="h">'+(i%2?'':h)+'</span>'}).join('')+'</div>'+BR.map(function(x){return '<div class="heat" style="margin-bottom:3px"><span>'+x.id+'</span>'+HLOAD[x.id].map(function(v,i){return '<span class="c'+(i===2?' now':'')+'" style="--v:'+v+'" title="'+x.n+' '+hr[i]+'h: '+Math.round(v*100)+'%"></span>'}).join('')+'</div>'}).join('');
  var mat=res.length?'<table class="cmat"><thead><tr><th>Chi nhánh</th><th>Khoảng cách</th><th>Đơn đang xử lý</th><th>Chuẩn bị ước tính</th><th>Món sẵn có</th><th>Điểm</th></tr></thead><tbody>'+res.map(function(r){var av=feat.items.length-r.miss.length;return '<tr class="'+(r.ok?(r===win?'win':''):'x')+'"><td><b>'+esc(r.b.n)+'</b>'+(r.ok?'':'<div style="color:#F58C83;font-size:11px">'+esc(r.reasons[0])+'</div>')+'</td><td>'+dec(r.dist)+' km</td><td>'+r.load+' / '+r.b.cap+'<span class="mb" style="width:'+Math.round(r.pct*50)+'px"></span></td><td>~'+r.prep+' phút</td><td>'+av+' / '+feat.items.length+'</td><td><b>'+(r.ok?r.score:'—')+'</b></td></tr>'}).join('')+'</tbody></table>':'';
  return '<div class="ctrl"><div class="ctrlh"><span class="live">TRỰC TIẾP</span><div class="grow"><div style="font:800 20px var(--f-d);font-stretch:118%">Phòng điều phối toàn chuỗi</div><div class="cap">Thứ Hai 12.10.2026 · 10:06 · dữ liệu mô phỏng</div></div><button class="btn terra" data-act="sim">+ Mô phỏng đơn mới</button><button class="btn ghost" data-act="go" data-k="a-cfg">Chỉnh trọng số</button></div>'+
  '<div class="kstrip"><div><div class="cap">Đơn hôm nay</div><div class="num">'+n+'</div><div class="d">'+act.length+' đang xử lý</div></div><div><div class="cap">Doanh thu</div><div class="num">'+dec(rev/1e6,1)+' tr</div><div class="d">Mục tiêu ngày 62 tr</div></div><div><div class="cap">Điều phối TB</div><div class="num">2,4 s</div><div class="d">Từ lúc đặt tới khi chốt bếp</div></div><div><div class="cap">Tự động chọn bếp</div><div class="num">'+dec(auto,1)+'%</div><div class="d">'+(8+S.manual)+' lần chuyển thủ công</div></div><div><div class="cap">Đơn trễ</div><div class="num" style="color:'+(late.length?'#F58C83':'#F4E4AE')+'">'+late.length+'</div><div class="d">Quá hạn xác nhận hoặc chế biến</div></div></div>'+
  '<div class="cgrid"><div><div class="row" style="margin-bottom:10px;justify-content:space-between"><span class="cap">Sơ đồ mạng lưới · bấm vào chi nhánh</span><span class="cap">Vòng màu = tải bếp</span></div>'+mapSvg()+
  '<div class="row" style="margin-top:12px;justify-content:space-between"><div><b style="font-size:15px">Miêu Quán '+esc(b.n)+'</b> <span class="pill '+(b.open&&b.accepting?'ok':'warn')+'">'+(!b.open?'Đóng cửa':(b.accepting?'Đang nhận đơn':'Tạm ngưng'))+'</span><div style="color:var(--side-dim);font-size:12px;margin-top:4px">'+bo.filter(function(o){return o.st>=0&&o.st<=3}).length+' đơn đang xử lý · '+bl+'/'+b.cap+' tải · ~'+Math.round(b.prep+bl*1.4)+' phút chuẩn bị</div></div><div class="row"><span style="font-size:12px;color:var(--side-dim)">Nhận đơn</span><button class="sw'+(b.accepting?' on':'')+'" data-act="accept" data-id="'+b.id+'" aria-label="Nhận đơn"></button></div></div>'+
  '<div class="cap" style="margin:20px 0 8px">Tải bếp theo giờ · vòng sáng = giờ hiện tại</div>'+heat+'</div>'+
  '<div><div class="cap" style="margin-bottom:6px">Cảnh báo quá tải</div>'+al+'<div class="cap" style="margin:20px 0 6px">Luồng phân bổ đơn</div><div class="feed">'+feed+'</div></div></div>'+
  '<div style="padding:16px;border-top:1px solid rgba(255,255,255,.14)"><div class="row" style="margin-bottom:10px"><div class="grow"><div class="cap">Ma trận so sánh chi nhánh</div><div style="font-size:13px;margin-top:3px">'+(feat?'Đơn <b>'+feat.no+'</b> · '+esc(itemsText(feat.items))+' · '+esc(ADDR[feat.ak].l):'')+'</div></div><select id="featsel" data-in="afeat" class="in" style="width:auto;background:#0B1327;color:#F0E6D0;border-color:rgba(255,255,255,.3)" aria-label="Chọn đơn để so sánh">'+live.slice(0,8).map(function(o){return '<option value="'+o.no+'"'+(feat&&feat.no===o.no?' selected':'')+'>'+o.no.slice(-4)+' · '+esc(o.cust)+'</option>'}).join('')+'</select></div><div class="tw">'+mat+'</div></div></div>';
}};
INP.afeat=function(v){S.aFeat=v;render()};
ACT.asel=function(d){S.aSel=d.id;render()};
ACT.sim=function(){simOrder();render()};

/* ================= ADMIN: DISPATCH BOARD ================= */
V['a-disp']={dj:['/quan-tri/dieu-phoi/','admin/dispatch_board.html','DispatchBoardView + POST /quan-tri/don/<id>/reassign/'],html:function(){
  var live=orders.filter(function(o){return !o.hist}),wait=live.filter(function(o){return o.st<=1&&o.st>=0});
  var sel=oBy(S.aDisp)||wait[0]||live[0],res=sel?evalBranches(sel.items,sel.ak):[];
  var canMove=sel&&sel.st>=0&&sel.st<=1;
  var hist=live.slice().sort(function(x,y){return x.ago-y.ago}).slice(0,10);
  return ph('Điều phối đơn · '+wait.length+' đơn chưa vào bếp','Hàng đợi <span class="it">điều phối</span>','<button class="btn terra" data-act="sim">+ Mô phỏng đơn mới</button>')+
  '<div class="split"><section class="plate tight"><div class="cap" style="padding:8px 10px">Đơn chờ xác nhận hoặc vừa xác nhận</div><div class="tw"><table class="tbl"><thead><tr><th>Đơn</th><th>Bếp hiện tại</th><th>Trạng thái</th></tr></thead><tbody>'+
  (wait.length?wait.map(function(o){return '<tr data-act="adsel" data-no="'+o.no+'" class="'+(sel&&sel.no===o.no?'sel':'')+'"><td class="nm mono">'+o.no.slice(-4)+'<div class="sub">'+esc(o.cust)+'</div></td><td>'+esc(BM[o.br].n)+'</td><td>'+stPill(o.st)+'</td></tr>'}).join(''):'<tr><td colspan="3"><div class="empty">Không có đơn chờ.</div></td></tr>')+'</tbody></table></div></section>'+
  '<section class="plate">'+(sel?'<div class="row"><b class="num" style="font-size:22px">'+sel.no+'</b>'+stPill(sel.st)+'</div><div class="dim" style="font-size:13.5px;margin:6px 0 14px">'+esc(itemsText(sel.items))+' · giao tới '+esc(ADDR[sel.ak].l)+'</div>'+gateMatrix(res)+
  '<div class="cap" style="margin:16px 0 8px">Chuyển bếp thủ công</div>'+(canMove?'<div class="acts">'+res.filter(function(r){return r.ok&&r.b.id!==sel.br}).map(function(r){return '<button class="btn sm ghost" data-act="reassign" data-no="'+sel.no+'" data-b="'+r.b.id+'">Chuyển sang '+esc(r.b.n)+' ('+r.score+')</button>'}).join('')+(res.filter(function(r){return r.ok&&r.b.id!==sel.br}).length?'':'<span class="dim">Không còn chi nhánh đủ điều kiện khác.</span>')+'</div>':'<p class="dim" style="font-size:13.5px">Chỉ chuyển được khi bếp chưa bắt đầu chế biến.</p>'):'<div class="empty">Chưa có đơn.</div>')+'</section></div>'+
  '<section class="plate tight" style="margin-top:22px"><div class="cap" style="padding:8px 10px">Lịch sử phân bổ gần nhất</div><div class="tw"><table class="tbl"><thead><tr><th>Giờ</th><th>Đơn</th><th>Bếp được chọn</th><th class="tr">Khoảng cách</th><th class="tr">Điểm</th><th>Cách chọn</th></tr></thead><tbody>'+
  hist.map(function(o){var w=o.snap.filter(function(s){return s.id===o.br})[0];return '<tr><td class="mono">'+esc(o.t)+'</td><td class="nm mono">'+o.no.slice(-4)+'</td><td>'+esc(BM[o.br].n)+'</td><td class="tr mono">'+dec(o.dist)+' km</td><td class="tr mono">'+(w?w.score:'—')+'</td><td>'+(o.manual?pill('Thủ công','warn'):pill('Tự động','ok'))+'</td></tr>'}).join('')+'</tbody></table></div></section>';
}};
ACT.adsel=function(d){S.aDisp=d.no;render()};
ACT.reassign=function(d){var o=oBy(d.no),from=BM[o.br],to=BM[d.b];o.br=d.b;o.dist=ADDR[o.ak].d[d.b];o.manual=true;S.manual++;o.audit.push({t:hm(NOW+1+o.audit.length),who:'Quản trị',ev:'Chuyển bếp từ '+from.n+' sang '+to.n});toast('Đã chuyển đơn '+o.no.slice(-4)+' sang '+to.n);render()};

/* ================= ADMIN: BRANCHES ================= */
function branchMini(b){
  var pts=Object.keys(ADDR).slice(0,5).map(function(k){var a=ADDR[k],d=a.d[b.id],ang=Math.atan2(a.pt[1]-b.y,a.pt[0]-b.x),r=d*13,x=150+r*Math.cos(ang),y=100+r*Math.sin(ang),inn=d<=b.radius;return '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="3.5" fill="'+(inn?'#7ED2A2':'#F58C83')+'"/><text x="'+(x+6).toFixed(1)+'" y="'+(y+3).toFixed(1)+'" font-size="8">'+esc(a.l)+'</text>'}).join('');
  var rr=Math.min(b.radius*13,96);
  return '<svg class="map" viewBox="0 0 300 200" role="img" aria-label="Vùng giao của chi nhánh"><path class="gl" d="M0 100h300M150 0v200"/><circle class="sa" cx="150" cy="100" r="'+rr+'"/>'+pts+'<rect x="144" y="94" width="12" height="12" fill="#F4E4AE" transform="rotate(45 150 100)"/><text x="12" y="192" font-size="9" style="fill:rgba(240,230,208,.55)">Bán kính '+dec(b.radius)+' km · xanh = trong vùng, đỏ = ngoài vùng</text></svg>';
}
V['a-br']={dj:['/quan-tri/chi-nhanh/','admin/branches.html','BranchAdminListView / BranchUpdateView (Django ModelForm)'],html:function(){
  var b=BM[S.aSel]||BR[0];
  return ph('Chi nhánh · '+BR.length+' điểm bán','Mạng lưới <span class="it">chi nhánh</span>')+
  '<div class="split"><section class="plate tight"><div class="tw"><table class="tbl"><thead><tr><th>Chi nhánh</th><th>Mở cửa</th><th>Nhận đơn</th><th>Tải</th></tr></thead><tbody>'+
  BR.map(function(x){var p=liveLoad(x)/x.cap;return '<tr data-act="asel" data-id="'+x.id+'" class="'+(b.id===x.id?'sel':'')+'"><td><b class="nm">'+x.id+' · '+esc(x.n)+'</b><div class="sub">'+esc(x.addr)+'</div></td><td><button class="sw'+(x.open?' on':'')+'" data-act="bopen" data-id="'+x.id+'" aria-label="Mở cửa '+esc(x.n)+'"></button></td><td><button class="sw'+(x.accepting?' on':'')+'" data-act="accept" data-id="'+x.id+'" aria-label="Nhận đơn '+esc(x.n)+'"></button></td><td style="min-width:110px"><div class="meter '+loadCls(p)+'"><i style="width:'+Math.round(p*100)+'%"></i></div><div class="mono dim" style="font-size:11px;margin-top:3px">'+liveLoad(x)+'/'+x.cap+'</div></td></tr>'}).join('')+'</tbody></table></div></section>'+
  '<aside class="plate"><div class="cap">Chi tiết chi nhánh</div><h2 class="h2" style="margin:6px 0 10px">Miêu Quán <span class="it">'+esc(b.n)+'</span></h2>'+
  '<div class="il"><span class="dim">Địa chỉ</span><span style="text-align:right">'+esc(b.addr)+'</span></div><div class="il"><span class="dim">Tọa độ</span><span class="mono">'+b.lat.toFixed(4)+'°B, '+b.lng.toFixed(4)+'°Đ</span></div><div class="il"><span class="dim">Giờ mở cửa</span><span class="mono">'+b.hours+'</span></div><div class="il"><span class="dim">Quản lý</span><span>'+esc(b.mgr)+' · '+b.tel+'</span></div><div class="il"><span class="dim">Nhân sự</span><span>'+b.staff+' người</span></div>'+
  '<div class="fld" style="margin:16px 0"><label for="rad">Vùng giao: '+dec(b.radius)+' km</label><input id="rad" type="range" min="2" max="10" step=".5" value="'+b.radius+'" data-in="radius"></div>'+
  '<div class="fld" style="margin-bottom:16px"><label for="capr">Sức chứa đồng thời: '+b.cap+' đơn</label><input id="capr" type="range" min="6" max="20" step="1" value="'+b.cap+'" data-in="cap"></div>'+'<div id="bmini">'+branchMini(b)+'</div></aside></div>';
}};
INP.radius=function(v){var b=BM[S.aSel];b.radius=+v;var l=$('label[for=rad]'),m=$('#bmini');if(l)l.textContent='Vùng giao: '+dec(b.radius)+' km';if(m)m.innerHTML=branchMini(b)};
INP.cap=function(v){var b=BM[S.aSel];b.cap=+v;var l=$('label[for=capr]');if(l)l.textContent='Sức chứa đồng thời: '+b.cap+' đơn'};
ACT.bopen=function(d){var b=BM[d.id];b.open=!b.open;toast(b.n+(b.open?': đã mở cửa':': đã đóng cửa, bị loại khỏi điều phối'));render()};

/* ================= ADMIN: PRODUCTS ================= */
S.catHide={};S.sampleI=0;S.aPc='all';
V['a-prod']={dj:['/quan-tri/mon-an/','admin/products.html','ProductAdminView + CategoryAdminView (ImageField → MEDIA_ROOT)'],html:function(){
  var q=fold(S.apq.trim()),l=D.filter(function(d){return (S.aPc==='all'||d.c===S.aPc)&&(!q||fold(d.n).indexOf(q)>-1)});
  return ph('Món ăn · '+D.length+' món · '+CATS.length+' danh mục','Danh mục <span class="it">toàn chuỗi</span>')+
  '<div class="bento"><section class="plate s3"><div class="cap" style="margin-bottom:8px">Danh mục</div><div class="cats" style="display:flex;flex-direction:column"><button class="chip'+(S.aPc==='all'?' on':'')+'" style="margin-bottom:6px;text-align:left" data-act="apc" data-c="all">Tất cả<span class="n">'+D.length+'</span></button>'+
  CATS.map(function(c){return '<div class="row" style="flex-wrap:nowrap;margin-bottom:6px"><button class="chip grow'+(S.aPc===c[0]?' on':'')+'" style="text-align:left" data-act="apc" data-c="'+c[0]+'">'+c[1]+'<span class="n">'+D.filter(function(d){return d.c===c[0]}).length+'</span></button><button class="sw'+(S.catHide[c[0]]?'':' on')+'" data-act="chide" data-c="'+c[0]+'" aria-label="Hiển thị danh mục '+c[1]+'"></button></div>'}).join('')+'</div><p class="mono dim" style="font-size:11.5px;margin-top:10px">Công tắc: hiển thị danh mục trên thực đơn khách.</p></section>'+
  '<section class="plate s9 tight"><div class="row" style="padding:6px 8px"><div class="fld grow" style="max-width:320px"><label for="pq">Tìm món</label><input id="pq" class="in" type="search" data-in="apq" value="'+esc(S.apq)+'" placeholder="Tên món…"></div></div><div class="tw"><table class="tbl"><thead><tr><th>Món</th><th>Danh mục</th><th>Giá (đ)</th><th>Bán toàn chuỗi</th><th>Chi nhánh đang bán</th></tr></thead><tbody>'+
  l.map(function(d){return '<tr><td><div class="row" style="flex-wrap:nowrap"><div class="art" style="width:52px;height:52px;aspect-ratio:auto;border:1.5px solid var(--edge);flex:none">'+art(d.id)+'</div><div><b class="nm">'+esc(d.n)+'</b><div class="sub">'+esc(d.sub)+'</div></div></div></td><td>'+CATN[d.c]+'</td><td><input class="in" style="width:104px;padding:7px 8px" type="number" step="1000" min="0" value="'+d.p+'" data-in="price" data-id="'+d.id+'" aria-label="Giá '+esc(d.n)+'"></td><td><button class="sw'+(d.global?' on':'')+'" data-act="gtoggle" data-id="'+d.id+'" aria-label="Bán toàn chuỗi '+esc(d.n)+'"></button></td><td class="mono">'+dishBranches(d.id)+' / 5</td></tr>'}).join('')+'</tbody></table></div></section>'+
  '<section class="plate s12 sunk"><div class="cap" style="margin-bottom:10px">Thêm món mới</div><div class="row" style="align-items:flex-end"><div class="fld grow" style="min-width:200px"><label for="nn">Tên món</label><input id="nn" class="in" placeholder="Ví dụ: Cơm thố gà xối mỡ"></div><div class="fld"><label for="np">Giá (đ)</label><input id="np" class="in" type="number" step="1000" value="55000" style="width:130px"></div><div class="fld"><label for="nc">Danh mục</label><select id="nc" class="in">'+CATS.map(function(c){return '<option value="'+c[0]+'">'+c[1]+'</option>'}).join('')+'</select></div><button class="btn terra" data-act="adddish">Thêm món</button></div></section></div>';
}};
INP.apq=function(v){S.apq=v;render()};
INP.price=function(v,el){var d=DM[el.dataset.id];if(d)d.p=Math.max(0,parseInt(v,10)||0)};
ACT.apc=function(d){S.aPc=d.c;render()};
ACT.chide=function(d){S.catHide[d.c]=!S.catHide[d.c];toast(CATN[d.c]+(S.catHide[d.c]?': đã ẩn khỏi thực đơn khách':': đã hiển thị'));render()};
ACT.gtoggle=function(d){var x=DM[d.id];x.global=!x.global;toast(x.n+(x.global?': bán lại toàn chuỗi':': ngưng bán toàn chuỗi, mọi bếp bị loại với món này'));render()};
ACT.adddish=function(){
  var n=$('#nn').value.trim(),p=parseInt($('#np').value,10)||0,c=$('#nc').value;
  if(!n){toast('Nhập tên món');return}
  var base=D.filter(function(d){return d.c===c})[0],id='d'+(D.length+1);
  var d={id:id,n:n,c:c,p:p,k:base.k,v:base.v,t:10,pop:99,tag:'Mới',sub:'Món mới thêm, chờ cập nhật mô tả',desc:'Món mới thêm. Cập nhật mô tả và ảnh thật ở bước hoàn thiện.',global:true};
  D.push(d);DM[id]=d;BR.forEach(function(b){AV[b.id][id]='on'});S.aPc='all';toast('Đã thêm '+n);render();
};

/* ================= ADMIN: ORDERS ================= */
V['a-ord']={dj:['/quan-tri/don-hang/','admin/orders.html','AdminOrderListView (django-filter) + OrderDetail drawer'],html:function(){
  var q=fold(S.aq.trim());
  var l=orders.filter(function(o){return (S.aBr==='all'||o.br===S.aBr)&&(S.aSt==='all'||String(o.st)===S.aSt)&&(S.aPay==='all'||o.pay===S.aPay)&&(!q||fold(o.no+' '+o.cust+' '+o.tel+' '+itemsText(o.items)).indexOf(q)>-1)});
  var sum=l.reduce(function(s,o){return s+(o.st>=0?o.total:0)},0);
  return ph('Đơn hàng toàn chuỗi · '+l.length+' kết quả','Tra cứu <span class="it">đơn hàng</span>')+
  '<div class="row" style="margin-bottom:18px;align-items:flex-end"><div class="fld grow" style="max-width:320px"><label for="aq">Tìm kiếm</label><input id="aq" class="in" type="search" data-in="aq" value="'+esc(S.aq)+'" placeholder="Mã đơn, khách, món…"></div>'+
  '<div class="fld"><label for="ab">Chi nhánh</label><select id="ab" class="in" data-in="abr">'+branchOpt(S.aBr,true)+'</select></div>'+
  '<div class="fld"><label for="as">Trạng thái</label><select id="as" class="in" data-in="ast"><option value="all">Tất cả</option>'+ST.map(function(s,i){return '<option value="'+i+'"'+(S.aSt===String(i)?' selected':'')+'>'+s+'</option>'}).join('')+'<option value="-1"'+(S.aSt==='-1'?' selected':'')+'>Đã hủy</option></select></div>'+
  '<div class="fld"><label for="ap">Thanh toán</label><select id="ap" class="in" data-in="apay">'+['all','Tiền mặt','Chuyển khoản','Ví MoMo'].map(function(p){return '<option value="'+p+'"'+(S.aPay===p?' selected':'')+'>'+(p==='all'?'Tất cả':p)+'</option>'}).join('')+'</select></div><div class="right tr"><div class="cap">Tổng giá trị</div><b class="num" style="font-size:26px">'+money(sum)+'</b></div></div>'+
  '<section class="plate tight"><div class="tw"><table class="tbl"><thead><tr><th>Mã đơn</th><th>Thời gian</th><th>Khách</th><th>Chi nhánh</th><th>Món</th><th class="tr">Tổng</th><th>Thanh toán</th><th>Trạng thái</th></tr></thead><tbody>'+
  (l.length?l.map(function(o){return '<tr data-act="oview" data-no="'+o.no+'"><td class="nm mono nw">'+o.no+'</td><td class="mono nw">'+esc(o.t)+'</td><td>'+esc(o.cust)+'</td><td>'+esc(BM[o.br].n)+'</td><td style="max-width:240px"><div class="sub" style="color:var(--ink-2)">'+esc(itemsText(o.items))+'</div></td><td class="tr mono nw">'+money(o.total)+'</td><td>'+esc(o.pay)+'</td><td>'+stPill(o.st)+'</td></tr>'}).join(''):'<tr><td colspan="8"><div class="empty">Không có đơn khớp bộ lọc.</div></td></tr>')+'</tbody></table></div></section>';
}};
INP.aq=function(v){S.aq=v;render()};INP.abr=function(v){S.aBr=v;render()};INP.ast=function(v){S.aSt=v;render()};INP.apay=function(v){S.aPay=v;render()};
ACT.oview=function(d){S.layer={k:'ord',no:d.no};renderLayer()};
LAY.ord=function(l){
  var o=oBy(l.no);if(!o)return '';
  return '<div class="drw" role="dialog" aria-label="Chi tiết đơn"><div class="row" style="margin-bottom:6px"><b class="num" style="font-size:22px">'+o.no+'</b>'+stPill(o.st)+'<button class="btn ghost sm right" data-act="closeLayer">Đóng</button></div>'+
  '<div class="mono dim" style="font-size:12px;margin-bottom:14px">'+esc(o.t)+' · '+esc(o.cust)+' · '+esc(o.tel)+' · '+esc(o.pay)+' · '+esc(o.ps)+'</div>'+
  '<div class="plate flat" style="margin-bottom:18px"><div class="cap" style="margin-bottom:6px">Món</div>'+o.items.map(function(i){var d=DM[i[0]];return '<div class="il"><span>'+esc(d.n)+' <b class="mono">× '+i[1]+'</b></span><span class="mono">'+money(d.p*i[1])+'</span></div>'}).join('')+'<div class="tot big"><span class="cap">Tổng</span><span class="num" style="font-size:24px">'+money(o.total)+'</span></div></div>'+
  '<div class="cap" style="margin-bottom:8px">Lịch sử phân bổ khi đặt đơn</div><div class="tw" style="margin-bottom:18px"><table class="tbl"><thead><tr><th>Chi nhánh</th><th class="tr">Km</th><th>Kết quả</th><th class="tr">Điểm</th></tr></thead><tbody>'+
  o.snap.map(function(s){var ch=s.id===o.br;return '<tr class="'+(ch?'sel':'')+'"><td class="nm">'+(ch?'▸ ':'')+esc(BM[s.id].n)+'</td><td class="tr mono">'+dec(s.dist)+'</td><td>'+(s.ok?pill(ch?'Được chọn':'Đủ điều kiện',ch?'terra':'ok'):'<span class="rsn" style="margin:0">'+esc(s.why)+'</span>')+'</td><td class="tr mono">'+(s.ok?s.score:'—')+'</td></tr>'}).join('')+'</tbody></table></div>'+
  '<div class="cap" style="margin-bottom:10px">Nhật ký trạng thái</div><ul class="audit">'+o.audit.map(function(x){return '<li><time>'+x.t+' · '+esc(x.who)+'</time>'+esc(x.ev)+'</li>'}).join('')+'</ul></div>';
};

/* ================= ADMIN: USERS ================= */
var ROLES=['Khách hàng','Nhân viên chi nhánh','Giao hàng','Quản trị'];
V['a-usr']={dj:['/quan-tri/nguoi-dung/','admin/users.html','UserAdminView (Group/Permission của Django auth)'],html:function(){
  var q=fold(S.auq.trim()),l=USERS.filter(function(u){return (S.aUr==='all'||u.role===S.aUr)&&(!q||fold(u.n+' '+u.mail).indexOf(q)>-1)});
  var cnt=function(r){return USERS.filter(function(u){return u.role===r}).length};
  return ph('Người dùng · '+USERS.length+' tài khoản mẫu','Người dùng <span class="it">và vai trò</span>')+
  '<div class="row" style="margin-bottom:14px">'+[['all','Tất cả']].concat(ROLES.map(function(r){return [r,r]})).map(function(r){return '<button class="chip'+(S.aUr===r[0]?' on':'')+'" data-act="aur" data-r="'+r[0]+'">'+r[1]+'<span class="n">'+(r[0]==='all'?USERS.length:cnt(r[0]))+'</span></button>'}).join('')+'</div>'+
  '<div class="fld" style="max-width:340px;margin-bottom:16px"><label for="uq">Tìm người dùng</label><input id="uq" class="in" type="search" data-in="auq" value="'+esc(S.auq)+'" placeholder="Tên hoặc email…"></div>'+
  '<section class="plate tight"><div class="tw"><table class="tbl"><thead><tr><th>Người dùng</th><th>Vai trò</th><th>Chi nhánh</th><th>Tham gia</th><th>Hoạt động</th></tr></thead><tbody>'+
  l.map(function(u){return '<tr><td><b class="nm">'+esc(u.n)+'</b><div class="sub">'+esc(u.mail)+'</div></td><td><select class="in" style="width:auto;padding:7px 8px" data-in="urole" data-id="'+u.id+'" aria-label="Vai trò của '+esc(u.n)+'">'+ROLES.map(function(r){return '<option'+(u.role===r?' selected':'')+'>'+r+'</option>'}).join('')+'</select></td><td class="mono">'+u.br+'</td><td class="mono">'+u.at+'</td><td><button class="sw'+(u.st==='Hoạt động'?' on':'')+'" data-act="utog" data-id="'+u.id+'" aria-label="Hoạt động"></button></td></tr>'}).join('')+'</tbody></table></div></section>';
}};
INP.auq=function(v){S.auq=v;render()};
INP.urole=function(v,el){var u=USERS.filter(function(x){return x.id===el.dataset.id})[0];u.role=v;if(v==='Khách hàng'||v==='Quản trị')u.br=v==='Quản trị'?'Toàn chuỗi':'—';toast(u.n+' → '+v)};
ACT.aur=function(d){S.aUr=d.r;render()};
ACT.utog=function(d){var u=USERS.filter(function(x){return x.id===d.id})[0];u.st=u.st==='Hoạt động'?'Tạm khóa':'Hoạt động';toast(u.n+': '+u.st);render()};

/* ================= ADMIN: REPORTS ================= */
function dayLabels(n){var a=[];for(var i=0;i<n;i++){var d=new Date(2026,9,12-(n-1-i));a.push(String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0'))}return a}
function chainSeries(n){var a=[];for(var i=0;i<n;i++){a.push(BR.reduce(function(s,b){return s+REV[b.id].slice(-n)[i]},0))}return a}
function lineChart(vals,labels){
  var W=640,H=240,L=46,R=14,T=14,B=30,mx=Math.ceil(Math.max.apply(null,vals)/10)*10,n=vals.length;
  var X=function(i){return L+i*(W-L-R)/(n-1)},Y=function(v){return T+(1-v/mx)*(H-T-B)};
  var pts=vals.map(function(v,i){return X(i).toFixed(1)+','+Y(v).toFixed(1)}),ticks='';
  [0,.5,1].forEach(function(t){var v=mx*t,y=Y(v);ticks+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+y+'" y2="'+y+'" stroke="var(--edge-soft)" stroke-dasharray="3 4"/><text x="'+(L-8)+'" y="'+(y+4)+'" text-anchor="end" font-size="11" font-family="IBM Plex Mono,monospace" fill="var(--ink-3)">'+v+' tr</text>'});
  var xl='';labels.forEach(function(lb,i){if(n<=8||i%2===0||i===n-1)xl+='<text x="'+X(i)+'" y="'+(H-8)+'" text-anchor="middle" font-size="11" font-family="IBM Plex Mono,monospace" fill="var(--ink-3)">'+lb+'</text>'});
  var last=vals.length-1,wk='';
  vals.forEach(function(v,i){var d=new Date(2026,9,12-(n-1-i)).getDay();if(d===0||d===6)wk+='<rect x="'+(X(i)-(W-L-R)/(n-1)/2)+'" y="'+T+'" width="'+((W-L-R)/(n-1))+'" height="'+(H-T-B)+'" fill="var(--paper-3)" opacity=".5"/>'});
  return '<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto;display:block" role="img" aria-label="Doanh thu toàn chuỗi theo ngày, đơn vị triệu đồng">'+wk+ticks+'<polygon points="'+L+','+Y(0)+' '+pts.join(' ')+' '+X(last)+','+Y(0)+'" fill="var(--terra)" opacity=".2"/><polyline points="'+pts.join(' ')+'" fill="none" stroke="var(--ink)" stroke-width="2.2" stroke-linejoin="round"/><circle cx="'+X(last)+'" cy="'+Y(vals[last])+'" r="5" fill="var(--terra)" stroke="var(--paper)" stroke-width="2"/><text x="'+(X(last)-8)+'" y="'+(Y(vals[last])-10)+'" text-anchor="end" font-size="12" font-weight="700" font-family="Archivo,sans-serif" fill="var(--ink)">'+dec(vals[last],1)+' tr</text>'+xl+'</svg>';
}
function spark(vals){var W=110,H=28,mx=Math.max.apply(null,vals),mn=Math.min.apply(null,vals),n=vals.length;return '<svg viewBox="0 0 '+W+' '+H+'" width="110" height="28" aria-hidden="true"><polyline fill="none" stroke="var(--ink)" stroke-width="1.6" points="'+vals.map(function(v,i){return (i*W/(n-1)).toFixed(1)+','+(H-3-(v-mn)/((mx-mn)||1)*(H-8)).toFixed(1)}).join(' ')+'"/><circle cx="'+W+'" cy="'+(H-3-(vals[n-1]-mn)/((mx-mn)||1)*(H-8)).toFixed(1)+'" r="3" fill="var(--terra)"/></svg>'}
function txns(){return orders.filter(function(o){return !o.hist}).map(function(o,i){var st=o.st===-1?'Hoàn tiền':(o.pay==='Tiền mặt'?(o.st===5?'Đã thu':'Chờ thu'):'Đã thanh toán');return {id:'GD-'+(7340-i),t:o.t,no:o.no,br:o.br,m:o.pay,a:o.st===-1?-o.total:o.total,s:st}})}
V['a-rep']={dj:['/quan-tri/bao-cao/','admin/reports.html','ReportView + export CSV (StreamingHttpResponse)'],html:function(){
  var n=+S.aRange,lab=dayLabels(n),ser=chainSeries(n),tot=ser.reduce(function(a,b){return a+b},0);
  var tx=txns().filter(function(t){return S.aPc==='all'||t.m===S.aPc});
  var br=BR.map(function(b){var v=REV[b.id].slice(-n);return {b:b,v:v,s:v.reduce(function(a,c){return a+c},0)}}).sort(function(a,b){return b.s-a.s});
  var methods=['Tiền mặt','Chuyển khoản','Ví MoMo'],mv=methods.map(function(m){return orders.filter(function(o){return !o.hist&&o.pay===m}).length}),mt=mv.reduce(function(a,b){return a+b},0)||1;
  var mc=['var(--ink)','var(--terra)','var(--gold)'];
  return ph('Báo cáo · '+n+' ngày gần nhất','Doanh thu <span class="it">và thanh toán</span>','<div class="row"><button class="btn ghost" data-act="csv" data-w="rev">Xuất doanh thu CSV</button><button class="btn" data-act="csv" data-w="tx">Xuất giao dịch CSV</button></div>')+
  '<div class="row" style="margin-bottom:18px">'+[['7','7 ngày'],['14','14 ngày']].map(function(r){return '<button class="chip'+(S.aRange===r[0]?' on':'')+'" data-act="arange" data-r="'+r[0]+'">'+r[1]+'</button>'}).join('')+'</div>'+
  '<div class="bento"><section class="plate s8"><div class="row" style="margin-bottom:10px"><h2 class="h3">Doanh thu toàn chuỗi theo ngày</h2><span class="cap right">Triệu đồng · nền đậm = cuối tuần</span></div>'+lineChart(ser,lab)+'</section>'+
  '<section class="plate ink s4"><div class="cap">Tổng '+n+' ngày</div><div class="num" style="font-size:52px;margin:10px 0">'+dec(tot,1)+' <span style="font-size:22px">tr</span></div><div class="mono" style="font-size:12px;opacity:.75">Trung bình '+dec(tot/n,1)+' tr mỗi ngày</div><hr class="foil" style="margin:18px 0"><div class="cap" style="margin-bottom:8px">Cơ cấu thanh toán hôm nay</div><div class="stack" style="border-color:rgba(255,255,255,.4)">'+mv.map(function(v,i){return '<div style="flex:'+v+' 1 0;background:'+mc[i]+';'+(i===0?'color:var(--paper);background:var(--paper-3);':'')+'">'+(v?Math.round(v/mt*100)+'%':'')+'</div>'}).join('')+'</div><div class="row" style="margin-top:8px;font-size:12px;gap:14px">'+methods.map(function(m,i){return '<span>'+m+': '+mv[i]+'</span>'}).join('')+'</div></section>'+
  '<section class="plate s12 tight"><div class="cap" style="padding:8px 10px">Doanh thu theo chi nhánh</div><div class="tw"><table class="tbl"><thead><tr><th>Chi nhánh</th><th class="tr">Doanh thu (tr)</th><th style="min-width:130px">Tỷ trọng</th><th>Xu hướng</th><th class="tr">TB / ngày</th></tr></thead><tbody>'+
  br.map(function(r){return '<tr><td class="nm">'+r.b.id+' · '+esc(r.b.n)+'</td><td class="tr mono"><b>'+dec(r.s,1)+'</b></td><td><div class="meter terra"><i style="width:'+Math.round(r.s/tot*100)+'%"></i></div><div class="mono dim" style="font-size:11px;margin-top:3px">'+Math.round(r.s/tot*100)+'%</div></td><td>'+spark(r.v)+'</td><td class="tr mono">'+dec(r.s/n,1)+'</td></tr>'}).join('')+'</tbody></table></div></section>'+
  '<section class="plate s12 tight"><div class="row" style="padding:8px 10px"><div class="cap grow">Lịch sử giao dịch hôm nay</div>'+[['all','Tất cả']].concat(methods.map(function(m){return [m,m]})).map(function(m){return '<button class="chip'+(S.aPc===m[0]?' on':'')+'" data-act="apm" data-m="'+m[0]+'">'+m[1]+'</button>'}).join('')+'</div><div class="tw"><table class="tbl"><thead><tr><th>Mã GD</th><th>Giờ</th><th>Đơn</th><th>Chi nhánh</th><th>Phương thức</th><th class="tr">Số tiền</th><th>Trạng thái</th></tr></thead><tbody>'+
  tx.map(function(t){var c={'Đã thanh toán':'ok','Đã thu':'ok','Chờ thu':'warn','Hoàn tiền':'bad'}[t.s];return '<tr><td class="mono nm">'+t.id+'</td><td class="mono">'+esc(t.t)+'</td><td class="mono">'+t.no.slice(-4)+'</td><td>'+esc(BM[t.br].n)+'</td><td>'+esc(t.m)+'</td><td class="tr mono">'+(t.a<0?'− ':'')+money(Math.abs(t.a))+'</td><td>'+pill(t.s,c)+'</td></tr>'}).join('')+'</tbody></table></div></section></div>';
}};
ACT.arange=function(d){S.aRange=d.r;render()};
ACT.apm=function(d){S.aPc=d.m;render()};
ACT.csv=function(d){
  var rows,title;
  if(d.w==='tx'){title='Giao dịch hôm nay (CSV)';rows=[['ma_gd','gio','don','chi_nhanh','phuong_thuc','so_tien','trang_thai']].concat(txns().map(function(t){return [t.id,t.t,t.no,t.br,t.m,t.a,t.s]}))}
  else{var n=+S.aRange,lab=dayLabels(n);title='Doanh thu theo chi nhánh (CSV)';rows=[['ngay'].concat(BR.map(function(b){return b.id+'_trieu_dong'}))].concat(lab.map(function(l,i){return [l].concat(BR.map(function(b){return REV[b.id].slice(-n)[i]}))}))}
  var csv=rows.map(function(r){return r.map(function(c){return '"'+String(c).replace(/"/g,'""')+'"'}).join(',')}).join('\n');
  S.layer={k:'csv',title:title,csv:csv};renderLayer();
};
LAY.csv=function(l){return '<div class="mdl" role="dialog" aria-label="'+esc(l.title)+'"><div class="row" style="margin-bottom:10px"><h3 class="h3">'+esc(l.title)+'</h3><button class="btn ghost sm right" data-act="closeLayer">Đóng</button></div><p class="dim" style="font-size:13.5px;margin-bottom:12px">Bản xem trước không cho tải tệp trực tiếp. Sao chép nội dung CSV bên dưới. Trong Django, nút này trả về StreamingHttpResponse.</p><textarea id="csvt" class="in" rows="10" readonly style="font-family:var(--f-m);font-size:12px">'+esc(l.csv)+'</textarea><div class="row" style="margin-top:12px"><button class="btn terra" data-act="copycsv">Sao chép CSV</button></div></div>'};
ACT.copycsv=function(){var t=$('#csvt');if(!t)return;t.select();try{navigator.clipboard.writeText(t.value).then(function(){toast('Đã sao chép CSV')},function(){toast('Đã chọn sẵn nội dung, nhấn Ctrl+C để sao chép')})}catch(e){toast('Đã chọn sẵn nội dung, nhấn Ctrl+C để sao chép')}};

/* ================= ADMIN: CONFIG / RULES ================= */
var BASKETS=[['Cơm thố xá xíu + Nem nướng ×2',[['d1',1],['d3',2]]],['Mỳ cay hải sản ×2',[['d4',2]]],['Bún đậu mắm tôm + Chân gà',[['d6',1],['d9',1]]],['Cà phê muối ×2',[['d12',2]]]];
function cfgWeights(){
  var s=(RULES.wd+RULES.wl+RULES.wp)||1,sh=function(v){return Math.round(v/s*100)};
  return '<div class="stack" aria-label="Tỷ trọng sau chuẩn hóa"><div style="flex:'+RULES.wd+' 1 0;background:var(--ink);color:var(--paper)">'+(RULES.wd?sh(RULES.wd)+'%':'')+'</div><div style="flex:'+RULES.wl+' 1 0;background:var(--terra)">'+(RULES.wl?sh(RULES.wl)+'%':'')+'</div><div style="flex:'+RULES.wp+' 1 0;background:var(--gold);color:#1B1305">'+(RULES.wp?sh(RULES.wp)+'%':'')+'</div></div><div class="row mono dim" style="font-size:11.5px;margin-top:8px;gap:14px"><span>■ Khoảng cách</span><span style="color:var(--terra-t)">■ Tải bếp</span><span style="color:var(--gold)">■ Thời gian chuẩn bị</span></div>';
}
function cfgPreview(){
  var it=BASKETS[S.sampleI][1],res=evalBranches(it,S.sampleAddr),win=res.filter(function(r){return r.ok})[0];
  return '<div class="row" style="margin-bottom:12px"><div class="grow"><div class="cap">Bếp được chọn</div><div style="font:800 24px var(--f-d);font-stretch:112%">'+(win?'Miêu Quán '+esc(win.b.n):'Không có bếp phù hợp')+'</div></div>'+(win?'<div class="tr"><div class="cap">Điểm</div><b class="num" style="font-size:34px;color:var(--terra-t)">'+win.score+'</b></div>':'')+'</div>'+
  res.map(function(r,i){var sd=Math.round(r.sd*100),sl=Math.round(r.sl*100),sp=Math.round(r.sp*100);return '<div class="il" style="align-items:center;flex-wrap:wrap;'+(r.ok?'':'opacity:.5')+'"><span style="min-width:120px"><b>'+(r===win?'▸ ':'')+esc(r.b.n)+'</b><div class="mono dim" style="font-size:11px">'+dec(r.dist)+' km · '+Math.round(r.pct*100)+'% · ~'+r.prep+"'"+'</div>'+(r.ok?'':'<span class="rsn">'+esc(r.reasons[0])+'</span>')+'</span><span class="grow" style="min-width:160px;max-width:300px">'+(r.ok?'<div class="meter terra"><i style="width:'+r.score+'%"></i></div><div class="mono dim" style="font-size:10.5px;margin-top:4px">KC '+sd+' · Tải '+sl+' · CB '+sp+'</div>':'')+'</span><b class="num" style="font-size:22px;width:36px;text-align:right">'+(r.ok?r.score:'×')+'</b></div>'}).join('');
}
function slider(id,lab,min,max,step,val,unit,key){return '<div class="fld" style="margin-bottom:18px"><label for="'+id+'">'+lab+': <span id="lv_'+key+'" style="color:var(--ink)">'+val+unit+'</span></label><input id="'+id+'" type="range" min="'+min+'" max="'+max+'" step="'+step+'" value="'+val+'" data-in="cfg_'+key+'"></div>'}
V['a-cfg']={dj:['/quan-tri/cau-hinh/dieu-phoi/','admin/dispatch_rules.html','DispatchRuleUpdateView (model DispatchRule, 1 bản ghi)'],html:function(){
  return ph('Cấu hình · quy tắc điều phối','Trọng số <span class="it">chấm điểm</span>','<div class="row"><button class="btn ghost" data-act="cfgreset">Khôi phục mặc định</button><button class="btn terra" data-act="cfgsave">Lưu cấu hình</button></div>')+
  '<div class="bento"><section class="plate s5"><div class="cap" style="margin-bottom:14px">Trọng số, sẽ được chuẩn hóa về 100%</div>'+
  slider('w1','Khoảng cách',0,100,5,RULES.wd,'','wd')+slider('w2','Tải bếp',0,100,5,RULES.wl,'','wl')+slider('w3','Thời gian chuẩn bị',0,100,5,RULES.wp,'','wp')+'<div id="cfgw">'+cfgWeights()+'</div><hr class="rule" style="margin:22px 0 18px"><div class="cap" style="margin-bottom:14px">Ngưỡng loại và chuẩn hóa</div>'+
  slider('t1','Loại khi tải vượt',60,100,5,RULES.maxLoad,'%','maxLoad')+slider('t2','Khoảng cách tối đa để chấm điểm',4,15,1,RULES.maxKm,' km','maxKm')+slider('t3','Thời gian chuẩn bị tối đa để chấm điểm',30,120,5,RULES.maxPrep,' phút','maxPrep')+
  '<p class="mono dim" style="font-size:11.5px">Điều kiện loại cứng: đóng cửa, ngoài vùng giao, thiếu món. Hòa điểm chọn bếp gần hơn.</p></section>'+
  '<section class="plate s7"><div class="row" style="margin-bottom:14px"><h2 class="h3 grow">Xem trước trực tiếp</h2></div><div class="f2" style="margin-bottom:16px"><div class="fld"><label for="sb">Giỏ hàng mẫu</label><select id="sb" class="in" data-in="sbasket">'+BASKETS.map(function(b,i){return '<option value="'+i+'"'+(S.sampleI===i?' selected':'')+'>'+b[0]+'</option>'}).join('')+'</select></div><div class="fld"><label for="sa">Địa chỉ giao mẫu</label><select id="sa" class="in" data-in="saddr">'+Object.keys(ADDR).slice(0,5).map(function(k){return '<option value="'+k+'"'+(S.sampleAddr===k?' selected':'')+'>'+esc(ADDR[k].l)+' · '+esc(ADDR[k].a.split(', ').slice(-2)[0])+'</option>'}).join('')+'</select></div></div><div id="cfgprev">'+cfgPreview()+'</div></section>'+
  '<section class="s12"><div class="cap" style="margin-bottom:8px">Công thức cho đội phát triển (Django, services/dispatch.py)</div><div class="code"><span class="c"># Loại cứng: mở cửa, nhận đơn, trong vùng giao, đủ món, tải ≤ ngưỡng</span>\n<span class="k">def</span> score(b, order, r):\n    d = <span class="s">1</span> - min(b.distance_km(order) / r.max_km, <span class="s">1</span>)\n    l = <span class="s">1</span> - min(b.active_orders() / b.capacity, <span class="s">1</span>)\n    p = <span class="s">1</span> - min(b.prep_minutes(order) / r.max_prep, <span class="s">1</span>)\n    <span class="k">return</span> round(<span class="s">100</span> * (r.w_distance*d + r.w_load*l + r.w_prep*p)\n                 / (r.w_distance + r.w_load + r.w_prep))\n\n<span class="k">def</span> assign(order):\n    ok = [b <span class="k">for</span> b <span class="k">in</span> Branch.objects.eligible_for(order)]\n    best = max(ok, key=<span class="k">lambda</span> b: (score(b, order, rule), -b.distance_km(order)))\n    <span class="k">return</span> best</div></section></div>';
}};
function cfgLive(key,v,unit){RULES[key]=+v;var e=$('#lv_'+key);if(e)e.textContent=v+unit;var w=$('#cfgw');if(w)w.innerHTML=cfgWeights();var p=$('#cfgprev');if(p)p.innerHTML=cfgPreview()}
INP.cfg_wd=function(v){cfgLive('wd',v,'')};INP.cfg_wl=function(v){cfgLive('wl',v,'')};INP.cfg_wp=function(v){cfgLive('wp',v,'')};
INP.cfg_maxLoad=function(v){cfgLive('maxLoad',v,'%')};INP.cfg_maxKm=function(v){cfgLive('maxKm',v,' km')};INP.cfg_maxPrep=function(v){cfgLive('maxPrep',v,' phút')};
INP.sbasket=function(v){S.sampleI=+v;render()};INP.saddr=function(v){S.sampleAddr=v;render()};
ACT.cfgreset=function(){Object.keys(RULES0).forEach(function(k){RULES[k]=RULES0[k]});toast('Đã khôi phục cấu hình mặc định');render()};
ACT.cfgsave=function(){toast('Đã lưu: khoảng cách '+RULES.wd+', tải '+RULES.wl+', chuẩn bị '+RULES.wp+'. Áp dụng cho đơn mới.')};

/* ================= INIT ================= */
function fromHash(){
  var h=(location.hash||'').slice(1);if(!h)return false;
  var i=h.indexOf('.'),k=i<0?h:h.slice(0,i),p=i<0?null:h.slice(i+1);
  if(V[k]&&roleOf(k)===PAGE_ROLE){S.key=k;S.par=p;if(k==='dish')S.dq=1;return true}return false;
}
if(!fromHash())setHash();render({top:true});
window.addEventListener('hashchange',function(){var h=(location.hash||'').slice(1),cur=S.key+(S.par?'.'+S.par:'');if(h!==cur){if(fromHash()){stopDisp();S.layer=null;render({top:true})}else setHash()}});
})();
