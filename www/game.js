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

const CONT = [
  { id: 'eu', n: 'Europa',      r: { zboze: 1.2, drewno: 1.1, wegiel: 1.2, ruda: .8,  ropa: .4,  krzem: .7,  miedz: .6 } },
  { id: 'na', n: 'Ameryka Pn.', r: { zboze: 1.3, drewno: 1.3, wegiel: 1,   ruda: 1,   ropa: 1.1, krzem: 1,   miedz: .9 } },
  { id: 'sa', n: 'Ameryka Pd.', r: { zboze: 1.1, drewno: 1.5, wegiel: .6,  ruda: 1.3, ropa: 1.2, krzem: .6,  miedz: 1.6 } },
  { id: 'af', n: 'Afryka',      r: { zboze: .7,  drewno: 1,   wegiel: .8,  ruda: 1.2, ropa: 1.5, krzem: .9,  miedz: 1.4 } },
  { id: 'as', n: 'Azja',        r: { zboze: 1,   drewno: .8,  wegiel: 1.5, ruda: 1.1, ropa: 1.4, krzem: 1.6, miedz: 1 } },
  { id: 'au', n: 'Australia',   r: { zboze: .9,  drewno: .7,  wegiel: 1.3, ruda: 1.7, ropa: .6,  krzem: 1.1, miedz: 1.2 } },
];
const CN = Object.fromEntries(CONT.map(c => [c.id, c]));
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
  ship: { n: 'Szybsze statki',      d: '+20% prędkości na poziom' },
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
const dist = (a, b) => Math.hypot(POS[a][0] - POS[b][0], POS[a][1] - POS[b][1]);
const SC = g => 3000 / Math.sqrt(G[g].p);  // skala nasycenia rynku

// ================== STAN ==================
let S, ui = { tab: 'firma', bc: 'eu', mc: 'eu', buyG: 'zboze', buyQ: 100, sf: {}, resetArm: false, update: null };

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
function newBranch() { return { bld: [], inv: {}, port: false, auto: {} }; }
function newState(o = {}) {
  const hq = o.hq || 'eu', diff = o.diff ?? 1, cash = DIFF[diff].cash;
  const m = {};
  for (const g of GK) m[g] = { sat: 0, d: rnd(.9, 1.1), h: [] };
  const s = {
    v: 1, setup: !!o.done, ceo: o.ceo || '', name: o.name || 'Moja Firma', color: o.color || COLORS[0], hq, diff,
    cash, hour: 0, last: Date.now(),
    c: { [hq]: newBranch() }, ships: [], nid: 1, m, ai: mkAI(cash, diff),
    season: 1, pp: 0, perk: { prod: 0, upk: 0, ship: 0, sell: 0 }, ev: [],
    news: [], inc: 0, upk: 0, lastSeason: null, tut: { step: o.tut === false ? 99 : 0, sold: false, rew: false },
  };
  for (const g of GK) m[g].h = Array(8).fill(price(g, s));
  addNews(s, `Start! ${s.ceo ? 'Prezes ' + s.ceo + ', masz' : 'Masz'} ${money(cash)} i siedzibę: ${CN[hq].n}.`);
  return s;
}
function load() {
  try {
    const raw = localStorage.getItem(SAVE);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.v === 1) { // starsze zapisy (0.1) – uzupełnij nowe pola
        if (s.setup === undefined) s.setup = true;
        s.hq = s.hq || 'eu'; s.color = s.color || COLORS[0]; s.diff = s.diff ?? 1; s.ceo = s.ceo || '';
        s.tut = s.tut || { step: 99, sold: true, rew: true };
        return s;
      }
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
function add(br, g, q) { br.inv[g] = (br.inv[g] || 0) + q; }

function sell(s, cid, g, q) {
  const br = s.c[cid]; q = Math.min(q, br.inv[g] || 0);
  if (q <= 0) return 0;
  const rev = sellPrice(g, q, s) * q;
  s.m[g].sat += q; br.inv[g] -= q; if (br.inv[g] < 1e-6) delete br.inv[g];
  s.cash += rev; if (s.tut) s.tut.sold = true; return rev;
}
function buy(s, cid, g, q) {
  const cost = buyPrice(g, q, s) * q;
  if (q <= 0 || cost > s.cash) return false;
  s.cash -= cost; s.m[g].sat -= q; add(s.c[cid], g, q); return cost;
}
function resF(s, cid, g) {
  let f = CN[cid].r[g] || 1;
  for (const e of s.ev) if (e.c === cid && e.g === g) f *= e.f;
  return f;
}
function bldValue(b) { const d = B[b.t]; return d.cost * (1 + (b.l - 1) * .8) * .6; }
function upCost(b) { return Math.round(B[b.t].cost * b.l * .8); }
function worth(s = S) {
  let w = s.cash;
  for (const cid in s.c) {
    const br = s.c[cid];
    if (cid !== s.hq) w += BRANCH_COST * .5;
    if (br.port) w += PORT_COST * .5;
    for (const b of br.bld) w += bldValue(b);
    for (const g in br.inv) w += br.inv[g] * price(g, s) * .8;
  }
  for (const sh of s.ships) { w += SHIP_COST * .5; if (sh.q) w += sh.q * price(sh.g, s) * .8; }
  return w;
}
function shipHours(s, a, b) { return Math.max(4, Math.round(dist(a, b) * .8 / (1 + .2 * s.perk.ship))); }
function shipFee(a, b, q) { return Math.round(dist(a, b) * 12 + q * .5); }
function addNews(s, t) { s.news.unshift({ h: s.hour, t }); s.news.length = Math.min(s.news.length, 30); }
function tstr(h) { const d = Math.floor(h / 24) + 1, hh = h % 24; return `Dzień ${d}, ${String(hh).padStart(2, '0')}:00`; }

// ================== SYMULACJA 1 GODZINY ==================
function hour(s) {
  s.hour++;
  const cash0 = s.cash;
  const prodM = 1 + .08 * s.perk.prod, upkM = Math.max(.3, 1 - .07 * s.perk.upk);
  let upk = 0;
  for (const cid in s.c) {
    const br = s.c[cid];
    for (const b of br.bld) {
      const d = B[b.t], k = b.l * prodM;
      upk += d.cost * .0012 * b.l * upkM;
      if (d.in) {
        let f = 1; const miss = [];
        for (const g in d.in) { const r = (br.inv[g] || 0) / (d.in[g] * k); if (r < 1) miss.push(G[g].n); f = Math.min(f, r); }
        if (f <= .001) { b.st = 'Stoi — brak: ' + miss.join(', '); continue; }
        for (const g in d.in) { br.inv[g] -= d.in[g] * k * f; if (br.inv[g] < 1e-6) delete br.inv[g]; }
        for (const g in d.out) add(br, g, d.out[g] * k * f);
        b.st = f < .999 ? `Praca ${Math.round(f * 100)}% — mało: ${miss.join(', ')}` : '';
      } else {
        for (const g in d.out) add(br, g, d.out[g] * k * resF(s, cid, g));
        b.st = '';
      }
    }
    if (br.port) upk += 30 * upkM;
    for (const g in br.auto) if (br.auto[g] && (br.inv[g] || 0) >= 1) sell(s, cid, g, Math.floor(br.inv[g]));
  }
  s.cash -= upk; s.upk = upk;
  // statki
  for (const sh of s.ships) if (sh.st === 'sail' && s.hour >= sh.eta) {
    if (sh.q) add(s.c[sh.to], sh.g, sh.q);
    addNews(s, `Statek #${sh.id} dopłynął do: ${CN[sh.to].n}` + (sh.q ? ` (${qty(sh.q)} ${G[sh.g].n})` : ''));
    Object.assign(sh, { st: 'idle', at: sh.to, to: null, g: null, q: 0 });
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
const hasB = t => Object.values(S.c).some(br => br.bld.some(b => b.t === t));
const hqInv = g => (S.c[S.hq] && S.c[S.hq].inv[g]) || 0;
const TUT = [
  { t: 'Witaj, prezesie!', d: () => `${esc(S.name)} startuje w: ${CN[S.hq].n}. Cel gry: zarabiać, budować coraz bardziej zaawansowane łańcuchy produkcji i wygrać sezon w rankingu. Pokażę Ci podstawy w kilku krokach.`, next: true },
  { t: 'Zakładka Budowa', d: 'Wszystkie zakłady stawiasz w zakładce Budowa. Otwórz ją.', sel: () => ['[data-tab=budowa]'], done: () => ui.tab === 'budowa' },
  { t: 'Pierwsza farma', d: 'Farma produkuje zboże — najtańszy surowiec. Kliknij cenę przy Farmie, żeby ją zbudować.',
    sel: () => ['[data-a=build][data-b=farma]', `[data-a=bc][data-c=${S.hq}]`, '[data-tab=budowa]'], done: () => hasB('farma') },
  { t: 'Młyn', d: 'Młyn przerabia 10 zboża na 8 mąki, a mąka jest ponad 3× droższa. Tak działają łańcuchy produkcji. Zbuduj Młyn.',
    sel: () => ['[data-a=build][data-b=mlyn]', `[data-a=bc][data-c=${S.hq}]`, '[data-tab=budowa]'], done: () => hasB('mlyn') },
  { t: 'Produkcja trwa', d: () => `Zakłady pracują same: 1 godzina gry = 4 s. Każdy ma też koszt utrzymania co godzinę. Poczekaj na mąkę: ${qty(Math.min(5, hqInv('maka')))} / 5.`,
    done: () => hqInv('maka') >= 5 || S.tut.sold },
  { t: 'Rynek', d: 'Mąka gotowa! Otwórz zakładkę Rynek.', sel: () => ['[data-tab=magazyn]'], done: () => ui.tab === 'magazyn' },
  { t: 'Sprzedaż', d: 'Sprzedaj mąkę przyciskiem „Wszystko”. Uwaga: im więcej sprzedajesz naraz, tym niższa cena — rynek się nasyca i odbija z czasem.',
    sel: () => ['[data-a=sell][data-g=maka][data-f="1"]', `[data-a=mc][data-c=${S.hq}]`, '[data-tab=magazyn]'], done: () => S.tut.sold },
  { t: 'Auto‑sprzedaż', d: 'Włącz „Auto” przy mące. Towar będzie sprzedawany co godzinę, także gdy gra jest zamknięta.',
    sel: () => ['[data-a=auto][data-g=maka]', `[data-a=mc][data-c=${S.hq}]`, '[data-tab=magazyn]'], done: () => !!(S.c[S.hq].auto || {}).maka },
  { t: 'Uważaj na surowce', d: 'Nie włączaj auto‑sprzedaży zboża, bo młyn stanie. Zakład bez surowców pokazuje czerwony napis „Stoi — brak”. Brakujące surowce możesz dokupić na rynku (marża 15%).', next: true },
  { t: 'Ulepszenia', d: 'W Budowie ulepszasz zakłady: więcej produkcji, ale też większe zużycie surowców i koszty. Następny krok: Piekarnia (mąka → chleb).', next: true, sel: () => ['[data-tab=budowa]'] },
  { t: 'Świat i statki', d: 'Każdy kontynent ma inne bonusy surowców. Otwórz tam oddział, postaw porty po obu stronach i przewoź towary statkami do swoich fabryk.', next: true, sel: () => ['[data-tab=logistyka]'] },
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
const wz = { step: 0, ceo: '', name: '', hq: 'eu', color: COLORS[0], diff: 1, tut: true };
function renderWiz() {
  const el = $('wiz');
  if (S.setup) { el.hidden = true; return; }
  el.hidden = false;
  const dots = [0, 1, 2, 3].map(i => `<i class="${i <= wz.step ? 'on' : ''}"></i>`).join('');
  let b = '';
  if (wz.step === 0) {
    b = `<div class="wz-logo"><svg viewBox="0 0 64 64" width="72" height="72"><rect x="6" y="30" width="12" height="28" rx="2" fill="#e0823f"/><rect x="26" y="18" width="12" height="40" rx="2" fill="#4aa3ff"/><rect x="46" y="6" width="12" height="52" rx="2" fill="#3fcf7f"/></svg></div>
      <h1>XyxWord</h1><p class="mut">Zbuduj imperium gospodarcze: od farmy i kopalni do fabryk komputerów i samochodów. Rywalizuj z konkurencją w sezonowym rankingu.</p>
      <label class="f" for="wzCeo">Imię prezesa</label><input id="wzCeo" data-wz="ceo" maxlength="20" placeholder="np. Mati" value="${esc(wz.ceo)}">
      <label class="f" for="wzName">Nazwa firmy</label><input id="wzName" data-wz="name" maxlength="24" placeholder="np. Mati Holding" value="${esc(wz.name)}">
      <div id="wzErr" class="warn"></div>`;
  } else if (wz.step === 1) {
    b = `<h1>Siedziba firmy</h1><p class="mut">Tu zaczynasz. Każdy kontynent ma inne bonusy do wydobycia surowców. Inne kontynenty otworzysz później.</p>
      ${CONT.map(c => { const bon = Object.entries(c.r).filter(([, v]) => v >= 1.2).sort((a, b) => b[1] - a[1]);
        return `<button class="wz-opt ${wz.hq === c.id ? 'on' : ''}" data-a="wzSet" data-k="hq" data-v="${c.id}"><b>${c.n}</b><span>${bon.map(([g, v]) => `${G[g].n} ×${String(v).replace('.', ',')}`).join(' · ') || 'zrównoważony'}</span></button>`; }).join('')}`;
  } else if (wz.step === 2) {
    b = `<h1>Styl i trudność</h1><label class="f">Kolor firmy</label><div class="sw">${COLORS.map(c => `<button class="${wz.color === c ? 'on' : ''}" style="background:${c}" data-a="wzSet" data-k="color" data-v="${c}" aria-label="Kolor ${c}"></button>`).join('')}</div>
      <label class="f">Poziom trudności</label>
      ${DIFF.map((d, i) => `<button class="wz-opt ${wz.diff === i ? 'on' : ''}" data-a="wzSet" data-k="diff" data-v="${i}"><b>${d.n}</b><span>${d.d}</span></button>`).join('')}`;
  } else {
    b = `<h1>Gotowe do startu</h1>
      <div class="card"><div class="row"><span class="dot" style="background:${wz.color}"></span><div class="grow"><b>${esc(wz.name)}</b><div class="mut small">Prezes: ${esc(wz.ceo)}</div></div></div>
      <table style="margin-top:8px"><tr><td>Siedziba</td><td class="n">${CN[wz.hq].n}</td></tr><tr><td>Trudność</td><td class="n">${DIFF[wz.diff].n}</td></tr><tr><td>Gotówka</td><td class="n">${money(DIFF[wz.diff].cash)}</td></tr></table></div>
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
function flowTxt(d, k, cid) {
  const o = Object.entries(d.out).map(([g, v]) => `<em>${qty(v * k * (d.in ? 1 : (cid ? resF(S, cid, g) : 1)))}</em> ${G[g].n}`).join(', ');
  if (!d.in) return `→ ${o} /h`;
  return Object.entries(d.in).map(([g, v]) => `${qty(v * k)} ${G[g].n}`).join(' + ') + ` → ${o} /h`;
}
function chips(sel, act, onlyOwn) {
  return `<div class="chips">${CONT.filter(c => !onlyOwn || S.c[c.id]).map(c =>
    `<button class="${c.id === sel ? 'on' : ''} ${S.c[c.id] ? 'own' : ''}" data-a="${act}" data-c="${c.id}">${c.n}</button>`).join('')}</div>`;
}

function vFirma() {
  const r = ranking(), pos = r.findIndex(x => x.me) + 1;
  const day = Math.floor((S.hour % SEASON_H) / 24) + 1;
  const nb = Object.values(S.c).reduce((a, b) => a + b.bld.length, 0);
  let h = '';
  if (!nb && S.tut.step >= TUT.length) h += `<div class="card hint"><b>Jak zacząć</b><div class="mut" style="margin-top:4px">Wejdź w <b>Budowa</b>, postaw Farmę (zboże) i Młyn (mąka), potem Piekarnię. W <b>Rynek</b> sprzedawaj towary albo włącz auto‑sprzedaż. Surowce z innych kontynentów przewozisz statkami.</div><div class="btns"><button class="btn p" data-a="tab" data-t="budowa">Do budowy</button></div></div>`;
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
function mapSvg() {
  let lines = '', ships = '', dots = '';
  for (const sh of S.ships) {
    if (sh.st !== 'sail') continue;
    const [x1, y1] = POS[sh.from], [x2, y2] = POS[sh.to];
    const p = clamp(1 - (sh.eta - S.hour) / sh.dur, 0, 1);
    lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#4aa3ff" stroke-width=".4" stroke-dasharray="1.2 1" opacity=".7"/>`;
    ships += `<circle cx="${x1 + (x2 - x1) * p}" cy="${y1 + (y2 - y1) * p}" r="1.4" fill="#4aa3ff"/>`;
  }
  for (const c of CONT) {
    const [x, y] = POS[c.id], own = !!S.c[c.id], br = S.c[c.id];
    const n = own ? br.bld.length : 0;
    dots += `<g data-a="goBuild" data-c="${c.id}" style="cursor:pointer">
      <circle cx="${x}" cy="${y}" r="${own ? 4 + Math.min(n, 8) * .5 : 3}" fill="${own ? S.color : '#2d323b'}" stroke="${own ? '#fff' : '#4a525e'}" stroke-width=".5"/>
      ${own && br.port ? `<rect x="${x + 3.5}" y="${y - 5.5}" width="3" height="3" rx=".6" fill="#4aa3ff"/>` : ''}
      <text x="${x}" y="${y + 9}" text-anchor="middle" font-size="3.6" fill="${own ? '#eef0f3' : '#9aa3af'}">${c.n}</text>
      ${own ? `<text x="${x}" y="${y + 1.3}" text-anchor="middle" font-size="3.4" font-weight="700" fill="#1b1006">${n}</text>` : ''}
    </g>`;
  }
  const land = `<g fill="#1f2b35" opacity=".9">
    <path d="M8 14q10-8 24-4 6 8 0 16-6 6-12 4-10-4-12-16Z"/><path d="M26 44q8-2 12 6 2 12-6 22-4-2-6-10-4-10 0-18Z"/>
    <path d="M44 14q10-6 18 0-2 8-10 12-8 0-8-12Z"/><path d="M45 40q10-4 16 4 2 12-6 20-6 2-8-8-4-8-2-16Z"/>
    <path d="M62 12q18-6 30 6-2 14-14 18-12 0-16-8-2-8 0-16Z"/><path d="M78 62q8-4 14 2 0 8-8 10-8 0-6-12Z"/></g>`;
  return `<div class="map"><svg viewBox="0 0 100 80">${land}${lines}${dots}${ships}</svg></div>`;
}

function vBudowa() {
  const cid = ui.bc, br = S.c[cid], c = CN[cid];
  let h = chips(cid, 'bc');
  if (!br) {
    return h + `<div class="card"><div class="bname">${c.n}</div>
      <div class="mut" style="margin:4px 0 8px">Nie masz tu oddziału. Bonusy surowców: ${Object.entries(c.r).filter(([, v]) => v >= 1.2).map(([g, v]) => `${G[g].n} ×${String(v).replace('.', ',')}`).join(', ') || 'brak'}.</div>
      <button class="btn p" data-a="branch" data-c="${cid}" ${S.cash < BRANCH_COST ? 'disabled' : ''}>Otwórz oddział — ${money(BRANCH_COST)}</button></div>`;
  }
  h += `<h2>Twoje zakłady — ${c.n}</h2>`;
  if (!br.bld.length) h += `<div class="card mut">Brak zakładów. Zbuduj coś poniżej.</div>`;
  for (const b of br.bld) {
    const d = B[b.t], k = b.l * (1 + .08 * S.perk.prod), uc = upCost(b);
    h += `<div class="card"><div class="row"><div class="grow"><span class="tier t${d.t}">${TIER[d.t]}</span><span class="bname">${d.n}</span> <span class="mut">poz. ${b.l}</span></div></div>
      <div class="flow">${flowTxt(d, k, cid)}</div>${b.st ? `<div class="warn">${esc(b.st)}</div>` : ''}
      <div class="btns"><button class="btn s g" data-a="up" data-c="${cid}" data-id="${b.id}" ${S.cash < uc ? 'disabled' : ''}>Ulepsz — ${money(uc)}</button>
      <button class="btn s" data-a="demo" data-c="${cid}" data-id="${b.id}">Sprzedaj za ${money(bldValue(b))}</button></div></div>`;
  }
  h += `<h2>Nowa inwestycja</h2>`;
  for (let t = 0; t < 3; t++) {
    for (const [id, d] of Object.entries(B).filter(([, d]) => d.t === t)) {
      h += `<div class="card"><div class="row"><div class="grow"><span class="tier t${t}">${TIER[t]}</span><span class="bname">${d.n}</span></div>
        <button class="btn s p" data-a="build" data-c="${cid}" data-b="${id}" ${S.cash < d.cost ? 'disabled' : ''}>${money(d.cost)}</button></div>
        <div class="flow">${flowTxt(d, 1 + .08 * S.perk.prod, cid)}</div></div>`;
    }
  }
  return h;
}

function vMagazyn() {
  if (!S.c[ui.mc]) ui.mc = 'eu';
  const cid = ui.mc, br = S.c[cid];
  let h = chips(cid, 'mc', true);
  const items = Object.entries(br.inv).filter(([, q]) => q >= .05);
  h += `<h2>Magazyn — ${CN[cid].n}</h2><div class="card">`;
  if (!items.length && !Object.values(br.auto).some(Boolean)) h += `<div class="mut">Magazyn pusty.</div>`;
  const shown = new Set(items.map(([g]) => g));
  for (const g in br.auto) if (br.auto[g] && !shown.has(g)) items.push([g, 0]);
  for (const [g, q] of items) {
    const p = sellPrice(g, Math.max(q, 1));
    h += `<div style="padding:8px 0;border-bottom:1px solid var(--line)">
      <div class="row"><div class="grow"><b>${G[g].n}</b> <span class="mut">· ${money(price(g))}/szt.</span></div><div class="q"><b>${qty(q)}</b></div></div>
      <div class="btns">
        <button class="btn s g" data-a="sell" data-c="${cid}" data-g="${g}" data-f=".5" ${q < 1 ? 'disabled' : ''}>Sprzedaj ½</button>
        <button class="btn s g" data-a="sell" data-c="${cid}" data-g="${g}" data-f="1" ${q < 1 ? 'disabled' : ''}>Wszystko ≈ ${money(p * Math.floor(q))}</button>
        <button class="toggle ${br.auto[g] ? 'on' : ''}" data-a="auto" data-c="${cid}" data-g="${g}">Auto ${br.auto[g] ? 'wł.' : 'wył.'}</button>
      </div></div>`;
  }
  h += `</div>`;
  const bq = Math.max(1, Math.floor(ui.buyQ) || 1), bc = buyPrice(ui.buyG, bq) * bq;
  h += `<h2>Kup na rynku → ${CN[cid].n}</h2><div class="card"><div class="grid2">
    <div><label class="f" for="buyG">Towar</label><select id="buyG" data-in="buyG">${GK.map(g => `<option value="${g}" ${g === ui.buyG ? 'selected' : ''}>${G[g].n}</option>`).join('')}</select></div>
    <div><label class="f" for="buyQ">Ilość</label><input id="buyQ" data-in="buyQ" type="number" inputmode="numeric" min="1" value="${bq}"></div></div>
    <div class="btns"><button class="btn p" data-a="buy" data-c="${cid}" ${bc > S.cash ? 'disabled' : ''}>Kup za ${money(bc)}</button><span class="mut small" style="align-self:center">marża rynku 15%</span></div></div>`;
  h += `<h2>Ceny rynkowe (ostatnie 2 dni)</h2><div class="card"><table><thead><tr><th>Towar</th><th class="n">Cena</th><th class="n">Zmiana</th><th></th></tr></thead><tbody>
    ${GK.map(g => { const c = chg(g); return `<tr><td>${G[g].n}</td><td class="n">${money(price(g))}</td><td class="n ${c >= 0 ? 'pos' : 'neg'}">${c >= 0 ? '+' : ''}${c.toFixed(1).replace('.', ',')}%</td><td>${spark([...S.m[g].h, price(g)])}</td></tr>`; }).join('')}
    </tbody></table></div>`;
  return h;
}

function vLogistyka() {
  let h = `<h2>Porty</h2><div class="card">`;
  for (const cid in S.c) {
    const br = S.c[cid];
    h += `<div class="row" style="padding:6px 0"><div class="grow">${CN[cid].n}</div>${br.port ? '<span class="pos small">Port czynny</span>' :
      `<button class="btn s p" data-a="port" data-c="${cid}" ${S.cash < PORT_COST ? 'disabled' : ''}>Zbuduj port — ${money(PORT_COST)}</button>`}</div>`;
  }
  h += `</div>`;
  const ports = Object.keys(S.c).filter(c => S.c[c].port);
  h += `<h2>Flota (${S.ships.length})</h2>`;
  if (ports.length) {
    if (!ports.includes(ui.shipAt)) ui.shipAt = ports[0];
    h += `<div class="card"><div class="row"><div class="grow"><select data-in="shipAt">${ports.map(c => `<option value="${c}" ${c === ui.shipAt ? 'selected' : ''}>Port: ${CN[c].n}</option>`).join('')}</select></div>
      <button class="btn p" data-a="ship" ${S.cash < SHIP_COST ? 'disabled' : ''}>Kup statek — ${money(SHIP_COST)}</button></div>
      <div class="mut small" style="margin-top:6px">Ładowność ${SHIP_CAP} szt. Port wymagany w obu miejscach.</div></div>`;
  } else h += `<div class="card mut">Zbuduj port, żeby kupić statek. Statki przewożą surowce między kontynentami.</div>`;
  for (const sh of S.ships) {
    if (sh.st === 'sail') {
      const p = clamp(1 - (sh.eta - S.hour) / sh.dur, 0, 1);
      h += `<div class="card"><div class="row"><b class="grow">Statek #${sh.id}</b><span class="mut small">${sh.eta - S.hour} h do celu</span></div>
        <div class="flow">${CN[sh.from].n} → ${CN[sh.to].n}${sh.q ? ` · ${qty(sh.q)} ${G[sh.g].n}` : ' · pusty'}</div><div class="bar"><i style="width:${p * 100}%"></i></div></div>`;
      continue;
    }
    const f = ui.sf[sh.id] || (ui.sf[sh.id] = {});
    const dests = ports.filter(c => c !== sh.at);
    if (!dests.includes(f.to)) f.to = dests[0];
    const inv = S.c[sh.at].inv, goods = Object.keys(inv).filter(g => inv[g] >= 1);
    if (f.g !== '' && !goods.includes(f.g)) f.g = goods[0] || '';
    const maxQ = f.g ? Math.min(SHIP_CAP, Math.floor(inv[f.g])) : 0;
    const q = f.g ? clamp(Math.floor(f.q ?? maxQ), 0, maxQ) : 0;
    h += `<div class="card"><div class="row"><b class="grow">Statek #${sh.id}</b><span class="mut small">w porcie: ${CN[sh.at].n}</span></div>`;
    if (!dests.length) h += `<div class="mut small" style="margin-top:6px">Zbuduj port na innym kontynencie, żeby wysłać statek.</div></div>`;
    else {
      const hrs = shipHours(S, sh.at, f.to), fee = shipFee(sh.at, f.to, q);
      h += `<div class="grid2"><div><label class="f">Cel</label><select data-in="sf" data-s="${sh.id}" data-k="to">${dests.map(c => `<option value="${c}" ${c === f.to ? 'selected' : ''}>${CN[c].n}</option>`).join('')}</select></div>
        <div><label class="f">Ładunek</label><select data-in="sf" data-s="${sh.id}" data-k="g"><option value="">— pusty —</option>${goods.map(g => `<option value="${g}" ${g === f.g ? 'selected' : ''}>${G[g].n} (${qty(inv[g])})</option>`).join('')}</select></div></div>
        ${f.g ? `<label class="f">Ilość (max ${maxQ})</label><input type="number" inputmode="numeric" data-in="sf" data-s="${sh.id}" data-k="q" value="${q}" min="0" max="${maxQ}">` : ''}
        <div class="btns"><button class="btn p" data-a="send" data-id="${sh.id}" ${S.cash < fee ? 'disabled' : ''}>Wyślij · ${hrs} h · ${money(fee)}</button></div></div>`;
    }
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
  if (!force && ae && (ae.tagName === 'INPUT' || ae.tagName === 'SELECT')) return;
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
    case 'mc': ui.mc = d.c; break;
    case 'goBuild': ui.bc = d.c; ui.tab = 'budowa'; break;
    case 'branch':
      if (S.cash < BRANCH_COST || S.c[d.c]) return;
      S.cash -= BRANCH_COST; S.c[d.c] = newBranch(); addNews(S, `Nowy oddział: ${CN[d.c].n}`); break;
    case 'build': {
      const def = B[d.b]; if (S.cash < def.cost) return;
      S.cash -= def.cost; S.c[d.c].bld.push({ id: S.nid++, t: d.b, l: 1, st: '' }); toast(def.n + ' zbudowana'); break;
    }
    case 'up': {
      const b = S.c[d.c].bld.find(x => x.id == d.id), c = upCost(b); if (S.cash < c) return;
      S.cash -= c; b.l++; toast(`${B[b.t].n}: poziom ${b.l}`); break;
    }
    case 'demo': {
      const br = S.c[d.c], i = br.bld.findIndex(x => x.id == d.id); if (i < 0) return;
      S.cash += bldValue(br.bld[i]); br.bld.splice(i, 1); break;
    }
    case 'sell': {
      const q = Math.floor((S.c[d.c].inv[d.g] || 0) * +d.f); const r = sell(S, d.c, d.g, q);
      if (r) toast(`Sprzedano ${qty(q)} ${G[d.g].n} za ${money(r)}`); break;
    }
    case 'auto': { const br = S.c[d.c]; br.auto[d.g] = !br.auto[d.g]; if (!br.auto[d.g]) delete br.auto[d.g]; break; }
    case 'buy': {
      const q = Math.max(1, Math.floor(ui.buyQ) || 1), c = buy(S, d.c, ui.buyG, q);
      toast(c ? `Kupiono ${q} ${G[ui.buyG].n} za ${money(c)}` : 'Za mało gotówki'); break;
    }
    case 'port': if (S.cash < PORT_COST) return; S.cash -= PORT_COST; S.c[d.c].port = true; addNews(S, `Port otwarty: ${CN[d.c].n}`); break;
    case 'ship':
      if (S.cash < SHIP_COST || !ui.shipAt) return;
      S.cash -= SHIP_COST; S.ships.push({ id: S.nid++, st: 'idle', at: ui.shipAt, to: null, from: null, g: null, q: 0, eta: 0, dur: 1 }); toast('Nowy statek w porcie'); break;
    case 'send': {
      const sh = S.ships.find(x => x.id == d.id), f = ui.sf[sh.id] || {}; if (!sh || sh.st !== 'idle' || !f.to) return;
      const inv = S.c[sh.at].inv;
      const q = f.g ? clamp(Math.floor(f.q ?? Math.min(SHIP_CAP, inv[f.g] || 0)), 0, Math.min(SHIP_CAP, Math.floor(inv[f.g] || 0))) : 0;
      const fee = shipFee(sh.at, f.to, q); if (S.cash < fee) return;
      S.cash -= fee;
      if (q) { inv[f.g] -= q; if (inv[f.g] < 1e-6) delete inv[f.g]; }
      const dur = shipHours(S, sh.at, f.to);
      Object.assign(sh, { st: 'sail', from: sh.at, to: f.to, g: q ? f.g : null, q, eta: S.hour + dur, dur });
      delete ui.sf[sh.id]; toast(`Statek #${sh.id} wypłynął (${dur} h)`); break;
    }
    case 'perk': { const c = S.perk[d.k] + 1; if (S.pp < c || S.perk[d.k] >= 10) return; S.pp -= c; S.perk[d.k]++; break; }
    case 'settings': ui.resetArm = false; settings(); return;
    case 'close': $('modal').hidden = true; return;
    case 'name': { const v = $('nm').value.trim().slice(0, 24), c = $('ceo').value.trim().slice(0, 20); if (v) S.name = v; S.ceo = c; $('modal').hidden = true; break; }
    case 'tutAgain': S.tut.step = 0; ui.tab = 'firma'; $('modal').hidden = true; break;
    case 'tutNext': { const st = TUT[S.tut.step]; if (st && st.fin && !S.tut.rew) { S.tut.rew = true; S.cash += 5000; toast('+$5 tys. za samouczek'); } S.tut.step++; break; }
    case 'tutSkip': S.tut.step = TUT.length; break;
    case 'wzSet': wz[d.k] = d.k === 'diff' ? +d.v : d.k === 'tut' ? d.v === '1' : d.v; renderWiz(); return;
    case 'wzBack': wz.step = Math.max(0, wz.step - 1); renderWiz(); return;
    case 'wzNext':
      if (wz.step === 0) {
        wz.ceo = wz.ceo.trim(); wz.name = wz.name.trim();
        if (!wz.ceo || !wz.name) { $('wzErr').textContent = 'Wpisz imię prezesa i nazwę firmy.'; return; }
      }
      if (wz.step < 3) { wz.step++; renderWiz(); $('wiz').scrollTo(0, 0); return; }
      S = newState({ done: true, ceo: wz.ceo, name: wz.name, hq: wz.hq, color: wz.color, diff: wz.diff, tut: wz.tut });
      ui.bc = ui.mc = S.hq; ui.tab = 'firma'; acc = 0; prev = performance.now(); renderWiz(); break;
    case 'reset':
      if (!ui.resetArm) { ui.resetArm = true; settings(); return; }
      S = newState(); Object.assign(wz, { step: 0, ceo: '', name: '' }); ui.resetArm = false; $('modal').hidden = true; save(); renderWiz(); break;
    case 'chkUpd': checkUpdate(true); return;
    case 'getUpd': openUrl(ui.update.url); return;
  }
  save(); render(true);
}
document.addEventListener('click', e => {
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
  else if (k === 'sf') { const f = ui.sf[t.dataset.s] || (ui.sf[t.dataset.s] = {}); f[t.dataset.k] = t.dataset.k === 'q' ? +t.value : t.value; if (t.dataset.k === 'g') delete f.q; }
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
ui.bc = ui.mc = S.hq;
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
