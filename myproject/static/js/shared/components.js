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

/* ================= SHELL ================= */
function custNav(){
  var g={dish:'menu',cart:'cart',checkout:'cart',dispatch:'cart',tracking:'orders'}[S.key]||S.key;
  var it=[['home','Trang chủ'],['menu','Thực đơn'],['orders','Đơn hàng của tôi'],['offers','Ưu đãi'],['account','Tài khoản']];
  return '<nav class="cnav" aria-label="Điều hướng khách hàng">'+it.map(function(x){return '<button class="'+(g===x[0]?'on':'')+'" data-act="go" data-k="'+x[0]+'">'+x[1]+'</button>'}).join('')+'<button class="cartb'+(g==='cart'?' on':'')+'" data-act="go" data-k="cart">Giỏ hàng <span class="badge">'+cartCount()+'</span></button></nav>';
}
function topbar(){
  var r=roleOf(S.key),home={customer:'home',branch:'b-dash',admin:'a-ctrl'}[r];
  return '<header class="top"><div class="top-in"><button class="brand" data-act="go" data-k="'+home+'" aria-label="Miêu Quán">'+cat()+'<span><span class="wm">MIÊU QUÁN</span><span class="wm-sub">Điều phối bếp thông minh</span></span></button>'+
  '<div class="seg" role="group" aria-label="Chế độ xem prototype">'+[['customer','Khách hàng'],['branch','Chi nhánh'],['admin','Quản trị']].map(function(x){return '<button class="'+(r===x[0]?'on':'')+'" data-act="role" data-r="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div>'+
  '<button class="tool'+(S.dev?' on':'')+'" data-act="dev" title="Hiện ghi chú triển khai Django">‹/› DJANGO</button><button class="tool" data-act="theme">SÁNG / TỐI</button>'+(r==='customer'?custNav():'')+'</div></header>';
}
function sideNav(items,cur){return '<nav class="snav" aria-label="Điều hướng">'+items.map(function(x){return '<button class="'+(cur===x[0]?'on':'')+'" data-act="go" data-k="'+x[0]+'">'+ic(x[2])+'<span>'+x[1]+'</span>'+(x[3]?'<span class="ct">'+x[3]+'</span>':'')+'</button>'}).join('')+'</nav>'}
function sideBranch(){
  var b=BM[S.br],nw=orders.filter(function(o){return o.br===b.id&&o.st===0}).length,rd=orders.filter(function(o){return o.br===b.id&&o.st===3&&!o.ship}).length;
  return '<aside class="side"><div class="sh"><div class="cap">Bảng điều khiển chi nhánh</div><select id="brsel" data-in="brsel" aria-label="Chọn chi nhánh">'+branchOpt(S.br)+'</select></div>'+
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
  var v=V[S.key];if(!v){S.key='home';v=V.home}
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
  if(k!=='dispatch')stopDisp();
  S.key=k;S.par=par==null?null:par;S.layer=null;
  if(k==='dish'){S.dq=1;S.dnote=''}
  render({top:true});setHash();
}