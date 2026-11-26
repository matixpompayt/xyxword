// Generuje www/maps.js (mapy jako ścieżki SVG) i www/places.js (miasta i wsie) z danych Natural Earth + GeoNames.
// Wymaga tools/admin1.geojson (ne_10m_admin_1_states_provinces.geojson z github.com/nvkelso/natural-earth-vector).
// Użycie (OLD=ścieżka do poprzedniego places.js opcjonalnie): cd tools && npm i world-atlas@2 topojson-client@3 d3-geo@3 all-the-cities@3 countries-list@3 && node build-maps.mjs
import fs from 'fs';
import { createRequire } from 'module';
import * as topo from 'topojson-client';
import * as d3 from 'd3-geo';
const require = createRequire(import.meta.url);
const here = new URL('.', import.meta.url).pathname, WWW = process.env.WWW || here + '../www/';
const CITIES = require('all-the-cities'), { countries } = require('countries-list');
const w50 = require('world-atlas/countries-50m.json'), w110 = require('world-atlas/countries-110m.json');

// --- ręcznie wybrane miejsca (polecane, stałe id) z game.js ---
const src = fs.readFileSync(WWW + 'game.js', 'utf8');
const BASE = eval(src.match(/const LOCS_BASE = (\[[\s\S]*?\]);/)[1]);

const CFG = {
  eu: { p: () => d3.geoConicConformal().rotate([-12, 0]).parallels([40, 65]), b: [[-11, 35], [36, 70]], cityPop: 100000, cityKm: 45, nCity: 170, vilKm: 40, nVil: 160 },
  na: { p: () => d3.geoConicConformal().rotate([98, 0]).parallels([30, 50]), b: [[-126, 24], [-66, 51]], cityPop: 150000, cityKm: 90, nCity: 120, vilKm: 90, nVil: 110 },
  sa: { p: () => d3.geoMercator(), b: [[-82, -56], [-34, 13]], cityPop: 200000, cityKm: 110, nCity: 80, vilKm: 120, nVil: 80 },
  af: { p: () => d3.geoMercator(), b: [[-18, -36], [52, 38]], cityPop: 250000, cityKm: 140, nCity: 100, vilKm: 150, nVil: 90 },
  as: { p: () => d3.geoMercator(), b: [[62, 6], [148, 48]], cityPop: 500000, cityKm: 110, nCity: 150, vilKm: 130, nVil: 110 },
  au: { p: () => d3.geoMercator(), b: [[112, -44], [155, -10]], cityPop: 20000, cityKm: 80, nCity: 45, vilKm: 110, nVil: 60 },
};
const CONT_OF = { EU: 'eu', NA: 'na', SA: 'sa', AF: 'af', AS: 'as', OC: 'au' };
const EURASIA_EU = new Set(['RU', 'TR', 'KZ', 'GE', 'AZ', 'AM', 'CY']);
const inBox = (b, lo, la) => lo >= b[0][0] && lo <= b[1][0] && la >= b[0][1] && la <= b[1][1];
function contOf(cc, lo, la) {
  const k = countries[cc] && countries[cc].continent;
  if (EURASIA_EU.has(cc) && inBox(CFG.eu.b, lo, la)) return 'eu';
  const c = CONT_OF[k];
  return c && inBox(CFG[c].b, lo, la) ? c : null;
}
// polskie nazwy największych miast
const PL = { Warsaw: 'Warszawa', Moscow: 'Moskwa', 'Saint Petersburg': 'Petersburg', Munich: 'Monachium', Cologne: 'Kolonia', Vienna: 'Wiedeń', Rome: 'Rzym',
  Prague: 'Praga', Paris: 'Paryż', London: 'Londyn', Lisbon: 'Lizbona', Athens: 'Ateny', Bucharest: 'Bukareszt', Belgrade: 'Belgrad', Copenhagen: 'Kopenhaga',
  Brussels: 'Bruksela', Milan: 'Mediolan', Naples: 'Neapol', Turin: 'Turyn', Venice: 'Wenecja', Florence: 'Florencja', Genoa: 'Genua', Marseille: 'Marsylia',
  Lyon: 'Lyon', Seville: 'Sewilla', Zaragoza: 'Saragossa', Kyiv: 'Kijów', Kharkiv: 'Charków', Lviv: 'Lwów', Odesa: 'Odessa', Minsk: 'Mińsk', Vilnius: 'Wilno',
  Riga: 'Ryga', Tallinn: 'Tallinn', Helsinki: 'Helsinki', Stockholm: 'Sztokholm', 'Gothenburg': 'Göteborg', Hamburg: 'Hamburg', Nuremberg: 'Norymberga',
  Frankfurt: 'Frankfurt', 'Frankfurt am Main': 'Frankfurt nad Menem', Dresden: 'Drezno', Leipzig: 'Lipsk', Hanover: 'Hanower', Brunswick: 'Brunszwik',
  Zurich: 'Zurych', Geneva: 'Genewa', Bratislava: 'Bratysława', Ljubljana: 'Lublana', Sofia: 'Sofia', 'Chisinau': 'Kiszyniów', Istanbul: 'Stambuł',
  Antwerp: 'Antwerpia', 'The Hague': 'Haga', Edinburgh: 'Edynburg', Dublin: 'Dublin', Cairo: 'Kair', Alexandria: 'Aleksandria', 'Cape Town': 'Kapsztad',
  Algiers: 'Algier', Tunis: 'Tunis', Casablanca: 'Casablanca', 'Addis Ababa': 'Addis Abeba', Beijing: 'Pekin', Shanghai: 'Szanghaj', Tokyo: 'Tokio',
  Seoul: 'Seul', Mumbai: 'Mumbaj', 'New Delhi': 'Nowe Delhi', Delhi: 'Delhi', Kolkata: 'Kalkuta', Bangkok: 'Bangkok', Hanoi: 'Hanoi', 'Hong Kong': 'Hongkong',
  Singapore: 'Singapur', 'New York City': 'Nowy Jork', Philadelphia: 'Filadelfia', 'Mexico City': 'Meksyk', Havana: 'Hawana', 'Rio de Janeiro': 'Rio de Janeiro',
  'Buenos Aires': 'Buenos Aires', Bogotá: 'Bogota', Lima: 'Lima', Cracow: 'Kraków', Krakow: 'Kraków', Breslau: 'Wrocław', Danzig: 'Gdańsk', 'Köln': 'Kolonia', 'Nürnberg': 'Norymberga', 'München': 'Monachium', 'İzmir': 'Izmir', 'Wien': 'Wiedeń', 'Roma': 'Rzym', 'Napoli': 'Neapol', 'Torino': 'Turyn', 'Milano': 'Mediolan', 'Firenze': 'Florencja', 'Genova': 'Genua', 'Venezia': 'Wenecja', 'Lisboa': 'Lizbona', 'Sevilla': 'Sewilla', 'Bruxelles': 'Bruksela', 'Antwerpen': 'Antwerpia', 'København': 'Kopenhaga', 'Göteborg': 'Göteborg', 'Praha': 'Praga', 'Bucureşti': 'Bukareszt', 'Beograd': 'Belgrad', 'Athína': 'Ateny', 'Moskva': 'Moskwa', 'Kyiv': 'Kijów', 'Lviv': 'Lwów', 'Kharkiv': 'Charków' };

// --- ląd jako raster (0.04°): wartość = numer wielokąta + 1 (wyspy/kontynenty), 0 = woda ---
const RES = 0.04, LAT0 = -60, LAT1 = 80, COLS = Math.round(360 / RES), ROWS = Math.round((LAT1 - LAT0) / RES);
const grid = new Int16Array(COLS * ROWS);
const landF = topo.feature(w50, w50.objects.land);
const landPolys = (landF.features || [landF]).flatMap(f => f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates);
landPolys.forEach((rings, pi) => {
  const buckets = new Map();
  for (const ring of rings) for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i], [x2, y2] = ring[i + 1]; if (y1 === y2) continue;
    const r0 = Math.max(0, Math.ceil((Math.min(y1, y2) - LAT0) / RES - .5)), r1 = Math.min(ROWS - 1, Math.floor((Math.max(y1, y2) - LAT0) / RES - .5));
    for (let r = r0; r <= r1; r++) { let b = buckets.get(r); if (!b) buckets.set(r, b = []); b.push(x1, y1, x2, y2); }
  }
  for (const [r, e] of buckets) {
    const y = LAT0 + (r + .5) * RES, xs = [];
    for (let i = 0; i < e.length; i += 4) { const [x1, y1, x2, y2] = [e[i], e[i + 1], e[i + 2], e[i + 3]];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) xs.push(x1 + (y - y1) / (y2 - y1) * (x2 - x1)); }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const c0 = Math.max(0, Math.ceil((xs[i] + 180) / RES - .5)), c1 = Math.min(COLS - 1, Math.floor((xs[i + 1] + 180) / RES - .5));
      for (let c = c0; c <= c1; c++) grid[r * COLS + c] = pi + 1;
    }
  }
});
const cellAt = (lo, la) => { const r = Math.floor((la - LAT0) / RES), c = Math.floor((lo + 180) / RES); return r < 0 || r >= ROWS ? 0 : grid[r * COLS + ((c % COLS) + COLS) % COLS]; };
function geo(lo, la) { // ld = wyspa/kontynent, port = woda w promieniu ~3 komórek (~12 km)
  let v = cellAt(lo, la), coast = false;
  const R = 3, dl = RES / Math.max(.2, Math.cos(la * Math.PI / 180));
  for (let i = -R; i <= R; i++) for (let j = -R; j <= R; j++) {
    if (i * i + j * j > R * R) continue;
    const w = cellAt(lo + j * dl, la + i * RES);
    if (!w) coast = true; else if (!v) v = w;
  }
  return { ld: v ? 'L' + (v - 1) : 'X', coast };
}
const kmD = (a, b) => d3.geoDistance(a, b) * 6371;
const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/ł/g, 'l').replace(/[^a-z0-9]+/g, '');

// id z wersji 0.6 (żeby stare zapisy działały)
const OLD = new Map();
try { const t = fs.readFileSync(process.env.OLD || here + 'places_v06.js', 'utf8'); for (const p of eval(t.slice(t.indexOf('= [') + 2, t.lastIndexOf(']') + 1)))
  OLD.set(p[2] + '|' + (+p[4]).toFixed(2) + '|' + (+p[5]).toFixed(2), p[0]); } catch (e) { console.log('brak starych id'); }

const places = [], ids = new Set();
for (const [id, c, n, t, la, lo, port] of BASE) {
  const g = geo(lo, la);
  places.push({ id, c, n, t, la, lo, port: port ? 1 : 0, ld: c + ':' + g.ld, pop: 0, f: 1 }); ids.add(id);
}
const OKF = /^PPL(A\d?|C)?$/;
for (const [cid, cf] of Object.entries(CFG)) {
  const pool = CITIES.map(x => ({ x, lo: x.loc.coordinates[0], la: x.loc.coordinates[1] }))
    .filter(o => OKF.test(o.x.featureCode) && contOf(o.x.country, o.lo, o.la) === cid).sort((a, b) => b.x.population - a.x.population);
  const near = new Map(), K = .05, key = (lo, la) => Math.floor(lo / K) + ',' + Math.floor(la / K);
  const put = (p, km) => { const k = key(p.lo, p.la); (near.get(k) || near.set(k, []).get(k)).push([p, km]); };
  const tooClose = o => { const cx = Math.floor(o.lo / K), cy = Math.floor(o.la / K);
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (const [p, km] of near.get((cx + i) + ',' + (cy + j)) || [])
      if (kmD([p.lo, p.la], [o.lo, o.la]) < km) return p; return null; };
  for (const p of places.filter(p => p.c === cid)) put(p, 3);
  let n = 0;
  for (const o of pool) {
    const hit = tooClose(o);
    if (hit) { if (hit.f && !hit.pop) hit.pop = o.x.population; continue; }
    const g = geo(o.lo, o.la); if (g.ld === 'X') continue;
    const nm = PL[o.x.name] || o.x.name, la = +o.la.toFixed(3), lo = +o.lo.toFixed(3);
    let id = OLD.get(nm + '|' + la.toFixed(2) + '|' + lo.toFixed(2)) || 'g' + o.x.cityId;
    if (ids.has(id)) id = 'g' + o.x.cityId;
    if (ids.has(id)) continue;
    const p = { id, c: cid, n: nm, t: o.x.population >= 10000 ? 'm' : 'w', la, lo, port: g.coast ? 1 : 0, ld: cid + ':' + g.ld, pop: o.x.population, f: 0, cc: o.x.country };
    ids.add(id); places.push(p); put(p, 2); n++;
  }
}

// miejsca z 0.6, które odpadły przy deduplikacji — zostają (zapisy graczy)
const OLDP = (() => { try { const t = fs.readFileSync(process.env.OLD || here + 'places_v06.js', 'utf8'); return eval(t.slice(t.indexOf('= [') + 2, t.lastIndexOf(']') + 1)); } catch (e) { return []; } })();
for (const [id, c, n, t, la, lo, port, , pop] of OLDP) if (!ids.has(id)) {
  const g = geo(lo, la); ids.add(id);
  places.push({ id, c, n, t, la, lo, port: port ? 1 : 0, ld: c + ':' + (g.ld === 'X' ? 'L0' : g.ld), pop: pop || 0, f: 0 });
}

// --- państwa i regiony (województwa/landy/stany): Natural Earth admin-1 (name_pl) rasteryzowane jak ląd ---
const A1 = JSON.parse(fs.readFileSync(process.env.ADMIN1 || here + 'admin1.geojson', 'utf8')).features;
const rgrid = new Int16Array(COLS * ROWS);
A1.forEach((f, ri) => {
  const polys = f.geometry ? (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates) : [];
  const buckets = new Map();
  for (const rings of polys) for (const ring of rings) for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i], [x2, y2] = ring[i + 1]; if (y1 === y2) continue;
    const r0 = Math.max(0, Math.ceil((Math.min(y1, y2) - LAT0) / RES - .5)), r1 = Math.min(ROWS - 1, Math.floor((Math.max(y1, y2) - LAT0) / RES - .5));
    for (let r = r0; r <= r1; r++) { let b = buckets.get(r); if (!b) buckets.set(r, b = []); b.push(x1, y1, x2, y2); }
  }
  for (const [r, e] of buckets) {
    const y = LAT0 + (r + .5) * RES, xs = [];
    for (let i = 0; i < e.length; i += 4) { const x1 = e[i], y1 = e[i + 1], x2 = e[i + 2], y2 = e[i + 3];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) xs.push(x1 + (y - y1) / (y2 - y1) * (x2 - x1)); }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const c0 = Math.max(0, Math.ceil((xs[i] + 180) / RES - .5)), c1 = Math.min(COLS - 1, Math.floor((xs[i + 1] + 180) / RES - .5));
      for (let c = c0; c <= c1; c++) rgrid[r * COLS + c] = ri + 1;
    }
  }
});
const rAt = (lo, la) => { const r = Math.floor((la - LAT0) / RES), c = Math.floor((lo + 180) / RES); return r < 0 || r >= ROWS ? 0 : rgrid[r * COLS + ((c % COLS) + COLS) % COLS]; };
function regionOf(lo, la, cc) {
  let v = rAt(lo, la);
  const ok = v => v && (!cc || A1[v - 1].properties.iso_a2 === cc);
  if (ok(v)) return v - 1;
  for (let R = 1; R <= 12; R++) { const dl = RES / Math.max(.2, Math.cos(la * Math.PI / 180));
    for (let i = -R; i <= R; i++) for (let j = -R; j <= R; j++) { if (Math.max(Math.abs(i), Math.abs(j)) !== R) continue; const w = rAt(lo + j * dl, la + i * RES); if (ok(w)) return w - 1; } }
  return v ? v - 1 : -1;
}
const RG = [], rgIdx = new Map();
const rgName = p => { let n = p.name_pl || p.name || '?'; return n.replace(/^województwo /, '').replace(/^(kraj|land|prowincja|stan|region) /i, ''); };
const ISO_OK = /^[A-Z]{2}$/;
for (const p of places) {
  const ri = regionOf(p.lo, p.la, p.cc);
  if (ri >= 0) { const f = A1[ri].properties; if (!p.cc && ISO_OK.test(f.iso_a2)) p.cc = f.iso_a2;
    if (!rgIdx.has(ri)) { rgIdx.set(ri, RG.length); RG.push([rgName(f), ISO_OK.test(f.iso_a2) ? f.iso_a2 : (p.cc || '')]); } p.rg = rgIdx.get(ri); }
  else p.rg = -1;
  if (!p.cc) p.cc = '';
}
const CCS = [...new Set(places.map(p => p.cc))].sort();

// --- mapy ---
const W = 1000, r1 = v => Math.round(v * 10) / 10;
const bbox = ([[x0, y0], [x1, y1]]) => { const c = [], n = 40;
  for (let i = 0; i <= n; i++) c.push([x0 + (x1 - x0) * i / n, y0]); for (let i = 0; i <= n; i++) c.push([x1, y0 + (y1 - y0) * i / n]);
  for (let i = n; i >= 0; i--) c.push([x0 + (x1 - x0) * i / n, y1]); for (let i = n; i >= 0; i--) c.push([x0, y0 + (y1 - y0) * i / n]);
  return { type: 'Polygon', coordinates: [c.reverse()] }; };
function build(proj, t, withBorders) {
  const path = d3.geoPath(proj).digits(1);
  return { land: path(topo.feature(t, t.objects.land)), borders: withBorders ? path(topo.mesh(t, t.objects.countries, (a, b) => a !== b)) || '' : '',
    grat: path(d3.geoGraticule().step([10, 10])()) };
}
const out = {};
for (const [cid, c] of Object.entries(CFG)) {
  const proj = c.p().fitWidth(W, bbox(c.b));
  const [[, y0], [, y1]] = d3.geoPath(proj).bounds(bbox(c.b));
  const H = Math.round(y1 - y0);
  proj.translate([proj.translate()[0], proj.translate()[1] - y0]).clipExtent([[0, 0], [W, H]]);
  const m = build(proj, w50, true);
  m.w = W; m.h = H; m.pts = {}; m.box = c.b;
  m.proj = { type: cid === 'eu' || cid === 'na' ? 'geoConicConformal' : 'geoMercator', rotate: proj.rotate(), scale: proj.scale(), translate: proj.translate(),
    parallels: proj.parallels ? proj.parallels() : null };
  out[cid] = m;
}
{
  const proj = d3.geoNaturalEarth1().fitWidth(W, { type: 'Sphere' });
  const H = Math.round(d3.geoPath(proj).bounds({ type: 'Sphere' })[1][1]);
  const m = build(proj, w110, false);
  m.w = W; m.h = H; m.pts = {};
  for (const cid of Object.keys(CFG)) { const ls = BASE.filter(l => l[1] === cid);
    m.pts[cid] = proj([ls.reduce((a, l) => a + l[5], 0) / ls.length, ls.reduce((a, l) => a + l[4], 0) / ls.length]).map(r1); }
  out.world = m;
}
fs.writeFileSync(WWW + 'maps.js', '// Wygenerowane przez tools/build-maps.mjs — mapy: Natural Earth (domena publiczna)\nwindow.XYX_MAPS = ' + JSON.stringify(out) + ';\n');
const P = {};
for (const cid of Object.keys(CFG)) {
  const ls = places.filter(p => p.c === cid), ldt = [...new Set(ls.map(p => p.ld))];
  P[cid] = { id: ls.map(p => p.id).join('|'), n: ls.map(p => p.n.replace(/\|/g, '/')).join('|'), t: ls.map(p => p.t).join(''), p: ls.map(p => p.port).join(''),
    f: ls.map(p => p.f).join(''), ldt, ld: ls.map(p => ldt.indexOf(p.ld)), cc: ls.map(p => CCS.indexOf(p.cc)), rg: ls.map(p => p.rg), la: ls.map(p => Math.round(p.la * 1000)), lo: ls.map(p => Math.round(p.lo * 1000)), pop: ls.map(p => p.pop) };
}
fs.writeFileSync(WWW + 'places.js', '// Wygenerowane przez tools/build-maps.mjs — miejscowości: GeoNames (CC BY 4.0), regiony: Natural Earth; format kolumnowy\nwindow.XYX_REG = ' + JSON.stringify({ cc: CCS, rg: RG }) + ';\nwindow.XYX_PLACES = ' + JSON.stringify(P) + ';\n');
const cnt = {}; for (const p of places) { const k = p.c + p.t; cnt[k] = (cnt[k] || 0) + 1; }
console.log(places.length, cnt, 'ports', places.filter(p => p.port).length);
