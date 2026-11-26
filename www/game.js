'use strict';
(() => {
// ================== KONFIGURACJA ==================
const SAVE = 'xyxword_save_v1';
const HOUR_MS = 4000;            // 1 godzina gry = 4 s
const SEASON_H = 24 * 30;        // sezon = 30 dni gry
const OFFLINE_MAX_H = 24 * 10;   // max 10 dni symulacji offline
const VERSION = window.XYX_VERSION || 'dev';
const REPO = 'matixpompayt/xyxword';
const BRANCH_COST = 25000, PORT_COST = 15000, SHIP_COST = 30000, SHIP_CAP = 300;
const GARAGE_COST = 8000;

const CONT = [
  { id: 'eu', n: 'Europa',      r: { zboze: 1.2, drewno: 1.1, wegiel: 1.2, ruda: .8,  ropa: .4,  krzem: .7,  miedz: .6 } },
  { id: 'na', n: 'Ameryka Pn.', r: { zboze: 1.3, drewno: 1.3, wegiel: 1,   ruda: 1,   ropa: 1.1, krzem: 1,   miedz: .9 } },
  { id: 'sa', n: 'Ameryka Pd.', r: { zboze: 1.1, drewno: 1.5, wegiel: .6,  ruda: 1.3, ropa: 1.2, krzem: .6,  miedz: 1.6 } },
  { id: 'af', n: 'Afryka',      r: { zboze: .7,  drewno: 1,   wegiel: .8,  ruda: 1.2, ropa: 1.5, krzem: .9,  miedz: 1.4 } },
  { id: 'as', n: 'Azja',        r: { zboze: 1,   drewno: .8,  wegiel: 1.5, ruda: 1.1, ropa: 1.4, krzem: 1.6, miedz: 1 } },
  { id: 'au', n: 'Australia',   r: { zboze: .9,  drewno: .7,  wegiel: 1.3, ruda: 1.7, ropa: .6,  krzem: 1.1, miedz: 1.2 } },
];
const CN = Object.fromEntries(CONT.map(c => [c.id, c]));

// Miejscowości: t: 'm' miasto / 'w' wieś, la/lo: współrzędne, port: wybrzeże, ld: ląd (ciężarówki jeżdżą tylko po tym samym lądzie)
const LOCS = [
  ['hamburg', 'eu', 'Hamburg', 'm', 53.55, 9.99, 1], ['berlin', 'eu', 'Berlin', 'm', 52.52, 13.40], ['warszawa', 'eu', 'Warszawa', 'm', 52.23, 21.01],
  ['szczecin', 'eu', 'Szczecin', 'm', 53.43, 14.55, 1], ['debno', 'eu', 'Dębno', 'w', 52.74, 14.70], ['oberstdorf', 'eu', 'Oberstdorf', 'w', 47.41, 10.28],
  ['londyn', 'eu', 'Londyn', 'm', 51.51, -0.13, 1, 'gb'], ['paryz', 'eu', 'Paryż', 'm', 48.86, 2.35], ['rotterdam', 'eu', 'Rotterdam', 'm', 51.92, 4.48, 1],
  ['madryt', 'eu', 'Madryt', 'm', 40.42, -3.70], ['barcelona', 'eu', 'Barcelona', 'm', 41.39, 2.17, 1], ['marsylia', 'eu', 'Marsylia', 'm', 43.30, 5.37, 1],
  ['mediolan', 'eu', 'Mediolan', 'm', 45.46, 9.19], ['rzym', 'eu', 'Rzym', 'm', 41.90, 12.50], ['wieden', 'eu', 'Wiedeń', 'm', 48.21, 16.37],
  ['praga', 'eu', 'Praga', 'm', 50.08, 14.44], ['gdansk', 'eu', 'Gdańsk', 'm', 54.35, 18.65, 1], ['sztokholm', 'eu', 'Sztokholm', 'm', 59.33, 18.07, 1],
  ['oslo', 'eu', 'Oslo', 'm', 59.91, 10.75, 1], ['kijow', 'eu', 'Kijów', 'm', 50.45, 30.52],
  ['kiruna', 'eu', 'Kiruna', 'w', 67.86, 20.23], ['mragowo', 'eu', 'Mrągowo', 'w', 53.86, 21.30], ['montalcino', 'eu', 'Montalcino', 'w', 43.06, 11.49],
  ['ronda', 'eu', 'Ronda', 'w', 36.74, -5.17], ['bogatynia', 'eu', 'Bogatynia', 'w', 50.91, 14.96],
  ['nowyjork', 'na', 'Nowy Jork', 'm', 40.71, -74.0, 1], ['chicago', 'na', 'Chicago', 'm', 41.88, -87.63], ['houston', 'na', 'Houston', 'm', 29.76, -95.37, 1],
  ['losangeles', 'na', 'Los Angeles', 'm', 34.05, -118.24, 1], ['fargo', 'na', 'Fargo', 'w', 46.88, -96.79], ['elko', 'na', 'Elko', 'w', 40.83, -115.76],
  ['rio', 'sa', 'Rio de Janeiro', 'm', -22.91, -43.17, 1], ['saopaulo', 'sa', 'São Paulo', 'm', -23.55, -46.63], ['buenosaires', 'sa', 'Buenos Aires', 'm', -34.60, -58.38, 1],
  ['santiago', 'sa', 'Santiago', 'm', -33.45, -70.67], ['pergamino', 'sa', 'Pergamino', 'w', -33.89, -60.57], ['calama', 'sa', 'Calama', 'w', -22.45, -68.93],
  ['lagos', 'af', 'Lagos', 'm', 6.52, 3.38, 1], ['kair', 'af', 'Kair', 'm', 30.04, 31.24, 1], ['johannesburg', 'af', 'Johannesburg', 'm', -26.20, 28.05],
  ['durban', 'af', 'Durban', 'm', -29.86, 31.02, 1], ['solwezi', 'af', 'Solwezi', 'w', -12.17, 26.39], ['oloibiri', 'af', 'Oloibiri', 'w', 4.67, 6.32],
  ['szanghaj', 'as', 'Szanghaj', 'm', 31.23, 121.47, 1], ['tokio', 'as', 'Tokio', 'm', 35.68, 139.69, 1, 'jp'], ['shenzhen', 'as', 'Shenzhen', 'm', 22.54, 114.06, 1],
  ['mumbaj', 'as', 'Mumbaj', 'm', 19.08, 72.88, 1], ['seul', 'as', 'Seul', 'm', 37.57, 126.98], ['ordos', 'as', 'Ordos', 'w', 39.60, 109.78],
  ['sydney', 'au', 'Sydney', 'm', -33.87, 151.21, 1], ['melbourne', 'au', 'Melbourne', 'm', -37.81, 144.96, 1], ['perth', 'au', 'Perth', 'm', -31.95, 115.86, 1],
  ['brisbane', 'au', 'Brisbane', 'm', -27.47, 153.03, 1], ['kalgoorlie', 'au', 'Kalgoorlie', 'w', -30.75, 121.47], ['dubbo', 'au', 'Dubbo', 'w', -32.25, 148.60],
].map(([id, c, n, t, la, lo, port, ld]) => ({ id, c, n, t, la, lo, port: !!port, ld: ld || c }));
const LOC = Object.fromEntries(LOCS.map(l => [l.id, l]));
const CAP = { eu: 'hamburg', na: 'nowyjork', sa: 'rio', af: 'lagos', as: 'szanghaj', au: 'sydney' };
const TYPE = {
  m: { n: 'Miasto', slots: 6, step: 2, maxX: 5, land: 6000, xCost: 15000, raw: 1, fac: 1.15, sell: 1.05,
       d: 'Droga ziemia, dużo działek. Fabryki +15%, sprzedaż +5%.' },
  w: { n: 'Wieś', slots: 4, step: 1, maxX: 2, land: 1500, xCost: 5000, raw: 1.25, fac: 1, sell: .95,
       d: 'Tania ziemia, mało działek. Farmy i kopalnie +25%, sprzedaż −5%.' },
};
const VEH = {
  van:   { n: 'Dostawczy',     cap: 40,  spd: 90, cost: 9000,  fuel: .35 },
  truck: { n: 'Ciężarówka',    cap: 160, spd: 75, cost: 28000, fuel: .8 },
  tir:   { n: 'TIR z naczepą', cap: 400, spd: 70, cost: 70000, fuel: 1.6 },
};
const POS = { eu: [52, 24], na: [21, 26], sa: [31, 62], af: [53, 54], as: [77, 30], au: [86, 68] };

const G = {
  zboze: { n: 'Zboże', p: 4 }, drewno: { n: 'Drewno', p: 6 }, wegiel: { n: 'Węgiel', p: 8 },
  ruda: { n: 'Ruda żelaza', p: 10 }, ropa: { n: 'Ropa', p: 14 }, krzem: { n: 'Krzem', p: 12 }, miedz: { n: 'Miedź', p: 16 },
  maka: { n: 'Mąka', p: 14 }, deski: { n: 'Deski', p: 18 }, stal: { n: 'Stal', p: 60 },
  plastik: { n: 'Plastik', p: 40 }, chipy: { n: 'Chipy', p: 150 },
  chleb: { n: 'Chleb', p: 38 }, meble: { n: 'Meble', p: 95 }, komputery: { n: 'Komputery', p: 1800 }, auta: { n: 'Samochody', p: 9000 },
};
const GK = Object.keys(G);

// t: 0 surowce, 1 przetwórstwo, 2 produkty końcowe
const B = {
  farma:     { n: 'Farma',              t: 0, cost: 2000,   out: { zboze: 10 } },
  las:       { n: 'Wyrąb lasu',         t: 0, cost: 3000,   out: { drewno: 8 } },
  kop_weg:   { n: 'Kopalnia węgla',     t: 0, cost: 5000,   out: { wegiel: 7 } },
  kop_rud:   { n: 'Kopalnia rudy',      t: 0, cost: 7000,   out: { ruda: 6 } },
  szyb:      { n: 'Szyb naftowy',       t: 0, cost: 12000,  out: { ropa: 5 } },
  kop_krz:   { n: 'Kopalnia krzemu',    t: 0, cost: 10000,  out: { krzem: 5 } },
  kop_mie:   { n: 'Kopalnia miedzi',    t: 0, cost: 12000,  out: { miedz: 4 } },
  mlyn:      { n: 'Młyn',               t: 1, cost: 7000,   in: { zboze: 10 }, out: { maka: 8 } },
  tartak:    { n: 'Tartak',             t: 1, cost: 8000,   in: { drewno: 8 }, out: { deski: 6 } },
  huta:      { n: 'Huta stali',         t: 1, cost: 15000,  in: { ruda: 6, wegiel: 6 }, out: { stal: 4 } },
  rafineria: { n: 'Rafineria',          t: 1, cost: 14000,  in: { ropa: 5 }, out: { plastik: 4 } },
  fab_chip:  { n: 'Fabryka chipów',     t: 1, cost: 30000,  in: { krzem: 4, miedz: 3 }, out: { chipy: 2 } },
  piekarnia: { n: 'Piekarnia',          t: 2, cost: 12000,  in: { maka: 8 }, out: { chleb: 6 } },
  meblarnia: { n: 'Fabryka mebli',      t: 2, cost: 20000,  in: { deski: 6 }, out: { meble: 2 } },
  fab_pc:    { n: 'Fabryka komputerów', t: 2, cost: 50000,  in: { chipy: 2, plastik: 2 }, out: { komputery: .5 } },
  fab_aut:   { n: 'Fabryka samochodów', t: 2, cost: 120000, in: { stal: 4, plastik: 3, chipy: 2 }, out: { auta: .2 } },
};
const TIER = ['Surowce', 'Przetwórstwo', 'Produkty'];
const AI_NAMES = ['Krupp & Syn', 'Nordic Grain', 'Pacific Motors', 'Sahara Oil', 'Shenzhen Chips', 'Andes Mining', 'Outback Steel', 'Baltic Bakeries'];
const PERKS = {
  prod: { n: 'Wydajność produkcji', d: '+8% produkcji na poziom' },
  upk:  { n: 'Niższe koszty',       d: '−7% kosztów utrzymania na poziom' },
  ship: { n: 'Szybszy transport',   d: '+20% prędkości statków i pojazdów na poziom' },
  sell: { n: 'Negocjacje',          d: '+4% do cen sprzedaży na poziom' },
};
const SEASON_PP = [12, 8, 6, 4, 3, 2, 2, 1, 1];

// ================== NARZĘDZIA ==================
const $ = id => document.getElementById(id);
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function fmt(n) {
  const a = Math.abs(n), s = n < 0 ? '−' : '';
  if (a >= 1e9) return s + (a / 1e9).toFixed(2).replace('.', ',') + ' mld';
  if (a >= 1e6) return s + (a / 1e6).toFixed(2).replace('.', ',') + ' mln';
  if (a >= 1e4) return s + (a / 1e3).toFixed(1).replace('.', ',') + ' tys.';
  if (a >= 100) return s + Math.round(a).toString();
  return s + a.toFixed(a % 1 ? 1 : 0).replace('.', ',');
}
const money = n => (n < 0 ? '−$' : '$') + fmt(Math.abs(n));
const qty = n => n >= 100 ? Math.floor(n).toLocaleString('pl-PL') : (Math.floor(n * 10) / 10).toString().replace('.', ',');
function km(a, b) {
  const A = LOC[a], B = LOC[b], r = Math.PI / 180;
  const h = Math.sin((B.la - A.la) * r / 2) ** 2 + Math.cos(A.la * r) * Math.cos(B.la * r) * Math.sin((B.lo - A.lo) * r / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}
const kmTxt = k => Math.round(k).toLocaleString('pl-PL') + ' km';
const SC = g => 3000 / Math.sqrt(G[g].p);  // skala nasycenia rynku

// ================== STAN ==================
let S, ui = { tab: 'firma', bc: 'eu', bl: 'hamburg', ml: 'hamburg', buyG: 'zboze', buyQ: 100, sf: {}, vf: {}, z: {}, resetArm: false, update: null };

const COLORS = ['#e0823f', '#3fcf7f', '#4aa3ff', '#c77dff', '#ff5d8f', '#f5c542'];
const DIFF = [
  { n: 'Łatwy', cash: 80000, ai: .8, d: '$80 tys. na start, wolniejsza konkurencja' },
  { n: 'Normalny', cash: 50000, ai: 1, d: '$50 tys. na start' },
  { n: 'Trudny', cash: 30000, ai: 1.25, d: '$30 tys. na start, agresywna konkurencja' },
];
function mkAI(base, diff = 1) {
  const names = [...AI_NAMES].sort(() => Math.random() - .5).slice(0, 7), k = DIFF[diff].ai;
  return names.map(n => ({ n, w: base * rnd(.35, 1.15), r: rnd(.0022, .0042) * k }));
}
function newLoc() { return { bld: [], inv: {}, auto: {}, x: 0, port: false, gar: 0 }; }
function ensureL(s, lid) { return s.L[lid] || (s.L[lid] = newLoc()); }
function newState(o = {}) {
  const hl = o.hl || CAP[o.hq || 'eu'], hq = LOC[hl].c, diff = o.diff ?? 1, cash = DIFF[diff].cash;
  const m = {};
  for (const g of GK) m[g] = { sat: 0, d: rnd(.9, 1.1), h: [] };
  const s = {
    v: 2, setup: !!o.done, ceo: o.ceo || '', name: o.name || 'Moja Firma', color: o.color || COLORS[0], hq, hl, diff,
    cash, hour: 0, last: Date.now(),
    c: { [hq]: {} }, L: { [hl]: newLoc() }, ships: [], veh: [], nid: 1, m, ai: mkAI(cash, diff),
    season: 1, pp: 0, perk: { prod: 0, upk: 0, ship: 0, sell: 0 }, ev: [],
    news: [], inc: 0, upk: 0, lastSeason: null, tut: { step: o.tut === false ? 99 : 0, sold: false, rew: false },
  };
  for (const g of GK) m[g].h = Array(8).fill(price(g, s));
  addNews(s, `Start! ${s.ceo ? 'Prezes ' + s.ceo + ', masz' : 'Masz'} ${money(cash)} i siedzibę: ${LOC[hl].n} (${CN[hq].n}).`);
  return s;
}
// zapis z 0.1–0.3 (kontynenty bez miejscowości) → wszystko trafia do stolicy kontynentu
function migrate(s) {
  if (s.setup === undefined) s.setup = true;
  s.hq = s.hq || 'eu'; s.color = s.color || COLORS[0]; s.diff = s.diff ?? 1; s.ceo = s.ceo || '';
  s.tut = s.tut || { step: 99, sold: true, rew: true };
  s.L = {}; s.veh = [];
  const nc = {};
  for (const cid in s.c) {
    const br = s.c[cid], lid = CAP[cid], L = newLoc();
    L.bld = br.bld || []; L.inv = br.inv || {}; L.auto = br.auto || {}; L.port = !!br.port;
    L.x = Math.max(0, Math.ceil((L.bld.length - TYPE.m.slots) / TYPE.m.step));
    s.L[lid] = L; nc[cid] = {};
  }
  s.c = nc;
  for (const sh of s.ships) for (const k of ['at', 'from', 'to']) if (sh[k] && CAP[sh[k]]) sh[k] = CAP[sh[k]];
  s.hl = CAP[s.hq]; s.v = 2;
  if (s.tut.step < 99 && s.tut.step > 0) s.tut.step = 99;
  addNews(s, 'Aktualizacja: miasta i wsie! Twoje zakłady przeniesiono do stolic kontynentów.');
  return s;
}
function load() {
  try {
    const raw = localStorage.getItem(SAVE);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.v === 2) return s;
      if (s && s.v === 1) return migrate(s);
    }
  } catch (e) {}
  return newState();
}
function save() { try { S.last = Date.now(); localStorage.setItem(SAVE, JSON.stringify(S)); } catch (e) {} }

// ================== EKONOMIA ==================
function priceAt(g, sat, d) { return G[g].p * d * clamp(Math.exp(-sat / SC(g)), .15, 3); }
function price(g, s = S) { const m = s.m[g]; return priceAt(g, m.sat, m.d); }
function sellPrice(g, q, s = S) { const m = s.m[g]; return priceAt(g, m.sat + q / 2, m.d) * (1 + .04 * s.perk.sell); }
function buyPrice(g, q, s = S) { const m = s.m[g]; return priceAt(g, m.sat - q / 2, m.d) * 1.15; }
function add(L, g, q) { L.inv[g] = (L.inv[g] || 0) + q; }
const T = lid => TYPE[LOC[lid].t];
const slots = (L, lid) => T(lid).slots + L.x * T(lid).step;
const used = L => L.bld.length + (L.gar ? 1 : 0);
const free = (s, lid) => { const L = s.L[lid]; return L ? slots(L, lid) - used(L) : T(lid).slots; };

function sell(s, lid, g, q) {
  const L = s.L[lid]; q = Math.min(q, L.inv[g] || 0);
  if (q <= 0) return 0;
  const rev = sellPrice(g, q, s) * T(lid).sell * q;
  s.m[g].sat += q; L.inv[g] -= q; if (L.inv[g] < 1e-6) delete L.inv[g];
  s.cash += rev; if (s.tut) s.tut.sold = true; return rev;
}
function buy(s, lid, g, q) {
  const cost = buyPrice(g, q, s) * q;
  if (q <= 0 || cost > s.cash) return false;
  s.cash -= cost; s.m[g].sat -= q; add(ensureL(s, lid), g, q); return cost;
}
function resF(s, cid, g) {
  let f = CN[cid].r[g] || 1;
  for (const e of s.ev) if (e.c === cid && e.g === g) f *= e.f;
  return f;
}
// mnożnik wydajności zakładu w miejscowości (bez poziomu)
function locF(s, lid, d, g) { const t = T(lid); return d.in ? t.fac : t.raw * resF(s, LOC[lid].c, g); }
function bldValue(b) { const d = B[b.t]; return d.cost * (1 + (b.l - 1) * .8) * .6 + (b.land || 0) * .5; }
function upCost(b) { return Math.round(B[b.t].cost * b.l * .8); }
const garUp = L => GARAGE_COST * L.gar;
const xCost = (L, lid) => T(lid).xCost * (L.x + 1);
function worth(s = S) {
  let w = s.cash;
  for (const cid in s.c) if (cid !== s.hq) w += BRANCH_COST * .5;
  for (const lid in s.L) {
    const L = s.L[lid];
    if (L.port) w += PORT_COST * .5;
    if (L.gar) w += GARAGE_COST * L.gar * .5;
    w += L.x * T(lid).xCost * .4;
    for (const b of L.bld) w += bldValue(b);
    for (const g in L.inv) w += L.inv[g] * price(g, s) * .8;
  }
  for (const sh of s.ships) { w += SHIP_COST * .5; if (sh.q) w += sh.q * price(sh.g, s) * .8; }
  for (const v of s.veh) { w += VEH[v.k].cost * .5; if (v.q) w += v.q * price(v.g, s) * .8; }
  return w;
}
const spdM = s => 1 + .2 * s.perk.ship;
function shipHours(s, a, b) { return Math.max(6, Math.round(km(a, b) * 1.3 / (150 * spdM(s)))); }
function shipFee(a, b, q) { return Math.round(km(a, b) * .6 + q * .5) + 100; }
function vehHours(s, k, a, b) { return Math.ceil(km(a, b) * 1.25 / (VEH[k].spd * spdM(s))) + 1; }
function vehFee(k, a, b) { return Math.round(km(a, b) * 1.25 * VEH[k].fuel) + 20; }
const garCap = (s, lid) => (s.L[lid] ? s.L[lid].gar : 0) * 2;
const garUsed = (s, lid) => s.veh.filter(v => v.home === lid).length;
function addNews(s, t) { s.news.unshift({ h: s.hour, t }); s.news.length = Math.min(s.news.length, 30); }
function tstr(h) { const d = Math.floor(h / 24) + 1, hh = h % 24; return `Dzień ${d}, ${String(hh).padStart(2, '0')}:00`; }

// ================== SYMULACJA 1 GODZINY ==================
function hour(s) {
  s.hour++;
  const cash0 = s.cash;
  const prodM = 1 + .08 * s.perk.prod, upkM = Math.max(.3, 1 - .07 * s.perk.upk);
  let upk = 0;
  for (const lid in s.L) {
    const L = s.L[lid];
    for (const b of L.bld) {
      const d = B[b.t], k = b.l * prodM;
      upk += d.cost * .0012 * b.l * upkM;
      if (d.in) {
        let f = 1; const miss = [];
        for (const g in d.in) { const r = (L.inv[g] || 0) / (d.in[g] * k); if (r < 1) miss.push(G[g].n); f = Math.min(f, r); }
        if (f <= .001) { b.st = 'Stoi — brak: ' + miss.join(', '); continue; }
        for (const g in d.in) { L.inv[g] -= d.in[g] * k * f; if (L.inv[g] < 1e-6) delete L.inv[g]; }
        for (const g in d.out) add(L, g, d.out[g] * k * f * locF(s, lid, d, g));
        b.st = f < .999 ? `Praca ${Math.round(f * 100)}% — mało: ${miss.join(', ')}` : '';
      } else {
        for (const g in d.out) add(L, g, d.out[g] * k * locF(s, lid, d, g));
        b.st = '';
      }
    }
    if (L.port) upk += 30 * upkM;
    if (L.gar) upk += 15 * L.gar * upkM;
    for (const g in L.auto) if (L.auto[g] && (L.inv[g] || 0) >= 1) sell(s, lid, g, Math.floor(L.inv[g]));
  }
  for (const v of s.veh) upk += VEH[v.k].cost * .001 * upkM;
  s.cash -= upk; s.upk = upk;
  // statki i pojazdy
  for (const sh of s.ships) if (sh.st === 'sail' && s.hour >= sh.eta) {
    if (sh.q) add(ensureL(s, sh.to), sh.g, sh.q);
    addNews(s, `Statek #${sh.id} dopłynął do: ${LOC[sh.to].n}` + (sh.q ? ` (${qty(sh.q)} ${G[sh.g].n})` : ''));
    Object.assign(sh, { st: 'idle', at: sh.to, to: null, g: null, q: 0 });
  }
  for (const v of s.veh) if (v.st === 'go' && s.hour >= v.eta) {
    if (v.q) add(ensureL(s, v.to), v.g, v.q);
    addNews(s, `${VEH[v.k].n} #${v.id} dojechał do: ${LOC[v.to].n}` + (v.q ? ` (${qty(v.q)} ${G[v.g].n})` : ''));
    Object.assign(v, { st: 'idle', at: v.to, to: null, g: null, q: 0 });
  }
  // rynek
  for (const g of GK) {
    const m = s.m[g];
    m.sat *= .96;
    m.d = clamp(m.d + (1 - m.d) * .03 + rnd(-.015, .015), .5, 1.8);
  }
  // konkurencja AI
  for (const a of s.ai) {
    a.w *= 1 + a.r * rnd(.4, 1.6);
    if (Math.random() < .3) { const g = pick(GK); s.m[g].sat += SC(g) * rnd(0, .03) * (Math.random() < .3 ? -1 : 1); }
  }
  // wydarzenia
  s.ev = s.ev.filter(e => e.until > s.hour);
  if (Math.random() < 1 / 30) randomEvent(s);
  if (s.hour % 3 === 0) for (const g of GK) { const h = s.m[g].h; h.push(price(g, s)); if (h.length > 16) h.shift(); }
  s.inc = s.inc * .85 + (s.cash - cash0) * .15;
  if (s.hour % SEASON_H === 0) endSeason(s);
}
function randomEvent(s) {
  const t = Math.random();
  if (t < .5) {
    const g = pick(GK), up = Math.random() < .55;
    s.m[g].d = clamp(s.m[g].d * (up ? 1.35 : .72), .5, 1.8);
    addNews(s, up ? `Boom na rynku: ${G[g].n} drożeje!` : `Krach: ${G[g].n} tanieje.`);
  } else {
    const c = pick(CONT), raws = Object.keys(c.r), g = pick(raws), good = Math.random() < .45;
    s.ev.push({ c: c.id, g, f: good ? 1.5 : .5, until: s.hour + 48 });
    addNews(s, good ? `${c.n}: nowe złoża — ${G[g].n} +50% przez 2 dni` : `${c.n}: kryzys — ${G[g].n} −50% przez 2 dni`);
  }
}
function ranking(s = S) {
  const list = s.ai.map(a => ({ n: a.n, w: a.w, me: false }));
  list.push({ n: s.name, w: worth(s), me: true });
  return list.sort((a, b) => b.w - a.w);
}
function endSeason(s) {
  const r = ranking(s), pos = r.findIndex(x => x.me);
  const pp = SEASON_PP[pos] || 1;
  s.pp += pp; s.lastSeason = { season: s.season, pos: pos + 1, pp };
  addNews(s, `Koniec sezonu ${s.season}: miejsce ${pos + 1}. Nagroda: ${pp} pkt prestiżu.`);
  s.season++;
  s.ai = mkAI(Math.max(50000, worth(s)), s.diff ?? 1);
  ui.seasonEnd = true;
}

// ================== SAMOUCZEK ==================
const hasB = t => Object.values(S.L).some(L => L.bld.some(b => b.t === t));
const hqInv = g => (S.L[S.hl] && S.L[S.hl].inv[g]) || 0;
const TUT = [
  { t: 'Witaj, prezesie!', d: () => `${esc(S.name)} startuje w: ${LOC[S.hl].n} (${CN[S.hq].n}). Cel gry: zarabiać, budować coraz bardziej zaawansowane łańcuchy produkcji i wygrać sezon w rankingu. Pokażę Ci podstawy w kilku krokach.`, next: true },
  { t: 'Zakładka Budowa', d: 'Zakłady stawiasz w zakładce Budowa, na działkach w miastach i wsiach. Otwórz ją.', sel: () => ['[data-tab=budowa]'], done: () => ui.tab === 'budowa' },
  { t: 'Pierwsza farma', d: () => `Farma produkuje zboże — najtańszy surowiec. Zbuduj ją w: ${LOC[S.hl].n}. Cena = budynek + działka.`,
    sel: () => ['[data-a=build][data-b=farma]', `[data-a=bl][data-l=${S.hl}]`, '[data-tab=budowa]'], done: () => hasB('farma') },
  { t: 'Młyn', d: 'Młyn przerabia 10 zboża na 8 mąki, a mąka jest ponad 3× droższa. Tak działają łańcuchy produkcji. Zbuduj Młyn w tej samej miejscowości.',
    sel: () => ['[data-a=build][data-b=mlyn]', `[data-a=bl][data-l=${S.hl}]`, '[data-tab=budowa]'], done: () => hasB('mlyn') },
  { t: 'Produkcja trwa', d: () => `Zakłady pracują same: 1 godzina gry = 4 s. Każdy ma też koszt utrzymania co godzinę. Poczekaj na mąkę: ${qty(Math.min(5, hqInv('maka')))} / 5.`,
    done: () => hqInv('maka') >= 5 || S.tut.sold },
  { t: 'Rynek', d: 'Mąka gotowa! Otwórz zakładkę Rynek.', sel: () => ['[data-tab=magazyn]'], done: () => ui.tab === 'magazyn' },
  { t: 'Sprzedaż', d: 'Sprzedaj mąkę przyciskiem „Wszystko”. Im więcej sprzedajesz naraz, tym niższa cena — rynek się nasyca i odbija z czasem.',
    sel: () => ['[data-a=sell][data-g=maka][data-f="1"]', `[data-a=ml][data-l=${S.hl}]`, '[data-tab=magazyn]'], done: () => S.tut.sold },
  { t: 'Auto‑sprzedaż', d: 'Włącz „Auto” przy mące. Towar będzie sprzedawany co godzinę, także gdy gra jest zamknięta.',
    sel: () => ['[data-a=auto][data-g=maka]', `[data-a=ml][data-l=${S.hl}]`, '[data-tab=magazyn]'], done: () => !!((S.L[S.hl] || {}).auto || {}).maka },
  { t: 'Uważaj na surowce', d: 'Nie włączaj auto‑sprzedaży zboża, bo młyn stanie. Zakład bez surowców pokazuje czerwony napis „Stoi — brak”. Brakujące surowce możesz dokupić na rynku (marża 15%).', next: true },
  { t: 'Miasta i wsie', d: 'Wieś: tania działka, farmy i kopalnie +25%. Miasto: drogie działki, ale fabryki +15% i sprzedaż +5%. Działek jest ograniczona liczba — w miastach możesz dokupić kolejne.', next: true, sel: () => ['[data-tab=budowa]'] },
  { t: 'Garaże i ciężarówki', d: 'Każda miejscowość ma własny magazyn. Zbuduj garaż (zajmuje działkę), kup dostawczak lub ciężarówkę i woź zboże ze wsi do młyna w mieście. Zakładka Transport.', next: true, sel: () => ['[data-tab=logistyka]'] },
  { t: 'Porty i statki', d: 'Między kontynentami (i na wyspy, np. Tokio) wozisz towar statkami. Port możesz postawić tylko w miastach nad morzem.', next: true, sel: () => ['[data-tab=logistyka]'] },
  { t: 'Ranking i sezony', d: 'Sezon trwa 30 dni gry, ranking liczy wartość firmy. Za miejsce dostajesz punkty prestiżu na stałe ulepszenia.', next: true, sel: () => ['[data-tab=ranking]'] },
  { t: 'Gotowe!', d: () => S.tut.rew ? 'Samouczek ukończony. Powodzenia!' : 'Nagroda za ukończenie samouczka: $5 tys. Powodzenia!', next: true, btn: 'Zakończ', fin: true },
];
function renderTut() {
  document.querySelectorAll('.tut-hl').forEach(e => e.classList.remove('tut-hl'));
  const box = $('tut'), tu = S.tut;
  while (tu.step < TUT.length && TUT[tu.step].done && TUT[tu.step].done()) tu.step++;
  if (!S.setup || tu.step >= TUT.length) { box.hidden = true; document.body.classList.remove('tuton'); return; }
  const st = TUT[tu.step], d = typeof st.d === 'function' ? st.d() : st.d;
  box.hidden = false; document.body.classList.add('tuton');
  box.innerHTML = `<div class="row"><span class="mut small grow">Samouczek · ${tu.step + 1}/${TUT.length}</span><button class="lnk" data-a="tutSkip">Pomiń</button></div>
    <div class="tut-t">${st.t}</div><div class="tut-d">${d}</div>
    ${st.next ? `<div class="btns"><button class="btn p" data-a="tutNext">${st.btn || 'Dalej'}</button></div>` : ''}`;
  if (st.sel) for (const q of st.sel()) {
    const el = document.querySelector(q);
    if (!el) continue;
    el.classList.add('tut-hl');
    const key = tu.step + q;
    if (ui.tutScroll !== key) {
      ui.tutScroll = key;
      const r = el.getBoundingClientRect();
      if (!el.closest('nav') && (r.top < 80 || r.bottom > innerHeight - 260)) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
    break;
  }
}

// ================== KREATOR KONTA ==================
const wz = { step: 0, ceo: '', name: '', hq: 'eu', hl: CAP.eu, color: COLORS[0], diff: 1, tut: true };
const bonTxt = c => Object.entries(c.r).filter(([, v]) => v >= 1.2).sort((a, b) => b[1] - a[1]).map(([g, v]) => `${G[g].n} ×${String(v).replace('.', ',')}`).join(' · ') || 'zrównoważony';
function renderWiz() {
  const el = $('wiz');
  if (S.setup) { el.hidden = true; return; }
  el.hidden = false;
  const dots = [0, 1, 2, 3].map(i => `<i class="${i <= wz.step ? 'on' : ''}"></i>`).join('');
  let b = '';
  if (wz.step === 0) {
    b = `<div class="wz-logo"><svg viewBox="0 0 64 64" width="72" height="72"><rect x="6" y="30" width="12" height="28" rx="2" fill="#e0823f"/><rect x="26" y="18" width="12" height="40" rx="2" fill="#4aa3ff"/><rect x="46" y="6" width="12" height="52" rx="2" fill="#3fcf7f"/></svg></div>
      <h1>XyxWord</h1><p class="mut">Zbuduj imperium gospodarcze: od farmy na wsi do fabryk komputerów i samochodów w wielkich miastach. Rywalizuj z konkurencją w sezonowym rankingu.</p>
      <label class="f" for="wzCeo">Imię prezesa</label><input id="wzCeo" data-wz="ceo" maxlength="20" placeholder="np. Mati" value="${esc(wz.ceo)}">
      <label class="f" for="wzName">Nazwa firmy</label><input id="wzName" data-wz="name" maxlength="24" placeholder="np. Mati Holding" value="${esc(wz.name)}">
      <div id="wzErr" class="warn"></div>`;
  } else if (wz.step === 1) {
    b = `<h1>Siedziba firmy</h1><p class="mut">Wybierz kontynent i miejscowość startową. Inne miejsca otworzysz później.</p>
      <div class="chips">${CONT.map(c => `<button class="${wz.hq === c.id ? 'on' : ''}" data-a="wzSet" data-k="hq" data-v="${c.id}">${c.n}</button>`).join('')}</div>
      <div class="mut small" style="margin:0 2px 8px">Bonusy surowców: ${bonTxt(CN[wz.hq])}</div>
      ${LOCS.filter(l => l.c === wz.hq).map(l => `<button class="wz-opt ${wz.hl === l.id ? 'on' : ''}" data-a="wzSet" data-k="hl" data-v="${l.id}">
        <b>${l.n} <span class="ltag ${l.t}">${TYPE[l.t].n}</span>${l.port ? ' <span class="ltag p">Port</span>' : ''}</b><span>${TYPE[l.t].d}</span></button>`).join('')}`;
  } else if (wz.step === 2) {
    b = `<h1>Styl i trudność</h1><label class="f">Kolor firmy</label><div class="sw">${COLORS.map(c => `<button class="${wz.color === c ? 'on' : ''}" style="background:${c}" data-a="wzSet" data-k="color" data-v="${c}" aria-label="Kolor ${c}"></button>`).join('')}</div>
      <label class="f">Poziom trudności</label>
      ${DIFF.map((d, i) => `<button class="wz-opt ${wz.diff === i ? 'on' : ''}" data-a="wzSet" data-k="diff" data-v="${i}"><b>${d.n}</b><span>${d.d}</span></button>`).join('')}`;
  } else {
    b = `<h1>Gotowe do startu</h1>
      <div class="card"><div class="row"><span class="dot" style="background:${wz.color}"></span><div class="grow"><b>${esc(wz.name)}</b><div class="mut small">Prezes: ${esc(wz.ceo)}</div></div></div>
      <table style="margin-top:8px"><tr><td>Siedziba</td><td class="n">${LOC[wz.hl].n} (${TYPE[LOC[wz.hl].t].n.toLowerCase()})</td></tr><tr><td>Kontynent</td><td class="n">${CN[wz.hq].n}</td></tr><tr><td>Trudność</td><td class="n">${DIFF[wz.diff].n}</td></tr><tr><td>Gotówka</td><td class="n">${money(DIFF[wz.diff].cash)}</td></tr></table></div>
      <button class="toggle ${wz.tut ? 'on' : ''}" data-a="wzSet" data-k="tut" data-v="${wz.tut ? 0 : 1}" style="width:100%;min-height:44px">Samouczek: ${wz.tut ? 'włączony' : 'wyłączony'}</button>`;
  }
  el.innerHTML = `<div class="wz-in"><div class="wz-dots">${dots}</div>${b}
    <div class="btns wz-nav">${wz.step ? '<button class="btn" data-a="wzBack">Wstecz</button>' : ''}<button class="btn p grow" data-a="wzNext">${wz.step === 3 ? 'Rozpocznij grę' : 'Dalej'}</button></div></div>`;
}
document.addEventListener('input', e => { const k = e.target.dataset.wz; if (k) wz[k] = e.target.value; });

// ================== RENDER ==================
function spark(h) {
  const mn = Math.min(...h), mx = Math.max(...h), rg = mx - mn || 1;
  const pts = h.map((v, i) => `${(i / (h.length - 1)) * 62 + 1},${19 - ((v - mn) / rg) * 18}`).join(' ');
  const up = h[h.length - 1] >= h[0];
  return `<svg class="spark" viewBox="0 0 64 20"><polyline fill="none" stroke="${up ? 'var(--ok)' : 'var(--bad)'}" stroke-width="1.5" points="${pts}"/></svg>`;
}
function chg(g) { const h = S.m[g].h, a = h[0], b = price(g); return (b - a) / a * 100; }
function flowTxt(d, k, lid) {
  const o = Object.entries(d.out).map(([g, v]) => `<em>${qty(v * k * (lid ? locF(S, lid, d, g) : 1))}</em> ${G[g].n}`).join(', ');
  if (!d.in) return `→ ${o} /h`;
  return Object.entries(d.in).map(([g, v]) => `${qty(v * k)} ${G[g].n}`).join(' + ') + ` → ${o} /h`;
}
const tag = l => `<span class="ltag ${l.t}">${TYPE[l.t].n}</span>`;
function contChips(sel) {
  return `<div class="chips">${CONT.map(c => `<button class="${c.id === sel ? 'on' : ''} ${S.c[c.id] ? 'own' : ''}" data-a="bc" data-c="${c.id}">${c.n}</button>`).join('')}</div>`;
}
function locChips(list, sel, act) {
  return `<div class="chips">${list.map(l => { const L = S.L[l.id];
    return `<button class="${l.id === sel ? 'on' : ''} ${L && (L.bld.length || L.gar) ? 'own' : ''}" data-a="${act}" data-l="${l.id}">${l.n}<small>${l.t === 'w' ? 'wieś' : 'miasto'}</small></button>`; }).join('')}</div>`;
}
const bldCount = () => Object.values(S.L).reduce((a, L) => a + L.bld.length, 0);

function vFirma() {
  const r = ranking(), pos = r.findIndex(x => x.me) + 1;
  const day = Math.floor((S.hour % SEASON_H) / 24) + 1;
  let h = '';
  if (!bldCount() && S.tut.step >= TUT.length) h += `<div class="card hint"><b>Jak zacząć</b><div class="mut" style="margin-top:4px">W <b>Budowa</b> postaw Farmę i Młyn w swojej siedzibie, potem Piekarnię. Na wsiach farmy i kopalnie dają więcej, w miastach fabryki. Towar między miejscowościami wożą ciężarówki, między kontynentami statki.</div><div class="btns"><button class="btn p" data-a="tab" data-t="budowa">Do budowy</button></div></div>`;
  h += mapSvg();
  h += `<div class="kpis">
    <div class="kpi"><span>Wartość firmy</span><b>${money(worth())}</b></div>
    <div class="kpi"><span>Przepływ gotówki /h</span><b class="${S.inc >= 0 ? 'pos' : 'neg'}">${money(S.inc)}</b></div>
    <div class="kpi"><span>Koszty utrzymania /h</span><b>${money(S.upk)}</b></div>
    <div class="kpi"><span>Sezon ${S.season} · dzień ${day}/30</span><b>Miejsce ${pos} / ${r.length}</b></div>
  </div>`;
  h += `<h2>Wiadomości</h2><div class="card">${S.news.slice(0, 10).map(n => `<div class="news"><span>D${Math.floor(n.h / 24) + 1}</span>${esc(n.t)}</div>`).join('')}</div>`;
  return h;
}
const MAPS = window.XYX_MAPS;
// podkład mapy: morze, siatka, cień lądu, ląd, granice
function mapBase(m, id) {
  return `<defs><radialGradient id="sea${id}" cx="50%" cy="35%" r="80%"><stop offset="0" stop-color="#173047"/><stop offset="1" stop-color="#0b131b"/></radialGradient>
    <linearGradient id="land${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f4150"/><stop offset="1" stop-color="#23323e"/></linearGradient></defs>
    <rect x="${-m.w}" y="${-m.h}" width="${m.w * 3}" height="${m.h * 3}" fill="url(#sea${id})"/>
    <path d="${m.grat}" fill="none" stroke="#1c3448" stroke-width="1" vector-effect="non-scaling-stroke"/>
    <path d="${m.land}" fill="#060b10" opacity=".55" transform="translate(3 5)"/>
    <path d="${m.land}" fill="url(#land${id})" stroke="#4d6577" stroke-width=".8" vector-effect="non-scaling-stroke"/>
    ${m.borders ? `<path d="${m.borders}" fill="none" stroke="#5b7487" stroke-width=".6" stroke-dasharray="2 2" opacity=".7" vector-effect="non-scaling-stroke"/>` : ''}`;
}
function mapSvg() {
  const m = MAPS.world, P = cid => m.pts[cid];
  let lines = '', dots = '';
  for (const sh of S.ships) {
    if (sh.st !== 'sail') continue;
    const a = LOC[sh.from].c, b = LOC[sh.to].c; if (a === b) continue;
    const [x1, y1] = P(a), [x2, y2] = P(b), cx = (x1 + x2) / 2, cy = Math.min(y1, y2) - Math.abs(x2 - x1) * .18 - 20;
    const t = clamp(1 - (sh.eta - S.hour) / sh.dur, 0, 1), bx = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * cx + t * t * x2, by = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * cy + t * t * y2;
    lines += `<path d="M${x1} ${y1}Q${cx} ${cy} ${x2} ${y2}" fill="none" stroke="#4aa3ff" stroke-width="1.5" stroke-dasharray="5 4" opacity=".8" vector-effect="non-scaling-stroke"/><circle cx="${bx}" cy="${by}" r="7" fill="#4aa3ff" stroke="#0b131b" stroke-width="2"/>`;
  }
  for (const c of CONT) {
    const [x, y] = P(c.id), own = !!S.c[c.id];
    const ls = Object.keys(S.L).filter(l => LOC[l].c === c.id);
    const n = ls.reduce((a, l) => a + S.L[l].bld.length, 0), port = ls.some(l => S.L[l].port);
    dots += `<g data-a="goBuild" data-c="${c.id}" style="cursor:pointer">
      ${own ? `<circle cx="${x}" cy="${y}" r="30" fill="${S.color}" opacity=".18"/>` : ''}
      <circle cx="${x}" cy="${y}" r="${own ? 17 + Math.min(n, 10) : 11}" fill="${own ? S.color : '#3a4654'}" stroke="${own ? '#fff' : '#6b7787'}" stroke-width="2.5"/>
      ${port ? `<rect x="${x + 14}" y="${y - 26}" width="12" height="12" rx="3" fill="#4aa3ff" stroke="#0b131b" stroke-width="2"/>` : ''}
      ${own ? `<text x="${x}" y="${y + 6}" text-anchor="middle" font-size="18" font-weight="800" fill="#1b1006" class="nh">${n}</text>` : ''}
      <text x="${x}" y="${y + (own ? 52 : 36)}" text-anchor="middle" font-size="24" font-weight="600" fill="${own ? '#eef0f3' : '#b4bcc6'}" class="lbl">${c.n}</text></g>`;
  }
  return `<div class="map"><svg viewBox="0 0 ${m.w} ${m.h}">${mapBase(m, 'w')}${lines}${dots}</svg></div>`;
}
// mapa kontynentu z miejscowościami i jadącymi pojazdami; zoom/przesuwanie: ui.z[cid]
const zOf = cid => ui.z[cid] || (ui.z[cid] = { k: 1, x: 0, y: 0 });
function clampZ(cid) {
  const z = zOf(cid), m = MAPS[cid];
  z.k = clamp(z.k, 1, 12); z.x = clamp(z.x, 0, m.w - m.w / z.k); z.y = clamp(z.y, 0, m.h - m.h / z.k);
}
function zoomAt(cid, k, ux, uy) { // ux,uy: punkt mapy, który ma zostać w miejscu (środek widoku)
  const z = zOf(cid), m = MAPS[cid];
  z.k = clamp(k, 1, 12); z.x = ux - m.w / z.k / 2; z.y = uy - m.h / z.k / 2; clampZ(cid);
}
function locMap(cid, sel) {
  const m = MAPS[cid], z = zOf(cid), u = 1 / z.k, P = l => m.pts[l.id];
  const ls = LOCS.filter(l => l.c === cid);
  const own = l => { const L = S.L[l.id]; return !!(L && (L.bld.length || L.gar || Object.keys(L.inv).length)); };
  let g = '';
  for (const v of S.veh) {
    if (v.st !== 'go' || LOC[v.to].c !== cid) continue;
    const [x1, y1] = P(LOC[v.from]), [x2, y2] = P(LOC[v.to]), p = clamp(1 - (v.eta - S.hour) / v.dur, 0, 1);
    g += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#f5c542" stroke-width="2" stroke-dasharray="5 4" vector-effect="non-scaling-stroke"/>
      <rect x="${x1 + (x2 - x1) * p - 11 * u}" y="${y1 + (y2 - y1) * p - 7 * u}" width="${22 * u}" height="${14 * u}" rx="${3 * u}" fill="#f5c542" stroke="#0b131b" stroke-width="1.5" vector-effect="non-scaling-stroke"/>`;
  }
  // etykiety: najpierw wybrana i Twoje, potem miasta, potem wsie; nachodzące się chowamy
  const fs = 28 * u, boxes = [], lab = {};
  const hit = b => boxes.some(o => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]);
  const order = [...ls].sort((a, b) => (b.id === sel) - (a.id === sel) || own(b) - own(a) || (a.t === 'm' ? -1 : 1) - (b.t === 'm' ? -1 : 1));
  for (const l of ls) { const [x, y] = P(l); boxes.push([x - 12 * u, y - 12 * u, x + 12 * u, y + 12 * u]); }
  for (const l of order) {
    const [x, y] = P(l), w = l.n.length * fs * .56, d = 16 * u;
    const opts = [[x, y + d + fs * .8, 'middle', x - w / 2, y + d, x + w / 2, y + d + fs], [x, y - d - fs * .2, 'middle', x - w / 2, y - d - fs, x + w / 2, y - d],
      [x + d, y + fs * .35, 'start', x + d, y - fs / 2, x + d + w, y + fs / 2], [x - d, y + fs * .35, 'end', x - d - w, y - fs / 2, x - d, y + fs / 2]];
    const o = opts.find(o => !hit(o.slice(3))) || (l.id === sel ? opts[0] : null);
    if (o) { boxes.push(o.slice(3)); lab[l.id] = o; }
  }
  for (const l of ls) {
    const [x, y] = P(l), L = S.L[l.id], mine = own(l), on = l.id === sel, lb = lab[l.id], r = (l.t === 'm' ? 11 : 9) * u;
    const fill = mine ? S.color : (l.t === 'm' ? '#56677a' : '#4b6a4e');
    const shape = l.t === 'm' ? `<rect x="${x - r}" y="${y - r}" width="${2 * r}" height="${2 * r}" rx="${3 * u}"` : `<circle cx="${x}" cy="${y}" r="${r}"`;
    g += `<g data-a="bl" data-l="${l.id}" data-from-map="1" style="cursor:pointer"><circle cx="${x}" cy="${y}" r="${24 * u}" fill="transparent"/>
      ${on ? `<circle cx="${x}" cy="${y}" r="${19 * u}" fill="none" stroke="#e0823f" stroke-width="2.5" vector-effect="non-scaling-stroke"/>` : ''}
      ${shape} fill="${fill}" stroke="${mine ? '#fff' : '#0b131b'}" stroke-width="1.5" vector-effect="non-scaling-stroke"/>
      ${L && L.port ? `<rect x="${x + 7 * u}" y="${y - 17 * u}" width="${10 * u}" height="${10 * u}" rx="${2 * u}" fill="#4aa3ff" stroke="#0b131b" stroke-width="1" vector-effect="non-scaling-stroke"/>` : ''}
      ${lb ? `<text x="${lb[0]}" y="${lb[1]}" text-anchor="${lb[2]}" font-size="${fs}" font-weight="${on || mine ? 700 : 500}" fill="${on ? '#fff' : mine ? '#eef0f3' : '#b4bcc6'}" class="lbl" style="stroke-width:${7 * u}px">${l.n}</text>` : ''}</g>`;
  }
  return `<div class="map lmap" data-cid="${cid}" style="--ar:${m.w}/${m.h}"><svg viewBox="${z.x} ${z.y} ${m.w / z.k} ${m.h / z.k}" preserveAspectRatio="xMidYMid meet" class="${z.k > 1 ? 'zoomed' : ''}">${mapBase(m, cid)}${g}</svg>
    <div class="zbtn"><button data-a="zoom" data-z="1" aria-label="Przybliż">+</button><button data-a="zoom" data-z="-1" aria-label="Oddal">−</button>${z.k > 1 ? '<button data-a="zoom" data-z="0" aria-label="Cała mapa">⤢</button>' : ''}</div></div>`;
}
// gesty na mapie kontynentu: przeciąganie, szczypanie, kółko myszy
const gs = { pts: new Map(), moved: false, block: false };
function gsSvg(e) { return e.target.closest && e.target.closest('.lmap svg'); }
function upp(svg, cid) { const r = svg.getBoundingClientRect(), m = MAPS[cid], z = zOf(cid); return { r, k: Math.max(m.w / z.k / r.width, m.h / z.k / r.height) }; }
function applyVB(svg, cid) { const z = zOf(cid), m = MAPS[cid]; svg.setAttribute('viewBox', `${z.x} ${z.y} ${m.w / z.k} ${m.h / z.k}`); svg.classList.toggle('zoomed', z.k > 1); }
document.addEventListener('pointerdown', e => {
  const svg = gsSvg(e); if (!svg) return;
  gs.svg = svg; gs.cid = svg.parentNode.dataset.cid; gs.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (gs.pts.size === 1) { gs.moved = false; gs.travel = 0; }
  ui.gesture = true;
});
document.addEventListener('pointermove', e => {
  if (!gs.pts.has(e.pointerId)) return;
  const prevPts = [...gs.pts.values()].map(p => ({ ...p }));
  gs.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  const cid = gs.cid, z = zOf(cid), m = MAPS[cid], { r, k } = upp(gs.svg, cid), cur = [...gs.pts.values()];
  if (cur.length === 1) {
    const dx = cur[0].x - prevPts[0].x, dy = cur[0].y - prevPts[0].y;
    gs.travel += Math.abs(dx) + Math.abs(dy);
    if (gs.travel > 8 && z.k > 1) { gs.moved = true; z.x -= dx * k; z.y -= dy * k; }
    else if (gs.travel > 8) gs.moved = true;
  } else if (cur.length === 2) {
    const d0 = Math.hypot(prevPts[0].x - prevPts[1].x, prevPts[0].y - prevPts[1].y), d1 = Math.hypot(cur[0].x - cur[1].x, cur[0].y - cur[1].y);
    const mx = (cur[0].x + cur[1].x) / 2 - r.left, my = (cur[0].y + cur[1].y) / 2 - r.top;
    const ux = z.x + mx * k, uy = z.y + my * k;
    z.k = clamp(z.k * (d1 / (d0 || d1)), 1, 12);
    const k2 = Math.max(m.w / z.k / r.width, m.h / z.k / r.height);
    z.x = ux - mx * k2; z.y = uy - my * k2; gs.moved = true;
  }
  clampZ(cid); applyVB(gs.svg, cid);
});
function gsEnd(e) {
  if (!gs.pts.delete(e.pointerId) || gs.pts.size) return;
  ui.gesture = false;
  if (gs.moved) { gs.block = true; setTimeout(() => { gs.block = false; }, 60); render(true); }
}
document.addEventListener('pointerup', gsEnd);
document.addEventListener('pointercancel', gsEnd);
document.addEventListener('wheel', e => {
  const svg = gsSvg(e); if (!svg) return;
  e.preventDefault();
  const cid = svg.parentNode.dataset.cid, z = zOf(cid), { r, k } = upp(svg, cid);
  const ux = z.x + (e.clientX - r.left) * k, uy = z.y + (e.clientY - r.top) * k;
  z.k = clamp(z.k * (e.deltaY < 0 ? 1.25 : .8), 1, 12);
  const m = MAPS[cid], k2 = Math.max(m.w / z.k / r.width, m.h / z.k / r.height);
  z.x = ux - (e.clientX - r.left) * k2; z.y = uy - (e.clientY - r.top) * k2; clampZ(cid);
  clearTimeout(gs.wt); applyVB(svg, cid); gs.wt = setTimeout(() => render(true), 150);
}, { passive: false });

function vBudowa() {
  const cid = ui.bc, c = CN[cid];
  let h = contChips(cid);
  if (!S.c[cid]) {
    return h + `<div class="card"><div class="bname">${c.n}</div>
      <div class="mut" style="margin:4px 0 8px">Nie masz tu oddziału. Bonusy surowców: ${bonTxt(c)}. Miejscowości: ${LOCS.filter(l => l.c === cid).map(l => l.n).join(', ')}.</div>
      <button class="btn p" data-a="branch" data-c="${cid}" ${S.cash < BRANCH_COST ? 'disabled' : ''}>Otwórz oddział — ${money(BRANCH_COST)}</button></div>`;
  }
  if (LOC[ui.bl].c !== cid) ui.bl = Object.keys(S.L).find(l => LOC[l].c === cid) || CAP[cid];
  const lid = ui.bl, l = LOC[lid], t = TYPE[l.t], L = S.L[lid] || newLoc(), fr = slots(L, lid) - used(L);
  h += locMap(cid, lid) + locChips(LOCS.filter(x => x.c === cid), lid, 'bl');
  h += `<div class="card"><div class="row"><div class="grow"><span class="bname">${l.n}</span> ${tag(l)}${l.port ? ' <span class="ltag p">Wybrzeże</span>' : ''}<div class="flow">${t.d}</div></div></div>
    <div class="row" style="margin-top:8px"><div class="grow">Działki: <b>${used(L)} / ${slots(L, lid)}</b> <span class="mut small">· działka ${money(t.land)}</span></div>
    ${L.x < t.maxX ? `<button class="btn s" data-a="expand" data-l="${lid}" ${S.cash < xCost(L, lid) ? 'disabled' : ''}>+${t.step} dział${t.step > 1 ? 'ki' : 'ka'} — ${money(xCost(L, lid))}</button>` : '<span class="mut small">maks. działek</span>'}</div>
    <div class="row" style="margin-top:8px"><div class="grow">Garaż: ${L.gar ? `<b>poz. ${L.gar}</b> <span class="mut small">· ${garUsed(S, lid)}/${garCap(S, lid)} pojazdów</span>` : '<span class="mut">brak</span>'}</div>
    ${L.gar ? `<button class="btn s" data-a="garUp" data-l="${lid}" ${S.cash < garUp(L) ? 'disabled' : ''}>Rozbuduj — ${money(garUp(L))}</button>`
      : `<button class="btn s g" data-a="garage" data-l="${lid}" ${S.cash < GARAGE_COST + t.land || fr < 1 ? 'disabled' : ''}>Zbuduj — ${money(GARAGE_COST + t.land)}</button>`}</div></div>`;
  h += `<h2>Zakłady — ${l.n}</h2>`;
  if (!L.bld.length) h += `<div class="card mut">Brak zakładów. Zbuduj coś poniżej.</div>`;
  for (const b of L.bld) {
    const d = B[b.t], k = b.l * (1 + .08 * S.perk.prod), uc = upCost(b);
    h += `<div class="card"><div class="row"><div class="grow"><span class="tier t${d.t}">${TIER[d.t]}</span><span class="bname">${d.n}</span> <span class="mut">poz. ${b.l}</span></div></div>
      <div class="flow">${flowTxt(d, k, lid)}</div>${b.st ? `<div class="warn">${esc(b.st)}</div>` : ''}
      <div class="btns"><button class="btn s g" data-a="up" data-l="${lid}" data-id="${b.id}" ${S.cash < uc ? 'disabled' : ''}>Ulepsz — ${money(uc)}</button>
      <button class="btn s" data-a="demo" data-l="${lid}" data-id="${b.id}">Sprzedaj za ${money(bldValue(b))}</button></div></div>`;
  }
  h += `<h2>Nowa inwestycja ${fr < 1 ? '— brak wolnych działek' : `— wolne działki: ${fr}`}</h2>`;
  for (let ti = 0; ti < 3; ti++) {
    for (const [id, d] of Object.entries(B).filter(([, d]) => d.t === ti)) {
      const cost = d.cost + t.land, bon = d.in ? t.fac : t.raw;
      h += `<div class="card"><div class="row"><div class="grow"><span class="tier t${ti}">${TIER[ti]}</span><span class="bname">${d.n}</span>${bon > 1 ? ` <span class="pos small">+${Math.round((bon - 1) * 100)}%</span>` : ''}</div>
        <button class="btn s p" data-a="build" data-l="${lid}" data-b="${id}" ${S.cash < cost || fr < 1 ? 'disabled' : ''}>${money(cost)}</button></div>
        <div class="flow">${flowTxt(d, 1 + .08 * S.perk.prod, lid)}</div></div>`;
    }
  }
  return h;
}

function vMagazyn() {
  const list = LOCS.filter(l => S.L[l.id]);
  if (!S.L[ui.ml]) ui.ml = S.L[S.hl] ? S.hl : list[0].id;
  const lid = ui.ml, L = S.L[lid], l = LOC[lid];
  let h = locChips(list, lid, 'ml');
  const items = Object.entries(L.inv).filter(([, q]) => q >= .05);
  h += `<h2>Magazyn — ${l.n} · ceny ${l.t === 'm' ? '+5% (miasto)' : '−5% (wieś)'}</h2><div class="card">`;
  if (!items.length && !Object.values(L.auto).some(Boolean)) h += `<div class="mut">Magazyn pusty.</div>`;
  const shown = new Set(items.map(([g]) => g));
  for (const g in L.auto) if (L.auto[g] && !shown.has(g)) items.push([g, 0]);
  for (const [g, q] of items) {
    const p = sellPrice(g, Math.max(q, 1)) * T(lid).sell;
    h += `<div style="padding:8px 0;border-bottom:1px solid var(--line)">
      <div class="row"><div class="grow"><b>${G[g].n}</b> <span class="mut">· ${money(price(g) * T(lid).sell)}/szt.</span></div><div class="q"><b>${qty(q)}</b></div></div>
      <div class="btns">
        <button class="btn s g" data-a="sell" data-l="${lid}" data-g="${g}" data-f=".5" ${q < 1 ? 'disabled' : ''}>Sprzedaj ½</button>
        <button class="btn s g" data-a="sell" data-l="${lid}" data-g="${g}" data-f="1" ${q < 1 ? 'disabled' : ''}>Wszystko ≈ ${money(p * Math.floor(q))}</button>
        <button class="toggle ${L.auto[g] ? 'on' : ''}" data-a="auto" data-l="${lid}" data-g="${g}">Auto ${L.auto[g] ? 'wł.' : 'wył.'}</button>
      </div></div>`;
  }
  h += `</div>`;
  const bq = Math.max(1, Math.floor(ui.buyQ) || 1), bc = buyPrice(ui.buyG, bq) * bq;
  h += `<h2>Kup na rynku → ${l.n}</h2><div class="card"><div class="grid2">
    <div><label class="f" for="buyG">Towar</label><select id="buyG" data-in="buyG">${GK.map(g => `<option value="${g}" ${g === ui.buyG ? 'selected' : ''}>${G[g].n}</option>`).join('')}</select></div>
    <div><label class="f" for="buyQ">Ilość</label><input id="buyQ" data-in="buyQ" type="number" inputmode="numeric" min="1" value="${bq}"></div></div>
    <div class="btns"><button class="btn p" data-a="buy" data-l="${lid}" ${bc > S.cash ? 'disabled' : ''}>Kup za ${money(bc)}</button><span class="mut small" style="align-self:center">marża rynku 15%</span></div></div>`;
  h += `<h2>Ceny rynkowe (ostatnie 2 dni)</h2><div class="card"><table><thead><tr><th>Towar</th><th class="n">Cena</th><th class="n">Zmiana</th><th></th></tr></thead><tbody>
    ${GK.map(g => { const c = chg(g); return `<tr><td>${G[g].n}</td><td class="n">${money(price(g))}</td><td class="n ${c >= 0 ? 'pos' : 'neg'}">${c >= 0 ? '+' : ''}${c.toFixed(1).replace('.', ',')}%</td><td>${spark([...S.m[g].h, price(g)])}</td></tr>`; }).join('')}
    </tbody></table></div>`;
  return h;
}

// formularz wysyłki (statek albo pojazd)
function sendForm(kind, u, dests, cap, hrsF, feeF) {
  const st = ui[kind], f = st[u.id] || (st[u.id] = {});
  if (!dests.includes(f.to)) f.to = dests[0];
  const inv = (S.L[u.at] || newLoc()).inv, goods = Object.keys(inv).filter(g => inv[g] >= 1);
  if (!f.gs ? !goods.includes(f.g) : (f.g && !goods.includes(f.g))) f.g = f.gs ? '' : (goods[0] || '');
  const maxQ = f.g ? Math.min(cap, Math.floor(inv[f.g])) : 0;
  const q = f.g ? clamp(Math.floor(f.q ?? maxQ), 0, maxQ) : 0;
  const hrs = hrsF(f.to), fee = feeF(f.to, q);
  return `<div class="grid2"><div><label class="f">Cel</label><select data-in="${kind}" data-s="${u.id}" data-k="to">${dests.map(d => `<option value="${d}" ${d === f.to ? 'selected' : ''}>${LOC[d].n} · ${kmTxt(km(u.at, d))}</option>`).join('')}</select></div>
    <div><label class="f">Ładunek</label><select data-in="${kind}" data-s="${u.id}" data-k="g"><option value="">— pusty —</option>${goods.map(g => `<option value="${g}" ${g === f.g ? 'selected' : ''}>${G[g].n} (${qty(inv[g])})</option>`).join('')}</select></div></div>
    ${f.g ? `<label class="f">Ilość (max ${maxQ})</label><input type="number" inputmode="numeric" data-in="${kind}" data-s="${u.id}" data-k="q" value="${q}" min="0" max="${maxQ}">` : ''}
    <div class="btns"><button class="btn p" data-a="${kind === 'sf' ? 'send' : 'drive'}" data-id="${u.id}" ${S.cash < fee ? 'disabled' : ''}>Wyślij · ${hrs} h · ${money(fee)}</button></div>`;
}
function vLogistyka() {
  let h = '';
  // --- garaże i pojazdy ---
  const gars = Object.keys(S.L).filter(l => S.L[l].gar);
  h += `<h2>Garaże i pojazdy (${S.veh.length})</h2>`;
  if (!gars.length) h += `<div class="card mut">Nie masz garażu. Zbuduj go w zakładce Budowa w wybranej miejscowości (zajmuje 1 działkę). Pojazdy wożą towar między miejscowościami na tym samym lądzie.</div>`;
  else {
    if (!gars.includes(ui.garAt)) ui.garAt = gars[0];
    if (!VEH[ui.vehK]) ui.vehK = 'van';
    const vk = VEH[ui.vehK], full = garUsed(S, ui.garAt) >= garCap(S, ui.garAt);
    h += `<div class="card"><div class="grid2">
      <div><label class="f">Garaż</label><select data-in="garAt">${gars.map(l => `<option value="${l}" ${l === ui.garAt ? 'selected' : ''}>${LOC[l].n} (${garUsed(S, l)}/${garCap(S, l)})</option>`).join('')}</select></div>
      <div><label class="f">Pojazd</label><select data-in="vehK">${Object.entries(VEH).map(([k, v]) => `<option value="${k}" ${k === ui.vehK ? 'selected' : ''}>${v.n}</option>`).join('')}</select></div></div>
      <div class="flow">${vk.n}: ładowność ${vk.cap} szt. · ${vk.spd} km/h · paliwo ${String(vk.fuel).replace('.', ',')} $/km</div>
      <div class="btns"><button class="btn p" data-a="veh" ${S.cash < vk.cost || full ? 'disabled' : ''}>${full ? 'Garaż pełny — rozbuduj' : `Kup — ${money(vk.cost)}`}</button></div></div>`;
  }
  for (const v of S.veh) {
    const k = VEH[v.k];
    if (v.st === 'go') {
      const p = clamp(1 - (v.eta - S.hour) / v.dur, 0, 1);
      h += `<div class="card"><div class="row"><b class="grow">${k.n} #${v.id}</b><span class="mut small">${v.eta - S.hour} h do celu</span></div>
        <div class="flow">${LOC[v.from].n} → ${LOC[v.to].n}${v.q ? ` · ${qty(v.q)} ${G[v.g].n}` : ' · pusty'}</div><div class="bar y"><i style="width:${p * 100}%"></i></div></div>`;
      continue;
    }
    const dests = LOCS.filter(l => l.ld === LOC[v.at].ld && l.id !== v.at).map(l => l.id).sort((a, b) => (S.L[b] ? 1 : 0) - (S.L[a] ? 1 : 0) || km(v.at, a) - km(v.at, b));
    h += `<div class="card"><div class="row"><b class="grow">${k.n} #${v.id}</b><span class="mut small">stoi w: ${LOC[v.at].n}</span></div>
      ${sendForm('vf', v, dests, k.cap, to => vehHours(S, v.k, v.at, to), to => vehFee(v.k, v.at, to))}</div>`;
  }
  // --- porty ---
  const coast = LOCS.filter(l => l.port && S.c[l.c]);
  h += `<h2>Porty</h2><div class="card">${coast.map(l => { const L = S.L[l.id];
    return `<div class="row" style="padding:6px 0"><div class="grow">${l.n} <span class="mut small">${CN[l.c].n}</span></div>${L && L.port ? '<span class="pos small">Port czynny</span>' :
      `<button class="btn s p" data-a="port" data-l="${l.id}" ${S.cash < PORT_COST ? 'disabled' : ''}>Zbuduj — ${money(PORT_COST)}</button>`}</div>`; }).join('')}</div>`;
  // --- statki ---
  const ports = Object.keys(S.L).filter(l => S.L[l].port);
  h += `<h2>Flota (${S.ships.length})</h2>`;
  if (ports.length) {
    if (!ports.includes(ui.shipAt)) ui.shipAt = ports[0];
    h += `<div class="card"><div class="row"><div class="grow"><select data-in="shipAt">${ports.map(l => `<option value="${l}" ${l === ui.shipAt ? 'selected' : ''}>Port: ${LOC[l].n}</option>`).join('')}</select></div>
      <button class="btn p" data-a="ship" ${S.cash < SHIP_COST ? 'disabled' : ''}>Kup statek — ${money(SHIP_COST)}</button></div>
      <div class="mut small" style="margin-top:6px">Ładowność ${SHIP_CAP} szt. Port wymagany w obu miejscach.</div></div>`;
  } else h += `<div class="card mut">Zbuduj port, żeby kupić statek. Statki wożą towar między portami (inne kontynenty, wyspy).</div>`;
  for (const sh of S.ships) {
    if (sh.st === 'sail') {
      const p = clamp(1 - (sh.eta - S.hour) / sh.dur, 0, 1);
      h += `<div class="card"><div class="row"><b class="grow">Statek #${sh.id}</b><span class="mut small">${sh.eta - S.hour} h do celu</span></div>
        <div class="flow">${LOC[sh.from].n} → ${LOC[sh.to].n}${sh.q ? ` · ${qty(sh.q)} ${G[sh.g].n}` : ' · pusty'}</div><div class="bar"><i style="width:${p * 100}%"></i></div></div>`;
      continue;
    }
    const dests = ports.filter(l => l !== sh.at);
    h += `<div class="card"><div class="row"><b class="grow">Statek #${sh.id}</b><span class="mut small">w porcie: ${LOC[sh.at].n}</span></div>
      ${dests.length ? sendForm('sf', sh, dests, SHIP_CAP, to => shipHours(S, sh.at, to), (to, q) => shipFee(sh.at, to, q)) : '<div class="mut small" style="margin-top:6px">Zbuduj drugi port, żeby wysłać statek.</div>'}</div>`;
  }
  return h;
}

function vRanking() {
  const r = ranking(), day = Math.floor((S.hour % SEASON_H) / 24) + 1;
  let h = `<h2>Sezon ${S.season} · dzień ${day}/30 · nagrody: ${SEASON_PP.slice(0, 3).join(' / ')} pkt za podium</h2>
    <div class="card"><table><thead><tr><th>#</th><th>Firma</th><th class="n">Wartość</th></tr></thead><tbody>
    ${r.map((x, i) => `<tr class="${x.me ? 'me' : ''}"><td>${i + 1}</td><td>${esc(x.n)}</td><td class="n">${money(x.w)}</td></tr>`).join('')}
    </tbody></table></div>`;
  if (S.lastSeason) h += `<div class="card mut">Poprzedni sezon (${S.lastSeason.season}): miejsce ${S.lastSeason.pos}, +${S.lastSeason.pp} pkt prestiżu.</div>`;
  h += `<h2>Prestiż: ${S.pp} pkt do wydania</h2>`;
  for (const [k, p] of Object.entries(PERKS)) {
    const l = S.perk[k], cost = l + 1, max = l >= 10;
    h += `<div class="card"><div class="row"><div class="grow"><b>${p.n}</b> <span class="mut">poz. ${l}/10</span><div class="flow">${p.d}</div></div>
      <button class="btn s p" data-a="perk" data-k="${k}" ${max || S.pp < cost ? 'disabled' : ''}>${max ? 'MAX' : cost + ' pkt'}</button></div></div>`;
  }
  return h;
}

const VIEWS = { firma: vFirma, budowa: vBudowa, magazyn: vMagazyn, logistyka: vLogistyka, ranking: vRanking };
function renderTop() {
  $('coName').textContent = S.name;
  document.documentElement.style.setProperty('--me', S.color);
  $('clock').textContent = tstr(S.hour) + ' · Sezon ' + S.season;
  $('cash').textContent = money(S.cash);
  $('cash').style.color = S.cash < 0 ? 'var(--bad)' : '';
  $('inc').textContent = (S.inc >= 0 ? '+' : '') + money(S.inc) + '/h';
  $('seasonFill').style.width = ((S.hour % SEASON_H) / SEASON_H * 100) + '%';
}
function render(force) {
  renderTop();
  const ae = document.activeElement;
  if (ui.gesture || (!force && ae && (ae.tagName === 'INPUT' || ae.tagName === 'SELECT'))) return;
  $('view').innerHTML = VIEWS[ui.tab]();
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.tab === ui.tab));
  renderUpd(); renderTut();
}
function renderUpd() {
  $('upd').innerHTML = ui.update ? `<div class="updbar"><div class="grow" style="flex:1"><b>Nowa wersja ${esc(ui.update.v)}</b><div class="mut small">Masz ${esc(VERSION)}</div></div><button class="btn p s" data-a="getUpd">Pobierz</button></div>` : '';
}
let toastT;
function toast(t) { const el = $('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2200); }

function settings() {
  $('modal').hidden = false;
  $('modal').innerHTML = `<div class="sheet"><div class="row"><b class="grow" style="font-size:17px">Ustawienia</b><button class="btn s" data-a="close">Zamknij</button></div>
    <label class="f" for="ceo">Imię prezesa</label><input id="ceo" maxlength="20" value="${esc(S.ceo)}">
    <label class="f" for="nm">Nazwa firmy</label><div class="row"><input id="nm" maxlength="24" value="${esc(S.name)}"><button class="btn p" data-a="name">Zapisz</button></div>
    <h2>Aktualizacje</h2><div class="card"><div class="row"><div class="grow">Wersja: <b>${esc(VERSION)}</b><div class="mut small">Źródło: github.com/${REPO}</div></div><button class="btn" data-a="chkUpd">Sprawdź</button></div></div>
    <h2>Gra</h2><div class="card"><div class="mut small">1 godzina gry = ${HOUR_MS / 1000} s. Gra liczy się też offline (do 10 dni gry).</div>
    <div class="btns"><button class="btn" data-a="tutAgain">Powtórz samouczek</button><button class="btn" data-a="reset" style="${ui.resetArm ? 'background:var(--bad);color:#fff' : ''}">${ui.resetArm ? 'Na pewno? Kliknij ponownie' : 'Zacznij od nowa'}</button></div></div></div>`;
}

// ================== AKCJE ==================
function act(a, d) {
  switch (a) {
    case 'tab': ui.tab = d.t; window.scrollTo(0, 0); break;
    case 'bc': ui.bc = d.c; break;
    case 'bl': {
      ui.bl = d.l; ui.bc = LOC[d.l].c;
      const z = zOf(ui.bc); if (z.k > 1 && !d.fromMap) { const [x, y] = MAPS[ui.bc].pts[d.l]; zoomAt(ui.bc, z.k, x, y); }
      break;
    }
    case 'zoom': {
      const cid = ui.bc, z = zOf(cid), m = MAPS[cid];
      if (+d.z === 0) { z.k = 1; z.x = z.y = 0; break; }
      const [sx, sy] = z.k === 1 && +d.z > 0 && MAPS[cid].pts[ui.bl] ? MAPS[cid].pts[ui.bl] : [z.x + m.w / z.k / 2, z.y + m.h / z.k / 2];
      zoomAt(cid, z.k * (+d.z > 0 ? 2 : .5), sx, sy); break;
    }
    case 'ml': ui.ml = d.l; break;
    case 'goBuild': ui.bc = d.c; ui.tab = 'budowa'; break;
    case 'branch':
      if (S.cash < BRANCH_COST || S.c[d.c]) return;
      S.cash -= BRANCH_COST; S.c[d.c] = {}; ui.bl = CAP[d.c]; addNews(S, `Nowy oddział: ${CN[d.c].n}`); break;
    case 'build': {
      const def = B[d.b], t = T(d.l), cost = def.cost + t.land; if (S.cash < cost || free(S, d.l) < 1) return;
      S.cash -= cost; ensureL(S, d.l).bld.push({ id: S.nid++, t: d.b, l: 1, st: '', land: t.land }); toast(`${def.n} — ${LOC[d.l].n}`); break;
    }
    case 'up': {
      const b = S.L[d.l].bld.find(x => x.id == d.id), c = upCost(b); if (S.cash < c) return;
      S.cash -= c; b.l++; toast(`${B[b.t].n}: poziom ${b.l}`); break;
    }
    case 'demo': {
      const L = S.L[d.l], i = L.bld.findIndex(x => x.id == d.id); if (i < 0) return;
      S.cash += bldValue(L.bld[i]); L.bld.splice(i, 1); break;
    }
    case 'expand': {
      const L = ensureL(S, d.l), c = xCost(L, d.l); if (S.cash < c || L.x >= T(d.l).maxX) return;
      S.cash -= c; L.x++; toast(`${LOC[d.l].n}: nowe działki`); break;
    }
    case 'garage': {
      const c = GARAGE_COST + T(d.l).land; if (S.cash < c || free(S, d.l) < 1) return;
      S.cash -= c; ensureL(S, d.l).gar = 1; ui.garAt = d.l; toast(`Garaż — ${LOC[d.l].n}`); break;
    }
    case 'garUp': { const L = S.L[d.l], c = garUp(L); if (S.cash < c) return; S.cash -= c; L.gar++; toast(`Garaż poz. ${L.gar}`); break; }
    case 'veh': {
      const k = VEH[ui.vehK]; if (!k || !ui.garAt || S.cash < k.cost || garUsed(S, ui.garAt) >= garCap(S, ui.garAt)) return;
      S.cash -= k.cost; S.veh.push({ id: S.nid++, k: ui.vehK, home: ui.garAt, at: ui.garAt, st: 'idle', from: null, to: null, g: null, q: 0, eta: 0, dur: 1 });
      toast(`${k.n} w garażu: ${LOC[ui.garAt].n}`); break;
    }
    case 'sell': {
      const q = Math.floor((S.L[d.l].inv[d.g] || 0) * +d.f); const r = sell(S, d.l, d.g, q);
      if (r) toast(`Sprzedano ${qty(q)} ${G[d.g].n} za ${money(r)}`); break;
    }
    case 'auto': { const L = S.L[d.l]; L.auto[d.g] = !L.auto[d.g]; if (!L.auto[d.g]) delete L.auto[d.g]; break; }
    case 'buy': {
      const q = Math.max(1, Math.floor(ui.buyQ) || 1), c = buy(S, d.l, ui.buyG, q);
      toast(c ? `Kupiono ${q} ${G[ui.buyG].n} za ${money(c)}` : 'Za mało gotówki'); break;
    }
    case 'port': if (S.cash < PORT_COST) return; S.cash -= PORT_COST; ensureL(S, d.l).port = true; addNews(S, `Port otwarty: ${LOC[d.l].n}`); break;
    case 'ship':
      if (S.cash < SHIP_COST || !ui.shipAt) return;
      S.cash -= SHIP_COST; S.ships.push({ id: S.nid++, st: 'idle', at: ui.shipAt, to: null, from: null, g: null, q: 0, eta: 0, dur: 1 }); toast('Nowy statek w porcie'); break;
    case 'send': case 'drive': {
      const isShip = a === 'send', list = isShip ? S.ships : S.veh, u = list.find(x => x.id == d.id);
      const f = (isShip ? ui.sf : ui.vf)[d.id] || {}; if (!u || u.st !== 'idle' || !f.to) return;
      const cap = isShip ? SHIP_CAP : VEH[u.k].cap, inv = ensureL(S, u.at).inv;
      const q = f.g ? clamp(Math.floor(f.q ?? Math.min(cap, inv[f.g] || 0)), 0, Math.min(cap, Math.floor(inv[f.g] || 0))) : 0;
      const fee = isShip ? shipFee(u.at, f.to, q) : vehFee(u.k, u.at, f.to); if (S.cash < fee) return;
      S.cash -= fee;
      if (q) { inv[f.g] -= q; if (inv[f.g] < 1e-6) delete inv[f.g]; }
      const dur = isShip ? shipHours(S, u.at, f.to) : vehHours(S, u.k, u.at, f.to);
      Object.assign(u, { st: isShip ? 'sail' : 'go', from: u.at, to: f.to, g: q ? f.g : null, q, eta: S.hour + dur, dur });
      delete (isShip ? ui.sf : ui.vf)[d.id]; toast(`${isShip ? 'Statek' : VEH[u.k].n} #${u.id} w drodze (${dur} h)`); break;
    }
    case 'perk': { const c = S.perk[d.k] + 1; if (S.pp < c || S.perk[d.k] >= 10) return; S.pp -= c; S.perk[d.k]++; break; }
    case 'settings': ui.resetArm = false; settings(); return;
    case 'close': $('modal').hidden = true; return;
    case 'name': { const v = $('nm').value.trim().slice(0, 24), c = $('ceo').value.trim().slice(0, 20); if (v) S.name = v; S.ceo = c; $('modal').hidden = true; break; }
    case 'tutAgain': S.tut.step = 0; ui.tab = 'firma'; $('modal').hidden = true; break;
    case 'tutNext': { const st = TUT[S.tut.step]; if (st && st.fin && !S.tut.rew) { S.tut.rew = true; S.cash += 5000; toast('+$5 tys. za samouczek'); } S.tut.step++; break; }
    case 'tutSkip': S.tut.step = TUT.length; break;
    case 'wzSet':
      if (d.k === 'hq') { wz.hq = d.v; wz.hl = CAP[d.v]; }
      else wz[d.k] = d.k === 'diff' ? +d.v : d.k === 'tut' ? d.v === '1' : d.v;
      renderWiz(); return;
    case 'wzBack': wz.step = Math.max(0, wz.step - 1); renderWiz(); return;
    case 'wzNext':
      if (wz.step === 0) {
        wz.ceo = wz.ceo.trim(); wz.name = wz.name.trim();
        if (!wz.ceo || !wz.name) { $('wzErr').textContent = 'Wpisz imię prezesa i nazwę firmy.'; return; }
      }
      if (wz.step < 3) { wz.step++; renderWiz(); $('wiz').scrollTo(0, 0); return; }
      S = newState({ done: true, ceo: wz.ceo, name: wz.name, hl: wz.hl, color: wz.color, diff: wz.diff, tut: wz.tut });
      ui.bl = ui.ml = S.hl; ui.bc = S.hq; ui.tab = 'firma'; acc = 0; prev = performance.now(); renderWiz(); break;
    case 'reset':
      if (!ui.resetArm) { ui.resetArm = true; settings(); return; }
      S = newState(); Object.assign(wz, { step: 0, ceo: '', name: '' }); ui.resetArm = false; $('modal').hidden = true; save(); renderWiz(); break;
    case 'chkUpd': checkUpdate(true); return;
    case 'getUpd': openUrl(ui.update.url); return;
  }
  save(); render(true);
}
document.addEventListener('click', e => {
  if (gs.block && e.target.closest('.lmap')) return;
  const t = e.target.closest('[data-a],[data-tab]');
  if (!t) { if (e.target.id === 'modal') $('modal').hidden = true; return; }
  if (t.dataset.tab) { ui.tab = t.dataset.tab; window.scrollTo(0, 0); render(true); return; }
  if (t.disabled) return;
  act(t.dataset.a, t.dataset);
});
document.addEventListener('change', e => {
  const t = e.target, k = t.dataset.in; if (!k) return;
  if (k === 'buyG') ui.buyG = t.value;
  else if (k === 'buyQ') ui.buyQ = +t.value;
  else if (k === 'shipAt') ui.shipAt = t.value;
  else if (k === 'garAt') ui.garAt = t.value;
  else if (k === 'sf' || k === 'vf') { const o = ui[k], f = o[t.dataset.s] || (o[t.dataset.s] = {}); f[t.dataset.k] = t.dataset.k === 'q' ? +t.value : t.value; if (t.dataset.k === 'g') { delete f.q; f.gs = true; } }
  else if (k === 'vehK') ui.vehK = t.value;
  t.blur(); render(true);
});

// ================== AKTUALIZACJE Z GITHUB ==================
function cmpVer(a, b) {
  const pa = String(a).split('.').map(Number), pb = String(b).split('.').map(Number);
  if (pb.some(isNaN)) return 1;
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) { const x = pa[i] || 0, y = pb[i] || 0; if (x !== y) return x > y ? 1 : -1; }
  return 0;
}
async function checkUpdate(manual) {
  try {
    const r = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' }, cache: 'no-store' });
    if (!r.ok) throw new Error(r.status);
    const j = await r.json(), v = String(j.tag_name || '').replace(/^v/, '');
    const apk = (j.assets || []).find(a => a.name.endsWith('.apk'));
    if (v && cmpVer(v, VERSION) > 0) { ui.update = { v, url: apk ? apk.browser_download_url : j.html_url }; renderUpd(); if (manual) { $('modal').hidden = true; toast('Dostępna wersja ' + v); } }
    else if (manual) toast('Masz najnowszą wersję');
  } catch (e) { if (manual) toast('Nie udało się połączyć z GitHub'); }
}
function openUrl(url) {
  const P = window.Capacitor && window.Capacitor.Plugins;
  const fallback = () => { if (window.Capacitor) location.href = url; else window.open(url, '_blank'); };
  if (P && P.Browser) P.Browser.open({ url }).catch(fallback);
  else fallback();
}

// ================== PĘTLA ==================
S = load();
ui.bc = S.hq; ui.bl = ui.ml = S.hl;
if (S.setup) {
  const off = Math.min(OFFLINE_MAX_H, Math.floor((Date.now() - (S.last || Date.now())) / HOUR_MS));
  if (off > 0) {
    const c0 = S.cash;
    for (let i = 0; i < off; i++) hour(S);
    setTimeout(() => toast(`Offline minęło ${off} h gry · ${S.cash - c0 >= 0 ? '+' : ''}${money(S.cash - c0)}`), 400);
  }
}
let acc = 0, prev = performance.now(), n = 0;
function loop() {
  const now = performance.now(); acc += Math.min(now - prev, 60000); prev = now;
  if (!S.setup) { acc = 0; return; }
  let ran = false;
  while (acc >= HOUR_MS) { acc -= HOUR_MS; hour(S); ran = true; }
  if (ran) {
    if (++n % 3 === 0) save();
    if (ui.seasonEnd) { ui.seasonEnd = false; toast(`Koniec sezonu! Miejsce ${S.lastSeason.pos}, +${S.lastSeason.pp} pkt prestiżu`); }
    render(false);
  }
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) save();
  else if (S.setup) { // po powrocie dolicz czas, który minął w tle
    const off = Math.min(OFFLINE_MAX_H, Math.floor((Date.now() - S.last) / HOUR_MS));
    for (let i = 0; i < off; i++) hour(S);
    acc = 0; prev = performance.now(); save(); render(true);
  }
});
if (VERSION === 'dev') window.__xyx = { get S() { return S; }, hour: n => { for (let i = 0; i < n; i++) hour(S); render(true); } };
save(); render(true); renderWiz();
setInterval(loop, 500);
setTimeout(() => checkUpdate(false), 2000);
})();
