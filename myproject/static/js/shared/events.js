'use strict';

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