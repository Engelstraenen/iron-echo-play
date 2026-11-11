// OVERRIDE – 3D-Modelle (Three.js) werden beim Start zu isometrischen HD-Sprites gerendert ("pre-rendered" Look).
import * as THREE from '../vendor/three.module.js';

export const TW = 64, TH = 32;          // Iso-Kachel bei 1x
export const BS = 2;                    // Render-Skalierung (HD / Retina)
export const DIRS = 16;
const PPU = TW / Math.SQRT2 * BS;       // Pixel pro Welteinheit im Sprite
const ELEV = Math.PI / 6;               // 30° Kamera = 2:1-Isometrie

let R, scene, cam;
const SPR = {};
export { SPR };

// ---------- Texturen ----------
function ctex(w, h, fn, rep = 1) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  fn(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); return t;
}
let rs = 7; const rr = () => (rs = (rs * 16807) % 2147483647) / 2147483647;
const TEX = {};
function makeTextures() {
  TEX.concrete = ctex(128, 128, (g, w, h) => {
    g.fillStyle = '#8d9093'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { const v = 110 + rr() * 60 | 0; g.fillStyle = `rgba(${v},${v},${v - 4},.35)`; g.fillRect(rr() * w, rr() * h, 2, 2); }
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 63, w, 2); g.fillRect(63, 0, 2, h);
    for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(40,30,20,.12)'; g.beginPath(); g.arc(rr() * w, rr() * h, 6 + rr() * 14, 0, 7); g.fill(); }
  });
  TEX.camo = ctex(128, 128, (g, w, h) => {
    g.fillStyle = '#3f74a3'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) { g.fillStyle = rr() < .5 ? 'rgba(25,55,85,.55)' : 'rgba(110,170,215,.25)'; g.beginPath(); g.ellipse(rr() * w, rr() * h, 6 + rr() * 16, 4 + rr() * 10, rr() * 3, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(0,0,0,.25)'; for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 1, h); for (let y = 0; y < h; y += 32) g.fillRect(0, y, w, 1);
  });
  TEX.hazard = ctex(64, 64, (g, w, h) => {
    g.fillStyle = '#e0b12a'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1a1a';
    for (let i = -h; i < w * 2; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 8, 0); g.lineTo(i + 8 - h, h); g.lineTo(i - h, h); g.fill(); }
  });
  TEX.panel = ctex(128, 128, (g, w, h) => {
    g.fillStyle = '#5a6068'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1.5;
    for (let i = 0; i < 9; i++) { g.strokeRect(rr() * w, rr() * h, 16 + rr() * 40, 10 + rr() * 30); }
    for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(rr() * w, rr() * h, 3, 3); }
  });
  TEX.rust = ctex(64, 64, (g, w, h) => {
    g.fillStyle = '#4a3428'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 300; i++) { g.fillStyle = rr() < .5 ? 'rgba(120,60,30,.5)' : 'rgba(20,15,12,.5)'; g.fillRect(rr() * w, rr() * h, 3, 3); }
  });
}

// ---------- Material & Geometrie-Helfer ----------
const MC = {};
function M(hex, o = {}) {
  const k = hex + JSON.stringify(Object.keys(o).map(x => [x, o[x] && o[x].uuid ? o[x].uuid : o[x]]));
  if (MC[k]) return MC[k];
  return MC[k] = new THREE.MeshStandardMaterial(Object.assign({ color: hex, roughness: .72, metalness: .08, flatShading: true }, o));
}
const E = (hex, i = 2.5) => M(hex, { emissive: hex, emissiveIntensity: i, roughness: .35 });
const CHROME = () => M(0xc2cad2, { metalness: .95, roughness: .22, flatShading: false });
const DCHROME = () => M(0x3a4048, { metalness: .85, roughness: .35 });
function G() { return new THREE.Group(); }
function add(p, mesh) { mesh.castShadow = true; mesh.receiveShadow = true; p.add(mesh); return mesh; }
function box(p, w, h, d, m, x = 0, y = 0, z = 0, ry = 0, rz = 0, rx = 0) {
  const o = add(p, new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m)); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o;
}
function cyl(p, rt, rb, h, seg, m, x = 0, y = 0, z = 0, rx = 0, rz = 0, ry = 0) {
  const o = add(p, new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m)); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o;
}
function sph(p, r, m, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1, seg = 12) {
  const o = add(p, new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(6, seg / 2 | 0)), m)); o.position.set(x, y, z); o.scale.set(sx, sy, sz); return o;
}
function tor(p, r, t, m, x, y, z, rx = Math.PI / 2, seg = 24) {
  const o = add(p, new THREE.Mesh(new THREE.TorusGeometry(r, t, 6, seg), m)); o.position.set(x, y, z); o.rotation.x = rx; return o;
}
const UP = new THREE.Vector3(0, 1, 0);
function strut(p, a, b, r, m, seg = 6) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), v = B.clone().sub(A), L = v.length();
  const o = add(p, new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, seg), m));
  o.position.copy(A).add(B).multiplyScalar(.5); o.quaternion.setFromUnitVectors(UP, v.normalize()); return o;
}
function slab(p, w, d, m) { box(p, w - .06, .06, d - .06, m || M(0x75787a, { map: TEX.concrete }), 0, .03, 0); }

// ---------- ECHO-FRONT ----------
const TEAM = () => M(0xffffff, { map: TEX.camo });
const TEAMD = () => M(0x1f3247);
const GUN = () => M(0x1c1e21, { metalness: .6, roughness: .45 });

function infantry(kind, f) {
  const g = G();
  const pants = M(0x34414f), shirt = kind === 'hacker' ? M(0x29323b) : TEAM(), skin = M(0xc89878), helm = M(0x46553a);
  const a = f ? .055 : -.055;
  strut(g, [0, .15, -.035], [a, .01, -.035], .022, pants); strut(g, [0, .15, .035], [-a, .01, .035], .022, pants);
  box(g, .035, .02, .05, M(0x1a1a1a), a + .01, .01, -.035); box(g, .035, .02, .05, M(0x1a1a1a), -a + .01, .01, .035);
  box(g, .08, .14, .13, shirt, 0, .215, 0);
  box(g, .09, .06, .14, M(0x2a3644), 0, .23, 0);
  sph(g, .038, skin, .008, .315, 0);
  sph(g, .046, helm, 0, .33, 0, 1, .62, 1);
  strut(g, [0, .26, .075], [.1, .215, .03], .016, shirt); strut(g, [0, .26, -.075], [.1, .215, -.02], .016, shirt);
  if (kind === 'rocket') {
    cyl(g, .032, .032, .3, 8, M(0x59633e), .02, .31, -.065, 0, Math.PI / 2);
    cyl(g, .028, .0, .05, 8, E(0xff7a2a, 1.4), .195, .31, -.065, 0, -Math.PI / 2);
  } else box(g, .22, .026, .026, GUN(), .11, .215, .005);
  if (kind === 'hacker') {
    box(g, .06, .11, .1, M(0x3a4048), -.07, .24, 0);
    strut(g, [-.08, .29, .03], [-.1, .5, .05], .006, M(0x888888));
    sph(g, .014, E(0x30e8ff, 4), -.1, .5, .05);
    box(g, .02, .06, .09, E(0x30e8ff, 2.2), .1, .23, 0);
    box(g, .01, .015, .09, E(0x30e8ff, 3), .045, .33, 0);
  }
  g.scale.setScalar(1.3); return g;
}

function tankHull() {
  const g = G(); const tm = TEAM(), tr = M(0x18191b, { roughness: .95 }), dk = TEAMD();
  for (const z of [-.28, .28]) {
    box(g, .94, .16, .15, tr, 0, .085, z);
    for (let i = 0; i < 5; i++) cyl(g, .07, .07, .16, 10, M(0x34383c), -.34 + i * .17, .08, z, Math.PI / 2);
    box(g, .86, .07, .03, tm, 0, .19, z * 1.28);
  }
  box(g, .8, .14, .46, tm, -.02, .22, 0);
  box(g, .24, .1, .46, tm, .4, .19, 0, 0, -.55);
  box(g, .24, .05, .38, dk, -.3, .31, 0);
  for (const z of [-.12, .12]) cyl(g, .025, .025, .08, 6, M(0x222222), -.42, .32, z);
  for (const z of [-.17, .17]) box(g, .02, .03, .05, E(0xfff0c8, 2), .51, .2, z);
  return g;
}
function tankTurret() {
  const g = G(); const tm = TEAM(), dk = TEAMD();
  box(g, .38, .13, .34, tm, -.03, .36, 0);
  box(g, .08, .11, .2, dk, .19, .36, 0);
  cyl(g, .034, .034, .58, 8, GUN(), .47, .365, 0, 0, Math.PI / 2);
  cyl(g, .048, .048, .08, 8, GUN(), .76, .365, 0, 0, Math.PI / 2);
  cyl(g, .065, .065, .04, 10, dk, -.08, .445, .08);
  strut(g, [-.18, .42, -.12], [-.22, .78, -.14], .006, M(0x777777));
  box(g, .39, .02, .35, M(0x7cc4f0), -.03, .43, 0);
  return g;
}
function harvester(load) {
  const g = G(); const tm = TEAM(), dk = TEAMD(), gray = M(0x585d62, { map: TEX.panel });
  box(g, 1.02, .12, .5, M(0x2a2d31), 0, .17, 0);
  for (const z of [-.26, .26]) for (const x of [-.33, .02, .34]) cyl(g, .12, .12, .1, 12, M(0x1a1b1d, { roughness: .95 }), x, .12, z, Math.PI / 2);
  box(g, .28, .24, .46, tm, .36, .35, 0);
  box(g, .02, .09, .38, E(0xaee8ff, .7), .505, .4, 0);
  box(g, .56, .26, .5, M(0xffffff, { map: TEX.hazard }), -.18, .36, 0);
  box(g, .5, .05, .44, M(0x2a2a2a), -.18, .5, 0);
  cyl(g, .12, .12, .52, 12, gray, .6, .13, 0, Math.PI / 2);
  for (let i = 0; i < 6; i++) box(g, .05, .05, .05, M(0x999999, { metalness: .6 }), .68, .13 + Math.sin(i) * .08, -.2 + i * .08);
  cyl(g, .02, .02, .22, 6, M(0x222222), .3, .55, -.17);
  if (load) for (let i = 0; i < 7; i++) cyl(g, 0, .04 + rr() * .03, .1 + rr() * .1, 6, M(0x48e2ff, { emissive: 0x0aa8d8, emissiveIntensity: 1.2, roughness: .15 }), -.38 + rr() * .4, .55, -.18 + rr() * .36);
  return g;
}

// ---------- AXIOM ----------
function walker(f, eye) {
  const g = G(); const ch = CHROME(), dk = DCHROME(), ey = E(eye, 5);
  const s = f ? 1 : -1;
  for (const z of [-.04, .04]) {
    const k = z * s * 1.4;
    strut(g, [0, .2, z], [.04 + k, .1, z], .018, ch);
    strut(g, [.04 + k, .1, z], [-.01 + k * 1.6, .01, z], .015, ch);
    sph(g, .022, dk, .04 + k, .1, z, 1, 1, 1, 8);
    box(g, .07, .015, .035, dk, .01 + k * 1.6, .008, z);
  }
  box(g, .06, .035, .11, dk, 0, .21, 0);
  strut(g, [0, .21, 0], [0, .36, 0], .016, ch);
  for (let i = 0; i < 3; i++) box(g, .05, .012, .13 - i * .015, ch, .005, .27 + i * .03, 0);
  box(g, .045, .035, .17, dk, 0, .36, 0);
  sph(g, .048, ch, .012, .415, 0, 1.12, .98, .92);
  box(g, .045, .02, .06, dk, .035, .38, 0);
  for (const z of [-.018, .018]) sph(g, .012, ey, .056, .422, z, 1, 1, 1, 8);
  strut(g, [0, .36, .085], [.1, .3, .06], .013, ch); strut(g, [0, .36, -.085], [.1, .31, -.01], .013, ch);
  box(g, .22, .038, .034, dk, .14, .305, .03);
  box(g, .17, .008, .036, ey, .14, .326, .03);
  g.scale.setScalar(1.35); return g;
}
function drone(eye) {
  const g = G(); const ch = CHROME(), dk = DCHROME(), ey = E(eye, 5), H = .75;
  sph(g, .13, dk, 0, H, 0, 1.25, .5, 1, 16);
  sph(g, .075, ch, -.02, H + .05, 0, 1, .7, 1, 12);
  for (const a of [Math.PI / 4, -Math.PI / 4]) box(g, .5, .025, .035, ch, 0, H, 0, a);
  for (const [x, z] of [[.18, .18], [.18, -.18], [-.18, .18], [-.18, -.18]]) {
    tor(g, .085, .01, ch, x, H + .02, z);
    cyl(g, .08, .08, .004, 18, M(0xd8e0e8, { transparent: true, opacity: .28 }), x, H + .03, z);
    cyl(g, .02, .02, .05, 8, dk, x, H, z);
  }
  sph(g, .04, ey, .15, H - .01, 0, 1, 1, 1, 10);
  cyl(g, .015, .015, .16, 6, GUN(), .1, H - .07, .05, 0, Math.PI / 2);
  cyl(g, .015, .015, .16, 6, GUN(), .1, H - .07, -.05, 0, Math.PI / 2);
  return g;
}
function titan(f, eye) {
  const g = G(); const ch = CHROME(), dk = DCHROME(), ey = E(eye, 5), Y = .62;
  box(g, .72, .26, .52, dk, 0, Y, 0);
  box(g, .62, .06, .46, ch, -.02, Y + .16, 0);
  box(g, .3, .05, .54, ch, .1, Y + .02, 0);
  box(g, .24, .17, .28, M(0x2a2e34, { metalness: .8, roughness: .3 }), .44, Y + .02, 0);
  box(g, .02, .045, .22, ey, .565, Y + .04, 0);
  cyl(g, .065, .065, .62, 10, dk, 0, Y + .28, 0, 0, Math.PI / 2);
  cyl(g, .09, .09, .2, 10, ch, -.22, Y + .28, 0, 0, Math.PI / 2);
  sph(g, .055, E(0xc050ff, 4), .32, Y + .28, 0, 1, 1, 1, 10);
  const legs = [[.28, .28, 1], [.28, -.28, -1], [-.28, .28, -1], [-.28, -.28, 1]];
  for (const [x, z, ph] of legs) {
    const st = (f ? 1 : -1) * ph * .08, lift = (f ? 1 : -1) * ph > 0 ? .05 : 0;
    const hip = [x * .85, Y - .05, z * .85], knee = [x * 1.45 + st * .5, Y + .1, z * 1.45], foot = [x * 1.3 + st, .02 + lift, z * 1.35];
    strut(g, hip, knee, .045, ch, 8); strut(g, knee, foot, .04, dk, 8);
    sph(g, .06, dk, ...knee, 1, 1, 1, 10);
    cyl(g, .07, .09, .04, 8, dk, foot[0], foot[1], foot[2]);
  }
  return g;
}

// ---------- Gebäude ----------
function hq() {
  const g = G(); slab(g, 3, 3);
  const con = M(0x9a9ea2, { map: TEX.concrete }), tm = TEAM();
  box(g, 2.0, .62, 1.6, con, -.25, .37, -.3);
  box(g, 2.02, .09, 1.62, tm, -.25, .52, -.3);
  box(g, 1.7, .06, .01, E(0xa8e6ff, 1.1), -.25, .42, .505);
  box(g, .01, .06, 1.2, E(0xa8e6ff, 1.1), .755, .42, -.3);
  box(g, .7, .24, .55, M(0x5c6166, { map: TEX.panel }), -.75, .8, -.6);
  for (let i = 0; i < 4; i++) box(g, .08, .06, .4, M(0x3a3e42), -.2 + i * .14, .71, -.4);
  cyl(g, .12, .16, .5, 8, M(0x6c7176), .45, .93, -.7);
  const dish = add(g, new THREE.Mesh(new THREE.SphereGeometry(.34, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2.4), M(0xd0d4d8, { side: THREE.DoubleSide, flatShading: false, metalness: .3, roughness: .4 })));
  dish.position.set(.45, 1.28, -.7); dish.rotation.set(Math.PI * .85, 0, .4);
  cyl(g, .5, .5, .04, 24, M(0x34373a), .78, .08, .78);
  for (const x of [.66, .9]) box(g, .05, .015, .3, M(0xeeeeea), x, .105, .78);
  box(g, .22, .015, .05, M(0xeeeeea), .78, .105, .78);
  strut(g, [-1.2, .06, -1.2], [-1.2, 1.5, -1.2], .02, M(0x9a9a9a));
  sph(g, .04, E(0xff3030, 5), -1.2, 1.52, -1.2);
  box(g, .9, .1, .12, M(0xffffff, { map: TEX.hazard }), -.6, .11, 1.25);
  return g;
}
function power() {
  const g = G(); slab(g, 2, 2);
  for (const [x, z] of [[-.4, -.38], [.38, .36]]) {
    cyl(g, .38, .44, .7, 16, M(0xa7acb1, { map: TEX.concrete, flatShading: false }), x, .41, z);
    cyl(g, .385, .385, .06, 16, TEAM(), x, .58, z);
    tor(g, .29, .045, E(0x3ae6ff, 3), x, .77, z);
    cyl(g, .22, .22, .02, 16, E(0x7ff4ff, 4), x, .76, z);
  }
  strut(g, [-.4, .3, -.38], [.38, .3, .36], .06, M(0x5c6166));
  strut(g, [-.4, .5, -.38], [.38, .5, .36], .04, M(0x5c6166));
  box(g, .4, .3, .3, M(0x5c6166, { map: TEX.panel }), .5, .2, -.5);
  box(g, .02, .06, .2, E(0x3ae6ff, 2), .71, .25, -.5);
  return g;
}
function refinery() {
  const g = G(); slab(g, 3, 2);
  for (const z of [-.45, .35]) {
    cyl(g, .34, .36, .8, 16, M(0xa0a5aa, { map: TEX.concrete, flatShading: false }), -1.0, .46, z);
    sph(g, .3, M(0x48e2ff, { emissive: 0x0aa8d8, emissiveIntensity: 1.3, roughness: .1, transparent: true, opacity: .9 }), -1.0, .86, z, 1, .6, 1, 16);
  }
  box(g, 1.6, .56, 1.2, M(0x9a9ea2, { map: TEX.concrete }), .55, .34, -.25);
  box(g, 1.62, .08, 1.22, TEAM(), .55, .5, -.25);
  box(g, .7, .3, .5, M(0x5c6166, { map: TEX.panel }), .8, .77, -.4);
  strut(g, [-.7, .6, -.1], [-.25, .45, -.1], .07, M(0x4d5257));
  box(g, .9, .04, .34, M(0xffffff, { map: TEX.hazard }), 0, .05, .8);
  box(g, .6, .2, .02, E(0x48e2ff, 1.4), .55, .3, .36);
  cyl(g, .06, .07, .5, 8, M(0x4a4d50), 1.2, 1.0, -.7);
  return g;
}
function barracks() {
  const g = G(); slab(g, 2, 2, M(0x6f6c60, { map: TEX.concrete }));
  box(g, 1.3, .38, 1.15, M(0x7c7a6a, { map: TEX.concrete }), 0, .25, -.1);
  const roof = cyl(g, .72, .72, 1.34, 3, TEAM(), 0, .5, -.1, 0, Math.PI / 2); roof.scale.set(1, 1, .9);
  box(g, .34, .26, .03, M(0x1d1f21), 0, .19, .49);
  box(g, .36, .04, .04, E(0xffd27a, 1.5), 0, .34, .5);
  const sb = M(0x9a8a62, { flatShading: false });
  for (let i = 0; i < 8; i++) { box(g, .2, .09, .11, sb, -.8 + i * .23, .1, .86); if (i % 2) box(g, .2, .09, .11, sb, -.8 + i * .23, .19, .86); }
  for (let i = 0; i < 6; i++) box(g, .11, .09, .2, sb, .86, .1, -.75 + i * .25);
  strut(g, [-.8, .05, -.85], [-.8, 1.1, -.85], .012, M(0xbbbbbb));
  box(g, .3, .17, .01, TEAM(), -.64, 1.0, -.85);
  return g;
}
function factory() {
  const g = G(); slab(g, 3, 3);
  box(g, 2.4, .72, 2.0, M(0x9a9ea2, { map: TEX.concrete }), 0, .42, -.3);
  for (let i = 0; i < 4; i++) {
    const p = cyl(g, .3, .3, 2.0, 3, i % 2 ? TEAM() : M(0x8fc4e0, { metalness: .5, roughness: .2 }), -.9 + i * .6, .86, -.3, Math.PI / 2);
    p.rotation.set(Math.PI / 2, 0, Math.PI);
  }
  box(g, 1.2, .55, .03, M(0x24272a, { map: TEX.panel }), 0, .33, .71);
  box(g, 1.34, .08, .05, M(0xffffff, { map: TEX.hazard }), 0, .64, .72);
  for (const x of [-.65, .65]) box(g, .07, .6, .05, M(0xffffff, { map: TEX.hazard }), x, .33, .72);
  cyl(g, .12, .15, .7, 10, M(0x55585b), 1.05, 1.0, -1.05);
  box(g, 2.42, .07, .02, E(0xa8e6ff, .9), 0, .62, .701 - .001);
  box(g, .9, .06, .4, M(0xffffff, { map: TEX.hazard }), 0, .04, 1.2);
  return g;
}
function turretBase() {
  const g = G();
  cyl(g, .4, .46, .18, 8, M(0x8a8e92, { map: TEX.concrete }), 0, .09, 0, 0, 0, Math.PI / 8);
  cyl(g, .25, .27, .06, 12, M(0x2b2e32), 0, .21, 0);
  return g;
}
function turretGun() {
  const g = G();
  cyl(g, .2, .24, .12, 10, TEAMD(), 0, .27, 0);
  box(g, .3, .16, .26, TEAM(), .02, .37, 0);
  for (const z of [-.06, .06]) cyl(g, .026, .026, .44, 8, GUN(), .34, .38, z, 0, Math.PI / 2);
  box(g, .04, .04, .1, E(0x3ae6ff, 3), -.12, .45, 0);
  return g;
}
function core() {
  const g = G(); const ch = CHROME(), dk = DCHROME(), red = E(0xff2030, 4);
  cyl(g, 1.95, 2.0, .12, 8, M(0x1c1f23, { metalness: .6, roughness: .5 }), 0, .06, 0, 0, 0, Math.PI / 8);
  cyl(g, 1.55, 1.65, .26, 8, dk, 0, .25, 0, 0, 0, Math.PI / 8);
  cyl(g, 1.58, 1.58, .025, 8, red, 0, .34, 0, 0, 0, Math.PI / 8);
  cyl(g, 1.1, 1.22, .34, 8, dk, 0, .55, 0, 0, 0, Math.PI / 8);
  cyl(g, 1.13, 1.13, .025, 8, red, 0, .7, 0, 0, 0, Math.PI / 8);
  cyl(g, .32, .52, 1.25, 8, ch, 0, 1.3, 0);
  sph(g, .46, M(0x111316, { metalness: .9, roughness: .2, flatShading: false }), 0, 2.05, 0, 1, 1, 1, 20);
  sph(g, .26, E(0xff2030, 6), .3, 2.05, .3, 1, 1, 1, 16);
  const ring = tor(g, .66, .05, ch, 0, 2.05, 0, Math.PI / 2, 32); ring.rotation.set(Math.PI / 2.4, 0, .5);
  for (const [x, z] of [[1.4, 0], [-1.4, 0], [0, 1.4], [0, -1.4]]) {
    add(g, Object.assign(new THREE.Mesh(new THREE.ConeGeometry(.12, 1.0, 4), ch), {})).position.set(x, .8, z);
    sph(g, .05, red, x, 1.32, z);
  }
  return g;
}
function fab() {
  const g = G(); const dk = M(0x2c3036, { metalness: .7, roughness: .4, map: TEX.panel }), red = E(0xff2030, 3.5), ch = CHROME();
  box(g, 2.9, .08, 2.9, M(0x1d2024, { metalness: .5, roughness: .6 }), 0, .04, 0);
  box(g, 2.3, .6, 2.0, dk, 0, .38, -.3);
  for (const z of [-1.28, .68]) box(g, 2.32, .03, .03, red, 0, .62, z + .01);
  for (const x of [-1.15, 1.15]) box(g, .03, .03, 2.0, red, x, .62, -.3);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) box(g, .4, .08, .3, M(0x50565d), -.7 + i * .7, .72, -.7 + j * .6);
  strut(g, [.9, .68, -1.0], [.9, 1.3, -.6], .05, ch); strut(g, [.9, 1.3, -.6], [.5, 1.0, -.1], .04, ch); sph(g, .07, dk, .9, 1.3, -.6);
  box(g, 1.1, .45, .03, M(0x0c0d0f), 0, .3, .71);
  box(g, 1.1, .03, .04, red, 0, .53, .72);
  return g;
}
function pylon() {
  const g = G(); const ch = CHROME();
  cyl(g, .34, .42, .16, 6, DCHROME(), 0, .08, 0);
  add(g, new THREE.Mesh(new THREE.ConeGeometry(.13, 1.35, 6), ch)).position.set(0, .82, 0);
  tor(g, .2, .03, E(0xff2030, 4), 0, .85, 0);
  tor(g, .14, .025, E(0xff2030, 4), 0, 1.15, 0);
  add(g, new THREE.Mesh(new THREE.OctahedronGeometry(.09), E(0xff2030, 6))).position.set(0, 1.58, 0);
  return g;
}
function relay() {
  const g = G(); const ch = CHROME(), red = E(0xff2030, 4);
  box(g, .55, .12, .55, DCHROME(), 0, .06, 0);
  for (const [x, z] of [[.2, .2], [.2, -.2], [-.2, .2], [-.2, -.2]]) strut(g, [x, .1, z], [0, 1.25, 0], .018, ch);
  tor(g, .26, .02, red, 0, .7, 0); tor(g, .18, .02, red, 0, 1.0, 0);
  sph(g, .06, red, 0, 1.28, 0);
  const d = add(g, new THREE.Mesh(new THREE.SphereGeometry(.2, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2.5), M(0x9aa3ad, { side: THREE.DoubleSide, metalness: .8, roughness: .3 })));
  d.position.set(.08, 1.1, .08); d.rotation.set(Math.PI * .8, 0, .6);
  return g;
}

// ---------- Gelände-Objekte ----------
function ruin(v) {
  const g = G(); const con = M(0x8a8c8e, { map: TEX.concrete }), dark = M(0x4a4b4c, { map: TEX.concrete }), rust = M(0xffffff, { map: TEX.rust });
  rs = 100 + v * 37;
  const rubble = n => { for (let i = 0; i < n; i++) box(g, .08 + rr() * .14, .05 + rr() * .08, .08 + rr() * .14, rr() < .5 ? con : dark, (rr() - .5) * .8, .03, (rr() - .5) * .8, rr() * 3, (rr() - .5) * .4); };
  if (v < 3) {
    const h = .5 + rr() * (v === 2 ? 1.4 : .7);
    box(g, .62, h, .62, con, -.05, h / 2, -.05);
    for (let i = 0; i < 3; i++) for (let j = 0; j < Math.floor(h / .25); j++) box(g, .01, .09, .1, M(0x14161a), .26, .15 + j * .25, -.25 + i * .2);
    for (let i = 0; i < 3; i++) for (let j = 0; j < Math.floor(h / .25); j++) box(g, .1, .09, .01, M(0x14161a), -.25 + i * .2, .15 + j * .25, .26);
    box(g, .5, .07, .4, dark, .05, h + .02, 0, .3, .35);
    for (let i = 0; i < 4; i++) strut(g, [-.3 + rr() * .5, h, -.3 + rr() * .5], [-.3 + rr() * .6, h + .12 + rr() * .2, -.3 + rr() * .6], .008, M(0x7a4a2a));
    rubble(6);
  } else if (v === 3) {
    box(g, .8, .5, .1, con, 0, .26, -.2, .2, .1); box(g, .5, .35, .1, dark, .1, .15, .15, -.4, -.5); rubble(10);
  } else if (v === 4) {
    rubble(4);
    box(g, .62, .14, .3, rust, 0, .14, 0, .5); box(g, .32, .11, .27, rust, -.04, .26, 0, .5);
    box(g, .3, .06, .28, M(0x111111), -.03, .27, 0, .5);
  } else if (v === 5) {
    const tr = M(0x3d342c); strut(g, [0, 0, 0], [.05, .8, 0], .045, tr);
    strut(g, [.04, .5, 0], [.3, .8, .1], .02, tr); strut(g, [.05, .65, 0], [-.2, .95, -.1], .02, tr); strut(g, [.05, .8, 0], [.15, 1.05, -.15], .015, tr);
    rubble(3);
  } else { rubble(16); box(g, .4, .2, .4, dark, 0, .1, 0, .6); }
  return g;
}
function crystals(sz, v) {
  const g = G(); rs = 500 + v * 91 + sz * 13;
  const mat = M(0x52e4ff, { emissive: 0x0b9fd0, emissiveIntensity: 1.1, roughness: .12, metalness: .1, transparent: true, opacity: .93 });
  const n = 3 + sz * 2;
  for (let i = 0; i < n; i++) {
    const h = (.2 + rr() * .4) * (.6 + sz * .35), r = .06 + rr() * .06;
    const c = add(g, new THREE.Mesh(new THREE.CylinderGeometry(0, r, h, 6), mat));
    const a = rr() * 6.28, d = rr() * .3;
    c.position.set(Math.cos(a) * d, h / 2 - .01, Math.sin(a) * d); c.rotation.set((rr() - .5) * .7, rr() * 3, (rr() - .5) * .7);
  }
  return g;
}

// ---------- Baker ----------
function initBaker() {
  R = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  R.setPixelRatio(1); R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
  R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.65;
  R.setClearColor(0x000000, 0);
  scene = new THREE.Scene();
  // Umgebung für Chrom-Reflexe
  const pm = new THREE.PMREMGenerator(R), es = new THREE.Scene();
  const sg = new THREE.SphereGeometry(10, 32, 16), col = [];
  const p = sg.attributes.position;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i) / 10; const c = y > .1 ? new THREE.Color(0xd6e6ff).lerp(new THREE.Color(0x8aa0b8), 1 - y) : new THREE.Color(0x6a5a48).lerp(new THREE.Color(0x1c1814), -y); col.push(c.r, c.g, c.b); }
  sg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  es.add(new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ side: THREE.BackSide, vertexColors: true })));
  const lp = new THREE.Mesh(new THREE.BoxGeometry(6, .2, 3), new THREE.MeshBasicMaterial({ color: 0xffffff })); lp.position.set(-3, 8, -2); es.add(lp);
  scene.environment = pm.fromScene(es, .04).texture;
  scene.add(new THREE.HemisphereLight(0xc8dcff, 0x50443a, 1.0));
  const sun = new THREE.DirectionalLight(0xffeedd, 3.0); sun.position.set(-6, 9, -3); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -3.2, right: 3.2, top: 3.2, bottom: -3.2, near: .1, far: 30 });
  sun.shadow.bias = -.0005; sun.shadow.normalBias = .02; scene.add(sun);
  const fill = new THREE.DirectionalLight(0x8fb2ff, .55); fill.position.set(6, 3, 6); scene.add(fill);
  const sp = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ opacity: .5 }));
  sp.rotation.x = -Math.PI / 2; sp.position.y = .001; sp.receiveShadow = true; scene.add(sp);
  cam = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 100);
  const d = new THREE.Vector3(Math.cos(ELEV) * Math.SQRT1_2, Math.sin(ELEV), Math.cos(ELEV) * Math.SQRT1_2).multiplyScalar(30);
  cam.position.copy(d); cam.up.set(0, 1, 0); cam.lookAt(0, 0, 0);
}
function snap(obj, cw, ch, ay) {
  cam.left = -cw / 2 / PPU; cam.right = cw / 2 / PPU; cam.top = ay / PPU; cam.bottom = -(ch - ay) / PPU; cam.updateProjectionMatrix();
  R.setSize(cw, ch, false); scene.add(obj); R.render(scene, cam); scene.remove(obj);
  const c = document.createElement('canvas'); c.width = cw; c.height = ch; c.getContext('2d').drawImage(R.domElement, 0, 0);
  return { c, ax: cw / 2, ay, w: cw, h: ch };
}
function dirs(make, cw, ch, ay) {
  const out = [];
  for (let i = 0; i < DIRS; i++) { const o = make(); o.rotation.y = -i * Math.PI * 2 / DIRS; out.push(snap(o, cw, ch, ay)); }
  return out;
}

export async function bakeAll(progress) {
  makeTextures(); initBaker();
  const RED = 0xff2030, CYAN = 0x30e8ff;
  const jobs = [];
  const J = (fn) => jobs.push(fn);
  for (const k of ['rifle', 'rocket', 'hacker']) for (const f of [0, 1]) J(() => (SPR[k] = SPR[k] || [])[f] = dirs(() => infantry(k, f), 88, 96, 72));
  J(() => SPR.tankHull = dirs(tankHull, 176, 132, 80));
  J(() => SPR.tankTurret = dirs(tankTurret, 176, 132, 80));
  for (const l of [0, 1]) J(() => (SPR.harv = SPR.harv || [])[l] = dirs(() => harvester(l), 184, 140, 86));
  for (const [t, eye] of [['', RED], ['H', CYAN]]) {
    for (const f of [0, 1]) J(() => (SPR['walker' + t] = SPR['walker' + t] || [])[f] = dirs(() => walker(f, eye), 96, 104, 76));
    J(() => SPR['drone' + t] = dirs(() => drone(eye), 120, 150, 108));
    for (const f of [0, 1]) J(() => (SPR['titan' + t] = SPR['titan' + t] || [])[f] = dirs(() => titan(f, eye), 230, 210, 132));
  }
  const B = (k, fn, w, h, cw, ch, ay) => J(() => SPR[k] = snap(fn(), cw, ch, ay));
  B('hq', hq, 3, 3, 420, 330, 210); B('power', power, 2, 2, 290, 230, 150); B('refinery', refinery, 3, 2, 360, 260, 160);
  B('barracks', barracks, 2, 2, 290, 230, 150); B('factory', factory, 3, 3, 420, 330, 210);
  B('turret', turretBase, 1, 1, 150, 140, 90); J(() => SPR.turretGun = dirs(turretGun, 150, 140, 90));
  B('core', core, 4, 4, 540, 520, 380); B('fab', fab, 3, 3, 420, 330, 210); B('pylon', pylon, 1, 1, 150, 230, 180); B('relay', relay, 1, 1, 150, 210, 160);
  for (let v = 0; v < 8; v++) J(() => (SPR.ruin = SPR.ruin || [])[v] = snap(ruin(v), 150, v === 2 ? 290 : 200, v === 2 ? 240 : 150));
  for (let s = 0; s < 3; s++) for (let v = 0; v < 3; v++) J(() => (SPR.cry = SPR.cry || [])[s * 3 + v] = snap(crystals(s, v), 130, 110, 70));
  const yieldNow = () => new Promise(r => { const ch = new MessageChannel(); ch.port1.onmessage = () => r(); ch.port2.postMessage(0); });
  let ly = performance.now();
  for (let i = 0; i < jobs.length; i++) { jobs[i](); if (performance.now() - ly > 120) { progress && progress((i + 1) / jobs.length); await yieldNow(); ly = performance.now(); } }
  progress && progress(1);
  R.dispose();
  return SPR;
}
