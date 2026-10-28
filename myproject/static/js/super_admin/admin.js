'use strict';
PAGE_ROLE='admin';PAGE_HOME='a-ctrl';
/* ================= ADMIN MODULE ================= */
function sideAdmin(){
  var ov=BR.filter(function(b){return liveLoad(b)/b.cap>RULES.maxLoad/100}).length;
  return '<aside class="side"><div class="sh"><div class="cap">Trung tâm điều hành</div><div style="font:800 17px var(--f-d);font-stretch:112%;margin-top:6px">Toàn chuỗi · 5 chi nhánh</div></div>'+
  sideNav([['a-ctrl','Tổng quan toàn chuỗi','radar',ov||''],['a-disp','Điều phối đơn','list'],['a-br','Chi nhánh','pin'],['a-prod','Món ăn','dish'],['a-ord','Đơn hàng','box'],['a-usr','Người dùng','user'],['a-rep','Báo cáo','chart'],['a-cfg','Cấu hình','cog']],S.key)+'</aside>';
}
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
S.sampleI=0;S.aPc='all';
V['a-prod']={dj:['/quan-tri/mon-an/','admin/products.html','ProductAdminView + CategoryAdminView (ImageField → MEDIA_ROOT)'],html:function(){
  var q=fold(S.apq.trim()),l=D.filter(function(d){return (S.aPc==='all'||d.c===S.aPc)&&(!q||fold(d.n).indexOf(q)>-1)});
  return ph('Món ăn · '+D.length+' món · '+CATS.length+' danh mục','Danh mục <span class="it">toàn chuỗi</span>')+
  '<div class="bento"><section class="plate s3"><div class="cap" style="margin-bottom:8px">Danh mục</div><div class="cats" style="display:flex;flex-direction:column"><button class="chip'+(S.aPc==='all'?' on':'')+'" style="margin-bottom:6px;text-align:left" data-act="apc" data-c="all">Tất cả<span class="n">'+D.length+'</span></button>'+
  CATS.map(function(c){return '<div class="row" style="flex-wrap:nowrap;margin-bottom:6px"><button class="chip grow'+(S.aPc===c[0]?' on':'')+'" style="text-align:left" data-act="apc" data-c="'+c[0]+'">'+c[1]+'<span class="n">'+D.filter(function(d){return d.c===c[0]}).length+'</span></button><button class="sw'+(S.catHide[c[0]]?'':' on')+'" data-act="chide" data-c="'+c[0]+'" aria-label="Hiển thị danh mục '+c[1]+'"></button></div>'}).join('')+'</div><p class="mono dim" style="font-size:11.5px;margin-top:10px">Công tắc: hiển thị danh mục trên thực đơn khách.</p></section>'+
  '<section class="plate s9 tight"><div class="row" style="padding:6px 8px"><div class="fld grow" style="max-width:320px"><label for="pq">Tìm món</label><input id="pq" class="in" type="search" data-in="apq" value="'+esc(S.apq)+'" placeholder="Tên món…"></div></div><div class="tw"><table class="tbl"><thead><tr><th>Món</th><th>Danh mục</th><th>Giá (đ)</th><th>Bán toàn chuỗi</th><th>Chi nhánh đang bán</th><th>Thao tác</th></tr></thead><tbody>'+
  l.map(function(d){
    // Thêm nút Sửa ở đây
    return '<tr><td><div class="row" style="flex-wrap:nowrap"><div class="art" style="width:52px;height:52px;aspect-ratio:auto;border:1.5px solid var(--edge);flex:none">'+ (d.image_url ? '<img src="'+d.image_url+'" style="width:100%;height:100%;object-fit:cover;border-radius:8px">' : art(d.id)) +'</div><div><b class="nm">'+esc(d.n)+'</b><div class="sub">'+esc(d.sub)+'</div></div></div></td><td>'+CATN[d.c]+'</td><td><input class="in" style="width:104px;padding:7px 8px" type="number" step="1000" min="0" value="'+d.p+'" data-in="price" data-id="'+d.id+'" aria-label="Giá '+esc(d.n)+'"></td><td><button class="sw'+(d.global?' on':'')+'" data-act="gtoggle" data-id="'+d.id+'" aria-label="Bán toàn chuỗi '+esc(d.n)+'"></button></td><td class="mono">'+dishBranches(d.id)+' / 5</td><td><button class="btn sm ghost" data-act="admin-edit-product" data-code="'+d.id+'">Sửa</button></td></tr>'
  }).join('')+'</tbody></table></div></section>'+
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

/* ================= ADMIN: CHỈNH SỬA MÓN ĂN (MODAL) ================= */
ACT['admin-edit-product'] = function(d) {
  var code = d.code;
  var modalHtml = `
    <div id="edit-product-modal" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;">
      <div style="background:white;border-radius:12px;width:100%;max-width:600px;max-height:90vh;overflow-y:auto;padding:20px;position:relative;">
        <button id="close-modal" style="position:absolute;top:15px;right:15px;background:none;border:none;font-size:24px;cursor:pointer;">&times;</button>
        <h2 style="margin-top:0;margin-bottom:20px;">Chỉnh sửa món ăn (Toàn hệ thống)</h2>
        
        <form id="edit-product-form" onsubmit="event.preventDefault();">
          <div class="fld">
            <label>Tên món ăn</label>
            <input type="text" id="ep-name" class="in" style="width:100%;border:1px solid #ddd;padding:10px;border-radius:6px;" required>
          </div>
          
          <div class="fld" style="margin-top:15px;">
            <label>Ảnh món ăn (Tùy chọn)</label>
            <input type="file" id="ep-image" accept="image/*" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:6px;">
          </div>

          <hr style="margin:20px 0;border:none;border-top:1px solid #eee;">
          
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <h3 style="margin:0;font-size:16px;">Định lượng nguyên liệu (1 phần)</h3>
            <button type="button" class="btn sm terra" onclick="adminAddRecipeRow()">+ Thêm NVL</button>
          </div>
          <div id="ep-recipes-container" style="display:flex;flex-direction:column;gap:10px;"></div>

          <div style="margin-top:30px;text-align:right;">
            <button type="button" class="btn ghost" onclick="document.getElementById('edit-product-modal').remove()">Hủy</button>
            <button type="button" class="btn terra" id="save-product-btn" onclick="adminSaveProduct('${code}')">Lưu thay đổi</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  
  document.getElementById('close-modal').onclick = function() {
    document.getElementById('edit-product-modal').remove();
  };

  fetch('/api/branch/products/' + code + '/update/', { credentials: 'same-origin' })
  .then(r => r.json())
  .then(function(data) {
    if(data.error) throw new Error(data.error);
    document.getElementById('ep-name').value = data.name;
    var container = document.getElementById('ep-recipes-container');
    container.innerHTML = '';
    
    if (data.recipes && data.recipes.length > 0) {
      data.recipes.forEach(function(r) { adminAddRecipeRow(r.name, r.qty, r.unit); });
    } else {
      adminAddRecipeRow('', '', '');
    }
  }).catch(function(err) {
    toast('Lỗi tải thông tin món: ' + err.message);
    document.getElementById('edit-product-modal').remove();
  });
};

function adminAddRecipeRow(name = '', qty = '', unit = '') {
  var container = document.getElementById('ep-recipes-container');
  var div = document.createElement('div');
  div.className = 'recipe-row';
  div.style.display = 'flex';
  div.style.gap = '10px';
  div.style.alignItems = 'center';

  div.innerHTML = `
    <input type="text" class="in recipe-name" value="${name}" placeholder="Tên NVL (VD: Thịt bò)" style="flex:2;padding:8px;border:1px solid #ddd;border-radius:6px;">
    <input type="number" class="in recipe-qty" value="${qty}" step="0.001" min="0" placeholder="SL" style="flex:1;padding:8px;border:1px solid #ddd;border-radius:6px;">
    <input type="text" class="in recipe-unit" value="${unit}" placeholder="ĐV (kg...)" style="flex:1;padding:8px;border:1px solid #ddd;border-radius:6px;">
    <button type="button" class="btn sm ghost" style="color:red;padding:8px;" onclick="this.parentElement.remove()">Xóa</button>
  `;
  container.appendChild(div);
}

function adminSaveProduct(code) {
  var btn = document.getElementById('save-product-btn');
  btn.innerText = 'Đang lưu...';
  btn.disabled = true;

  var formData = new FormData();
  formData.append('name', document.getElementById('ep-name').value);
  
  var fileInput = document.getElementById('ep-image');
  if (fileInput.files.length > 0) {
    formData.append('image', fileInput.files[0]);
  }

  // Tìm CSRF token từ thẻ input (đảm bảo trong admin.html có {% csrf_token %})
  var csrf = document.querySelector('input[name="csrfmiddlewaretoken"]');
  var headers = { 'X-CSRFToken': csrf ? csrf.value : '' };

  fetch('/api/branch/products/' + code + '/update/', {
    method: 'POST',
    headers: headers,
    body: formData
  })
  .then(r => {
    if (!r.ok) {
       return r.text().then(text => { throw new Error("Lỗi Server: " + text.substring(0, 100)); });
    }
    return r.json();
  })
  .then(data => {
    if (data.error) throw new Error(data.error);
    
    var recipes = [];
    document.querySelectorAll('#ep-recipes-container .recipe-row').forEach(function(row) {
      var name = row.querySelector('.recipe-name').value.trim();
      var qty = row.querySelector('.recipe-qty').value;
      var unit = row.querySelector('.recipe-unit').value.trim();
      if (name && qty > 0 && unit) {
        recipes.push({ name: name, qty: qty, unit: unit });
      }
    });

    return fetch('/api/branch/products/' + code + '/recipe/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrf ? csrf.value : ''
      },
      body: JSON.stringify({ recipes: recipes })
    }).then(r => r.json());
  })
  .then(data => {
    if (data.error) throw new Error(data.error);
    toast('Đã lưu thay đổi món ăn!');
    document.getElementById('edit-product-modal').remove();
    
    setTimeout(() => location.reload(), 800);
  })
  .catch(err => {
    console.error("Lỗi:", err);
    toast('Lỗi: ' + err.message);
    btn.innerText = 'Lưu thay đổi';
    btn.disabled = false;
  });
}

initApp();