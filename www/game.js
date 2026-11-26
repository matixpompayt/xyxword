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
const LOCS_BASE = [
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
];
// pełna lista miejscowości generowana przez tools/build-maps.mjs (www/places.js); LOCS_BASE = polecane miejsca startowe
const LOCS = [];
if (window.XYX_PLACES) for (const [c, d] of Object.entries(window.XYX_PLACES)) { // format kolumnowy z places.js
  const id = d.id.split('|'), n = d.n.split('|');
  const R = window.XYX_REG || { cc: [], rg: [] };
  for (let i = 0; i < id.length; i++) LOCS.push({ id: id[i], c, n: n[i], t: d.t[i], la: d.la[i] / 1000, lo: d.lo[i] / 1000, port: d.p[i] === '1',
    ld: d.ldt[d.ld[i]], pop: d.pop[i], f: d.f[i] === '1', cc: d.cc ? R.cc[d.cc[i]] || '' : '', rg: d.rg ? d.rg[i] : -1 });
} else for (const [id, c, n, t, la, lo, port, ld] of LOCS_BASE) LOCS.push({ id, c, n, t, la, lo, port: !!port, ld: ld || c, pop: 0, f: true });
const LOC = {};
for (const l of LOCS) LOC[l.id] = l;
// ===== PAŃSTWA I REGIONY =====
const REG = (window.XYX_REG && window.XYX_REG.rg) || [];
let DN = null; try { DN = new Intl.DisplayNames(['pl'], { type: 'region' }); } catch (e) {}
const cName = cc => { if (!cc) return 'Brak państwa'; try { return (DN && DN.of(cc)) || cc; } catch (e) { return cc; } };
const flag = cc => cc && /^[A-Z]{2}$/.test(cc) ? String.fromCodePoint(...[...cc].map(ch => 0x1F1A5 + ch.charCodeAt(0))) : '🏳';
const rName = l => l && l.rg >= 0 && REG[l.rg] ? REG[l.rg][0] : '';
const EU = new Set('AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE'.split(' '));
const HI = new Set('AT BE CH CZ DE DK EE ES FI FR GB IE IS IT LU NL NO PT SE SI SK PL HR LT LV GR MT CY HU US CA AU NZ JP KR SG IL AE SA QA KW BH OM UY CL PA TW HK'.split(' '));
const MID = new Set('RU TR BR AR MX CN MY TH ZA KZ RO BG RS BY BA ME MK AL GE AM AZ MD UA CO PE EC VE DO CR CU JM BW NA GA LY DZ IR IQ JO LB TN MA EG ID PH VN IN MN TM UZ'.split(' '));
const TIERS = [ // zamożność państwa: licencja, podatek od sprzedaży, mnożnik ceny działek
  { n: 'bogate', lic: 35000, tax: .15, land: 1.3 }, { n: 'średnio zamożne', lic: 18000, tax: .10, land: 1 }, { n: 'biedne', lic: 8000, tax: .06, land: .7 }];
const tierOf = cc => HI.has(cc) ? 0 : MID.has(cc) ? 1 : 2;
const DUTY = .06; // cło od wartości towaru przy przekraczaniu granicy (poza UE)
const RAW = ['zboze', 'drewno', 'wegiel', 'ruda', 'ropa', 'krzem', 'miedz'];
const RAW2 = ['ziemniaki', 'buraki', 'rzepak', 'owoce', 'winogrona', 'chmiel', 'bawelna', 'kakao', 'kauczuk', 'gaz', 'boksyt', 'kamien', 'zloto'];
const hashS = t => { let h = 2166136261; for (const ch of t) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const CR_FIX = {
  PL: { wegiel: 1.5, zboze: 1.3, miedz: 1.3 }, DE: { wegiel: 1.2, zboze: 1.1, drewno: 1.1 }, FR: { zboze: 1.5, drewno: 1.1 }, UA: { zboze: 1.6, ruda: 1.3 },
  RU: { ropa: 1.6, drewno: 1.5, ruda: 1.3 }, NO: { ropa: 1.6, drewno: 1.2 }, SE: { ruda: 1.6, drewno: 1.5 }, FI: { drewno: 1.6 }, GB: { ropa: 1.2, wegiel: 1.1 },
  ES: { zboze: 1.1, miedz: 1.2 }, TR: { ruda: 1.2, zboze: 1.1 }, US: { ropa: 1.3, zboze: 1.5, wegiel: 1.3, krzem: 1.3 }, CA: { drewno: 1.7, ropa: 1.4, ruda: 1.3 },
  MX: { ropa: 1.3, miedz: 1.2 }, BR: { drewno: 1.6, ruda: 1.6, zboze: 1.3 }, AR: { zboze: 1.6 }, CL: { miedz: 2 }, PE: { miedz: 1.6 }, VE: { ropa: 1.7 },
  NG: { ropa: 1.7 }, ZA: { wegiel: 1.4, ruda: 1.4 }, CD: { miedz: 1.8 }, ZM: { miedz: 1.8 }, EG: { ropa: 1.2 }, DZ: { ropa: 1.5 }, LY: { ropa: 1.6 },
  CN: { wegiel: 1.7, krzem: 1.6, ruda: 1.2 }, IN: { wegiel: 1.3, zboze: 1.3 }, JP: { krzem: 1.4 }, KR: { krzem: 1.5 }, KZ: { ropa: 1.4, ruda: 1.3 },
  AU: { ruda: 1.9, wegiel: 1.5, miedz: 1.2 } };
// bonusy nowych surowców — dopisywane do państw
const CR_ADD = {
  PL: { ziemniaki: 1.4, buraki: 1.3, rzepak: 1.3, owoce: 1.3, chmiel: 1.2 }, DE: { buraki: 1.3, rzepak: 1.3, chmiel: 1.5, ziemniaki: 1.3 }, CZ: { chmiel: 1.6 },
  FR: { winogrona: 1.7, buraki: 1.3, rzepak: 1.2 }, IT: { winogrona: 1.6, owoce: 1.3 }, ES: { winogrona: 1.4, owoce: 1.5 }, PT: { winogrona: 1.4 }, GR: { owoce: 1.3 },
  UA: { buraki: 1.4, rzepak: 1.3 }, BY: { ziemniaki: 1.5 }, RU: { gaz: 1.8, zloto: 1.4 }, NO: { gaz: 1.6 }, NL: { gaz: 1.3 }, TR: { owoce: 1.4, bawelna: 1.3 },
  US: { bawelna: 1.4, gaz: 1.5, zloto: 1.2 }, CA: { rzepak: 1.6 }, BR: { kakao: 1.3, kauczuk: 1.3, owoce: 1.3 }, CL: { winogrona: 1.3 }, AR: { winogrona: 1.3 },
  CI: { kakao: 2 }, GH: { kakao: 1.8, zloto: 1.5 }, CM: { kakao: 1.5 }, NG: { kakao: 1.4, gaz: 1.4 }, ZA: { zloto: 1.8, winogrona: 1.2 }, GN: { boksyt: 2 },
  EG: { bawelna: 1.5 }, UZ: { bawelna: 1.8 }, TM: { bawelna: 1.5, gaz: 1.6 }, IN: { bawelna: 1.5 }, CN: { bawelna: 1.3, boksyt: 1.4, zloto: 1.3 },
  TH: { kauczuk: 1.9 }, MY: { kauczuk: 1.7 }, VN: { kauczuk: 1.5 }, LR: { kauczuk: 1.6 }, AU: { boksyt: 1.9, zloto: 1.6 }, PE: { zloto: 1.5 }, DZ: { gaz: 1.6 }, KZ: { gaz: 1.3 } };
const CRC = {};
function cRes(cc) { // bonusy surowców państwa (stałe lub wyliczone z kodu państwa)
  if (CRC[cc]) return CRC[cc];
  const h = hashS(cc || 'XX'); let r = {};
  if (CR_FIX[cc]) r = { ...CR_FIX[cc] };
  else { const a = RAW[h % 7], b = RAW[(h >>> 3) % 7], c = RAW[(h >>> 7) % 7];
    r[a] = 1.2 + ((h >>> 11) % 4) / 10; if (b !== a) r[b] = 1.2 + ((h >>> 14) % 3) / 10; if (c !== a && c !== b) r[c] = .7; }
  if (CR_ADD[cc]) Object.assign(r, CR_ADD[cc]); else r[RAW2[(h >>> 17) % RAW2.length]] = 1.3;
  return CRC[cc] = r;
}
const RG_FIX = { 'śląskie': { wegiel: 1.6 }, 'dolnośląskie': { miedz: 1.6 }, 'wielkopolskie': { zboze: 1.4 }, 'lubelskie': { zboze: 1.4 }, 'podlaskie': { zboze: 1.3 },
  'zachodniopomorskie': { drewno: 1.4 }, 'warmińsko-mazurskie': { drewno: 1.4 }, 'lubuskie': { drewno: 1.5 }, 'pomorskie': { krzem: 1.3 }, 'podkarpackie': { ropa: 1.3 },
  'małopolskie': { ruda: 1.2 }, 'opolskie': { zboze: 1.2 }, 'kujawsko-pomorskie': { zboze: 1.3 }, 'łódzkie': { wegiel: 1.4 }, 'mazowieckie': { zboze: 1.2 }, 'świętokrzyskie': { ruda: 1.3 } };
const RRC = {};
function rRes(rg) { // bonus regionu (województwa / landu / stanu)
  if (rg == null || rg < 0 || !REG[rg]) return {};
  if (RRC[rg]) return RRC[rg];
  const [n, cc] = REG[rg];
  if (cc === 'PL' && RG_FIX[n]) return RRC[rg] = RG_FIX[n];
  const h = hashS(n + cc); return RRC[rg] = { [RAW[h % 7]]: 1.15 + ((h >>> 5) % 3) / 10 };
}
const bonList = r => Object.entries(r).sort((a, b) => b[1] - a[1]).map(([g, v]) => `${G[g].n} ×${String(+v.toFixed(2)).replace('.', ',')}`).join(' · ') || 'brak';
const CTRY_N = {};
// ===== WALUTY =====
const CUR_OF = { AD: 'EUR', AT: 'EUR', AX: 'EUR', BE: 'EUR', CY: 'EUR', DE: 'EUR', EE: 'EUR', ES: 'EUR', FI: 'EUR', FR: 'EUR', GF: 'EUR', GR: 'EUR', HR: 'EUR', IE: 'EUR',
  IT: 'EUR', LT: 'EUR', LU: 'EUR', LV: 'EUR', MC: 'EUR', ME: 'EUR', MT: 'EUR', NL: 'EUR', PT: 'EUR', SI: 'EUR', SK: 'EUR', SM: 'EUR', VA: 'EUR', XK: 'EUR', YT: 'EUR',
  PL: 'PLN', CZ: 'CZK', HU: 'HUF', RO: 'RON', BG: 'BGN', SE: 'SEK', DK: 'DKK', FO: 'DKK', NO: 'NOK', CH: 'CHF', LI: 'CHF', GB: 'GBP', IM: 'GBP', JE: 'GBP', GG: 'GBP',
  GI: 'GBP', FK: 'GBP', SH: 'GBP', UA: 'UAH', BY: 'BYN', RU: 'RUB', TR: 'TRY', RS: 'RSD', BA: 'BAM', MK: 'MKD', AL: 'ALL', MD: 'MDL', KZ: 'KZT',
  US: 'USD', CA: 'CAD', MX: 'MXN', BS: 'BSD', BR: 'BRL', AR: 'ARS', CL: 'CLP', CO: 'COP', PE: 'PEN', EC: 'USD', UY: 'UYU', PY: 'PYG', BO: 'BOB', VE: 'VES', GY: 'GYD', SR: 'SRD',
  CN: 'CNY', JP: 'JPY', KR: 'KRW', KP: 'KPW', TW: 'TWD', HK: 'HKD', MO: 'MOP', IN: 'INR', PK: 'PKR', BD: 'BDT', NP: 'NPR', BT: 'BTN', LK: 'LKR', MM: 'MMK', TH: 'THB',
  LA: 'LAK', KH: 'KHR', VN: 'VND', MY: 'MYR', PH: 'PHP', MN: 'MNT', KG: 'KGS', TJ: 'TJS', TM: 'TMT', UZ: 'UZS', AF: 'AFN',
  ZA: 'ZAR', NA: 'NAD', LS: 'LSL', SZ: 'SZL', BW: 'BWP', ZW: 'USD', ZM: 'ZMW', MW: 'MWK', MZ: 'MZN', AO: 'AOA', CD: 'CDF', CG: 'XAF', GA: 'XAF', CM: 'XAF', CF: 'XAF',
  TD: 'XAF', GQ: 'XAF', NG: 'NGN', GH: 'GHS', BJ: 'XOF', BF: 'XOF', CI: 'XOF', GW: 'XOF', ML: 'XOF', NE: 'XOF', SN: 'XOF', TG: 'XOF', GM: 'GMD', GN: 'GNF', SL: 'SLE',
  LR: 'LRD', MR: 'MRU', MA: 'MAD', EH: 'MAD', DZ: 'DZD', TN: 'TND', LY: 'LYD', EG: 'EGP', SD: 'SDG', SS: 'SSP', ER: 'ERN', ET: 'ETB', DJ: 'DJF', SO: 'SOS', KE: 'KES',
  UG: 'UGX', TZ: 'TZS', RW: 'RWF', BI: 'BIF', MG: 'MGA', KM: 'KMF', ST: 'STN', AU: 'AUD', PG: 'PGK' };
const FX0 = { USD: 1, EUR: .92, PLN: 4, CZK: 23, HUF: 360, RON: 4.6, BGN: 1.8, SEK: 10.5, DKK: 6.9, NOK: 10.8, CHF: .88, GBP: .79, UAH: 41, BYN: 3.3, RUB: 90, TRY: 34,
  RSD: 108, BAM: 1.8, MKD: 57, ALL: 92, MDL: 18, KZT: 480, CAD: 1.37, MXN: 18, BSD: 1, BRL: 5.5, ARS: 950, CLP: 930, COP: 4000, PEN: 3.75, UYU: 40, PYG: 7500,
  BOB: 6.9, VES: 36, GYD: 209, SRD: 32, CNY: 7.2, JPY: 150, KRW: 1350, KPW: 900, TWD: 32, HKD: 7.8, MOP: 8, INR: 83, PKR: 280, BDT: 117, NPR: 133, BTN: 83, LKR: 300,
  MMK: 2100, THB: 35, LAK: 21000, KHR: 4100, VND: 25000, MYR: 4.6, PHP: 56, MNT: 3400, KGS: 87, TJS: 10.9, TMT: 3.5, UZS: 12600, AFN: 70, ZAR: 18.5, NAD: 18.5,
  LSL: 18.5, SZL: 18.5, BWP: 13.6, ZMW: 26, MWK: 1730, MZN: 64, AOA: 900, CDF: 2800, XAF: 600, XOF: 600, NGN: 1500, GHS: 15, GMD: 68, GNF: 8600, SLE: 22, LRD: 190,
  MRU: 40, MAD: 10, DZD: 135, TND: 3.1, LYD: 4.8, EGP: 48, SDG: 600, SSP: 1300, ERN: 15, ETB: 57, DJF: 178, SOS: 570, KES: 130, UGX: 3700, TZS: 2600, RWF: 1300,
  BIF: 2900, MGA: 4500, KMF: 450, STN: 22.5, AUD: 1.52, PGK: 3.9 };
const SYM = { USD: ['$', 1], EUR: ['€', 1], GBP: ['£', 1], JPY: ['¥', 1], CNY: ['¥', 1], PLN: [' zł', 0], CHF: ['CHF ', 1], CZK: [' Kč', 0], UAH: [' ₴', 0], RUB: [' ₽', 0],
  TRY: [' ₺', 0], INR: ['₹', 1], KRW: ['₩', 1], BRL: ['R$ ', 1], AUD: ['A$', 1], CAD: ['C$', 1], MXN: ['MX$', 1] };
const SPREAD = .015; // prowizja kantoru
let CDN = null; try { CDN = new Intl.DisplayNames(['pl'], { type: 'currency' }); } catch (e) {}
const curName = c => { try { return (CDN && CDN.of(c)) || c; } catch (e) { return c; } };
const curOfCC = cc => CUR_OF[cc] || 'USD';
const curOf = lid => curOfCC(LOC[lid] ? LOC[lid].cc : '');
const rate = (c, s = S) => (FX0[c] || 1) * ((s && s.fx && s.fx[c]) || 1);
const wal = (s, c) => (s.w && s.w[c]) || 0;
const canC = (s, c, usd) => wal(s, c) + 1e-6 >= usd * rate(c, s);
const payC = (s, c, usd) => { s.w[c] = wal(s, c) - usd * rate(c, s); };
const earnC = (s, c, usd) => { s.w[c] = wal(s, c) + usd * rate(c, s); };
const totUSD = s => Object.entries(s.w || {}).reduce((a, [c, v]) => a + v / rate(c, s), 0);
const homeCur = (s = S) => curOf(s.hl);
function fmtC(v, c) { const sy = SYM[c] || [' ' + c, 0], t = fmt(Math.abs(v)), sg = v < 0 ? '−' : ''; return sy[1] ? sg + sy[0] + t : sg + t + sy[0]; }
const mC = (usd, c) => fmtC(usd * rate(c), c);          // kwota w USD → w walucie c
const mL = (usd, lid) => mC(usd, curOf(lid));            // → w walucie miejscowości
const mH = usd => mC(usd, homeCur());                     // → w walucie siedziby
const canL = (lid, usd) => canC(S, curOf(lid), usd);
const licCost = cc => Math.round(TIERS[tierOf(cc)].lic * (1 + Math.min(1, (CTRY_N[cc] || 0) / 3000)) / 1000) * 1000;
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
  // surowce roślinne / zwierzęce
  zboze: { n: 'Zboże', p: 4 }, ziemniaki: { n: 'Ziemniaki', p: 3 }, buraki: { n: 'Buraki cukrowe', p: 3.5 }, rzepak: { n: 'Rzepak', p: 6 },
  owoce: { n: 'Owoce', p: 6 }, winogrona: { n: 'Winogrona', p: 8 }, chmiel: { n: 'Chmiel', p: 9 }, bawelna: { n: 'Bawełna', p: 7 }, kakao: { n: 'Kakao', p: 12 },
  drewno: { n: 'Drewno', p: 6 }, kauczuk: { n: 'Kauczuk', p: 13 },
  wegiel: { n: 'Węgiel', p: 8 }, ruda: { n: 'Ruda żelaza', p: 10 }, ropa: { n: 'Ropa', p: 14 }, gaz: { n: 'Gaz ziemny', p: 9 }, krzem: { n: 'Krzem', p: 12 },
  miedz: { n: 'Miedź', p: 16 }, boksyt: { n: 'Boksyt', p: 11 }, kamien: { n: 'Kamień', p: 5 }, zloto: { n: 'Złoto', p: 400 },
  // przetworzone
  maka: { n: 'Mąka', p: 14 }, deski: { n: 'Deski', p: 18 }, sklejka: { n: 'Sklejka', p: 22 }, stal: { n: 'Stal', p: 60 }, aluminium: { n: 'Aluminium', p: 70 },
  kable: { n: 'Kable', p: 70 }, plastik: { n: 'Plastik', p: 40 }, paliwo: { n: 'Paliwo', p: 30 }, nawozy: { n: 'Nawozy', p: 26 }, farby: { n: 'Farby', p: 55 },
  chipy: { n: 'Chipy', p: 150 }, celuloza: { n: 'Celuloza', p: 16 }, papier: { n: 'Papier', p: 40 }, przedza: { n: 'Przędza', p: 20 }, tkanina: { n: 'Tkanina', p: 60 },
  pasza: { n: 'Pasza', p: 9 }, bydlo: { n: 'Bydło', p: 90 }, mleko: { n: 'Mleko', p: 9 }, swinie: { n: 'Świnie', p: 45 }, drob: { n: 'Drób', p: 16 }, jaja: { n: 'Jaja', p: 3.5 },
  mieso: { n: 'Mięso', p: 80 }, skory: { n: 'Skóry', p: 20 }, skora: { n: 'Skóra wyprawiona', p: 65 }, cukier: { n: 'Cukier', p: 22 }, olej: { n: 'Olej', p: 40 },
  // produkty
  chleb: { n: 'Chleb', p: 38 }, meble: { n: 'Meble', p: 95 }, komputery: { n: 'Komputery', p: 1800 }, auta: { n: 'Samochody', p: 9000 },
  opony: { n: 'Opony', p: 100 }, opakowania: { n: 'Opakowania', p: 30 }, zabawki: { n: 'Zabawki', p: 120 }, leki: { n: 'Leki', p: 300 },
  kartony: { n: 'Kartony', p: 60 }, ksiazki: { n: 'Książki', p: 160 }, ubrania: { n: 'Ubrania', p: 140 }, buty: { n: 'Buty', p: 200 }, bizuteria: { n: 'Biżuteria', p: 550 },
  wedliny: { n: 'Wędliny', p: 170 }, filety: { n: 'Filety drobiowe', p: 45 }, ser: { n: 'Ser', p: 70 }, soki: { n: 'Soki', p: 28 },
  piwo: { n: 'Piwo', p: 16 }, wino: { n: 'Wino', p: 60 }, wodka: { n: 'Wódka', p: 60 }, czekolada: { n: 'Czekolada', p: 80 }, ciastka: { n: 'Ciastka', p: 60 }, lody: { n: 'Lody', p: 50 },
  telefony: { n: 'Telefony', p: 900 }, telewizory: { n: 'Telewizory', p: 700 }, agd: { n: 'Sprzęt AGD', p: 560 }, rowery: { n: 'Rowery', p: 350 }, traktory: { n: 'Traktory', p: 9000 },
};
const GK = Object.keys(G);

// t: 0 surowce, 1 przetwórstwo, 2 produkty końcowe
// działy przemysłu (jak w Economy World)
const DEP = [
  { id: 'uprawa', n: 'Uprawa roślin', i: '🌾' }, { id: 'wydob', n: 'Przemysł wydobywczy', i: '⛏️' }, { id: 'lesn', n: 'Leśnictwo', i: '🌲' },
  { id: 'drzew', n: 'Przemysł drzewny', i: '🪵' }, { id: 'metal', n: 'Przemysł metalurgiczny', i: '🔩' }, { id: 'plast', n: 'Przemysł plastikowy', i: '🧴' },
  { id: 'chem', n: 'Przemysł chemiczny', i: '⚗️' }, { id: 'papier', n: 'Przemysł celulozowo-papierniczy', i: '📦' }, { id: 'tekst', n: 'Przemysł tekstyliów', i: '🧵' },
  { id: 'odziez', n: 'Przemysł odzieżowy', i: '👕' }, { id: 'pasza', n: 'Przemysł paszowy', i: '🌽' }, { id: 'hodowla', n: 'Hodowla zwierząt', i: '🐄' },
  { id: 'mieso', n: 'Branża mięsna', i: '🥩' }, { id: 'spoz', n: 'Branża spożywcza', i: '🍞' }, { id: 'alko', n: 'Branża alkoholowa', i: '🍺' },
  { id: 'slod', n: 'Branża słodyczy', i: '🍫' }, { id: 'elektr', n: 'Przemysł elektroniczny', i: '💻' }, { id: 'mech', n: 'Przemysł mechaniczny', i: '🚗' },
];
const B = {
  // Uprawa roślin
  farma:     { n: 'Farma zboża',          d: 'uprawa', t: 0, cost: 2000,  out: { zboze: 10 } },
  pole_ziem: { n: 'Pole ziemniaków',      d: 'uprawa', t: 0, cost: 1800,  out: { ziemniaki: 12 } },
  pole_bur:  { n: 'Plantacja buraków',    d: 'uprawa', t: 0, cost: 2000,  out: { buraki: 12 } },
  pole_rzep: { n: 'Pole rzepaku',         d: 'uprawa', t: 0, cost: 2600,  out: { rzepak: 8 } },
  sad:       { n: 'Sad',                  d: 'uprawa', t: 0, cost: 3000,  out: { owoce: 9 } },
  winnica:   { n: 'Winnica',              d: 'uprawa', t: 0, cost: 4500,  out: { winogrona: 7 } },
  chmielnik: { n: 'Chmielnik',            d: 'uprawa', t: 0, cost: 4000,  out: { chmiel: 6 } },
  pl_baw:    { n: 'Plantacja bawełny',    d: 'uprawa', t: 0, cost: 4000,  out: { bawelna: 8 } },
  pl_kak:    { n: 'Plantacja kakao',      d: 'uprawa', t: 0, cost: 6000,  out: { kakao: 6 } },
  // Wydobycie
  kamien:    { n: 'Kamieniołom',          d: 'wydob', t: 0, cost: 2500,  out: { kamien: 10 } },
  kop_weg:   { n: 'Kopalnia węgla',       d: 'wydob', t: 0, cost: 5000,  out: { wegiel: 7 } },
  kop_rud:   { n: 'Kopalnia rudy',        d: 'wydob', t: 0, cost: 7000,  out: { ruda: 6 } },
  szyb:      { n: 'Szyb naftowy',         d: 'wydob', t: 0, cost: 12000, out: { ropa: 5 } },
  szyb_gaz:  { n: 'Odwiert gazu',         d: 'wydob', t: 0, cost: 9000,  out: { gaz: 7 } },
  kop_krz:   { n: 'Kopalnia krzemu',      d: 'wydob', t: 0, cost: 10000, out: { krzem: 5 } },
  kop_mie:   { n: 'Kopalnia miedzi',      d: 'wydob', t: 0, cost: 12000, out: { miedz: 4 } },
  kop_bok:   { n: 'Kopalnia boksytu',     d: 'wydob', t: 0, cost: 10000, out: { boksyt: 6 } },
  kop_zlo:   { n: 'Kopalnia złota',       d: 'wydob', t: 0, cost: 30000, out: { zloto: .25 } },
  // Leśnictwo
  las:       { n: 'Wyrąb lasu',           d: 'lesn', t: 0, cost: 3000,  out: { drewno: 8 } },
  pl_kau:    { n: 'Plantacja kauczuku',   d: 'lesn', t: 0, cost: 6000,  out: { kauczuk: 6 } },
  // Drzewny
  tartak:    { n: 'Tartak',               d: 'drzew', t: 1, cost: 8000,  in: { drewno: 8 }, out: { deski: 6 } },
  sklejka:   { n: 'Wytwórnia sklejki',    d: 'drzew', t: 1, cost: 9000,  in: { drewno: 8 }, out: { sklejka: 5 } },
  meblarnia: { n: 'Fabryka mebli',        d: 'drzew', t: 2, cost: 20000, in: { deski: 6 }, out: { meble: 2 } },
  // Metalurgia
  huta:      { n: 'Huta stali',           d: 'metal', t: 1, cost: 15000, in: { ruda: 6, wegiel: 6 }, out: { stal: 4 } },
  huta_al:   { n: 'Huta aluminium',       d: 'metal', t: 1, cost: 16000, in: { boksyt: 6, wegiel: 3 }, out: { aluminium: 3 } },
  kablownia: { n: 'Fabryka kabli',        d: 'metal', t: 1, cost: 14000, in: { miedz: 4, plastik: 1 }, out: { kable: 3 } },
  // Plastikowy
  rafineria: { n: 'Rafineria (plastik)',  d: 'plast', t: 1, cost: 14000, in: { ropa: 5 }, out: { plastik: 4 } },
  opakow:    { n: 'Fabryka opakowań',     d: 'plast', t: 2, cost: 12000, in: { plastik: 3 }, out: { opakowania: 6 } },
  zabawki:   { n: 'Fabryka zabawek',      d: 'plast', t: 2, cost: 18000, in: { plastik: 3, farby: 1 }, out: { zabawki: 2.5 } },
  opony:     { n: 'Fabryka opon',         d: 'plast', t: 2, cost: 20000, in: { kauczuk: 5, stal: 1 }, out: { opony: 2.5 } },
  // Chemia
  raf_pal:   { n: 'Rafineria paliw',      d: 'chem', t: 1, cost: 13000, in: { ropa: 5 }, out: { paliwo: 5 } },
  nawozy:    { n: 'Zakłady azotowe',      d: 'chem', t: 1, cost: 12000, in: { gaz: 6 }, out: { nawozy: 5 } },
  farby:     { n: 'Fabryka farb',         d: 'chem', t: 1, cost: 13000, in: { ropa: 2, kamien: 3 }, out: { farby: 2 } },
  leki:      { n: 'Fabryka leków',        d: 'chem', t: 2, cost: 40000, in: { gaz: 3, owoce: 4, opakowania: 1 }, out: { leki: 1 } },
  // Celulozowo-papierniczy
  celuloza:  { n: 'Celulozownia',         d: 'papier', t: 1, cost: 9000,  in: { drewno: 7 }, out: { celuloza: 5 } },
  papiernia: { n: 'Papiernia',            d: 'papier', t: 1, cost: 11000, in: { celuloza: 5 }, out: { papier: 4 } },
  kartonow:  { n: 'Kartonownia',          d: 'papier', t: 2, cost: 12000, in: { papier: 4 }, out: { kartony: 4 } },
  drukarnia: { n: 'Drukarnia',            d: 'papier', t: 2, cost: 18000, in: { papier: 4, farby: 1 }, out: { ksiazki: 2 } },
  // Tekstylia
  przedz:    { n: 'Przędzalnia',          d: 'tekst', t: 1, cost: 9000,  in: { bawelna: 8 }, out: { przedza: 5 } },
  tkalnia:   { n: 'Tkalnia',              d: 'tekst', t: 1, cost: 12000, in: { przedza: 5 }, out: { tkanina: 3 } },
  garbarnia: { n: 'Garbarnia',            d: 'tekst', t: 1, cost: 11000, in: { skory: 4 }, out: { skora: 2.5 } },
  // Odzież
  szwalnia:  { n: 'Szwalnia',             d: 'odziez', t: 2, cost: 16000, in: { tkanina: 3 }, out: { ubrania: 2 } },
  obuwie:    { n: 'Fabryka obuwia',       d: 'odziez', t: 2, cost: 20000, in: { skora: 2, kauczuk: 1 }, out: { buty: 1.2 } },
  jubiler:   { n: 'Pracownia jubilerska', d: 'odziez', t: 2, cost: 35000, in: { zloto: .2 }, out: { bizuteria: .5 } },
  // Pasze
  paszarnia: { n: 'Wytwórnia pasz',       d: 'pasza', t: 1, cost: 6000,  in: { zboze: 5, ziemniaki: 4 }, out: { pasza: 9 } },
  paszarnia2:{ n: 'Mieszalnia pasz rzepakowych', d: 'pasza', t: 1, cost: 8000, in: { rzepak: 4, nawozy: 1 }, out: { pasza: 9 } },
  // Hodowla
  obora:     { n: 'Ferma bydła',          d: 'hodowla', t: 1, cost: 12000, in: { pasza: 8 }, out: { bydlo: 1, mleko: 6 } },
  chlewnia:  { n: 'Chlewnia',             d: 'hodowla', t: 1, cost: 9000,  in: { pasza: 6 }, out: { swinie: 2.5 } },
  kurnik:    { n: 'Kurnik',               d: 'hodowla', t: 1, cost: 6000,  in: { pasza: 4 }, out: { drob: 3, jaja: 8 } },
  // Mięsna
  ubojnia:   { n: 'Ubojnia',              d: 'mieso', t: 1, cost: 14000, in: { bydlo: 1, swinie: 2 }, out: { mieso: 3, skory: 1.5 } },
  wedliny:   { n: 'Zakład wędliniarski',  d: 'mieso', t: 2, cost: 16000, in: { mieso: 3 }, out: { wedliny: 2 } },
  drobiarnia:{ n: 'Zakład drobiarski',    d: 'mieso', t: 2, cost: 9000,  in: { drob: 3 }, out: { filety: 2 } },
  // Spożywcza
  mlyn:      { n: 'Młyn',                 d: 'spoz', t: 1, cost: 7000,  in: { zboze: 10 }, out: { maka: 8 } },
  cukrownia: { n: 'Cukrownia',            d: 'spoz', t: 1, cost: 9000,  in: { buraki: 12 }, out: { cukier: 4 } },
  tlocznia:  { n: 'Olejarnia',            d: 'spoz', t: 1, cost: 9000,  in: { rzepak: 8 }, out: { olej: 2.5 } },
  piekarnia: { n: 'Piekarnia',            d: 'spoz', t: 2, cost: 12000, in: { maka: 8 }, out: { chleb: 6 } },
  mleczarnia:{ n: 'Mleczarnia',           d: 'spoz', t: 2, cost: 11000, in: { mleko: 10 }, out: { ser: 2.5 } },
  sokownia:  { n: 'Tłocznia soków',       d: 'spoz', t: 2, cost: 8000,  in: { owoce: 8, opakowania: 1 }, out: { soki: 5 } },
  // Alkohole
  browar:    { n: 'Browar',               d: 'alko', t: 2, cost: 14000, in: { zboze: 6, chmiel: 2 }, out: { piwo: 6 } },
  winiarnia: { n: 'Winiarnia',            d: 'alko', t: 2, cost: 15000, in: { winogrona: 6 }, out: { wino: 2 } },
  gorzelnia: { n: 'Gorzelnia',            d: 'alko', t: 2, cost: 16000, in: { ziemniaki: 10, zboze: 4 }, out: { wodka: 2 } },
  // Słodycze
  czekol:    { n: 'Fabryka czekolady',    d: 'slod', t: 2, cost: 18000, in: { kakao: 4, cukier: 2, mleko: 3 }, out: { czekolada: 2.5 } },
  cukiernia: { n: 'Cukiernia',            d: 'slod', t: 2, cost: 12000, in: { maka: 3, cukier: 2, jaja: 6 }, out: { ciastka: 3 } },
  lodziarnia:{ n: 'Wytwórnia lodów',      d: 'slod', t: 2, cost: 11000, in: { mleko: 6, cukier: 1, owoce: 2 }, out: { lody: 3 } },
  // Elektronika
  fab_chip:  { n: 'Fabryka chipów',       d: 'elektr', t: 1, cost: 30000, in: { krzem: 4, miedz: 3 }, out: { chipy: 2 } },
  fab_pc:    { n: 'Fabryka komputerów',   d: 'elektr', t: 2, cost: 50000, in: { chipy: 2, plastik: 2 }, out: { komputery: .5 } },
  fab_tel:   { n: 'Fabryka telefonów',    d: 'elektr', t: 2, cost: 45000, in: { chipy: 1, plastik: 1, aluminium: 1 }, out: { telefony: .6 } },
  fab_tv:    { n: 'Fabryka telewizorów',  d: 'elektr', t: 2, cost: 40000, in: { chipy: 1, plastik: 2, kable: 1 }, out: { telewizory: .7 } },
  // Mechaniczny
  fab_agd:   { n: 'Fabryka AGD',          d: 'mech', t: 2, cost: 35000, in: { stal: 3, plastik: 2, kable: 1 }, out: { agd: 1 } },
  fab_row:   { n: 'Fabryka rowerów',      d: 'mech', t: 2, cost: 22000, in: { stal: 1, aluminium: 2, opony: 1 }, out: { rowery: 1.2 } },
  fab_trak:  { n: 'Fabryka traktorów',    d: 'mech', t: 2, cost: 90000, in: { stal: 6, opony: 2, paliwo: 2 }, out: { traktory: .12 } },
  fab_aut:   { n: 'Fabryka samochodów',   d: 'mech', t: 2, cost: 120000, in: { stal: 4, plastik: 3, chipy: 2 }, out: { auta: .2 } },
};
// gdzie powstaje towar (do przepisów i kategorii)
const MADE = {}; for (const [id, d] of Object.entries(B)) for (const g in d.out) (MADE[g] = MADE[g] || []).push(id);
const USED = {}; for (const [id, d] of Object.entries(B)) for (const g in d.in || {}) (USED[g] = USED[g] || []).push(id);
const GDEP = g => MADE[g] ? B[MADE[g][0]].d : 'uprawa';
const ISRAW = g => !!(MADE[g] && MADE[g].some(id => !B[id].in));

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
function kmLL(la1, lo1, la2, lo2) {
  const r = Math.PI / 180;
  const h = Math.sin((la2 - la1) * r / 2) ** 2 + Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin((lo2 - lo1) * r / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}
function km(a, b) { const A = LOC[a], B = LOC[b]; return kmLL(A.la, A.lo, B.la, B.lo); }
const norm = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/ł/g, 'l');
const popTxt = p => p >= 1e6 ? (p / 1e6).toFixed(1).replace('.', ',') + ' mln' : p >= 1000 ? Math.round(p / 1000) + ' tys.' : String(p);
const FOUND = { w: 10000, m: 60000 };
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
    v: 2, created: Date.now(), setup: !!o.done, ceo: o.ceo || '', name: o.name || 'Moja Firma', color: o.color || COLORS[0], hq, hl, diff,
    w: { [curOfCC(LOC[hl].cc)]: cash * (FX0[curOfCC(LOC[hl].cc)] || 1) }, fx: {}, fxp: {}, hour: 0, last: Date.now(),
    c: { [hq]: {} }, lic: { [LOC[hl].cc]: true }, L: { [hl]: newLoc() }, ships: [], veh: [], custom: [], nid: 1, m, ai: mkAI(cash, diff),
    season: 1, pp: 0, perk: { prod: 0, upk: 0, ship: 0, sell: 0 }, ev: [],
    news: [], inc: 0, upk: 0, lastSeason: null, tut: { step: o.tut === false ? 99 : 0, sold: false, rew: false },
  };
  for (const g of GK) m[g].h = Array(8).fill(price(g, s));
  addNews(s, `Start! ${s.ceo ? 'Prezes ' + s.ceo + ', masz' : 'Masz'} ${fmtC(cash * (FX0[curOfCC(LOC[hl].cc)] || 1), curOfCC(LOC[hl].cc))} i siedzibę: ${LOC[hl].n} (${CN[hq].n}).`);
  return s;
}
// zapis z 0.1–0.3 (kontynenty bez miejscowości) → wszystko trafia do stolicy kontynentu
function migrate(s) {
  if (s.setup === undefined) s.setup = true;
  s.hq = s.hq || 'eu'; s.color = s.color || COLORS[0]; s.diff = s.diff ?? 1; s.ceo = s.ceo || '';
  s.tut = s.tut || { step: 99, sold: true, rew: true };
  s.L = {}; s.veh = []; s.custom = [];
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
let SAVE_KEY = SAVE; // gość: SAVE; konto: SAVE + '_' + uid
function parseSave(raw) {
  try {
    const s = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (s && s.v === 2) {
      s.custom = s.custom || [];
      for (const g of GK) if (!s.m[g]) s.m[g] = { sat: 0, d: rnd(.9, 1.1), h: Array(8).fill(G[g].p) };
      if (!s.w) { // zapis sprzed walut: cała gotówka do waluty siedziby
        const hc = curOfCC((LOC[s.hl] || {}).cc); s.w = { [hc]: (s.cash || 0) * (FX0[hc] || 1) }; s.fx = {}; s.fxp = {}; delete s.cash;
        s.news = s.news || []; s.news.unshift({ h: s.hour || 0, t: `Aktualizacja: waluty! Gotówka przeliczona na ${curName(hc)}. Kantor jest w zakładce Rynek.` });
      }
      if (!s.lic) { // zapis sprzed państw: licencje tam, gdzie gracz już działa, + stolice opłaconych kontynentów
        s.lic = {};
        const add = id => { const l = LOC[id]; if (l && l.cc) s.lic[l.cc] = true; };
        add(s.hl); for (const id in s.L) add(id); for (const cid in s.c) add(CAP[cid]);
        s.news = s.news || []; s.news.unshift({ h: s.hour || 0, t: 'Aktualizacja: państwa i regiony! Każde państwo ma licencję, podatki i własne bonusy surowców.' });
      }
      return s;
    }
      if (s && s.v === 1) return parseSave(migrate(s));
  } catch (e) {}
  return null;
}
function load(key = SAVE_KEY) { try { return parseSave(localStorage.getItem(key)); } catch (e) { return null; } }
function save() { if (!S) return; try { S.last = Date.now(); localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} cloudSave(false); }

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

// mnożnik ceny towaru w danym państwie (surowce tańsze tam, gdzie ich dużo; produkty droższe w bogatych krajach)
const CPF = {};
function cpf(cc, g) {
  const k = cc + g; if (CPF[k]) return CPF[k];
  let f = 1 + ((hashS(k) % 13) - 6) / 100;
  if (ISRAW(g)) f *= Math.pow(1 / (cRes(cc)[g] || 1), .6);
  else f *= HI.has(cc) ? 1.12 : MID.has(cc) ? 1 : .88;
  return CPF[k] = f;
}
const lpf = (lid, g) => cpf(LOC[lid].cc, g);
function sell(s, lid, g, q) {
  const L = s.L[lid]; q = Math.min(q, L.inv[g] || 0);
  if (q <= 0) return 0;
  const rev = sellPrice(g, q, s) * lpf(lid, g) * T(lid).sell * q * (1 - taxOf(lid));
  s.m[g].sat += q; L.inv[g] -= q; if (L.inv[g] < 1e-6) delete L.inv[g];
  earnC(s, curOf(lid), rev); if (s.tut) s.tut.sold = true; return rev;
}
function buy(s, lid, g, q) {
  const cost = buyPrice(g, q, s) * lpf(lid, g) * q;
  if (q <= 0 || !canC(s, curOf(lid), cost)) return false;
  payC(s, curOf(lid), cost); s.m[g].sat -= q; add(ensureL(s, lid), g, q); return cost;
}
const taxOf = lid => TIERS[tierOf(LOC[lid].cc)].tax;
const landOf = lid => Math.round(T(lid).land * TIERS[tierOf(LOC[lid].cc)].land);
const hasLic = lid => !!(S && S.lic && S.lic[LOC[lid].cc]);
function resF(s, lid, g) { // państwo × region × wydarzenia na kontynencie
  const l = LOC[lid]; let f = (cRes(l.cc)[g] || 1) * (rRes(l.rg)[g] || 1);
  for (const e of s.ev) if (e.c === l.c && e.g === g) f *= e.f;
  return f;
}
// mnożnik wydajności zakładu w miejscowości (bez poziomu)
function locF(s, lid, d, g) { const t = T(lid); return d.in ? t.fac : t.raw * resF(s, lid, g); }
const dutyOf = (a, b, g, q) => { const A = LOC[a].cc, B2 = LOC[b].cc; return !q || !g || A === B2 || (EU.has(A) && EU.has(B2)) ? 0 : Math.round(q * price(g) * DUTY); };
function bldValue(b) { const d = B[b.t]; return d.cost * (1 + (b.l - 1) * .8) * .6 + (b.land || 0) * .5; }
function upCost(b) { return Math.round(B[b.t].cost * b.l * .8); }
const garUp = L => GARAGE_COST * L.gar;
const xCost = (L, lid) => T(lid).xCost * (L.x + 1);
function worth(s = S) {
  let w = totUSD(s);
  for (const cc in s.lic || {}) if (cc !== (LOC[s.hl] || {}).cc) w += licCost(cc) * .5;
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
  const cash0 = totUSD(s);
  const prodM = 1 + .08 * s.perk.prod, upkM = Math.max(.3, 1 - .07 * s.perk.upk);
  let upk = 0;
  for (const lid in s.L) {
    const L = s.L[lid], cur = curOf(lid); let u = 0;
    for (const b of L.bld) {
      const d = B[b.t], k = b.l * prodM;
      u += d.cost * .0012 * b.l * upkM;
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
    if (L.port) u += 30 * upkM;
    if (L.gar) u += 15 * L.gar * upkM;
    payC(s, cur, u); upk += u;
    for (const g in L.auto) if (L.auto[g] && (L.inv[g] || 0) >= 1) sell(s, lid, g, Math.floor(L.inv[g]));
  }
  for (const v of s.veh) { const u = VEH[v.k].cost * .001 * upkM; payC(s, curOf(v.home), u); upk += u; }
  s.upk = upk;
  // kursy walut: błądzenie losowe z powrotem do średniej
  s.fx = s.fx || {}; s.fxp = s.fxp || {};
  for (const c in FX0) { if (c === 'USD') continue; const f = s.fx[c] || 1; s.fx[c] = clamp(f * Math.exp((Math.random() + Math.random() + Math.random() - 1.5) * .004) + (1 - f) * .01, .7, 1.35); }
  if (s.hour % 24 === 0) s.fxp = { ...s.fx };
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
  s.inc = s.inc * .85 + (totUSD(s) - cash0) * .15;
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
    sel: () => ['[data-a=build][data-b=farma]', `.chips [data-a=bl][data-l=${S.hl}]`, '[data-tab=budowa]'], done: () => hasB('farma') },
  { t: 'Młyn', d: 'Młyn przerabia 10 zboża na 8 mąki, a mąka jest ponad 3× droższa. Tak działają łańcuchy produkcji. Zbuduj Młyn w tej samej miejscowości.',
    sel: () => ['[data-a=build][data-b=mlyn]', `.chips [data-a=bl][data-l=${S.hl}]`, '[data-tab=budowa]'], done: () => hasB('mlyn') },
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
const wz = { step: 0, ceo: '', name: '', hq: 'eu', hl: '', cc: '', rg: null, lvl: 'ctry', q: '', color: COLORS[0], diff: 1, tut: true };
function wzList() { // listy kreatora: państwa / regiony / miejscowości
  const q = norm((wz.q || '').trim()), byc = BYC[wz.hq];
  if (wz.lvl === 'ctry') {
    const m = {}; for (const l of byc) if (l.cc) m[l.cc] = (m[l.cc] || 0) + 1;
    const list = Object.keys(m).filter(cc => !q || norm(cName(cc)).includes(q)).sort((a, b) => m[b] - m[a]);
    return list.map(cc => `<button class="wz-opt" data-a="wzCc" data-v="${cc}"><b>${flag(cc)} ${cName(cc)} <span class="mut small" style="font-weight:400">· ${m[cc].toLocaleString('pl-PL')} miejsc.</span></b>
      <span>Bonusy: ${bonList(cRes(cc))} · podatek ${Math.round(TIERS[tierOf(cc)].tax * 100)}%${EU.has(cc) ? ' · UE' : ''}</span></button>`).join('') || '<div class="mut">Brak wyników.</div>';
  }
  if (wz.lvl === 'reg') {
    const m = new Map(); for (const l of byc) if (l.cc === wz.cc && l.rg >= 0) m.set(l.rg, (m.get(l.rg) || 0) + 1);
    return [...m.keys()].sort((a, b) => REG[a][0].localeCompare(REG[b][0], 'pl')).map(r => `<button class="wz-opt" data-a="wzRg" data-v="${r}"><b>${esc(REG[r][0])} <span class="mut small" style="font-weight:400">· ${m.get(r)} miejsc.</span></b>
      <span>Bonus regionu: ${bonList(rRes(r))}</span></button>`).join('');
  }
  const list = [];
  for (const l of byc) { if (l.cc !== wz.cc || (wz.rg != null && wz.rg >= 0 && l.rg !== wz.rg)) continue; if (q && !(l.nn || (l.nn = norm(l.n))).includes(q)) continue; list.push(l); if (list.length >= 80) break; }
  return list.map(l => `<button class="wz-opt ${wz.hl === l.id ? 'on' : ''}" data-a="wzSet" data-k="hl" data-v="${l.id}"><b>${esc(l.n)} <span class="ltag ${l.t}">${TYPE[l.t].n}</span>${l.port ? ' <span class="ltag p">Port</span>' : ''}</b>
    <span>${l.pop ? popTxt(l.pop) + ' mieszk. · ' : ''}${TYPE[l.t].d}</span></button>`).join('') + (list.length >= 80 ? '<div class="mut small">Pokazano 80 największych — wpisz nazwę, żeby znaleźć mniejsze.</div>' : '') || '<div class="mut">Brak wyników.</div>';
}
const bonTxt = c => Object.entries(c.r).filter(([, v]) => v >= 1.2).sort((a, b) => b[1] - a[1]).map(([g, v]) => `${G[g].n} ×${String(v).replace('.', ',')}`).join(' · ') || 'zrównoważony';
function renderWiz() {
  const el = $('wiz');
  if (S.setup) { el.hidden = true; return; }
  el.hidden = false;
  const dots = [0, 1, 2, 3].map(i => `<i class="${i <= wz.step ? 'on' : ''}"></i>`).join('');
  let b = '';
  if (wz.step === 0) {
    b = `<div class="wz-logo au-logo">${LOGO}</div>
      <h1>XyxWord</h1><p class="mut">Zbuduj imperium gospodarcze: od farmy na wsi do fabryk komputerów i samochodów w wielkich miastach. Rywalizuj z konkurencją w sezonowym rankingu.</p>
      <label class="f" for="wzCeo">Imię prezesa</label><input id="wzCeo" data-wz="ceo" maxlength="20" placeholder="np. Mati" value="${esc(wz.ceo)}">
      <label class="f" for="wzName">Nazwa firmy</label><input id="wzName" data-wz="name" maxlength="24" placeholder="np. Mati Holding" value="${esc(wz.name)}">
      <div id="wzErr" class="warn"></div>`;
  } else if (wz.step === 1) {
    const cc = wz.cc, rg = wz.rg, l = LOC[wz.hl];
    const crumbs = [[CN[wz.hq].n, 'ctry']];
    if (cc) crumbs.push([`${flag(cc)} ${cName(cc)}`, 'reg']);
    if (cc && rg != null && rg >= 0) crumbs.push([REG[rg][0], 'loc']);
    const title = { ctry: 'Wybierz państwo', reg: 'Wybierz województwo / region', loc: 'Wybierz miasto lub wieś' }[wz.lvl];
    b = `<h1>Siedziba firmy</h1><p class="mut">Kontynent → państwo → region → miejscowość. Inne miejsca otworzysz później.</p>
      <div class="chips">${CONT.map(c => `<button class="${wz.hq === c.id ? 'on' : ''}" data-a="wzSet" data-k="hq" data-v="${c.id}">${c.n}</button>`).join('')}</div>
      <div class="crumbs">${crumbs.map(([n, lv], i) => `${i ? '<span>›</span>' : ''}<button class="${wz.lvl === lv ? 'on' : ''}" data-a="wzLvl" data-v="${lv}">${esc(n)}</button>`).join('')}</div>
      ${l ? `<div class="wz-pick"><span class="mut small">Wybrano:</span> <b>${flag(l.cc)} ${esc(l.n)}</b> <span class="ltag ${l.t}">${TYPE[l.t].n}</span>${l.port ? ' <span class="ltag p">Port</span>' : ''}</div>` : ''}
      <h2>${title}</h2>
      ${wz.lvl !== 'reg' ? `<input type="search" data-wzq="1" placeholder="${wz.lvl === 'ctry' ? 'Szukaj państwa…' : 'Szukaj miejscowości…'}" value="${esc(wz.q || '')}" autocomplete="off" style="margin-bottom:8px">` : ''}
      <div id="wzList">${wzList()}</div>`;
  } else if (wz.step === 2) {
    b = `<h1>Styl i trudność</h1><label class="f">Kolor firmy</label><div class="sw">${COLORS.map(c => `<button class="${wz.color === c ? 'on' : ''}" style="background:${c}" data-a="wzSet" data-k="color" data-v="${c}" aria-label="Kolor ${c}"></button>`).join('')}</div>
      <label class="f">Poziom trudności</label>
      ${DIFF.map((d, i) => `<button class="wz-opt ${wz.diff === i ? 'on' : ''}" data-a="wzSet" data-k="diff" data-v="${i}"><b>${d.n}</b><span>${d.d}</span></button>`).join('')}`;
  } else {
    b = `<h1>Gotowe do startu</h1>
      <div class="card"><div class="row"><span class="dot" style="background:${wz.color}"></span><div class="grow"><b>${esc(wz.name)}</b><div class="mut small">Prezes: ${esc(wz.ceo)}</div></div></div>
      <table style="margin-top:8px"><tr><td>Siedziba</td><td class="n">${LOC[wz.hl].n} (${TYPE[LOC[wz.hl].t].n.toLowerCase()})</td></tr><tr><td>Kontynent</td><td class="n">${CN[wz.hq].n}</td></tr><tr><td>Trudność</td><td class="n">${DIFF[wz.diff].n}</td></tr><tr><td>Gotówka</td><td class="n">${fmtC(DIFF[wz.diff].cash * (FX0[curOfCC(LOC[wz.hl].cc)] || 1), curOfCC(LOC[wz.hl].cc))}</td></tr></table></div>
      <button class="toggle ${wz.tut ? 'on' : ''}" data-a="wzSet" data-k="tut" data-v="${wz.tut ? 0 : 1}" style="width:100%;min-height:44px">Samouczek: ${wz.tut ? 'włączony' : 'wyłączony'}</button>`;
  }
  const anim = ui.wzLast !== wz.step; ui.wzLast = wz.step;
  el.innerHTML = `<div class="wz-in ${anim ? 'step' : ''}"><div class="wz-dots">${dots}</div>${b}
    <div class="btns wz-nav">${wz.step ? '<button class="btn" data-a="wzBack">Wstecz</button>' : ''}<button class="btn p grow" data-a="wzNext">${wz.step === 3 ? 'Rozpocznij grę' : 'Dalej'}</button></div></div>`;
}
document.addEventListener('input', e => {
  const t = e.target, k = t.dataset.wz; if (k) wz[k] = t.value;
  if (t.dataset.rq) { ui.rq = t.value; clearTimeout(ui.rqT); ui.rqT = setTimeout(openRecipes, 250); }
  if (t.dataset.exa && ui.ex) { ui.ex.amt = t.value; const o = $('exOut'); if (o) o.innerHTML = exPreview(); }
  if (t.dataset.wzq) { wz.q = t.value; const r = $('wzList'); if (r) r.innerHTML = wzList(); }
  if (t.dataset.q) { ui.locQ = t.value; const r = $('locRes'); if (r) r.innerHTML = locRes(ui.bc, ui.bl); }
  if (t.dataset.np && ui.np) ui.np[t.dataset.np] = t.value;
});

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
    return `<button class="${l.id === sel ? 'on' : ''} ${L && (L.bld.length || L.gar) ? 'own' : ''}" data-a="${act}" data-l="${l.id}">${l.n}<small>${flag(l.cc)} ${l.t === 'w' ? 'wieś' : 'miasto'}</small></button>`; }).join('')}</div>`;
}
const bldCount = () => Object.values(S.L).reduce((a, L) => a + L.bld.length, 0);

function vFirma() {
  const r = ranking(), pos = r.findIndex(x => x.me) + 1;
  const day = Math.floor((S.hour % SEASON_H) / 24) + 1;
  let h = '';
  if (!bldCount() && S.tut.step >= TUT.length) h += `<div class="card hint"><b>Jak zacząć</b><div class="mut" style="margin-top:4px">W <b>Budowa</b> postaw Farmę i Młyn w swojej siedzibie, potem Piekarnię. Na wsiach farmy i kopalnie dają więcej, w miastach fabryki. Towar między miejscowościami wożą ciężarówki, między kontynentami statki.</div><div class="btns"><button class="btn p" data-a="tab" data-t="budowa">Do budowy</button></div></div>`;
  h += mapSvg();
  h += `<div class="kpis">
    <div class="kpi"><span>Wartość firmy</span><b>${mH(worth())}</b></div>
    <div class="kpi"><span>Przepływ gotówki /h</span><b class="${S.inc >= 0 ? 'pos' : 'neg'}">${mH(S.inc)}</b></div>
    <div class="kpi"><span>Koszty utrzymania /h</span><b>${mH(S.upk)}</b></div>
    <div class="kpi"><span>Sezon ${S.season} · dzień ${day}/30</span><b>Miejsce ${pos} / ${r.length}</b></div>
  </div>`;
  h += `<h2>Wiadomości</h2><div class="card">${S.news.slice(0, 10).map(n => `<div class="news"><span>D${Math.floor(n.h / 24) + 1}</span>${esc(n.t)}</div>`).join('')}</div>`;
  return h;
}
const MAPS = window.XYX_MAPS;
const BYC = {}; // miejscowości kontynentu posortowane wg ludności (kolejność rysowania)
function initPts() {
  for (const cid of Object.keys(CN)) {
    const pr = projOf(cid), pts = MAPS[cid].pts = MAPS[cid].pts || {};
    BYC[cid] = LOCS.filter(l => l.c === cid).sort((a, b) => b.pop - a.pop);
    for (const l of BYC[cid]) { const p = pr([l.lo, l.la]); l.x = p[0]; l.y = p[1]; pts[l.id] = p; if (l.cc) CTRY_N[l.cc] = (CTRY_N[l.cc] || 0) + 1; }
  }
}
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
const ZMAX = 60;
function zOf(cid) {
  if (ui.z[cid]) return ui.z[cid];
  ui.z[cid] = { k: 1, x: 0, y: 0 };
  const p = MAPS[cid] && MAPS[cid].pts[ui.bl];
  if (p && LOC[ui.bl] && LOC[ui.bl].c === cid) zoomAt(cid, cid === 'eu' ? 6 : 3, p[0], p[1]);
  return ui.z[cid];
}
function clampZ(cid) {
  const z = zOf(cid), m = MAPS[cid];
  z.k = clamp(z.k, 1, ZMAX); z.x = clamp(z.x, 0, m.w - m.w / z.k); z.y = clamp(z.y, 0, m.h - m.h / z.k);
}
function zoomAt(cid, k, ux, uy) { // ux,uy: punkt mapy, który ma zostać w miejscu (środek widoku)
  const z = zOf(cid), m = MAPS[cid];
  z.k = clamp(k, 1, ZMAX); z.x = ux - m.w / z.k / 2; z.y = uy - m.h / z.k / 2; clampZ(cid);
}
function locMap(cid, sel) {
  const m = MAPS[cid], z = zOf(cid), u = 1 / z.k, P = l => [l.x, l.y];
  const own = l => { const L = S.L[l.id]; return !!(L && (L.bld.length || L.gar || Object.keys(L.inv).length)); };
  let g = '';
  for (const v of S.veh) {
    if (v.st !== 'go' || LOC[v.to].c !== cid) continue;
    const [x1, y1] = P(LOC[v.from]), [x2, y2] = P(LOC[v.to]), p = clamp(1 - (v.eta - S.hour) / v.dur, 0, 1);
    g += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#f5c542" stroke-width="2" stroke-dasharray="5 4" vector-effect="non-scaling-stroke"/>
      <rect x="${x1 + (x2 - x1) * p - 11 * u}" y="${y1 + (y2 - y1) * p - 7 * u}" width="${22 * u}" height="${14 * u}" rx="${3 * u}" fill="#f5c542" stroke="#0b131b" stroke-width="1.5" vector-effect="non-scaling-stroke"/>`;
  }
  // co rysować: widok + margines (płynne przesuwanie), siatka przerzedzająca, najpierw ważne miejsca
  const vw = m.w / z.k, vh = m.h / z.k, x0 = z.x - vw * .5, x1 = z.x + vw * 1.5, y0 = z.y - vh * .5, y1 = z.y + vh * 1.5;
  const cell = 26 * u, taken = new Set(), ls = [];
  const take = l => { if (l.x < x0 || l.x > x1 || l.y < y0 || l.y > y1) return; const k = Math.floor(l.x / cell) + ',' + Math.floor(l.y / cell);
    if (taken.has(k)) return false; taken.add(k); ls.push(l); };
  const special = [LOC[sel], ...Object.keys(S.L).map(id => LOC[id]), ...LOCS.filter(l => l.u)].filter(l => l && l.c === cid);
  const seen = new Set();
  for (const l of special) if (!seen.has(l.id)) { seen.add(l.id); if (l.x >= x0 && l.x <= x1 && l.y >= y0 && l.y <= y1) { ls.push(l); taken.add(Math.floor(l.x / cell) + ',' + Math.floor(l.y / cell)); } }
  for (const l of BYC[cid]) { if (ls.length > 900) break; if (!seen.has(l.id)) take(l); }
  // etykiety (tylko w widoku), nachodzące się chowamy
  const fs = 28 * u, boxes = [], lab = {};
  const hit = b => boxes.some(o => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]);
  for (const l of ls) { const q = (l.t === 'm' ? 8 : 6) * u; boxes.push([l.x - q, l.y - q, l.x + q, l.y + q]); }
  let nl = 0;
  for (const l of ls) {
    if (nl > 140 || l.x < z.x || l.x > z.x + vw || l.y < z.y || l.y > z.y + vh) continue;
    const { x, y } = l, w = l.n.length * fs * .56, d = 16 * u;
    const opts = [[x, y + d + fs * .8, 'middle', x - w / 2, y + d, x + w / 2, y + d + fs], [x, y - d - fs * .2, 'middle', x - w / 2, y - d - fs, x + w / 2, y - d],
      [x + d, y + fs * .35, 'start', x + d, y - fs / 2, x + d + w, y + fs / 2], [x - d, y + fs * .35, 'end', x - d - w, y - fs / 2, x - d, y + fs / 2]];
    const o = opts.find(o => !hit(o.slice(3))) || (l.id === sel ? opts[0] : null);
    if (o) { boxes.push(o.slice(3)); lab[l.id] = o; nl++; }
  }
  for (const l of ls) {
    const { x, y } = l, L = S.L[l.id], mine = own(l), on = l.id === sel, lb = lab[l.id], r = ((l.t === 'm' ? 8 : 5.5) + (mine || on ? 3 : 0)) * u;
    const fill = mine ? S.color : (l.t === 'm' ? '#56677a' : '#4b6a4e');
    const shape = l.t === 'm' ? `<rect x="${x - r}" y="${y - r}" width="${2 * r}" height="${2 * r}" rx="${3 * u}"` : `<circle cx="${x}" cy="${y}" r="${r}"`;
    g += `<g data-a="bl" data-l="${l.id}" data-from-map="1"><circle cx="${x}" cy="${y}" r="${14 * u}" fill="transparent"/>
      ${on ? `<circle cx="${x}" cy="${y}" r="${19 * u}" fill="none" stroke="#e0823f" stroke-width="2.5" vector-effect="non-scaling-stroke"/>` : ''}
      ${shape} fill="${fill}" stroke="${mine ? '#fff' : '#0b131b'}" stroke-width="1.2" vector-effect="non-scaling-stroke"/>
      ${L && L.port ? `<rect x="${x + 7 * u}" y="${y - 17 * u}" width="${10 * u}" height="${10 * u}" rx="${2 * u}" fill="#4aa3ff" stroke="#0b131b" stroke-width="1" vector-effect="non-scaling-stroke"/>` : ''}
      ${lb ? `<text x="${lb[0]}" y="${lb[1]}" text-anchor="${lb[2]}" font-size="${fs}" font-weight="${on || mine ? 700 : 500}" fill="${on ? '#fff' : mine ? '#eef0f3' : '#b4bcc6'}" class="lbl" style="stroke-width:${7 * u}px">${l.n}</text>` : ''}</g>`;
  }
  return `<div class="map lmap${ui.place ? ' placing' : ''}" data-cid="${cid}" style="--ar:${m.w}/${m.h}"><svg viewBox="${z.x} ${z.y} ${vw} ${vh}" preserveAspectRatio="xMidYMid meet" class="${z.k > 1 ? 'zoomed' : ''}">${mapBase(m, cid)}${g}</svg>
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
    z.k = clamp(z.k * (d1 / (d0 || d1)), 1, ZMAX);
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
  z.k = clamp(z.k * (e.deltaY < 0 ? 1.25 : .8), 1, ZMAX);
  const m = MAPS[cid], k2 = Math.max(m.w / z.k / r.width, m.h / z.k / r.height);
  z.x = ux - (e.clientX - r.left) * k2; z.y = uy - (e.clientY - r.top) * k2; clampZ(cid);
  clearTimeout(gs.wt); applyVB(svg, cid); gs.wt = setTimeout(() => render(true), 150);
}, { passive: false });

function locRes(cid, sel) {
  const q = norm((ui.locQ || '').trim());
  let list;
  if (q) {
    const nn = l => l.nn || (l.nn = norm(l.n)), st = [], inc = [];
    for (const l of BYC[cid]) { const v = nn(l); if (v.startsWith(q)) { if (st.length < 16) st.push(l); } else if (inc.length < 16 && v.includes(q)) inc.push(l); }
    list = [...st, ...inc].slice(0, 16);
    if (!list.length) return '<div class="mut small" style="padding:4px 4px 10px">Brak wyników.</div>';
  } else {
    const ids = new Set([sel, ...Object.keys(S.L).filter(id => LOC[id].c === cid), ...LOCS.filter(l => l.c === cid && l.u).map(l => l.id),
      ...LOCS.filter(l => l.c === cid && l.f).map(l => l.id)]);
    list = [...ids].map(id => LOC[id]);
  }
  return locChips(list, sel, 'bl');
}
// rzuty map w przeglądarce (do zakładania własnych miejscowości)
const PROJ = {};
function projOf(cid) {
  if (PROJ[cid]) return PROJ[cid];
  const m = MAPS[cid], g = window.d3; if (!m || !m.proj || !g || !g.geoMercator) return null;
  const p = g[m.proj.type]().rotate(m.proj.rotate);
  if (m.proj.parallels) p.parallels(m.proj.parallels);
  return PROJ[cid] = p.scale(m.proj.scale).translate(m.proj.translate);
}
// miejscowości spoza bazy: własne gracza (u) i dodane przez admina dla wszystkich (g)
let GLOBAL = [];
try { GLOBAL = JSON.parse(localStorage.getItem('xyx_places') || '[]'); } catch (e) {}
const clean = t => String(t).replace(/[<>&"'`\\]/g, '');
function registerCustom(s) {
  const touched = new Set();
  for (const l of LOCS) if (l._o) { Object.assign(l, l._o); delete l._o; delete l.nn; MAPS[l.c].pts[l.id] = [l.x, l.y]; touched.add(l.c); } // cofnij poprzednie edycje admina
  for (let i = LOCS.length - 1; i >= 0; i--) if (LOCS[i].u || LOCS[i].g) { const l = LOCS[i]; touched.add(l.c); delete LOC[l.id]; delete MAPS[l.c].pts[l.id]; LOCS.splice(i, 1); }
  const add = l => { const pr = projOf(l.c); if (!pr || !CN[l.c]) return;
    if (!l.cc) { let nd = 1e9, nr = null; for (const o of BYC[l.c] || []) { if (o.u || o.g) continue; const d2 = kmLL(l.la, l.lo, o.la, o.lo); if (d2 < nd) { nd = d2; nr = o; } } if (nr) { l.cc = nr.cc; l.rg = nr.rg; } }
    const p = pr([l.lo, l.la]); l.x = p[0]; l.y = p[1]; LOCS.push(l); LOC[l.id] = l; MAPS[l.c].pts[l.id] = p; touched.add(l.c); };
  for (const c of (s && s.custom) || []) add({ ...c, n: clean(c.n), port: !!c.port, pop: 0, f: false, u: true });
  for (const g of GLOBAL) if (g.ov) { // edycja / ukrycie miejscowości z bazy
    const l = LOC[g.id]; if (!l || l.u || l.g) continue;
    l._o = { n: l.n, t: l.t, pop: l.pop, port: l.port, la: l.la, lo: l.lo, x: l.x, y: l.y, hide: !!l.hide };
    delete l.nn; if (g.n) l.n = clean(g.n); if (g.t) l.t = g.t === 'm' ? 'm' : 'w'; if (g.pop != null) l.pop = +g.pop || 0; if (g.port != null) l.port = !!g.port;
    if (isFinite(g.la) && isFinite(g.lo) && (+g.la !== l.la || +g.lo !== l.lo)) { l.la = +g.la; l.lo = +g.lo; const pr = projOf(l.c); if (pr) { const p = pr([l.lo, l.la]); l.x = p[0]; l.y = p[1]; MAPS[l.c].pts[l.id] = p; } }
    l.hide = !!g.del && !(s && s.L && s.L[g.id]); touched.add(l.c);
  }
  for (const g of GLOBAL) if (!g.ov && (!g.del || (s && s.L && s.L[g.id]))) add({ id: g.id, c: g.c, n: clean(g.n), t: g.t === 'm' ? 'm' : 'w', la: +g.la, lo: +g.lo, port: !!g.port, ld: g.ld || g.c, pop: +g.pop || 0, f: false, g: true, hide: !!g.del });
  for (const cid of touched) BYC[cid] = LOCS.filter(l => l.c === cid && !l.hide).sort((a, b) => b.pop - a.pop);
  if (LM) LM.srcCid = null;
}
function placeAt(e, svg) {
  const cid = svg.parentNode.dataset.cid, pr = projOf(cid); if (!pr) { toast('Mapa niedostępna'); return; }
  const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
  const u = pt.matrixTransform(svg.getScreenCTM().inverse()), ll = pr.invert([u.x, u.y]);
  if (!ll) return;
  placeAtLL(cid, ll[1], ll[0]);
}
function placeAtLL(cid, la, lo) {
  const bx = MAPS[cid].box;
  if (lo < bx[0][0] || lo > bx[1][0] || la < bx[0][1] || la > bx[1][1]) { toast('Poza obszarem tego kontynentu'); return; }
  let near = null, nd = 1e9;
  for (const l of BYC[cid]) { const d = kmLL(la, lo, l.la, l.lo); if (d < nd) { nd = d; near = l; } }
  const adm = isAdmin();
  if (!near) { toast('Brak miejscowości na tym kontynencie'); return; }
  if (!adm && nd > 400) { toast('Za daleko od innych miejscowości'); return; }
  if (!adm && nd < 6) { toast(`Za blisko: ${near.n}`); return; }
  const coastNear = LOCS.some(l => l.c === cid && l.port && !l.u && kmLL(la, lo, l.la, l.lo) < 25);
  ui.np = { c: cid, la: +la.toFixed(4), lo: +lo.toFixed(4), near: near.id, nd, ld: near.ld, port: coastNear, t: 'w', n: '', pop: '', adm };
  foundSheet();
}
function foundSheet() {
  const p = ui.np, near = LOC[p.near];
  $('modal').hidden = false;
  $('modal').innerHTML = `<div class="sheet"><div class="row"><b class="grow" style="font-size:17px">Nowa miejscowość — ${CN[p.c].n}</b><button class="btn s" data-a="close">Anuluj</button></div>
    <div class="mut small" style="margin-top:4px">${p.la.toFixed(2).replace('.', ',')}°, ${p.lo.toFixed(2).replace('.', ',')}° · najbliżej: ${esc(near.n)} (${kmTxt(p.nd)})${p.port ? ' · nad morzem' : ''}</div>
    <label class="f" for="npName">Nazwa</label><input id="npName" data-np="n" maxlength="22" placeholder="np. Matiowo" value="${esc(p.n)}">
    <label class="f">Typ</label>
    ${['w', 'm'].map(t => `<button class="wz-opt ${p.t === t ? 'on' : ''}" data-a="npSet" data-v="${t}"><b>${TYPE[t].n}${p.adm ? '' : ' — ' + money(FOUND[t])}</b><span>${TYPE[t].d}</span></button>`).join('')}
    ${p.adm ? `<label class="f" for="npPop">Ludność (opcjonalnie)</label><input id="npPop" data-np="pop" type="number" inputmode="numeric" min="0" value="${esc(p.pop)}" placeholder="np. 2500">
      <button class="toggle ${p.port ? 'on' : ''}" data-a="npPort" style="margin-top:10px;width:100%;min-height:44px">Port (wybrzeże): ${p.port ? 'tak' : 'nie'}</button>`
      : p.port ? '<div class="mut small">Leży nad morzem — będzie można zbudować port.</div>' : ''}
    <div id="npErr" class="warn"></div>
    <div class="btns">${p.adm ? '<button class="btn p" data-a="npFound">Dodaj dla wszystkich graczy</button>'
      : `<button class="btn p" data-a="npFound" ${!canC(S, homeCur(), FOUND[p.t]) ? 'disabled' : ''}>Załóż — ${mH(FOUND[p.t])}</button>`}</div></div>`;
}

// ================== MAPA SZCZEGÓŁOWA (MapLibre + OpenFreeMap: drogi, zabudowa; wymaga internetu) ==================
const MSTYLES = { caros: 'Ciemna 3D (jak CAR OS)', fiord: 'Granatowa', dark: 'Ciemna płaska', liberty: 'Jasna 3D' };
const styleUrl = k => 'https://tiles.openfreemap.org/styles/' + (k === 'caros' ? 'liberty' : k);
// styl CAR OS: „Liberty” z OpenFreeMap przemalowany na ciemno + własne budynki 3D (port z CarMapStyle.kt)
const CP = { bg: '#0B0E12', water: '#0C1A25', green: '#0E1914', building: '#171C23', aero: '#1A1F27', pier: '#151A21', land: '#10141A',
  lWater: '#15344B', lBoundary: '#3A404A', lRail: '#262C34', lCasing: '#06080B', lMotorway: '#677180', lPrimary: '#535C69', lSecondary: '#434B56',
  lPath: '#232931', lAero: '#2B313A', lRoad: '#333A44', text: '#C3C9D0', textPoi: '#8C96A3', textWater: '#4E7FA3', halo: '#0A0C0F', b0: '#1B212A', b1: '#232B36', b2: '#2C3644' };
function applyCaros(map) {
  const has = (id, ...k) => k.some(x => id.includes(x));
  const L = map.getStyle().layers;
  for (const ly of L) {
    const id = ly.id.toLowerCase(), set = (p, v) => { try { map.setPaintProperty(ly.id, p, v); } catch (e) {} };
    try {
      if (ly.type === 'background') set('background-color', CP.bg);
      else if (ly.type === 'fill') {
        if (ly.paint && ly.paint['fill-pattern']) { map.setLayoutProperty(ly.id, 'visibility', 'none'); continue; }
        const c = has(id, 'water', 'ocean', 'lake', 'river') ? CP.water : has(id, 'park', 'wood', 'forest', 'grass', 'wetland', 'landcover', 'scrub', 'farmland', 'meadow') ? CP.green
          : has(id, 'building') ? CP.building : has(id, 'aeroway', 'runway') ? CP.aero : has(id, 'pier', 'bridge') ? CP.pier : CP.land;
        set('fill-color', c); set('fill-outline-color', c);
      } else if (ly.type === 'line') {
        const c = has(id, 'waterway', 'water', 'river', 'stream', 'canal') ? CP.lWater : has(id, 'boundary', 'admin') ? CP.lBoundary : has(id, 'rail', 'transit') ? CP.lRail
          : has(id, 'casing') ? CP.lCasing : has(id, 'motorway', 'trunk') ? CP.lMotorway : has(id, 'primary') ? CP.lPrimary : has(id, 'secondary', 'tertiary') ? CP.lSecondary
          : has(id, 'path', 'footway', 'cycle', 'track', 'pedestrian', 'steps') ? CP.lPath : has(id, 'aeroway', 'runway', 'taxiway') ? CP.lAero : CP.lRoad;
        set('line-color', c);
      } else if (ly.type === 'symbol') {
        const poi = has(id, 'poi');
        set('text-color', has(id, 'water') ? CP.textWater : poi ? CP.textPoi : CP.text); set('text-halo-color', CP.halo); set('text-halo-width', 1.4);
        set('icon-opacity', poi ? .55 : .85);
      } else if (ly.type === 'fill-extrusion' || ly.type === 'raster' || ly.type === 'hillshade') map.setLayoutProperty(ly.id, 'visibility', 'none');
    } catch (e) {}
  }
  const src = Object.keys(map.getStyle().sources).find(k => k === 'openmaptiles') || Object.keys(map.getStyle().sources)[0];
  const firstSym = (L.find(l => l.type === 'symbol') || {}).id;
  if (src && !map.getLayer('xy-bld3d')) try {
    map.addLayer({ id: 'xy-bld3d', type: 'fill-extrusion', source: src, 'source-layer': 'building', minzoom: 14,
      paint: { 'fill-extrusion-color': ['interpolate', ['linear'], ['coalesce', ['get', 'render_height'], 6], 0, CP.b0, 30, CP.b1, 120, CP.b2],
        'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 14, 0, 15.5, ['coalesce', ['get', 'render_height'], 6]],
        'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0], 'fill-extrusion-opacity': .92, 'fill-extrusion-vertical-gradient': true } }, firstSym);
  } catch (e) {}
  try { map.setLight({ anchor: 'viewport', color: '#ffffff', intensity: .5, position: [1.15, 210, 30] }); } catch (e) {}
}
class TiltCtl { // przycisk 3D / 2D
  onAdd(map) { this.m = map; const d = this.d = document.createElement('div'); d.className = 'maplibregl-ctrl maplibregl-ctrl-group';
    d.innerHTML = '<button type="button" class="tiltbtn" aria-label="Widok 3D / 2D">2D</button>';
    d.firstChild.onclick = () => { const p = map.getPitch() > 5 ? 0 : 55; map.easeTo({ pitch: p, duration: 600 }); };
    map.on('pitchend', () => { d.firstChild.textContent = map.getPitch() > 5 ? '2D' : '3D'; }); return d; }
  onRemove() { this.d.remove(); }
}
let LM = null;
function lmapOn() { return (!S || S.mapMode !== 'svg') && !ui.noGL && !!window.maplibregl && navigator.onLine !== false; }
function ensureLM() {
  if (LM) return LM;
  const el = document.createElement('div'); el.className = 'lmapL';
  const sty = S && MSTYLES[S.mapStyle] ? S.mapStyle : 'caros';
  let map;
  try {
    map = new maplibregl.Map({ container: el, style: styleUrl(sty), center: [14.55, 53.43], zoom: 9, pitch: 50, maxPitch: 70,
      attributionControl: { compact: true }, dragRotate: false, pitchWithRotate: false });
  } catch (e) { ui.noGL = true; toast('Ten telefon nie obsługuje mapy szczegółowej — mapa prosta'); return null; }
  map.touchZoomRotate.disableRotation();
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');
  map.addControl(new TiltCtl(), 'top-left');
  LM = { map, el, sty, cid: null, mk: [], ready: false, srcCid: null };
  map.on('style.load', () => { LM.ready = true; LM.srcCid = null; setupLayers(); drawLM(); });
  map.on('error', e => { if (!LM.ready && !LM.err) { LM.err = true; toast('Mapa szczegółowa się nie wczytała (internet?) — Ustawienia → Mapa'); } });
  map.on('movestart', () => { ui.gesture = true; });
  map.on('moveend', () => { ui.gesture = false; });
  map.on('click', e => {
    if (ui.placeB && S) { placeBld(e.lngLat.lat, e.lngLat.lng); return; }
    const bb = [[e.point.x - 12, e.point.y - 12], [e.point.x + 12, e.point.y + 12]];
    const fb = map.getLayer('xy-bld-c') && map.queryRenderedFeatures(bb, { layers: ['xy-bld-c', 'xy-bld-s'] })[0];
    if (fb && S) { bldSheet(fb.properties); return; }
    const f = map.queryRenderedFeatures([[e.point.x - 10, e.point.y - 10], [e.point.x + 10, e.point.y + 10]], { layers: PL_LAYERS.map(x => x[0]) })[0];
    if (!S && ADM.on) { if (f) admEdit(f.properties.id); else placeAtLL(LM.cid, e.lngLat.lat, e.lngLat.lng); return; }
    if (ui.place) { placeAtLL(LM.cid, e.lngLat.lat, e.lngLat.lng); return; }
    if (f) act('bl', { l: f.properties.id, fromMap: '1' });
  });
  return LM;
}
// warstwy naszych miejscowości: większe miasta widać wcześniej, wsie dopiero po przybliżeniu
const PL_LAYERS = [['xy-big', 5e5, 1e12, 0], ['xy-mid', 1e5, 5e5, 4.5], ['xy-small', 1e4, 1e5, 6.5], ['xy-vil', 0, 1e4, 8.5]];
// ===== BUDYNKI NA MAPIE (Twoje i innych graczy) =====
const townR = l => l.t === 'm' ? clamp(2 + Math.sqrt((l.pop || 1e4) / 1e4) * .8, 2, 12) : 1.5; // promień zabudowy w km
function offLL(la, lo, km, deg) { const r = deg * Math.PI / 180; return [la + km / 111.32 * Math.cos(r), lo + km / (111.32 * Math.cos(la * Math.PI / 180)) * Math.sin(r)]; }
function autoPos(lid, key) { // stałe „losowe” miejsce w obrębie miejscowości
  const l = LOC[lid], h = hashS(String(key) + lid), R = townR(l);
  return offLL(l.la, l.lo, R * (.15 + ((h >>> 8) % 1000) / 1000 * .6), h % 360).map(v => +v.toFixed(5));
}
function posOf(lid, b) { if (!(isFinite(b.la) && isFinite(b.lo))) [b.la, b.lo] = autoPos(lid, b.id); return [b.la, b.lo]; }
function garPos(lid, L) { if (!L.gpos) L.gpos = autoPos(lid, 'gar'); return L.gpos; }
const KIND = t => { if (t === 'gar') return 'garage'; const d = B[t] && B[t].d; return d === 'uprawa' || d === 'hodowla' ? 'farm' : d === 'lesn' ? 'tree' : d === 'wydob' ? 'mine' : 'factory'; };
const bName = t => t === 'gar' ? 'Garaż' : B[t] ? B[t].n : t;
let OTH = []; // budynki innych graczy (Firestore /bld)
function iconImg(kind) { // białe ikonki rysowane na płótnie
  const n = 64, c = document.createElement('canvas'); c.width = c.height = n; const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.strokeStyle = '#fff'; g.lineWidth = 5; g.lineJoin = 'round'; g.beginPath();
  if (kind === 'factory') { g.moveTo(10, 52); g.lineTo(10, 30); g.lineTo(22, 22); g.lineTo(22, 30); g.lineTo(34, 22); g.lineTo(34, 30); g.lineTo(44, 22); g.lineTo(44, 10); g.lineTo(52, 10); g.lineTo(52, 52); g.closePath(); g.fill(); }
  else if (kind === 'farm') { g.moveTo(10, 30); g.lineTo(32, 12); g.lineTo(54, 30); g.lineTo(54, 52); g.lineTo(10, 52); g.closePath(); g.fill(); g.fillStyle = '#000'; g.globalCompositeOperation = 'destination-out'; g.fillRect(26, 36, 12, 16); }
  else if (kind === 'tree') { g.moveTo(32, 8); g.lineTo(52, 40); g.lineTo(12, 40); g.closePath(); g.fill(); g.fillRect(28, 38, 8, 16); }
  else if (kind === 'mine') { g.moveTo(8, 52); g.quadraticCurveTo(32, 14, 56, 52); g.closePath(); g.fill(); g.lineWidth = 6; g.beginPath(); g.moveTo(20, 14); g.lineTo(44, 38); g.moveTo(14, 20); g.quadraticCurveTo(24, 6, 38, 10); g.stroke(); }
  else { g.fillRect(6, 24, 34, 20); g.fillRect(40, 30, 16, 14); g.beginPath(); g.arc(18, 48, 6, 0, 7); g.arc(46, 48, 6, 0, 7); g.fill(); } // garaż: ciężarówka
  return g.getImageData(0, 0, n, n);
}
function bldFeatures() {
  const F = [], me = S ? USER && USER.uid : null;
  if (S) for (const lid in S.L) {
    const L = S.L[lid], l = LOC[lid]; if (!l) continue;
    for (const b of L.bld) { const [la, lo] = posOf(lid, b); F.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [lo, la] },
      properties: { own: 1, ic: 'ic-' + KIND(b.t), col: S.color, lb: `${bName(b.t)} ${b.l}`, lid, bid: b.id } }); }
    if (L.gar) { const [la, lo] = garPos(lid, L); F.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [lo, la] },
      properties: { own: 1, ic: 'ic-garage', col: S.color, lb: `Garaż ${L.gar}`, lid, bid: 'gar' } }); }
  }
  for (const p of OTH) { if (p.uid === me) continue;
    for (const it of p.items || []) { if (!isFinite(it.la) || !isFinite(it.lo)) continue; F.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [it.lo, it.la] },
      properties: { own: 0, ic: 'ic-' + KIND(it.t), col: p.color || '#8aa0b6', lb: `${bName(it.t)} · ${clean(p.name || '?')}`, uid: p.uid, t: it.t, l: it.l || 1, lid: it.lid || '' } }); } }
  return F;
}
function circleGeo(la, lo, km) { const c = []; for (let i = 0; i <= 64; i++) { const [a, o] = offLL(la, lo, km, i * 360 / 64); c.push([o, a]); } return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [c] }, properties: {} }; }
// okienko po dotknięciu budynku
function bldSheet(p) {
  $('modal').hidden = false;
  if (p.own) {
    const L = S.L[p.lid], l = LOC[p.lid], b = p.bid === 'gar' ? null : L.bld.find(x => x.id == p.bid);
    const d = b && B[b.t];
    $('modal').innerHTML = `<div class="sheet"><div class="row"><span class="dot" style="background:${esc(S.color)}"></span><b class="grow" style="font-size:17px">${b ? d.n + ' · poz. ' + b.l : 'Garaż · poz. ' + L.gar}</b><button class="btn s" data-a="close">Zamknij</button></div>
      <div class="mut small" style="margin:4px 0 8px">Twoja firma · ${flag(l.cc)} ${esc(l.n)}</div>
      ${b ? `<div class="card"><div class="flow">${flowTxt(d, b.l * (1 + .08 * S.perk.prod), p.lid)}</div>${b.st ? `<div class="warn">${esc(b.st)}</div>` : ''}</div>` : `<div class="card">${garUsed(S, p.lid)}/${garCap(S, p.lid)} pojazdów</div>`}
      <div class="btns"><button class="btn p" data-a="bMove" data-l="${p.lid}" data-id="${p.bid}">Przenieś na mapie</button><button class="btn" data-a="bGo" data-l="${p.lid}">Pokaż w Budowie</button></div></div>`;
  } else {
    const o = OTH.find(x => x.uid === p.uid) || {}, n = (o.items || []).length, l = LOC[p.lid];
    $('modal').innerHTML = `<div class="sheet"><div class="row"><span class="dot" style="background:${esc(o.color || '#8aa0b6')}"></span><b class="grow" style="font-size:17px">${esc(bName(p.t))} · poz. ${+p.l || 1}</b><button class="btn s" data-a="close">Zamknij</button></div>
      <div class="card" style="margin-top:10px"><table><tbody>
        <tr><td class="mut">Właściciel</td><td class="n"><b>${esc(o.name || '?')}</b></td></tr><tr><td class="mut">Prezes</td><td class="n">${esc(o.ceo || '—')}</td></tr>
        ${l ? `<tr><td class="mut">Miejscowość</td><td class="n">${flag(l.cc)} ${esc(l.n)}</td></tr>` : ''}
        <tr><td class="mut">Budynków firmy</td><td class="n">${n}</td></tr><tr><td class="mut">Wartość firmy</td><td class="n">${mH(o.worth || 0)}</td></tr>
        <tr><td class="mut">Aktywność</td><td class="n">${ago(o.ts)}</td></tr></tbody></table></div></div>`;
  }
}

function setupLayers() {
  const map = LM.map;
  if ((S && S.mapStyle ? S.mapStyle : 'caros') === 'caros' || (!S && LM.sty === 'caros')) applyCaros(map);
  // polskie nazwy na podkładzie, gdzie są dostępne
  for (const ly of map.getStyle().layers) {
    if (ly.type !== 'symbol') continue;
    const tf = map.getLayoutProperty(ly.id, 'text-field');
    if (tf && JSON.stringify(tf).includes('name')) try { map.setLayoutProperty(ly.id, 'text-field', ['coalesce', ['get', 'name:pl'], ['get', 'name:latin'], ['get', 'name']]); } catch (e) {}
  }
  map.addSource('xy-pl', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addSource('xy-veh', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  const popR = ['interpolate', ['linear'], ['get', 'p'], 1000, 2.2, 1e4, 3.2, 1e5, 5, 1e6, 8, 1e7, 12];
  for (const [id, lo, hi, minz] of PL_LAYERS) map.addLayer({ id, type: 'circle', source: 'xy-pl', minzoom: minz,
    filter: ['all', ['>=', ['get', 'p'], lo], ['<', ['get', 'p'], hi]],
    paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, ['*', .7, popR], 10, ['*', 1.2, popR], 15, ['*', 1.8, popR]],
      'circle-color': ['case', ['==', ['get', 't'], 'm'], '#a9bfd6', '#86c98a'], 'circle-opacity': .9,
      'circle-stroke-color': '#0b131b', 'circle-stroke-width': 1 } });
  map.addLayer({ id: 'xy-veh-l', type: 'line', source: 'xy-veh', paint: { 'line-color': '#f5c542', 'line-width': 2, 'line-dasharray': [3, 2] } });
  map.addSource('xy-rad', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addLayer({ id: 'xy-rad-f', type: 'fill', source: 'xy-rad', paint: { 'fill-color': '#e0823f', 'fill-opacity': .08 } });
  map.addLayer({ id: 'xy-rad-l', type: 'line', source: 'xy-rad', paint: { 'line-color': '#e0823f', 'line-width': 2, 'line-dasharray': [2, 2] } });
  for (const k of ['factory', 'farm', 'tree', 'mine', 'garage']) if (!map.hasImage('ic-' + k)) map.addImage('ic-' + k, iconImg(k), { pixelRatio: 2 });
  map.addSource('xy-bld', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addLayer({ id: 'xy-bld-c', type: 'circle', source: 'xy-bld', minzoom: 10,
    paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 5, 13, 10, 16, 15], 'circle-color': ['get', 'col'],
      'circle-stroke-color': ['case', ['==', ['get', 'own'], 1], '#ffffff', '#0b131b'], 'circle-stroke-width': 2, 'circle-pitch-alignment': 'viewport' } });
  map.addLayer({ id: 'xy-bld-s', type: 'symbol', source: 'xy-bld', minzoom: 10,
    layout: { 'icon-image': ['get', 'ic'], 'icon-size': ['interpolate', ['linear'], ['zoom'], 10, .28, 13, .5, 16, .75], 'icon-allow-overlap': true,
      'text-field': ['step', ['zoom'], '', 12.5, ['get', 'lb']], 'text-font': ['Noto Sans Regular'], 'text-size': 11, 'text-offset': [0, 1.5], 'text-anchor': 'top', 'text-optional': true },
    paint: { 'text-color': '#eef0f3', 'text-halo-color': '#0a0c0f', 'text-halo-width': 1.4 } });
}
function mountLM(cid, sel) {
  const slot = $('lmapSlot'), lm = ensureLM();
  if (!slot) return; if (!lm) { render(true); return; }
  slot.appendChild(lm.el); lm.map.resize();
  lm.el.classList.toggle('placing', !!(ui.place || ui.placeB));
  const l = LOC[sel];
  if (lm.cid !== cid) {
    lm.cid = cid;
    if (l && l.c === cid) lm.map.jumpTo({ center: [l.lo, l.la], zoom: 10.5, pitch: 50 });
    else { const b = MAPS[cid].box; lm.map.fitBounds([b[0], b[1]], { animate: false }); }
  } else if (ui.flyB) { const t = LOC[ui.flyB]; lm.map.flyTo({ center: [t.lo, t.la], zoom: t.t === 'm' ? 13 : 14.5, pitch: 50, duration: 900 }); ui.flyB = null; }
  else if (ui.fitB) lm.map.fitBounds(ui.fitB, { padding: 30, maxZoom: 11 });
  else if (ui.panTo && l) lm.map.easeTo({ center: [l.lo, l.la], zoom: Math.max(lm.map.getZoom(), 9.5) });
  ui.panTo = false; ui.fitB = null;
  drawLM();
}
function drawLM() {
  const lm = LM; if (!lm || !lm.ready || !lm.cid) return;
  const map = lm.map, cid = lm.cid;
  if (lm.srcCid !== cid) { // dane kontynentu ładowane raz
    lm.srcCid = cid;
    map.getSource('xy-pl').setData({ type: 'FeatureCollection', features: BYC[cid].map(l => ({ type: 'Feature',
      geometry: { type: 'Point', coordinates: [l.lo, l.la] }, properties: { id: l.id, p: l.pop || (l.t === 'm' ? 1e4 : 1000), t: l.t } })) });
  }
  // Twoje / wybrana / własne miejscowości i pojazdy jako znaczniki z podpisem
  for (const m of lm.mk) m.remove(); lm.mk = [];
  const SS = S || { L: {}, veh: [], color: '#e0823f', hour: 0 };
  const ids = new Set([ui.bl, ...Object.keys(SS.L), ...LOCS.filter(l => l.u || (!S && l.g)).map(l => l.id)]);
  for (const id of ids) {
    const l = LOC[id]; if (!l || l.c !== cid) continue;
    const L = SS.L[id], mine = !!(L && (L.bld.length || L.gar || Object.keys(L.inv).length)), on = id === ui.bl;
    const d = document.createElement('div'); d.className = 'mk' + (on ? ' on' : '') + (mine ? ' mine' : '');
    d.innerHTML = `<i style="background:${mine ? SS.color : l.g ? '#ff8fe0' : l.u ? '#ffc98a' : l.t === 'm' ? '#a9bfd6' : '#86c98a'};${L && L.port ? 'box-shadow:0 0 0 3px #4aa3ff' : ''}"></i><span>${esc(l.n)}</span>`;
    d.addEventListener('click', ev => {
      ev.stopPropagation(); if (!S) { if (ADM.on) admEdit(id); return; }
      const r = lm.el.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top; // budynek pod znacznikiem ma pierwszeństwo
      const fb = map.getLayer('xy-bld-c') && map.queryRenderedFeatures([[x - 12, y - 12], [x + 12, y + 12]], { layers: ['xy-bld-c'] })[0];
      if (fb) { bldSheet(fb.properties); return; }
      if (!ui.place) act('bl', { l: id, fromMap: '1' });
    });
    lm.mk.push(new maplibregl.Marker({ element: d, anchor: 'bottom', offset: [0, on ? 9 : 7] }).setLngLat([l.lo, l.la]).addTo(map));
  }
  const lines = [];
  for (const v of SS.veh) {
    if (v.st !== 'go') continue;
    const a = LOC[v.from], c = LOC[v.to], p = clamp(1 - (v.eta - SS.hour) / v.dur, 0, 1);
    lines.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: [[a.lo, a.la], [c.lo, c.la]] }, properties: {} });
    const d = document.createElement('div'); d.className = 'mk veh'; d.innerHTML = `<i></i><span>${VEH[v.k].n} #${v.id}</span>`;
    lm.mk.push(new maplibregl.Marker({ element: d, anchor: 'bottom', offset: [0, 6] }).setLngLat([a.lo + (c.lo - a.lo) * p, a.la + (c.la - a.la) * p]).addTo(map));
  }
  map.getSource('xy-veh').setData({ type: 'FeatureCollection', features: lines });
  try { map.getSource('xy-bld').setData({ type: 'FeatureCollection', features: bldFeatures() }); } catch (e) {}
  const pb = ui.placeB, pl = pb && LOC[pb.lid];
  try { map.getSource('xy-rad').setData({ type: 'FeatureCollection', features: pl ? [circleGeo(pl.la, pl.lo, townR(pl))] : [] }); } catch (e) {}
}

function ctryList(cid) { // państwa kontynentu: Twoje licencje najpierw, potem wg liczby miejscowości
  const m = {}; for (const l of BYC[cid]) if (l.cc) m[l.cc] = (m[l.cc] || 0) + 1;
  return Object.keys(m).sort((a, b) => (!!S.lic[b] - !!S.lic[a]) || m[b] - m[a]);
}
function regList(cc, cid) { const m = new Map(); for (const l of BYC[cid]) if (l.cc === cc && l.rg >= 0) m.set(l.rg, (m.get(l.rg) || 0) + 1);
  return [...m.keys()].sort((a, b) => REG[a][0].localeCompare(REG[b][0], 'pl')); }
function fitTo(ls) { // pokaż obszar (państwo/region) na mapie
  if (!ls.length) return;
  let a0 = 90, a1 = -90, o0 = 180, o1 = -180;
  for (const l of ls) { a0 = Math.min(a0, l.la); a1 = Math.max(a1, l.la); o0 = Math.min(o0, l.lo); o1 = Math.max(o1, l.lo); }
  ui.fitB = [[o0, a0], [o1, a1]];
  const cid = ls[0].c, m = MAPS[cid], pr = projOf(cid);
  if (pr) { const p0 = pr([o0, a1]), p1 = pr([o1, a0]); const w = Math.max(20, p1[0] - p0[0]), hgt = Math.max(20, p1[1] - p0[1]);
    zoomAt(cid, Math.min(m.w / w, m.h / hgt) * .8, (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2); }
}
function placeBld(la, lo) { // postawienie / przeniesienie budynku w klikniętym miejscu
  const p = ui.placeB, l = LOC[p.lid], dk = kmLL(la, lo, l.la, l.lo), R = townR(l);
  if (dk > R) { toast(`Za daleko od centrum: ${l.n} (max ${String(+R.toFixed(1)).replace('.', ',')} km)`); return; }
  const pos = { la: +la.toFixed(5), lo: +lo.toFixed(5) };
  ui.placeB = null;
  if (p.k === 'b') act('build', { l: p.lid, b: p.b, ...pos });
  else if (p.k === 'g') act('garage', { l: p.lid, ...pos });
  else if (p.k === 'mv') { const L = S.L[p.lid]; if (p.id === 'gar') L.gpos = [pos.la, pos.lo]; else { const b = L.bld.find(x => x.id == p.id); if (b) Object.assign(b, pos); } toast('Przeniesiono'); save(); render(true); }
}
function vBudowa() {
  const cid = ui.bc, c = CN[cid];
  let h = contChips(cid);
  if (!LOC[ui.bl] || LOC[ui.bl].c !== cid) ui.bl = Object.keys(S.L).find(l => LOC[l] && LOC[l].c === cid) || CAP[cid];
  const lid = ui.bl, l = LOC[lid], t = TYPE[l.t], L = S.L[lid] || newLoc(), fr = slots(L, lid) - used(L), lic = hasLic(lid), land = landOf(lid);
  const cl = ctryList(cid), rl = regList(l.cc, cid);
  h += `<div class="grid2 ctry"><div><label class="f">Państwo</label><select data-in="bcc">${cl.map(cc => `<option value="${cc}" ${cc === l.cc ? 'selected' : ''}>${flag(cc)} ${cName(cc)}${S.lic[cc] ? ' ✓' : ''}</option>`).join('')}</select></div>
    <div><label class="f">Region</label><select data-in="brg"><option value="">— cały kraj —</option>${rl.map(r => `<option value="${r}" ${r === l.rg && ui.rgSel ? 'selected' : ''}>${esc(REG[r][0])}</option>`).join('')}</select></div></div>`;
  const nC = BYC[cid].length;
  h += (ui.place ? `<div class="placebar"><span class="grow">${isAdmin() ? 'ADMIN: dotknij mapy — miejscowość pojawi się u wszystkich graczy.' : 'Dotknij mapy w miejscu, gdzie ma powstać nowa miejscowość.'}</span><button class="btn s" data-a="placeOff">Anuluj</button></div>` : '')
    + (ui.placeB ? `<div class="placebar"><span class="grow">Dotknij mapy w obrębie <b>${esc(LOC[ui.placeB.lid].n)}</b> (pomarańczowy okrąg), gdzie postawić: <b>${ui.placeB.k === 'mv' ? 'nowe miejsce' : ui.placeB.k === 'g' ? 'Garaż' : B[ui.placeB.b].n}</b></span>
        ${ui.placeB.k !== 'mv' ? '<button class="btn s" data-a="pbAuto">Losowo</button>' : ''}<button class="btn s" data-a="pbOff">Anuluj</button></div>` : '')
    + (lmapOn() ? '<div id="lmapSlot" class="lslot"></div>' : locMap(cid, lid))
    + `<div class="lsearch"><input id="locQ" data-q="1" type="search" placeholder="Szukaj wśród ${nC.toLocaleString('pl-PL')} miejscowości…" value="${esc(ui.locQ || '')}" autocomplete="off">
       </div><div id="locRes">${locRes(cid, lid)}</div>`;
  h += `<div class="card"><div class="row"><div class="grow"><span class="bname">${esc(l.n)}</span> ${tag(l)}${l.port ? ' <span class="ltag p">Wybrzeże</span>' : ''}${l.u ? ' <span class="ltag u">Twoja osada</span>' : ''}${l.g ? ' <span class="ltag g">Nowa</span>' : ''}
      <div class="flow">${flag(l.cc)} ${cName(l.cc)}${rName(l) ? ' · ' + esc(rName(l)) : ''}${l.pop ? ` · ${popTxt(l.pop)} mieszk.` : ''}</div>
      <div class="flow">${t.d}</div>
      <div class="flow">Bonusy: państwo ${bonList(cRes(l.cc))} · region ${bonList(rRes(l.rg))}</div>
      <div class="flow">Podatek od sprzedaży ${Math.round(taxOf(lid) * 100)}%${EU.has(l.cc) ? ' · UE (bez cła)' : ''} · waluta: <b>${curOf(lid)}</b> (masz ${fmtC(wal(S, curOf(lid)), curOf(lid))})</div></div></div>
    ${lic ? '' : `<div class="lic"><div class="grow"><b>Brak licencji: ${flag(l.cc)} ${cName(l.cc)}</b><div class="mut small">Państwo ${TIERS[tierOf(l.cc)].n} — bez licencji nie zbudujesz tu nic.</div></div>
      <button class="btn p" data-a="lic" data-cc="${l.cc}" ${!canC(S, curOfCC(l.cc), licCost(l.cc)) ? 'disabled' : ''}>Kup licencję — ${mC(licCost(l.cc), curOfCC(l.cc))}</button>
      ${!canC(S, curOfCC(l.cc), licCost(l.cc)) ? `<div class="mut small" style="flex-basis:100%">Płacisz w walucie: ${curName(curOfCC(l.cc))}. Masz ${fmtC(wal(S, curOfCC(l.cc)), curOfCC(l.cc))} — wymień w kantorze (Rynek).</div>` : ''}</div>`}
    <div class="row" style="margin-top:8px"><div class="grow">Działki: <b>${used(L)} / ${slots(L, lid)}</b> <span class="mut small">· działka ${mL(land, lid)}</span></div>
    ${L.x < t.maxX ? `<button class="btn s" data-a="expand" data-l="${lid}" ${!canL(lid, xCost(L, lid)) || !lic ? 'disabled' : ''}>+${t.step} dział${t.step > 1 ? 'ki' : 'ka'} — ${mL(xCost(L, lid), lid)}</button>` : '<span class="mut small">maks. działek</span>'}</div>
    <div class="row" style="margin-top:8px"><div class="grow">Garaż: ${L.gar ? `<b>poz. ${L.gar}</b> <span class="mut small">· ${garUsed(S, lid)}/${garCap(S, lid)} pojazdów</span>` : '<span class="mut">brak</span>'}</div>
    ${L.gar ? `<button class="btn s" data-a="garUp" data-l="${lid}" ${!canL(lid, garUp(L)) ? 'disabled' : ''}>Rozbuduj — ${mL(garUp(L), lid)}</button>`
      : `<button class="btn s g" data-a="${lmapOn() ? 'garPick' : 'garage'}" data-l="${lid}" ${!canL(lid, GARAGE_COST + land) || fr < 1 || !lic ? 'disabled' : ''}>Zbuduj — ${mL(GARAGE_COST + land, lid)}</button>`}</div>
    ${l.port ? `<div class="row" style="margin-top:8px"><div class="grow">Port: ${L.port ? '<b class="pos">czynny</b>' : '<span class="mut">brak</span>'}</div>
      ${L.port ? '' : `<button class="btn s p" data-a="port" data-l="${lid}" ${!canL(lid, PORT_COST) || !lic ? 'disabled' : ''}>Zbuduj — ${mL(PORT_COST, lid)}</button>`}</div>` : ''}</div>`;
  h += `<h2>Zakłady — ${l.n}</h2>`;
  if (!L.bld.length) h += `<div class="card mut">Brak zakładów. Zbuduj coś poniżej.</div>`;
  for (const b of L.bld) {
    const d = B[b.t], k = b.l * (1 + .08 * S.perk.prod), uc = upCost(b);
    h += `<div class="card"><div class="row"><div class="grow"><span class="tier t${d.t}">${TIER[d.t]}</span><span class="bname">${d.n}</span> <span class="mut">poz. ${b.l}</span></div></div>
      <div class="flow">${flowTxt(d, k, lid)}</div>${b.st ? `<div class="warn">${esc(b.st)}</div>` : ''}
      <div class="btns"><button class="btn s g" data-a="up" data-l="${lid}" data-id="${b.id}" ${!canL(lid, uc) ? 'disabled' : ''}>Ulepsz — ${mL(uc, lid)}</button>
      ${lmapOn() ? `<button class="btn s" data-a="bMove" data-l="${lid}" data-id="${b.id}">Przenieś</button>` : ''}
      <button class="btn s" data-a="demo" data-l="${lid}" data-id="${b.id}">Sprzedaj za ${mL(bldValue(b), lid)}</button></div></div>`;
  }
  const dep = DEP.find(x => x.id === ui.dep);
  h += `<div class="deph"><h2 class="grow">${dep ? `${dep.i} ${dep.n}` : `Wybierz dział przemysłu`}<span class="mut small"> · ${fr < 1 ? 'brak wolnych działek' : `wolne działki: ${fr}`}</span></h2>
    <div class="depbtns"><button class="btn s b" data-a="recipes">☰ Przepisy</button><button class="btn s b" data-a="priceMap">🗺 Mapa cen</button>${dep ? `<button class="btn s b" data-a="dep" data-v="">‹</button>` : ''}</div></div>`;
  if (!dep) {
    h += `<div class="deps">${DEP.map(x => { const n = L ? L.bld.filter(b => B[b.t].d === x.id).length : 0, k = Object.values(B).filter(d => d.d === x.id).length;
      return `<button class="depc" data-a="dep" data-v="${x.id}"><span class="depi">${x.i}</span><b>${x.n}</b><span class="mut small">${k} zakład${k > 4 ? 'ów' : k > 1 ? 'y' : ''}${n ? ` · masz tu ${n}` : ''}</span><span class="depgo">BUDUJ</span></button>`; }).join('')}</div>`;
    return h;
  }
  for (const [id, d] of Object.entries(B).filter(([, d]) => d.d === dep.id)) {
    const ti = d.t, cost = d.cost + land, bon = d.in ? t.fac : t.raw;
    const rb = !d.in ? Object.keys(d.out).map(g => resF(S, lid, g)).reduce((a, b) => Math.max(a, b), 0) : 1, tot = bon * rb;
    h += `<div class="card rise"><div class="row"><div class="grow"><span class="tier t${ti}">${TIER[ti]}</span><span class="bname">${d.n}</span>${Math.abs(tot - 1) > .005 ? ` <span class="${tot > 1 ? 'pos' : 'neg'} small">${tot > 1 ? '+' : '−'}${Math.round(Math.abs(tot - 1) * 100)}%</span>` : ''}</div>
      <button class="btn s p" data-a="${lmapOn() ? 'buildPick' : 'build'}" data-l="${lid}" data-b="${id}" ${!canL(lid, cost) || fr < 1 || !lic ? 'disabled' : ''}>${mL(cost, lid)}</button></div>
      <div class="flow">${flowTxt(d, 1 + .08 * S.perk.prod, lid)}</div></div>`;
  }
  return h;
}

// ===== PRZEPISY =====
function openRecipes() {
  $('modal').hidden = false;
  const q = (ui.rq || '').toLowerCase(), dsel = ui.rdep || '';
  const rows = Object.entries(B).filter(([, d]) => (!dsel || d.d === dsel) && (!q || d.n.toLowerCase().includes(q) || Object.keys({ ...d.in, ...d.out }).some(g => G[g].n.toLowerCase().includes(q))));
  const gl = (o) => Object.entries(o).map(([g, v]) => `<span class="rg">${qty(v)} ${G[g].n}</span>`).join(' + ');
  const body = DEP.filter(x => rows.some(([, d]) => d.d === x.id)).map(x => `<h2>${x.i} ${x.n}</h2>` + rows.filter(([, d]) => d.d === x.id).map(([id, d]) =>
    `<div class="card rcp"><div class="row"><div class="grow"><span class="tier t${d.t}">${TIER[d.t]}</span><span class="bname">${d.n}</span></div><span class="mut small">${mH(d.cost)}</span></div>
      <div class="flow">${d.in ? gl(d.in) + ' → ' : ''}${gl(d.out)} <span class="mut">/h</span></div></div>`).join('')).join('') || '<div class="card mut">Nic nie znaleziono.</div>';
  $('modal').innerHTML = `<div class="sheet tall"><div class="row"><b class="grow" style="font-size:17px">☰ Przepisy na produkty</b><button class="btn s" data-a="close">Zamknij</button></div>
    <div class="grid2" style="margin:10px 0"><input id="rq" data-rq="1" placeholder="Szukaj towaru lub zakładu" value="${esc(ui.rq || '')}">
    <select data-in="rdep"><option value="">Wszystkie działy</option>${DEP.map(x => `<option value="${x.id}" ${x.id === dsel ? 'selected' : ''}>${x.i} ${x.n}</option>`).join('')}</select></div>
    <div class="mut small" style="margin-bottom:6px">Wartości na 1 poziom zakładu, bez bonusów miejscowości. Ceny w ${homeCur()}.</div><div id="rcpBody">${body}</div></div>`;
  if (q) { const i = $('rq'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
}
// ===== MAPA CEN =====
let CPTS = null, PMAP = null;
function ctryPts() { // największa miejscowość każdego państwa
  if (CPTS) return CPTS; const best = {};
  for (const l of LOCS) if (l.cc && (!best[l.cc] || (l.pop || 0) > (best[l.cc].pop || 0))) best[l.cc] = l;
  return CPTS = Object.values(best);
}
function priceData(g) {
  const hc = homeCur(), pts = ctryPts().map(l => ({ l, v: price(g) * cpf(l.cc, g) })), vs = pts.map(p => p.v), mn = Math.min(...vs), mx = Math.max(...vs);
  return { pts, mn, mx, hc, geo: { type: 'FeatureCollection', features: pts.map(p => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [p.l.lo, p.l.la] },
    properties: { k: mx > mn ? (p.v - mn) / (mx - mn) : .5, t: fmtC(p.v * rate(hc), hc), cc: p.l.cc } })) } };
}
function openPriceMap() {
  $('modal').hidden = false;
  const g = ui.pmg || ui.buyG || 'zboze', D = priceData(g), srt = [...D.pts].sort((a, b) => b.v - a.v);
  const row = p => `<div class="row pmr"><span class="grow">${flag(p.l.cc)} ${esc(cName(p.l.cc))}</span><span class="pmbar"><i style="width:${(D.mx > D.mn ? (p.v - D.mn) / (D.mx - D.mn) : .5) * 100}%"></i></span><b class="n">${mC(p.v, D.hc)}</b></div>`;
  $('modal').innerHTML = `<div class="sheet tall"><div class="row"><b class="grow" style="font-size:17px">🗺 Mapa cen zasobów</b><button class="btn s" data-a="close">Zamknij</button></div>
    <select data-in="pmg" style="margin:10px 0">${DEP.map(x => { const gs = GK.filter(k => GDEP(k) === x.id); return gs.length ? `<optgroup label="${x.n}">${gs.map(k => `<option value="${k}" ${k === g ? 'selected' : ''}>${G[k].n}</option>`).join('')}</optgroup>` : ''; }).join('')}</select>
    <div id="pmap" class="pmap"></div>
    <div class="pmleg"><span>${mC(D.mn, D.hc)}</span><i></i><span>${mC(D.mx, D.hc)}</span></div>
    <div class="mut small" style="margin:6px 2px 4px">Cena sprzedaży przed podatkiem, w ${D.hc}. Surowce są tańsze tam, gdzie ich dużo — wieź je tam, gdzie są drogie.</div>
    <h2>Najdrożej</h2><div class="card">${srt.slice(0, 8).map(row).join('')}</div>
    <h2>Najtaniej</h2><div class="card">${srt.slice(-8).reverse().map(row).join('')}</div></div>`;
  drawPriceMap(D);
}
function drawPriceMap(D) {
  const el = $('pmap'); if (!el) return;
  if (!window.maplibregl || ui.noGL) { el.remove(); return; }
  try { if (PMAP) PMAP.remove(); } catch (e) {}
  try {
    const m = PMAP = new maplibregl.Map({ container: el, style: styleUrl('caros'), center: [15, 50], zoom: 2.6, attributionControl: { compact: true }, dragRotate: false, pitchWithRotate: false });
    m.touchZoomRotate.disableRotation();
    m.on('style.load', () => {
      try { applyCaros(m); } catch (e) {}
      m.addSource('pm', { type: 'geojson', data: D.geo });
      m.addLayer({ id: 'pm-c', type: 'circle', source: 'pm', paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 6, 6, 14],
        'circle-color': ['interpolate', ['linear'], ['get', 'k'], 0, '#3fb4ff', .5, '#f5c542', 1, '#ff5a4f'], 'circle-stroke-width': 1.5, 'circle-stroke-color': '#0b0e12', 'circle-opacity': .95 } });
      m.addLayer({ id: 'pm-t', type: 'symbol', source: 'pm', minzoom: 3.4, layout: { 'text-field': ['get', 't'], 'text-size': 11, 'text-offset': [0, 1.3], 'text-font': ['Noto Sans Bold'] },
        paint: { 'text-color': '#e8eef5', 'text-halo-color': '#0b0e12', 'text-halo-width': 1.4 } });
      m.on('click', 'pm-c', e => { const p = e.features[0].properties; toast(`${flag(p.cc)} ${cName(p.cc)}: ${p.t}`); });
    });
  } catch (e) { el.remove(); }
}
// ===== KANTOR =====
const fxTxt = (a, b) => { const r = rate(b) / rate(a); return `1 ${a} = ${r >= 100 ? Math.round(r).toLocaleString('pl-PL') : r.toFixed(r >= 1 ? 3 : 5).replace('.', ',')} ${b}`; };
function exPreview() {
  const e = ui.ex, a = parseFloat(String(e.amt).replace(',', '.')) || 0, got = a / rate(e.from) * rate(e.to) * (1 - SPREAD);
  return a > 0 ? `Otrzymasz ≈ <b>${fmtC(got, e.to)}</b> · ${fxTxt(e.from, e.to)} · prowizja ${String(SPREAD * 100).replace('.', ',')}%` : `${fxTxt(e.from, e.to)} · prowizja ${String(SPREAD * 100).replace('.', ',')}%`;
}
function kantor() {
  const hc = homeCur();
  const ws = Object.keys(S.w).filter(c => c === hc || Math.abs(S.w[c]) >= .005).sort((a, b) => (b === hc) - (a === hc) || wal(S, b) / rate(b) - wal(S, a) / rate(a));
  const need = [...new Set([...ws, ...Object.keys(S.lic || {}).map(curOfCC), ...Object.keys(S.L).map(curOf), 'EUR', 'USD', 'GBP', 'PLN', 'CHF'])];
  const all = [...need, ...Object.keys(FX0).filter(c => !need.includes(c)).sort()];
  const e = ui.ex || (ui.ex = { from: hc, to: need.find(c => c !== hc) || 'EUR', amt: '' });
  if (!ws.includes(e.from)) e.from = ws[0];
  if (e.to === e.from) e.to = all.find(c => c !== e.from);
  const trend = c => { if (c === hc) return ''; const now = rate(hc) / rate(c), was = (FX0[hc] * ((S.fxp || {})[hc] || 1)) / (FX0[c] * ((S.fxp || {})[c] || 1)), ch = (now - was) / was * 100;
    return `<span class="${ch >= 0 ? 'pos' : 'neg'} small">${ch >= 0 ? '▲' : '▼'} ${Math.abs(ch).toFixed(2).replace('.', ',')}%</span>`; };
  return `<h2 class="kantor">Kantor i portfele</h2><div class="card">
    ${ws.map(c => `<div class="row wallet"><div class="grow"><b>${fmtC(wal(S, c), c)}</b><div class="mut small">${esc(curName(c))}${c !== hc ? ' · ' + fxTxt(c, hc) : ' · waluta siedziby'}</div></div>
      <div class="n">${c !== hc ? `≈ ${fmtC(wal(S, c) / rate(c) * rate(hc), hc)}<br>` : ''}${trend(c)}</div></div>`).join('')}
    <div class="grid2" style="margin-top:10px"><div><label class="f">Z waluty</label><select data-in="exFrom">${ws.map(c => `<option value="${c}" ${c === e.from ? 'selected' : ''}>${c} · ${fmtC(wal(S, c), c)}</option>`).join('')}</select></div>
      <div><label class="f">Na walutę</label><select data-in="exTo">${all.filter(c => c !== e.from).map(c => `<option value="${c}" ${c === e.to ? 'selected' : ''}>${c} — ${esc(curName(c))}</option>`).join('')}</select></div></div>
    <label class="f" for="exA">Kwota (${e.from})</label><div class="row"><input id="exA" data-exa="1" type="number" inputmode="decimal" min="0" step="any" value="${esc(e.amt)}" placeholder="0"><button class="btn s" data-a="exMax">Max</button></div>
    <div id="exOut" class="mut small" style="margin:8px 2px">${exPreview()}</div>
    <div class="btns"><button class="btn p" data-a="exch">Wymień</button></div></div>`;
}
function vMagazyn() {
  const list = LOCS.filter(l => S.L[l.id]);
  if (!S.L[ui.ml]) ui.ml = S.L[S.hl] ? S.hl : list[0].id;
  const lid = ui.ml, L = S.L[lid], l = LOC[lid];
  let h = kantor() + `<h2>Magazyny</h2>` + locChips(list, lid, 'ml');
  const items = Object.entries(L.inv).filter(([, q]) => q >= .05);
  h += `<h2>Magazyn — ${flag(l.cc)} ${l.n} · ceny ${l.t === 'm' ? '+5% (miasto)' : '−5% (wieś)'} · podatek ${Math.round(taxOf(lid) * 100)}%</h2><div class="card">`;
  if (!items.length && !Object.values(L.auto).some(Boolean)) h += `<div class="mut">Magazyn pusty.</div>`;
  const shown = new Set(items.map(([g]) => g));
  for (const g in L.auto) if (L.auto[g] && !shown.has(g)) items.push([g, 0]);
  for (const [g, q] of items) {
    const p = sellPrice(g, Math.max(q, 1)) * lpf(lid, g) * T(lid).sell * (1 - taxOf(lid));
    h += `<div style="padding:8px 0;border-bottom:1px solid var(--line)">
      <div class="row"><div class="grow"><b>${G[g].n}</b> <span class="mut">· ${mL(price(g) * lpf(lid, g) * T(lid).sell, lid)}/szt.</span></div><div class="q"><b>${qty(q)}</b></div></div>
      <div class="btns">
        <button class="btn s g" data-a="sell" data-l="${lid}" data-g="${g}" data-f=".5" ${q < 1 ? 'disabled' : ''}>Sprzedaj ½</button>
        <button class="btn s g" data-a="sell" data-l="${lid}" data-g="${g}" data-f="1" ${q < 1 ? 'disabled' : ''}>Wszystko ≈ ${mL(p * Math.floor(q), lid)}</button>
        <button class="toggle ${L.auto[g] ? 'on' : ''}" data-a="auto" data-l="${lid}" data-g="${g}">Auto ${L.auto[g] ? 'wł.' : 'wył.'}</button>
      </div></div>`;
  }
  h += `</div>`;
  const bq = Math.max(1, Math.floor(ui.buyQ) || 1), bc = buyPrice(ui.buyG, bq) * lpf(lid, ui.buyG) * bq;
  h += `<h2>Kup na rynku → ${l.n}</h2><div class="card"><div class="grid2">
    <div><label class="f" for="buyG">Towar</label><select id="buyG" data-in="buyG">${DEP.map(x => { const gs = GK.filter(g => GDEP(g) === x.id); return gs.length ? `<optgroup label="${x.n}">${gs.map(g => `<option value="${g}" ${g === ui.buyG ? 'selected' : ''}>${G[g].n}</option>`).join('')}</optgroup>` : ''; }).join('')}</select></div>
    <div><label class="f" for="buyQ">Ilość</label><input id="buyQ" data-in="buyQ" type="number" inputmode="numeric" min="1" value="${bq}"></div></div>
    <div class="btns"><button class="btn p" data-a="buy" data-l="${lid}" ${!canL(lid, bc) ? 'disabled' : ''}>Kup za ${mL(bc, lid)}</button><span class="mut small" style="align-self:center">marża rynku 15%</span></div></div>`;
  const pd = ui.pdep || 'all', pg = GK.filter(g => pd === 'all' || GDEP(g) === pd);
  h += `<div class="deph"><h2 class="grow">Ceny — ${flag(l.cc)} ${esc(cName(l.cc))} (2 dni)</h2><div class="depbtns"><button class="btn s b" data-a="priceMap">🗺 Mapa cen</button></div></div>
    <select data-in="pdep" style="margin-bottom:8px"><option value="all">Wszystkie działy (${GK.length} towarów)</option>${DEP.map(x => `<option value="${x.id}" ${x.id === pd ? 'selected' : ''}>${x.i} ${x.n}</option>`).join('')}</select>
    <div class="card"><table><thead><tr><th>Towar</th><th class="n">Cena</th><th class="n">Zmiana</th><th></th></tr></thead><tbody>
    ${pg.map(g => { const c = chg(g); return `<tr><td>${G[g].n}</td><td class="n">${mL(price(g) * lpf(lid, g), lid)}</td><td class="n ${c >= 0 ? 'pos' : 'neg'}">${c >= 0 ? '+' : ''}${c.toFixed(1).replace('.', ',')}%</td><td>${spark([...S.m[g].h, price(g)])}</td></tr>`; }).join('')}
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
  const duty = dutyOf(u.at, f.to, f.g, q), hrs = hrsF(f.to), fee = feeF(f.to, q) + duty;
  return `<div class="grid2"><div><label class="f">Cel</label><select data-in="${kind}" data-s="${u.id}" data-k="to">${dests.map(d => `<option value="${d}" ${d === f.to ? 'selected' : ''}>${flag(LOC[d].cc)} ${LOC[d].n} · ${kmTxt(km(u.at, d))}</option>`).join('')}</select></div>
    <div><label class="f">Ładunek</label><select data-in="${kind}" data-s="${u.id}" data-k="g"><option value="">— pusty —</option>${goods.map(g => `<option value="${g}" ${g === f.g ? 'selected' : ''}>${G[g].n} (${qty(inv[g])})</option>`).join('')}</select></div></div>
    ${f.g ? `<label class="f">Ilość (max ${maxQ})</label><input type="number" inputmode="numeric" data-in="${kind}" data-s="${u.id}" data-k="q" value="${q}" min="0" max="${maxQ}">` : ''}
    <div class="btns"><button class="btn p" data-a="${kind === 'sf' ? 'send' : 'drive'}" data-id="${u.id}" ${!canL(u.at, fee) ? 'disabled' : ''}>Wyślij · ${hrs} h · ${mL(fee, u.at)}</button>${duty ? `<span class="mut small" style="align-self:center">w tym cło ${mL(duty, u.at)} (${cName(LOC[u.at].cc)} → ${cName(LOC[f.to].cc)})</span>` : ''}</div>`;
}
const NEAR = {};
function vehDests(at) { // Twoje miejscowości na tym samym lądzie + 25 najbliższych
  const a = LOC[at];
  if (!NEAR[at]) NEAR[at] = BYC[a.c].filter(l => l.ld === a.ld && l.id !== at).map(l => [l.id, km(at, l.id)]).sort((x, y) => x[1] - y[1]).slice(0, 25).map(x => x[0]);
  const own = Object.keys(S.L).filter(id => id !== at && LOC[id].ld === a.ld).sort((x, y) => km(at, x) - km(at, y));
  return [...new Set([...own, ...NEAR[at]])].filter(id => S.lic[LOC[id].cc]);
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
      <div class="flow">${vk.n}: ładowność ${vk.cap} szt. · ${vk.spd} km/h · paliwo ${mL(vk.fuel, ui.garAt)}/km</div>
      <div class="btns"><button class="btn p" data-a="veh" ${!canL(ui.garAt, vk.cost) || full ? 'disabled' : ''}>${full ? 'Garaż pełny — rozbuduj' : `Kup — ${mL(vk.cost, ui.garAt)}`}</button></div></div>`;
  }
  for (const v of S.veh) {
    const k = VEH[v.k];
    if (v.st === 'go') {
      const p = clamp(1 - (v.eta - S.hour) / v.dur, 0, 1);
      h += `<div class="card"><div class="row"><b class="grow">${k.n} #${v.id}</b><span class="mut small">${v.eta - S.hour} h do celu</span></div>
        <div class="flow">${LOC[v.from].n} → ${LOC[v.to].n}${v.q ? ` · ${qty(v.q)} ${G[v.g].n}` : ' · pusty'}</div><div class="bar y"><i style="width:${p * 100}%"></i></div></div>`;
      continue;
    }
    const dests = vehDests(v.at);
    h += `<div class="card"><div class="row"><b class="grow">${k.n} #${v.id}</b><span class="mut small">stoi w: ${LOC[v.at].n}</span></div>
      ${sendForm('vf', v, dests, k.cap, to => vehHours(S, v.k, v.at, to), to => vehFee(v.k, v.at, to))}</div>`;
  }
  // --- porty ---
  const coast = Object.keys(S.L).map(id => LOC[id]).filter(l => l.port);
  h += `<h2>Porty</h2><div class="card">${coast.map(l => { const L = S.L[l.id];
    return `<div class="row" style="padding:6px 0"><div class="grow">${l.n} <span class="mut small">${CN[l.c].n}</span></div>${L && L.port ? '<span class="pos small">Port czynny</span>' :
      `<button class="btn s p" data-a="port" data-l="${l.id}" ${!canL(l.id, PORT_COST) ? 'disabled' : ''}>Zbuduj — ${mL(PORT_COST, l.id)}</button>`}</div>`; }).join('') ||
      '<div class="mut small">Port zbudujesz w miejscowości nad morzem (oznaczonej „Wybrzeże” w Budowie), w której masz zakład lub magazyn.</div>'}</div>`;
  // --- statki ---
  const ports = Object.keys(S.L).filter(l => S.L[l].port);
  h += `<h2>Flota (${S.ships.length})</h2>`;
  if (ports.length) {
    if (!ports.includes(ui.shipAt)) ui.shipAt = ports[0];
    h += `<div class="card"><div class="row"><div class="grow"><select data-in="shipAt">${ports.map(l => `<option value="${l}" ${l === ui.shipAt ? 'selected' : ''}>Port: ${LOC[l].n}</option>`).join('')}</select></div>
      <button class="btn p" data-a="ship" ${!canL(ui.shipAt, SHIP_COST) ? 'disabled' : ''}>Kup statek — ${mL(SHIP_COST, ui.shipAt)}</button></div>
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
    ${r.map((x, i) => `<tr class="${x.me ? 'me' : ''}"><td>${i + 1}</td><td>${esc(x.n)}</td><td class="n">${mH(x.w)}</td></tr>`).join('')}
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
const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
function tweenCash() { // licznik gotówki płynnie dobija do wartości
  const el = $('cash'), hc = homeCur(), to = wal(S, hc), from = ui.cashShown ?? to;
  cancelAnimationFrame(ui.cashRaf);
  if (RM || Math.abs(to - from) < 1) { ui.cashShown = to; el.textContent = fmtC(to, hc); return; }
  el.classList.remove('up', 'down'); void el.offsetWidth; el.classList.add(to > from ? 'up' : 'down');
  const t0 = performance.now(), step = t => {
    const k = Math.min(1, (t - t0) / 650), e = 1 - (1 - k) ** 3;
    ui.cashShown = from + (to - from) * e; el.textContent = fmtC(ui.cashShown, hc);
    if (k < 1) ui.cashRaf = requestAnimationFrame(step);
  };
  ui.cashRaf = requestAnimationFrame(step);
}
function renderTop() {
  $('coName').textContent = S.name;
  document.documentElement.style.setProperty('--me', S.color);
  $('clock').textContent = tstr(S.hour) + ' · Sezon ' + S.season;
  tweenCash();
  $('cash').style.color = wal(S, homeCur()) < 0 ? 'var(--bad)' : '';
  const nw = Object.keys(S.w || {}).filter(c => c !== homeCur() && Math.abs(S.w[c]) >= .5).length;
  $('inc').textContent = (S.inc >= 0 ? '+' : '') + mH(S.inc) + '/h';
  const ws = Object.keys(S.w).filter(c => c === homeCur() || Math.abs(S.w[c]) >= .5).sort((a, b) => (b === homeCur()) - (a === homeCur()) || S.w[b] / rate(b) - S.w[a] / rate(a));
  const wb = $('wbar'), html = ws.map(c => `<span class="${S.w[c] < 0 ? 'neg' : ''}"><b>${Math.round(S.w[c]).toLocaleString('pl-PL')}</b> ${c}</span>`).join('') + `<button data-a="goKantor" aria-label="Kantor">+</button>`;
  if (wb && wb.innerHTML !== html) wb.innerHTML = html; void nw;
  $('seasonFill').style.width = ((S.hour % SEASON_H) / SEASON_H * 100) + '%';
}
function render(force) {
  if (!S) return;
  renderTop();
  const ae = document.activeElement;
  if (ui.gesture || (!force && ae && (ae.tagName === 'INPUT' || ae.tagName === 'SELECT'))) return;
  const v = $('view');
  v.innerHTML = VIEWS[ui.tab]();
  if (ui.tab !== ui.animTab && !RM) { // wejście zakładki: karty wjeżdżają kaskadowo
    ui.animTab = ui.tab; v.classList.remove('enter'); void v.offsetWidth;
    [...v.children].forEach((c, i) => c.style.setProperty('--i', Math.min(i, 12)));
    v.classList.add('enter'); clearTimeout(ui.animT); ui.animT = setTimeout(() => v.classList.remove('enter'), 1000);
  }
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.tab === ui.tab));
  renderUpd(); renderTut();
  if (ui.tab === 'budowa' && $('lmapSlot')) mountLM(ui.bc, ui.bl);
}
function renderUpd() {
  $('upd').innerHTML = ui.update ? `<div class="updbar"><div class="grow" style="flex:1"><b>Nowa wersja ${esc(ui.update.v)}</b><div class="mut small">Masz ${esc(VERSION)}</div></div><button class="btn p s" data-a="getUpd">${IS_WEB() ? 'Odśwież' : 'Pobierz'}</button></div>` : '';
}
let toastT;
function toast(t) { const el = $('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2200); }

function settings() {
  $('modal').hidden = false;
  $('modal').innerHTML = `<div class="sheet"><div class="row"><b class="grow" style="font-size:17px">Ustawienia</b><button class="btn s" data-a="close">Zamknij</button></div>
    <label class="f" for="ceo">Imię prezesa</label><input id="ceo" maxlength="20" value="${esc(S.ceo)}">
    <label class="f" for="nm">Nazwa firmy</label><div class="row"><input id="nm" maxlength="24" value="${esc(S.name)}"><button class="btn p" data-a="name">Zapisz</button></div>
    <h2>Konto</h2><div class="card"><div class="row"><div class="grow">${USER ? `<b>${isAdmin() ? 'admin <span class="ltag g">ADMIN</span>' : esc(USER.email)}</b><div class="mut small">Zapis w chmurze${cloudAt ? ': ' + new Date(cloudAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }) : ' włączony'}</div>`
      : '<b>Gość</b><div class="mut small">Gra zapisana tylko na tym telefonie</div>'}</div>
      ${USER ? '<button class="btn" data-a="logout">Wyloguj</button>' : `<button class="btn p" data-a="toLogin" ${FB ? '' : 'disabled'}>Załóż konto</button>`}</div></div>
    <h2>Mapa</h2><div class="card"><div class="row"><div class="grow">${S.mapMode === 'svg' ? 'Prosta (offline)' : 'Szczegółowa — drogi, miasta (internet)'}<div class="mut small">© OpenFreeMap, © OpenMapTiles, © OpenStreetMap</div></div>
      <button class="btn" data-a="mapMode">${S.mapMode === 'svg' ? 'Szczegółowa' : 'Prosta'}</button></div>
      ${S.mapMode === 'svg' ? '' : `<div class="btns">${Object.entries(MSTYLES).map(([k, n]) => `<button class="toggle ${(S.mapStyle || 'caros') === k ? 'on' : ''}" data-a="mapStyle" data-v="${k}">${n}</button>`).join('')}</div>`}</div>
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
      if (!d.fromMap) ui.panTo = true;
      break;
    }
    case 'mapMode': S.mapMode = S.mapMode === 'svg' ? 'osm' : 'svg'; ui.noGL = false; $('modal').hidden = true; break;
    case 'mapStyle': S.mapStyle = d.v; if (LM) { LM.ready = false; LM.sty = d.v; LM.map.setStyle(styleUrl(d.v)); } $('modal').hidden = true; break;
    case 'auMode': au.mode = d.v; au.err = ''; au.info = ''; renderAuth(); return;
    case 'auGoogle': auGoogle(); return;
    case 'auShow': au.show = !au.show; renderAuth(); return;
    case 'auGuest': try { localStorage.setItem('xyx_guest', '1'); } catch (e) {} SAVE_KEY = SAVE; startGame(load(SAVE) || newState()); return;
    case 'logout': try { localStorage.removeItem('xyx_guest'); } catch (e) {} logout(); return;
    case 'toLogin': try { localStorage.removeItem('xyx_guest'); } catch (e) {} save(); S = null; $('modal').hidden = true; $('wiz').hidden = true; au.mode = 'register'; renderAuth(); return;
    case 'dep': ui.dep = d.v || null; break;
    case 'recipes': openRecipes(); return;
    case 'priceMap': openPriceMap(); return;
    case 'goKantor': ui.tab = 'magazyn'; render(true); setTimeout(() => { const k = document.querySelector('.kantor'); if (k) k.scrollIntoView({ behavior: 'smooth' }); }, 50); return;
    case 'exMax': ui.ex.amt = String(Math.floor(Math.max(0, wal(S, ui.ex.from)) * 100) / 100); break;
    case 'exch': {
      const e = ui.ex, a = parseFloat(String(e.amt).replace(',', '.')) || 0;
      if (a <= 0) { toast('Wpisz kwotę'); return; }
      if (a > wal(S, e.from) + 1e-6) { toast(`Masz tylko ${fmtC(wal(S, e.from), e.from)}`); return; }
      const got = a / rate(e.from) * rate(e.to) * (1 - SPREAD);
      S.w[e.from] = wal(S, e.from) - a; S.w[e.to] = wal(S, e.to) + got; e.amt = '';
      toast(`Wymieniono ${fmtC(a, e.from)} → ${fmtC(got, e.to)}`); break;
    }
    case 'placeMode': if (!isAdmin()) return; ui.place = true; toast('Dotknij mapy, gdzie ma powstać miejscowość'); break;
    case 'placeOff': ui.place = false; break;
    case 'npSet': ui.np.t = d.v; foundSheet(); return;
    case 'npPort': ui.np.port = !ui.np.port; foundSheet(); return;
    case 'admDel': adminDel(d.id); return;
    case 'admTab': ADM.tab = d.v; if (d.v !== 'miejsca') ui.place = false; renderAdmin(); return;
    case 'admCont': ADM.cid = d.c; renderAdmin(); return;
    case 'admPl': admPlayer(d.id); return;
    case 'admEd': admEdit(d.id); return;
    case 'edSet': if (d.k === 'port') ui.ed.port = !ui.ed.port; else ui.ed[d.k] = d.v; edSheet(); return;
    case 'edSave': {
      const e = ui.ed, l = LOC[e.id], n = clean(e.n).trim().slice(0, 30), la = parseFloat(String(e.la).replace(',', '.')), lo = parseFloat(String(e.lo).replace(',', '.'));
      if (!n) { $('edErr').textContent = 'Wpisz nazwę.'; return; }
      if (!isFinite(la) || !isFinite(lo)) { $('edErr').textContent = 'Złe współrzędne.'; return; }
      const b = MAPS[l.c].box; if (lo < b[0][0] || lo > b[1][0] || la < b[0][1] || la > b[1][1]) { $('edErr').textContent = 'Poza obszarem kontynentu.'; return; }
      const data = { n, t: e.t, pop: Math.max(0, Math.round(+e.pop || 0)), port: e.port ? 1 : 0, la: +la.toFixed(4), lo: +lo.toFixed(4), ts: Date.now() };
      edWrite(e.g ? data : { ...data, id: e.id, ov: true, c: l.c, del: !!e.hidden }, `Zapisano: ${n}`); return;
    }
    case 'edHide': edWrite({ id: ui.ed.id, ov: true, c: LOC[ui.ed.id].c, del: true, ts: Date.now() }, 'Ukryto u wszystkich graczy'); return;
    case 'edDel': edWrite({ del: true }, 'Usunięto'); return;
    case 'edRestore': {
      if (!DB || !isAdmin()) return;
      const id = ui.ed.id;
      if (ui.ed.ov && !ui.ed.g) DB.collection('places').doc(id).delete().then(() => toast('Przywrócono oryginał')).catch(er => toast('Błąd: ' + (er.code || er.message)));
      else DB.collection('places').doc(id).set({ del: false }, { merge: true }).then(() => toast('Przywrócono'));
      $('modal').hidden = true; return;
    }
    case 'admLL': {
      const la = parseFloat(String($('admLa').value).replace(',', '.')), lo = parseFloat(String($('admLo').value).replace(',', '.'));
      if (!isFinite(la) || !isFinite(lo)) { toast('Podaj współrzędne'); return; }
      const c = CONT.find(c => { const b = MAPS[c.id].box; return lo >= b[0][0] && lo <= b[1][0] && la >= b[0][1] && la <= b[1][1]; });
      if (!c) { toast('Poza obszarem gry'); return; }
      placeAtLL(c.id, la, lo); return;
    }
    case 'npFound': {
      const p = ui.np, n = (p.n || '').replace(/[<>&"'`\\]/g, '').trim().slice(0, 22);
      if (!n) { $('npErr').textContent = 'Wpisz nazwę.'; return; }
      if (LOCS.some(l => l.c === p.c && norm(l.n) === norm(n))) { $('npErr').textContent = 'Taka miejscowość już istnieje.'; return; }
      if (p.adm) { adminAdd({ n, c: p.c, t: p.t, la: p.la, lo: p.lo, port: p.port ? 1 : 0, ld: p.ld, pop: Math.max(0, Math.round(+p.pop || 0)) }); return; }
      if (!canC(S, homeCur(), FOUND[p.t])) return;
      payC(S, homeCur(), FOUND[p.t]);
      const id = 'u' + S.nid++;
      S.custom.push({ id, c: p.c, n, t: p.t, la: p.la, lo: p.lo, port: p.port ? 1 : 0, ld: p.ld });
      registerCustom(S); ensureL(S, id); ui.bl = id; ui.place = false; ui.np = null; $('modal').hidden = true;
      addNews(S, `Założono ${p.t === 'm' ? 'miasto' : 'wieś'}: ${n}`); toast(`${n} założona!`); break;
    }
    case 'zoom': {
      const cid = ui.bc, z = zOf(cid), m = MAPS[cid];
      if (+d.z === 0) { z.k = 1; z.x = z.y = 0; break; }
      const [sx, sy] = z.k === 1 && +d.z > 0 && MAPS[cid].pts[ui.bl] ? MAPS[cid].pts[ui.bl] : [z.x + m.w / z.k / 2, z.y + m.h / z.k / 2];
      zoomAt(cid, z.k * (+d.z > 0 ? 2 : .5), sx, sy); break;
    }
    case 'ml': ui.ml = d.l; break;
    case 'goBuild': ui.bc = d.c; ui.tab = 'budowa'; break;
    case 'lic': {
      const c = licCost(d.cc), cu = curOfCC(d.cc); if (S.lic[d.cc] || !canC(S, cu, c)) return;
      payC(S, cu, c); S.lic[d.cc] = true; S.c[LOC[ui.bl].c] = {}; addNews(S, `Licencja: ${cName(d.cc)}`); toast(`${flag(d.cc)} Licencja na ${cName(d.cc)}!`); break;
    }
    case 'buildPick': case 'garPick':
      ui.placeB = a === 'garPick' ? { k: 'g', lid: d.l } : { k: 'b', lid: d.l, b: d.b }; ui.flyB = d.l; window.scrollTo({ top: 0, behavior: 'smooth' }); break;
    case 'bMove': $('modal').hidden = true; ui.bc = LOC[d.l].c; ui.bl = d.l; ui.tab = 'budowa'; ui.placeB = { k: 'mv', lid: d.l, id: d.id }; ui.flyB = d.l; window.scrollTo({ top: 0, behavior: 'smooth' }); break;
    case 'bGo': $('modal').hidden = true; ui.bc = LOC[d.l].c; ui.bl = d.l; ui.tab = 'budowa'; ui.panTo = true; break;
    case 'pbOff': ui.placeB = null; break;
    case 'pbAuto': { const p = ui.placeB; ui.placeB = null; if (!p) break; act(p.k === 'g' ? 'garage' : 'build', { l: p.lid, b: p.b }); return; }
    case 'build': {
      const def = B[d.b], ld = landOf(d.l), cost = def.cost + ld; if (!hasLic(d.l) || !canL(d.l, cost) || free(S, d.l) < 1) return;
      const id = S.nid++, b = { id, t: d.b, l: 1, st: '', land: ld };
      if (isFinite(d.la) && isFinite(d.lo)) { b.la = +d.la; b.lo = +d.lo; } else posOf(d.l, b);
      payC(S, curOf(d.l), cost); ensureL(S, d.l).bld.push(b); toast(`${def.n} — ${LOC[d.l].n}`); break;
    }
    case 'up': {
      const b = S.L[d.l].bld.find(x => x.id == d.id), c = upCost(b); if (!canL(d.l, c)) return;
      payC(S, curOf(d.l), c); b.l++; toast(`${B[b.t].n}: poziom ${b.l}`); break;
    }
    case 'demo': {
      const L = S.L[d.l], i = L.bld.findIndex(x => x.id == d.id); if (i < 0) return;
      earnC(S, curOf(d.l), bldValue(L.bld[i])); L.bld.splice(i, 1); break;
    }
    case 'expand': {
      const L = ensureL(S, d.l), c = xCost(L, d.l); if (!canL(d.l, c) || L.x >= T(d.l).maxX) return;
      payC(S, curOf(d.l), c); L.x++; toast(`${LOC[d.l].n}: nowe działki`); break;
    }
    case 'garage': {
      const c = GARAGE_COST + landOf(d.l); if (!hasLic(d.l) || !canL(d.l, c) || free(S, d.l) < 1) return;
      payC(S, curOf(d.l), c); const GL = ensureL(S, d.l); GL.gar = 1; GL.gpos = isFinite(d.la) && isFinite(d.lo) ? [+d.la, +d.lo] : autoPos(d.l, 'gar'); ui.garAt = d.l; toast(`Garaż — ${LOC[d.l].n}`); break;
    }
    case 'garUp': { const L = S.L[d.l], c = garUp(L); if (!canL(d.l, c)) return; payC(S, curOf(d.l), c); L.gar++; toast(`Garaż poz. ${L.gar}`); break; }
    case 'veh': {
      const k = VEH[ui.vehK]; if (!k || !ui.garAt || !canL(ui.garAt, k.cost) || garUsed(S, ui.garAt) >= garCap(S, ui.garAt)) return;
      payC(S, curOf(ui.garAt), k.cost); S.veh.push({ id: S.nid++, k: ui.vehK, home: ui.garAt, at: ui.garAt, st: 'idle', from: null, to: null, g: null, q: 0, eta: 0, dur: 1 });
      toast(`${k.n} w garażu: ${LOC[ui.garAt].n}`); break;
    }
    case 'sell': {
      const q = Math.floor((S.L[d.l].inv[d.g] || 0) * +d.f); const r = sell(S, d.l, d.g, q);
      if (r) toast(`Sprzedano ${qty(q)} ${G[d.g].n} za ${mL(r, d.l)}`); break;
    }
    case 'auto': { const L = S.L[d.l]; L.auto[d.g] = !L.auto[d.g]; if (!L.auto[d.g]) delete L.auto[d.g]; break; }
    case 'buy': {
      const q = Math.max(1, Math.floor(ui.buyQ) || 1), c = buy(S, d.l, ui.buyG, q);
      toast(c ? `Kupiono ${q} ${G[ui.buyG].n} za ${mL(c, d.l)}` : `Za mało ${curOf(d.l)} — wymień w kantorze`); break;
    }
    case 'port': if (!canL(d.l, PORT_COST) || !hasLic(d.l)) return; payC(S, curOf(d.l), PORT_COST); ensureL(S, d.l).port = true; addNews(S, `Port otwarty: ${LOC[d.l].n}`); break;
    case 'ship':
      if (!ui.shipAt || !canL(ui.shipAt, SHIP_COST)) return;
      payC(S, curOf(ui.shipAt), SHIP_COST); S.ships.push({ id: S.nid++, st: 'idle', at: ui.shipAt, to: null, from: null, g: null, q: 0, eta: 0, dur: 1 }); toast('Nowy statek w porcie'); break;
    case 'send': case 'drive': {
      const isShip = a === 'send', list = isShip ? S.ships : S.veh, u = list.find(x => x.id == d.id);
      const f = (isShip ? ui.sf : ui.vf)[d.id] || {}; if (!u || u.st !== 'idle' || !f.to) return;
      const cap = isShip ? SHIP_CAP : VEH[u.k].cap, inv = ensureL(S, u.at).inv;
      const q = f.g ? clamp(Math.floor(f.q ?? Math.min(cap, inv[f.g] || 0)), 0, Math.min(cap, Math.floor(inv[f.g] || 0))) : 0;
      const duty = dutyOf(u.at, f.to, f.g, q), fee = (isShip ? shipFee(u.at, f.to, q) : vehFee(u.k, u.at, f.to)) + duty; if (!canL(u.at, fee)) return;
      if (duty) addNews(S, `Cło ${mL(duty, u.at)}: ${cName(LOC[u.at].cc)} → ${cName(LOC[f.to].cc)}`);
      payC(S, curOf(u.at), fee);
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
    case 'tutNext': { const st = TUT[S.tut.step]; if (st && st.fin && !S.tut.rew) { S.tut.rew = true; earnC(S, homeCur(), 5000); toast(`+${mH(5000)} za samouczek`); } S.tut.step++; break; }
    case 'tutSkip': S.tut.step = TUT.length; break;
    case 'wzSet':
      if (d.k === 'hq') { wz.hq = d.v; wz.hl = ''; wz.cc = ''; wz.rg = null; wz.lvl = 'ctry'; wz.q = ''; }
      else wz[d.k] = d.k === 'diff' ? +d.v : d.k === 'tut' ? d.v === '1' : d.v;
      renderWiz(); return;
    case 'wzCc': {
      wz.cc = d.v; wz.rg = null; wz.q = '';
      const regs = new Set(BYC[wz.hq].filter(l => l.cc === d.v && l.rg >= 0).map(l => l.rg));
      wz.lvl = regs.size > 1 ? 'reg' : 'loc'; if (regs.size === 1) wz.rg = [...regs][0];
      renderWiz(); $('wiz').scrollTo(0, 0); return;
    }
    case 'wzRg': wz.rg = +d.v; wz.lvl = 'loc'; wz.q = ''; renderWiz(); $('wiz').scrollTo(0, 0); return;
    case 'wzLvl': wz.lvl = d.v; wz.q = ''; if (d.v === 'ctry') { wz.cc = ''; wz.rg = null; } if (d.v === 'reg') wz.rg = null; renderWiz(); return;
    case 'wzBack': wz.step = Math.max(0, wz.step - 1); renderWiz(); return;
    case 'wzNext':
      if (wz.step === 0) {
        wz.ceo = wz.ceo.trim(); wz.name = wz.name.trim();
        if (!wz.ceo || !wz.name) { $('wzErr').textContent = 'Wpisz imię prezesa i nazwę firmy.'; return; }
      }
      if (wz.step === 1 && !LOC[wz.hl]) { toast('Wybierz miejscowość startową'); return; }
      if (wz.step < 3) { wz.step++; renderWiz(); $('wiz').scrollTo(0, 0); return; }
      S = newState({ done: true, ceo: wz.ceo, name: wz.name, hl: wz.hl, color: wz.color, diff: wz.diff, tut: wz.tut }); registerCustom(S); ui.z = {};
      ui.bl = ui.ml = S.hl; ui.bc = S.hq; ui.tab = 'firma'; acc = 0; prev = performance.now(); renderWiz(); break;
    case 'reset':
      if (!ui.resetArm) { ui.resetArm = true; settings(); return; }
      S = newState(); registerCustom(S); ui.z = {}; Object.assign(wz, { step: 0, ceo: '', name: '', hl: '', cc: '', rg: null, lvl: 'ctry', q: '' }); ui.resetArm = false; $('modal').hidden = true; save(); renderWiz(); break;
    case 'chkUpd': checkUpdate(true); return;
    case 'getUpd': if (IS_WEB()) { if (S) { save(); cloudSave(true); } setTimeout(() => location.reload(), 600); return; } if (ui.locked) runUpdate(); else openUrl(ui.update.url); return;
    case 'dlPerm': { const P = UPD(); if (P) P.openInstallSettings(); return; }
    case 'dlInstall': { const P = UPD(); if (P) P.install().catch(e => { ui.dl = { st: 'err', msg: e.message }; lockView(); }); return; }
    case 'dlBrowser': openUrl(ui.update.url); return;
    case 'reload': location.reload(); return;
  }
  save(); render(true);
}
document.addEventListener('click', e => {
  if (gs.block && e.target.closest('.lmap')) return;
  if (ui.place && e.target.closest('.lmap svg')) { placeAt(e, e.target.closest('.lmap svg')); return; }
  const t = e.target.closest('[data-a],[data-tab]');
  if (!t) { if (e.target.id === 'modal') $('modal').hidden = true; return; }
  if (t.dataset.tab) { ui.tab = t.dataset.tab; window.scrollTo(0, 0); render(true); return; }
  if (t.disabled) return;
  act(t.dataset.a, t.dataset);
});
document.addEventListener('change', e => {
  const t = e.target, k = t.dataset.in; if (!k || k === 'admSort') return;
  if (k === 'buyG') ui.buyG = t.value;
  else if (k === 'buyQ') ui.buyQ = +t.value;
  else if (k === 'shipAt') ui.shipAt = t.value;
  else if (k === 'garAt') ui.garAt = t.value;
  else if (k === 'pdep') ui.pdep = t.value;
  else if (k === 'rdep') { ui.rdep = t.value; openRecipes(); return; }
  else if (k === 'pmg') { ui.pmg = t.value; openPriceMap(); return; }
  else if (k === 'exFrom') { ui.ex.from = t.value; ui.ex.amt = ''; }
  else if (k === 'exTo') ui.ex.to = t.value;
  else if (k === 'bcc') { const cid = ui.bc, ls = BYC[cid].filter(l => l.cc === t.value); const own = ls.find(l => S.L[l.id]); ui.bl = (own || ls[0]).id; ui.rgSel = false; fitTo(ls); }
  else if (k === 'brg') { const cid = ui.bc, cc = LOC[ui.bl].cc;
    const ls = t.value === '' ? BYC[cid].filter(l => l.cc === cc) : BYC[cid].filter(l => l.rg === +t.value);
    ui.rgSel = t.value !== ''; if (ls.length) { const own = ls.find(l => S.L[l.id]); ui.bl = (own || ls[0]).id; fitTo(ls); } }
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
// wymuszona aktualizacja: zapis gry i blokada do czasu instalacji nowej wersji
const IS_WEB = () => !(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform());
function forceUpdate() {
  if (VERSION === 'dev' || !ui.update || IS_WEB()) return;
  if (ui.dl && ['dl', 'inst', 'perm'].includes(ui.dl.st)) return;
  if (!ui.locked) { ui.locked = true; if (S) { save(); cloudSave(true); } }
  lockView();
}
const UPD = () => window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.XyxUpdater;
const mb = b => (b / 1048576).toFixed(1).replace('.', ',') + ' MB';
function lockView() {
  const el = $('lock'), nat = window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform(), d = ui.dl || {};
  el.hidden = false;
  let body;
  if (d.st === 'dl') body = `<h1>Pobieranie…</h1><p class="mut au-sub">Wersja ${esc(ui.update.v)}</p>
    <div class="dlbar"><i id="dlFill" style="width:${d.total ? d.loaded / d.total * 100 : 0}%"></i></div>
    <div class="row dlinfo"><b id="dlPct" class="grow">${d.total ? Math.round(d.loaded / d.total * 100) : 0}%</b><span id="dlMb" class="mut">${mb(d.loaded || 0)}${d.total ? ' / ' + mb(d.total) : ''}</span></div>
    <p class="mut small au-note">Nie zamykaj gry.</p>`;
  else if (d.st === 'perm') body = `<h1>Jedno pozwolenie</h1><p class="mut au-sub">Android musi pozwolić XyxWord instalować aktualizacje. Włącz <b>„Zezwalaj z tego źródła”</b> i wróć do gry.</p>
    <button class="btn p au-go" data-a="dlPerm">Otwórz ustawienia</button>`;
  else if (d.st === 'inst') body = `<h1>Pobrano</h1><p class="mut au-sub">Zatwierdź instalację w oknie systemu (<b>„Aktualizuj”</b>). Zapis gry zostanie.</p>
    <div class="dlbar"><i style="width:100%"></i></div><button class="btn p au-go" data-a="dlInstall" style="margin-top:16px">Zainstaluj</button>`;
  else if (d.st === 'err') body = `<h1>Nie udało się</h1><p class="warn au-sub">${esc(d.msg || '')}</p>
    <button class="btn p au-go" data-a="getUpd">Spróbuj ponownie</button><button class="btn au-guest" data-a="dlBrowser" style="margin-top:10px">Pobierz przez przeglądarkę</button>`;
  else body = `<h1>Wymagana aktualizacja</h1>
    <p class="mut au-sub">Dostępna jest nowa wersja <b>${esc(ui.update.v)}</b> (masz ${esc(VERSION)}).${S ? ' Twoja gra została zapisana.' : ''} Zainstaluj aktualizację, żeby grać dalej.</p>
    ${ui.update.notes ? `<div class="card small mut lock-notes">${esc(ui.update.notes).slice(0, 400)}</div>` : ''}
    <button class="btn p au-go" data-a="${nat ? 'getUpd' : 'reload'}">${nat ? 'Pobierz i zainstaluj' : 'Odśwież grę'}</button>`;
  el.innerHTML = `<div class="au-in lock-in"><div class="au-logo">${LOGO}</div>${body}</div>`;
}
function dlProgress() {
  const d = ui.dl, f = $('dlFill'); if (!f || !d) return;
  const p = d.total ? d.loaded / d.total : 0;
  f.style.width = (p * 100) + '%'; $('dlPct').textContent = Math.round(p * 100) + '%'; $('dlMb').textContent = mb(d.loaded) + (d.total ? ' / ' + mb(d.total) : '');
}
async function runUpdate() { // pobranie APK w aplikacji i uruchomienie instalatora (jak w CAR OS Connect)
  const P = UPD();
  if (!P) { openUrl(ui.update.url); return; }
  if (ui.dl && ui.dl.st === 'dl') return;
  try {
    const ok = (await P.canInstall()).value;
    if (!ok) { ui.dl = { st: 'perm' }; lockView(); return; }
    ui.dl = { st: 'dl', loaded: 0, total: 0 }; lockView();
    if (!ui.dlL) ui.dlL = await P.addListener('progress', e => { if (ui.dl && ui.dl.st === 'dl') { ui.dl.loaded = e.loaded; ui.dl.total = e.total; dlProgress(); } });
    await P.download({ url: ui.update.url });
    ui.dl = { st: 'inst' }; lockView();
    await P.install();
  } catch (e) { ui.dl = { st: 'err', msg: (e && e.message) || String(e) }; lockView(); }
}
async function checkUpdate(manual) {
  try {
    const r = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers: { Accept: 'application/vnd.github+json' }, cache: 'no-store' });
    if (!r.ok) throw new Error(r.status);
    const j = await r.json(), v = String(j.tag_name || '').replace(/^v/, '');
    const apk = (j.assets || []).find(a => a.name.endsWith('.apk'));
    if (v && cmpVer(v, VERSION) > 0) { ui.update = { v, url: apk ? apk.browser_download_url : j.html_url, notes: String(j.body || '').split(/\n\s*(Co-Authored-By|Claude-Session)/)[0].trim() }; renderUpd(); forceUpdate(); }
    else if (manual) toast('Masz najnowszą wersję');
  } catch (e) { if (manual) toast('Nie udało się połączyć z GitHub'); }
}
function openUrl(url) {
  const P = window.Capacitor && window.Capacitor.Plugins;
  const fallback = () => { if (window.Capacitor) location.href = url; else window.open(url, '_blank'); };
  if (P && P.Browser) P.Browser.open({ url }).catch(fallback);
  else fallback();
}

// ================== KONTA (Firebase: logowanie, rejestracja, zapis w chmurze) ==================
const FBC = window.XYX_FIREBASE;
let FB = null, DB = null, USER = null, cloudT = 0, cloudAt = 0;
if (FBC && window.firebase) {
  try {
    FB = firebase.initializeApp(FBC);
    DB = firebase.firestore();
    try { DB.settings({ experimentalAutoDetectLongPolling: true, merge: true }); } catch (e) {}
  } catch (e) { FB = null; }
}
const au = { mode: 'login', email: '', pass: '', pass2: '', busy: false, err: '', info: '', show: false };
const AUTH_ERR = {
  'auth/invalid-email': 'Nieprawidłowy adres e-mail.', 'auth/missing-password': 'Wpisz hasło.',
  'auth/weak-password': 'Hasło jest za słabe (min. 6 znaków).', 'auth/email-already-in-use': 'To konto już istnieje — zaloguj się.',
  'auth/invalid-credential': 'Zły e-mail lub hasło.', 'auth/wrong-password': 'Złe hasło.', 'auth/user-not-found': 'Nie ma takiego konta.',
  'auth/too-many-requests': 'Za dużo prób. Spróbuj za chwilę.', 'auth/network-request-failed': 'Brak połączenia z internetem.',
  'auth/user-disabled': 'Konto zablokowane.',
};
function cloudSave(now) {
  if (!USER || !DB || !S || !S.setup || isAdmin()) return;
  clearTimeout(cloudT);
  const go = () => {
    if (!S || !USER) return;
    if (!S.created) S.created = Date.now();
    const now = Date.now(), Ls = Object.values(S.L);
    DB.collection('users').doc(USER.uid).set({ save: JSON.stringify(S), updated: now, name: S.name, ceo: S.ceo, worth: Math.round(worth()), email: USER.email }, { merge: true })
      .then(() => { cloudAt = Date.now(); }).catch(() => {});
    // budynki widoczne dla innych graczy na mapie
    const items = []; for (const lid in S.L) { const L = S.L[lid]; for (const b of L.bld) { const [la, lo] = posOf(lid, b); items.push({ t: b.t, l: b.l, la, lo, lid }); }
      if (L.gar) { const [la, lo] = garPos(lid, L); items.push({ t: 'gar', l: L.gar, la, lo, lid }); } }
    DB.collection('bld').doc(USER.uid).set({ uid: USER.uid, name: S.name, ceo: S.ceo, color: S.color, worth: Math.round(worth()), ts: now, items }).catch(() => {});
    // podsumowanie dla panelu admina (bez całego zapisu)
    DB.collection('stats').doc(USER.uid).set({ uid: USER.uid, email: USER.email || '', name: S.name, ceo: S.ceo, color: S.color, hq: S.hq, hl: S.hl, diff: S.diff ?? 1,
      worth: Math.round(worth()), cash: Math.round(totUSD(S)), inc: Math.round(S.inc), hour: S.hour, season: S.season, pp: S.pp,
      bld: Ls.reduce((a, L) => a + L.bld.length, 0), lvl: Ls.reduce((a, L) => a + L.bld.reduce((x, b) => x + b.l, 0), 0), locs: Object.keys(S.L).length,
      ports: Ls.filter(L => L.port).length, lic: Object.keys(S.lic || {}).length, veh: S.veh.length, ships: S.ships.length, conts: Object.keys(S.c).length,
      created: S.created, updated: now, ver: VERSION, plat: window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform() ? 'android' : 'web' }, { merge: true }).catch(() => {});
  };
  if (now) go(); else cloudT = setTimeout(go, 20000);
}
function renderAuth() {
  const el = $('auth');
  if (S || ADM.on) { el.hidden = true; return; }
  el.hidden = false;
  if (au.mode === 'wait') {
    el.innerHTML = `<div class="au-in"><div class="au-logo">${LOGO}</div><h1>XyxWord</h1><div class="spin"></div><p class="mut" style="text-align:center">Łączenie z kontem…</p></div>`;
    return;
  }
  const reg = au.mode === 'register', rst = au.mode === 'reset';
  el.innerHTML = `<div class="au-in">
    <div class="au-logo">${LOGO}</div><h1>XyxWord</h1>
    <p class="mut au-sub">${rst ? 'Wyślemy Ci link do ustawienia nowego hasła.' : reg ? 'Załóż konto — gra zapisuje się w chmurze, zagrasz na każdym telefonie.' : 'Zaloguj się, żeby wrócić do swojego imperium.'}</p>
    ${FB ? `${rst ? '' : `<div class="au-tabs"><button class="${!reg ? 'on' : ''}" data-a="auMode" data-v="login">Logowanie</button><button class="${reg ? 'on' : ''}" data-a="auMode" data-v="register">Rejestracja</button><i class="${reg ? 'r' : ''}"></i></div>`}
    <form id="auForm" class="au-form" novalidate>
      <label class="f" for="auEmail">E-mail</label><input id="auEmail" data-au="email" type="email" inputmode="email" autocomplete="email" value="${esc(au.email)}" placeholder="ty@przyklad.pl">
      ${rst ? '' : `<label class="f" for="auPass">Hasło</label><div class="pw"><input id="auPass" data-au="pass" type="${au.show ? 'text' : 'password'}" autocomplete="${reg ? 'new-password' : 'current-password'}" value="${esc(au.pass)}" placeholder="min. 6 znaków">
        <button type="button" class="lnk" data-a="auShow">${au.show ? 'Ukryj' : 'Pokaż'}</button></div>`}
      ${reg ? `<label class="f" for="auPass2">Powtórz hasło</label><input id="auPass2" data-au="pass2" type="${au.show ? 'text' : 'password'}" autocomplete="new-password" value="${esc(au.pass2)}">` : ''}
      <div class="warn au-msg">${esc(au.err)}</div>${au.info ? `<div class="pos small au-msg">${esc(au.info)}</div>` : ''}
      <button class="btn p au-go ${au.busy ? 'busy' : ''}" type="submit" ${au.busy ? 'disabled' : ''}>${au.busy ? '<span class="spin s"></span>' : rst ? 'Wyślij link' : reg ? 'Załóż konto' : 'Zaloguj się'}</button>
    </form>
    ${rst ? '' : `<button class="btn au-google" data-a="auGoogle" ${au.busy ? 'disabled' : ''}><svg viewBox="0 0 48 48" width="20" height="20"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>Zaloguj przez Google</button>`}
    <div class="au-links">${rst ? '<button class="lnk" data-a="auMode" data-v="login">← Wróć do logowania</button>' : reg ? '' : '<button class="lnk" data-a="auMode" data-v="reset">Nie pamiętasz hasła?</button>'}</div>`
    : `<div class="card mut small">Konta online nie są jeszcze skonfigurowane (brak projektu Firebase). Możesz grać bez konta.</div>`}
    <div class="au-or"><span>albo</span></div>
    <button class="btn au-guest" data-a="auGuest">Graj bez konta</button>
    <p class="mut small au-note">Bez konta gra zapisuje się tylko na tym telefonie.</p></div>`;
}
const LOGO = `<svg viewBox="0 0 64 64" width="76" height="76"><rect class="b1" x="6" y="30" width="12" height="28" rx="2" fill="#e0823f"/><rect class="b2" x="26" y="18" width="12" height="40" rx="2" fill="#4aa3ff"/><rect class="b3" x="46" y="6" width="12" height="52" rx="2" fill="#3fcf7f"/></svg>`;
document.addEventListener('input', e => { const k = e.target.dataset.au; if (k) au[k] = e.target.value; });
document.addEventListener('submit', e => {
  if (e.target.id !== 'auForm') return;
  e.preventDefault(); auSubmit();
});
async function auSubmit() {
  if (au.busy || !FB) return;
  au.err = ''; au.info = '';
  let email = au.email.trim(), pass = au.pass; const A = firebase.auth();
  const admLogin = au.mode === 'login' && email.toLowerCase() === 'admin';
  if (admLogin) { email = ADMIN_EMAIL; pass = pass + ADMIN_PAD; }
  if (au.mode === 'register' && au.pass !== au.pass2) { au.err = 'Hasła nie są takie same.'; renderAuth(); return; }
  au.busy = true; renderAuth();
  try {
    if (au.mode === 'reset') { await A.sendPasswordResetEmail(email); au.info = 'Link wysłany — sprawdź skrzynkę (też spam).'; au.mode = 'login'; }
    else if (au.mode === 'register') { au.justReg = true; await A.createUserWithEmailAndPassword(email, au.pass); }
    else if (admLogin) {
      try { await A.signInWithEmailAndPassword(email, pass); }
      catch (e) { // pierwsze logowanie admina — konto zakłada się samo
        if (au.pass === 'admin' && /invalid-credential|user-not-found/.test(e.code || '')) await A.createUserWithEmailAndPassword(email, pass); else throw e;
      }
    } else await A.signInWithEmailAndPassword(email, au.pass);
  } catch (err) { au.err = AUTH_ERR[err.code] || ('Błąd: ' + (err.code || err.message)); au.justReg = false; }
  au.busy = false; if (!S) renderAuth();
}
async function auGoogle() {
  if (au.busy || !FB) return;
  au.err = ''; au.info = ''; au.busy = true; au.justReg = true; renderAuth();
  try {
    const C = window.Capacitor, P = C && C.Plugins && C.Plugins.FirebaseAuthentication;
    if (P && C.isNativePlatform && C.isNativePlatform()) { // Android: natywne okno Google → token → Firebase JS
      const r = await P.signInWithGoogle({ skipNativeAuth: true });
      const tok = r && r.credential && r.credential.idToken;
      if (!tok) throw { code: 'google/no-token' };
      await firebase.auth().signInWithCredential(firebase.auth.GoogleAuthProvider.credential(tok));
    } else await firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
  } catch (err) {
    const m = String((err && (err.code || err.message)) || err);
    au.err = /cancel|popup-closed|12501/i.test(m) ? '' : (AUTH_ERR[err.code] || 'Logowanie Google nie powiodło się: ' + m);
    au.justReg = false;
  }
  au.busy = false; if (!S) renderAuth();
}
async function onUser(user) {
  USER = user;
  if (!user) { if (!S) { au.mode = au.mode === 'wait' ? 'login' : au.mode; renderAuth(); } return; }
  if (S && SAVE_KEY === SAVE + '_' + user.uid) return;
  if (user.email === ADMIN_EMAIL) { S = null; $('wiz').hidden = true; openAdmin(); return; }
  au.mode = 'wait'; renderAuth();
  SAVE_KEY = SAVE + '_' + user.uid;
  let local = load(), cloud = null;
  try { const d = await DB.collection('users').doc(user.uid).get(); if (d.exists && d.data().save) cloud = parseSave(d.data().save); } catch (e) {}
  let s = [local, cloud].filter(Boolean).sort((a, b) => (b.last || 0) - (a.last || 0))[0] || null;
  if (!s && au.justReg) { // nowe konto: przenieś grę gościa, jeśli jest
    const guest = load(SAVE);
    if (guest && guest.setup) { s = guest; setTimeout(() => toast('Twoja dotychczasowa gra została przeniesiona na konto'), 600); }
  }
  au.justReg = false; au.pass = au.pass2 = '';
  startGame(s || newState());
  cloudSave(true);
  toast(`Zalogowano: ${user.email}`);
}
function startGame(s) {
  if (!s.setup) Object.assign(wz, { step: 0, ceo: '', name: '', hl: '', cc: '', rg: null, lvl: 'ctry', q: '' });
  S = s; registerCustom(S); ui.z = {}; ui.animTab = null; ui.cashShown = null; ui.wzLast = null; if (LM) LM.cid = null;
  ui.bc = S.hq; ui.bl = ui.ml = S.hl; ui.tab = 'firma';
  if (S.setup) {
    const off = Math.min(OFFLINE_MAX_H, Math.floor((Date.now() - (S.last || Date.now())) / HOUR_MS));
    if (off > 0) {
      const c0 = totUSD(S);
      for (let i = 0; i < off; i++) hour(S);
      setTimeout(() => toast(`Offline minęło ${off} h gry · ${totUSD(S) - c0 >= 0 ? '+' : ''}${mH(totUSD(S) - c0)}`), 400);
    }
  }
  acc = 0; prev = performance.now();
  save(); renderAuth(); render(true); renderWiz();
}
function logout() {
  if (ADM.on) { ADM.on = false; if (ADM.unsub) ADM.unsub(); ADM.unsub = null; $('adm').hidden = true; ui.place = false; }
  if (USER) { save(); cloudSave(true); }
  S = null; SAVE_KEY = SAVE; $('modal').hidden = true; $('wiz').hidden = true;
  au.mode = 'login'; au.err = ''; au.info = '';
  if (USER && FB) firebase.auth().signOut(); else renderAuth();
}

// ================== ADMIN: miejscowości dla wszystkich ==================
const ADMIN_EMAIL = 'admin@xyxword.game', ADMIN_PAD = '_xyxword'; // Firebase wymaga min. 6 znaków hasła
const isAdmin = () => !!(USER && USER.email === ADMIN_EMAIL);
function adminAdd(p) {
  if (!DB || !isAdmin()) return;
  const id = 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  DB.collection('places').doc(id).set({ ...p, id, by: USER.uid, ts: Date.now(), del: false })
    .then(() => { toast(`${p.n} — dodana dla wszystkich`); })
    .catch(e => toast('Błąd zapisu: ' + (e.code || e.message) + ' (reguły Firestore?)'));
  GLOBAL = GLOBAL.filter(g => g.id !== id).concat([{ ...p, id }]); registerCustom(S);
  ui.np = null; $('modal').hidden = true; if (S) { ui.bl = id; ui.place = false; render(true); } else renderAdmin();
}
function adminDel(id) {
  if (!DB || !isAdmin()) return;
  DB.collection('places').doc(id).set({ del: true }, { merge: true }).then(() => toast('Usunięto')).catch(e => toast('Błąd: ' + (e.code || e.message)));
}
function listenBld() {
  if (!DB || ui.bldUnsub) return;
  ui.bldUnsub = DB.collection('bld').onSnapshot(snap => { OTH = snap.docs.map(d => ({ ...d.data(), uid: d.id })); if (LM && LM.ready) drawLM(); }, () => {});
}
function listenPlaces() {
  if (!DB) return;
  DB.collection('places').onSnapshot(snap => {
    GLOBAL = snap.docs.map(d => ({ ...d.data(), id: d.id })).filter(g => g.ov ? !!LOC[g.id] || CN[g.c] : CN[g.c] && isFinite(g.la) && isFinite(g.lo));
    try { localStorage.setItem('xyx_places', JSON.stringify(GLOBAL)); } catch (e) {}
    registerCustom(S);
    if (S) render(true);
    if (ADM.on && ADM.tab === 'miejsca') renderAdmin();
  }, () => {});
}

// ================== PANEL ADMINISTRATORA ==================
const ADM = { on: false, tab: 'gracze', players: [], q: '', sort: 'worth', unsub: null, cid: 'eu', err: '' };
const ago = t => { if (!t) return '—'; const m = (Date.now() - t) / 6e4; return m < 2 ? 'teraz' : m < 60 ? Math.round(m) + ' min temu' : m < 1440 ? Math.round(m / 60) + ' h temu' : Math.round(m / 1440) + ' dni temu'; };
const dt = t => t ? new Date(t).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
function openAdmin() {
  ADM.on = true; ui.place = true; ui.bl = ''; $('view').innerHTML = ''; renderAuth(); $('adm').hidden = false; renderAdmin();
  if (DB && !ADM.unsub) ADM.unsub = DB.collection('stats').onSnapshot(snap => {
    ADM.players = snap.docs.map(d => ({ ...d.data(), uid: d.id })); ADM.err = '';
    const ae = document.activeElement; if (!(ae && ae.closest && ae.closest('#adm input'))) renderAdmin(); else renderAdminList();
  }, e => { ADM.err = 'Brak dostępu do listy graczy — opublikuj nowe reguły Firestore. (' + (e.code || '') + ')'; renderAdmin(); });
  setTimeout(() => toast('Zalogowano jako administrator'), 300);
}
function admPlayers() {
  const q = norm(ADM.q.trim());
  const by = { worth: (a, b) => (b.worth || 0) - (a.worth || 0), active: (a, b) => (b.updated || 0) - (a.updated || 0), new: (a, b) => (b.created || 0) - (a.created || 0) }[ADM.sort];
  return ADM.players.filter(p => !q || norm(`${p.email} ${p.name} ${p.ceo}`).includes(q)).sort(by);
}
function renderAdminList() {
  const el = $('admList'); if (!el) return;
  const list = admPlayers();
  el.innerHTML = list.map((p, i) => `<button class="card pl" data-a="admPl" data-id="${esc(p.uid)}" style="--i:${Math.min(i, 12)}">
      <span class="dot" style="background:${esc(p.color || '#888')}"></span>
      <span class="grow"><b>${esc(p.name || '—')}</b> <span class="mut small">· ${esc(p.ceo || '')}</span><br><span class="mut small">${esc(p.email)} · ${ago(p.updated)}</span></span>
      <span class="n"><b>${money(p.worth || 0)}</b><br><span class="mut small">${LOC[p.hl] ? LOC[p.hl].n : (CN[p.hq] || {}).n || ''}</span></span></button>`).join('')
    || `<div class="card mut">${ADM.players.length ? 'Brak wyników.' : 'Brak graczy z kontem. (Gracze bez konta nie są widoczni.)'}</div>`;
}
function admStats() {
  const P = ADM.players, now = Date.now(), D = 864e5;
  const sum = f => P.reduce((a, p) => a + (+p[f] || 0), 0);
  const act1 = P.filter(p => now - (p.updated || 0) < D).length, act7 = P.filter(p => now - (p.updated || 0) < 7 * D).length, new7 = P.filter(p => now - (p.created || 0) < 7 * D).length;
  const kpi = [['Gracze', P.length], ['Aktywni 24 h', act1], ['Aktywni 7 dni', act7], ['Nowi 7 dni', new7], ['Łączna wartość', money(sum('worth'))],
    ['Średnia wartość', money(P.length ? sum('worth') / P.length : 0)], ['Zakłady', sum('bld')], ['Pojazdy / statki', `${sum('veh')} / ${sum('ships')}`],
    ['Porty', sum('ports')], ['Miejscowości admina', GLOBAL.filter(g => !g.del).length]];
  const bars = (title, rows) => { const mx = Math.max(1, ...rows.map(r => r[1]));
    return `<h2>${title}</h2><div class="card">${rows.map(([n, v]) => `<div class="hb"><span>${esc(n)}</span><div class="bar"><i style="width:${v / mx * 100}%"></i></div><b>${v}</b></div>`).join('')}</div>`; };
  const days = [...Array(7)].map((_, i) => { const d0 = new Date(now - (6 - i) * D); d0.setHours(0, 0, 0, 0); const d1 = +d0 + D;
    return [d0.toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric' }), P.filter(p => p.created >= +d0 && p.created < d1).length]; });
  const top = [...P].sort((a, b) => (b.worth || 0) - (a.worth || 0)).slice(0, 10);
  return `<div class="kpis">${kpi.map(([n, v]) => `<div class="kpi"><span>${n}</span><b>${v}</b></div>`).join('')}</div>
    ${bars('Rejestracje — ostatnie 7 dni', days)}
    ${bars('Siedziby wg kontynentów', CONT.map(c => [c.n, P.filter(p => p.hq === c.id).length]))}
    ${bars('Poziom trudności', DIFF.map((d, i) => [d.n, P.filter(p => (p.diff ?? 1) === i).length]))}
    ${bars('Platforma', [['Android', P.filter(p => p.plat === 'android').length], ['Przeglądarka', P.filter(p => p.plat !== 'android').length]])}
    <h2>Top 10 firm</h2><div class="card"><table><thead><tr><th>#</th><th>Firma</th><th class="n">Wartość</th></tr></thead><tbody>
    ${top.map((p, i) => `<tr><td>${i + 1}</td><td>${esc(p.name || '—')}<div class="mut small">${esc(p.email)}</div></td><td class="n">${money(p.worth || 0)}</td></tr>`).join('')}</tbody></table></div>`;
}
function admSearch() {
  const q = norm((ADM.pq || '').trim()); if (q.length < 2) return '<div class="mut small">Wpisz min. 2 litery.</div>';
  const out = [];
  for (const l of LOCS) { if (l.c !== ADM.cid || l.u) continue; if ((l.nn || (l.nn = norm(l.n))).includes(q)) { out.push(l); if (out.length >= 20) break; } }
  return out.map(l => `<button class="card pl" data-a="admEd" data-id="${esc(l.id)}"><span class="grow"><b>${esc(l.n)}</b>${l.hide ? ' <span class="ltag u">ukryta</span>' : ''}${l._o ? ' <span class="ltag g">edytowana</span>' : ''}<br>
    <span class="mut small">${flag(l.cc)} ${cName(l.cc)}${rName(l) ? ' · ' + esc(rName(l)) : ''} · ${l.t === 'm' ? 'miasto' : 'wieś'}${l.pop ? ' · ' + popTxt(l.pop) : ''}</span></span><span class="mut small">Edytuj ›</span></button>`).join('') || '<div class="mut small">Brak wyników.</div>';
}
function admPlaces() {
  const list = GLOBAL.filter(g => !g.del && !g.ov).sort((a, b) => (b.ts || 0) - (a.ts || 0)), ovs = GLOBAL.filter(g => g.ov && LOC[g.id]);
  return `<div class="chips">${CONT.map(c => `<button class="${c.id === ADM.cid ? 'on' : ''}" data-a="admCont" data-c="${c.id}">${c.n}</button>`).join('')}</div>
    <div class="placebar"><span class="grow">Dotknij <b>miejscowości</b> na mapie, żeby ją edytować, albo <b>pustego miejsca</b>, żeby dodać nową.</span></div>
    ${lmapOn() ? '<div id="lmapSlot" class="lslot"></div>' : '<div class="card mut small">Mapa szczegółowa niedostępna (brak internetu / WebGL) — użyj współrzędnych poniżej.</div>'}
    <h2>Edytuj miejscowość</h2><div class="card"><input id="admPQ" data-admpq="1" type="search" placeholder="Szukaj (${CN[ADM.cid].n}): np. Dębno" value="${esc(ADM.pq || '')}" autocomplete="off"><div id="admPR" style="margin-top:8px">${admSearch()}</div></div>
    <h2>Dodaj po współrzędnych</h2><div class="card"><div class="grid2">
      <div><label class="f" for="admLa">Szerokość (lat)</label><input id="admLa" type="number" inputmode="decimal" step="any" placeholder="52.7389"></div>
      <div><label class="f" for="admLo">Długość (lon)</label><input id="admLo" type="number" inputmode="decimal" step="any" placeholder="14.4521"></div></div>
      <div class="btns"><button class="btn p" data-a="admLL">Dalej</button><span class="mut small" style="align-self:center">z Google Maps: przytrzymaj punkt → skopiuj współrzędne</span></div></div>
    <h2>Dodane miejscowości (${list.length})</h2><div class="card">${list.map(g => `<div class="row" style="padding:6px 0;border-bottom:1px solid var(--line)"><div class="grow"><b>${esc(g.n)}</b> <span class="ltag ${g.t === 'm' ? 'm' : 'w'}">${g.t === 'm' ? 'Miasto' : 'Wieś'}</span>
      <div class="mut small">${CN[g.c] ? CN[g.c].n : g.c} · ${(+g.la).toFixed(4)}, ${(+g.lo).toFixed(4)}${g.pop ? ' · ' + popTxt(g.pop) : ''}${g.port ? ' · port' : ''}</div></div>
      <button class="btn s" data-a="admEd" data-id="${esc(g.id)}">Edytuj</button></div>`).join('') || '<div class="mut">Brak.</div>'}</div>
    <h2>Zmienione / ukryte z bazy (${ovs.length})</h2><div class="card">${ovs.map(g => { const l = LOC[g.id]; return `<div class="row" style="padding:6px 0;border-bottom:1px solid var(--line)"><div class="grow"><b>${esc(l.n)}</b>${g.del ? ' <span class="ltag u">ukryta</span>' : ' <span class="ltag g">edytowana</span>'}
      <div class="mut small">${flag(l.cc)} ${cName(l.cc)} · oryginał: ${esc((l._o || l).n)}</div></div>
      <button class="btn s" data-a="admEd" data-id="${esc(g.id)}">Edytuj</button></div>`; }).join('') || '<div class="mut">Brak.</div>'}</div>`;
}
// okno edycji miejscowości (admin): nazwa, typ, ludność, port, położenie; zapis widzą wszyscy gracze
function admEdit(id) {
  const l = LOC[id]; if (!l) return;
  const ov = GLOBAL.find(g => g.id === id && g.ov);
  ui.ed = { id, n: l.n, t: l.t, pop: l.pop || 0, port: !!l.port, la: l.la, lo: l.lo, g: !!l.g, ov: !!ov, hidden: !!(ov && ov.del) };
  edSheet();
}
function edSheet() {
  const e = ui.ed, l = LOC[e.id];
  $('modal').hidden = false;
  $('modal').innerHTML = `<div class="sheet"><div class="row"><b class="grow" style="font-size:17px">Edycja: ${esc(l.n)}</b><button class="btn s" data-a="close">Zamknij</button></div>
    <div class="mut small" style="margin-top:4px">${flag(l.cc)} ${cName(l.cc)}${rName(l) ? ' · ' + esc(rName(l)) : ''} · ${e.g ? 'dodana przez admina' : 'z bazy' + (e.ov ? ' (zmieniona)' : '')}${e.hidden ? ' · UKRYTA' : ''}</div>
    <label class="f" for="edN">Nazwa</label><input id="edN" data-ed="n" maxlength="30" value="${esc(e.n)}">
    <label class="f">Typ</label><div class="grid2">${['w', 'm'].map(t => `<button class="wz-opt ${e.t === t ? 'on' : ''}" data-a="edSet" data-k="t" data-v="${t}"><b>${TYPE[t].n}</b></button>`).join('')}</div>
    <div class="grid2"><div><label class="f" for="edP">Ludność</label><input id="edP" data-ed="pop" type="number" inputmode="numeric" min="0" value="${e.pop}"></div>
      <div><label class="f">&nbsp;</label><button class="toggle ${e.port ? 'on' : ''}" data-a="edSet" data-k="port" style="width:100%;min-height:40px">Port: ${e.port ? 'tak' : 'nie'}</button></div></div>
    <div class="grid2"><div><label class="f" for="edLa">Szerokość (lat)</label><input id="edLa" data-ed="la" type="number" inputmode="decimal" step="any" value="${e.la}"></div>
      <div><label class="f" for="edLo">Długość (lon)</label><input id="edLo" data-ed="lo" type="number" inputmode="decimal" step="any" value="${e.lo}"></div></div>
    <div id="edErr" class="warn"></div>
    <div class="btns"><button class="btn p" data-a="edSave">Zapisz dla wszystkich</button>
      ${e.g ? '<button class="btn" data-a="edDel">Usuń</button>' : e.hidden ? '<button class="btn" data-a="edRestore">Przywróć</button>' : '<button class="btn" data-a="edHide">Ukryj</button>'}
      ${e.ov ? '<button class="btn" data-a="edRestore">Przywróć oryginał</button>' : ''}</div></div>`;
}
function edWrite(data, msg) {
  if (!DB || !isAdmin()) return;
  const e = ui.ed;
  DB.collection('places').doc(e.id).set(data, { merge: true }).then(() => toast(msg)).catch(er => toast('Błąd zapisu: ' + (er.code || er.message)));
  $('modal').hidden = true;
}
function renderAdmin() {
  if (!ADM.on) return;
  const el = $('adm'), T = [['gracze', 'Gracze'], ['stat', 'Statystyki'], ['miejsca', 'Miejscowości']];
  const animate = ADM.lastTab !== ADM.tab; ADM.lastTab = ADM.tab;
  let body = '';
  if (ADM.tab === 'gracze') body = `<div class="lsearch"><input id="admQ" data-admq="1" type="search" placeholder="Szukaj: e-mail, firma, prezes" value="${esc(ADM.q)}">
      <select data-in="admSort" style="width:auto">${[['worth', 'Wartość'], ['active', 'Aktywność'], ['new', 'Najnowsi']].map(([k, n]) => `<option value="${k}" ${ADM.sort === k ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
      <div class="mut small" style="margin:4px 2px 8px">${ADM.players.length} graczy z kontem</div><div id="admList"></div>`;
  else if (ADM.tab === 'stat') body = admStats();
  else body = admPlaces();
  el.innerHTML = `<div class="adm-top"><div class="grow"><b>Panel administratora</b><div class="mut small">XyxWord · ${esc(VERSION)}</div></div><button class="btn s" data-a="logout">Wyloguj</button></div>
    <div class="au-tabs adm-tabs">${T.map(([k, n]) => `<button class="${ADM.tab === k ? 'on' : ''}" data-a="admTab" data-v="${k}">${n}</button>`).join('')}<i style="left:calc(${T.findIndex(t => t[0] === ADM.tab)} * 33.33% + 4px);width:calc(33.33% - 8px)"></i></div>
    ${ADM.err ? `<div class="card warn">${esc(ADM.err)}</div>` : ''}<div class="adm-body ${animate ? 'enter' : ''}">${body}</div>`;
  if (ADM.tab === 'gracze') renderAdminList();
  if (ADM.tab === 'miejsca' && $('lmapSlot')) { ui.place = true; mountLM(ADM.cid, ''); }
}
function admPlayer(uid) {
  const p = ADM.players.find(x => x.uid === uid); if (!p) return;
  const rows = [['E-mail', esc(p.email)], ['Firma', esc(p.name)], ['Prezes', esc(p.ceo)], ['Wartość firmy', money(p.worth || 0)], ['Gotówka', money(p.cash || 0)],
    ['Przepływ /h', money(p.inc || 0)], ['Siedziba', `${LOC[p.hl] ? LOC[p.hl].n : '—'} (${(CN[p.hq] || {}).n || '—'})`], ['Trudność', (DIFF[p.diff ?? 1] || {}).n || '—'],
    ['Sezon / dzień gry', `${p.season || 1} / ${Math.floor((p.hour || 0) / 24) + 1}`], ['Punkty prestiżu', p.pp || 0], ['Zakłady (suma poziomów)', `${p.bld || 0} (${p.lvl || 0})`],
    ['Miejscowości / kontynenty', `${p.locs || 0} / ${p.conts || 0}`], ['Licencje (państwa)', p.lic || 0], ['Porty', p.ports || 0], ['Pojazdy / statki', `${p.veh || 0} / ${p.ships || 0}`],
    ['Konto od', dt(p.created)], ['Ostatnio aktywny', `${dt(p.updated)} (${ago(p.updated)})`], ['Wersja / platforma', `${esc(p.ver || '?')} / ${p.plat || '?'}`], ['UID', `<span class="small">${esc(p.uid)}</span>`]];
  $('modal').hidden = false;
  $('modal').innerHTML = `<div class="sheet"><div class="row"><span class="dot" style="background:${esc(p.color || '#888')}"></span><b class="grow" style="font-size:17px">${esc(p.name || 'Gracz')}</b><button class="btn s" data-a="close">Zamknij</button></div>
    <div class="card" style="margin-top:10px"><table><tbody>${rows.map(([k, v]) => `<tr><td class="mut">${k}</td><td class="n">${v}</td></tr>`).join('')}</tbody></table></div></div>`;
}
document.addEventListener('input', e => { const t = e.target; if (t.dataset.admq) { ADM.q = t.value; renderAdminList(); } if (t.dataset.admpq) { ADM.pq = t.value; const r = $('admPR'); if (r) r.innerHTML = admSearch(); } if (t.dataset.ed && ui.ed) ui.ed[t.dataset.ed] = t.value; });
document.addEventListener('change', e => { if (e.target.dataset.in === 'admSort') { ADM.sort = e.target.value; renderAdminList(); } });

// ================== PĘTLA ==================
initPts();
let acc = 0, prev = performance.now(), n = 0;
function loop() {
  const now = performance.now(); acc += Math.min(now - prev, 60000); prev = now;
  if (!S || !S.setup || ui.locked) { acc = 0; return; }
  let ran = false;
  while (acc >= HOUR_MS) { acc -= HOUR_MS; hour(S); ran = true; }
  if (ran) {
    if (++n % 3 === 0) save();
    if (ui.seasonEnd) { ui.seasonEnd = false; toast(`Koniec sezonu! Miejsce ${S.lastSeason.pos}, +${S.lastSeason.pp} pkt prestiżu`); }
    render(false);
  }
}
document.addEventListener('visibilitychange', () => {
  if (!S) return;
  if (document.hidden) { save(); cloudSave(true); }
  else if (S.setup) { // po powrocie dolicz czas, który minął w tle
    const off = Math.min(OFFLINE_MAX_H, Math.floor((Date.now() - S.last) / HOUR_MS));
    for (let i = 0; i < off; i++) hour(S);
    acc = 0; prev = performance.now(); save(); render(true);
  }
});
if (VERSION === 'dev') window.__xyx = { get S() { return S; }, get LM() { return LM; }, parseSave, newState, LOCS, hour: n => { for (let i = 0; i < n; i++) hour(S); render(true); } };
registerCustom(null);
if (FB) { au.mode = 'wait'; renderAuth(); firebase.auth().onAuthStateChanged(onUser); listenPlaces(); listenBld(); }
else if (localStorage.getItem('xyx_guest') === '1') startGame(load(SAVE) || newState());
else renderAuth();
setInterval(loop, 500);
checkUpdate(false);
setInterval(() => checkUpdate(false), 5 * 60 * 1000);
document.addEventListener('visibilitychange', () => { if (document.hidden) return; if (ui.dl && ui.dl.st === 'perm') runUpdate(); else checkUpdate(false); });
})();
