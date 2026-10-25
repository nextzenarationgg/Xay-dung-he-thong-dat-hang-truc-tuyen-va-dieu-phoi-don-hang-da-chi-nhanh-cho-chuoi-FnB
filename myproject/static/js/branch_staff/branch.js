'use strict';
PAGE_ROLE='branch';PAGE_HOME='b-dash';
/* ================= BRANCH MODULE ================= */
var branchData=null,branchOrders=[],branchOrdersError='';
function branchRequest(url,method,data){
  var options={method:method,credentials:'same-origin',headers:{Accept:'application/json'}};
  if(method!=='GET'){
    var csrf=$('#branch-csrf-form input[name="csrfmiddlewaretoken"]');
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
        try{payload=JSON.parse(text)}catch(error){throw new Error('Máy chủ trả về dữ liệu không đọc được.')}
      }
      if(!response.ok)throw new Error(payload.error||'Yêu cầu thất bại ('+response.status+').');
      return payload;
    });
  });
}
function loadBranchOrders(){
  return branchRequest('/api/branch/orders/','GET').then(function(payload){
    branchData=payload.branch;
    branchOrders=payload.orders;
    branchShippers=payload.shippers;
    branchOrdersError='';
  }).catch(function(error){
    branchOrdersError=error.message||'Không thể tải đơn hàng chi nhánh.';
    toast(branchOrdersError);
  });
}
var branchShippers=[];
function branchStatusClass(status){
  return status==='pending'?'warn':(status==='cancelled'?'bad':(status==='completed'?'ok':'terra'));
}
function branchOrderMatches(order){
  var q=fold(S.bq.trim());
  return (S.bst==='all'||S.bst===order.status)&&
    (S.bpay==='all'||S.bpay===order.payment_method_label)&&
    (!q||fold(order.code+' '+order.recipient_name+' '+order.items.map(function(item){return item.name}).join(' ')).indexOf(q)>-1);
}
function branchOrderPage(){
  if(branchOrdersError)return ph('Hộp đơn chi nhánh','Đơn hàng <span class="it">chưa tải được</span>')+
    '<div class="empty">'+esc(branchOrdersError)+'<br><br><button class="btn terra" data-act="brefresh">Thử tải lại</button></div>';
  var filtered=branchOrders.filter(branchOrderMatches);
  var statuses=[['all','Tất cả'],['pending','Chờ nhận'],['confirmed','Đã xác nhận'],['preparing','Đang chuẩn bị'],['ready','Sẵn sàng giao'],['delivering','Đang giao'],['completed','Hoàn thành']];
  var chips=statuses.map(function(entry){
    var count=entry[0]==='all'?branchOrders.length:branchOrders.filter(function(order){return order.status===entry[0]}).length;
    return '<button class="chip'+(S.bst===entry[0]?' on':'')+'" data-act="bst" data-s="'+entry[0]+'">'+entry[1]+'<span class="n">'+count+'</span></button>';
  }).join('');
  var selected=filtered.filter(function(order){return order.code===S.bsel})[0]||filtered[0]||null;
  var list=filtered.length?filtered.map(function(order){
    var selectedClass=selected&&selected.code===order.code?'sel':'';
    return '<tr data-act="bsel" data-no="'+esc(order.code)+'" class="'+selectedClass+'"><td class="nm mono">'+esc(order.code)+'</td><td class="mono">'+esc(new Date(order.created_at).toLocaleString('vi-VN'))+'</td><td>'+esc(order.recipient_name)+'<div class="sub">'+esc(order.payment_method_label)+'</div></td><td style="max-width:220px"><div class="sub" style="color:var(--ink-2)">'+esc(order.items.map(function(item){return item.name+' × '+item.quantity}).join(', '))+'</div></td><td class="tr mono nw">'+money(order.total)+'</td><td><span class="pill '+branchStatusClass(order.status)+'">'+esc(order.status_label)+'</span></td></tr>';
  }).join(''):'<tr><td colspan="6"><div class="empty">Không có đơn khớp bộ lọc.</div></td></tr>';
  var detail='<div class="empty">Chọn một đơn để xem chi tiết.</div>';
  if(selected){
    var canClaim=selected.status==='pending'&&!selected.branch_name;
    var nextStatus=selected.status==='confirmed'?'preparing':
      (selected.status==='preparing'?'ready':
        (selected.status==='delivering'?'completed':null));
    detail='<aside class="plate" style="position:sticky;top:96px"><div class="row"><b class="num" style="font-size:22px">'+esc(selected.code)+'</b><span class="pill '+branchStatusClass(selected.status)+'">'+esc(selected.status_label)+'</span></div>'+
      '<div class="mono dim" style="font-size:12px;margin:6px 0 14px">Đặt lúc '+esc(new Date(selected.created_at).toLocaleString('vi-VN'))+' · '+esc(selected.payment_method_label)+'</div>'+
      '<div class="cap">Khách hàng</div><div style="margin:4px 0 12px"><b>'+esc(selected.recipient_name)+'</b> · <span class="mono">'+esc(selected.recipient_phone)+'</span><div class="dim" style="font-size:13px">'+esc(selected.delivery_address)+'</div>'+
      (selected.note?'<div style="margin-top:6px;padding:6px 8px;background:var(--paper-2);font-size:13px">Ghi chú: '+esc(selected.note)+'</div>':'')+
      (selected.branch_name?'<div class="dim" style="font-size:13px;margin-top:6px">Chi nhánh nhận: '+esc(selected.branch_name)+'</div>':'<div class="dim" style="font-size:13px;margin-top:6px">Đơn đang ở hộp chung, chi nhánh nhận trước sẽ xử lý.</div>')+'</div>'+
      '<div class="cap">Món trong đơn</div>'+selected.items.map(function(item){return '<div class="il"><span>'+esc(item.name)+' <b class="mono">× '+item.quantity+'</b>'+(item.note?'<div class="sub">Ghi chú: '+esc(item.note)+'</div>':'')+'</span><span class="mono">'+money(item.line_total)+'</span></div>'}).join('')+
      '<div class="tot"><span class="dim">Tạm tính</span><span class="mono">'+money(selected.subtotal)+'</span></div><div class="tot"><span class="dim">Phí giao</span><span class="mono">'+money(selected.delivery_fee)+'</span></div><div class="tot"><span class="dim">Giảm giá</span><span class="mono">'+money(selected.discount)+'</span></div><div class="tot big"><span class="cap">Tổng</span><span class="num" style="font-size:24px">'+money(selected.total)+'</span></div>'+
      (canClaim?'<button class="btn terra blk" data-act="bclaim" data-no="'+esc(selected.code)+'">Nhận xử lý đơn</button>':
        (selected.status==='ready'?'<button class="btn ghost blk" data-act="go" data-k="b-ship">Chọn shipper</button>':
          (nextStatus?'<button class="btn terra blk" data-act="bstatus" data-no="'+esc(selected.code)+'" data-status="'+nextStatus+'">'+(nextStatus==='preparing'?'Bắt đầu chuẩn bị':(nextStatus==='ready'?'Đánh dấu sẵn sàng giao':'Xác nhận giao hoàn tất'))+'</button>':'')))+'</aside>';
  }
  return ph((branchData?esc(branchData.name)+' · ':'')+branchOrders.length+' đơn','Hộp <span class="it">đơn hàng</span>')+
    '<div class="row" style="margin-bottom:16px">'+chips+'</div>'+
    '<div class="row" style="margin-bottom:18px"><div class="fld grow" style="max-width:340px"><label for="bq">Tìm đơn</label><input id="bq" class="in" type="search" data-in="bq" value="'+esc(S.bq)+'" placeholder="Mã đơn, khách, món…"></div><button class="btn ghost" data-act="brefresh">Làm mới</button></div>'+
    '<div class="split"><section class="plate tight"><div class="tw"><table class="tbl"><thead><tr><th>Mã đơn</th><th>Thời gian</th><th>Khách</th><th>Món</th><th class="tr">Tổng</th><th>Trạng thái</th></tr></thead><tbody>'+list+'</tbody></table></div></section>'+detail+'</div>';
}
function branchAction(url,data,successMessage){
  branchRequest(url,'POST',data).then(function(){
    toast(successMessage);
    return loadBranchOrders();
  }).then(function(){render()}).catch(function(error){
    toast(error.message||'Không thể cập nhật đơn hàng.');
    loadBranchOrders().then(function(){render()});
  });
}
function sideBranch(){
  var b=BM[S.br],nw=branchOrders.filter(function(order){return order.status==='pending'||order.status==='confirmed'}).length,rd=branchOrders.filter(function(order){return order.status==='ready'}).length;
  var branchLabel=app.getAttribute('data-branch-name');
  return '<aside class="side"><div class="sh"><div class="cap">Bảng điều khiển chi nhánh</div>'+(branchLabel?'<div class="branch-name">CN '+esc(branchLabel)+'</div>':'<select id="brsel" data-in="brsel" aria-label="Chọn chi nhánh">'+branchOpt(S.br)+'</select>')+'</div>'+
  sideNav([['b-dash','Tổng quan chi nhánh','grid'],['b-orders','Đơn hàng','box',nw||''],['b-menu','Thực đơn chi nhánh','dish'],['b-inv','Kho hàng','store'],['b-ship','Giao hàng','truck',rd||'']],S.key)+
  '<div class="tog"><button class="sw'+(b.accepting?' on':'')+'" data-act="accept" data-id="'+b.id+'" aria-label="Nhận đơn" aria-pressed="'+b.accepting+'"></button><span>'+(b.accepting?'Đang nhận đơn':'Tạm ngưng nhận đơn')+'</span></div></aside>';
}
/* ================= BRANCH ================= */
V['b-dash']={dj:['/api/branch/orders/','branch/dashboard.html','GET /api/branch/orders/'],html:function(){
  var branchName=branchData?branchData.name:(app.getAttribute('data-branch-name')||'Chi nhánh');
  var count=function(status){return branchOrders.filter(function(order){return order.status===status}).length};
  var readyCount=count('ready');
  var low=invLow(S.br),offs=D.filter(function(d){return AV[S.br][d.id]!=='on'});
  var summary=branchOrdersError?
    '<div class="plate"><div class="row"><span class="grow">'+esc(branchOrdersError)+'</span><button class="btn" data-act="brefresh">Thử tải lại</button></div></div>':
    '<div class="bento"><div class="plate s3 terra"><div class="kpi"><span class="cap">Chờ tiếp nhận</span><span class="num">'+count('pending')+'</span></div></div>'+
    '<div class="plate s3"><div class="kpi"><span class="cap">Đang chuẩn bị</span><span class="num">'+(count('confirmed')+count('preparing'))+'</span></div></div>'+
    '<div class="plate s3"><div class="kpi"><span class="cap">Sẵn sàng giao</span><span class="num">'+readyCount+'</span>'+(readyCount>0?'<button class="btn sm" data-act="go" data-k="b-ship">Chọn shipper</button>':'')+'</div></div>'+
    '<div class="plate ink s3"><div class="kpi"><span class="cap">Đang giao</span><span class="num">'+count('delivering')+'</span></div></div>'+
    '<section class="plate s12"><div class="row"><h2 class="h3">Đơn gần đây</h2><button class="btn ghost sm" data-act="go" data-k="b-orders">Mở hộp đơn</button></div>'+
    (branchOrders.length?branchOrders.slice(0,8).map(function(order){
      return '<div class="il"><span><b class="mono">'+esc(order.code)+'</b> · '+esc(order.recipient_name)+'<div class="sub">'+esc(order.items.map(function(item){return item.name+' × '+item.quantity}).join(', '))+'</div></span><span class="pill '+branchStatusClass(order.status)+'">'+esc(order.status_label)+'</span></div>';
    }).join(''):'<div class="empty">Chưa có đơn hàng.</div>')+'</section></div>';
  return ph(branchName,'Tổng quan <span class="it">chi nhánh</span>')+summary+
    '<div class="bento" style="margin-top:20px"><section class="plate s6"><div class="row"><h2 class="h3">Kho sắp hết</h2><button class="btn ghost sm" data-act="go" data-k="b-inv">Mở kho</button></div>'+
    (low.length?low.map(function(item){return '<div class="il"><span>'+esc(item.n)+'</span><span class="mono">'+item.q+' / '+item.min+' '+item.u+'</span></div>'}).join(''):'<div class="empty">Kho đủ hàng.</div>')+'</section>'+
    '<section class="plate s6"><div class="row"><h2 class="h3">Món cần kiểm tra</h2><button class="btn ghost sm" data-act="go" data-k="b-menu">Quản lý</button></div>'+
    (offs.length?offs.map(function(d){return '<div class="il"><span>'+esc(d.n)+'</span>'+pill(AV[S.br][d.id]==='off'?'Hết':'Sắp hết',AV[S.br][d.id]==='off'?'bad':'warn')+'</div>'}).join(''):'<div class="empty">Tất cả món đang bán bình thường.</div>')+'</section></div>';
}};

/* ---- branch orders ---- */
V['b-orders']={dj:['/api/branch/orders/','branch/orders.html','GET orders + POST claim/status'],html:branchOrderPage};
INP.bq=function(v){S.bq=v;render()};
ACT.bst=function(d){S.bst=d.s;render()};
ACT.bsel=function(d){S.bsel=d.no;render()};
V['b-orders'].html=branchOrderPage;
ACT.brefresh=function(){loadBranchOrders().then(function(){render()})};
ACT.bclaim=function(d){
  branchAction('/api/branch/orders/'+encodeURIComponent(d.no)+'/claim/',undefined,'Chi nhánh đã nhận đơn.');
};
ACT.bstatus=function(d){
  var labels={
    preparing:'Đã chuyển đơn sang đang chuẩn bị.',
    ready:'Đơn đã sẵn sàng giao.',
    completed:'Đã xác nhận đơn giao hoàn tất.'
  };
  branchAction('/api/branch/orders/'+encodeURIComponent(d.no)+'/status/',{status:d.status},labels[d.status]||'Đã cập nhật trạng thái.');
};

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
V['b-ship']={dj:['/api/branch/orders/','branch/delivery.html','POST assign shipper + update status'],html:function(){
  function orderRows(status,actionLabel,nextStatus){
    var matches=branchOrders.filter(function(order){return order.status===status});
    if(!matches.length)return '<div class="empty">Chưa có đơn.</div>';
    return matches.map(function(order){
      var control;
      if(status==='ready'){
        var options=branchShippers.map(function(shipper){
          return '<option value="'+shipper.id+'">'+esc(shipper.name)+(shipper.phone?' · '+esc(shipper.phone):'')+' · đang giao '+shipper.active_orders+'</option>';
        }).join('');
        control=branchShippers.length?
          '<span class="row" style="flex-wrap:nowrap"><select id="shipper_'+esc(order.code)+'" class="in" style="width:auto;padding:7px 8px"><option value="">Chọn shipper</option>'+options+'</select><button class="btn sm terra" data-act="bassign" data-no="'+esc(order.code)+'">Giao</button></span>':
          '<span class="dim">Chưa có tài khoản shipper đang hoạt động được gán vào chi nhánh.</span>';
      }else{
        control='<button class="btn sm terra" data-act="bstatus" data-no="'+esc(order.code)+'" data-status="'+nextStatus+'">'+actionLabel+'</button>';
      }
      return '<div class="il" style="align-items:center;flex-wrap:wrap"><span><b class="mono">'+esc(order.code)+'</b> · '+esc(order.recipient_name)+
        '<div class="sub dim" style="font-size:12px">'+esc(order.delivery_address)+' · '+esc(order.recipient_phone)+'</div>'+
        '<div class="sub">'+order.items.map(function(item){return esc(item.name)+' × '+item.quantity}).join(', ')+'</div>'+
        (order.shipper_name?'<div class="sub">Shipper: '+esc(order.shipper_name)+(order.shipper_phone?' · '+esc(order.shipper_phone):'')+'</div>':'')+
        '</span>'+control+'</div>';
    }).join('');
  }
  var completed=branchOrders.filter(function(order){return order.status==='completed'});
  var content=branchOrdersError?
    '<div class="empty">'+esc(branchOrdersError)+'<br><br><button class="btn" data-act="brefresh">Thử tải lại</button></div>':
    '<div class="row" style="margin-bottom:18px"><button class="btn ghost" data-act="brefresh">Làm mới</button><span class="dim">Chọn shipper thuộc chi nhánh để bắt đầu giao đơn.</span></div>'+
    '<div class="bento"><section class="plate s12"><div class="row"><h2 class="h3">Chờ phân công shipper</h2><span class="pill warn right">'+branchOrders.filter(function(order){return order.status==='ready'}).length+' đơn</span></div>'+
    orderRows('ready','','')+'</section>'+
    '<section class="plate s12"><div class="row"><h2 class="h3">Đang giao</h2><span class="pill ok right">'+branchOrders.filter(function(order){return order.status==='delivering'}).length+' đơn</span></div>'+
    orderRows('delivering','Xác nhận hoàn tất','completed')+'</section>'+
    '<section class="plate s12"><div class="row"><h2 class="h3">Đã hoàn thành</h2><span class="pill ok right">'+completed.length+' đơn</span></div>'+
    (completed.length?completed.map(function(order){return '<div class="il"><span><b class="mono">'+esc(order.code)+'</b> · '+esc(order.recipient_name)+'<div class="sub dim">'+esc(order.shipper_name||'')+' · '+esc(order.delivery_address)+'</div></span><span class="mono">'+money(order.total)+'</span></div>'}).join(''):'<div class="empty">Chưa có đơn hoàn thành.</div>')+'</section></div>';
  return ph(branchData?esc(branchData.name):'Chi nhánh','Giao <span class="it">hàng</span>')+content;
}};
ACT.bassign=function(d){
  var select=$('#shipper_'+d.no),shipperId=select&&select.value;
  if(!shipperId){toast('Vui lòng chọn shipper trước khi giao đơn.');return}
  branchAction('/api/branch/orders/'+encodeURIComponent(d.no)+'/assign-shipper/',{shipper_id:shipperId},'Đã giao đơn cho shipper.');
};


loadBranchOrders().then(function(){initApp()});
