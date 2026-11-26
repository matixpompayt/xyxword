// Generuje www/maps.js (mapy jako ścieżki SVG) i www/places.js (miasta i wsie) z danych Natural Earth + GeoNames.
// Użycie: cd tools && npm i world-atlas@2 topojson-client@3 d3-geo@3 all-the-cities@3 countries-list@3 && node build-maps.mjs
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

// --- ląd: wielokąty (do wykrywania wybrzeża i wysp) ---
const landF = topo.feature(w50, w50.objects.land);
const landPolys = (landF.features || [landF]).flatMap(f => f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates);
const polys = landPolys.map((c, i) => { const f = { type: 'Polygon', coordinates: c }; return { i, f, b: d3.geoBounds(f), a: d3.geoArea(f) }; });
const inPoly = (pl, p) => { const [[x0, y0], [x1, y1]] = pl.b; return (x0 > x1 || (p[0] >= x0 && p[0] <= x1)) && p[1] >= y0 && p[1] <= y1 && d3.geoContains(pl.f, p); };
const polyAt = p => polys.find(pl => inPoly(pl, p));
function offset([lo, la], km, deg) { const r = km / 6371, b = deg * Math.PI / 180, f1 = la * Math.PI / 180, l1 = lo * Math.PI / 180;
  const f2 = Math.asin(Math.sin(f1) * Math.cos(r) + Math.cos(f1) * Math.sin(r) * Math.cos(b));
  const l2 = l1 + Math.atan2(Math.sin(b) * Math.sin(r) * Math.cos(f1), Math.cos(r) - Math.sin(f1) * Math.sin(f2));
  return [l2 * 180 / Math.PI, f2 * 180 / Math.PI]; }
function geo(lo, la) { // ld = wyspa/kontynent, port = wybrzeże w promieniu ~12 km
  const p = [lo, la]; let pl = polyAt(p), coast = false;
  for (let d = 0; d < 360; d += 30) { const q = offset(p, 12, d), h = polyAt(q); if (!h) coast = true; else if (!pl) pl = h; }
  return { ld: pl ? (pl.a > 0.02 ? 'L' + pl.i : 'I' + pl.i) : 'X', coast };
}
const kmD = (a, b) => d3.geoDistance(a, b) * 6371;
const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/ł/g, 'l').replace(/[^a-z0-9]+/g, '');

const places = [], ids = new Set();
for (const [id, c, n, t, la, lo, port, ld] of BASE) {
  const g = geo(lo, la);
  places.push({ id, c, n, t, la, lo, port: port ? 1 : 0, ld: c + ':' + g.ld, pop: 0, f: 1 }); ids.add(id);
}
const hash = x => { x = (x ^ 61) ^ (x >>> 16); x = x + (x << 3); x ^= x >>> 4; x = Math.imul(x, 0x27d4eb2d); return (x ^ (x >>> 15)) >>> 0; };
for (const [cid, cf] of Object.entries(CFG)) {
  const pool = CITIES.map(x => ({ x, lo: x.loc.coordinates[0], la: x.loc.coordinates[1] })).filter(o => contOf(o.x.country, o.lo, o.la) === cid);
  const mine = places.filter(p => p.c === cid);
  const ok = (o, km) => mine.every(p => kmD([p.lo, p.la], [o.lo, o.la]) >= km);
  const add = (o, t) => {
    const g = geo(o.lo, o.la); if (g.ld === 'X') return false;
    let n = PL[o.x.name] || o.x.name, id = slug(n) || 'p' + o.x.cityId; if (ids.has(id)) id += o.x.country.toLowerCase(); if (ids.has(id)) id += o.x.cityId;
    const p = { id, c: cid, n, t, la: +o.la.toFixed(3), lo: +o.lo.toFixed(3), port: g.coast ? 1 : 0, ld: cid + ':' + g.ld, pop: o.x.population, f: 0 };
    ids.add(id); places.push(p); mine.push(p); return true;
  };
  // miejsca bazowe: uzupełnij ludność
  for (const p of mine) { const m = pool.filter(o => kmD([p.lo, p.la], [o.lo, o.la]) < 15).sort((a, b) => b.x.population - a.x.population)[0]; if (m) p.pop = m.x.population; }
  let n = 0;
  for (const o of pool.filter(o => o.x.population >= cf.cityPop).sort((a, b) => b.x.population - a.x.population)) {
    if (n >= cf.nCity) break; if (ok(o, cf.cityKm) && add(o, 'm')) n++;
  }
  n = 0;
  for (const o of pool.filter(o => o.x.population >= 800 && o.x.population <= 8000 && /^PPL$/.test(o.x.featureCode)).sort((a, b) => hash(a.x.cityId) - hash(b.x.cityId))) {
    if (n >= cf.nVil) break; if (ok(o, cf.vilKm) && add(o, 'w')) n++;
  }
}

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
  for (const l of places.filter(l => l.c === cid)) m.pts[l.id] = proj([l.lo, l.la]).map(r1);
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
fs.writeFileSync(WWW + 'places.js', '// Wygenerowane przez tools/build-maps.mjs — miejscowości: GeoNames (CC BY 4.0)\n// [id, kontynent, nazwa, typ m/w, lat, lon, port, ląd, ludność, polecane]\nwindow.XYX_PLACES = [\n' +
  places.map(p => JSON.stringify([p.id, p.c, p.n, p.t, p.la, p.lo, p.port, p.ld, p.pop, p.f])).join(',\n') + '\n];\n');
const cnt = {}; for (const p of places) { const k = p.c + p.t; cnt[k] = (cnt[k] || 0) + 1; }
console.log(places.length, cnt, 'ports', places.filter(p => p.port).length);
