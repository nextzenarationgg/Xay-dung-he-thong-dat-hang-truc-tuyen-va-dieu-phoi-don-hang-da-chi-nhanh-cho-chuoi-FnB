'use strict';
PAGE_ROLE='branch';PAGE_HOME='b-dash';
/* ================= BRANCH MODULE ================= */
function sideBranch(){
  var b=BM[S.br],nw=orders.filter(function(o){return o.br===b.id&&o.st===0}).length,rd=orders.filter(function(o){return o.br===b.id&&o.st===3&&!o.ship}).length;
  var branchLabel=app.getAttribute('data-branch-name');
  return '<aside class="side"><div class="sh"><div class="cap">Bảng điều khiển chi nhánh</div>'+(branchLabel?'<div class="branch-name">CN '+esc(branchLabel)+'</div>':'<select id="brsel" data-in="brsel" aria-label="Chọn chi nhánh">'+branchOpt(S.br)+'</select>')+'</div>'+
  sideNav([['b-dash','Tổng quan chi nhánh','grid'],['b-orders','Đơn hàng','box',nw||''],['b-menu','Thực đơn chi nhánh','dish'],['b-inv','Kho hàng','store'],['b-ship','Giao hàng','truck',rd||'']],S.key)+
  '<div class="tog"><button class="sw'+(b.accepting?' on':'')+'" data-act="accept" data-id="'+b.id+'" aria-label="Nhận đơn" aria-pressed="'+b.accepting+'"></button><span>'+(b.accepting?'Đang nhận đơn':'Tạm ngưng nhận đơn')+'</span></div></aside>';
}
/* ================= BRANCH ================= */
var NEXT=['Xác nhận đơn','Bắt đầu chế biến','Đánh dấu sẵn sàng giao','Giao cho shipper','Hoàn thành giao'];
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


initApp();
