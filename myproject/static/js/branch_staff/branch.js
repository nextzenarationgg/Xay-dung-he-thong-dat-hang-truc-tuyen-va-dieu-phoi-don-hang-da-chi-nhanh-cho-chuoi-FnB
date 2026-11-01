'use strict';
PAGE_ROLE='branch';PAGE_HOME='b-dash';
/* ================= BRANCH MODULE ================= */
var branchData=null,branchOrders=[],branchOrdersError='',branchUIReady=false,branchPollInProgress=false,branchPollErrorNotified=false,branchActionPending=false,branchActionVersion=0;
var branchIngredients=[];
var branchHistory=[];
var branchTables=[];
var branchDineInOrders=[];
var branchPurchaseHistory=[]; // Biến lưu lịch sử nhập hàng

S.dineTab = S.dineTab || 'all'; 
S.invPending = {}; // { id: { qty, action, price } }

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

function loadPurchaseHistory(){
  return branchRequest('/api/branch/purchase-history/','GET').then(function(payload){
    branchPurchaseHistory=payload.history;
  }).catch(function(error){
    console.error('Lỗi tải lịch sử nhập hàng:', error);
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
  if (!(S.bst==='all'||S.bst===order.status)) return false;
  if (!(S.bpay==='all'||S.bpay===order.payment_method_label)) return false;
  if (q && fold(order.code+' '+order.recipient_name+' '+order.items.map(function(item){return item.name}).join(' ')).indexOf(q) === -1) return false;

  if (!S.delFilterType || S.delFilterType === 'all') return true;
  
  var d = new Date(order.created_at);
  var dStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  var now = new Date();
  var localToday = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');

  if (S.delFilterType === 'today') return dStr === localToday;
  if (S.delFilterType === 'day') return dStr === S.delDateFrom;
  if (S.delFilterType === 'range') return dStr >= S.delDateFrom && dStr <= S.delDateTo;
  if (S.delFilterType === 'month') {
      var mStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      return mStr === S.delMonth;
  }
  if (S.delFilterType === 'year') return d.getFullYear().toString() === S.delYear;
  return true;
}

function branchOrderPage(){
  if(branchOrdersError)return ph('Hộp đơn chi nhánh','Đơn hàng <span class="it">chưa tải được</span>')+
    '<div class="empty">'+esc(branchOrdersError)+'<br><br><button class="btn terra" data-act="brefresh">Thử tải lại</button></div>';
    
  if (S.bq === undefined) S.bq = '';
  if (S.delFilterType === undefined) S.delFilterType = 'all';
  var now = new Date();
  var localToday = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  if (S.delDateFrom === undefined) S.delDateFrom = localToday;
  if (S.delDateTo === undefined) S.delDateTo = localToday;
  if (S.delMonth === undefined) S.delMonth = localToday.slice(0, 7);
  if (S.delYear === undefined) S.delYear = now.getFullYear().toString();

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

  var filterHtml = `
    <div class="row" style="margin-bottom:20px; gap:12px; flex-wrap:wrap; align-items:flex-end; background:var(--paper-2); padding:16px; border-radius:8px; border:1px solid var(--edge);">
      <div class="fld grow" style="max-width:240px; margin-bottom:0;">
        <label for="bq">Tìm kiếm</label>
        <input id="bq" class="in" type="text" placeholder="Mã đơn, khách, món..." value="${esc(S.bq)}" data-in="bq">
      </div>
      <div class="fld" style="margin-bottom:0;">
        <label>Bộ lọc thời gian</label>
        <select class="in" data-in="deltype">
          <option value="all" ${S.delFilterType==='all'?'selected':''}>Tất cả thời gian</option>
          <option value="today" ${S.delFilterType==='today'?'selected':''}>Hôm nay</option>
          <option value="day" ${S.delFilterType==='day'?'selected':''}>Theo ngày</option>
          <option value="range" ${S.delFilterType==='range'?'selected':''}>Khoảng thời gian</option>
          <option value="month" ${S.delFilterType==='month'?'selected':''}>Theo tháng</option>
          <option value="year" ${S.delFilterType==='year'?'selected':''}>Theo năm</option>
        </select>
      </div>
      ${S.delFilterType==='day'?`
      <div class="fld" style="margin-bottom:0;">
        <label>Chọn ngày</label>
        <input type="date" class="in" data-in="delday" value="${S.delDateFrom}">
      </div>`:''}
      ${S.delFilterType==='range'?`
      <div class="fld" style="margin-bottom:0;">
        <label>Từ ngày</label>
        <input type="date" class="in" data-in="delfrom" value="${S.delDateFrom}">
      </div>
      <div class="fld" style="margin-bottom:0;">
        <label>Đến ngày</label>
        <input type="date" class="in" data-in="delto" value="${S.delDateTo}">
      </div>`:''}
      ${S.delFilterType==='month'?`
      <div class="fld" style="margin-bottom:0;">
        <label>Chọn tháng</label>
        <input type="month" class="in" data-in="delmonth" value="${S.delMonth}">
      </div>`:''}
      ${S.delFilterType==='year'?`
      <div class="fld" style="margin-bottom:0;">
        <label>Chọn năm</label>
        <input type="number" class="in" data-in="delyear" value="${S.delYear}" min="2000" max="2100">
      </div>`:''}
      <div style="flex:1; text-align:right; min-width:100px;">
        <button class="btn ghost" data-act="cleardel">Xóa lọc</button>
      </div>
    </div>
  `;

  return ph((branchData?esc(branchData.name)+' · ':'')+filtered.length+' đơn','Hộp <span class="it">đơn hàng</span>')+
    '<div class="row" style="margin-bottom:16px">'+chips+'</div>'+
    filterHtml +
    '<div class="split"><section class="plate tight"><div class="tw"><table class="tbl"><thead><tr><th>Mã đơn</th><th>Thời gian</th><th>Khách</th><th>Món</th><th class="tr">Tổng</th><th>Trạng thái</th></tr></thead><tbody>'+list+'</tbody></table></div></section>'+detail+'</div>';
}

function branchAction(url,data,successMessage){
  branchActionPending=true;
  branchActionVersion++;
  branchRequest(url,'POST',data).then(function(){
    toast(successMessage);
    return Promise.all([loadBranchOrders(), loadBranchIngredients(), loadBranchHistory(), loadDineInOrders(), loadPurchaseHistory()]);
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
    // Bỏ qua việc auto-render bảng kho nếu đang có thay đổi chưa lưu
    if(previousIngredients!==currentIngredients && ['b-dash','b-inv'].indexOf(S.key)>-1){
        if(S.key === 'b-inv' && Object.keys(S.invPending).length > 0) {
            // Có thay đổi chưa lưu, không tự động render lại
        } else {
            needRender = true;
        }
    }
    if(previousDineIn!==currentDineIn && ['b-dine-in','b-dash','b-tables','b-orders','b-ship','b-menu','b-inv','b-history','b-purchase-history'].indexOf(S.key)>-1){
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
  var b=BM[S.br],
      nw=branchOrders.filter(function(order){return order.status==='pending'||order.status==='confirmed'}).length,
      rd=branchOrders.filter(function(order){return order.status==='ready'}).length,
      nd=branchDineInOrders.filter(function(o){return o.status==='pending'}).length;
      
  var branchLabel=app.getAttribute('data-branch-name');
  return '<aside class="side"><div class="sh"><div class="cap">Bảng điều khiển chi nhánh</div>'+(branchLabel?'<div class="branch-name">MIÊU QUÁN '+esc(branchLabel.toLocaleUpperCase('vi-VN'))+'</div>':'<select id="brsel" data-in="brsel" aria-label="Chọn chi nhánh">'+branchOpt(S.br)+'</select>')+'</div>'+
  sideNav([
    ['b-dash','Tổng quan','grid'],
    ['b-orders','Đơn giao hàng','box',nw||''],
    ['b-dine-in','Đơn tại bàn','list',nd||''],
    ['b-history','Lịch sử đơn','list'],
    ['b-tables','Quản lý bàn','store'],
    ['b-menu','Thực đơn','dish'],
    ['b-inv','Kho hàng','truck'],
    ['b-purchase-history','Lịch sử nhập hàng','box'], // <--- Thêm tab mới
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
INP.deltype = function(v) { S.delFilterType = v; render(); };
INP.delday = function(v) { S.delDateFrom = v; render(); };
INP.delfrom = function(v) { S.delDateFrom = v; render(); };
INP.delto = function(v) { S.delDateTo = v; render(); };
INP.delmonth = function(v) { S.delMonth = v; render(); };
INP.delyear = function(v) { S.delYear = v; render(); };
ACT.cleardel = function() {
    S.bq = '';
    S.delFilterType = 'all';
    render();
};
ACT.bst=function(d){S.bst=d.s;render()};
ACT.bsel=function(d){S.bsel=d.no;render()};
V['b-orders'].html=branchOrderPage;
ACT.brefresh=function(){Promise.all([loadBranchOrders(),loadBranchIngredients(),loadBranchHistory(),loadDineInOrders(),loadBranchTables(),loadPurchaseHistory()]).then(function(){render()})};
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
  if (S.histQ === undefined) S.histQ = '';
  if (S.histFilterType === undefined) S.histFilterType = 'all';
  
  var now = new Date();
  var localToday = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  if (S.histDateFrom === undefined) S.histDateFrom = localToday;
  if (S.histDateTo === undefined) S.histDateTo = localToday;
  if (S.histMonth === undefined) S.histMonth = localToday.slice(0, 7);
  if (S.histYear === undefined) S.histYear = now.getFullYear().toString();

  var filteredHistory = branchHistory.filter(function(order) {
    if (S.histQ && order.code.toLowerCase().indexOf(S.histQ.toLowerCase()) === -1) return false;
    if (S.histFilterType === 'all') return true;

    var d = new Date(order.created_at);
    var dStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    
    if (S.histFilterType === 'today') return dStr === localToday;
    if (S.histFilterType === 'day') return dStr === S.histDateFrom;
    if (S.histFilterType === 'range') return dStr >= S.histDateFrom && dStr <= S.histDateTo;
    if (S.histFilterType === 'month') {
        var mStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        return mStr === S.histMonth;
    }
    if (S.histFilterType === 'year') return d.getFullYear().toString() === S.histYear;
    return true;
  });

  var filterHtml = `
    <div class="row" style="margin-bottom:20px; gap:12px; flex-wrap:wrap; align-items:flex-end; background:var(--paper-2); padding:16px; border-radius:8px; border:1px solid var(--edge);">
      <div class="fld grow" style="max-width:240px; margin-bottom:0;">
        <label for="hq">Tìm mã đơn</label>
        <input id="hq" class="in" type="text" placeholder="Nhập mã đơn..." value="${esc(S.histQ)}" data-in="histq">
      </div>
      <div class="fld" style="margin-bottom:0;">
        <label>Bộ lọc thời gian</label>
        <select class="in" data-in="histtype">
          <option value="all" ${S.histFilterType==='all'?'selected':''}>Tất cả thời gian</option>
          <option value="today" ${S.histFilterType==='today'?'selected':''}>Hôm nay</option>
          <option value="day" ${S.histFilterType==='day'?'selected':''}>Theo ngày</option>
          <option value="range" ${S.histFilterType==='range'?'selected':''}>Khoảng thời gian</option>
          <option value="month" ${S.histFilterType==='month'?'selected':''}>Theo tháng</option>
          <option value="year" ${S.histFilterType==='year'?'selected':''}>Theo năm</option>
        </select>
      </div>
      ${S.histFilterType==='day'?`
      <div class="fld" style="margin-bottom:0;">
        <label>Chọn ngày</label>
        <input type="date" class="in" data-in="histday" value="${S.histDateFrom}">
      </div>`:''}
      ${S.histFilterType==='range'?`
      <div class="fld" style="margin-bottom:0;">
        <label>Từ ngày</label>
        <input type="date" class="in" data-in="histfrom" value="${S.histDateFrom}">
      </div>
      <div class="fld" style="margin-bottom:0;">
        <label>Đến ngày</label>
        <input type="date" class="in" data-in="histto" value="${S.histDateTo}">
      </div>`:''}
      ${S.histFilterType==='month'?`
      <div class="fld" style="margin-bottom:0;">
        <label>Chọn tháng</label>
        <input type="month" class="in" data-in="histmonth" value="${S.histMonth}">
      </div>`:''}
      ${S.histFilterType==='year'?`
      <div class="fld" style="margin-bottom:0;">
        <label>Chọn năm</label>
        <input type="number" class="in" data-in="histyear" value="${S.histYear}" min="2000" max="2100">
      </div>`:''}
      <div style="flex:1; text-align:right; min-width:100px;">
        <button class="btn ghost" data-act="clearhist">Xóa bộ lọc</button>
      </div>
    </div>
  `;

  var list = filteredHistory.map(function(order){
    var itemsHtml = order.items.map(function(item){
      var ingHtml = item.ingredients.map(function(i){
        return '<span class="pill warn" style="margin:2px">- '+i.quantity+' '+i.unit+' '+i.name+'</span>';
      }).join('');
      return '<div style="margin-bottom:8px"><b>'+item.quantity+' × '+esc(item.name)+'</b><div style="margin-top:4px">'+(ingHtml||'<span class="dim" style="font-size:12px">Chưa có định lượng nguyên liệu</span>')+'</div></div>';
    }).join('');
    
    var totalHtml = order.total_ingredients.map(function(i){
      return '<span class="pill bad" style="margin:2px;font-weight:bold">- '+i.total+' '+i.unit+' '+i.name+'</span>';
    }).join('');

    var typePill = order.type === 'Tại bàn' ? pill('Tại bàn', 'terra') : pill('Giao hàng', 'ok');
    var profit = order.revenue - order.total_cost;
    var profitHtml = profit >= 0 ? '<span style="color:#27ae60">+'+money(profit)+'</span>' : '<span style="color:#c0392b">'+money(profit)+'</span>';

    return '<div class="plate" style="margin-bottom:16px">'+
      '<div class="row" style="border-bottom:1px solid var(--edge);padding-bottom:8px;margin-bottom:12px">'+
        '<div class="grow"><b class="num">'+esc(order.code)+'</b> '+typePill+' <span class="pill">'+esc(order.status)+'</span></div>'+
        '<div class="mono dim" style="font-size:12px">'+esc(new Date(order.created_at).toLocaleString('vi-VN'))+'</div>'+
      '</div>'+
      '<div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:16px; margin-bottom:12px; background:var(--paper-2); padding:12px; border-radius:8px;">'+
        '<div><div class="cap" style="margin-bottom:4px">Chi phí NVL</div><b class="mono" style="font-size:16px; color:#c0392b">'+money(order.total_cost)+'</b></div>'+
        '<div><div class="cap" style="margin-bottom:4px">Doanh thu (Tiền đơn)</div><b class="mono" style="font-size:16px; color:#27ae60">'+money(order.revenue)+'</b></div>'+
        '<div><div class="cap" style="margin-bottom:4px">Lợi nhuận ước tính</div><b class="mono" style="font-size:16px">'+profitHtml+'</b></div>'+
      '</div>'+
      '<div class="two" style="gap:20px">'+
        '<div><div class="cap" style="margin-bottom:8px">Món ăn & Định lượng</div>'+itemsHtml+'</div>'+
        '<div><div class="cap" style="margin-bottom:8px;color:var(--terra)">Tổng nguyên liệu đã trừ</div>'+ (totalHtml||'<span class="dim">Không có</span>') +'</div>'+
      '</div>'+
    '</div>';
  }).join('');

  return ph('Lịch sử đơn · '+filteredHistory.length+' đơn','Tổng kết <span class="it">nguyên liệu</span>')+
    filterHtml +
    '<div class="col" style="gap:16px;">'+(list||'<div class="empty">Không tìm thấy đơn hàng nào phù hợp với bộ lọc.</div>')+'</div>';
}};

INP.histq = function(v) { S.histQ = v; render(); };
INP.histtype = function(v) { S.histFilterType = v; render(); };
INP.histday = function(v) { S.histDateFrom = v; render(); };
INP.histfrom = function(v) { S.histDateFrom = v; render(); };
INP.histto = function(v) { S.histDateTo = v; render(); };
INP.histmonth = function(v) { S.histMonth = v; render(); };
INP.histyear = function(v) { S.histYear = v; render(); };

ACT.clearhist = function() {
    S.histQ = '';
    S.histFilterType = 'all';
    render();
};

/* ---- branch purchase history ---- */
V['b-purchase-history']={dj:['/api/branch/purchase-history/','branch/purchase_history.html','Lịch sử nhập hàng'],html:function(){
  if (S.purQ === undefined) S.purQ = '';
  if (S.purFilterType === undefined) S.purFilterType = 'all';
  
  var now = new Date();
  var localToday = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  if (S.purDateFrom === undefined) S.purDateFrom = localToday;
  if (S.purDateTo === undefined) S.purDateTo = localToday;
  if (S.purMonth === undefined) S.purMonth = localToday.slice(0, 7);
  if (S.purYear === undefined) S.purYear = now.getFullYear().toString();

  var filteredLogs = branchPurchaseHistory.filter(function(log) {
    if (S.purQ && log.code.toLowerCase().indexOf(S.purQ.toLowerCase()) === -1) return false;
    if (S.purFilterType === 'all') return true;

    var d = new Date(log.created_at);
    var dStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    
    if (S.purFilterType === 'today') return dStr === localToday;
    if (S.purFilterType === 'day') return dStr === S.purDateFrom;
    if (S.purFilterType === 'range') return dStr >= S.purDateFrom && dStr <= S.purDateTo;
    if (S.purFilterType === 'month') {
        var mStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        return mStr === S.purMonth;
    }
    if (S.purFilterType === 'year') return d.getFullYear().toString() === S.purYear;
    return true;
  });

  var filterHtml = `
    <div class="row" style="margin-bottom:20px; gap:12px; flex-wrap:wrap; align-items:flex-end; background:var(--paper-2); padding:16px; border-radius:8px; border:1px solid var(--edge);">
      <div class="fld grow" style="max-width:240px; margin-bottom:0;">
        <label for="puq">Tìm mã phiếu nhập</label>
        <input id="puq" class="in" type="text" placeholder="Nhập mã NH..." value="${esc(S.purQ)}" data-in="purq">
      </div>
      <div class="fld" style="margin-bottom:0;">
        <label>Bộ lọc thời gian</label>
        <select class="in" data-in="purtype">
          <option value="all" ${S.purFilterType==='all'?'selected':''}>Tất cả thời gian</option>
          <option value="today" ${S.purFilterType==='today'?'selected':''}>Hôm nay</option>
          <option value="day" ${S.purFilterType==='day'?'selected':''}>Theo ngày</option>
          <option value="range" ${S.purFilterType==='range'?'selected':''}>Khoảng thời gian</option>
          <option value="month" ${S.purFilterType==='month'?'selected':''}>Theo tháng</option>
          <option value="year" ${S.purFilterType==='year'?'selected':''}>Theo năm</option>
        </select>
      </div>
      ${S.purFilterType==='day'?`
      <div class="fld" style="margin-bottom:0;">
        <label>Chọn ngày</label>
        <input type="date" class="in" data-in="purday" value="${S.purDateFrom}">
      </div>`:''}
      ${S.purFilterType==='range'?`
      <div class="fld" style="margin-bottom:0;">
        <label>Từ ngày</label>
        <input type="date" class="in" data-in="purfrom" value="${S.purDateFrom}">
      </div>
      <div class="fld" style="margin-bottom:0;">
        <label>Đến ngày</label>
        <input type="date" class="in" data-in="purto" value="${S.purDateTo}">
      </div>`:''}
      ${S.purFilterType==='month'?`
      <div class="fld" style="margin-bottom:0;">
        <label>Chọn tháng</label>
        <input type="month" class="in" data-in="purmonth" value="${S.purMonth}">
      </div>`:''}
      ${S.purFilterType==='year'?`
      <div class="fld" style="margin-bottom:0;">
        <label>Chọn năm</label>
        <input type="number" class="in" data-in="puryear" value="${S.purYear}" min="2000" max="2100">
      </div>`:''}
      <div style="flex:1; text-align:right; min-width:100px;">
        <button class="btn ghost" data-act="clearpur">Xóa lọc</button>
      </div>
    </div>
  `;

  var list = filteredLogs.map(function(log){
    var itemsHtml = log.details.map(function(item){
      var actionStr = item.action === 'add' ? '<span style="color:green">Nhập</span>' : '<span style="color:red">Xuất</span>';
      var priceDiff = item.old_price !== item.new_price ? '<span style="font-size:12px;color:#888">Giá: '+money(item.old_price)+' → '+money(item.new_price)+'</span>' : '';
      return '<div style="margin-bottom:8px"><b>'+actionStr+' '+item.qty_changed+' '+item.unit+' '+esc(item.name)+'</b><div style="margin-top:4px">'+priceDiff+'</div></div>';
    }).join('');

    return '<div class="plate" style="margin-bottom:16px">'+
      '<div class="row" style="border-bottom:1px solid var(--edge);padding-bottom:8px;margin-bottom:12px">'+
        '<div class="grow"><b class="num">'+esc(log.code)+'</b> <span class="pill ok">Phiếu nhập</span></div>'+
        '<div class="mono dim" style="font-size:12px">'+esc(new Date(log.created_at).toLocaleString('vi-VN'))+'</div>'+
      '</div>'+
      '<div class="two" style="gap:20px">'+
        '<div><div class="cap" style="margin-bottom:8px">Chi tiết hàng hóa</div>'+itemsHtml+'</div>'+
        '<div style="text-align:right;">'+
            '<div class="cap" style="margin-bottom:8px">Tổng chi phí nhập</div>'+
            '<b class="num" style="font-size:24px;color:var(--terra)">'+money(log.total_amount)+'</b>'+
            (log.note?'<div class="dim" style="margin-top:8px;font-size:13px">Ghi chú: '+esc(log.note)+'</div>':'')+
        '</div>'+
      '</div>'+
    '</div>';
  }).join('');

  return ph('Lịch sử nhập hàng · '+filteredLogs.length+' phiếu','Quản lý <span class="it">nhập kho</span>')+
    filterHtml +
    '<div class="col" style="gap:16px;">'+(list||'<div class="empty">Chưa có lịch sử nhập hàng phù hợp với bộ lọc.</div>')+'</div>';
}};

INP.purq = function(v) { S.purQ = v; render(); };
INP.purtype = function(v) { S.purFilterType = v; render(); };
INP.purday = function(v) { S.purDateFrom = v; render(); };
INP.purfrom = function(v) { S.purDateFrom = v; render(); };
INP.purto = function(v) { S.purDateTo = v; render(); };
INP.purmonth = function(v) { S.purMonth = v; render(); };
INP.puryear = function(v) { S.purYear = v; render(); };

ACT.clearpur = function() {
    S.purQ = '';
    S.purFilterType = 'all';
    render();
};

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
  var l = all.filter(function(r){ return !q || fold(r.name).indexOf(q)>-1; });
  var hasPending = Object.keys(S.invPending).length > 0;
  
  var actionBtns = '';
  if (hasPending) {
      actionBtns = '<div class="row" style="gap:8px;">'+
          '<button class="btn ghost" data-act="cancelinv">Hủy</button>'+
          '<button class="btn terra" data-act="saveinv">SAVE</button>'+
      '</div>';
  } else {
      actionBtns = '<button class="btn terra" disabled style="opacity:0.5;cursor:not-allowed">SAVE</button>';
  }
  
  return ph('CHI NHÁNH '+esc((branchData?branchData.name:'Chi nhánh').toLocaleUpperCase('vi-VN'))+' · '+all.length+' nguyên liệu','Kho <span class="it">hàng</span>', actionBtns)+
  '<div class="row" style="margin-bottom:18px;justify-content:space-between"><div class="fld grow" style="max-width:340px"><label for="iq">Tìm nguyên liệu</label><input id="iq" class="in" type="search" data-in="binvq" value="'+esc(S.binvQ||'')+'" placeholder="Gạo, xá xíu, mỳ…"></div></div>'+
  
  '<section class="plate tight"><div class="tw"><table class="tbl"><thead><tr><th>Nguyên liệu</th><th style="text-align:center;">Tồn kho</th><th style="text-align:center;">Đơn vị</th><th style="text-align:center;">Đơn giá</th><th style="text-align:center;">Thao tác</th><th style="text-align:center;">Số lượng</th></tr></thead><tbody>'+
  (l.length ? l.map(function(r){
    var isPending = S.invPending[r.id] !== undefined;
    var action = isPending ? S.invPending[r.id].action : null;
    var qty = isPending ? S.invPending[r.id].qty : 1;
    var price = isPending ? S.invPending[r.id].price : r.unit_price;
    
    var btnPlusClass = action === 'add' ? 'terra' : 'ghost';
    var btnMinusClass = action === 'sub' ? 'terra' : 'ghost';
    
    return '<tr '+(isPending?'style="background-color:var(--paper-2);"':'')+'>'+
      '<td class="nm">'+esc(r.name)+'</td>'+
      '<td class="mono dim" style="text-align:center;"><b>'+r.quantity+'</b></td>'+
      '<td style="text-align:center;">'+esc(r.unit)+'</td>'+
      '<td style="text-align:center;">'+
        (isPending ? '<input type="number" class="in" style="width:100px;text-align:center;padding:6px;" data-in="invprice" data-id="'+r.id+'" value="'+price+'" min="0">' : '<span class="mono">'+money(price)+'</span>') +
      '</td>'+
      '<td style="text-align:center;">'+
        '<div class="acts" style="justify-content:center;">'+
          '<button class="btn sm '+btnMinusClass+'" data-act="invadj" data-id="'+r.id+'" data-v="sub">-</button>'+
          '<button class="btn sm '+btnPlusClass+'" data-act="invadj" data-id="'+r.id+'" data-v="add">+</button>'+
        '</div>'+
      '</td>'+
      '<td style="text-align:center;">'+
        (isPending ? '<input type="number" class="in" style="width:80px;text-align:center;padding:6px;" data-in="invqty" data-id="'+r.id+'" value="'+qty+'" min="1">' : '') +
      '</td>'+
    '</tr>';
  }).join('') : '<tr><td colspan="6"><div class="empty">Không có nguyên liệu nào.</div></td></tr>')+
  '</tbody></table></div></section>';
}};
INP.binvq=function(v){S.binvQ=v;render()};

INP.invqty = function(v, el) {
    var id = el.dataset.id;
    var val = parseInt(v, 10);
    if (isNaN(val) || val <= 0) { val = 1; el.value = 1; }
    if (S.invPending[id]) S.invPending[id].qty = val;
};

INP.invprice = function(v, el) {
    var id = el.dataset.id;
    var val = parseFloat(v);
    if (isNaN(val) || val < 0) { val = 0; el.value = 0; }
    if (S.invPending[id]) S.invPending[id].price = val;
};

ACT.invadj=function(d){
  var id = d.id;
  var item = branchIngredients.filter(function(i){ return i.id == id })[0];
  if(!item) return;

  var isPending = S.invPending[id] !== undefined;
  var currentQty = isPending ? S.invPending[id].qty : 1; 
  var currentPrice = isPending ? S.invPending[id].price : item.unit_price;

  S.invPending[id] = {
      qty: currentQty,
      action: d.v,
      price: currentPrice
  };
  render();
};

ACT.cancelinv = function() {
    window.location.reload();
};

ACT.saveinv = function() {
    if (Object.keys(S.invPending).length === 0) return;
    
    var changesHtml = Object.keys(S.invPending).map(function(id) {
        var item = branchIngredients.filter(function(i){ return i.id == id })[0];
        var oldQty = item.quantity;
        var oldPrice = item.unit_price;
        var qty = S.invPending[id].qty;
        var action = S.invPending[id].action;
        var newPrice = S.invPending[id].price;
        
        var newQty = action === 'add' ? (oldQty + qty) : (oldQty - qty);
        if (newQty < 0) newQty = 0; 
        
        var diffText = action === 'add' ? '<span style="color:green">+'+qty+'</span>' : '<span style="color:red">-'+qty+'</span>';
        var priceHtml = oldPrice !== newPrice ? '<span style="font-size:12px;color:#888;display:block">Đơn giá: '+money(oldPrice)+' → <b style="color:var(--terra)">'+money(newPrice)+'</b></span>' : '';
        
        return '<div class="il" style="border-bottom:1px dashed #eee;padding-bottom:6px;margin-bottom:6px;"><span><b>'+esc(item.name)+'</b> '+priceHtml+'</span><span><span class="dim">'+oldQty+' →</span> <b>'+newQty+'</b> ('+diffText+')</span></div>';
    }).join('');

    var modalHtml = `
      <div id="save-inv-modal" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px; backdrop-filter: blur(2px);">
        <div style="background:var(--paper);color:var(--ink);border-radius:12px;width:100%;max-width:450px;padding:24px;box-shadow:0 8px 30px rgba(0,0,0,0.3);">
          
          <div class="row" style="margin-bottom:16px; border-bottom:1px solid var(--edge); padding-bottom:12px;">
            <h3 class="h3" style="margin:0;">Xác nhận cập nhật kho</h3>
            <button id="close-save-modal" style="background:none;border:none;color:var(--ink);font-size:24px;cursor:pointer;line-height:1;">&times;</button>
          </div>

          <div class="cap" style="margin-bottom:8px">Danh sách thay đổi</div>
          <div style="background:var(--paper-2);padding:12px;border-radius:8px;margin-bottom:16px; max-height:200px; overflow-y:auto; border:1px solid var(--edge);">
             ${changesHtml}
          </div>

          <div class="fld" style="margin-bottom:20px;">
            <label for="inv-note">Mô tả (Lý do nhập/xuất kho)</label>
            <textarea id="inv-note" class="in" rows="3" placeholder="VD: Nhập hàng từ NCC A, kiểm kê định kỳ..."></textarea>
          </div>

          <div class="row" style="justify-content:flex-end; gap:10px;">
            <button class="btn ghost" onclick="document.getElementById('save-inv-modal').remove()">Hủy bỏ</button>
            <button class="btn terra" onclick="confirmSaveInv()">Xác nhận Lưu</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.getElementById('close-save-modal').onclick = function() {
        document.getElementById('save-inv-modal').remove();
    };
};

window.confirmSaveInv = function() {
    var btn = event.target;
    btn.innerText = 'Đang lưu...';
    btn.disabled = true;

    var note = document.getElementById('inv-note').value;
    var itemsData = Object.keys(S.invPending).map(function(id) {
        return {
            id: id,
            action: S.invPending[id].action,
            qty: S.invPending[id].qty,
            price: S.invPending[id].price
        };
    });

    branchRequest('/api/branch/inventory/save/', 'POST', { items: itemsData, note: note })
    .then(function(res) {
        toast('Đã lưu thay đổi kho hàng (Mã: '+res.code+').');
        S.invPending = {}; 
        document.getElementById('save-inv-modal').remove();
        Promise.all([loadBranchIngredients(), loadPurchaseHistory()]).then(function(){ render(); });
    }).catch(function(err) {
        toast('Lỗi lưu kho: ' + err.message);
        btn.innerText = 'Xác nhận Lưu';
        btn.disabled = false;
    });
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
  var counts = { all: branchDineInOrders.length, serving: 0, served: 0, cancelled: 0 };
  branchDineInOrders.forEach(function(o) {
      if (o.status === 'pending' || o.status === 'preparing') counts.serving++;
      if (o.status === 'served') counts.served++;
      if (o.status === 'cancelled') counts.cancelled++;
  });

  var tabs = [
      ['all', 'Tất cả'],
      ['serving', 'Đang phục vụ'],
      ['served', 'Đã phục vụ'],
      ['cancelled', 'Đã hủy']
  ].map(function(tab) {
      return '<button class="chip '+(S.dineTab === tab[0] ? 'on' : '')+'" data-act="dinetab" data-t="'+tab[0]+'">'+tab[1]+'<span class="n">'+counts[tab[0]]+'</span></button>';
  }).join('');

  var filteredOrders = branchDineInOrders.filter(function(o) {
      if (S.dineTab === 'all') return true;
      if (S.dineTab === 'serving') return ['pending', 'preparing'].indexOf(o.status) > -1;
      if (S.dineTab === 'served') return o.status === 'served';
      if (S.dineTab === 'cancelled') return o.status === 'cancelled';
      return true;
  });

  var list = filteredOrders.map(function(order){
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
      '<div class="row" style="border-bottom:1px solid var(--edge);padding-bottom:8px;margin-bottom:12px">'+
        '<div class="grow"><h3 class="h3" style="margin:0">'+esc(order.table_name)+'</h3><div class="mono dim" style="font-size:12px">'+esc(new Date(order.created_at).toLocaleTimeString('vi-VN'))+'</div></div>'+
        '<div class="tr">'+pill(esc(order.status_label), order.status==='pending'?'warn':(order.status==='served'?'ok':'terra'))+'</div>'+
      '</div>'+
      '<div class="col">'+itemsHtml+'</div>'+
      (order.note?'<div class="dim" style="margin-top:8px;font-size:13px;background:var(--paper-2);padding:8px;border-radius:4px">Ghi chú: '+esc(order.note)+'</div>':'')+
      '<div class="tot big" style="margin-top:12px"><span class="cap">Tổng</span><span class="num">'+money(order.total)+'</span></div>'+
      (btnAction?'<div class="row" style="margin-top:12px">'+btnAction+'</div>':'')+
    '</div>';
  }).join('');

  return ph('Đơn tại bàn', 'Phục vụ <span class="it">tại quán</span>')+
    '<div class="row" style="margin-bottom:16px">'+tabs+'</div>'+
    '<div class="row" style="margin-bottom:16px"><button class="btn ghost" data-act="refresh-dine">Làm mới</button></div>'+
    '<div class="grid-3" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;">'+(list||'<div class="empty">Chưa có đơn hàng nào trong mục này.</div>')+'</div>';
}};

ACT.dinetab = function(d) {
    S.dineTab = d.t;
    render();
};

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
    var color = isOccupied ? '#c0392b' : '#27ae60';
    
    var activeOrders = branchDineInOrders.filter(function(o){ return o.table_name === t.name && ['pending','preparing','served'].indexOf(o.status) > -1; });
    var totalAmount = activeOrders.reduce(function(sum, o){ return sum + o.total; }, 0);
    var orderCountText = activeOrders.length > 0 ? '<br><span style="font-size:12px;color:var(--ink-2)">('+activeOrders.length+' đơn - '+money(totalAmount)+')</span>' : '';

    return '<div class="plate" style="text-align:center; border-top: 4px solid '+color+'">'+
      '<h3 class="h3" style="margin-bottom:8px">'+esc(t.name)+'</h3>'+
      '<div style="margin-bottom:12px; font-weight:bold; color:'+color+'">'+esc(t.status_label) + orderCountText + '</div>'+
      '<button class="btn terra blk" data-act="table-dialog" data-id="'+t.id+'">Chi tiết & QR</button>'+
    '</div>';
  }).join('');

  return ph('Quản lý bàn', 'Sơ đồ <span class="it">bàn</span>', '<button class="btn terra" data-act="add-table">+ Thêm bàn mới</button>')+
    '<div class="grid-3" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;">'+(list||'<div class="empty">Chưa có bàn nào.</div>')+'</div>';
}};

ACT['table-dialog'] = function(d) {
    var table = branchTables.filter(function(t){ return t.id == d.id })[0];
    if(!table) return;

    var activeOrders = branchDineInOrders.filter(function(o){ return o.table_name === table.name && ['pending','preparing','served'].indexOf(o.status) > -1; });
    var totalAmount = activeOrders.reduce(function(sum, o){ return sum + o.total; }, 0);
    
    var itemsHtml = '';
    if(activeOrders.length > 0){
        var itemsMap = {};
        activeOrders.forEach(function(o) {
          o.items.forEach(function(item) {
            if (!itemsMap[item.name]) itemsMap[item.name] = { name: item.name, price: item.unit_price, qty: 0 };
            itemsMap[item.name].qty += item.quantity;
          });
        });
        itemsHtml = Object.keys(itemsMap).map(function(key) {
          var i = itemsMap[key];
          return '<div class="il"><span>'+esc(i.name)+' <b class="mono" style="color:var(--ink-2)">× '+i.qty+'</b></span><span class="mono">'+money(i.price * i.qty)+'</span></div>';
        }).join('');
    } else {
        itemsHtml = '<div class="empty" style="padding:20px 0">Bàn này chưa gọi món.</div>';
    }

    var qrUrl = window.location.origin + '/qr-menu/' + table.qr_code + '/';
    var qrImg = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(qrUrl);

    var modalHtml = `
      <div id="table-dialog-modal" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px; backdrop-filter: blur(2px);">
        <div style="background:var(--paper);color:var(--ink);border-radius:12px;width:100%;max-width:400px;padding:24px;box-shadow:0 8px 30px rgba(0,0,0,0.3);">
          
          <div class="row" style="margin-bottom:20px; border-bottom:1px solid var(--edge); padding-bottom:12px;">
            <h3 class="h3" style="margin:0;">Chi tiết ${esc(table.name)}</h3>
            <button id="close-table-modal" style="background:none;border:none;color:var(--ink);font-size:24px;cursor:pointer;line-height:1;">&times;</button>
          </div>

          <div class="row" style="margin-bottom:20px; align-items:flex-start;">
             <div style="flex:1;">
                <div class="cap" style="margin-bottom:8px">Trạng thái: ${pill(table.status_label, table.status === 'empty' ? 'ok' : 'bad')}</div>
                <button class="btn ${table.status === 'empty' ? 'terra' : 'ghost'}" style="width:100%; max-width:150px;" onclick="toggleTableStatus(${table.id}, '${table.status}')">
                    ${table.status === 'empty' ? 'Đón khách' : 'Về Trống'}
                </button>
             </div>
             <div style="text-align:center;">
                <img src="${qrImg}" alt="QR" style="width:100px;height:100px;border-radius:8px;border:1px solid var(--edge); cursor:pointer;" onclick="window.open('${qrImg}')" title="Bấm để xem/phóng to mã QR">
                <div style="font-size:11px;color:var(--ink-2);margin-top:4px;">Quét để gọi món</div>
             </div>
          </div>

          <div class="cap" style="margin-bottom:8px">Món đã gọi</div>
          <div style="background:var(--paper-2);padding:12px;border-radius:8px;margin-bottom:20px; max-height:200px; overflow-y:auto; border:1px solid var(--edge);">
             ${itemsHtml}
             ${activeOrders.length > 0 ? `<div class="tot big" style="margin-top:12px; border-top:1px dashed var(--edge); padding-top:12px;"><span class="cap">Tổng cộng</span><span class="num" style="font-size:20px;color:var(--terra);font-weight:bold;">${money(totalAmount)}</span></div>` : ''}
          </div>

          <button class="btn ghost blk" onclick="document.getElementById('table-dialog-modal').remove()">Đóng</button>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.getElementById('close-table-modal').onclick = function() {
        document.getElementById('table-dialog-modal').remove();
    };
};

window.toggleTableStatus = function(tableId, currentStatus) {
    var newStatus = currentStatus === 'empty' ? 'occupied' : 'empty';
    
    if (newStatus === 'empty') {
        if (!confirm('Bạn có chắc chắn muốn đóng bàn này?\nToàn bộ đơn hàng và món ăn đang có tại bàn sẽ bị HỦY và không thể khôi phục.')) {
            return;
        }
        
        var table = branchTables.filter(function(t){ return t.id == tableId })[0];
        if(!table) return;
        
        var activeOrders = branchDineInOrders.filter(function(o){ 
            return o.table_name === table.name && ['pending','preparing','served'].indexOf(o.status) > -1; 
        });
        
        var promises = activeOrders.map(function(o) {
            return branchRequest('/api/branch/dine-in-orders/'+o.id+'/status/', 'POST', {status: 'cancelled'});
        });
        
        Promise.all(promises).then(function() {
            return branchRequest('/api/branch/tables/' + tableId + '/', 'PATCH', { status: 'empty' });
        }).then(function(){
            toast('Đã đóng bàn và hủy các đơn liên quan.');
            document.getElementById('table-dialog-modal').remove();
            loadDineInOrders().then(function(){ 
                loadBranchTables().then(function(){ 
                    render(); 
                }); 
            });
        }).catch(function(e){ 
            toast('Lỗi: ' + e.message); 
        });
        
    } else {
        branchRequest('/api/branch/tables/' + tableId + '/', 'PATCH', { status: 'occupied' })
        .then(function(){
            toast('Đã đón khách vào bàn.');
            document.getElementById('table-dialog-modal').remove();
            loadBranchTables().then(function(){ render(); });
        }).catch(function(e){ toast(e.message); });
    }
};

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
  loadDineInOrders(),
  loadPurchaseHistory() // Gọi hàm tải lịch sử nhập hàng
]).then(function(){
  initApp();
  branchUIReady=true;
});