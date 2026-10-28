'use strict';
PAGE_ROLE='branch';PAGE_HOME='b-dash';
/* ================= BRANCH MODULE ================= */
var branchData=null,branchOrders=[],branchOrdersError='',branchUIReady=false,branchPollInProgress=false,branchPollErrorNotified=false,branchActionPending=false,branchActionVersion=0;
var branchIngredients=[];
var branchHistory=[];
var branchTables=[];
var branchDineInOrders=[];

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

function loadBranchIngredients(){
  return branchRequest('/api/branch/ingredients/','GET').then(function(payload){
    branchIngredients=payload.ingredients;
  }).catch(function(error){
    toast('Không thể tải dữ liệu kho hàng.');
    console.error(error);
  });
}

function loadBranchHistory(){
  return branchRequest('/api/branch/order-history/','GET').then(function(payload){
    branchHistory=payload.history;
  }).catch(function(error){
    console.error('Lỗi tải lịch sử:', error);
  });
}

function loadBranchTables(){
  return branchRequest('/api/branch/tables/','GET').then(function(payload){
    branchTables=payload.tables;
  }).catch(function(error){ console.error(error); });
}

function loadDineInOrders(){
  return branchRequest('/api/branch/dine-in-orders/','GET').then(function(payload){
    branchDineInOrders=payload.orders;
  }).catch(function(error){ console.error(error); });
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
    var canClaim = selected.status === 'pending' 
      && (!selected.branch_name || (branchData && selected.branch_name === branchData.name));
    var nextStatus=selected.status==='confirmed'?'preparing':
      (selected.status==='preparing'?'ready':
        (selected.status==='delivering'?'completed':null));
    detail='<aside class="plate" style="position:sticky;top:96px"><div class="row"><b class="num" style="font-size:22px">'+esc(selected.code)+'</b><span class="pill '+branchStatusClass(selected.status)+'">'+esc(selected.status_label)+'</span></div>'+
      '<div class="mono dim" style="font-size:12px;margin:6px 0 14px">Đặt lúc '+esc(new Date(selected.created_at).toLocaleString('vi-VN'))+' · '+esc(selected.payment_method_label)+'</div>'+
      '<div class="cap">Khách hàng</div><div style="margin:4px 0 12px"><b>'+esc(selected.recipient_name)+'</b> · <span class="mono">'+esc(selected.recipient_phone)+'</span><div class="dim" style="font-size:13px">'+esc(selected.delivery_address)+'</div>'+
      (selected.note?'<div style="margin-top:6px;padding:6px 8px;background:var(--paper-2);font-size:13px">Ghi chú: '+esc(selected.note)+'</div>':'')+
      (selected.branch_name
        ?(selected.status==='pending'
          ?'<div class="dim" style="font-size:13px;margin-top:6px;padding:6px 8px;background:#fff3cd;color:#856404;border-radius:4px">Đơn được điều phối tới chi nhánh này — bấm <b>Xác nhận đơn hàng</b> để bắt đầu xử lý.</div>'
          :'<div class="dim" style="font-size:13px;margin-top:6px">Chi nhánh nhận: '+esc(selected.branch_name)+'</div>')
        :'<div class="dim" style="font-size:13px;margin-top:6px">Đơn đang ở hộp chung, chi nhánh nhận trước sẽ xử lý.</div>')+'</div>'+
      '<div class="cap">Món trong đơn</div>'+selected.items.map(function(item){return '<div class="il"><span>'+esc(item.name)+' <b class="mono">× '+item.quantity+'</b>'+(item.note?'<div class="sub">Ghi chú: '+esc(item.note)+'</div>':'')+'</span><span class="mono">'+money(item.line_total)+'</span></div>'}).join('')+
      '<div class="tot"><span class="dim">Tạm tính</span><span class="mono">'+money(selected.subtotal)+'</span></div><div class="tot"><span class="dim">Phí giao</span><span class="mono">'+money(selected.delivery_fee)+'</span></div><div class="tot"><span class="dim">Giảm giá</span><span class="mono">'+money(selected.discount)+'</span></div><div class="tot big"><span class="cap">Tổng</span><span class="num" style="font-size:24px">'+money(selected.total)+'</span></div>'+
      (canClaim?'<button class="btn terra blk" data-act="bclaim" data-no="'+esc(selected.code)+'">Xác nhận đơn hàng</button>':
        (selected.status==='ready'?'<button class="btn ghost blk" data-act="go" data-k="b-ship">Chọn shipper</button>':
          (nextStatus?'<button class="btn terra blk" data-act="bstatus" data-no="'+esc(selected.code)+'" data-status="'+nextStatus+'">'+(nextStatus==='preparing'?'Bắt đầu chuẩn bị':(nextStatus==='ready'?'Đánh dấu sẵn sàng giao':'Xác nhận giao hoàn tất'))+'</button>':'')))+'</aside>';
  }
  return ph((branchData?esc(branchData.name)+' · ':'')+branchOrders.length+' đơn','Hộp <span class="it">đơn hàng</span>')+
    '<div class="row" style="margin-bottom:16px">'+chips+'</div>'+
    '<div class="row" style="margin-bottom:18px"><div class="fld grow" style="max-width:340px"><label for="bq">Tìm đơn</label><input id="bq" class="in" type="search" data-in="bq" value="'+esc(S.bq)+'" placeholder="Mã đơn, khách, món…"></div><button class="btn ghost" data-act="brefresh">Làm mới</button></div>'+
    '<div class="split"><section class="plate tight"><div class="tw"><table class="tbl"><thead><tr><th>Mã đơn</th><th>Thời gian</th><th>Khách</th><th>Món</th><th class="tr">Tổng</th><th>Trạng thái</th></tr></thead><tbody>'+list+'</tbody></table></div></section>'+detail+'</div>';
}

function branchAction(url,data,successMessage){
  branchActionPending=true;
  branchActionVersion++;
  branchRequest(url,'POST',data).then(function(){
    toast(successMessage);
    return Promise.all([loadBranchOrders(), loadBranchIngredients(), loadBranchHistory(), loadDineInOrders()]);
  }).then(function(){branchActionPending=false;render()}).catch(function(error){
    branchActionPending=false;
    toast(error.message||'Không thể cập nhật đơn hàng.');
    Promise.all([loadBranchOrders(), loadBranchIngredients()]).then(function(){render()});
  });
}

function pollBranchOrders(){
  if(!branchUIReady||document.hidden||branchPollInProgress||branchActionPending)return;
  branchPollInProgress=true;
  var actionVersion=branchActionVersion;
  
  var previousOrders=JSON.stringify([branchData,branchOrders,branchShippers,branchOrdersError]);
  var previousIngredients=JSON.stringify(branchIngredients);
  var previousDineIn=JSON.stringify(branchDineInOrders);
  
  Promise.all([
    branchRequest('/api/branch/orders/','GET'),
    branchRequest('/api/branch/ingredients/','GET'),
    branchRequest('/api/branch/dine-in-orders/','GET')
  ]).then(function(results){
    if(actionVersion!==branchActionVersion)return;
    
    var payloadOrders = results[0];
    branchData=payloadOrders.branch;
    branchOrders=payloadOrders.orders;
    branchShippers=payloadOrders.shippers;
    branchOrdersError='';
    branchPollErrorNotified=false;
    
    var payloadIngredients = results[1];
    branchIngredients = payloadIngredients.ingredients;

    var payloadDineIn = results[2];
    branchDineInOrders = payloadDineIn.orders;
    
    var currentOrders=JSON.stringify([branchData,branchOrders,branchShippers,branchOrdersError]);
    var currentIngredients=JSON.stringify(branchIngredients);
    var currentDineIn=JSON.stringify(branchDineInOrders);
    
    var needRender = false;
    
    if(previousOrders!==currentOrders && ['b-dash','b-orders','b-ship','b-history'].indexOf(S.key)>-1){
        needRender = true;
    }
    if(previousIngredients!==currentIngredients && ['b-dash','b-inv'].indexOf(S.key)>-1){
        needRender = true;
    }
    if(previousDineIn!==currentDineIn && ['b-dine-in','b-dash'].indexOf(S.key)>-1){
        needRender = true;
    }
    
    if(needRender) render();
  }).catch(function(error){
    if(!branchPollErrorNotified){
      toast('Không thể tự cập nhật dữ liệu: '+(error.message||'Lỗi kết nối.'));
      branchPollErrorNotified=true;
      console.error('Lỗi tự cập nhật chi nhánh.',error);
    }
  }).then(function(){branchPollInProgress=false});
}

setInterval(pollBranchOrders,5000);

document.addEventListener('visibilitychange',function(){
  if(!document.hidden)pollBranchOrders();
});

function sideBranch(){
  var b=BM[S.br],nw=branchOrders.filter(function(order){return order.status==='pending'||order.status==='confirmed'}).length,rd=branchOrders.filter(function(order){return order.status==='ready'}).length;
  var branchLabel=app.getAttribute('data-branch-name');
  return '<aside class="side"><div class="sh"><div class="cap">Bảng điều khiển chi nhánh</div>'+(branchLabel?'<div class="branch-name">MIÊU QUÁN '+esc(branchLabel.toLocaleUpperCase('vi-VN'))+'</div>':'<select id="brsel" data-in="brsel" aria-label="Chọn chi nhánh">'+branchOpt(S.br)+'</select>')+'</div>'+
  sideNav([
    ['b-dash','Tổng quan','grid'],
    ['b-orders','Đơn giao hàng','box',nw||''],
    ['b-dine-in','Đơn tại bàn','list'],
    ['b-tables','Quản lý bàn','store'],
    ['b-menu','Thực đơn','dish'],
    ['b-inv','Kho hàng','truck'],
    ['b-ship','Giao hàng','truck',rd||'']
  ],S.key)+
  '<div class="tog"><button class="sw'+(b.accepting?' on':'')+'" data-act="accept" data-id="'+b.id+'" aria-label="Nhận đơn" aria-pressed="'+b.accepting+'"></button><span>'+(b.accepting?'Đang nhận đơn':'Tạm ngưng nhận đơn')+'</span></div></aside>';
}

/* ================= BRANCH DASHBOARD ================= */
V['b-dash']={dj:['/api/branch/orders/','branch/dashboard.html','GET /api/branch/orders/'],html:function(){
  var branchName=branchData?branchData.name:(app.getAttribute('data-branch-name')||'Chi nhánh');
  var count=function(status){return branchOrders.filter(function(order){return order.status===status}).length};
  var readyCount=count('ready');
  
  var low = branchIngredients.filter(function(i){ return i.quantity < i.min_quantity; });
  var offs = []; 

  var summary=branchOrdersError?
    '<div class="plate"><div class="row"><span class="grow">'+esc(branchOrdersError)+'</span><button class="btn" data-act="brefresh">Thử tải lại</button></div></div>':
    '<div class="bento"><div class="plate s3 terra"><div class="kpi"><span class="cap">Chờ tiếp nhận (Ship)</span><span class="num">'+count('pending')+'</span></div></div>'+
    '<div class="plate s3"><div class="kpi"><span class="cap">Sẵn sàng giao</span><span class="num">'+readyCount+'</span>'+(readyCount>0?'<button class="btn sm" data-act="go" data-k="b-ship">Chọn shipper</button>':'')+'</div></div>'+
    '<div class="plate s3"><div class="kpi"><span class="cap">Đơn tại bàn mới</span><span class="num">'+branchDineInOrders.filter(function(o){return o.status==='pending'}).length+'</span>'+(branchDineInOrders.filter(function(o){return o.status==='pending'}).length>0?'<button class="btn sm" data-act="go" data-k="b-dine-in">Xử lý</button>':'')+'</div></div>'+
    '<div class="plate ink s3"><div class="kpi"><span class="cap">Đang giao</span><span class="num">'+count('delivering')+'</span></div></div>'+
    '<section class="plate s12"><div class="row"><h2 class="h3">Đơn giao hàng gần đây</h2><button class="btn ghost sm" data-act="go" data-k="b-orders">Mở hộp đơn</button></div>'+
    (branchOrders.length?branchOrders.slice(0,5).map(function(order){
      return '<div class="il"><span><b class="mono">'+esc(order.code)+'</b> · '+esc(order.recipient_name)+'<div class="sub">'+esc(order.items.map(function(item){return item.name+' × '+item.quantity}).join(', '))+'</div></span><span class="pill '+branchStatusClass(order.status)+'">'+esc(order.status_label)+'</span></div>';
    }).join(''):'<div class="empty">Chưa có đơn hàng.</div>')+'</section></div>';
  return ph(branchName,'Tổng quan <span class="it">chi nhánh</span>')+summary+
    '<div class="bento" style="margin-top:20px"><section class="plate s6"><div class="row"><h2 class="h3">Kho sắp hết</h2><button class="btn ghost sm" data-act="go" data-k="b-inv">Mở kho</button></div>'+
    (low.length?low.map(function(item){return '<div class="il"><span>'+esc(item.name)+'</span><span class="mono">'+item.quantity+' / '+item.min_quantity+' '+item.unit+'</span></div>'}).join(''):'<div class="empty">Kho đủ hàng.</div>')+'</section>'+
    '<section class="plate s6"><div class="row"><h2 class="h3">Món cần kiểm tra</h2><button class="btn ghost sm" data-act="go" data-k="b-menu">Quản lý</button></div>'+
    (offs.length?offs.map(function(d){return '<div class="il"><span>'+esc(d.n)+'</span>'+pill('Hết','bad')+'</div>'}).join(''):'<div class="empty">Tất cả món đang bán bình thường.</div>')+'</section></div>';
}};

/* ---- branch orders ---- */
V['b-orders']={dj:['/api/branch/orders/','branch/orders.html','GET orders + POST claim/status'],html:branchOrderPage};
INP.bq=function(v){S.bq=v;render()};
ACT.bst=function(d){S.bst=d.s;render()};
ACT.bsel=function(d){S.bsel=d.no;render()};
V['b-orders'].html=branchOrderPage;
ACT.brefresh=function(){Promise.all([loadBranchOrders(),loadBranchIngredients(),loadBranchHistory(),loadDineInOrders(),loadBranchTables()]).then(function(){render()})};
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

/* ---- branch history ---- */
V['b-history']={dj:['/api/branch/order-history/','branch/history.html','Lịch sử đơn'],html:function(){
  if(!branchHistory.length) return ph('Lịch sử đơn','Chưa có <span class="it">dữ liệu</span>')+'<div class="empty">Chưa có đơn hàng nào được ghi nhận.</div>';
  
  var list = branchHistory.map(function(order){
    var itemsHtml = order.items.map(function(item){
      var ingHtml = item.ingredients.map(function(i){
        return '<span class="pill warn" style="margin:2px">- '+i.quantity+' '+i.unit+' '+i.name+'</span>';
      }).join('');
      return '<div style="margin-bottom:8px"><b>'+item.quantity+' × '+esc(item.name)+'</b><div style="margin-top:4px">'+(ingHtml||'<span class="dim" style="font-size:12px">Chưa có định lượng nguyên liệu</span>')+'</div></div>';
    }).join('');
    
    var totalHtml = order.total_ingredients.map(function(i){
      return '<span class="pill bad" style="margin:2px;font-weight:bold">- '+i.total+' '+i.unit+' '+i.name+'</span>';
    }).join('');

    return '<div class="plate" style="margin-bottom:16px">'+
      '<div class="row" style="border-bottom:1px solid #eee;padding-bottom:8px;margin-bottom:12px">'+
        '<div class="grow"><b class="num">'+esc(order.code)+'</b> <span class="pill">'+esc(order.status)+'</span></div>'+
        '<div class="mono dim" style="font-size:12px">'+esc(new Date(order.created_at).toLocaleString('vi-VN'))+'</div>'+
      '</div>'+
      '<div class="two" style="gap:20px">'+
        '<div><div class="cap" style="margin-bottom:8px">Món ăn & Định lượng</div>'+itemsHtml+'</div>'+
        '<div style="background:#f9f9f9;padding:12px;border-radius:8px"><div class="cap" style="margin-bottom:8px;color:#c0392b">Tổng nguyên liệu đã trừ</div>'+ (totalHtml||'<span class="dim">Không có</span>') +'</div>'+
      '</div>'+
    '</div>';
  }).join('');

  return ph('Lịch sử đơn · '+branchHistory.length+' đơn','Tổng kết <span class="it">nguyên liệu</span>')+
    '<div class="col" style="gap:16px">'+list+'</div>';
}};

/* ---- branch menu ---- */
V['b-menu']={dj:['/chi-nhanh/thuc-don/','branch/menu_availability.html','BranchMenuView'],html:function(){
  var b=BM[S.br],q=fold(S.bmq.trim()),l=D.filter(function(d){return !q||fold(d.n).indexOf(q)>-1});
  var branchLabel=app.getAttribute('data-branch-name')||b.n;
  var cnt={on:0,low:0,off:0};D.forEach(function(d){cnt[d.global?AV[b.id][d.id]:'off']++});
  var seg=function(d,v,t){var cur=AV[b.id][d.id]===v;return '<button class="'+(cur?'on':'')+'" data-act="avset" data-id="'+d.id+'" data-v="'+v+'"'+(d.global?'':' disabled')+'>'+t+'</button>'};

  return ph('CHI NHÁNH '+esc(branchLabel.toLocaleUpperCase('vi-VN')),'Thực đơn <span class="it">chi nhánh</span>')+
  '<div class="bento" style="margin-bottom:22px"><div class="plate s3"><div class="kpi"><span class="cap">Đang bán</span><span class="num">'+cnt.on+'</span></div></div><div class="plate s3"><div class="kpi"><span class="cap">Sắp hết</span><span class="num">'+cnt.low+'</span></div></div><div class="plate s3"><div class="kpi"><span class="cap">Hết hàng</span><span class="num">'+cnt.off+'</span></div></div>'+
  '<div class="plate sunk s3"><div class="cap">Hai lớp trạng thái</div><p style="font-size:12.5px;margin-top:6px"><b>Toàn chuỗi</b> do quản trị đặt. <b>Tại chi nhánh</b> do bếp quản lý.</p></div></div>'+
  '<div class="fld" style="max-width:340px;margin-bottom:16px"><label for="bmq">Tìm món</label><input id="bmq" class="in" type="search" data-in="bmq" value="'+esc(S.bmq)+'" placeholder="Tên món…"></div>'+
  '<section class="plate tight"><div class="tw"><table class="tbl"><thead><tr><th>Món</th><th>Danh mục</th><th class="tr">Giá chuỗi</th><th>Toàn chuỗi</th><th>Tại chi nhánh</th></tr></thead><tbody>'+
  l.map(function(d){
    var imgHtml = d.image_url ? '<img src="'+d.image_url+'" style="width:44px;height:44px;object-fit:cover;border-radius:4px">' : '<div class="art" style="width:44px;height:44px;aspect-ratio:auto;border:1.5px solid var(--edge);flex:none">'+art(d.id)+'</div>';
    return '<tr>'+
      '<td><div class="row" style="flex-wrap:nowrap">'+imgHtml+'<b class="nm">'+esc(d.n)+'</b></div></td>'+
      '<td>'+CATN[d.c]+'</td>'+
      '<td class="tr mono">'+money(d.p)+'</td>'+
      '<td>'+(d.global?pill('Đang bán','ok'):pill('Quản trị ngưng','bad'))+'</td>'+
      '<td><div class="seg" style="'+(d.global?'':'opacity:.4')+'">'+seg(d,'on','Còn')+seg(d,'low','Sắp hết')+seg(d,'off','Hết')+'</div></td>'+
    '</tr>';
  }).join('')+'</tbody></table></div></section>';
}};
INP.bmq=function(v){S.bmq=v;render()};
ACT.avset=function(d){AV[S.br][d.id]=d.v;toast(DM[d.id].n+' tại '+BM[S.br].n+': '+({on:'còn hàng',low:'sắp hết',off:'hết hàng, điều phối sẽ loại bếp này với món này'})[d.v]);render()};

/* ---- branch inventory ---- */
function stepOf(u){return {kg:1,'hộp':5,'lọ':5,'bìa':10,'quả':12,'cái':50}[u]||1}

V['b-inv']={dj:['/api/branch/ingredients/','branch/inventory.html','InventoryListView'],html:function(){
  var b=BM[S.br], q=fold(S.binvQ ? S.binvQ.trim() : '');
  var all = branchIngredients || [];
  var low = all.filter(function(r){ return r.quantity < r.min_quantity; });
  var l = all.filter(function(r){ return !q || fold(r.name).indexOf(q)>-1; });
  
  return ph('CHI NHÁNH '+esc((branchData?branchData.name:'Chi nhánh').toLocaleUpperCase('vi-VN'))+' · '+all.length+' nguyên liệu','Kho <span class="it">hàng</span>')+
  '<div class="row" style="margin-bottom:18px;justify-content:space-between"><div class="fld grow" style="max-width:340px"><label for="iq">Tìm nguyên liệu</label><input id="iq" class="in" type="search" data-in="binvq" value="'+esc(S.binvQ||'')+'" placeholder="Gạo, xá xíu, mỳ…"></div>'+
  '<button class="btn terra" data-act="addinv">+ Thêm nguyên liệu</button></div>'+
  
  (low.length?'<div class="plate" style="margin-bottom:20px;border-color:var(--bad)"><div class="row"><b style="color:var(--bad)">Cảnh báo tồn kho thấp</b><span class="dim" style="font-size:13.5px">'+low.map(function(r){return esc(r.name)}).join(', ')+'</span></div></div>':'')+
  
  '<section class="plate tight"><div class="tw"><table class="tbl"><thead><tr><th>Nguyên liệu</th><th class="tr">Tồn kho</th><th>Đơn vị</th><th class="tr">Mức tối thiểu</th><th style="min-width:140px">Mức tồn</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>'+
  (l.length ? l.map(function(r){
    var p=clamp(r.quantity/(r.min_quantity*2.5 || 1),0,1);
    var st = r.quantity < r.min_quantity ? ['Thiếu','bad'] : (r.quantity < r.min_quantity*1.25 ? ['Sắp hết','warn'] : ['Đủ','ok']);
    return '<tr><td class="nm">'+esc(r.name)+'</td><td class="tr mono"><b>'+r.quantity+'</b></td><td>'+esc(r.unit)+'</td><td class="tr mono dim">'+r.min_quantity+'</td><td><div class="meter '+st[1]+'"><i style="width:'+Math.round(p*100)+'%"></i></div></td><td>'+pill(st[0],st[1])+'</td><td><div class="acts"><button class="btn sm ghost" data-act="invadj" data-id="'+r.id+'" data-v="-1">-</button><button class="btn sm" data-act="invadj" data-id="'+r.id+'" data-v="1">+</button></div></td></tr>';
  }).join('') : '<tr><td colspan="7"><div class="empty">Không có nguyên liệu nào. Hãy bấm Thêm nguyên liệu.</div></td></tr>')+
  '</tbody></table></div></section>';
}};
INP.binvq=function(v){S.binvQ=v;render()};
ACT.invadj=function(d){
  var item = branchIngredients.filter(function(i){ return i.id == d.id })[0];
  if(!item) return;
  var step = stepOf(item.unit);
  var change = step * (+d.v);
  var newQty = Math.max(0, item.quantity + change);
  
  branchRequest('/api/branch/ingredients/'+item.id+'/', 'PATCH', {quantity: newQty}).then(function(){
    item.quantity = newQty;
    toast(item.name + ': Đã cập nhật tồn kho thành ' + newQty + ' ' + item.unit);
    render();
  }).catch(function(err){ toast(err.message); });
};
ACT.addinv=function(){
  var name = prompt("Nhập tên nguyên liệu (VD: Thịt bò):");
  if(!name) return;
  var unit = prompt("Nhập đơn vị tính (VD: kg, hộp, lọ):");
  if(!unit) return;
  var minQ = prompt("Nhập mức tồn tối thiểu (VD: 5):", "0");
  if(isNaN(minQ)) minQ = 0;
  
  branchRequest('/api/branch/ingredients/', 'POST', {
    name: name.trim(), unit: unit.trim(), min_quantity: parseFloat(minQ)
  }).then(function(newItem){
    branchIngredients.push(newItem);
    toast('Đã thêm nguyên liệu: ' + newItem.name);
    render();
  }).catch(function(err){ toast(err.message); });
};

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

/* ================= QUẢN LÝ ĐƠN TẠI BÀN ================= */
V['b-dine-in']={dj:['/api/branch/dine-in-orders/','branch/dinein.html','Đơn tại bàn'],html:function(){
  var list = branchDineInOrders.map(function(order){
    var itemsHtml = order.items.map(function(i){
      return '<div class="il"><span>'+esc(i.name)+' <b class="mono">× '+i.quantity+'</b>'+(i.note?'<div class="sub">'+esc(i.note)+'</div>':'')+'</span><span class="mono">'+money(i.line_total)+'</span></div>';
    }).join('');
    
    var btnAction = '';
    if (order.status === 'pending') {
      btnAction = '<button class="btn terra sm blk" data-act="dine-status" data-id="'+order.id+'" data-st="preparing">Bếp nhận đơn</button>';
    } else if (order.status === 'preparing') {
      btnAction = '<button class="btn sm blk" data-act="dine-status" data-id="'+order.id+'" data-st="served">Đã phục vụ</button>';
    }

    return '<div class="plate" style="margin-bottom:16px">'+
      '<div class="row" style="border-bottom:1px solid #eee;padding-bottom:8px;margin-bottom:12px">'+
        '<div class="grow"><h3 class="h3" style="margin:0">'+esc(order.table_name)+'</h3><div class="mono dim" style="font-size:12px">'+esc(new Date(order.created_at).toLocaleTimeString('vi-VN'))+'</div></div>'+
        '<div class="tr">'+pill(esc(order.status_label), order.status==='pending'?'warn':(order.status==='served'?'ok':'terra'))+'</div>'+
      '</div>'+
      '<div class="col">'+itemsHtml+'</div>'+
      (order.note?'<div class="dim" style="margin-top:8px;font-size:13px;background:#f9f9f9;padding:8px;border-radius:4px">Ghi chú: '+esc(order.note)+'</div>':'')+
      '<div class="tot big" style="margin-top:12px"><span class="cap">Tổng</span><span class="num">'+money(order.total)+'</span></div>'+
      '<div class="row" style="margin-top:12px">'+btnAction+'</div>'+
    '</div>';
  }).join('');

  return ph('Đơn tại bàn', 'Phục vụ <span class="it">tại quán</span>')+
    '<div class="row" style="margin-bottom:16px"><button class="btn ghost" data-act="refresh-dine">Làm mới</button></div>'+
    '<div class="grid-3" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;">'+(list||'<div class="empty">Chưa có đơn gọi món tại bàn.</div>')+'</div>';
}};
ACT['refresh-dine']=function(){loadDineInOrders().then(function(){render()})};
ACT['dine-status']=function(d){
  branchRequest('/api/branch/dine-in-orders/'+d.id+'/status/','POST',{status:d.st}).then(function(){
    toast('Đã cập nhật trạng thái đơn.');
    loadDineInOrders().then(function(){render()});
  }).catch(function(e){toast(e.message)});
};

/* ================= QUẢN LÝ BÀN ================= */
V['b-tables']={dj:['/api/branch/tables/','branch/tables.html','Quản lý bàn'],html:function(){
  var list = branchTables.map(function(t){
    var isOccupied = t.status === 'occupied';
    var qrUrl = window.location.origin + '/qr-menu/' + t.qr_code + '/';
    var qrImg = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(qrUrl);

    return '<div class="plate" style="text-align:center">'+
      '<h3 class="h3" style="margin-bottom:8px">'+esc(t.name)+'</h3>'+
      '<div style="margin-bottom:8px">'+pill(esc(t.status_label), isOccupied ? 'bad':'ok')+'</div>'+
      '<img src="'+qrImg+'" alt="QR" style="width:120px;height:120px;margin:0 auto;display:block">'+
      '<div class="mono dim" style="font-size:11px;margin:8px 0">'+t.qr_code.substring(0,8)+'...</div>'+
      '<div class="row" style="justify-content:center;gap:8px">'+
        '<a href="'+qrImg+'" download="QR_'+esc(t.name)+'.png" class="btn sm ghost">Tải QR</a>'+
        '<button class="btn sm ghost" style="color:red;border-color:red" data-act="del-table" data-id="'+t.id+'">Xóa</button>'+
      '</div>'+
    '</div>';
  }).join('');

  return ph('Quản lý bàn', 'Sơ đồ <span class="it">bàn</span>')+
    '<div class="row" style="margin-bottom:16px"><button class="btn terra" data-act="add-table">+ Thêm bàn mới</button></div>'+
    '<div class="grid-3" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;">'+(list||'<div class="empty">Chưa có bàn nào.</div>')+'</div>';
}};
ACT['add-table']=function(){
  var name = prompt("Nhập tên bàn (VD: Bàn 01, VIP 1):");
  if(!name) return;
  branchRequest('/api/branch/tables/','POST',{name:name}).then(function(){
    toast('Đã tạo bàn '+name);
    loadBranchTables().then(function(){render()});
  }).catch(function(e){toast(e.message)});
};
ACT['del-table']=function(d){
  if(!confirm("Bạn chắc chắn muốn xóa bàn này? Thao tác không thể hoàn tác.")) return;
  branchRequest('/api/branch/tables/'+d.id+'/','DELETE').then(function(){
    toast('Đã xóa bàn.');
    loadBranchTables().then(function(){render()});
  }).catch(function(e){toast(e.message)});
};

// KHỞI ĐỘNG: Load tất cả dữ liệu cùng lúc
Promise.all([
  loadBranchOrders(), 
  loadBranchIngredients(), 
  loadBranchHistory(),
  loadBranchTables(),
  loadDineInOrders()
]).then(function(){
  initApp();
  branchUIReady=true;
});