'use strict';
function bOrd(bid){return orders.filter(function(o){return o.br===bid&&!o.hist})}
function sla(o){return o.st===0?5:(o.st===1?10:Math.max(8,prepOf(o)-4))}
function slaState(o){if(o.st<0||o.st>2)return null;var r=o.ago/sla(o);return r>=1?['Trễ','bad']:(r>=.75?['Sắp trễ','warn']:null)}
function invLow(bid){return INV[bid].filter(function(r){return r.q<r.min*1.25})}
ACT.accept=function(d){var b=BM[d.id];b.accepting=!b.accepting;toast(b.n+(b.accepting?': đã mở nhận đơn':': tạm ngưng nhận đơn, điều phối sẽ bỏ qua chi nhánh này'));render()};
