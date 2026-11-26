// Generuje www/maps.js (mapy świata i kontynentów jako ścieżki SVG) z danych Natural Earth.
// Użycie: cd tools && npm i world-atlas@2 topojson-client@3 d3-geo@3 && node build-maps.mjs
import fs from 'fs';
import * as topo from 'topojson-client';
import * as d3 from 'd3-geo';

const here = new URL('.', import.meta.url).pathname;
const nm = p => JSON.parse(fs.readFileSync(process.env.NM ? process.env.NM + '/' + p : here + 'node_modules/' + p, 'utf8'));
const src = fs.readFileSync(here + '../www/game.js', 'utf8');
const LOCS = eval(src.match(/const LOCS = (\[[\s\S]*?\])\.map\(/)[1]).map(([id, c, n, t, la, lo]) => ({ id, c, la, lo }));

const w50 = nm('world-atlas/countries-50m.json'), w110 = nm('world-atlas/countries-110m.json');
const W = 1000;
const bbox = ([[x0, y0], [x1, y1]]) => { // prostokąt lon/lat jako zagęszczony wielokąt (dla rzutów stożkowych)
  const c = [], n = 40;
  for (let i = 0; i <= n; i++) c.push([x0 + (x1 - x0) * i / n, y0]);
  for (let i = 0; i <= n; i++) c.push([x1, y0 + (y1 - y0) * i / n]);
  for (let i = n; i >= 0; i--) c.push([x0 + (x1 - x0) * i / n, y1]);
  for (let i = n; i >= 0; i--) c.push([x0, y0 + (y1 - y0) * i / n]);
  return { type: 'Polygon', coordinates: [c.reverse()] };
};
const CFG = {
  eu: { p: () => d3.geoConicConformal().rotate([-12, 0]).parallels([40, 65]), b: [[-11, 35], [36, 70]] },
  na: { p: () => d3.geoConicConformal().rotate([98, 0]).parallels([30, 50]), b: [[-126, 24], [-66, 51]] },
  sa: { p: () => d3.geoMercator(), b: [[-82, -56], [-34, 13]] },
  af: { p: () => d3.geoMercator(), b: [[-18, -36], [52, 38]] },
  as: { p: () => d3.geoMercator(), b: [[62, 6], [148, 48]] },
  au: { p: () => d3.geoMercator(), b: [[112, -44], [155, -10]] },
};
const r1 = v => Math.round(v * 10) / 10;
const out = {};
function build(proj, topoData, withBorders, H) {
  const path = d3.geoPath(proj).digits(1);
  const land = path(topo.feature(topoData, topoData.objects.land));
  const borders = withBorders ? path(topo.mesh(topoData, topoData.objects.countries, (a, b) => a !== b)) : '';
  const grat = path(d3.geoGraticule().step([10, 10])());
  return { land, borders, grat };
}
for (const [cid, c] of Object.entries(CFG)) {
  const proj = c.p().fitWidth(W, bbox(c.b));
  const [[, y0], [, y1]] = d3.geoPath(proj).bounds(bbox(c.b));
  const H = Math.round(y1 - y0);
  proj.translate([proj.translate()[0], proj.translate()[1] - y0]).clipExtent([[0, 0], [W, H]]);
  const m = build(proj, w50, true, H);
  m.w = W; m.h = H; m.pts = {};
  for (const l of LOCS.filter(l => l.c === cid)) m.pts[l.id] = proj([l.lo, l.la]).map(r1);
  out[cid] = m;
}
{ // świat
  const proj = d3.geoNaturalEarth1().fitWidth(W, { type: 'Sphere' });
  const H = Math.round(d3.geoPath(proj).bounds({ type: 'Sphere' })[1][1]);
  const m = build(proj, w110, false, H);
  m.sphere = d3.geoPath(proj).digits(1)({ type: 'Sphere' });
  m.w = W; m.h = H; m.pts = {};
  for (const cid of Object.keys(CFG)) {
    const ls = LOCS.filter(l => l.c === cid);
    m.pts[cid] = proj([ls.reduce((a, l) => a + l.lo, 0) / ls.length, ls.reduce((a, l) => a + l.la, 0) / ls.length]).map(r1);
  }
  out.world = m;
}
fs.writeFileSync(here + '../www/maps.js', '// Wygenerowane przez tools/build-maps.mjs — dane: Natural Earth (domena publiczna)\nwindow.XYX_MAPS = ' + JSON.stringify(out) + ';\n');
console.log(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, [v.w, v.h, ((v.land || "").length + (v.borders || "").length) / 1024 | 0]])));
