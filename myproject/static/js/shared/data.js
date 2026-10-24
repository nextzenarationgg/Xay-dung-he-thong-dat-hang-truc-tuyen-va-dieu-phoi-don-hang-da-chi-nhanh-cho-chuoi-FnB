
/* ================= DATA ================= */

var CATS = [
  ['com', 'Cơm thố'],
  ['my', 'Mỳ cay'],
  ['bun', 'Bún & nem'],
  ['bite', 'Ăn vặt'],
  ['drink', 'Đồ uống'],
  ['sweet', 'Tráng miệng']
];

var CATN = {};
CATS.forEach(function(c) {
  CATN[c[0]] = c[1];
});

var D = [
  {
    id: 'd1', n: 'Cơm thố xá xíu', c: 'com',
    p: 59000, k: '#9b2f24', t: 12, pop: 1,
    tag: 'Bán chạy', sub: 'Xá xíu mật ong, trứng ốp la, dưa leo',
    desc: 'Xá xíu ướp ngũ vị, nướng than rồi quét mật ong, xếp trên cơm thố nén nóng. Kèm trứng ốp la lòng đào, dưa leo và nước sốt hành phi.'
  },
  {
    id: 'd2', n: 'Cơm thố sườn nướng mật ong', c: 'com',
    p: 65000, k: '#8a4a22', t: 14, pop: 4,
    tag: '', sub: 'Sườn cốt lết nướng, rau củ xào',
    desc: 'Sườn cốt lết ướp mật ong và sả, nướng vừa chín tới, ăn cùng cơm thố nóng và rau củ xào bơ.'
  },
  {
    id: 'd3', n: 'Nem nướng Nha Trang', c: 'bun',
    p: 79000, k: '#b8651e', t: 15, pop: 2,
    tag: 'Đặc sản', sub: '8 xiên, bánh tráng chiên, rau sống',
    desc: 'Nem nướng thơm mùi sả, cuốn cùng bánh tráng chiên giòn, rau sống, dưa chua và chấm nước lèo đậu phộng đặc trưng Nha Trang.'
  },
  {
    id: 'd4', n: 'Mỳ cay hải sản', c: 'my',
    p: 55000, k: '#c63d1c', t: 10, pop: 3,
    tag: 'Cay', sub: 'Tôm, mực, chả cá, trứng lòng đào',
    desc: 'Sợi mỳ dai trong nước dùng cay Hàn Quốc, thêm tôm, mực, chả cá và trứng lòng đào. Chọn cấp độ cay từ 0 đến 7.'
  },
  {
    id: 'd5', n: 'Mỳ cay bò Mỹ', c: 'my',
    p: 59000, k: '#b83a1d', t: 10, pop: 6,
    tag: 'Cay', sub: 'Bò Mỹ thái lát, kim chi, nấm',
    desc: 'Bò Mỹ thái lát mỏng nhúng tái, kim chi cải thảo và nấm kim châm trong nước dùng cay đậm vị.'
  },
  {
    id: 'd6', n: 'Bún đậu mắm tôm (mẹt vừa)', c: 'bun',
    p: 89000, k: '#d9a431', t: 16, pop: 5,
    tag: 'Đặc sản', sub: 'Đậu rán, chả cốm, dồi, bún lá',
    desc: 'Mẹt vừa cho 2 người gồm đậu phụ rán giòn, chả cốm, dồi sụn, thịt chân giò, bún lá và rau thơm. Mắm tôm pha chanh, quất, ớt.'
  },
  {
    id: 'd7', n: 'Bún chả nem cua bể', c: 'bun',
    p: 58000, k: '#a95a22', t: 13, pop: 9,
    tag: '', sub: 'Chả viên, chả miếng, nem cua bể',
    desc: 'Chả thịt nướng than hoa ăn cùng bún tươi, nem cua bể rán giòn, nước chấm chua ngọt và đu đủ xanh ngâm.'
  },
  {
    id: 'd8', n: 'Gỏi cuốn tôm thịt (4 cuốn)', c: 'bite',
    p: 45000, k: '#e58a8a', t: 8, pop: 8,
    tag: '', sub: 'Tôm, thịt luộc, bún, rau thơm',
    desc: 'Bốn cuốn tôm thịt cuộn bún và rau thơm trong bánh tráng mỏng. Chấm tương đen hoặc mắm nêm.'
  },
  {
    id: 'd9', n: 'Chân gà sả tắc', c: 'bite',
    p: 69000, k: '#a3411f', t: 12, pop: 7,
    tag: 'Ăn vặt', sub: 'Chân gà rút xương, sả, tắc, ớt',
    desc: 'Chân gà rút xương ngâm sả tắc chua cay, giòn sần sật. Nên ăn lạnh.'
  },
  {
    id: 'd10', n: 'Trà đào cam sả', c: 'drink',
    p: 35000, k: '#f0a35e', t: 5, pop: 10,
    tag: '', v: 'tea', sub: 'Đào ngâm, cam vàng, sả đập dập',
    desc: 'Trà đen ủ lạnh, đào ngâm giòn, lát cam vàng và sả đập dập thơm.'
  },
  {
    id: 'd11', n: 'Trà sữa nướng Miêu', c: 'drink',
    p: 39000, k: '#c58a58', t: 6, pop: 11,
    tag: 'Mới', v: 'milk', sub: 'Trà sữa nướng, trân châu đen',
    desc: 'Trà sữa nướng caramel kiểu Miêu Quán, thêm trân châu đen nấu mỗi sáng.'
  },
  {
    id: 'd12', n: 'Cà phê muối', c: 'drink',
    p: 32000, k: '#5e3a21', t: 5, pop: 12,
    tag: '', v: 'coffee', sub: 'Cà phê phin, kem muối béo nhẹ',
    desc: 'Cà phê phin đậm, phủ lớp kem muối béo nhẹ. Uống lúc kem còn mịn.'
  },
  {
    id: 'd13', n: 'Chè khúc bạch hạnh nhân', c: 'sweet',
    p: 38000, k: '#f6efe0', t: 6, pop: 13,
    tag: '', v: 'che', sub: 'Khúc bạch, nhãn, hạnh nhân lát',
    desc: 'Khúc bạch mềm mịn, nhãn ngâm, hạnh nhân lát và nước đường phèn mát.'
  },
  {
    id: 'd14', n: 'Bánh flan caramel', c: 'sweet',
    p: 25000, k: '#e8b04c', t: 4, pop: 14,
    tag: '', v: 'flan', sub: 'Flan trứng sữa, caramel đắng nhẹ',
    desc: 'Flan trứng sữa mịn, caramel đắng nhẹ, dùng lạnh.'
  }
];

D.forEach(function(d) {
  d.global = true;
});

var DM = {};
D.forEach(function(d) {
  DM[d.id] = d;
});

var BR = [
  {
    id: 'CN01', n: 'Ba Đình',
    addr: 'Số 58 Quốc lộ 5, Phường Ba Đình, TP. Hà Nội',
    lat: 20.9122, lng: 106.3715, x: 130, y: 250,
    open: true, accepting: true, radius: 6.5,
    cap: 14, base: 4, prep: 12,
    hours: '08:00 – 22:30',
    mgr: 'Nguyễn Thị Hằng', tel: '0220 3555 101', staff: 11
  },
  {
    id: 'CN02', n: 'Cầu Giấy',
    addr: 'Số 25 Nguyễn Lương Bằng, Phường Cầu Giấy, TP. Hà Nội',
    lat: 20.9389, lng: 106.3302, x: 290, y: 170,
    open: true, accepting: true, radius: 6,
    cap: 12, base: 6, prep: 11,
    hours: '08:00 – 22:00',
    mgr: 'Phạm Văn Đức', tel: '0220 3555 102', staff: 9
  },
  {
    id: 'CN03', n: 'Mễ Trì Hạ',
    addr: 'Số 112 Mễ Trì Hạ, Phường Mễ Trì Hạ, TP. Hà Nội',
    lat: 20.9261, lng: 106.3097, x: 385, y: 235,
    open: true, accepting: true, radius: 6,
    cap: 12, base: 9, prep: 13,
    hours: '09:00 – 22:00',
    mgr: 'Lê Thu Trang', tel: '0220 3555 103', staff: 10
  },
  {
    id: 'CN04', n: 'Long Biên',
    addr: 'Số 14 Nguyễn Thị Duệ, Phường Long Biên, TP. Hà Nội',
    lat: 20.9547, lng: 106.3188, x: 470, y: 120,
    open: true, accepting: true, radius: 7.5,
    cap: 10, base: 4, prep: 14,
    hours: '08:30 – 21:30',
    mgr: 'Đỗ Quang Huy', tel: '0220 3555 104', staff: 7
  },
  {
    id: 'CN05', n: 'Hà Đông',
    addr: 'Số 203 Điện Biên Phủ, Phường Hà Đông, TP. Hà Nội',
    lat: 20.9338, lng: 106.3405, x: 300, y: 335,
    open: true, accepting: true, radius: 7,
    cap: 10, base: 3, prep: 10,
    hours: '08:00 – 22:00',
    mgr: 'Vũ Minh Châu', tel: '0220 3555 105', staff: 6
  }
];

var BM = {};
BR.forEach(function(b) {
  BM[b.id] = b;
});

var ADDR = {
  A1: {
    l: 'Nhà riêng',
    a: 'Số 18, KDC Ba Đình, Phường Ba Đình, TP. Hà Nội',
    pt: [150, 272],
    d: {CN01: 1.2, CN02: 3.4, CN03: 5.1, CN04: 6.8, CN05: 7.9}
  },
  A2: {
    l: 'Văn phòng',
    a: 'Số 25 Nguyễn Lương Bằng, Phường Cầu Giấy, TP. Hà Nội',
    pt: [300, 150],
    d: {CN01: 3.6, CN02: 0.9, CN03: 2.7, CN04: 3.3, CN05: 5.8}
  },
  A3: {
    l: 'Phòng trọ',
    a: 'Số 7, ngõ 120 Điện Biên Phủ, Phường Hà Đông, TP. Hà Nội',
    pt: [318, 352],
    d: {CN01: 7.2, CN02: 4.1, CN03: 3, CN04: 2.8, CN05: 0.8}
  },
  A4: {
    l: 'Nhà bạn',
    a: 'Số 90 Mễ Trì Hạ, Phường Mễ Trì Hạ, TP. Hà Nội',
    pt: [398, 216],
    d: {CN01: 5, CN02: 2.5, CN03: 0.7, CN04: 3.9, CN05: 3.2}
  },
  A5: {
    l: 'Công ty',
    a: 'Số 33 Nguyễn Thị Duệ, Phường Long Biên, TP. Hà Nội',
    pt: [484, 104],
    d: {CN01: 6.6, CN02: 3.9, CN03: 3.7, CN04: 0.9, CN05: 2.6}
  }
};

var ST = [
  'Chờ xác nhận',
  'Đã xác nhận',
  'Đang chuẩn bị',
  'Sẵn sàng giao',
  'Đang giao',
  'Hoàn thành'
];

var STC = ['warn', 'terra', 'terra', 'ok', 'ok', 'mute'];

var VC = {
  MIEU10: {
    t: 'pct', v: 10, max: 30000, min: 99000,
    d: 'Giảm 10%, tối đa 30.000đ cho đơn từ 99.000đ',
    exp: '31.10.2026'
  },
  FREESHIP: {
    t: 'ship', min: 120000,
    d: 'Miễn phí giao hàng cho đơn từ 120.000đ',
    exp: '15.11.2026'
  },
  CHAO20: {
    t: 'amt', v: 20000, min: 60000,
    d: 'Giảm 20.000đ cho đơn đầu tiên từ 60.000đ',
    exp: '31.12.2026'
  },
  CUOITUAN15: {
    t: 'pct', v: 15, max: 45000, min: 150000,
    d: 'Giảm 15% vào thứ Bảy, Chủ nhật, tối đa 45.000đ',
    exp: '30.11.2026'
  }
};

var SHIP = [
  ['S1', 'Nguyễn Văn Hùng', 'CN01', '0912 000 111'],
  ['S2', 'Trần Đức Anh', 'CN01', '0912 000 112'],
  ['S3', 'Lê Thị Mai', 'CN01', '0912 000 113'],
  ['S4', 'Phạm Quang Vinh', 'CN02', '0912 000 114'],
  ['S5', 'Hoàng Thế Sơn', 'CN02', '0912 000 115'],
  ['S6', 'Bùi Văn Tiến', 'CN03', '0912 000 116'],
  ['S7', 'Đinh Công Thành', 'CN03', '0912 000 117'],
  ['S8', 'Ngô Xuân Bắc', 'CN04', '0912 000 118'],
  ['S9', 'Vũ Hải Đăng', 'CN05', '0912 000 119']
].map(function(s) {
  return {id: s[0], n: s[1], br: s[2], tel: s[3]};
});

var SM = {};
SHIP.forEach(function(s) {
  SM[s.id] = s;
});

var AV = {};
BR.forEach(function(b) {
  AV[b.id] = {};
  D.forEach(function(d) {
    AV[b.id][d.id] = 'on';
  });
});

AV.CN03.d3 = 'off';
AV.CN02.d6 = 'off';
AV.CN04.d13 = 'low';
AV.CN05.d9 = 'off';
AV.CN01.d13 = 'low';

var RULES = {
  wd: 40,
  wl: 35,
  wp: 25,
  maxKm: 8,
  maxPrep: 60,
  maxLoad: 90
};

var RULES0 = JSON.parse(JSON.stringify(RULES));
