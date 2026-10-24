(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var cat=function(){return '<svg viewBox="0 0 120 120" aria-hidden="true"><use href="#cat"/></svg>'};
var AREAS=['Phường Thạch Khôi','Phường Hải Tân','Phường Lê Thanh Nghị','Phường Tứ Minh','Phường Nam Đồng'];
var S={tab:document.body.dataset.authTab||'login'};
var HEAD={
 login:['Chào mừng trở lại','Về lại <span class="it">bếp của bạn</span>','Đăng nhập để đặt món, theo dõi đơn và dùng mã giảm giá đã lưu.'],
 register:['Tạo tài khoản mới','Gia nhập <span class="it">Miêu Quán</span>','Một tài khoản dùng cho cả 5 chi nhánh. Đơn đầu tiên được tặng mã giảm 20.000đ.'],
 forgot:['Quên mật khẩu','Lấy lại <span class="it">quyền vào bếp</span>','Nhập email đã đăng ký để tiếp tục.']
};
function fld(id,label,type,o){
  o=o||{};
  var inp='<input id="'+id+'" class="in" type="'+type+'" '+(o.attr||'')+' placeholder="'+esc(o.ph||'')+'">';
  if(type==='password')inp='<div class="pwrap">'+inp+'<button type="button" class="eye" data-act="eye" data-id="'+id+'" aria-label="Hiện hoặc ẩn mật khẩu">Hiện</button></div>';
  return '<div class="fld"><label for="'+id+'">'+label+'</label>'+inp+(o.extra||'')+'</div>';
}
function left(){
  var h=HEAD[S.tab];
  return '<aside class="auth-l"><button class="brand" type="button" aria-label="Về trang chủ Miêu Quán">'+cat()+'<span><span class="wm">MIÊU QUÁN</span><span class="wm-sub">Điều phối bếp thông minh</span></span></button>'+
  '<div class="auth-intro"><div class="cap">'+h[0]+'</div><h1 class="auth-h">'+h[1]+'</h1><p class="auth-intro-copy">'+h[2]+'</p></div>'+
  '<div class="emb"><div class="disc"></div><div class="cat">'+cat()+'</div><svg class="ring" viewBox="0 0 200 200" aria-hidden="true"><defs><path id="rp" d="M100 100m-90 0a90 90 0 1 1 180 0a90 90 0 1 1-180 0"/></defs><text><textPath href="#rp" textLength="556" lengthAdjust="spacing">MIÊU QUÁN · ĐÚNG BẾP · ĐÚNG GIỜ · ĐIỀU PHỐI THÔNG MINH · HẢI PHÒNG ·</textPath></text></svg><div class="stamp">Điều phối<br>tự động</div>'+
  '</div>'+
  '<div class="facts"><div><div class="num">5</div><div class="d">chi nhánh tại Hải Phòng</div></div><div><div class="num">2,4 s</div><div class="d">chốt bếp cho mỗi đơn</div></div><div><div class="num">14</div><div class="d">món cơm, mỳ, bún, nem</div></div></div></aside>';
}
function tabs(){
  if(S.tab==='forgot')return '';
  return '<div class="tabs" role="tablist">'+[['login','Đăng nhập'],['register','Đăng ký']].map(function(t){return '<button type="button" role="tab" class="'+(S.tab===t[0]?'on':'')+'" aria-selected="'+(S.tab===t[0])+'" data-act="tab" data-t="'+t[0]+'">'+t[1]+'</button>'}).join('')+'</div>';
}
function loginForm(){
  var csrf=$('#csrf-token input[name="csrfmiddlewaretoken"]');
  return '<form action="'+esc(document.body.dataset.signinUrl)+'" method="post" novalidate class="col login-form">'+
  '<input type="hidden" name="csrfmiddlewaretoken" value="'+esc(csrf?csrf.value:'')+'">'+
  '<input type="hidden" name="action" value="login">'+
  fld('lid','Tên đăng nhập, email hoặc số điện thoại','text',{attr:'name="username" autocomplete="username"',ph:'khoi.nguyen@example.vn'})+
  fld('lpw','Mật khẩu','password',{attr:'name="password" autocomplete="current-password"',ph:'Nhập mật khẩu'})+
  '<div class="row login-options"><label class="chk"><input id="lrem" type="checkbox" checked><span>Ghi nhớ trong 30 ngày</span></label><button type="button" class="lnk" data-act="tab" data-t="forgot">Quên mật khẩu?</button></div>'+
  '<p class="hint auth-error" id="login-error" role="alert" hidden></p>'+
  '<button class="btn terra blk submit-auth" type="submit">Đăng nhập →</button>'+
  '<div class="or"><span class="cap">hoặc</span></div><div class="row social-buttons"><button type="button" class="btn ghost grow">Google</button><button type="button" class="btn ghost grow">Zalo</button></div></form>';
}
function regForm(){
  var area='<select id="rarea" class="in"><option value="">Chọn phường của bạn</option>'+AREAS.map(function(a,i){return '<option value="'+i+'">'+a+'</option>'}).join('')+'</select>';
  var csrf=$('#csrf-token input[name="csrfmiddlewaretoken"]');
  return '<form action="'+esc(document.body.dataset.signinUrl)+'" method="post" novalidate class="col register-form">'+
  '<input type="hidden" name="csrfmiddlewaretoken" value="'+esc(csrf?csrf.value:'')+'"><input type="hidden" name="action" value="register">'+
  fld('rname','Họ và tên','text',{attr:'name="full_name" autocomplete="name" required',ph:'Nguyễn Minh Khôi'})+
  '<div class="f2">'+fld('rphone','Số điện thoại','tel',{attr:'name="phone" autocomplete="tel" inputmode="numeric" pattern="[0-9]*" required',ph:'0912 345 658'})+fld('rmail','Email','email',{attr:'name="email" autocomplete="email" required',ph:'ban@example.vn'})+'</div>'+
  fld('rpw','Mật khẩu','password',{attr:'name="password" autocomplete="new-password" required',ph:'Tối thiểu 8 ký tự, có chữ và số',extra:'<div class="segs strength-meter" id="strength" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="hint" id="strtxt">Mật khẩu chưa nhập</div>'})+
  fld('rpw2','Nhập lại mật khẩu','password',{attr:'name="password_confirmation" autocomplete="new-password" required',ph:'Nhập lại mật khẩu'})+
  '<div class="fld"><label for="rarea">Khu vực giao hàng chính</label>'+area+'<div id="brhint"></div></div>'+
  '<label class="chk"><input id="rterms" name="terms" type="checkbox" required><span>Tôi đồng ý với <button type="button" class="lnk">điều khoản sử dụng</button> và chính sách bảo mật của Miêu Quán.</span></label>'+
  '<button class="btn terra blk submit-auth" type="submit">Tạo tài khoản →</button></form>';
}
function forgotForm(){
  return '<form novalidate class="col forgot-form"><div class="cap">Đặt lại mật khẩu</div>'+
  fld('fmail','Email đã đăng ký','email',{attr:'autocomplete="email"',ph:'ban@example.vn'})+
  '<button class="btn terra blk submit-auth" type="submit">Gửi liên kết đặt lại</button><button type="button" class="btn ghost blk" data-act="tab" data-t="login">← Quay lại đăng nhập</button><p class="hint">Giao diện minh họa; chưa kết nối chức năng gửi email.</p></form>';
}
function render(){
  var body=tabs()+(S.tab==='login'?loginForm():(S.tab==='register'?regForm():forgotForm()));
  $('#app').innerHTML='<div class="auth">'+left()+'<section class="auth-r"><div class="auth-bar"><button class="tool" type="button" data-act="theme">SÁNG / TỐI</button></div><div class="auth-main">'+body+'</div><p class="hint support-note">Chức năng quên mật khẩu chưa được kết nối.</p></section></div>';
  var error=document.body.dataset.authError;
  if(error){
    var message=document.createElement('p');
    message.className='hint auth-error';
    message.setAttribute('role','alert');
    message.textContent=error;
    var form=$('.auth-main form');
    if(form)form.insertBefore(message,form.querySelector('.submit-auth'));
  }
}
function strength(p){
  var s=0;if(p.length>=8)s++;if(/[a-z]/.test(p)&&/[A-Z]/.test(p))s++;if(/\d/.test(p)&&/[a-zA-Z]/.test(p))s++;if(/[^\w\s]/.test(p)||p.length>=12)s++;
  return p?s:0;
}
document.addEventListener('click',function(e){
  var el=e.target.closest('[data-act]');if(!el)return;var d=el.dataset;
  if(d.act==='tab'){S.tab=d.t;render()}
  else if(d.act==='eye'){var i=$('#'+d.id);i.type=i.type==='password'?'text':'password';el.textContent=i.type==='password'?'Hiện':'Ẩn'}
  else if(d.act==='theme'){var r=document.documentElement,cur=r.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');r.setAttribute('data-theme',cur==='dark'?'light':'dark')}
});
document.addEventListener('input',function(e){
  var t=e.target;
  if(t.id==='rphone')t.value=t.value.replace(/\D/g,'');
  if(t.id==='rpw'){var s=strength(t.value),segs=document.querySelectorAll('#strength i');segs.forEach(function(i,n){i.className=n<s?'f':''});var box=$('#strength');box.className='segs strength-meter'+(s<=1?' bad':(s===2?' warn':''));$('#strtxt').textContent=!t.value?'Mật khẩu chưa nhập':['Quá yếu','Yếu','Trung bình','Khá mạnh','Mạnh'][s]}
  if(t.id==='rarea'){var a=AREAS[+t.value];$('#brhint').innerHTML=t.value===''?'':'<div class="brhint"><div class="num">'+esc(a)+'</div></div>'}
});
render();
})();
