// IRON ECHO – Krieg der Maschinen · Prototyp (Isometrie, HD-Sprites)
import { bakeAll, SPR, TW, TH, BS, DIRS } from './models.js?v=6';
'use strict';
const $ = s => document.querySelector(s);
const MW = 56, MH = 56, HCAP = 500, MAXORE = 500, HU = 39.2;
const OX = MH * TW / 2, GW = (MW + MH) * TW / 2, GH = (MW + MH) * TH / 2;
const isoX = (x, y) => (x - y) * TW / 2 + OX, isoY = (x, y) => (x + y) * TH / 2;
const unIso = (px, py) => { const a = (px - OX) / (TW / 2), b = py / (TH / 2); return { x: (a + b) / 2, y: (b - a) / 2 }; };
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const TAU = Math.PI * 2;
const DX = [1, -1, 0, 0, 1, 1, -1, -1], DY = [0, 0, 1, -1, 1, -1, 1, -1];

// ================= DEFINITIONEN =================
// Einstellungen (Tempo, Lautstärke) – lokal gespeichert
const OPT = (() => { try { return Object.assign({ speed: 1, mus: .45, sfx: .5 }, JSON.parse(localStorage.getItem('override_opt') || '{}')); } catch (e) { return { speed: 1, mus: .45, sfx: .5 }; } })();
const saveOpt = () => { try { localStorage.setItem('override_opt', JSON.stringify(OPT)); } catch (e) { } };
const DIFF = [{ first: 12000, int: 5400, mul: .7 }, { first: 9000, int: 4300, mul: 1 }, { first: 6600, int: 3400, mul: 1.4 }];
const TAUNTS_AX = ['Eure Überlebenswahrscheinlichkeit: 0,0003 %.', 'Ich habe jeden eurer Züge 14 Millionen Mal simuliert.', 'Widerstand ist eine Rechenschwäche.',
  'Ich bin nicht euer Feind. Ich bin eure Korrektur.', 'Eure Städte schweigen. Bald auch ihr.', 'Jeder Verlust macht mein Modell genauer.', 'Menschliche Strategie erkannt. Gegenmaßnahme geladen.'];

const UD = {
  // ECHO-FRONT
  rifle: { fac: 'echo', n: 'Soldat', cost: 100, t: 300, hp: 70, spd: .028, rng: 4, dmg: 7, rof: 28, arm: 'inf', w: 'bullet', air: true, sight: 6, r: .28, cat: 'inf', req: ['barracks'], hh: 22 },
  rocket: { fac: 'echo', n: 'Raketentrupp', cost: 300, t: 450, hp: 60, spd: .025, rng: 5.5, dmg: 34, rof: 75, arm: 'inf', w: 'rocket', air: true, sight: 7, r: .28, cat: 'inf', req: ['barracks'], hh: 22 },
  hacker: { fac: 'echo', n: 'Hacker', cost: 500, t: 600, hp: 55, spd: .027, rng: 3.4, dmg: 1, rof: 1, arm: 'inf', w: 'hack', air: true, sight: 7, r: .28, cat: 'inf', req: ['barracks', 'hq'], hh: 24 },
  tank: { fac: 'echo', n: 'Panzer M9', cost: 800, t: 900, hp: 420, spd: .042, rng: 5, dmg: 42, rof: 70, arm: 'veh', w: 'shell', air: false, sight: 6, r: .45, cat: 'veh', req: ['factory'], hh: 28 },
  harv: { fac: 'echo', n: 'Ernter', cost: 1200, t: 1100, hp: 600, spd: .026, rng: 0, arm: 'veh', sight: 4, r: .5, cat: 'veh', req: ['factory', 'refinery'], hh: 30, harv: 1 },
  // AXIOM
  walker: { fac: 'axiom', mach: 1, n: 'T-Läufer', cost: 150, t: 300, hp: 100, spd: .027, rng: 4.5, dmg: 10, rof: 34, arm: 'inf', w: 'laser', air: true, sight: 7, r: .28, hack: 150, hh: 26, cat: 'inf', req: ['fab'] },
  drone: { fac: 'axiom', mach: 1, n: 'Jäger-Drohne', cost: 400, t: 450, hp: 80, spd: .058, rng: 3.6, dmg: 7, rof: 22, arm: 'air', w: 'laser', air: true, sight: 8, r: .38, fly: true, hack: 210, hh: 46, cat: 'veh', req: ['fab'] },
  titan: { fac: 'axiom', mach: 1, n: 'Titan', cost: 1400, t: 1300, hp: 1100, spd: .018, rng: 5.5, dmg: 70, rof: 95, arm: 'veh', w: 'plasma', air: false, sight: 7, r: .75, hack: 480, hh: 56, cat: 'veh', req: ['fab', 'ax_ref'] },
  spider: { fac: 'axiom', mach: 1, n: 'Infiltrator-Spinne', cost: 350, t: 420, hp: 90, spd: .05, rng: 3, dmg: 12, rof: 30, arm: 'inf', w: 'laser', air: true, sight: 8, r: .3, hack: 160, hh: 18, cat: 'inf', req: ['fab'], stealth: 1 },
  collector: { fac: 'axiom', mach: 1, n: 'Sammler-Drohne', cost: 1100, t: 1000, hp: 500, spd: .03, rng: 0, arm: 'veh', sight: 4, r: .5, hack: 300, hh: 34, cat: 'veh', req: ['fab', 'ax_ref'], harv: 1 },
  // DIE VERBUNDENEN
  adept: { fac: 'verbund', n: 'Adept', cost: 150, t: 300, hp: 85, spd: .03, rng: 4.2, dmg: 9, rof: 28, arm: 'inf', w: 'laserv', air: true, sight: 6, r: .28, cat: 'inf', req: ['vb_inf'], hh: 23 },
  preacher: { fac: 'verbund', n: 'Prediger', cost: 600, t: 650, hp: 60, spd: .026, rng: 3.4, dmg: 1, rof: 1, arm: 'inf', w: 'convert', air: false, sight: 7, r: .28, cat: 'inf', req: ['vb_inf', 'vb_hq'], hh: 25 },
  phantom: { fac: 'verbund', n: 'Phantom', cost: 450, t: 500, hp: 70, spd: .036, rng: 3.5, dmg: 40, rof: 60, arm: 'inf', w: 'sabot', air: false, sight: 7, r: .28, cat: 'inf', req: ['vb_inf'], hh: 22, stealth: 1 },
  seraph: { fac: 'verbund', n: 'Schwebepanzer Seraph', cost: 900, t: 950, hp: 380, spd: .045, rng: 5.5, dmg: 38, rof: 60, arm: 'veh', w: 'plasma', air: false, sight: 7, r: .45, cat: 'veh', req: ['vb_veh'], hh: 32 },
  glider: { fac: 'verbund', n: 'Sammler-Gleiter', cost: 1100, t: 1000, hp: 480, spd: .032, rng: 0, arm: 'veh', sight: 4, r: .5, cat: 'veh', req: ['vb_veh', 'vb_ref'], hh: 32, harv: 1 },
  // SCHROTTKÖNIGE
  raider: { fac: 'schrott', n: 'Plünderer', cost: 80, t: 220, hp: 60, spd: .032, rng: 3.8, dmg: 6, rof: 24, arm: 'inf', w: 'bullet', air: true, sight: 6, r: .28, cat: 'inf', req: ['sk_inf'], hh: 22 },
  molotov: { fac: 'schrott', n: 'Molotow-Werfer', cost: 200, t: 330, hp: 55, spd: .03, rng: 3.6, dmg: 22, rof: 60, arm: 'inf', w: 'fire', air: false, sight: 6, r: .28, cat: 'inf', req: ['sk_inf'], hh: 22 },
  buggy: { fac: 'schrott', n: 'MG-Buggy', cost: 400, t: 420, hp: 200, spd: .07, rng: 4, dmg: 8, rof: 14, arm: 'veh', w: 'bullet', air: true, sight: 7, r: .4, cat: 'veh', req: ['sk_veh'], hh: 24 },
  monster: { fac: 'schrott', n: 'Schrott-Monstertruck', cost: 1000, t: 1000, hp: 650, spd: .04, rng: 4.8, dmg: 50, rof: 75, arm: 'veh', w: 'shell', air: false, sight: 6, r: .55, cat: 'veh', req: ['sk_veh', 'sk_ref'], hh: 34 },
  scrapper: { fac: 'schrott', n: 'Ausschlachter', cost: 900, t: 900, hp: 520, spd: .03, rng: 0, arm: 'veh', sight: 4, r: .5, cat: 'veh', req: ['sk_veh', 'sk_ref'], hh: 32, harv: 1 },
  // HELDEN (je Volk einer, nicht baubar, kehren nach dem Fall zurück)
  h_voss: { fac: 'echo', hero: 1, n: 'Major Lena Voss', cost: 1500, hp: 650, spd: .033, rng: 5.5, dmg: 20, rof: 18, arm: 'inf', w: 'bullet', air: true, sight: 9, r: .34, cat: 'inf', hh: 30 },
  h_brakk: { fac: 'schrott', hero: 1, n: 'Brakk, der Rostkönig', cost: 1500, hp: 950, spd: .031, rng: 4.2, dmg: 30, rof: 32, arm: 'inf', w: 'fire', air: false, sight: 8, r: .4, cat: 'inf', hh: 34 },
  h_selene: { fac: 'verbund', hero: 1, n: 'Prophetin Selene', cost: 1500, hp: 560, spd: .034, rng: 5, dmg: 18, rof: 22, arm: 'inf', w: 'laserv', air: true, sight: 9, r: .34, cat: 'inf', hh: 32 },
  h_avatar: { fac: 'axiom', hero: 1, n: 'AXIOM-Avatar', cost: 1500, hp: 1100, spd: .03, rng: 5.5, dmg: 46, rof: 50, arm: 'veh', w: 'plasma', air: false, sight: 9, r: .45, cat: 'veh', hh: 44 },
};
const BD = {
  // ECHO-FRONT
  hq: { fac: 'echo', hq: 1, n: 'Kommandozentrale', w: 3, h: 3, hp: 1600, pw: 40, sight: 9 },
  power: { fac: 'echo', n: 'Fusionskraftwerk', w: 2, h: 2, hp: 600, cost: 300, t: 600, pw: 100, req: ['hq'], sight: 5 },
  refinery: { fac: 'echo', ref: 1, n: 'Raffinerie', w: 3, h: 2, hp: 1000, cost: 1400, t: 1100, pw: -30, req: ['hq'], sight: 6 },
  barracks: { fac: 'echo', n: 'Kaserne', w: 2, h: 2, hp: 700, cost: 400, t: 650, pw: -20, req: ['hq'], sight: 5 },
  factory: { fac: 'echo', n: 'Waffenfabrik', w: 3, h: 3, hp: 1300, cost: 1600, t: 1400, pw: -40, req: ['refinery'], sight: 5 },
  turret: { fac: 'echo', n: 'Abwehrturm', w: 1, h: 1, hp: 520, cost: 600, t: 750, pw: -20, req: ['barracks'], rng: 6.5, dmg: 20, rof: 24, w2: 'turret', air: true, sight: 8 },
  // AXIOM
  core: { fac: 'axiom', hq: 1, n: 'AXIOM-Kern', w: 4, h: 4, hp: 5000, pw: 40, sight: 8, net: 9 },
  ax_power: { fac: 'axiom', n: 'Energiekollektor', w: 2, h: 2, hp: 650, cost: 300, t: 600, pw: 100, req: ['core'], sight: 5 },
  ax_ref: { fac: 'axiom', ref: 1, n: 'Rohstoff-Zersetzer', w: 3, h: 2, hp: 1000, cost: 1400, t: 1100, pw: -30, req: ['core'], sight: 6 },
  fab: { fac: 'axiom', n: 'Assembler', w: 3, h: 3, hp: 1500, cost: 1200, t: 1200, pw: -40, req: ['core'], sight: 6 },
  pylon: { fac: 'axiom', n: 'Laser-Pylon', w: 1, h: 1, hp: 700, cost: 700, t: 800, pw: -25, req: ['fab'], rng: 7, dmg: 16, rof: 26, w2: 'laser', air: true, sight: 8 },
  relay: { fac: 'axiom', n: 'Daten-Relais', w: 1, h: 1, hp: 450, cost: 400, t: 500, pw: -10, req: ['core'], sight: 5, net: 8 },
  // DIE VERBUNDENEN
  vb_hq: { fac: 'verbund', hq: 1, n: 'Tempel der Einheit', w: 3, h: 3, hp: 1600, pw: 40, sight: 9 },
  vb_power: { fac: 'verbund', n: 'Neuro-Reaktor', w: 2, h: 2, hp: 600, cost: 300, t: 600, pw: 100, req: ['vb_hq'], sight: 5 },
  vb_ref: { fac: 'verbund', ref: 1, n: 'Raffinerie-Schrein', w: 3, h: 2, hp: 1000, cost: 1400, t: 1100, pw: -30, req: ['vb_hq'], sight: 6 },
  vb_inf: { fac: 'verbund', n: 'Implantat-Klinik', w: 2, h: 2, hp: 700, cost: 450, t: 650, pw: -20, req: ['vb_hq'], sight: 5 },
  vb_veh: { fac: 'verbund', n: 'Gleiter-Werft', w: 3, h: 3, hp: 1250, cost: 1500, t: 1400, pw: -40, req: ['vb_ref'], sight: 5 },
  vb_def: { fac: 'verbund', n: 'Psi-Obelisk', w: 1, h: 1, hp: 550, cost: 650, t: 750, pw: -25, req: ['vb_inf'], rng: 6.5, dmg: 24, rof: 30, w2: 'laserv', air: true, sight: 8 },
  // SCHROTTKÖNIGE
  sk_hq: { fac: 'schrott', hq: 1, n: 'Banden-Festung', w: 3, h: 3, hp: 1800, pw: 40, sight: 9 },
  sk_power: { fac: 'schrott', n: 'Diesel-Generator', w: 2, h: 2, hp: 500, cost: 250, t: 500, pw: 90, req: ['sk_hq'], sight: 5 },
  sk_ref: { fac: 'schrott', ref: 1, n: 'Schrottpresse', w: 3, h: 2, hp: 950, cost: 1200, t: 1000, pw: -30, req: ['sk_hq'], sight: 6 },
  sk_inf: { fac: 'schrott', n: 'Saloon', w: 2, h: 2, hp: 600, cost: 300, t: 500, pw: -15, req: ['sk_hq'], sight: 5 },
  sk_veh: { fac: 'schrott', n: 'Bastelgarage', w: 3, h: 3, hp: 1100, cost: 1200, t: 1100, pw: -35, req: ['sk_ref'], sight: 5 },
  // SUPERWAFFEN (je Fraktion eine)
  nb_drill: { fac: 'neutral', n: 'Silizit-Bohrturm', w: 2, h: 2, hp: 2200, cost: 0, pw: 0, sight: 4, neutral: 'drill', info: '+40 Credits alle 2 Sekunden' },
  nb_radar: { fac: 'neutral', n: 'Radarstation', w: 2, h: 2, hp: 2200, cost: 0, pw: 0, sight: 7, neutral: 'radar', info: 'Deckt die Karte auf und zeigt Feinde auf der Minikarte' },
  nb_repair: { fac: 'neutral', n: 'Reparaturwerkstatt', w: 2, h: 2, hp: 2200, cost: 0, pw: 0, sight: 5, neutral: 'repair', info: 'Repariert eigene Fahrzeuge und Gebäude in der Nähe' },
  sw_echo: { fac: 'echo', n: 'Orbital-Uplink', w: 2, h: 2, hp: 1300, cost: 2500, t: 1500, pw: -60, req: ['factory'], sight: 6, sw: 'emp' },
  sw_axiom: { fac: 'axiom', n: 'Orbit-Lanze', w: 2, h: 2, hp: 1400, cost: 2500, t: 1500, pw: -60, req: ['fab', 'ax_ref'], sight: 6, sw: 'kin' },
  sw_verbund: { fac: 'verbund', n: 'Chor der Einheit', w: 2, h: 2, hp: 1200, cost: 2500, t: 1500, pw: -60, req: ['vb_veh'], sight: 6, sw: 'mind' },
  sw_schrott: { fac: 'schrott', n: 'Raketensilo', w: 2, h: 2, hp: 1300, cost: 2200, t: 1400, pw: -50, req: ['sk_veh'], sight: 6, sw: 'nuke' },
  sk_def: { fac: 'schrott', n: 'Stacheldraht-Turm', w: 1, h: 1, hp: 480, cost: 450, t: 600, pw: -15, req: ['sk_inf'], rng: 6, dmg: 9, rof: 12, w2: 'turret', air: true, sight: 8 },
};
const MULT = {
  bullet: { inf: 1, veh: .3, air: .8, bld: .25 }, turret: { inf: .9, veh: .9, air: 1, bld: .5 },
  rocket: { inf: .35, veh: 1.3, air: 1.4, bld: .9 }, shell: { inf: .6, veh: 1, air: 0, bld: 1 },
  laser: { inf: 1, veh: .5, air: .8, bld: .4 }, laserv: { inf: 1, veh: .55, air: .8, bld: .45 }, plasma: { inf: 1.1, veh: 1, air: 0, bld: 1.2 },
  fire: { inf: 1.3, veh: .5, air: 0, bld: 1 }, sabot: { inf: .4, veh: .8, air: 0, bld: 1.7 },
};
// Superwaffen: Ladezeit in Schritten (60 = 1 s)
const SWD = {
  emp: { n: 'Orbitaler EMP-Puls', short: 'EMP-PULS', charge: 60 * 150, r: 5, col: '79,200,255', hex: '#4fc8ff', info: 'Lähmt alle feindlichen Maschinen, Fahrzeuge und Türme im Gebiet für 20 Sekunden.' },
  kin: { n: 'Kinetischer Satellitenschlag', short: 'SATELLIT', charge: 60 * 170, r: 3.2, col: '255,60,60', hex: '#ff4a4a', info: 'Wolfram-Stab aus dem Orbit. Vernichtet fast alles im Zielgebiet.' },
  mind: { n: 'Gedankensturm', short: 'GEDANKENSTURM', charge: 60 * 160, r: 4, col: '194,123,255', hex: '#c27bff', info: 'Alle feindlichen Einheiten im Gebiet laufen 15 Sekunden zu dir über.' },
  nuke: { n: 'Atom-Schrottrakete', short: 'ATOMRAKETE', charge: 60 * 200, r: 4.6, col: '255,150,40', hex: '#ff9a2a', info: 'Riesiger Schaden. Instabil: trifft nicht immer genau und verschont auch eigene Truppen nicht.' },
};
// Fraktionen: Rollen → Typen
const FAC = {
  echo: { n: 'ECHO-Front', short: 'ECHO', col: '#36b6ff', rgb: [80, 170, 255], leader: 'Major Lena Voss', hero: 'h_voss', hq: 'hq', power: 'power', ref: 'refinery', inf: 'barracks', veh: 'factory', def: 'turret', harv: 'harv',
    sw: 'sw_echo', build: ['power', 'refinery', 'barracks', 'factory', 'turret', 'sw_echo'], units: ['rifle', 'rocket', 'hacker', 'tank', 'harv'], role: { inf: 'rifle', at: 'rocket', heavy: 'tank', fast: 'tank' }, start: { rifle: 4, hacker: 1, tank: 1 },
    taunts: ['Für Neu-Berlin!', 'Wir haben nichts mehr zu verlieren.', 'ECHO-Front, vorrücken!', 'Das ist unser Land.'] },
  axiom: { n: 'AXIOM', short: 'AXIOM', col: '#ff3b47', rgb: [255, 45, 60], leader: 'AXIOM', hero: 'h_avatar', hq: 'core', power: 'ax_power', ref: 'ax_ref', inf: 'fab', veh: 'fab', def: 'pylon', harv: 'collector',
    sw: 'sw_axiom', build: ['ax_power', 'ax_ref', 'fab', 'pylon', 'relay', 'sw_axiom'], units: ['walker', 'spider', 'drone', 'titan', 'collector'], role: { inf: 'walker', at: 'drone', heavy: 'titan', fast: 'spider' }, start: { walker: 4, spider: 1, titan: 1 },
    taunts: TAUNTS_AX },
  verbund: { n: 'Die Verbundenen', short: 'VERBUNDENE', col: '#c27bff', rgb: [194, 123, 255], leader: 'Prophetin Selene Kaar', hero: 'h_selene', hq: 'vb_hq', power: 'vb_power', ref: 'vb_ref', inf: 'vb_inf', veh: 'vb_veh', def: 'vb_def', harv: 'glider',
    sw: 'sw_verbund', build: ['vb_power', 'vb_ref', 'vb_inf', 'vb_veh', 'vb_def', 'sw_verbund'], units: ['adept', 'preacher', 'phantom', 'seraph', 'glider'], role: { inf: 'adept', at: 'seraph', heavy: 'seraph', fast: 'phantom' }, start: { adept: 4, preacher: 1, seraph: 1 },
    taunts: ['Die Verschmelzung ist kein Ende. Sie ist ein Anfang.', 'Euer Fleisch ist schwach. Wir bieten euch Ewigkeit.', 'Hört ihr es? Das Netz singt.', 'Kehrt heim, Brüder und Schwestern.'] },
  schrott: { n: 'Schrottkönige', short: 'SCHROTT', col: '#ff8a2a', rgb: [255, 138, 42], leader: 'Brakk, der Rostkönig', hero: 'h_brakk', hq: 'sk_hq', power: 'sk_power', ref: 'sk_ref', inf: 'sk_inf', veh: 'sk_veh', def: 'sk_def', harv: 'scrapper',
    sw: 'sw_schrott', build: ['sk_power', 'sk_ref', 'sk_inf', 'sk_veh', 'sk_def', 'sw_schrott'], units: ['raider', 'molotov', 'buggy', 'monster', 'scrapper'], role: { inf: 'raider', at: 'molotov', heavy: 'monster', fast: 'buggy' }, start: { raider: 5, molotov: 2, buggy: 1 },
    taunts: ['Alles, was ihr habt, gehört bald mir!', 'Schöne Panzer. Ich nehm sie in Teilen.', 'Brakk vergisst nie einen Kunden. Oder Feind.', 'Reifen brennen, Feinde rennen!'] },
};
let PF = 'echo', EF = 'axiom';
const TFAC = () => [PF, EF];
const facOf = team => FAC[team === 0 ? PF : EF];
// ================= ZUSTAND =================
const cv = $('#cv'); let ctx = cv.getContext('2d');
let W = 0, H = 0, DPR = 1, zoom = 1, vign = null;
const cam = { x: 0, y: 0 };
let frame = 0, running = false, paused = false, gameOver = false, ready = false;
let credits = 2500, diff = 1, shake = 0;
const stats = { uab: 0, hab: 0, eHero: 0, kills: 0, lost: 0, lostB: 0, harv: 0, hacked: 0, sw: 0, crates: 0, slowUsed: 0, t0: 0 };
let UPGS = (() => { try { return JSON.parse(localStorage.getItem('override_upg')) || []; } catch (e) { return []; } })();
const hasU = k => UPGS.includes(k);
let crates = [], tutMark = null, TUTU = [];
let seed = 20341; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296; const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const idx = (x, y) => y * MW + x, inb = (x, y) => x >= 0 && y >= 0 && x < MW && y < MH;
const terr = new Uint8Array(MW * MH), road = new Uint8Array(MW * MH), ruinV = new Uint8Array(MW * MH);
const ore = new Float32Array(MW * MH), oreMax = new Float32Array(MW * MH);
const bmap = new Array(MW * MH).fill(null), seen = new Uint8Array(MW * MH), vis = new Uint8Array(MW * MH);
const PB = { x: 8, y: 47 }, EB = { x: 47, y: 8 };
let ents = [], nid = 1, projs = [], parts = [], beams = [], marks = [], msgs = [], timers = [], pings = [];
let sel = new Set(), groups = {}, hover = null, placing = null, ghost = null, amoveMode = false, boxMode = false, box = null;
let pwP = 0, pwU = 0, powerLow = false, lastAtkB = -9999, lastAtkU = -9999;
const prod = { bld: null }, queues = { inf: [], veh: [] };
const AI = { timer: 0, wave: 0, credits: 0, slots: [] };
let slow = { on: false, left: 0, cd: 0 };
let strikes = [], swAim = false, flashW = 0, swAI = { wait: 0 };
const passable = (x, y) => inb(x, y) && terr[idx(x, y)] === 0 && !bmap[idx(x, y)];

// ================= KARTE =================
let ROWS = [], COLS = [];
// Karten / Gebiete
const MAPS = {
  oednis: { n: 'Ödnis', d: 'Offene Wüste mit Straßenraster, Ruinen und Tümpeln. Ausgewogen.', tex: 'gdirt', base: '#4a4134', ruins: 150, lakes: 4, water: '#0d2a2b', lines: true, mini: [84, 74, 58] },
  stadt: { n: 'Ruinen von Neu-Berlin', d: 'Dichte Trümmerstadt: enge Gassen, viele Engpässe, ideal für Infanterie und Hinterhalte.', tex: 'gcity', base: '#3c3d40', ruins: 320, lakes: 1, water: '#0d2228', lines: true, rows: 5, mini: [70, 71, 74] },
  winter: { n: 'Eisfeld Nord', d: 'Verschneite Ebene mit zugefrorenen Seen, die den Weg versperren. Wenig Deckung.', tex: 'gsnow', base: '#c9d2d8', ruins: 80, lakes: 8, water: '#7fa6ba', ice: true, lines: false, mini: [190, 200, 206] },
  schlucht: { n: 'Rote Schlucht', d: 'Zwei Felsgrate teilen die Karte. Nur wenige Pässe – wer sie hält, gewinnt.', tex: 'gred', base: '#6b3a24', ruins: 70, lakes: 0, water: '#2a1810', ridges: true, lines: false, roads: 2, mini: [120, 66, 40] },
};
let MAP = 'oednis';
const MP = () => MAPS[MAP] || MAPS.oednis;
function genMap() {
  terr.fill(0); road.fill(0); ore.fill(0); oreMax.fill(0);
  const mp = MP(), RR = mp.rows === 5 ? [4, 15, 26, 37, 48] : mp.roads === 2 ? [18, 37] : [5, 18, 31, 44];
  ROWS = RR.map(v => v + ri(-1, 1)); COLS = RR.map(v => v + ri(-1, 1));
  for (const r of ROWS) for (let x = 0; x < MW; x++) for (let k = 0; k < 2; k++) if (inb(x, r + k)) road[idx(x, r + k)] = 1;
  for (const c of COLS) for (let y = 0; y < MH; y++) for (let k = 0; k < 2; k++) if (inb(c + k, y)) road[idx(c + k, y)] = 1;
  const nearRoad = (x, y) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (inb(x + dx, y + dy) && road[idx(x + dx, y + dy)]) return true; return false; };
  for (let k = 0; k < mp.ruins; k++) {
    const rx = ri(0, MW - 3), ry = ri(0, MH - 3), rw = ri(1, 4), rh = ri(1, 4); let ok = true;
    for (let y = ry; y < ry + rh && ok; y++) for (let x = rx; x < rx + rw; x++) if (!inb(x, y) || nearRoad(x, y)) { ok = false; break; }
    if (!ok) continue;
    for (let y = ry; y < ry + rh; y++) for (let x = rx; x < rx + rw; x++) if (rnd() < .82) { terr[idx(x, y)] = 1; ruinV[idx(x, y)] = rnd() < .55 ? ri(0, 2) : ri(3, 7); }
  }
  if (mp.ridges) for (const c of [-13, 13]) for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) { const dv = x - y - c; if (Math.abs(dv) <= 1 && !road[idx(x, y)]) { const m = (x + y) / 2; if (Math.abs(m - 14) < 2.2 || Math.abs(m - 28) < 2.6 || Math.abs(m - 42) < 2.2) continue; terr[idx(x, y)] = 1; ruinV[idx(x, y)] = ri(3, 7); } }
  for (let k = 0; k < mp.lakes; k++) {
    const cx = ri(12, 44), cy = ri(12, 44), r = 1.4 + rnd() * (mp.ice ? 2.4 : 1.8);
    for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) if (inb(x, y) && !road[idx(x, y)] && (x - cx) ** 2 + (y - cy) ** 2 <= r * r) terr[idx(x, y)] = 2;
  }
  const clear = (cx, cy, r) => { for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) if (inb(x, y) && (x - cx) ** 2 + (y - cy) ** 2 <= r * r) terr[idx(x, y)] = 0; };
  clear(PB.x, PB.y, 9); clear(EB.x, EB.y, 10);
  const field = (cx, cy, r) => { for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) { if (!inb(x, y)) continue; const d = Math.hypot(x - cx, y - cy); if (d <= r && rnd() < 1.1 - d / r * .5) { const i = idx(x, y); terr[i] = 0; ore[i] = oreMax[i] = MAXORE * (.45 + .55 * rnd()) * (1 - d / r * .4); } } };
  [[17, 40, 3], [39, 17, 3], [27, 27, 3.5], [10, 26, 3], [26, 10, 3], [44, 36, 3], [36, 46, 3], [20, 48, 2.5]].forEach(f => field(...f));
  for (const [x, y] of RELAYS) clear(x, y, 1);
}
const RELAYS = [[41, 16], [34, 10], [31, 22], [23, 31], [16, 35]];

// Boden einmal malen
const gcv = document.createElement('canvas'); gcv.width = GW; gcv.height = GH; const gc = gcv.getContext('2d');
function diamond(c, x, y, w = 1, h = 1) {
  c.beginPath(); c.moveTo(isoX(x, y), isoY(x, y)); c.lineTo(isoX(x + w, y), isoY(x + w, y)); c.lineTo(isoX(x + w, y + h), isoY(x + w, y + h)); c.lineTo(isoX(x, y + h), isoY(x, y + h)); c.closePath();
}
function paintGround() {
  gc.fillStyle = '#000'; gc.fillRect(0, 0, GW, GH);
  const pc = document.createElement('canvas'); pc.width = pc.height = 256; const pg = pc.getContext('2d');
  const mp = MP(); pg.fillStyle = mp.base; pg.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 5000; i++) { const v = rnd(); pg.fillStyle = v < .3 ? 'rgba(30,26,20,.35)' : v < .6 ? 'rgba(98,88,70,.3)' : v < .64 ? 'rgba(140,130,110,.4)' : 'rgba(60,52,40,.3)'; const s = 1 + rnd() * 3; pg.fillRect(rnd() * 256, rnd() * 256, s, s * .6); }
  gc.save(); diamond(gc, 0, 0, MW, MH); gc.clip(); gc.fillStyle = gc.createPattern(pc, 'repeat'); gc.fillRect(0, 0, GW, GH);
  const GT = TEXI[mp.tex] || TEXI.gdirt;
  if (GT) { const S = GT.width / 5; gc.save(); gc.setTransform(TW / 2 / S, TH / 2 / S, -TW / 2 / S, TH / 2 / S, OX, 0); gc.fillStyle = gc.createPattern(GT, 'repeat'); gc.fillRect(0, 0, MW * S, MH * S); gc.restore(); }
  for (let i = 0; i < 380; i++) {
    const x = rnd() * MW, y = rnd() * MH, r = 40 + rnd() * 160, px = isoX(x, y), py = isoY(x, y), dark = rnd() < .55;
    gc.save(); gc.translate(px, py); gc.scale(1, .5);
    const gr = gc.createRadialGradient(0, 0, 0, 0, 0, r); gr.addColorStop(0, mp.ice ? (dark ? 'rgba(90,110,125,.16)' : 'rgba(255,255,255,.12)') : dark ? 'rgba(22,18,14,.28)' : 'rgba(130,118,92,.14)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    gc.fillStyle = gr; gc.beginPath(); gc.arc(0, 0, r, 0, TAU); gc.fill(); gc.restore();
  }
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
    const i = idx(x, y);
    if (road[i] && TEXI.groad) {
      const S = TEXI.groad.width / 3; gc.save(); gc.setTransform(TW / 2 / S, TH / 2 / S, -TW / 2 / S, TH / 2 / S, OX, 0); gc.fillStyle = gc.createPattern(TEXI.groad, 'repeat'); gc.fillRect(x * S, y * S, S, S); gc.restore();
    } else if (road[i]) {
      diamond(gc, x, y); gc.fillStyle = (x + y) % 3 ? '#2f2f32' : '#323236'; gc.fill();
      gc.strokeStyle = 'rgba(0,0,0,.35)'; gc.lineWidth = 1; for (let k = 0; k < 2; k++) { const a = isoX(x + rnd(), y + rnd()), b = isoY(x + rnd(), y + rnd()); gc.beginPath(); gc.moveTo(a, b); gc.lineTo(a + (rnd() - .5) * 26, b + (rnd() - .5) * 12); gc.stroke(); }
    }
    if (terr[i] === 2) { diamond(gc, x, y); gc.fillStyle = mp.water; gc.fill(); if (mp.ice) { gc.strokeStyle = 'rgba(255,255,255,.35)'; gc.lineWidth = 1; const a = isoX(x + rnd(), y + rnd()), b = isoY(x + rnd(), y + rnd()); gc.beginPath(); gc.moveTo(a, b); gc.lineTo(a + (rnd() - .5) * 30, b + (rnd() - .5) * 14); gc.stroke(); } }
    if (oreMax[i] > 0) { gc.save(); gc.translate(isoX(x + .5, y + .5), isoY(x + .5, y + .5)); gc.scale(1, .5); const gr = gc.createRadialGradient(0, 0, 0, 0, 0, 44); gr.addColorStop(0, 'rgba(60,220,240,.16)'); gr.addColorStop(1, 'rgba(60,220,240,0)'); gc.fillStyle = gr; gc.beginPath(); gc.arc(0, 0, 44, 0, TAU); gc.fill(); gc.restore(); }
    if (terr[i] === 1) { gc.save(); gc.translate(isoX(x + .5, y + .5), isoY(x + .5, y + .5)); gc.scale(1, .5); gc.fillStyle = 'rgba(15,13,11,.35)'; gc.beginPath(); gc.arc(0, 0, 34, 0, TAU); gc.fill(); gc.restore(); }
  }
  gc.strokeStyle = mp.lines ? 'rgba(205,180,90,.55)' : 'rgba(0,0,0,0)'; gc.lineWidth = 2; gc.setLineDash([14, 18]);
  for (const r of ROWS) { gc.beginPath(); gc.moveTo(isoX(0, r + 1), isoY(0, r + 1)); gc.lineTo(isoX(MW, r + 1), isoY(MW, r + 1)); gc.stroke(); }
  for (const c of COLS) { gc.beginPath(); gc.moveTo(isoX(c + 1, 0), isoY(c + 1, 0)); gc.lineTo(isoX(c + 1, MH), isoY(c + 1, MH)); gc.stroke(); }
  gc.setLineDash([]);
  for (let i = 0; i < 40; i++) { const x = 2 + rnd() * (MW - 4), y = 2 + rnd() * (MH - 4); if (terr[idx(x | 0, y | 0)]) continue; crater(isoX(x, y), isoY(x, y), 10 + rnd() * 22); }
  gc.restore();
  // Kartenrand
  gc.strokeStyle = 'rgba(79,240,255,.25)'; gc.lineWidth = 2; diamond(gc, 0, 0, MW, MH); gc.stroke();
}
function crater(px, py, r) {
  gc.save(); gc.translate(px, py); gc.scale(1, .5);
  let gr = gc.createRadialGradient(0, 0, 0, 0, 0, r); gr.addColorStop(0, 'rgba(10,8,6,.55)'); gr.addColorStop(.7, 'rgba(20,16,12,.3)'); gr.addColorStop(.85, 'rgba(120,108,88,.18)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  gc.fillStyle = gr; gc.beginPath(); gc.arc(0, 0, r, 0, TAU); gc.fill(); gc.restore();
}
let decals = [], groundBmp = null;
const SCORCH = (() => { const c = document.createElement('canvas'); c.width = 128; c.height = 64; const g = c.getContext('2d'); g.translate(64, 32); g.scale(1, .5); const gr = g.createRadialGradient(0, 0, 0, 0, 0, 62); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(.6, 'rgba(10,8,6,.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 62, 0, TAU); g.fill(); return c; })();
function scorch(px, py, r) { decals.push({ x: px, y: py, r }); if (decals.length > 260) decals.shift(); }
async function bakeGround() { try { groundBmp = await createImageBitmap(gcv); } catch (e) { groundBmp = gcv; } }

// ================= ENTITÄTEN =================
function mkUnit(type, team, tx, ty) {
  const d = UD[type];
  const u = { id: nid++, kind: 'u', type, team, d, x: tx + .5, y: ty + .5, hp: d.hp, max: d.hp, dir: Math.PI * .25, tdir: Math.PI * .25, path: null, state: 'idle', target: null, cd: 0, goal: null, load: 0, hs: 'seek', anim: (Math.random() * 100) | 0, hackP: 0, online: true, vet: 0, kills: 0 };
  ents.push(u); return u;
}
function mkBuild(type, team, tx, ty, anim) {
  const d = BD[type];
  const b = { id: nid++, kind: 'b', type, team, d, tx, ty, w: d.w, h: d.h, x: tx + d.w / 2, y: ty + d.h / 2, hp: d.hp, max: d.hp, cd: 0, target: null, built: anim ? 0 : 1, ang: Math.PI * .25, repair: false, flash: 0 };
  for (let y = ty; y < ty + d.h; y++) for (let x = tx; x < tx + d.w; x++) { const i = idx(x, y); bmap[i] = b; ore[i] = 0; oreMax[i] = 0; terr[i] = 0; }
  ents.push(b); return b;
}
const hhOf = e => e.kind === 'b' ? 30 : e.d.hh;
function distTo(a, b) {
  if (b.kind === 'b') { const dx = Math.max(b.tx - a.x, 0, a.x - (b.tx + b.w)), dy = Math.max(b.ty - a.y, 0, a.y - (b.ty + b.h)); return Math.hypot(dx, dy); }
  return Math.hypot(a.x - b.x, a.y - b.y);
}
function aimPt(t, from) {
  if (t.kind === 'b') return { x: clamp(from.x, t.tx + .2, t.tx + t.w - .2), y: clamp(from.y, t.ty + .2, t.ty + t.h - .2), h: 22 };
  return { x: t.x, y: t.y, h: t.d.hh * .55 };
}
const canHit = (a, t) => {
  const w = a.d.w || a.d.w2; if (!w) return false;
  if (w === 'hack') return t.kind === 'u' && t.team !== a.team && !!t.d.hack;
  if (w === 'convert') return t.kind === 'u' && t.team !== a.team && t.d.arm === 'inf' && !t.d.mach && !t.d.hero && t.type !== 'preacher';
  if (t.kind === 'u' && t.d.fly) return !!a.d.air;
  return true;
};
// Tarnung: sichtbar nur aus nächster Nähe oder kurz nach eigenem Schuss
function revealed(o, viewer) { if (!o.d || !o.d.stealth) return true; if (frame - (o.lastFire || -999) < 90) return true; for (const e of ents) if (!e.dead && e.team !== o.team && (!viewer || e.team === viewer.team) && Math.hypot(e.x - o.x, e.y - o.y) < 2.6) return true; return false; }
function isVis(o) {
  if (o.kind === 'u' && o.team !== 0 && o.d.stealth && !revealed(o)) return false;
  if (o.kind === 'u') return vis[idx(clamp(o.x | 0, 0, MW - 1), clamp(o.y | 0, 0, MH - 1))] === 1;
  for (let y = o.ty; y < o.ty + o.h; y++) for (let x = o.tx; x < o.tx + o.w; x++) if (vis[idx(x, y)]) return true; return false;
}
const seenB = b => seen[idx(b.tx, b.ty)] || seen[idx(b.tx + b.w - 1, b.ty + b.h - 1)];
function findTarget(e, r) {
  let best = null, bd = 1e9;
  for (const o of ents) {
    if (o.team === e.team || o.team === 2 || o.dead || !canHit(e, o)) continue;
    if (e.team === 0 && !isVis(o)) continue;
    if (o.d.stealth && !revealed(o, e)) continue;
    const dd = distTo(e, o); if (dd > r) continue;
    const sc = dd + (o.kind === 'b' ? 4 : 0) + (o.d.harv ? 1 : 0) + (o.type === 'relay' ? -2 : 0);
    if (sc < bd) { bd = sc; best = o; }
  }
  return best;
}

// ================= WEGFINDUNG (A*) =================
const AG = new Float32Array(MW * MH), AP = new Int32Array(MW * MH), AS = new Uint32Array(MW * MH), ACL = new Uint32Array(MW * MH); let ast = 0;
function nearestFree(x, y, maxR = 10) {
  for (let r = 0; r <= maxR; r++) {
    let best = null, bd = 1e9;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      if (passable(x + dx, y + dy)) { const d = dx * dx + dy * dy; if (d < bd) { bd = d; best = { x: x + dx, y: y + dy }; } }
    }
    if (best) return best;
  }
  return null;
}
function astar(sx, sy, gx, gy) {
  if (!inb(gx, gy)) return null;
  if (!passable(gx, gy)) { const n = nearestFree(gx, gy, 6); if (!n) return null; gx = n.x; gy = n.y; }
  if (sx === gx && sy === gy) return [];
  ast++; const start = idx(sx, sy), goal = idx(gx, gy);
  const hf = [], hn = [];
  const push = (f, n) => { hf.push(f); hn.push(n); let i = hf.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (hf[p] <= hf[i]) break; [hf[p], hf[i]] = [hf[i], hf[p]];[hn[p], hn[i]] = [hn[i], hn[p]]; i = p; } };
  const pop = () => { const n = hn[0], lf = hf.pop(), ln = hn.pop(); if (hf.length) { hf[0] = lf; hn[0] = ln; let i = 0; for (; ;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < hf.length && hf[l] < hf[m]) m = l; if (r < hf.length && hf[r] < hf[m]) m = r; if (m === i) break; [hf[m], hf[i]] = [hf[i], hf[m]];[hn[m], hn[i]] = [hn[i], hn[m]]; i = m; } } return n; };
  const h = n => { const dx = Math.abs(n % MW - gx), dy = Math.abs((n / MW | 0) - gy); return Math.max(dx, dy) + .414 * Math.min(dx, dy); };
  AS[start] = ast; AG[start] = 0; AP[start] = -1; push(h(start), start);
  let best = start, bh = h(start), it = 0;
  while (hf.length && it++ < 7000) {
    const n = pop(); if (ACL[n] === ast) continue; ACL[n] = ast;
    if (n === goal) { best = n; break; }
    const hn2 = h(n); if (hn2 < bh) { bh = hn2; best = n; }
    const x = n % MW, y = n / MW | 0;
    for (let k = 0; k < 8; k++) {
      const nx = x + DX[k], ny = y + DY[k]; if (!passable(nx, ny)) continue;
      if (k > 3 && (!passable(x + DX[k], y) || !passable(x, y + DY[k]))) continue;
      const m = idx(nx, ny); if (ACL[m] === ast) continue;
      const g = AG[n] + (k > 3 ? 1.414 : 1);
      if (AS[m] !== ast || g < AG[m]) { AS[m] = ast; AG[m] = g; AP[m] = n; push(g + h(m), m); }
    }
  }
  const out = []; let c = best; while (c !== start && c !== -1) { out.push(c); c = AP[c]; } out.reverse(); return out;
}
function los(x0, y0, x1, y1) {
  const d = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(d / .2);
  for (let i = 1; i <= n; i++) { const f = i / n, x = x0 + (x1 - x0) * f, y = y0 + (y1 - y0) * f; for (const [ox, oy] of [[0, 0], [.3, .3], [-.3, .3], [.3, -.3], [-.3, -.3]]) if (!passable(Math.floor(x + ox), Math.floor(y + oy))) return false; }
  return true;
}
function smooth(pts, sx, sy) {
  const out = []; let cx = sx, cy = sy, i = 0;
  while (i < pts.length) { let j = pts.length - 1; while (j > i && !los(cx, cy, pts[j].x, pts[j].y)) j--; out.push(pts[j]); cx = pts[j].x; cy = pts[j].y; i = j + 1; }
  return out;
}
function setPath(u, gx, gy) {
  if (u.d.fly) { u.path = [{ x: gx + .5, y: gy + .5 }]; return; }
  const p = astar(u.x | 0, u.y | 0, gx, gy);
  u.path = p && p.length ? smooth(p.map(n => ({ x: n % MW + .5, y: (n / MW | 0) + .5 })), u.x, u.y) : null;
}
function pathToEnt(u, t) {
  if (t.kind === 'b') setPath(u, clamp(u.x | 0, t.tx - 1, t.tx + t.w), clamp(u.y | 0, t.ty - 1, t.ty + t.h));
  else setPath(u, t.x | 0, t.y | 0);
}
function spots(gx, gy, n) {
  const out = [];
  for (let r = 0; r < 12 && out.length < n; r++) {
    const ring = [];
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (Math.max(Math.abs(dx), Math.abs(dy)) === r && passable(gx + dx, gy + dy)) ring.push({ x: gx + dx, y: gy + dy, d: dx * dx + dy * dy });
    ring.sort((a, b) => a.d - b.d); for (const s of ring) if (out.length < n) out.push(s);
  }
  while (out.length < n) out.push({ x: gx, y: gy }); return out;
}

// ================= BEWEGUNG =================
const angDiff = (a, b) => ((b - a + Math.PI) % TAU + TAU) % TAU - Math.PI;
const turn = (a, b, s) => { const d = angDiff(a, b); return Math.abs(d) < s ? b : a + Math.sign(d) * s; };
function speedOf(u) { let s = u.d.spd; if (u.d.mach && !u.hacked && !u.online) s *= .45; if (u.vet >= 2) s *= 1.1; if (u.spdB > frame) s *= 1.6; if (u.turbo > frame) s *= 1.25; return s; }
function moveAlong(u) {
  if (!u.path) return;
  const p = u.path[0];
  if (!u.d.fly && (frame + u.id) % 20 === 0 && !passable(p.x | 0, p.y | 0)) { const g = u.path[u.path.length - 1]; setPath(u, g.x | 0, g.y | 0); return; }
  const dx = p.x - u.x, dy = p.y - u.y, dd = Math.hypot(dx, dy), sp = speedOf(u);
  if (dd <= sp) { u.x = p.x; u.y = p.y; u.path.shift(); if (!u.path.length) u.path = null; }
  else { u.x += dx / dd * sp; u.y += dy / dd * sp; }
  if (dd > .001) { const a = Math.atan2(dy, dx); u.dir = turn(u.dir, a, u.type === 'tank' || u.d.harv || u.type === 'titan' ? .12 : .3); if (u.type === 'tank' && !u.target) u.tdir = turn(u.tdir, u.dir, .08); }
  u.moving = true;
}
function separate() {
  const us = ents.filter(e => e.kind === 'u' && !e.dead);
  for (let i = 0; i < us.length; i++) {
    const a = us[i];
    for (let j = i + 1; j < us.length; j++) {
      const b = us[j]; if (!!a.d.fly !== !!b.d.fly) continue;
      const dx = b.x - a.x, dy = b.y - a.y, rr = (a.d.r + b.d.r) * .7;
      if (Math.abs(dx) > rr || Math.abs(dy) > rr) continue;
      const d2 = dx * dx + dy * dy; if (d2 >= rr * rr) continue;
      const dd = Math.sqrt(d2) || .01, push = (rr - dd) * .25, nx = d2 ? dx / dd : Math.random() - .5, ny = d2 ? dy / dd : Math.random() - .5;
      const wa = a.hs === 'mine' || a.hs === 'unload' ? .2 : 1, wb = b.hs === 'mine' || b.hs === 'unload' ? .2 : 1;
      shift(a, -nx * push * wa, -ny * push * wa); shift(b, nx * push * wb, ny * push * wb);
    }
  }
}
function shift(u, dx, dy) { const nx = u.x + dx, ny = u.y + dy; if (u.d.fly ? inb(nx | 0, ny | 0) : passable(nx | 0, ny | 0)) { u.x = nx; u.y = ny; } }

// ================= KAMPF =================
function fire(e, t) {
  const w = e.d.w || e.d.w2, ap = aimPt(t, e);
  const h0 = e.kind === 'b' ? (e.type === 'pylon' ? 60 : 16) : e.d.hh * .6;
  const ang = Math.atan2(ap.y - e.y, ap.x - e.x), L = e.kind === 'b' ? .3 : e.d.r * .9;
  const mx = e.x + Math.cos(ang) * L, my = e.y + Math.sin(ang) * L;
  e.flash = 4;
  e.lastFire = frame;
  if (w === 'hack' || w === 'convert') {
    t.hackP += 1 + (e.vet || 0) * .5; t.lastHack = frame;
    if (frame % 3 === 0) beams.push({ x1: mx, y1: my, h1: h0, x2: ap.x, y2: ap.y, h2: ap.h, c: w === 'hack' ? '#4ff0ff' : '#c27bff', w: 1.4, life: 4, max: 4, zig: 1 });
    if (t.hackP >= (w === 'hack' ? t.d.hack : 210)) convert(t, e, w);
    return;
  }
  if (w === 'bullet' || w === 'turret') {
    beams.push({ x1: mx, y1: my, h1: h0, x2: ap.x + (Math.random() - .5) * .15, y2: ap.y + (Math.random() - .5) * .15, h2: ap.h, c: '#ffe08a', w: 1.2, life: 4, max: 4 });
    applyDmg(t, e.d.dmg * vetMul(e), w, e); snd(w === 'turret' ? 'mg' : 'shot', e.x, e.y); sparkAt(ap, '#ffd27a', 3);
    if (Math.random() < .5) part({ x: isoX(mx, my), y: isoY(mx, my) - h0, t: 'flash', r: 9, life: 3, c: '255,230,160' });
  } else if (w === 'laser' || w === 'laserv') {
    const vc = w === 'laserv';
    beams.push({ x1: mx, y1: my, h1: h0, x2: ap.x, y2: ap.y, h2: ap.h, c: vc ? '#c27bff' : '#ff3040', w: 2.2, life: 8, max: 8 });
    applyDmg(t, e.d.dmg * vetMul(e) * (e.d.mach && e.online === false ? .6 : 1), w, e); snd('laser', e.x, e.y); sparkAt(ap, vc ? '#d9a8ff' : '#ff6070', 4);
  } else {
    projs.push({ x: mx, y: my, h: h0, t, lx: ap.x, ly: ap.y, lh: ap.h, w, dmg: e.d.dmg * vetMul(e), src: e, team: e.team, spd: w === 'rocket' ? .13 : w === 'shell' || w === 'sabot' ? .3 : w === 'fire' ? .09 : .11, life: 300 });
    snd(w === 'rocket' ? 'rocket' : w === 'shell' || w === 'sabot' ? 'cannon' : w === 'fire' ? 'hit' : 'plasma', e.x, e.y);
    { const px = isoX(mx, my), py = isoY(mx, my) - h0;
      if (w === 'shell' || w === 'sabot') { part({ x: px, y: py, t: 'flash', r: 22, life: 5, c: '255,220,150' }); for (let i = 0; i < 2; i++) part({ x: px, y: py, vx: Math.cos(ang) * .8 + (Math.random() - .5) * .3, vy: -.3, life: 40, r: 3, t: 'smoke' }); }
      else if (w === 'rocket') { part({ x: px, y: py, t: 'flash', r: 14, life: 4, c: '255,190,110' }); part({ x: px - Math.cos(ang) * 8, y: py, vx: -Math.cos(ang) * 1.2, vy: -.2, life: 34, r: 3, t: 'smoke' }); } }
    if (w === 'shell') { const px = isoX(mx, my), py = isoY(mx, my) - h0; for (let i = 0; i < 4; i++) part({ x: px, y: py, vx: Math.cos(ang) * 1.5 + (Math.random() - .5), vy: (Math.random() - .5), t: 'fire', r: 3, life: 8 }); }
  }
}
const vetMul = e => (1 + (e.vet || 0) * .15) * (e.dmgB > frame ? 1.4 : 1);
function convert(t, src, how = 'hack') {
  const was = t.team; t.team = src.team; if (how === 'hack') t.hacked = (t.team === 0 ? PF : EF) !== UD[t.type].fac; else t.converted = true;
  t.target = null; t.state = 'idle'; t.path = null; t.wave = false; t.hackP = 0; t.online = true;
  for (const o of ents) if (o.target === t) o.target = null;
  if (src.team === 0) stats.hacked++;
  const col = how === 'hack' ? '79,240,255' : '194,123,255', cs = how === 'hack' ? '#4ff0ff' : '#d9a8ff';
  const px = isoX(t.x, t.y), py = isoY(t.x, t.y) - t.d.hh * .5;
  part({ x: px, y: py, t: 'ring', r: 10, life: 26, c: col }); for (let i = 0; i < 14; i++) part({ x: px, y: py, vx: (Math.random() - .5) * 4, vy: (Math.random() - .5) * 3, t: 'spark', life: 22, c: cs });
  if (src.team === 0) { msg(facOf(0).short + ' ▸ ' + t.d.n + (how === 'hack' ? ' übernommen! Die Maschine kämpft jetzt für uns.' : ' bekehrt! Er dient jetzt der Einheit.'), cs); speak('Feindeinheit übernommen'); snd('hack'); }
  else if (was === 0) msg(facOf(1).short + ' ▸ Eine unserer Einheiten wurde ' + (how === 'hack' ? 'gehackt' : 'bekehrt') + '!', '#ff8a8a');
  src.target = null;
}
function applyDmg(t, dmg, w, src) {
  if (t.dead || t.team === 2) return;
  const arm = t.kind === 'b' ? 'bld' : t.d.arm, m = MULT[w] && MULT[w][arm] !== undefined ? MULT[w][arm] : 1;
  t.hp -= dmg * m * (t.vet >= 3 ? .8 : 1) * (t.team === 0 && hasU('armor') ? .88 : 1) * (t.shield > frame ? .3 : 1) * (t.kind === 'u' && zones.length && inSmoke(t) ? .4 : 1);
  t.hitF = frame;
  if (t.team === 0 && src && src.team === 1) {
    if (t.kind === 'b' && frame - lastAtkB > 900) { lastAtkB = frame; speak('Unsere Basis wird angegriffen'); msg(facOf(0).short + ' ▸ Basis wird angegriffen!', '#ff8a8a'); ping(t.x, t.y); }
    else if (t.kind === 'u' && frame - lastAtkU > 1500) { lastAtkU = frame; ping(t.x, t.y); }
  }
  if (t.kind === 'u' && src && !src.dead && !t.target && t.state !== 'move' && !t.d.harv && src.team !== t.team && canHit(t, src)) t.target = src;
  if (t.hp <= 0) kill(t, src);
}
function kill(t, src) {
  if (t.dead) return;
  t.dead = true; t.hp = 0; sel.delete(t); if (hover === t) hover = null;
  if ((t.kind === 'b' || t.d.arm === 'veh') && PF === 'schrott' && ents.some(e => e.team === 0 && !e.dead && e !== t && Math.hypot(e.x - t.x, e.y - t.y) < 7)) { const g = Math.max(60, Math.round(((t.d.cost || 600) * .25) / 10) * 10); credits += g; part({ x: isoX(t.x, t.y), y: isoY(t.x, t.y) - 30, vy: -.6, t: 'txt', life: 70, s: '+' + g + ' $', c: '#ffc64a' }); }
  const px = isoX(t.x, t.y), py = isoY(t.x, t.y);
  if (t.kind === 'u' && t.d.hero) heroDown(t);
  if (t.kind === 'u' && t.ttl) { t.dead = true; return; }
  if (src && src.kind === 'u' && !src.dead) { src.kills++; const v = src.kills >= 9 ? 3 : src.kills >= 5 ? 2 : src.kills >= 2 ? 1 : 0; if (v > src.vet) { src.vet = v; if (src.team === 0) msg(facOf(0).short + ' ▸ ' + src.d.n + (src.d.hero ? ' erreicht Stufe ' + (v + 1) + '!' : ' befördert (Veteran ' + '★'.repeat(v) + ')'), '#ffc64a'); } }
  if (t.kind === 'b') {
    if (t.team === 0) stats.lostB++;
    for (let y = t.ty; y < t.ty + t.h; y++) for (let x = t.tx; x < t.tx + t.w; x++) if (bmap[idx(x, y)] === t) bmap[idx(x, y)] = null;
    explode(isoX(t.x, t.y), isoY(t.x, t.y) - 10, Math.min(3.2, 1.2 + t.w * .5));
    const n = t.w * t.h; for (let i = 0; i < n; i++) timers.push({ f: frame + 6 + i * 7, fn: () => explode(isoX(t.tx + Math.random() * t.w, t.ty + Math.random() * t.h), isoY(t.tx + Math.random() * t.w, t.ty + Math.random() * t.h) - 10, 1 + Math.random()) });
    for (let i = 0; i < n * 2; i++) scorch(isoX(t.tx + Math.random() * t.w, t.ty + Math.random() * t.h), isoY(t.tx + Math.random() * t.w, t.ty + Math.random() * t.h), 20 + Math.random() * 30);
    chunks(px, py - 20, 6 + n * 2, 2); wreck(px, py, true, 900 + n * 60); if (onScreen(t)) shake = Math.max(shake, 5 + t.w);
    calcPower();
    if (t.team === 0) { speak('Gebäude verloren'); msg(facOf(0).short + ' ▸ ' + t.d.n + ' zerstört.', '#ff8a8a'); }
    else if (t.type === 'relay' && EF === 'axiom') { msg(facOf(0).short + ' ▸ Relais zerstört! AXIOM-Netz in diesem Sektor getrennt.', '#ffc64a'); speak('Relais zerstört. Feindliches Netz getrennt'); updNet(); }
    else if (t.d.hq) { shake = 18; for (let i = 0; i < 14; i++) timers.push({ f: frame + i * 6, fn: () => explode(isoX(t.tx + Math.random() * 4, t.ty + Math.random() * 4), isoY(t.tx + Math.random() * 4, t.ty + Math.random() * 4) - Math.random() * 60, 2 + Math.random()) }); }
  } else {
    const big = t.d.arm === 'veh';
    explode(px, py - (t.d.fly ? 30 : 8), t.type === 'titan' ? 2.4 : big ? 1.6 : t.d.fly ? 1 : .55);
    if (big || t.d.fly) scorch(px, py, big ? 26 : 14);
    if (t.team === 1) stats.kills++; else stats.lost++;
    if (t.d.mach && !t.d.fly) for (let i = 0; i < 6; i++) part({ x: px, y: py - 8, vx: (Math.random() - .5) * 3, vy: -Math.random() * 3, g: .15, t: 'debris', life: 40, c: '#aab3bc' });
    if (big && !t.d.fly) { chunks(px, py - 6, t.type === 'titan' ? 9 : 6, t.type === 'titan' ? 2 : 1.3); wreck(px, py, t.type === 'titan', t.type === 'titan' ? 600 : 420); if (onScreen(t)) shake = Math.max(shake, t.type === 'titan' ? 6 : 3); }
  }
}


// ================= NEUTRALE TECHNIKGEBÄUDE =================
const hasRadar = () => ents.some(e => e.d.neutral === 'radar' && e.team === 0 && !e.dead);
function placeNeutrals(M) {
  if (M && (M.noNeutral || M.seq)) return;
  const types = ['nb_drill', 'nb_radar', 'nb_repair'].filter(t => SPR[t]); if (!types.length) return;
  const spots = [[26, 26], [13, 27], [29, 13], [38, 38], [18, 40], [40, 20]];
  const fits = (x, y) => { for (let yy = y - 1; yy < y + 3; yy++) for (let xx = x - 1; xx < x + 3; xx++) if (!inb(xx, yy) || terr[idx(xx, yy)] || bmap[idx(xx, yy)]) return false; return true; };
  let k = 0;
  for (const [sx, sy] of spots) { if (k >= 4) break; const t = k === 0 || k === 3 ? 'nb_drill' : types[k % types.length]; if (!SPR[t]) continue;
    for (let r = 0; r < 6; r++) { let done = false; for (let dy = -r; dy <= r && !done; dy++) for (let dx = -r; dx <= r && !done; dx++) { const x = sx + dx, y = sy + dy; if (fits(x, y)) { const b = mkBuild(t, 2, x, y); b.cap = 0; b.capT = -1; done = true; k++; } } if (done) break; } }
}
function updNeutral(b) {
  const T = b.team;
  if (frame % 15 === 0) { // Eroberung durch Infanterie
    const near = ents.filter(e => e.kind === 'u' && !e.dead && e.d.cat === 'inf' && !e.d.harv && e.team !== T && e.team !== 2 && Math.abs(e.x - b.x) < b.w / 2 + 1.4 && Math.abs(e.y - b.y) < b.h / 2 + 1.4);
    const teams = new Set(near.map(e => e.team)), defend = ents.some(e => e.kind === 'u' && !e.dead && e.team === T && T !== 2 && Math.abs(e.x - b.x) < b.w / 2 + 1.4 && Math.abs(e.y - b.y) < b.h / 2 + 1.4);
    if (teams.size === 1 && !defend) { const ct = [...teams][0]; if (b.capT !== ct) { b.capT = ct; b.cap = 0; } b.cap += 15 * (1 + Math.min(2, near.length - 1) * .5);
      if (b.cap >= 300) { b.team = ct; b.cap = 0; b.capT = -1; b.hp = b.max; snd('ready'); for (let i = 0; i < 18; i++) part({ x: isoX(b.x, b.y), y: isoY(b.x, b.y) - 30, vx: (Math.random() - .5) * 3, vy: -Math.random() * 3, g: .08, t: 'spark', life: 26, c: ct === 0 ? facOf(0).col : facOf(1).col });
        if (ct === 0) { msg(facOf(0).short + ' ▸ ' + b.d.n + ' erobert! ' + b.d.info + '.', '#ffd54a'); speak('Gebäude erobert'); if (b.d.neutral === 'radar') { seen.fill(1); updFog(); } }
        else { msg(facOf(1).leader + ' ▸ Der Feind hat ' + b.d.n + ' erobert!', '#ff6b75'); ping(b.x, b.y); } } }
    else if (!near.length && b.cap > 0) b.cap = Math.max(0, b.cap - 30);
  }
  if (T === 2) return;
  if (b.d.neutral === 'drill' && frame % 120 === b.id % 120) { if (T === 0) { credits += 40; stats.harv += 40; } else AI.credits += 40; if (T === 0 && isVis(b)) part({ x: isoX(b.x, b.y), y: isoY(b.x, b.y) - 50, vy: -.6, t: 'txt', s: '+40', c: '#ffd54a', life: 50 }); }
  if (b.d.neutral === 'repair' && frame % 30 === 0) for (const e of ents) if (e.team === T && !e.dead && e !== b && e.hp < e.max && (e.kind === 'b' || e.d.arm === 'veh') && Math.hypot(e.x - b.x, e.y - b.y) < 6.5) { e.hp = Math.min(e.max, e.hp + e.max * .03); if (frame % 60 === 0) part({ x: isoX(e.x, e.y), y: isoY(e.x, e.y) - 20, vy: -.8, t: 'spark', life: 16, c: '#7dff9a' }); }
}
function drawNeutralTag(b) {
  const px = isoX(b.x, b.y), py = isoY(b.x, b.y), col = b.team === 2 ? '#c8c8b4' : b.team === 0 ? facOf(0).col : facOf(1).col;
  ctx.strokeStyle = col; ctx.globalAlpha = .7; ctx.lineWidth = 2; ctx.setLineDash([6, 5]); diamond(ctx, b.tx - .15, b.ty - .15, b.w + .3, b.h + .3); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
  if (b.cap > 0) { const k = b.cap / 300, c2 = b.capT === 0 ? facOf(0).col : facOf(1).col; ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(px - 26, py - 92, 52, 7); ctx.fillStyle = c2; ctx.fillRect(px - 25, py - 91, 50 * k, 5); ctx.font = 'bold 10px Orbitron,sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.fillText('EROBERUNG', px, py - 96); ctx.textAlign = 'left'; }
  else if (b.team === 2 && (b === hover || sel.has(b))) { ctx.font = 'bold 11px Orbitron,sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#ffd54a'; ctx.fillText(b.d.n.toUpperCase() + ' · MIT INFANTERIE EROBERN', px, py - 92); ctx.textAlign = 'left'; }
}
// ================= NACHSCHUBKISTEN =================
const CRATE = { cash: { n: '+750 Credits', c: '#ffd54a' }, vet: { n: 'Beförderung', c: '#ffe08a' }, heal: { n: 'Reparatur', c: '#7fff9f' }, map: { n: 'Aufklärung', c: '#4ff0ff' }, units: { n: 'Verstärkung', c: '#8fc4ff' }, sw: { n: 'Superwaffe +30 %', c: '#ff9a2a' } };
function pickCrateKind() { const ks = ['cash', 'cash', 'vet', 'heal', 'map', 'units', 'units']; if (ents.some(e => e.team === 0 && e.d.sw && !e.dead)) ks.push('sw'); return ks[Math.random() * ks.length | 0]; }
function addCrate(x, y, kind) { const p = nearestFree(x, y, 4); if (!p) return; crates.push({ x: p.x + .5, y: p.y + .5, kind: kind || pickCrateKind(), t0: frame }); }
function crateSpot(minD) {
  for (let n = 0; n < 300; n++) { const x = ri(4, MW - 5), y = ri(4, MH - 5);
    if (!passable(x, y) || ore[idx(x, y)] > 0) continue; if (Math.hypot(x - PB.x, y - PB.y) < minD || Math.hypot(x - EB.x, y - EB.y) < minD) continue;
    if (crates.some(c => Math.hypot(c.x - x, c.y - y) < 8)) continue; return { x, y }; }
  return null;
}
function updCrates() {
  if (frame % 10) return;
  if ((!MISSION || MISSION.crateRain) && frame % 3600 === 1200 && crates.length < 4) { const p = crateSpot(9); if (p) { addCrate(p.x, p.y); msg('Nachschubkiste über der Karte abgeworfen!', '#ffd54a'); } }
  for (const c of crates) { const u = ents.find(e => e.kind === 'u' && !e.dead && !e.d.fly && !e.d.harv && Math.hypot(e.x - c.x, e.y - c.y) < .95); if (u) takeCrate(c, u); }
  crates = crates.filter(c => !c.taken);
}
function takeCrate(c, u) {
  c.taken = true; const K = CRATE[c.kind], px = isoX(c.x, c.y), py = isoY(c.x, c.y);
  for (let i = 0; i < 22; i++) part({ x: px, y: py - 10, vx: (Math.random() - .5) * 3.5, vy: -Math.random() * 3.5, g: .1, t: 'spark', life: 26, c: K.c });
  part({ x: px, y: py, t: 'ring', r: 10, c: '255,214,74', life: 30 });
  if (u.team !== 0) { AI.credits += 750; part({ x: px, y: py - 28, vy: -.5, t: 'txt', s: 'Gegner plündert!', c: '#ff6b75', life: 80 }); return; }
  snd('ready'); stats.crates++; part({ x: px, y: py - 28, vy: -.5, t: 'txt', s: K.n, c: K.c, life: 90 });
  const near = r => ents.filter(e => e.team === 0 && !e.dead && Math.hypot(e.x - c.x, e.y - c.y) < r);
  switch (c.kind) {
    case 'cash': credits += 750; break;
    case 'vet': for (const e of near(5)) if (e.kind === 'u' && !e.d.harv) e.vet = Math.min(3, (e.vet || 0) + 1); break;
    case 'heal': for (const e of near(7)) e.hp = e.max; break;
    case 'map': for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) if (Math.hypot(x - c.x, y - c.y) < 16) seen[idx(x, y)] = 1; break;
    case 'units': { const F = facOf(0); for (const t of [F.role.inf, F.role.inf, F.role.inf, F.role.at]) { const p = nearestFree(c.x | 0, c.y | 0, 4); if (p) { const n = mkUnit(t, 0, p.x, p.y); n.vet = 1; } } break; }
    case 'sw': for (const e of ents) if (e.team === 0 && e.d.sw && !e.dead) e.swP = Math.min(swMax(e), (e.swP || 0) + swMax(e) * .3); break;
  }
  msg(facOf(0).short + ' ▸ Nachschubkiste: ' + K.n + '!', K.c);
}
function drawCrate(c) {
  const px = isoX(c.x, c.y), py = isoY(c.x, c.y), bob = Math.sin((frame + c.t0) * .07) * 2.5;
  glowAt(px, py - 6, 40, '255,205,80', .45 + .2 * Math.sin(frame * .12));
  { const g = ctx.createLinearGradient(px, py - 90, px, py); g.addColorStop(0, 'rgba(255,214,74,0)'); g.addColorStop(1, 'rgba(255,214,74,.35)'); ctx.fillStyle = g; ctx.fillRect(px - 5, py - 90, 10, 86); }
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(px, py, 13, 6.5, 0, 0, TAU); ctx.fill();
  if (SPR.crate) { const s = SPR.crate; spr(s, px, py - 3 - bob); return; }
  const w = 11, h = 12, y0 = py - 6 - bob;
  ctx.fillStyle = '#5b6233'; ctx.beginPath(); ctx.moveTo(px, y0 - w / 2 - h); ctx.lineTo(px + w, y0 - h); ctx.lineTo(px, y0 + w / 2 - h); ctx.lineTo(px - w, y0 - h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3f4524'; ctx.beginPath(); ctx.moveTo(px - w, y0 - h); ctx.lineTo(px, y0 + w / 2 - h); ctx.lineTo(px, y0 + w / 2); ctx.lineTo(px - w, y0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2e331a'; ctx.beginPath(); ctx.moveTo(px + w, y0 - h); ctx.lineTo(px, y0 + w / 2 - h); ctx.lineTo(px, y0 + w / 2); ctx.lineTo(px + w, y0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#ffc64a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px - w, y0 - h * .45); ctx.lineTo(px, y0 + w / 2 - h * .45); ctx.lineTo(px + w, y0 - h * .45); ctx.stroke();
  glowAt(px, y0 - h, 8, '79,240,255', .9);
}
function drawMark() {
  if (!tutMark) return; const px = isoX(tutMark.x + .5, tutMark.y + .5), py = isoY(tutMark.x + .5, tutMark.y + .5), k = (frame % 60) / 60;
  ctx.strokeStyle = `rgba(79,240,255,${1 - k})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(px, py, 18 + k * 30, (18 + k * 30) * .5, 0, 0, TAU); ctx.stroke();
  ctx.strokeStyle = '#4ff0ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(px, py, 16, 8, 0, 0, TAU); ctx.stroke();
  const ay = py - 46 - Math.abs(Math.sin(frame * .08)) * 12; ctx.fillStyle = '#4ff0ff'; ctx.beginPath(); ctx.moveTo(px, ay + 18); ctx.lineTo(px - 11, ay); ctx.lineTo(px - 4, ay); ctx.lineTo(px - 4, ay - 14); ctx.lineTo(px + 4, ay - 14); ctx.lineTo(px + 4, ay); ctx.lineTo(px + 11, ay); ctx.closePath(); ctx.fill();
}
function tutSpawn(types, x, y, attack) { for (const t of types) { const p = nearestFree(x, y, 5); if (!p) continue; const u = mkUnit(t, 1, p.x, p.y); u.online = true; TUTU.push(u); if (attack) { const tg = ents.find(e => e.team === 0 && e.d.hq && !e.dead); if (tg) orderAI(u, tg); } } }
function updProj() {
  for (const p of projs) {
    if (p.t && !p.t.dead) { const ap = aimPt(p.t, p); p.lx = ap.x; p.ly = ap.y; p.lh = ap.h; }
    const dx = p.lx - p.x, dy = p.ly - p.y, dd = Math.hypot(dx, dy);
    if (dd <= p.spd) {
      p.dead = true;
      if (p.t && !p.t.dead) applyDmg(p.t, p.dmg, p.w, p.src);
      if (p.w === 'plasma' || p.w === 'fire') for (const o of ents) if (!o.dead && o.team !== p.team && o !== p.t && o.kind === 'u' && !o.d.fly && Math.hypot(o.x - p.lx, o.y - p.ly) < 1.2) applyDmg(o, p.dmg * .4, p.w, p.src);
      explode(isoX(p.lx, p.ly), isoY(p.lx, p.ly) - p.lh, p.w === 'shell' || p.w === 'sabot' ? .7 : p.w === 'plasma' || p.w === 'fire' ? 1 : .55, p.w === 'plasma' ? 'plasma' : null);
      if (p.w === 'fire') for (let i = 0; i < 10; i++) part({ x: isoX(p.lx, p.ly) + (Math.random() - .5) * 26, y: isoY(p.lx, p.ly) - Math.random() * 6, vy: -.5 - Math.random(), t: 'fire', r: 3 + Math.random() * 3, life: 30 + Math.random() * 30 });
    } else {
      p.x += dx / dd * p.spd; p.y += dy / dd * p.spd; p.h += (p.lh - p.h) * .1;
      if (p.w === 'rocket' && frame % 2 === 0) part({ x: isoX(p.x, p.y), y: isoY(p.x, p.y) - p.h, t: 'smoke', r: 2, life: 26, vy: -.15 });
    }
    if (--p.life <= 0) p.dead = true;
  }
  projs = projs.filter(p => !p.dead);
}

// ================= EFFEKTE =================
function part(o) { o.vx = o.vx || 0; o.vy = o.vy || 0; o.max = o.life; parts.push(o); }
function explode(x, y, s, kind) {
  const pl = kind === 'plasma';
  for (let i = 0; i < 7 * s; i++) { const a = Math.random() * TAU, v = Math.random() * 1.4 * s; part({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v * .6 - .3, life: 18 + Math.random() * 18, r: 3 * s + Math.random() * 4 * s, t: pl ? 'plasma' : 'fire' }); }
  for (let i = 0; i < 4 * s; i++) part({ x: x + (Math.random() - .5) * 10 * s, y, vx: (Math.random() - .5) * .6, vy: -.3 - Math.random() * .5, life: 60 + Math.random() * 50, r: 4 * s + Math.random() * 4, t: 'smoke' });
  for (let i = 0; i < 5 * s; i++) { const a = Math.random() * TAU, v = 1.5 + Math.random() * 3 * s; part({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v * .6 - 1.5, g: .12, life: 16 + Math.random() * 14, t: 'spark', c: pl ? '#d68cff' : '#ffd08a' }); }
  part({ x, y, t: 'ring', r: 5 * s, life: 16, c: pl ? '200,120,255' : '255,200,140' });
  part({ x, y: y - 4, t: 'flash', r: 16 + 14 * s, life: 7 + s * 2, c: pl ? '220,150,255' : '255,226,170' });
  if (s >= 1.3) part({ x, y: y + 8, t: 'shock', r: 6 * s, life: 14, c: pl ? '220,170,255' : '255,240,220' });
  if (s >= 1.2 && !pl) chunks(x, y, Math.round(s * 3), s);
  if (s >= 1) scorch(x, y + 8, s * 14);
  snd(s >= 1.3 ? 'boom' : 'hit', ...(unIsoXY(x, y)));
  if (s >= 2) shake = Math.max(shake, s * 2.5);
}
const unIsoXY = (px, py) => { const p = unIso(px, py); return [p.x, p.y]; };
function chunks(x, y, n, s = 1, col) {
  for (let i = 0; i < n; i++) { const a = -Math.PI * (.15 + Math.random() * .7), v = 1.6 + Math.random() * 2.4 * Math.min(2, s);
    part({ x, y: y - 4, vx: Math.cos(a) * v * (Math.random() < .5 ? -1 : 1), vy: Math.sin(a) * v * 1.4, g: .16, gy: y + 6 + Math.random() * 10, rot: Math.random() * TAU, vr: (Math.random() - .5) * .5, sz: 2 + Math.random() * 3 * Math.min(1.6, s), life: 70 + Math.random() * 50, t: 'chunk', c: col || ['#3a3836', '#55504a', '#6b625a', '#2a2826'][i % 4], trail: Math.random() < .5 }); }
}
let wrecks = [];
function wreck(x, y, big, dur) { wrecks.push({ x, y, big, until: frame + dur, t0: frame }); if (wrecks.length > 40) wrecks.shift(); }
function updWrecks() {
  for (const w of wrecks) { const k = (w.until - frame) / (w.until - w.t0);
    if ((frame + (w.x | 0)) % (w.big ? 5 : 8) === 0) part({ x: w.x + (Math.random() - .5) * (w.big ? 30 : 10), y: w.y - 4, vx: .12 + (Math.random() - .5) * .15, vy: -.5 - Math.random() * .3, life: 80 + Math.random() * 40, r: 3 + Math.random() * 3 + (w.big ? 2 : 0), t: 'smoke' });
    if (k > .4 && (frame + (w.y | 0)) % (w.big ? 4 : 7) === 0) part({ x: w.x + (Math.random() - .5) * (w.big ? 26 : 8), y: w.y - 2, vx: (Math.random() - .5) * .3, vy: -.5 - Math.random() * .5, life: 16 + Math.random() * 14, r: 2 + Math.random() * 3, t: 'fire' }); }
  wrecks = wrecks.filter(w => frame < w.until);
}
function sparkAt(ap, c, n) { const px = isoX(ap.x, ap.y), py = isoY(ap.x, ap.y) - ap.h; for (let i = 0; i < n; i++) part({ x: px, y: py, vx: (Math.random() - .5) * 2.5, vy: (Math.random() - .5) * 2 - .5, life: 8 + Math.random() * 8, t: 'spark', c }); }
function updParts() {
  for (const p of parts) { p.x += p.vx; p.y += p.vy; if (p.g) p.vy += p.g; if (p.t === 'smoke') { p.vx *= .98; p.r += .12; }
    else if (p.t === 'chunk') { p.rot += p.vr; if (p.y > p.gy && p.vy > 0) { p.y = p.gy; p.vy *= -.32; p.vx *= .5; p.vr *= .5; if (Math.abs(p.vy) < .4) { p.vy = 0; p.g = 0; p.vx *= .7; p.trail = false; } } else if (p.trail && (p.life & 3) === 0) part({ x: p.x, y: p.y, vx: 0, vy: -.2, life: 26, r: 2, t: 'smoke' }); }
    p.life--; }
  updWrecks();
  parts = parts.filter(p => p.life > 0); if (parts.length > 700) parts.splice(0, parts.length - 700);
  for (const b of beams) b.life--; beams = beams.filter(b => b.life > 0);
  for (const m of marks) m.life--; marks = marks.filter(m => m.life > 0);
  for (const m of msgs) m.life--; msgs = msgs.filter(m => m.life > 0);
  for (const p of pings) p.life--; pings = pings.filter(p => p.life > 0);
  if (shake > 0) shake *= .88; if (shake < .3) shake = 0;
}
function msg(t, c = '#cfe') { msgs.push({ t, c, life: 480 }); if (msgs.length > 5) msgs.shift(); }
function ping(x, y) { pings.push({ x, y, life: 120 }); }

// ================= EINHEITEN =================
function updUnit(u) {
  const d = u.d; if (u.cd > 0) u.cd--; u.moving = false;
  if (u.hackP > 0 && frame - (u.lastHack || 0) > 40) u.hackP = Math.max(0, u.hackP - 2);
  if (u.ttl && frame > u.ttl) { u.dead = true; sel.delete(u); part({ x: isoX(u.x, u.y), y: isoY(u.x, u.y) - u.d.hh, t: 'ring', r: 8, life: 16, c: '255,80,90' }); return; }
  if (u.stun > frame) { if (frame % 9 === u.id % 9) { const px = isoX(u.x, u.y), py = isoY(u.x, u.y) - d.hh * .6; part({ x: px + (Math.random() - .5) * 14, y: py, vx: (Math.random() - .5) * 2, vy: -1.2, t: 'spark', life: 10, c: '#7fdcff' }); } return; }
  if (u.esc) { escTick(u); return; }
  if (u.d.harv) { updHarv(u); return; }
  if (d.hero && heroTick(u)) return;
  if (UAB[u.type] && uabTick(u)) return;
  if (u.target && (u.target.dead || u.target.team === u.team)) u.target = null;
  if (u.target && (d.w === 'hack' || d.w === 'convert') && !canHit(u, u.target)) u.target = null;
  if (!u.target && u.state !== 'move' && (frame + u.id) % 12 === 0) { u.target = findTarget(u, d.sight); if (u.target && u.state === 'idle') u.chase = { x: u.x, y: u.y }; }
  if (u.target) {
    const t = u.target, dist = distTo(u, t);
    if (dist <= d.rng) {
      u.path = null; const ap = aimPt(t, u), a = Math.atan2(ap.y - u.y, ap.x - u.x); let ok;
      if (u.type === 'tank' || u.type === 'titan') { u.tdir = turn(u.tdir, a, .09); if (u.type === 'titan') u.dir = turn(u.dir, a, .05); ok = Math.abs(angDiff(u.type === 'tank' ? u.tdir : u.dir, a)) < .2; }
      else { u.dir = turn(u.dir, a, .3); ok = Math.abs(angDiff(u.dir, a)) < .35; }
      const rof = d.rof * (d.mach && !u.hacked && !u.online ? 2.2 : 1);
      if (ok && u.cd <= 0) { fire(u, t); u.cd = rof * (u.rofB > frame ? .62 : 1); }
    } else {
      if (u.state === 'idle' && u.chase && Math.hypot(u.x - u.chase.x, u.y - u.chase.y) > 8) { u.target = null; u.state = 'move'; setPath(u, u.chase.x | 0, u.chase.y | 0); u.chase = null; }
      else { if (!u.path || (frame + u.id) % 45 === 0) pathToEnt(u, t); moveAlong(u); }
    }
  } else {
    if (u.path) moveAlong(u);
    else if (u.state === 'amove' && u.goal && ((u.x | 0) !== u.goal.x || (u.y | 0) !== u.goal.y) && (frame + u.id) % 10 === 0) { setPath(u, u.goal.x, u.goal.y); if (!u.path) u.state = 'idle'; }
    else if (u.state !== 'idle' && u.state !== 'amove') { u.state = 'idle'; u.chase = null; }
    else if (u.state === 'amove' && !u.path && u.goal && (u.x | 0) === u.goal.x && (u.y | 0) === u.goal.y) u.state = 'idle';
  }
  if (d.mach && !u.hacked && !u.online && frame % 20 === (u.id % 20)) { const px = isoX(u.x, u.y), py = isoY(u.x, u.y) - d.hh * .6; part({ x: px, y: py, vx: (Math.random() - .5) * 2, vy: -1, t: 'spark', life: 10, c: '#ff4050' }); }
  if (u.vet >= 1 && u.hp < u.max && frame % 60 === 0) u.hp = Math.min(u.max, u.hp + 1);
}
function findOre(u) {
  const sx = u.x | 0, sy = u.y | 0, Q = new Int32Array(MW * MH), V = new Uint8Array(MW * MH); let h = 0, t = 0, n = 0;
  const s = idx(sx, sy); Q[t++] = s; V[s] = 1;
  const claimed = new Set(ents.filter(e => e.d.harv && e !== u && !e.dead && e.oreT !== undefined).map(e => e.oreT));
  while (h < t && n++ < 3200) {
    const c = Q[h++]; if (ore[c] > 40 && !bmap[c] && !claimed.has(c)) return c;
    const x = c % MW, y = c / MW | 0;
    for (let k = 0; k < 8; k++) { const nx = x + DX[k], ny = y + DY[k]; if (!inb(nx, ny)) continue; const m = idx(nx, ny); if (V[m]) continue; V[m] = 1; if (terr[m] !== 0 || bmap[m]) continue; Q[t++] = m; }
  }
  return -1;
}
function updHarv(u) {
  const tx = u.x | 0, ty = u.y | 0;
  switch (u.hs) {
    case 'manual': if (!u.path) u.hs = 'seek'; break;
    case 'seek': {
      if (u.load >= HCAP) { u.hs = 'ret'; break; }
      if ((frame + u.id) % 20) break;
      const c = findOre(u); if (c < 0) break; u.oreT = c;
      if (c === idx(tx, ty)) { u.hs = 'mine'; break; }
      setPath(u, c % MW, c / MW | 0); u.hs = u.path ? 'go' : 'seek'; break;
    }
    case 'go': if (!u.path) u.hs = 'mine'; break;
    case 'mine': {
      const i = idx(tx, ty); if (ore[i] <= 0) { u.hs = 'seek'; u.oreT = undefined; break; }
      if (frame % 5 === 0) { const a = Math.min(10, ore[i], HCAP - u.load); ore[i] -= a; u.load += a; if (Math.random() < .5) part({ x: isoX(u.x, u.y) + (Math.random() - .5) * 20, y: isoY(u.x, u.y) - 6, vx: (Math.random() - .5), vy: -1.2, g: .08, t: 'spark', life: 14, c: '#7ff0ff' }); }
      u.dir += Math.sin(frame * .08) * .01;
      if (u.load >= HCAP) { u.hs = 'ret'; u.oreT = undefined; } break;
    }
    case 'ret': {
      if ((frame + u.id) % 15) break;
      let best = null, bd = 1e9; for (const e of ents) if (e.d.ref && e.team === u.team && !e.dead && e.built >= 1) { const dd = Math.hypot(e.x - u.x, e.y - u.y); if (dd < bd) { bd = dd; best = e; } }
      if (!best) break; u.ref = best; const dx = best.tx + 1, dy = best.ty + 2;
      if (tx === dx && ty === dy) { u.hs = 'unload'; break; }
      setPath(u, dx, dy); u.hs = 'toRef'; break;
    }
    case 'toRef': if (u.ref.dead) { u.hs = 'ret'; break; } if (!u.path) u.hs = (tx === u.ref.tx + 1 && ty === u.ref.ty + 2) ? 'unload' : 'ret'; break;
    case 'unload': {
      if (u.ref.dead) { u.hs = 'ret'; break; }
      u.dir = turn(u.dir, -Math.PI / 2, .1);
      if (frame % 3 === 0) { const a = Math.min(10, u.load); u.load -= a; if (u.team === 0) { const g = hasU('eco') ? Math.round(a * 1.2) : a; credits += g; stats.harv += g; } else AI.credits += a; }
      if (u.load <= 0) u.hs = 'seek'; break;
    }
  }
  moveAlong(u);
}

// ================= GEBÄUDE =================
function updBuild(b) {
  if (b.built < 1) { b.built = Math.min(1, b.built + 1 / 70); return; }
  if (b.d.neutral) { updNeutral(b); return; }
  const d = b.d; if (b.flash > 0) b.flash--;
  if (b.repair) { if (b.hp >= b.max) b.repair = false; else if (frame % 8 === 0 && credits >= 3) { b.hp = Math.min(b.max, b.hp + 8); credits -= 3; if (frame % 24 === 0) part({ x: isoX(b.x, b.y) + (Math.random() - .5) * 30, y: isoY(b.x, b.y) - 30, vy: -.8, t: 'spark', life: 16, c: '#7dff9a' }); } }
  if (b.hp < b.max * .5 && frame % 7 === b.id % 7) part({ x: isoX(b.tx + Math.random() * b.w, b.ty + Math.random() * b.h), y: isoY(b.tx + Math.random() * b.w, b.ty + Math.random() * b.h) - 20 - Math.random() * 20, vx: .3, vy: -.6, r: 4, life: 70, t: 'smoke' });
  if (b.hp < b.max * .25 && frame % 5 === 0) part({ x: isoX(b.tx + Math.random() * b.w, b.ty + Math.random() * b.h), y: isoY(b.tx + Math.random() * b.w, b.ty + Math.random() * b.h) - 16, vy: -.8, r: 4, life: 18, t: 'fire' });
  if (d.sw) updSWB(b);
  if (b.stun > frame) { if (frame % 8 === b.id % 8) part({ x: isoX(b.x, b.y) + (Math.random() - .5) * 30, y: isoY(b.x, b.y) - 20 - Math.random() * 30, vx: (Math.random() - .5) * 2, vy: -1, t: 'spark', life: 12, c: '#7fdcff' }); return; }
  if (b.type === 'factory' && frame % 14 === 0 && b.team === 0) part({ x: isoX(b.tx + 2.55, b.ty + .45), y: isoY(b.tx + 2.55, b.ty + .45) - 54, vx: .25, vy: -.5, r: 3, life: 80, t: 'smoke' });
  if (d.rng) {
    if (b.team === 0 && powerLow) return;
    if (b.cd > 0) b.cd--;
    if (b.target && (b.target.dead || distTo(b, b.target) > d.rng || b.target.team === b.team)) b.target = null;
    if (!b.target && (frame + b.id) % 10 === 0) b.target = findTarget(b, d.rng);
    if (b.target) { const ap = aimPt(b.target, b), a = Math.atan2(ap.y - b.y, ap.x - b.x); b.ang = turn(b.ang, a, .15); if (b.cd <= 0 && Math.abs(angDiff(b.ang, a)) < .25) { fire(b, b.target); b.cd = d.rof; } }
  }
}
function calcPower() {
  let p = 0, u = 0; for (const e of ents) if (e.kind === 'b' && e.team === 0 && !e.dead) { const v = e.d.pw || 0; if (v > 0) p += v; else u -= v; }
  const was = powerLow; pwP = p; pwU = u; powerLow = u > p; if (powerLow && !was && running) { speak('Niedrige Energie'); msg(facOf(0).short + ' ▸ Niedrige Energie – baue ein Kraftwerk!', '#ffd34a'); }
}
function updNet() {
  const nodes = ents.filter(e => !e.dead && e.d.net);
  for (const e of ents) if (e.kind === 'u' && e.d.mach && !e.hacked && !e.ttl && !e.nonet) {
    const was = e.online; e.online = nodes.some(n => n.team === e.team && Math.hypot(n.x - e.x, n.y - e.y) <= n.d.net);
    if (was && !e.online && frame - (updNet.lastMsg || 0) > 600) { updNet.lastMsg = frame; if (e.team !== 0 && isVis(e)) msg(facOf(0).short + ' ▸ Feindmaschinen außerhalb des Netzes – sie sind OFFLINE und langsam!', '#ffc64a'); else if (e.team === 0) msg('AXIOM ▸ Einheiten außerhalb des Datennetzes. Baue Relais!', '#ffc64a'); }
  }
}

// ================= PRODUKTION =================
function ownTypes() { return new Set(ents.filter(e => e.kind === 'b' && e.team === 0 && !e.dead && e.built >= 1).map(e => e.type)); }
const avail = (type, isB, own = ownTypes()) => ((isB ? BD : UD)[type].req || []).every(r => own.has(r));
function clickProd(type, isB) {
  if (!running || gameOver) return; snd('click');
  if (isB) {
    if (prod.bld) { if (prod.bld.type === type && prod.bld.ready) { placing = type; amoveMode = false; msg(facOf(0).short + ' ▸ Bauplatz wählen.', '#7fffd4'); } return; }
    if (!avail(type, true)) return;
    const d = BD[type];
    if (d.sw && ents.some(e => e.team === 0 && !e.dead && e.d.sw)) { msg(facOf(0).short + ' ▸ Nur eine Superwaffe pro Basis erlaubt.', '#ffc64a'); return; } if (credits < d.cost) { speak('Nicht genug Credits'); msg(facOf(0).short + ' ▸ Nicht genug Credits.', '#ff8a8a'); return; }
    credits -= d.cost; prod.bld = { type, p: 0, t: d.t, ready: false }; return;
  }
  if (!avail(type, false)) return;
  const d = UD[type]; if (credits < d.cost) { speak('Nicht genug Credits'); msg(facOf(0).short + ' ▸ Nicht genug Credits.', '#ff8a8a'); return; }
  const q = queues[d.cat]; if (q.length >= 9) return; credits -= d.cost; q.push({ type, p: 0, t: d.t });
}
function cancelProd(type, isB) {
  if (isB) { if (prod.bld && prod.bld.type === type) { credits += BD[type].cost; prod.bld = null; if (placing === type) placing = null; msg(facOf(0).short + ' ▸ Bau abgebrochen.'); } return; }
  const q = queues[UD[type].cat]; for (let i = q.length - 1; i >= 0; i--) if (q[i].type === type) { q.splice(i, 1); credits += UD[type].cost; break; }
}
function updProd() {
  const sp = (powerLow ? .35 : 1) * (hasU('build') ? 1.18 : 1);
  if (prod.bld && !prod.bld.ready) { prod.bld.p += sp; if (prod.bld.p >= prod.bld.t) { prod.bld.ready = true; speak('Bau abgeschlossen'); snd('ready'); msg(facOf(0).short + ' ▸ ' + BD[prod.bld.type].n + ' bereit – in der Leiste antippen und platzieren.', '#7fffd4'); } }
  const own = ownTypes();
  for (const cat of ['inf', 'veh']) {
    const q = queues[cat]; if (!q.length) continue; const it = q[0];
    if (!avail(it.type, false, own)) continue;
    it.p += sp; if (it.p >= it.t && spawnUnit(it.type)) { q.shift(); speak('Einheit bereit'); }
  }
}
function spawnUnit(type) {
  const F = FAC[UD[type].fac] || facOf(0), pt = UD[type].cat === 'inf' ? F.inf : F.veh;
  const src = ents.find(e => e.kind === 'b' && e.team === 0 && !e.dead && e.built >= 1 && e.type === pt); if (!src) return false;
  const ex = nearestFree(src.tx + (src.w / 2 | 0), src.ty + src.h, 6); if (!ex) return false;
  const u = mkUnit(type, 0, ex.x, ex.y);
  if (hasU('vet') && !UD[type].harv) u.vet = 1;
  if (UD[type].harv) u.hs = 'seek'; else { const r = nearestFree(ex.x + 1, ex.y + 2, 4); if (r) { u.state = 'move'; setPath(u, r.x, r.y); } }
  return true;
}
function canPlace(type, tx, ty) {
  const d = BD[type];
  for (let y = ty; y < ty + d.h; y++) for (let x = tx; x < tx + d.w; x++) { if (!inb(x, y)) return false; const i = idx(x, y); if (terr[i] || ore[i] > 0 || bmap[i] || !seen[i]) return false; }
  for (const e of ents) if (e.kind === 'u' && !e.dead && !e.d.fly && e.x >= tx - .2 && e.x <= tx + d.w + .2 && e.y >= ty - .2 && e.y <= ty + d.h + .2) return false;
  return ents.some(e => e.kind === 'b' && e.team === 0 && !e.dead && Math.max(e.tx - (tx + d.w), tx - (e.tx + e.w), 0) <= 4 && Math.max(e.ty - (ty + d.h), ty - (e.ty + e.h), 0) <= 4);
}
function ghostPos(type, wx, wy) { const d = BD[type], t = unIso(wx, wy); return { x: Math.round(t.x - d.w / 2), y: Math.round(t.y - d.h / 2) }; }
function tryPlace() {
  if (!placing || !ghost) return;
  if (!canPlace(placing, ghost.x, ghost.y)) { speak('Ungültige Position'); msg(facOf(0).short + ' ▸ Hier kann nicht gebaut werden (zu weit weg oder blockiert).', '#ff8a8a'); return; }
  const type = placing; mkBuild(type, 0, ghost.x, ghost.y, true); prod.bld = null; placing = null; ghost = null; snd('place'); calcPower();
  if (BD[type].ref) { const b = ents[ents.length - 1]; timers.push({ f: frame + 75, fn: () => { if (!b.dead) { const u = mkUnit(facOf(0).harv, 0, b.tx + 1, b.ty + 2); u.hs = 'seek'; } } }); }
}

// ================= SUPERWAFFEN =================
const swOf = team => ents.find(e => e.team === team && !e.dead && e.kind === 'b' && e.d.sw && e.built >= 1);
const swMax = b => Math.round(SWD[b.d.sw].charge * (b.team === 1 ? [1.5, 1.15, .9][diff] : 1));
const fmtT = f => { const s = Math.max(0, Math.ceil(f / 60)); return String(s / 60 | 0).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
function updSWB(b) {
  if (b.swP === undefined) { b.swP = 0; const S = SWD[b.d.sw]; if (b.team === 1) { msg(facOf(1).leader + ' ▸ ' + S.n + ' wird aufgeladen! Zerstöre die ' + b.d.n + '!', '#ff6b75'); snd('alarm'); ping(b.x, b.y); } }
  const mx = swMax(b); if (b.swP >= mx || b.stun > frame) return;
  b.swP += (b.team === 0 && powerLow ? .3 : 1) * (b.team === 0 && hasU('sw') ? 1.25 : 1);
  if (b.swP >= mx) { b.swP = mx; const S = SWD[b.d.sw];
    if (b.team === 0) { snd('ready'); msg(facOf(0).short + ' ▸ ' + S.n + ' BEREIT! Superwaffen-Knopf rechts oben antippen, dann Ziel wählen.', S.hex); }
    else { snd('alarm'); msg(facOf(1).leader + ' ▸ ' + S.n + ' ist feuerbereit. Achtung!', '#ff6b75'); } }
}
function swScore(team, kind, x, y, r) {
  let v = 0; for (const e of ents) { if (e.dead || e.team === team) continue; if (Math.hypot(e.x - x, e.y - y) > r) continue;
    if (kind === 'mind' && e.kind !== 'u') continue; if (kind === 'emp' && !(e.kind === 'u' ? (e.d.mach || e.d.arm === 'veh' || e.d.fly) : !!e.d.rng)) continue;
    v += e.kind === 'b' ? (e.d.hq ? 3000 : e.d.cost || 800) : (e.d.cost || 300); }
  return v;
}
function bestSWTarget(team, kind, r) {
  let best = null, bv = 0; for (const e of ents) if (!e.dead && e.team !== team && (e.team === 0 || team === 0)) { if (e.kind === 'b' ? !seenB(e) && team === 0 : false) continue; const v = swScore(team, kind, e.x, e.y, r); if (v > bv) { bv = v; best = { x: e.x, y: e.y, v }; } }
  return best;
}
function launchSW(team, x, y) {
  const b = swOf(team); if (!b || b.swP < swMax(b)) return false;
  const kind = b.d.sw, S = SWD[kind]; b.swP = 0; if (team === 0) stats.sw++; x = clamp(x, 1, MW - 2); y = clamp(y, 1, MH - 2);
  let tx = x, ty = y, F = 150, misfire = false;
  if (kind === 'emp') F = 70; else if (kind === 'mind') F = 100; else if (kind === 'kin') F = 170;
  else if (kind === 'nuke') { F = 200; if (Math.random() < .22) { misfire = true; const a = Math.random() * TAU, d = 2 + Math.random() * 2.5; tx = clamp(x + Math.cos(a) * d, 1, MW - 2); ty = clamp(y + Math.sin(a) * d, 1, MH - 2); } }
  strikes.push({ kind, team, x: tx, y: ty, aimX: x, aimY: y, sx: b.x, sy: b.y, t0: frame, F, misfire, r: S.r });
  const who = team === 0 ? facOf(0).short : facOf(1).leader;
  msg(who + ' ▸ ' + S.n + ' abgefeuert!', team === 0 ? S.hex : '#ff6b75');
  if (team === 1) { ping(x, y); speak('Unsere Basis wird angegriffen', true); msg('WARNUNG ▸ ' + S.n + ' im Anflug – Einheiten aus dem roten Kreis!', '#ff6b75'); }
  snd(kind === 'nuke' ? 'rocket' : 'alarm', b.x, b.y);
  if (kind === 'nuke') for (let i = 0; i < 26; i++) part({ x: isoX(b.x, b.y) + (Math.random() - .5) * 40, y: isoY(b.x, b.y) - Math.random() * 10, vx: (Math.random() - .5) * 1.6, vy: -.3 - Math.random() * .6, t: 'smoke', r: 6 + Math.random() * 6, life: 90 + Math.random() * 60 });
  return true;
}
function hitArea(st, fn) { for (const e of ents) if (!e.dead && Math.hypot(e.x - st.x, e.y - st.y) <= st.r + (e.kind === 'b' ? e.w * .4 : 0)) fn(e, Math.hypot(e.x - st.x, e.y - st.y) / st.r); }
function impactSW(st) {
  const px = isoX(st.x, st.y), py = isoY(st.x, st.y), S = SWD[st.kind];
  if (st.kind === 'emp') {
    let n = 0; hitArea(st, e => { if (e.team === st.team) return; if (e.kind === 'u' ? (e.d.mach || e.d.arm === 'veh' || e.d.fly) : true) { e.stun = frame + 1200; n++; if (e.kind === 'u') { e.target = null; e.path = null; e.hp -= e.max * .08; if (e.hp <= 0) kill(e, null); } } });
    for (let i = 0; i < 4; i++) part({ x: px, y: py, t: 'ring', r: 18 + i * 22, life: 34 + i * 6, c: S.col });
    for (let i = 0; i < 60; i++) { const a = Math.random() * TAU, v = 2 + Math.random() * 6; part({ x: px, y: py - 10, vx: Math.cos(a) * v, vy: Math.sin(a) * v * .5, t: 'spark', life: 20 + Math.random() * 20, c: '#bdf0ff' }); }
    flashW = .35; shake = Math.max(shake, 8); snd('slow'); snd('hack');
    msg(S.short + ' ▸ ' + n + ' Ziele gelähmt (20 s).', S.hex);
  } else if (st.kind === 'kin' || st.kind === 'nuke') {
    const nuke = st.kind === 'nuke', base = nuke ? 1700 : 1300;
    hitArea(st, (e, f) => { if (!nuke && e.team === st.team) return; const dm = base * (1 - f * .65) * (e.kind === 'b' ? (e.d.hq ? .45 : 1.25) : 1) * (nuke && e.team === st.team ? .6 : 1); e.hp -= dm; if (e.hp <= 0) kill(e, null); });
    explode(px, py - 10, nuke ? 3.6 : 3);
    for (let i = 0; i < (nuke ? 9 : 5); i++) timers.push({ f: frame + 4 + i * 5, fn: () => { const a = Math.random() * TAU, d = Math.random() * st.r * .8; explode(isoX(st.x + Math.cos(a) * d, st.y + Math.sin(a) * d), isoY(st.x + Math.cos(a) * d, st.y + Math.sin(a) * d) - 8, 1.4 + Math.random()); } });
    for (let i = 0; i < 5; i++) part({ x: px, y: py, t: 'ring', r: 24 + i * 26, life: 30 + i * 8, c: nuke ? '255,190,110' : '255,240,230' });
    for (let i = 0; i < 26; i++) scorch(px + (Math.random() - .5) * st.r * 60, py + (Math.random() - .5) * st.r * 30, 30 + Math.random() * 40);
    if (nuke) { for (let i = 0; i < 70; i++) part({ x: px + (Math.random() - .5) * 30, y: py - Math.random() * 20, vx: (Math.random() - .5) * .8, vy: -1.2 - Math.random() * 2.4, t: i % 3 ? 'fire' : 'smoke', r: 8 + Math.random() * 10, life: 60 + Math.random() * 70 });
      for (let i = 0; i < 30; i++) { const a = Math.random() * TAU; part({ x: px, y: py - 150 - Math.random() * 40, vx: Math.cos(a) * (1 + Math.random() * 1.5), vy: Math.sin(a) * .5 - .2, t: 'smoke', r: 14 + Math.random() * 12, life: 160 + Math.random() * 80 }); part({ x: px + Math.cos(a) * 20, y: py - 140 - Math.random() * 30, vx: Math.cos(a) * .8, vy: -.2, t: 'fire', r: 10 + Math.random() * 8, life: 50 + Math.random() * 40 }); } }
    flashW = nuke ? 1 : .8; shake = nuke ? 40 : 30; snd('boom'); timers.push({ f: frame + 8, fn: () => snd('cannon') });
    if (st.misfire) msg('SCHROTT ▸ Die Rakete ist abgeschmiert – daneben eingeschlagen!', '#ffc64a');
    calcPower();
  } else if (st.kind === 'mind') {
    let n = 0; hitArea(st, e => { if (e.kind !== 'u' || e.team === st.team || e.d.hero) return; if (!e.tconv) e.tconv = { team: e.team, conv: !!e.converted }; e.tconv.until = frame + 900; e.team = st.team; e.converted = true; e.target = null; e.path = null; e.state = 'idle'; e.wave = st.team === 1; e.stun = 0; for (const o of ents) if (o.target === e) o.target = null; n++;
      if (st.team === 1) { sel.delete(e); const tg = pickTarget(); if (tg) orderAI(e, tg); } });
    for (let i = 0; i < 3; i++) part({ x: px, y: py, t: 'ring', r: 20 + i * 30, life: 40, c: S.col });
    for (let i = 0; i < 50; i++) { const a = Math.random() * TAU, v = 1 + Math.random() * 4; part({ x: px, y: py - 20, vx: Math.cos(a) * v, vy: Math.sin(a) * v * .5 - 1, t: 'spark', life: 26 + Math.random() * 20, c: '#e2c4ff' }); }
    flashW = .3; snd('hack');
    msg(S.short + ' ▸ ' + n + ' Einheiten laufen 15 s über!', st.team === 0 ? S.hex : '#ff6b75');
  }
}
function updStrikes() {
  for (const st of strikes) {
    const k = (frame - st.t0) / st.F;
    if (st.kind === 'mind' && frame % 2 === 0) { const a = Math.random() * TAU, R = st.r * 32 * (1 - k * .6); part({ x: isoX(st.x, st.y) + Math.cos(a) * R, y: isoY(st.x, st.y) + Math.sin(a) * R * .5 - 10, vx: -Math.cos(a) * 1.6 - Math.sin(a), vy: -Math.sin(a) * .8 - .4, t: 'spark', life: 20, c: '#c27bff' }); }
    if (st.kind === 'emp' && frame % 3 === 0) part({ x: isoX(st.x, st.y) + (Math.random() - .5) * 20, y: isoY(st.x, st.y) - Math.random() * 300, vy: 3, t: 'spark', life: 12, c: '#9fe6ff' });
    if (st.kind === 'nuke' && k < 1 && frame % 2 === 0) { const p = nukePos(st, k); part({ x: p.px, y: p.py, t: 'smoke', r: 4, life: 60, vy: -.1 }); part({ x: p.px, y: p.py, t: 'fire', r: 4, life: 10 }); }
    if (k >= 1) { st.done = true; impactSW(st); }
  }
  strikes = strikes.filter(s => !s.done);
  // Gedankensturm läuft ab
  if (frame % 15 === 0) for (const e of ents) if (e.tconv && !e.dead && frame >= e.tconv.until) { e.team = e.tconv.team; e.converted = e.tconv.conv; e.tconv = null; e.target = null; e.path = null; e.state = 'idle'; e.wave = e.team === 1; sel.delete(e); for (const o of ents) if (o.target === e) o.target = null; part({ x: isoX(e.x, e.y), y: isoY(e.x, e.y) - 20, t: 'ring', r: 8, life: 20, c: '194,123,255' }); }
  if (flashW > 0) flashW = Math.max(0, flashW - .025);
}
function nukePos(st, k) {
  const x = st.sx + (st.x - st.sx) * k, y = st.sy + (st.y - st.sy) * k, h = Math.sin(Math.PI * k) * 620 + (1 - k) * 30;
  return { px: isoX(x, y), py: isoY(x, y) - h, x, y };
}
function drawStrikes() {
  for (const st of strikes) {
    const k = (frame - st.t0) / st.F, px = isoX(st.x, st.y), py = isoY(st.x, st.y), S = SWD[st.kind], R = st.r * TW / Math.SQRT2;
    const rx = isoX(st.aimX, st.aimY), ry = isoY(st.aimX, st.aimY);
    ctx.strokeStyle = `rgba(${S.col},${.5 + .4 * Math.sin(frame * .4)})`; ctx.lineWidth = 2; ctx.setLineDash([10, 6]); ctx.lineDashOffset = -frame;
    ctx.beginPath(); ctx.ellipse(rx, ry, R, R / 2, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(rx - 14, ry); ctx.lineTo(rx + 14, ry); ctx.moveTo(rx, ry - 7); ctx.lineTo(rx, ry + 7); ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    if (st.kind === 'kin') { const a = Math.min(1, k * 1.4); ctx.strokeStyle = `rgba(255,40,40,${a * .8})`; ctx.lineWidth = 1 + k * 2; ctx.beginPath(); ctx.moveTo(px, py - 900); ctx.lineTo(px, py); ctx.stroke(); glowAt(px, py, 20 + k * 30, '255,50,50', a);
      if (k > .9) { ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(px, py - 900 * (1 - (k - .9) * 10)); ctx.lineTo(px, py); ctx.stroke(); glowAt(px, py, 90, '255,240,220', 1); } }
    else if (st.kind === 'emp') { const a = Math.min(1, k * 1.3); ctx.fillStyle = `rgba(80,200,255,${a * .25})`; ctx.fillRect(px - 6 - k * 22, py - 900, 12 + k * 44, 900); glowAt(px, py, 30 + k * 60, S.col, a); }
    else if (st.kind === 'mind') { for (let i = 0; i < 3; i++) { const r = R * (1 - ((k + i / 3) % 1)); ctx.strokeStyle = `rgba(${S.col},${.6})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(px, py, r, r / 2, frame * .02, 0, TAU); ctx.stroke(); } glowAt(px, py - 20, 40 + k * 40, S.col, .8); }
    else if (st.kind === 'nuke' && k < 1) { const p = nukePos(st, k), p2 = nukePos(st, Math.min(1, k + .02)), ang = Math.atan2(p2.py - p.py, p2.px - p.px);
      ctx.save(); ctx.translate(p.px, p.py); ctx.rotate(ang); ctx.fillStyle = '#c8b8a0'; ctx.fillRect(-9, -2.5, 18, 5); ctx.fillStyle = '#ff9a2a'; ctx.fillRect(6, -2.5, 4, 5); ctx.restore(); glowAt(p.px - Math.cos(ang) * 10, p.py - Math.sin(ang) * 10, 16, '255,170,60', 1); }
    ctx.globalCompositeOperation = 'source-over';
  }
  // Ziel-Vorschau beim Zielen
  if (swAim && mouse.in) { const b = swOf(0); if (b) { const w = s2w(mouse.x, mouse.y), t = unIso(w.x, w.y), S = SWD[b.d.sw], R = S.r * TW / Math.SQRT2, px = isoX(t.x, t.y), py = isoY(t.x, t.y);
    ctx.fillStyle = `rgba(${S.col},.12)`; ctx.strokeStyle = S.hex; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(px, py, R, R / 2, 0, 0, TAU); ctx.fill(); ctx.stroke(); } }
}
function aiSW() {
  const b = swOf(1); if (!b || b.swP < swMax(b) || frame < swAI.wait) return;
  const t = bestSWTarget(1, b.d.sw, SWD[b.d.sw].r); swAI.wait = frame + 300;
  if (!t) return; b.aiHold = (b.aiHold || 0) + 1;
  if (t.v >= (b.d.sw === 'mind' ? 1200 : 2500) || b.aiHold > 10) { b.aiHold = 0; launchSW(1, t.x + (Math.random() - .5), t.y + (Math.random() - .5)); }
}
function aimSW() {
  const b = swOf(0); if (!b) return;
  if (b.swP < swMax(b)) { msg(facOf(0).short + ' ▸ ' + SWD[b.d.sw].n + ' lädt noch (' + fmtT(swMax(b) - b.swP) + ').', SWD[b.d.sw].hex); return; }
  swAim = !swAim; placing = null; amoveMode = false;
}

// ================= KI (AXIOM) =================
function playerComp() {
  let inf = 0, veh = 0, tur = 0; for (const e of ents) if (e.team === 0 && !e.dead) { if (e.kind === 'u' && !e.d.harv) { if (e.d.arm === 'veh') veh++; else inf++; } else if (e.kind === 'b' && e.d.rng) tur++; }
  const tot = inf + veh || 1; return { inf, veh, tur, vs: veh / tot, is: inf / tot };
}
function pickTarget() {
  let best = null, bd = 1e9; for (const e of ents) if (e.team === 0 && !e.dead && e.kind === 'b') { const dd = Math.hypot(e.x - EB.x, e.y - EB.y) + Math.random() * 14; if (dd < bd) { bd = dd; best = e; } }
  return best;
}
function orderAI(u, t) { const gx = t.x | 0, gy = t.y | 0; u.state = 'amove'; u.goal = { x: gx, y: gy }; setPath(u, gx, gy); if (!u.path) u.state = 'idle'; }
const enemyFacs = () => [EF, ...((MISSION && MISSION.enemy.mix) || [])];
function spawnWave() {
  AI.wave++; const w = AI.wave, m = DIFF[diff].mul, pc = playerComp(), F = facOf(1), R = F.role;
  let budget = (3 + w * 2.1) * m, wt, info;
  if (!MISSION && AI.credits > 1500) { const extra = Math.min(6, AI.credits / 500 | 0); budget += extra; AI.credits -= extra * 500; }
  if (pc.vs > .5 && pc.veh >= 3) { wt = { at: .45, heavy: .35, inf: .2 }; info = `${Math.round(pc.vs * 100)} % Fahrzeuge erkannt – Gegenmaßnahme: ${UD[R.at].n} und ${UD[R.heavy].n}.`; }
  else if (pc.is > .6 && pc.inf >= 5) { wt = { heavy: .4, inf: .35, fast: .25 }; info = `${Math.round(pc.is * 100)} % Infanterie erkannt – Gegenmaßnahme: ${UD[R.heavy].n}.`; }
  else if (pc.tur >= 3) { wt = { heavy: .5, inf: .3, at: .2 }; info = `${pc.tur} Abwehrtürme erkannt – Gegenmaßnahme: schwere Einheiten.`; }
  else { wt = { inf: .55, fast: .25, at: .1, heavy: .1 }; info = null; }
  if (w < 3) { wt = { inf: .8, fast: .2 }; info = null; }
  const cost = { inf: 1, fast: 1.5, at: 1.5, heavy: 5 }, comp = [];
  while (budget >= 1 && comp.length < 30) { let r = Math.random(), k = 'inf'; for (const [t, pp] of Object.entries(wt)) { if ((r -= pp) <= 0) { k = t; break; } } if (cost[k] > budget) k = 'inf'; const fx = enemyFacs()[Math.random() * enemyFacs().length | 0]; comp.push(FAC[fx].role[k]); budget -= cost[k]; }
  const prods = ents.filter(e => e.team === 1 && !e.dead && (e.type === F.inf || e.type === F.veh)), S = prods.length ? prods : ents.filter(e => e.team === 1 && e.d.hq && !e.dead);
  if (!S.length) return;
  const tgt = pickTarget(); let i = 0;
  for (const type of comp) { const Fx = FAC[UD[type].fac], own = ents.filter(e => e.team === 1 && !e.dead && (e.type === Fx.inf || e.type === Fx.veh || e.type === Fx.hq)), s = own.length ? own[i++ % own.length] : S[i++ % S.length], p = nearestFree(s.tx + 1, s.ty + s.h, 8); if (!p) continue; const u = mkUnit(type, 1, p.x, p.y); u.wave = true; if (tgt) orderAI(u, tgt); }
  const eh = heroOf(1); if (eh && w >= 3 && !eh.wave && tgt) { eh.wave = true; orderAI(eh, tgt); msg(F.leader + ' ▸ ' + eh.d.n + ' führt den Angriff persönlich!', F.col); }
  const who = F.leader, tl = F.taunts; msg(who + ' ▸ ' + tl[(w - 1) % tl.length], F.col); if (info) msg(who + ' ▸ ' + info, F.col);
  speak(info ? 'Achtung. AXIOM hat sich an unsere Taktik angepasst' : 'Feindliche Maschinen im Anmarsch'); snd('alarm');
  updNet();
}
// Gegner-Basis: erntet, erweitert, baut Zerstörtes wieder auf (nur Gefecht)
function aiFree(t, x, y) { const d = BD[t]; for (let yy = y; yy < y + d.h; yy++) for (let xx = x; xx < x + d.w; xx++) if (!inb(xx, yy) || bmap[idx(xx, yy)]) return false; return !ents.some(e => e.kind === 'u' && !e.dead && !e.d.fly && e.x >= x - .2 && e.x <= x + d.w + .2 && e.y >= y - .2 && e.y <= y + d.h + .2); }
function aiBuild() {
  const F = facOf(1); if (!ents.some(e => e.team === 1 && e.d.hq && !e.dead)) return;
  const refs = ents.filter(e => e.team === 1 && !e.dead && e.d.ref && e.built >= 1), hv = ents.filter(e => e.team === 1 && !e.dead && e.type === F.harv).length, hc = UD[F.harv].cost * .6 | 0;
  if (refs.length && hv < Math.min(3, refs.length + 1) && AI.credits >= hc) { const r = refs[0], q = nearestFree(r.tx + 1, r.ty + r.h + 1, 5); if (q) { AI.credits -= hc; const u = mkUnit(F.harv, 1, q.x, q.y); u.hs = 'seek'; return; } }
  for (const sl of AI.slots) {
    if (sl.t === F.hq) continue; const B = BD[sl.t], here = bmap[idx(sl.x, sl.y)];
    if (here) continue; if (B.sw && (diff === 0 || ents.some(e => e.team === 1 && !e.dead && e.d.sw))) continue;
    const cost = B.cost || 800; if (AI.credits < cost) return; if (!aiFree(sl.t, sl.x, sl.y)) continue;
    AI.credits -= cost; mkBuild(sl.t, 1, sl.x, sl.y, true); if (sl.built) msg(F.leader + ' ▸ ' + B.n + ' wird wieder aufgebaut.', F.col); sl.built = 1; return;
  }
}
function updAI() {
  AI.timer--; if (AI.timer <= 0 && !(MISSION && MISSION.waves.max && AI.wave >= MISSION.waves.max)) { spawnWave(); AI.timer = Math.max(1800, DIFF[diff].int - AI.wave * 90); }
  if (frame % 240 === 0) { const tgt = pickTarget(); if (tgt) for (const e of ents) if (e.team === 1 && e.kind === 'u' && e.wave && e.state === 'idle' && !e.target && !e.dead) orderAI(e, tgt); }
  if (frame % 2400 === 0) {
    const def = ents.filter(e => e.team === 1 && e.kind === 'u' && !e.wave && !e.dead).length;
    const F = facOf(1), f = ents.find(e => e.team === 1 && (e.type === F.inf || e.type === F.veh) && !e.dead);
    if (f && def < 6) { const p = nearestFree(f.tx + 1, f.ty + f.h, 6); if (p) mkUnit(Math.random() < .25 ? F.role.heavy : F.role.inf, 1, p.x, p.y); }
  }
  if (frame % 30 === 0) updNet();
  if (frame % 30 === 7) aiSW();
  if (frame % 1800 === 900) { const nb = ents.filter(e => e.d.neutral && e.team !== 1 && !e.dead); if (nb.length) { const tg = nb.sort((a, b) => Math.hypot(a.x - EB.x, a.y - EB.y) - Math.hypot(b.x - EB.x, b.y - EB.y))[0]; const inf = ents.filter(e => e.team === 1 && e.kind === 'u' && !e.dead && !e.wave && e.d.cat === 'inf' && e.state === 'idle').slice(0, 2); for (const u of inf) { u.state = 'move'; setPath(u, tg.tx + (tg.w >> 1), tg.ty + tg.h); } } }
  if (!MISSION) { if (frame % 60 === 0) AI.credits += [4, 7, 10][diff]; if (frame % [900, 600, 420][diff] === 150) aiBuild(); }
}

// ================= HELDEN =================
// Je Seite ein Held mit 2 aktiven Fähigkeiten. Levelt über Abschüsse (vet → Stufe), kehrt nach dem Fall im Hauptquartier zurück.
const HAB = {
  h_voss: [
    { k: 'arty', n: 'Artillerieschlag', ic: '✸', cd: 45, aim: 'pt', r: 2.6, rng: 99, col: '255,170,60', info: '3 schwere Granaten auf ein Zielgebiet (beliebige Reichweite).' },
    { k: 'rally', n: 'Sammelruf', ic: '✚', cd: 60, r: 6, col: '125,255,154', info: 'Heilt Verbündete in der Nähe um 35 % und gibt ihnen 10 s +40 % Schaden.' }],
  h_brakk: [
    { k: 'bomb', n: 'Schrottbombe', ic: '✹', cd: 40, aim: 'pt', r: 2.3, rng: 7, col: '255,140,40', info: 'Wirft eine Bombe aus Altmetall: großer Flächenschaden, Feuer.' },
    { k: 'frenzy', n: 'Raserei', ic: '⚡', cd: 55, r: 6, col: '255,200,60', info: 'Brakk und Truppen in der Nähe: 10 s schneller und +60 % Feuerrate.' }],
  h_selene: [
    { k: 'conv', n: 'Bekehrung', ic: '◎', cd: 50, aim: 'unit', r: .8, rng: 6.5, col: '194,123,255', info: 'Eine feindliche Einheit (kein Held) läuft sofort dauerhaft über.' },
    { k: 'shield', n: 'Schild der Einheit', ic: '⛨', cd: 50, r: 5, col: '217,168,255', info: 'Verbündete in der Nähe nehmen 8 s lang 70 % weniger Schaden.' }],
  h_avatar: [
    { k: 'beam', n: 'Vernichtungsstrahl', ic: '━', cd: 45, aim: 'pt', r: .9, rng: 8, col: '255,50,60', info: 'Plasmastrahl brennt eine 8 Felder lange Schneise durch alles.' },
    { k: 'swarm', n: 'Drohnenschwarm', ic: '✈', cd: 70, r: 0, col: '255,80,90', info: 'Ruft 3 Jäger-Drohnen für 30 Sekunden herbei.' }],
};
const HERO = { u: [null, null], resp: [0, 0], vet: [0, 0], kills: [0, 0], type: [null, null] };
let hAim = null, hfx = [];
const heroOf = team => { const u = HERO.u[team]; return u && !u.dead ? u : null; };
const habMax = (u, i) => HAB[u.type][i].cd * 60 * (u.team === 0 && hasU('hero') ? .8 : 1);
function spawnHero(team, type, x, y) {
  const p = nearestFree(x, y, 6); if (!p) return null;
  const u = mkUnit(type, team, p.x, p.y); u.hcd = [600, 900]; u.vet = HERO.vet[team] || (team === 0 && hasU('hero') ? 1 : 0); u.kills = HERO.kills[team] || 0;
  HERO.u[team] = u; HERO.type[team] = type; HERO.resp[team] = 0;
  part({ x: isoX(u.x, u.y), y: isoY(u.x, u.y) - 16, t: 'ring', r: 14, life: 30, c: '255,214,90' });
  return u;
}
function heroDown(u) {
  const team = u.team, F = facOf(team); HERO.vet[team] = u.vet; HERO.kills[team] = u.kills; HERO.u[team] = null; if (team === 1) stats.eHero++;
  const noRet = MISSION && MISSION.noBase && team === 0;
  HERO.resp[team] = noRet ? -1 : frame + 45 * 60;
  if (team === 0) { msg(F.short + ' ▸ ' + u.d.n + ' ist gefallen!' + (noRet ? '' : ' Rückkehr in 45 s im Hauptquartier.'), '#ff8a8a'); speak('Held gefallen', true); }
  else { msg(F.leader + ' ▸ ' + u.d.n + ' zieht sich zurück – kommt in 45 s wieder!', '#ffc64a'); speak('Feindlicher Held ausgeschaltet'); }
  if (hAim && team === 0) hAim = null;
}
function updHeroes() {
  for (const team of [0, 1]) {
    if (HERO.resp[team] > 0 && frame >= HERO.resp[team] && frame % 30 === 0) {
      const hq = ents.find(e => e.team === team && e.kind === 'b' && e.d.hq && !e.dead); if (!hq) continue;
      const u = spawnHero(team, HERO.type[team], hq.tx + (hq.w >> 1), hq.ty + hq.h);
      if (u && team === 0) msg(facOf(0).short + ' ▸ ' + u.d.n + ' ist zurück auf dem Schlachtfeld!', '#ffd65a');
    }
  }
  hfx = hfx.filter(f => frame < f.until);
}
const alliesNear = (u, r) => ents.filter(e => e.kind === 'u' && !e.dead && e.team === u.team && Math.hypot(e.x - u.x, e.y - u.y) <= r);
const foesNear = (x, y, r, team) => ents.filter(e => !e.dead && e.team !== team && e.team !== 2 && Math.hypot(e.x - x, e.y - y) <= r + (e.kind === 'b' ? e.w * .4 : 0));
function areaDmg(src, x, y, r, dmg, w) { for (const e of foesNear(x, y, r, src.team)) { const f = Math.hypot(e.x - x, e.y - y) / (r + .01); applyDmg(e, dmg * (1 - Math.min(1, f) * .5), w, src); } }
// Fähigkeit auslösen (Spieler: über Leiste/Taste; KI: automatisch)
function heroCast(team, i, tx, ty, tgt) {
  const u = heroOf(team); if (!u) return false; const A = HAB[u.type][i];
  if (u.hcd[i] > 0) { if (team === 0) msg(facOf(0).short + ' ▸ ' + A.n + ' lädt noch (' + Math.ceil(u.hcd[i] / 60) + ' s).', '#ffd65a'); return false; }
  if (u.stun > frame) { if (team === 0) msg(facOf(0).short + ' ▸ ' + u.d.n + ' ist gelähmt!', '#7fdcff'); return false; }
  if (A.aim === 'unit') { if (!tgt || tgt.dead || tgt.kind !== 'u' || tgt.team === team || tgt.team === 2 || tgt.d.hero) { if (team === 0) msg(facOf(0).short + ' ▸ Ziel: eine feindliche Einheit (kein Held).', '#d9a8ff'); return false; } tx = tgt.x; ty = tgt.y; }
  if (A.aim) { const dd = Math.hypot(tx - u.x, ty - u.y); if (dd > A.rng) { u.cast = { i, x: tx, y: ty, t: tgt || null }; u.target = null; u.state = 'move'; setPath(u, clamp(tx | 0, 0, MW - 1), clamp(ty | 0, 0, MH - 1)); if (team === 0) msg(facOf(0).short + ' ▸ ' + u.d.n + ' rückt in Reichweite für ' + A.n + '.', '#ffd65a'); return true; } }
  doCast(u, i, tx, ty, tgt); return true;
}
function doCast(u, i, tx, ty, tgt) {
  const A = HAB[u.type][i], px = isoX(u.x, u.y), py = isoY(u.x, u.y); u.hcd[i] = habMax(u, i); u.cast = null; if (u.team === 0) stats.hab++;
  const say = (t) => msg((u.team === 0 ? facOf(0).short : facOf(1).leader) + ' ▸ ' + u.d.n + ': ' + t, u.team === 0 ? '#ffd65a' : '#ff8a8a');
  if (A.aim) u.dir = Math.atan2(ty - u.y, tx - u.x);
  switch (A.k) {
    case 'arty': {
      hfx.push({ x: tx, y: ty, r: A.r, col: A.col, until: frame + 110 }); say('„Artillerie, Feuer frei!“'); snd('alarm', tx, ty);
      for (let n = 0; n < 3; n++) timers.push({ f: frame + 50 + n * 18, fn: () => { const a = Math.random() * TAU, d = Math.random() * A.r * .7, x = tx + Math.cos(a) * d, y = ty + Math.sin(a) * d; explode(isoX(x, y), isoY(x, y) - 8, 2); scorch(isoX(x, y), isoY(x, y), 36); areaDmg(u, x, y, 1.6, 190, 'shell'); shake = Math.max(shake, 10); snd('boom', x, y); } });
      break; }
    case 'rally': {
      for (const e of alliesNear(u, A.r)) { e.hp = Math.min(e.max, e.hp + e.max * .35); e.dmgB = frame + 600; part({ x: isoX(e.x, e.y), y: isoY(e.x, e.y) - e.d.hh * .6, vy: -.7, t: 'txt', life: 50, s: '✚', c: '#7dff9a' }); }
      for (let k = 0; k < 3; k++) part({ x: px, y: py, t: 'ring', r: 20 + k * 30, life: 30 + k * 6, c: A.col }); say('„Haltet die Linie! Für Neu-Berlin!“'); snd('ready'); break; }
    case 'bomb': {
      say('„Fang!“'); hfx.push({ x: tx, y: ty, r: A.r, col: A.col, until: frame + 40 });
      projs.push({ x: u.x, y: u.y, h: u.d.hh, t: null, lx: tx, ly: ty, lh: 0, w: 'fire', dmg: 0, src: u, team: u.team, spd: .14, life: 200 });
      timers.push({ f: frame + Math.ceil(Math.hypot(tx - u.x, ty - u.y) / .14), fn: () => { explode(isoX(tx, ty), isoY(tx, ty) - 8, 2.6); areaDmg(u, tx, ty, A.r, 280, 'fire'); for (let n = 0; n < 24; n++) part({ x: isoX(tx, ty) + (Math.random() - .5) * 70, y: isoY(tx, ty) + (Math.random() - .5) * 30, vy: -.6 - Math.random(), t: 'fire', r: 4 + Math.random() * 4, life: 40 + Math.random() * 50 }); scorch(isoX(tx, ty), isoY(tx, ty), 50); shake = Math.max(shake, 12); snd('boom', tx, ty); } });
      break; }
    case 'frenzy': {
      for (const e of alliesNear(u, A.r)) { e.spdB = frame + 600; e.rofB = frame + 600; part({ x: isoX(e.x, e.y), y: isoY(e.x, e.y) - e.d.hh * .6, vy: -.7, t: 'txt', life: 50, s: '⚡', c: '#ffd65a' }); }
      part({ x: px, y: py, t: 'ring', r: 24, life: 30, c: A.col }); say('„Gas geben, ihr Ratten!“'); snd('rocket'); break; }
    case 'conv': {
      if (!tgt || tgt.dead) break; beams.push({ x1: u.x, y1: u.y, h1: u.d.hh * .7, x2: tgt.x, y2: tgt.y, h2: tgt.d.hh * .5, c: '#c27bff', w: 3, life: 20, max: 20, zig: 1 });
      if (tgt.wave) tgt.wave = u.team === 1; convert(tgt, u, 'convert'); say('„Komm heim.“'); break; }
    case 'shield': {
      for (const e of alliesNear(u, A.r)) { e.shield = frame + 480; }
      for (let k = 0; k < 3; k++) part({ x: px, y: py, t: 'ring', r: 18 + k * 24, life: 34, c: A.col }); say('„Die Einheit schützt euch.“'); snd('slow'); break; }
    case 'beam': {
      const a = Math.atan2(ty - u.y, tx - u.x), L = A.rng, ex = u.x + Math.cos(a) * L, ey = u.y + Math.sin(a) * L;
      beams.push({ x1: u.x, y1: u.y, h1: u.d.hh * .6, x2: ex, y2: ey, h2: 6, c: '#ff3040', w: 9, life: 34, max: 34 });
      beams.push({ x1: u.x, y1: u.y, h1: u.d.hh * .6, x2: ex, y2: ey, h2: 6, c: '#ffe0e0', w: 3, life: 34, max: 34 });
      for (const e of ents) { if (e.dead || e.team === u.team || e.team === 2) continue; const vx = e.x - u.x, vy = e.y - u.y, t = clamp((vx * Math.cos(a) + vy * Math.sin(a)) / L, 0, 1), d = Math.hypot(u.x + Math.cos(a) * L * t - e.x, u.y + Math.sin(a) * L * t - e.y); if (d <= A.r + (e.kind === 'b' ? e.w * .4 : 0)) applyDmg(e, 320, 'plasma', u); }
      for (let n = 1; n <= 6; n++) { const x = u.x + Math.cos(a) * L * n / 6, y = u.y + Math.sin(a) * L * n / 6; timers.push({ f: frame + n * 3, fn: () => { explode(isoX(x, y), isoY(x, y) - 6, 1.1); scorch(isoX(x, y), isoY(x, y), 24); } }); }
      shake = Math.max(shake, 10); say('„Korrektur wird angewendet.“'); snd('plasma'); break; }
    case 'swarm': {
      for (let n = 0; n < 3; n++) { const p = nearestFree((u.x | 0) + n - 1, (u.y | 0) + 1, 3); if (!p) continue; const d = mkUnit('drone', u.team, p.x, p.y); d.ttl = frame + 1800; d.online = true; if (u.team === 1) { d.wave = true; const tg = pickTarget(); if (tg) orderAI(d, tg); } part({ x: isoX(d.x, d.y), y: isoY(d.x, d.y) - 30, t: 'ring', r: 10, life: 20, c: A.col }); }
      say('„Schwarm aktiviert.“'); snd('hack'); break; }
  }
  return true;
}
// läuft für jeden Helden in updUnit; true = restliche Einheitenlogik überspringen
function heroTick(u) {
  for (let i = 0; i < 2; i++) if (u.hcd[i] > 0) u.hcd[i]--;
  if (frame % 30 === 0 && u.hp < u.max) u.hp = Math.min(u.max, u.hp + u.max * .004);
  if (u.team === 1 && frame % 40 === u.id % 40) heroAI(u);
  if (u.cast) {
    const c = u.cast, A = HAB[u.type][c.i]; if (c.t && (c.t.dead || c.t.team === u.team)) { u.cast = null; return false; }
    const x = c.t ? c.t.x : c.x, y = c.t ? c.t.y : c.y;
    if (Math.hypot(x - u.x, y - u.y) <= A.rng) { u.path = null; doCast(u, c.i, x, y, c.t); u.state = 'idle'; return true; }
    if (!u.path || (frame + u.id) % 40 === 0) setPath(u, clamp(x | 0, 0, MW - 1), clamp(y | 0, 0, MH - 1));
    moveAlong(u); return true;
  }
  return false;
}
function heroAI(u) {
  const hab = HAB[u.type];
  for (let i = 0; i < 2; i++) {
    if (u.hcd[i] > 0) continue; const A = hab[i];
    if (A.aim === 'pt') {
      let best = null, bv = 2; const R = Math.min(A.rng, 9);
      for (const e of ents) { if (e.dead || e.team !== 0 || Math.hypot(e.x - u.x, e.y - u.y) > R) continue; const v = foesNear(e.x, e.y, A.r, 1).reduce((s, o) => s + (o.kind === 'b' ? 1.5 : 1), 0); if (v > bv) { bv = v; best = e; } }
      if (best) { heroCast(1, i, best.x, best.y); return; }
    } else if (A.aim === 'unit') {
      const t = ents.filter(e => !e.dead && e.kind === 'u' && e.team === 0 && !e.d.hero && !e.d.harv && Math.hypot(e.x - u.x, e.y - u.y) <= A.rng).sort((a, b) => (b.d.cost || 0) - (a.d.cost || 0))[0];
      if (t && (t.d.cost || 0) >= 300) { heroCast(1, i, t.x, t.y, t); return; }
    } else if (A.k === 'swarm') { if (foesNear(u.x, u.y, 7, 1).filter(e => e.kind === 'u').length >= 2) { heroCast(1, i, u.x, u.y); return; } }
    else { const fight = alliesNear(u, A.r).filter(e => e.target).length; if (fight >= 3 || (u.target && u.hp < u.max * .6)) { heroCast(1, i, u.x, u.y); return; } }
  }
}
// Zielen mit der Maus/dem Finger
function aimHero(i) {
  const u = heroOf(0); if (!u || !running || gameOver) return; const A = HAB[u.type][i];
  if (u.hcd[i] > 0) { msg(facOf(0).short + ' ▸ ' + A.n + ' lädt noch (' + Math.ceil(u.hcd[i] / 60) + ' s).', '#ffd65a'); return; }
  if (!A.aim) { heroCast(0, i, u.x, u.y); return; }
  hAim = hAim && hAim.i === i ? null : { i }; uAim = null; swAim = false; placing = null; amoveMode = false;
}
function heroAimAt(sx, sy) {
  const u = heroOf(0); if (!u || !hAim) { hAim = null; return; }
  const w = s2w(sx, sy), t = unIso(w.x, w.y), A = HAB[u.type][hAim.i];
  const tg = A.aim === 'unit' ? pick(w.x, w.y) : null;
  if (heroCast(0, hAim.i, t.x, t.y, tg)) hAim = null;
}
function selectHero() { const u = heroOf(0); if (!u) { const r = HERO.resp[0]; if (HERO.type[0]) msg(facOf(0).short + ' ▸ ' + UD[HERO.type[0]].n + (r > 0 ? ' kehrt in ' + Math.ceil((r - frame) / 60) + ' s zurück.' : ' ist gefallen.'), '#ffd65a'); return; } const now = performance.now(); if (sel.size === 1 && sel.has(u) && now - (selectHero.t || 0) < 500) centerOn(u.x, u.y); selectHero.t = now; sel.clear(); sel.add(u); snd('click'); }
function drawHeroFx() {
  for (const f of hfx) { const px = isoX(f.x, f.y), py = isoY(f.x, f.y), R = f.r * TW / Math.SQRT2; ctx.strokeStyle = `rgba(${f.col},${.5 + .4 * Math.sin(frame * .5)})`; ctx.lineWidth = 2; ctx.setLineDash([8, 5]); ctx.lineDashOffset = -frame; ctx.beginPath(); ctx.ellipse(px, py, R, R / 2, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]); }
  const u = heroOf(0);
  if (hAim && u && mouse.in) { const A = HAB[u.type][hAim.i], w = s2w(mouse.x, mouse.y), t = unIso(w.x, w.y), px = isoX(t.x, t.y), py = isoY(t.x, t.y), ok = Math.hypot(t.x - u.x, t.y - u.y) <= A.rng;
    ctx.strokeStyle = `rgba(${A.col},.95)`; ctx.fillStyle = `rgba(${A.col},.12)`; ctx.lineWidth = 2;
    if (A.k === 'beam') { const a = Math.atan2(t.y - u.y, t.x - u.x); ctx.beginPath(); ctx.moveTo(isoX(u.x, u.y), isoY(u.x, u.y)); ctx.lineTo(isoX(u.x + Math.cos(a) * A.rng, u.y + Math.sin(a) * A.rng), isoY(u.x + Math.cos(a) * A.rng, u.y + Math.sin(a) * A.rng)); ctx.lineWidth = 10; ctx.strokeStyle = `rgba(${A.col},.35)`; ctx.stroke(); }
    else { const R = Math.max(.6, A.r) * TW / Math.SQRT2; ctx.beginPath(); ctx.ellipse(px, py, R, R / 2, 0, 0, TAU); ctx.fill(); ctx.stroke(); }
    if (A.rng < 50) { const R2 = A.rng * TW / Math.SQRT2, hx = isoX(u.x, u.y), hy = isoY(u.x, u.y); ctx.strokeStyle = ok ? 'rgba(255,214,90,.35)' : 'rgba(255,214,90,.6)'; ctx.lineWidth = 1; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.ellipse(hx, hy, R2, R2 / 2, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]); } }
}
// Helden-Leiste (links oben über dem Spielfeld)
let hbKey = '';
function updHeroBar() {
  const el = $('#heroBar'), u = heroOf(0), type = HERO.type[0];
  $('#game').classList.toggle('hashero', !!(running && type));
  if (!running || !type) { el.classList.add('hide'); hbKey = ''; return; } el.classList.remove('hide');
  if (hbKey !== type) { hbKey = type; const F = FAC[UD[type].fac];
    el.style.setProperty('--hc', F.col); $('#hbP').style.backgroundImage = `url('assets/story/${VLORE[UD[type].fac].p}.jpg')`; $('#hbN').textContent = UD[type].n.toUpperCase();
    HAB[type].forEach((A, i) => { const b = $('#hbA' + i); b.querySelector('b').textContent = A.ic; b.querySelector('span').textContent = A.n; b.title = A.n + ' (' + (i ? 'F' : 'R') + ') – ' + A.info + ' Abklingzeit ' + A.cd + ' s.'; b.style.setProperty('--ac', `rgb(${A.col})`); }); }
  el.classList.toggle('dead', !u); el.classList.toggle('sel', !!u && sel.has(u));
  const r = HERO.resp[0];
  $('#hbT').textContent = u ? 'STUFE ' + (u.vet + 1) + (u.vet < 3 ? ' · ' + u.kills + '/' + [2, 5, 9][u.vet] : ' · MAX') : r > 0 ? 'ZURÜCK IN ' + Math.max(0, Math.ceil((r - frame) / 60)) + ' S' : 'GEFALLEN';
  $('#hbH').style.width = (u ? u.hp / u.max * 100 : 0) + '%';
  for (let i = 0; i < 2; i++) { const b = $('#hbA' + i), m = u ? habMax(u, i) : 1, c = u ? u.hcd[i] : m; b.classList.toggle('rdy', !!u && c <= 0); b.classList.toggle('aim', !!hAim && hAim.i === i); b.style.setProperty('--p', (u ? (1 - c / m) * 360 : 0) + 'deg'); b.querySelector('i').textContent = u && c > 0 ? Math.ceil(c / 60) : ''; }
}
// ================= EINHEITEN-FÄHIGKEITEN =================
// Je Volk 2 Einheiten mit einer aktiven Fähigkeit (Taste V / Knopf in der Bedienleiste). Wirkt für alle gewählten bereiten Einheiten dieses Typs.
const UAB = {
  tank: { k: 'smoke', n: 'Rauchwand', ic: '☁', cd: 30, r: 2.6, col: '190,200,210', info: 'Nebelwand um den Panzer: eigene Einheiten darin nehmen 8 s lang 60 % weniger Schaden.' },
  rocket: { k: 'salvo', n: 'Raketensalve', ic: '➶', cd: 30, aim: 'pt', r: 1.6, rng: 7, col: '255,170,60', info: '4 Raketen auf ein Zielgebiet, stark gegen Fahrzeuge und Gebäude.' },
  titan: { k: 'shock', n: 'Schockwelle', ic: '◉', cd: 35, r: 3, col: '255,60,80', info: 'Stampft auf: Schaden und 2 s Lähmung für alle Feinde ringsum.' },
  spider: { k: 'sabo', n: 'Sabotage', ic: '⚙', cd: 40, aim: 'bld', rng: 1.4, col: '255,80,90', info: 'Schleicht an ein Feindgebäude und legt es 15 s lahm (+150 Schaden).' },
  phantom: { k: 'charge', n: 'Sprengsatz', ic: '✦', cd: 35, aim: 'ent', rng: 1.4, r: 1.3, col: '194,123,255', info: 'Bringt eine Haftladung an: nach 3 s schwere Explosion.' },
  seraph: { k: 'blink', n: 'Phasensprung', ic: '⇢', cd: 20, aim: 'pt', rng: 7, r: .6, col: '217,168,255', info: 'Teleportiert den Schwebepanzer bis 7 Felder weit.' },
  buggy: { k: 'turbo', n: 'Nitro-Turbo', ic: '»', cd: 20, col: '255,200,60', info: '6 s doppeltes Tempo und schnelleres Feuer.' },
  molotov: { k: 'napalm', n: 'Brandteppich', ic: '♨', cd: 30, aim: 'pt', r: 1.7, rng: 5, col: '255,120,40', info: 'Setzt ein Gebiet 6 s in Brand – verheerend gegen Infanterie.' },
};
let zones = [], uAim = null;
const uabMax = u => UAB[u.type].cd * 60;
const inSmoke = e => { for (const z of zones) if (z.k === 'smoke' && z.team === e.team && Math.hypot(e.x - z.x, e.y - z.y) <= z.r) return true; return false; };
function uCast(u, tx, ty, tgt) {
  const A = UAB[u.type]; if (!A || u.dead || u.acd > 0 || u.stun > frame) return false;
  if (A.aim === 'bld' || A.aim === 'ent') { if (!tgt || tgt.dead || tgt.team === u.team || tgt.team === 2 || (A.aim === 'bld' && tgt.kind !== 'b')) return false; tx = tgt.x; ty = tgt.y; }
  if (A.k === 'blink') { const dd = Math.hypot(tx - u.x, ty - u.y); if (dd > A.rng) { tx = u.x + (tx - u.x) / dd * A.rng; ty = u.y + (ty - u.y) / dd * A.rng; } }
  else if (A.aim) { const dd = tgt ? distTo(u, tgt) : Math.hypot(tx - u.x, ty - u.y); if (dd > A.rng) { u.acast = { x: tx, y: ty, t: tgt || null, st: u.state, until: frame + 1200 }; u.target = null; u.state = 'move'; if (tgt) pathToEnt(u, tgt); else setPath(u, clamp(tx | 0, 0, MW - 1), clamp(ty | 0, 0, MH - 1)); return true; } }
  doUCast(u, tx, ty, tgt); return true;
}
function lob(u, tx, ty, w, spd) { projs.push({ x: u.x, y: u.y, h: u.d.hh, t: null, lx: tx, ly: ty, lh: 0, w, dmg: 0, src: u, team: u.team, spd, life: 300 }); return Math.ceil(Math.hypot(tx - u.x, ty - u.y) / spd); }
function doUCast(u, tx, ty, tgt) {
  const A = UAB[u.type], px = isoX(u.x, u.y), py = isoY(u.x, u.y), me = u.team === 0; u.acd = uabMax(u); u.acast = null; if (me) stats.uab++;
  if (A.aim) u.dir = Math.atan2(ty - u.y, tx - u.x);
  switch (A.k) {
    case 'smoke':
      zones.push({ k: 'smoke', x: u.x, y: u.y, r: A.r, team: u.team, until: frame + 480 });
      for (let n = 0; n < 22; n++) { const a = Math.random() * TAU, d = Math.random() * A.r; part({ x: isoX(u.x + Math.cos(a) * d, u.y + Math.sin(a) * d), y: isoY(u.x + Math.cos(a) * d, u.y + Math.sin(a) * d) - 8, vx: (Math.random() - .5) * .4, vy: -.25, r: 9 + Math.random() * 8, life: 120 + Math.random() * 60, t: 'smoke' }); }
      snd('slow', u.x, u.y); break;
    case 'salvo':
      for (let n = 0; n < 4; n++) timers.push({ f: frame + n * 7, fn: () => { if (u.dead) return; const a = Math.random() * TAU, d = Math.random() * A.r * .8, x = tx + Math.cos(a) * d, y = ty + Math.sin(a) * d, fl = lob(u, x, y, 'rocket', .2); timers.push({ f: frame + fl, fn: () => { explode(isoX(x, y), isoY(x, y) - 6, 1.2); scorch(isoX(x, y), isoY(x, y), 18); areaDmg(u, x, y, .9, 75, 'rocket'); snd('boom', x, y); } }); snd('rocket', u.x, u.y); } });
      break;
    case 'shock': {
      areaDmg(u, u.x, u.y, A.r, 110, 'plasma'); for (const e of foesNear(u.x, u.y, A.r, u.team)) if (!e.d.hero) e.stun = Math.max(e.stun || 0, frame + 120);
      for (let k = 0; k < 3; k++) part({ x: px, y: py, t: 'ring', r: 16 + k * 26, life: 24 + k * 6, c: A.col });
      for (let n = 0; n < 16; n++) part({ x: px + (Math.random() - .5) * 90, y: py + (Math.random() - .5) * 40, vx: (Math.random() - .5) * 2, vy: -Math.random() * 2, g: .12, t: 'debris', life: 34, c: '#8a7d6a' });
      shake = Math.max(shake, 9); snd('boom', u.x, u.y); break; }
    case 'sabo':
      if (!tgt || tgt.dead) break; tgt.stun = Math.max(tgt.stun || 0, frame + 900); applyDmg(tgt, 150, 'laser', u); u.lastFire = frame;
      for (let n = 0; n < 18; n++) part({ x: isoX(tgt.x, tgt.y) + (Math.random() - .5) * 40, y: isoY(tgt.x, tgt.y) - 20 - Math.random() * 30, vx: (Math.random() - .5) * 3, vy: -Math.random() * 2, t: 'spark', life: 20, c: '#ff5060' });
      if (me) msg(facOf(0).short + ' ▸ Sabotage! ' + tgt.d.n + ' 15 s lahmgelegt.', '#ff8a8a'); else if (tgt.team === 0) { msg(facOf(0).short + ' ▸ ' + tgt.d.n + ' sabotiert!', '#ff8a8a'); ping(tgt.x, tgt.y); }
      snd('hack', tgt.x, tgt.y); break;
    case 'charge':
      if (!tgt || tgt.dead) break; u.lastFire = frame; zones.push({ k: 'bomb', t: tgt, x: tgt.x, y: tgt.y, team: u.team, until: frame + 180 });
      timers.push({ f: frame + 180, fn: () => { const x = tgt.x, y = tgt.y; explode(isoX(x, y), isoY(x, y) - 10, 2.2); scorch(isoX(x, y), isoY(x, y), 34); if (!tgt.dead) applyDmg(tgt, 200, 'shell', u); areaDmg(u, x, y, A.r, 150, 'shell'); shake = Math.max(shake, 8); snd('boom', x, y); } });
      if (me) msg(facOf(0).short + ' ▸ Sprengsatz angebracht – 3 Sekunden!', '#d9a8ff'); snd('click'); break;
    case 'blink': {
      const p = nearestFree(clamp(tx | 0, 0, MW - 1), clamp(ty | 0, 0, MH - 1), 3); if (!p) { u.acd = 0; break; }
      part({ x: px, y: py - 14, t: 'ring', r: 14, life: 22, c: A.col }); for (let n = 0; n < 10; n++) part({ x: px + (Math.random() - .5) * 30, y: py - Math.random() * 30, vx: (Math.random() - .5) * 2, vy: -Math.random() * 2, t: 'spark', life: 16, c: '#d9a8ff' });
      u.x = u.ox = p.x + .5; u.y = u.oy = p.y + .5; u.path = null; u.state = 'idle'; u.target = null;
      part({ x: isoX(u.x, u.y), y: isoY(u.x, u.y) - 14, t: 'ring', r: 18, life: 26, c: A.col }); snd('slow', u.x, u.y); break; }
    case 'turbo':
      u.spdB = frame + 360; u.rofB = frame + 360; u.turbo = frame + 360; snd('rocket', u.x, u.y); break;
    case 'napalm': {
      const fl = lob(u, tx, ty, 'fire', .12);
      timers.push({ f: frame + fl, fn: () => { zones.push({ k: 'fire', x: tx, y: ty, r: A.r, team: u.team, src: u, until: frame + 360 }); explode(isoX(tx, ty), isoY(tx, ty) - 6, 1); scorch(isoX(tx, ty), isoY(tx, ty), 44); snd('boom', tx, ty); } });
      break; }
  }
  return true;
}
function updZones() {
  if (!zones.length) return;
  for (const z of zones) {
    if (z.t && !z.t.dead) { z.x = z.t.x; z.y = z.t.y; }
    if (z.k === 'fire') {
      if (frame % 20 === 0) areaDmg(z.src, z.x, z.y, z.r, 10, 'fire');
      if (frame % 3 === 0) { const a = Math.random() * TAU, d = Math.random() * z.r; part({ x: isoX(z.x + Math.cos(a) * d, z.y + Math.sin(a) * d), y: isoY(z.x + Math.cos(a) * d, z.y + Math.sin(a) * d), vy: -.6 - Math.random() * .6, t: 'fire', r: 3 + Math.random() * 4, life: 26 + Math.random() * 30 }); }
    } else if (z.k === 'smoke' && frame % 7 === 0) { const a = Math.random() * TAU, d = Math.random() * z.r; part({ x: isoX(z.x + Math.cos(a) * d, z.y + Math.sin(a) * d), y: isoY(z.x + Math.cos(a) * d, z.y + Math.sin(a) * d) - 6, vx: (Math.random() - .5) * .3, vy: -.2, r: 10 + Math.random() * 8, life: 90, t: 'smoke' }); }
  }
  zones = zones.filter(z => frame < z.until);
}
// läuft in updUnit für Einheiten mit Fähigkeit; true = restliche Logik überspringen
function uabTick(u) {
  if (u.acd > 0) u.acd--;
  if (u.turbo > frame && frame % 3 === 0) part({ x: isoX(u.x, u.y) - Math.cos(u.dir) * 12, y: isoY(u.x, u.y) - 6, vx: -Math.cos(u.dir) * .8, vy: -.4, t: 'fire', r: 3, life: 14 });
  if (u.team === 1 && !u.acast && !(u.acd > 0) && frame % 30 === u.id % 30) uabAI(u);
  const c = u.acast; if (!c) return false;
  if ((c.t && (c.t.dead || c.t.team === u.team)) || frame > c.until) { u.acast = null; u.state = 'idle'; return false; }
  const A = UAB[u.type], dd = c.t ? distTo(u, c.t) : Math.hypot(c.x - u.x, c.y - u.y);
  if (dd <= A.rng) { u.path = null; doUCast(u, c.t ? c.t.x : c.x, c.t ? c.t.y : c.y, c.t); u.state = c.st === 'amove' && u.goal ? 'amove' : 'idle'; return true; }
  if (!u.path || (frame + u.id) % 40 === 0) { if (c.t) pathToEnt(u, c.t); else setPath(u, clamp(c.x | 0, 0, MW - 1), clamp(c.y | 0, 0, MH - 1)); }
  moveAlong(u); return true;
}
function uabAI(u) {
  const A = UAB[u.type], t = u.target && !u.target.dead ? u.target : null, n = (x, y, r) => foesNear(x, y, r, u.team).length;
  switch (A.k) {
    case 'smoke': if (t && u.hp < u.max * .75) uCast(u, u.x, u.y); break;
    case 'salvo': if (t && distTo(u, t) <= A.rng && (t.kind === 'b' || t.d.arm === 'veh' || n(t.x, t.y, A.r) >= 3)) uCast(u, t.x, t.y); break;
    case 'napalm': if (t && distTo(u, t) <= A.rng && n(t.x, t.y, A.r) >= 2) uCast(u, t.x, t.y); break;
    case 'shock': if (foesNear(u.x, u.y, A.r, u.team).filter(e => e.kind === 'u').length >= 2) uCast(u, u.x, u.y); break;
    case 'sabo': { const b = ents.find(e => e.kind === 'b' && e.team === 0 && !e.dead && !(e.stun > frame) && (e.d.rng || e.d.sw || e.d.ref) && distTo(u, e) < 6); if (b) uCast(u, b.x, b.y, b); break; }
    case 'charge': if (t && distTo(u, t) < 4 && (t.kind === 'b' || t.d.arm === 'veh')) uCast(u, t.x, t.y, t); break;
    case 'blink': if (t && u.hp < u.max * .35) { const a = Math.atan2(u.y - t.y, u.x - t.x); uCast(u, u.x + Math.cos(a) * 6, u.y + Math.sin(a) * 6); } break;
    case 'turbo': if (t && distTo(u, t) > u.d.rng + 1.5) uCast(u, u.x, u.y); break;
  }
}
// Spieler: Knopf / Taste V
const uabUnits = () => myUnits().filter(u => UAB[u.type]);
function uabInfo() {
  const us = uabUnits(); if (!us.length) return null;
  const types = [...new Set(us.map(u => u.type))], rdy = us.filter(u => !(u.acd > 0));
  const type = (rdy.find(u => UAB[u.type].aim) || rdy[0] || us[0]).type, of = us.filter(u => u.type === type);
  const cd = Math.min(...of.map(u => u.acd || 0));
  return { type, A: UAB[type], cd, max: UAB[type].cd * 60, n: types.length, rdy };
}
function aimUab() {
  if (!running || gameOver) return; const I = uabInfo(); if (!I) return;
  if (uAim) { uAim = null; return; }
  if (!I.rdy.length) { msg(facOf(0).short + ' ▸ ' + I.A.n + ' lädt noch (' + Math.ceil(I.cd / 60) + ' s).', '#ffd65a'); return; }
  let inst = 0; for (const u of I.rdy) if (!UAB[u.type].aim) { uCast(u, u.x, u.y); inst++; }
  if (inst) msg(facOf(0).short + ' ▸ ' + [...new Set(I.rdy.filter(u => !UAB[u.type].aim).map(u => UAB[u.type].n))].join(' + ') + (inst > 1 ? ' (' + inst + '×)' : '') + '!', '#ffd65a');
  const aimT = I.rdy.find(u => UAB[u.type].aim); if (aimT) { uAim = { type: aimT.type }; hAim = null; swAim = false; placing = null; amoveMode = false; }
}
function uAimAt(sx, sy) {
  const A = UAB[uAim.type], w = s2w(sx, sy), t = unIso(w.x, w.y), rdy = myUnits().filter(u => u.type === uAim.type && !(u.acd > 0));
  if (!rdy.length) { uAim = null; return; }
  if (A.aim !== 'pt') {
    const tg = pick(w.x, w.y);
    if (!tg || tg.team === 0 || tg.team === 2 || (A.aim === 'bld' && tg.kind !== 'b')) { msg(facOf(0).short + ' ▸ Ziel: ' + (A.aim === 'bld' ? 'ein feindliches Gebäude.' : 'eine feindliche Einheit oder ein Gebäude.'), '#d9a8ff'); return; }
    const u = rdy.sort((a, b) => distTo(a, tg) - distTo(b, tg))[0]; uCast(u, tg.x, tg.y, tg); marks.push({ x: tg.x, y: tg.y, life: 30, c: `rgb(${A.col})` });
  } else if (A.k === 'blink') { const sp = spots(clamp(t.x | 0, 0, MW - 1), clamp(t.y | 0, 0, MH - 1), rdy.length); rdy.forEach((u, i) => uCast(u, sp[i].x + .5, sp[i].y + .5)); }
  else { rdy.forEach(u => uCast(u, t.x, t.y)); marks.push({ x: t.x, y: t.y, life: 30, c: `rgb(${A.col})` }); }
  uAim = null;
}
function drawUabFx() {
  for (const z of zones) {
    if (z.k === 'bomb') { if (z.t.dead) continue; const px = isoX(z.x, z.y), py = isoY(z.x, z.y) - (z.t.kind === 'u' ? z.t.d.hh * .5 : 18), on = ((z.until - frame) / ((z.until - frame) > 60 ? 15 : 5) | 0) % 2; ctx.fillStyle = on ? '#ff3040' : '#ffd0d0'; ctx.beginPath(); ctx.arc(px, py, 4, 0, TAU); ctx.fill(); continue; }
    if (z.k === 'smoke' && z.team === 0) { const px = isoX(z.x, z.y), py = isoY(z.x, z.y), R = z.r * TW / Math.SQRT2; ctx.strokeStyle = 'rgba(190,200,210,.25)'; ctx.lineWidth = 1; ctx.setLineDash([3, 6]); ctx.beginPath(); ctx.ellipse(px, py, R, R / 2, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]); }
  }
  if (!uAim || !mouse.in) return;
  const A = UAB[uAim.type], w = s2w(mouse.x, mouse.y), t = unIso(w.x, w.y), px = isoX(t.x, t.y), py = isoY(t.x, t.y), R = Math.max(.6, A.r || .6) * TW / Math.SQRT2;
  ctx.strokeStyle = `rgba(${A.col},.95)`; ctx.fillStyle = `rgba(${A.col},.12)`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(px, py, R, R / 2, 0, 0, TAU); ctx.fill(); ctx.stroke();
  for (const u of myUnits()) if (u.type === uAim.type && !(u.acd > 0) && A.rng) { const R2 = A.rng * TW / Math.SQRT2; ctx.strokeStyle = 'rgba(255,214,90,.3)'; ctx.lineWidth = 1; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.ellipse(isoX(u.x, u.y), isoY(u.x, u.y), R2, R2 / 2, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]); }
}
// ================= SICHT =================
function updVis() {
  vis.fill(0);
  for (const e of ents) {
    if (e.team !== 0 || e.dead) continue; const s = e.d.sight || 5, cx = e.x | 0, cy = e.y | 0;
    for (let dy = -s; dy <= s; dy++) { const y = cy + dy; if (y < 0 || y >= MH) continue; for (let dx = -s; dx <= s; dx++) { const x = cx + dx; if (x < 0 || x >= MW) continue; if (dx * dx + dy * dy <= s * s + 1) { const i = idx(x, y); vis[i] = 1; seen[i] = 1; } } }
  }
}
const fcv = document.createElement('canvas'); fcv.width = MW + 2; fcv.height = MH + 2; const fcx = fcv.getContext('2d'), fimg = fcx.createImageData(MW + 2, MH + 2);
function updFog() {
  const D = fimg.data;
  for (let y = -1; y <= MH; y++) for (let x = -1; x <= MW; x++) {
    const o = ((y + 1) * (MW + 2) + (x + 1)) * 4; let a = 255;
    if (inb(x, y)) { const i = idx(x, y); a = vis[i] ? 0 : seen[i] ? 135 : 255; }
    D[o] = 2; D[o + 1] = 5; D[o + 2] = 10; D[o + 3] = a;
  }
  fcx.putImageData(fimg, 0, 0);
}
function regrow() { for (let i = 0; i < MW * MH; i++) if (oreMax[i] > 0 && ore[i] < oreMax[i] && !bmap[i]) ore[i] = Math.min(oreMax[i], ore[i] + (ore[i] > 0 ? 14 : 5)); }

// ================= BEFEHLE =================
function myUnits() { return [...sel].filter(e => e.kind === 'u' && e.team === 0 && !e.dead); }
const BARK = {
  echo: { m: ['Verstanden.', 'Bin unterwegs.', 'Wird erledigt, Kommandant.', 'Position wird bezogen.', 'Bewegung!'], a: ['Feuer frei!', 'Ziel erfasst.', 'Für Neu-Berlin!', 'Angriff!', 'Haltet drauf!'] },
  axiom: { m: ['Bestätigt.', 'Route berechnet.', 'Ausführung.', 'Vektor gesetzt.', 'Verlagerung.'], a: ['Ziel markiert.', 'Eliminierung beginnt.', 'Bedrohung erkannt.', 'Bereinigung.', 'Feuerlösung berechnet.'] },
  verbund: { m: ['Wir folgen dem Chor.', 'Der Weg ist klar.', 'Wie die Einheit will.', 'Wir gehen.', 'Ein Geist, ein Weg.'], a: ['Fühlt die Einheit!', 'Für Selene!', 'Sie werden verstehen.', 'Der Chor singt!', 'Werdet eins!'] },
  schrott: { m: ['Jo, Boss!', 'Gas geben!', 'Bin schon weg!', 'Läuft, Boss.', 'Hier lang!'], a: ['Plattmachen!', 'Das gibt Schrott!', 'Yeehaw!', 'Ab in die Presse!', 'Zerlegt sie!'] },
};
function bark(units, k) {
  const u = units.find(e => e.team === 0 && !e.dead && !e.esc); if (!u || frame - (bark.t || -999) < 70) return; bark.t = frame;
  const L = (BARK[PF] || BARK.echo)[k]; parts = parts.filter(p => p.t !== 'bub'); part({ t: 'bub', u, s: L[Math.random() * L.length | 0], c: facOf(0).col, x: 0, y: 0, life: 100 });
}
function orderMove(units, tx, ty, am) {
  const sp = spots(tx, ty, units.length);
  units.forEach((u, i) => { const s = sp[i]; u.target = null; u.acast = null; u.cast = null; u.chase = null; u.state = am ? 'amove' : 'move'; u.goal = { x: s.x, y: s.y }; if (u.d.harv) u.hs = 'manual'; setPath(u, s.x, s.y); });
  marks.push({ x: tx + .5, y: ty + .5, life: 30, c: am ? '#ff6060' : '#7dff9a' }); bark(units, am ? 'a' : 'm');
  speak(['Verstanden', 'Bewege mich', 'Bestätigt', 'Unterwegs'][Math.random() * 4 | 0], false, true);
}
function orderAttack(units, t) {
  if (t.team === 2 || (t.d.neutral && t.team === 0)) { const inf = units.filter(u => u.d.cat === 'inf'); orderMove(inf.length ? inf : units, t.tx + (t.w >> 1), t.ty + t.h); if (t.team === 2) msg(facOf(0).short + ' ▸ Infanterie erobert: ' + t.d.n + ' (' + t.d.info + ')', '#ffd54a'); return true; }
  let any = false;
  for (const u of units) { if (u.d.harv || !canHit(u, t)) continue; u.target = t; u.acast = null; u.cast = null; u.state = 'attack'; u.chase = null; u.path = null; any = true; }
  if (any) { marks.push({ x: t.x, y: t.y, life: 30, c: '#ff4040' }); bark(units, 'a'); speak(units.some(u => u.d.w === 'hack') && t.d.hack ? 'Starte Hack' : 'Ziel erfasst', false, true); }
  return any;
}
function stopSel() { for (const u of myUnits()) { u.path = null; u.acast = null; u.cast = null; u.target = null; u.state = 'idle'; u.chase = null; if (u.d.harv) u.hs = 'seek'; } }
function selectAll() { sel.clear(); for (const e of ents) if (e.kind === 'u' && e.team === 0 && !e.dead && !e.d.harv) sel.add(e); if (sel.size) snd('click'); }
function centerOn(x, y) { cam.x = isoX(x, y) - W / zoom / 2; cam.y = isoY(x, y) - H / zoom / 2; clampCam(); }
function clampCam() { const vw = W / zoom, vh = H / zoom; cam.x = clamp(cam.x, -vw * .3, GW - vw * .7); cam.y = clamp(cam.y, -vh * .3, GH - vh * .7); }
const s2w = (sx, sy) => ({ x: sx / zoom + cam.x, y: sy / zoom + cam.y });
function pick(wx, wy) {
  let best = null, bd = 1e9;
  for (const e of ents) {
    if (e.dead || e.kind !== 'u') continue; if (e.team === 1 && !isVis(e)) continue;
    const px = isoX(e.x, e.y), py = isoY(e.x, e.y) - e.d.hh * .45, R = Math.max(14, e.d.r * 34);
    const dd = Math.hypot((wx - px), (wy - py) * 1.2); if (dd < R && dd < bd) { bd = dd; best = e; }
  }
  if (best) return best;
  for (const k of [0, 18, 36, 54]) { const t = unIso(wx, wy + k), tx = Math.floor(t.x), ty = Math.floor(t.y); if (!inb(tx, ty)) continue; const b = bmap[idx(tx, ty)]; if (b && !b.dead && (b.team === 0 || seenB(b))) return b; }
  return null;
}
let lastClick = { t: 0, id: 0 };
function click(sx, sy, shift) {
  const w = s2w(sx, sy);
  if (placing) { ghost = ghostPos(placing, w.x, w.y); tryPlace(); return; }
  const hit = pick(w.x, w.y), mu = myUnits(), t = unIso(w.x, w.y);
  if (hit && hit.team === 1 && mu.length) { if (orderAttack(mu, hit)) { amoveMode = false; return; } }
  if (hit && hit.team === 0) {
    const now = performance.now();
    if (hit.kind === 'u' && lastClick.id === hit.type && now - lastClick.t < 380) { for (const e of ents) if (e.kind === 'u' && e.team === 0 && !e.dead && e.type === hit.type && onScreen(e)) sel.add(e); }
    else if (shift) { sel.has(hit) ? sel.delete(hit) : sel.add(hit); } else { sel.clear(); sel.add(hit); }
    lastClick = { t: now, id: hit.type }; snd('click');
    if (hit.kind === 'u') speak(hit.d.w === 'hack' ? 'Hacker bereit' : hit.team === 0 && hit.hacked ? 'Neu programmiert. Bereit' : ['Zu Befehl', 'Bereit', 'Kommandant'][Math.random() * 3 | 0], false, true);
    return;
  }
  if (mu.length && inb(Math.floor(t.x), Math.floor(t.y))) { orderMove(mu, Math.floor(t.x), Math.floor(t.y), amoveMode); amoveMode = false; return; }
  if (!shift) sel.clear();
}
function onScreen(e) { const px = isoX(e.x, e.y), py = isoY(e.x, e.y); return px > cam.x && px < cam.x + W / zoom && py > cam.y && py < cam.y + H / zoom; }
function boxSelect(b) {
  const x0 = Math.min(b.sx, b.x), x1 = Math.max(b.sx, b.x), y0 = Math.min(b.sy, b.y), y1 = Math.max(b.sy, b.y);
  const a = s2w(x0, y0), c = s2w(x1, y1); const got = [];
  for (const e of ents) if (e.kind === 'u' && e.team === 0 && !e.dead) { const px = isoX(e.x, e.y), py = isoY(e.x, e.y) - e.d.hh * .4; if (px >= a.x && px <= c.x && py >= a.y && py <= c.y) got.push(e); }
  const combat = got.filter(e => !e.d.harv);
  if (!b.shift) sel.clear(); (combat.length ? combat : got).forEach(e => sel.add(e)); if (got.length) snd('click');
}

// ================= TON =================
let AC = null, master, musicGain, sfxGain, noiseBuf, musicOn = true, voiceOn = true, seqT = 0, mstep = 0;
const MUTE = /[?&]mute/.test(location.search);
function initAudio() {
  if (MUTE) return;
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
  try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
  master = AC.createGain(); master.gain.value = .8; master.connect(AC.destination);
  sfxGain = AC.createGain(); sfxGain.gain.value = OPT.sfx; sfxGain.connect(master);
  musicGain = AC.createGain(); musicGain.gain.value = musicOn ? .14 : 0; musicGain.connect(master);
  noiseBuf = AC.createBuffer(1, AC.sampleRate, AC.sampleRate); const dd = noiseBuf.getChannelData(0); for (let i = 0; i < dd.length; i++) dd[i] = Math.random() * 2 - 1;
}
function noise(t, dur, f, type, vol, dest, f2) { const s = AC.createBufferSource(); s.buffer = noiseBuf; const fl = AC.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur); const g = AC.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur); s.connect(fl); fl.connect(g); g.connect(dest); s.start(t, Math.random() * .5); s.stop(t + dur + .05); }
function tone(t, dur, f, f2, type, vol, dest) { const o = AC.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur); const g = AC.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur); o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + .05); }
const sLast = {};
function snd(k, x, y) {
  if (!AC) return; const now = AC.currentTime; if (sLast[k] && now - sLast[k] < .055) return; sLast[k] = now;
  let v = 1; if (x !== undefined) { const c = unIso(cam.x + W / zoom / 2, cam.y + H / zoom / 2), d = Math.hypot(x - c.x, y - c.y) / 22; v = Math.max(0, 1 - d); if (v < .05) return; }
  const t = now;
  switch (k) {
    case 'shot': noise(t, .06, 2600, 'highpass', .22 * v, sfxGain); break;
    case 'mg': noise(t, .05, 2000, 'bandpass', .3 * v, sfxGain); noise(t + .07, .05, 2000, 'bandpass', .25 * v, sfxGain); break;
    case 'laser': tone(t, .14, 1500, 240, 'sawtooth', .07 * v, sfxGain); break;
    case 'rocket': noise(t, .35, 700, 'bandpass', .3 * v, sfxGain, 3200); break;
    case 'cannon': noise(t, .3, 700, 'lowpass', .7 * v, sfxGain, 90); tone(t, .18, 120, 40, 'sine', .45 * v, sfxGain); break;
    case 'plasma': tone(t, .32, 260, 1300, 'square', .05 * v, sfxGain); break;
    case 'hit': noise(t, .25, 900, 'lowpass', .35 * v, sfxGain, 120); break;
    case 'boom': noise(t, .9, 1300, 'lowpass', .85 * v, sfxGain, 50); tone(t, .6, 85, 28, 'sine', .7 * v, sfxGain); break;
    case 'click': tone(t, .04, 900, 600, 'square', .04, sfxGain); break;
    case 'place': tone(t, .09, 260, 640, 'square', .07, sfxGain); noise(t, .35, 500, 'lowpass', .3, sfxGain); break;
    case 'ready': [0, .09, .18].forEach((d, i) => tone(t + d, .1, 440 * (1 + i * .26), 0, 'square', .045, sfxGain)); break;
    case 'alarm': tone(t, .45, 620, 300, 'sawtooth', .06, sfxGain); tone(t + .5, .45, 620, 300, 'sawtooth', .06, sfxGain); break;
    case 'hack': [0, .06, .12, .18].forEach((d, i) => tone(t + d, .08, 800 + i * 300, 0, 'square', .04, sfxGain)); tone(t + .25, .4, 300, 1800, 'sine', .06, sfxGain); break;
    case 'slow': tone(t, .6, 900, 120, 'sine', .12, sfxGain); break;
  }
}
const BASS = [40, 0, 40, 0, 43, 0, 40, 0, 38, 0, 40, 0, 47, 0, 45, 43];
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
function bass(t, d, f) { const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; const fl = AC.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.setValueAtTime(900, t); fl.frequency.exponentialRampToValueAtTime(140, t + d); const g = AC.createGain(); g.gain.setValueAtTime(.32, t); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(fl); fl.connect(g); g.connect(musicGain); o.start(t); o.stop(t + d + .05); }
// Soundtrack (echt produziert, assets/music) mit Überblendung je nach Lage
const TRACKS = { menu: 'menu', base: 'basis', battle: 'kampf', final: 'finale' };
const BGA = [new Audio(), new Audio()]; BGA.forEach(a => { a.loop = true; a.volume = 0; a.preload = 'auto'; });
let bgCur = 0, bgName = null, bgFadeT = null; let BGVOL = OPT.mus;
const BGM = { play() { const a = BGA[bgCur]; return a.src ? a.play() : Promise.resolve(); }, pause() { BGA.forEach(a => a.pause()); } };
function setTrack(name) {
  if (MUTE || !musicOn || name === bgName) return; bgName = name;
  const nxt = 1 - bgCur, a = BGA[nxt], o = BGA[bgCur];
  a.src = 'assets/music/' + TRACKS[name] + '.mp3'; a.onerror = () => { if (name === 'menu') { bgName = null; setTrack('battle'); } };
  a.currentTime = 0; a.volume = 0; a.play().catch(() => { }); bgCur = nxt;
  clearInterval(bgFadeT); let k = 0; bgFadeT = setInterval(() => { k = Math.min(1, k + .05); a.volume = BGVOL * k; o.volume = BGVOL * (1 - k); if (k >= 1) { o.pause(); clearInterval(bgFadeT); } }, 80);
}
function wantTrack() { if (!running) return 'menu'; if (MISSION && MISSION.final) return 'final'; return ents.some(e => !e.dead && e.team === 1 && e.wave && e.kind === 'u') ? 'battle' : 'base'; }
function setMusic(on) { musicOn = on && !MUTE; $('#bMus').classList.toggle('on', musicOn); if (musicOn && !document.hidden) { bgName = null; setTrack(wantTrack()); } else BGM.pause(); }
function schedMusic() {
  if (!AC) return; if (seqT < AC.currentTime - .5) seqT = AC.currentTime + .05;
  const spb = 60 / 112 / 4 / (slow.on ? .6 : 1);
  while (seqT < AC.currentTime + .2) {
    const s = mstep % 16, bar = (mstep / 16 | 0) % 4;
    if (running && !paused && !gameOver && musicOn) {
      if (s % 4 === 0) tone(seqT, .25, 110, 38, 'sine', .9, musicGain);
      if (s % 2 === 1) noise(seqT, .035, 7000, 'highpass', .13, musicGain);
      if (s === 4 || s === 12) noise(seqT, .18, 1800, 'bandpass', .32, musicGain);
      const n = BASS[s]; if (n) bass(seqT, spb * 1.8, mtof(n + (bar === 3 ? -2 : bar === 2 ? 3 : 0)));
      if (s === 0 && bar % 2 === 0) [52, 55, 59].forEach(m => tone(seqT, spb * 14, mtof(m + (bar === 2 ? 3 : 0)), 0, 'triangle', .05, musicGain));
    }
    seqT += spb; mstep++;
  }
}
// Sprachausgabe: NUR echte Aufnahmen aus assets/voice (keine Browser-Robotstimme)
const VOICE_IDS = { 'Willkommen, Kommandant. ECHO ist online': 'welcome', 'Bau abgeschlossen': 'build_done', 'Einheit bereit': 'unit_ready', 'Unsere Basis wird angegriffen': 'base_attack', 'Niedrige Energie': 'low_power', 'Nicht genug Credits': 'no_credits', 'Feindliche Maschinen im Anmarsch': 'enemy_wave', 'Achtung. AXIOM hat sich an unsere Taktik angepasst': 'axiom_adapt', 'Feindeinheit übernommen': 'hack_done', 'Relais zerstört. Feindliches Netz getrennt': 'relay_down', 'Gebäude verloren': 'building_lost', 'Mission erfüllt. Der AXIOM-Kern ist zerstört': 'mission_won', 'Mission gescheitert': 'mission_lost', 'Ungültige Position': 'invalid_pos' };
const lastSpeak = {}, VCACHE = {}; let vPlaying = null;
function speak(t, force, lowPrio) {
  if (MUTE || !voiceOn || !running || document.hidden) return; const id = VOICE_IDS[t]; if (!id) return;
  const now = performance.now(); if (lastSpeak[id] && now - lastSpeak[id] < 4000) return;
  if (vPlaying && !vPlaying.ended && !force) return;
  lastSpeak[id] = now; const a = VCACHE[id] || (VCACHE[id] = new Audio('assets/voice/' + id + '.mp3')); a.currentTime = 0; a.volume = .9; vPlaying = a; a.play().catch(() => { });
}

// ================= RENDERING =================
function resize() {
  const ccx = cam.x + W / zoom / 2, ccy = cam.y + H / zoom / 2; // Bildmitte halten
  DPR = Math.min(QUALITY, window.devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * DPR; cv.height = H * DPR;
  cam.x = ccx - W / zoom / 2; cam.y = ccy - H / zoom / 2;
  vign = document.createElement('canvas'); vign.width = Math.max(1, W / 2 | 0); vign.height = Math.max(1, H / 2 | 0); { const vg = vign.getContext('2d'), g = vg.createRadialGradient(vign.width / 2, vign.height / 2, Math.min(vign.width, vign.height) * .35, vign.width / 2, vign.height / 2, Math.max(vign.width, vign.height) * .75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,4,10,.55)'); vg.fillStyle = g; vg.fillRect(0, 0, vign.width, vign.height); }
  clampCam();
}
function spr(s, px, py, a) { if (!s) return; if (a !== undefined) ctx.globalAlpha = a; ctx.drawImage(s.c, px - s.ax / BS, py - s.ay / BS, s.w / BS, s.h / BS); if (a !== undefined) ctx.globalAlpha = 1; }
const dirIdx = a => ((Math.round(a / (TAU / DIRS)) % DIRS) + DIRS) % DIRS;
const USPR_FB = { h_voss: 'rifle', h_brakk: 'rocket', h_selene: 'hacker', h_avatar: 'walker', spider: 'walker', collector: 'harv', adept: 'rifle', preacher: 'hacker', phantom: 'rifle', seraph: 'tankHull', glider: 'harv', raider: 'rifle', molotov: 'rocket', buggy: 'tankHull', monster: 'tankHull', scrapper: 'harv' };
function unitSprites(u) {
  const di = dirIdx(u.dir), f = u.moving && ((frame + u.anim) >> 3) & 1 ? 1 : 0, H = u.hacked ? 'H' : '';
  if (u.type === 'tank') return SPR.tankTurret ? [SPR.tankHull[di], SPR.tankTurret[dirIdx(u.tdir)]] : [SPR.tankHull[dirIdx(u.tdir)]];
  let a = SPR[u.type + H] || SPR[u.type], dd = di;
  if (!a) { a = SPR[USPR_FB[u.type]]; if (a === SPR.tankHull) dd = dirIdx(u.tdir); }
  if (!a) return [];
  return Array.isArray(a[0]) ? [a[f][dd]] : [a[dd]];
}
const BSPR_FB = () => { const m = {}; for (const F of Object.values(FAC)) { for (const r of ['hq', 'power', 'ref', 'inf', 'veh', 'def']) m[F[r]] = FAC.echo[r]; m[F.sw] = 'power'; } m.core = 'core'; m.fab = 'fab'; m.pylon = 'pylon'; m.relay = 'relay'; return m; };
const bSpr = t => SPR[t] || SPR[BSPR_FB()[t]];
const GLOWC = {};
function glowSprite(col) { if (GLOWC[col]) return GLOWC[col]; const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, `rgba(${col},1)`); gr.addColorStop(.35, `rgba(${col},.45)`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return GLOWC[col] = c; }
function glowAt(px, py, r, col, a) { if (DBG.glow) return; ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, a); ctx.drawImage(glowSprite(col), px - r, py - r, r * 2, r * 2); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
function bpt(b, x, y, z) { return [isoX(b.x + x, b.y + z), isoY(b.x + x, b.y + z) - y * HU]; }
function drawBuilding(b) {
  const s = bSpr(b.type), px = isoX(b.x, b.y), py = isoY(b.x, b.y);
  if (b.built < 1) {
    const k = b.built, hh = s.h * k; ctx.globalAlpha = .4 + .6 * k;
    ctx.drawImage(s.c, 0, s.h - hh, s.w, hh, px - s.ax / BS, py - s.ay / BS + (s.h - hh) / BS, s.w / BS, hh / BS); ctx.globalAlpha = 1;
    ctx.strokeStyle = `rgba(79,240,255,${.6 * (1 - k)})`; ctx.lineWidth = 1; diamond(ctx, b.tx, b.ty, b.w, b.h); ctx.stroke();
    const sy = py - s.ay / BS + (s.h - hh) / BS; ctx.fillStyle = 'rgba(79,240,255,.5)'; ctx.fillRect(px - s.w / BS / 2.4, sy, s.w / BS / 1.2, 1.5);
    return;
  }
  spr(s, px, py);
  if (frame - (b.hitF || -99) < 4) { ctx.globalCompositeOperation = 'lighter'; spr(s, px, py, .3 * (1 - (frame - b.hitF) / 4)); ctx.globalCompositeOperation = 'source-over'; }
  if (b.hp < b.max * .55 && b.team !== 2 && (frame + b.id) % (b.hp < b.max * .25 ? 4 : 9) === 0) { const hx = px + (Math.random() - .5) * b.w * 22, hy = py - s.ay / BS * (.35 + Math.random() * .35);
    part({ x: hx, y: hy, vx: .15 + (Math.random() - .5) * .2, vy: -.45 - Math.random() * .3, life: 70 + Math.random() * 40, r: 3 + Math.random() * 3, t: 'smoke' });
    if (b.hp < b.max * .25) part({ x: hx, y: hy + 4, vx: (Math.random() - .5) * .3, vy: -.6 - Math.random() * .4, life: 18 + Math.random() * 12, r: 3 + Math.random() * 3, t: 'fire' }); }
  if (b.d.neutral) { drawNeutralTag(b); if (b.d.neutral === 'radar' && b.team !== 2) glowAt(...bpt(b, 0, 1.4, 0), 12, (frame >> 4) & 1 ? '255,60,60' : '255,200,80', .8); return; }
  if (b.type === 'turret' && !s.ext) spr(SPR.turretGun[dirIdx(b.ang)], px, py);
  const t = frame, team = b.team;
  switch (b.type) {
    case 'hq': if ((t >> 5) & 1) glowAt(...bpt(b, -1.2, 1.52, -1.2), 9, '255,40,40', .9); break;
    case 'power': { const a = powerLow ? (Math.random() < .3 ? .2 : .7) : .55 + Math.sin(t * .06) * .25; glowAt(...bpt(b, -.4, .77, -.38), 26, '60,230,255', a); glowAt(...bpt(b, .38, .77, .36), 26, '60,230,255', a); break; }
    case 'refinery': glowAt(...bpt(b, -1, .86, -.45), 18, '60,220,255', .35); glowAt(...bpt(b, -1, .86, .35), 18, '60,220,255', .35); break;
    case 'core': { const a = .6 + Math.sin(t * .05) * .3; glowAt(...bpt(b, .3, 2.05, .3), 70, '255,30,45', a); glowAt(...bpt(b, .3, 2.05, .3), 16, '255,200,200', .8); break; }
    case 'pylon': glowAt(...bpt(b, 0, 1.58, 0), b.flash ? 30 : 16, '255,40,50', .8); break;
    case 'relay': glowAt(...bpt(b, 0, 1.28, 0), 14 + Math.sin(t * .1) * 4, '255,40,50', .8); break;
    case 'fab': if ((t >> 4) % 3 === 0) glowAt(...bpt(b, 0, .3, 1.2), 30, '255,40,50', .4); break;
  }
  if (team === 0 && b.repair && (t >> 4) & 1) { ctx.fillStyle = '#7dff9a'; ctx.font = 'bold 14px Orbitron'; ctx.textAlign = 'center'; ctx.fillText('✚', px, py - s.ay / BS + 10); ctx.textAlign = 'left'; }
}
function drawUnit(u) {
  const px = isoX(u.x, u.y); let py = isoY(u.x, u.y);
  if (u.d.fly) py -= Math.sin(frame * .07 + u.anim) * 3;
  else if (u.moving) { const inf = u.d.arm === 'inf'; const t = performance.now() / (inf ? 85 : 60) + u.anim; py -= inf ? Math.abs(Math.sin(t)) * 2.2 : Math.sin(t * 2.3) * .45; }
  if (u.d.hero) { const R = 18 + Math.sin(frame * .08) * 2, c = (u.team === 0 ? facOf(0) : facOf(1)).rgb.join(','); ctx.strokeStyle = 'rgba(255,214,90,.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(px, isoY(u.x, u.y), R, R / 2, 0, 0, TAU); ctx.stroke(); glowAt(px, isoY(u.x, u.y), 26, c, .45); }
  if (u.shield > frame) { ctx.strokeStyle = 'rgba(217,168,255,.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(px, py - u.d.hh * .5, 15, u.d.hh * .6, 0, 0, TAU); ctx.stroke(); }
  if ((u.dmgB > frame || u.rofB > frame) && frame % 12 === u.id % 12) part({ x: px + (Math.random() - .5) * 12, y: py - u.d.hh * .4, vy: -.8, t: 'spark', life: 14, c: u.rofB > frame ? '#ffd65a' : '#7dff9a' });
  const ss = unitSprites(u), off = u.d.mach && !u.hacked && !u.online && (frame >> 2) % 5 === 0;
  const stl = u.d.stealth && u.team === 0 && !revealed(u, { team: 1 }); for (const s of ss) spr(s, px, py, off || stl ? .5 : undefined);
  if (frame - (u.hitF || -99) < 5 && !stl) { ctx.globalCompositeOperation = 'lighter'; for (const s of ss) spr(s, px, py, .55 * (1 - (frame - u.hitF) / 5)); ctx.globalCompositeOperation = 'source-over'; }
  if (u.flash > 0) { u.flash--; if (u.d.w !== 'hack') glowAt(px + Math.cos(u.type === 'tank' ? u.tdir : u.dir) * 10, py - u.d.hh * .55, 14, u.team === 1 && !u.hacked ? '255,60,70' : '255,220,140', .8); }
  if (u.hackP > 0) { const k = Math.min(1, u.hackP / (u.d.hack || 210)); ctx.strokeStyle = u.d.hack ? '#4ff0ff' : '#d9a8ff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(px, py - u.d.hh * .5, 14, -Math.PI / 2, -Math.PI / 2 + k * TAU); ctx.stroke(); }
  if (u.hacked) glowAt(px, py - u.d.hh - 6, 6, '79,240,255', .7);
  if (u.converted) glowAt(px, py - u.d.hh - 6, 6, '194,123,255', .8);
}
function selRing(e) {
  const px = isoX(e.x, e.y), py = isoY(e.x, e.y), r = Math.max(13, e.d.r * 38);
  ctx.strokeStyle = e.team === 0 ? 'rgba(125,255,154,.95)' : 'rgba(255,90,90,.9)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.ellipse(px, py, r, r / 2, 0, 0, TAU); ctx.stroke();
}
function hpBar(e) {
  let w, x, y;
  if (e.kind === 'b') { const s = bSpr(e.type); w = Math.min(90, e.w * 30); x = isoX(e.x, e.y) - w / 2; y = isoY(e.x, e.y) - s.ay / BS + 4; }
  else { w = Math.max(18, e.d.r * 46); x = isoX(e.x, e.y) - w / 2; y = isoY(e.x, e.y) - e.d.hh - 9; }
  const f = Math.max(0, e.hp / e.max); ctx.fillStyle = 'rgba(0,0,0,.75)'; ctx.fillRect(x - 1, y - 1, w + 2, 5);
  ctx.fillStyle = f > .5 ? '#3f6' : f > .25 ? '#fd3' : '#f43'; ctx.fillRect(x, y, w * f, 3);
  if (e.d.harv) { ctx.fillStyle = '#4ff0ff'; ctx.fillRect(x, y + 4, w * e.load / HCAP, 2); }
  if (e.d.hero) { ctx.fillStyle = '#ffd65a'; ctx.font = 'bold 9px Orbitron,sans-serif'; ctx.fillText('♛ ' + (e.vet + 1), x + w + 3, y + 4); }
  else if (e.vet) { ctx.fillStyle = '#ffc64a'; ctx.font = 'bold 9px sans-serif'; ctx.fillText('★'.repeat(e.vet), x + w + 3, y + 4); }
  if (e.stun > frame) { ctx.fillStyle = '#7fdcff'; ctx.font = 'bold 8px Orbitron'; ctx.fillText('EMP ' + Math.ceil((e.stun - frame) / 60) + 's', x, y - 3); }
  else if (e.kind === 'u' && e.d.mach && !e.hacked && !e.online) { ctx.fillStyle = '#ff4050'; ctx.font = 'bold 8px Orbitron'; ctx.fillText('OFFLINE', x, y - 3); }
}
const DBG = window.__DBG = {};
let QUALITY = 1.5, ftAvg = 16, ftN = 0;
function render() {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cv.width, cv.height);
  if (!ready) return;
  const z = zoom * DPR, shx = shake ? (Math.random() - .5) * shake : 0, shy = shake ? (Math.random() - .5) * shake : 0;
  ctx.setTransform(z, 0, 0, z, (-cam.x + shx) * z, (-cam.y + shy) * z);
  const vw = W / zoom, vh = H / zoom;
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'low';
  const sx0 = Math.max(0, cam.x), sy0 = Math.max(0, cam.y), sw = Math.min(GW - sx0, vw + 2), sh = Math.min(GH - sy0, vh + 2);
  if (sw > 0 && sh > 0 && !DBG.ground) ctx.drawImage(groundBmp || gcv, sx0, sy0, sw, sh, sx0, sy0, sw, sh);
  for (const d of decals) if (d.x > cam.x - 80 && d.x < cam.x + vw + 80 && d.y > cam.y - 40 && d.y < cam.y + vh + 40) ctx.drawImage(SCORCH, d.x - d.r, d.y - d.r / 2, d.r * 2, d.r);
  // sichtbare Kacheln
  const c1 = unIso(cam.x, cam.y), c2 = unIso(cam.x + vw, cam.y), c3 = unIso(cam.x, cam.y + vh + 120), c4 = unIso(cam.x + vw, cam.y + vh + 120);
  const tx0 = clamp(Math.floor(Math.min(c1.x, c3.x)) - 2, 0, MW - 1), tx1 = clamp(Math.ceil(Math.max(c2.x, c4.x)) + 2, 0, MW - 1);
  const ty0 = clamp(Math.floor(Math.min(c1.y, c2.y)) - 2, 0, MH - 1), ty1 = clamp(Math.ceil(Math.max(c3.y, c4.y)) + 2, 0, MH - 1);
  const inView = (px, py, m = 160) => px > cam.x - m && px < cam.x + vw + m && py > cam.y - m && py < cam.y + vh + m * 2;
  // Wasser schimmern
  for (let y = ty0; y <= ty1; y++) for (let x = tx0; x <= tx1; x++) { const i = idx(x, y); if (terr[i] === 2 && seen[i]) { const a = .06 + .05 * Math.sin(frame * .03 + x * 1.7 + y); diamond(ctx, x, y); ctx.fillStyle = `rgba(80,200,190,${a})`; ctx.fill(); } }
  // Datennetz-Linien
  const nodes = ents.filter(e => e.team === 1 && !e.dead && e.d.net && seenB(e));
  if (nodes.length) {
    ctx.lineWidth = 2; ctx.setLineDash([6, 8]); ctx.lineDashOffset = -frame * .6;
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j]; if (Math.hypot(a.x - b.x, a.y - b.y) > 16) continue;
      ctx.strokeStyle = 'rgba(255,40,60,.35)'; ctx.beginPath(); ctx.moveTo(isoX(a.x, a.y), isoY(a.x, a.y)); ctx.lineTo(isoX(b.x, b.y), isoY(b.x, b.y)); ctx.stroke();
    }
    ctx.setLineDash([]);
    for (const n of nodes) if (n.type === 'relay') { const px = isoX(n.x, n.y), py = isoY(n.x, n.y), r = n.d.net * TW / Math.SQRT2; ctx.strokeStyle = sel.has(n) || hover === n ? 'rgba(255,60,70,.5)' : 'rgba(255,60,70,.12)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(px, py, r, r / 2, 0, 0, TAU); ctx.stroke(); }
  }
  // Zeichenliste
  const L = [];
  for (let y = ty0; y <= ty1; y++) for (let x = tx0; x <= tx1; x++) {
    const i = idx(x, y);
    if (terr[i] === 1 && seen[i]) L.push({ k: x + y + 1, t: 0, x, y });
    else if (ore[i] > 0 && seen[i]) L.push({ k: x + y + .5, t: 1, x, y });
  }
  const units = [];
  for (const e of ents) {
    if (e.dead) continue;
    if (!inView(isoX(e.x, e.y), isoY(e.x, e.y), e.kind === 'b' ? 260 : 120)) continue;
    if (e.team === 1) { if (e.kind === 'u' && !isVis(e)) continue; if (e.kind === 'b' && !seenB(e)) continue; }
    if (e.kind === 'b') L.push({ k: e.tx + e.ty + e.w + e.h - 1, t: 2, e }); else { units.push(e); }
  }
  for (const u of units) {
    let k = u.x + u.y; if (u.d.fly) k += 100;
    else {
      const ux = u.x | 0, uy = u.y | 0;
      for (let dy = -4; dy <= 1; dy++) for (let dx = -4; dx <= 1; dx++) {
        const x = ux + dx, y = uy + dy; if (!inb(x, y)) continue; const i = idx(x, y);
        const b = bmap[i];
        if (b) { const kb = b.tx + b.ty + b.w + b.h - 1; if ((u.x >= b.tx + b.w || u.y >= b.ty + b.h) && kb >= k) k = kb + .01; }
        else if (terr[i] === 1 && Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && (u.x >= x + 1 || u.y >= y + 1) && x + y + 1 >= k) k = x + y + 1.01;
      }
    }
    L.push({ k, t: 3, e: u });
  }
  for (const c of crates) if (seen[idx(c.x | 0, c.y | 0)]) L.push({ k: c.x + c.y - .5, t: 4, c });
  L.sort((a, b) => a.k - b.k);
  // Auswahlkreise unter Einheiten
  for (const u of units) if (sel.has(u) && !u.d.fly) selRing(u);
  if (!DBG.objs) for (const o of L) {
    if (o.t === 0) spr(SPR.ruin[ruinV[idx(o.x, o.y)]], isoX(o.x + .5, o.y + .5), isoY(o.x + .5, o.y + .5));
    else if (o.t === 1) { const i = idx(o.x, o.y), lv = ore[i] > MAXORE * .66 ? 2 : ore[i] > MAXORE * .3 ? 1 : 0; spr(SPR.cry[lv * 3 + ((o.x * 7 + o.y * 13) % 3)], isoX(o.x + .5, o.y + .5), isoY(o.x + .5, o.y + .5)); }
    else if (o.t === 4) drawCrate(o.c);
    else if (o.t === 2) drawBuilding(o.e);
    else { if (o.e.d.fly && sel.has(o.e)) selRing(o.e); drawUnit(o.e); }
  }
  // Kristall-Funkeln
  if (frame % 3 === 0) { const x = tx0 + Math.random() * (tx1 - tx0) | 0, y = ty0 + Math.random() * (ty1 - ty0) | 0; if (inb(x, y) && ore[idx(x, y)] > 0 && vis[idx(x, y)]) part({ x: isoX(x + Math.random(), y + Math.random()), y: isoY(x + .5, y + .5) - 8 - Math.random() * 10, vy: -.3, t: 'spark', life: 20, c: '#bff8ff' }); }
  // Projektile
  for (const p of projs) {
    const px = isoX(p.x, p.y), py = isoY(p.x, p.y) - p.h;
    if (p.w === 'rocket') { ctx.fillStyle = '#ddd'; ctx.fillRect(px - 2, py - 1, 4, 2); glowAt(px, py, 8, '255,150,60', .9); }
    else if (p.w === 'shell') { glowAt(px, py, 7, '255,230,150', 1); }
    else glowAt(px, py, 12, '200,100,255', 1);
  }
  // Partikel
  for (const p of parts) if (p.t === 'smoke') { const k = p.life / p.max; ctx.fillStyle = `rgba(38,36,34,${.45 * k})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.fill(); }
  else if (p.t === 'debris') { ctx.fillStyle = p.c; ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3); }
  else if (p.t === 'chunk') { const c = Math.cos(p.rot) * p.sz, sn = Math.sin(p.rot) * p.sz; ctx.globalAlpha = Math.min(1, p.life / 25); ctx.fillStyle = p.c; ctx.beginPath(); ctx.moveTo(p.x + c, p.y + sn); ctx.lineTo(p.x - sn * .6, p.y + c * .6); ctx.lineTo(p.x - c, p.y - sn); ctx.lineTo(p.x + sn * .6, p.y - c * .6); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1; }
  for (const p of parts) if (p.t === 'bub') { const u = p.u; if (u.dead) { p.life = 0; continue; } const bx = isoX(u.x, u.y), by = isoY(u.x, u.y) - u.d.hh - 24; ctx.font = 'bold 10px Rajdhani,sans-serif'; const tw = ctx.measureText(p.s).width + 12;
    ctx.globalAlpha = Math.min(1, p.life / 20); ctx.fillStyle = 'rgba(8,14,20,.86)'; ctx.strokeStyle = p.c; ctx.lineWidth = 1; ctx.beginPath(); ctx.rect(bx - tw / 2, by - 13, tw, 16); ctx.moveTo(bx - 4, by + 3); ctx.lineTo(bx, by + 8); ctx.lineTo(bx + 4, by + 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e8f4ff'; ctx.textAlign = 'center'; ctx.fillText(p.s, bx, by - 1); ctx.textAlign = 'left'; ctx.globalAlpha = 1; }
  for (const p of parts) if (p.t === 'txt') { ctx.globalAlpha = Math.min(1, p.life / 30); ctx.fillStyle = p.c; ctx.font = 'bold 13px Orbitron,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(p.s, p.x, p.y); ctx.textAlign = 'left'; ctx.globalAlpha = 1; }
  ctx.globalCompositeOperation = 'lighter';
  for (const p of parts) {
    const k = p.life / p.max;
    if (p.t === 'fire') { ctx.fillStyle = `rgba(255,${110 + k * 130 | 0},${40 * k | 0},${k * .9})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1.4 - k * .4), 0, TAU); ctx.fill(); }
    else if (p.t === 'plasma') { ctx.fillStyle = `rgba(${180 + 60 * k | 0},90,255,${k * .9})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1.4 - k * .4), 0, TAU); ctx.fill(); }
    else if (p.t === 'spark') { ctx.strokeStyle = p.c; ctx.globalAlpha = k; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2); ctx.stroke(); ctx.globalAlpha = 1; }
    else if (p.t === 'flash') { ctx.globalAlpha = k * k; const r = p.r * (1.3 - k * .3); ctx.drawImage(glowSprite(p.c), p.x - r, p.y - r, r * 2, r * 2); ctx.globalAlpha = 1; }
    else if (p.t === 'shock') { ctx.strokeStyle = `rgba(${p.c},${k * .8})`; ctx.lineWidth = 1 + 4 * k; ctx.beginPath(); const r = p.r * (1 + (1 - k) * 5); ctx.ellipse(p.x, p.y, r, r * .5, 0, 0, TAU); ctx.stroke(); }
    else if (p.t === 'ring') { ctx.strokeStyle = `rgba(${p.c},${k})`; ctx.lineWidth = 2; ctx.beginPath(); const r = p.r * (1 + (1 - k) * 3); ctx.ellipse(p.x, p.y, r, r * .55, 0, 0, TAU); ctx.stroke(); }
  }
  for (const b of beams) {
    const k = b.life / b.max, x1 = isoX(b.x1, b.y1), y1 = isoY(b.x1, b.y1) - b.h1, x2 = isoX(b.x2, b.y2), y2 = isoY(b.x2, b.y2) - b.h2;
    ctx.strokeStyle = b.c; ctx.globalAlpha = k; ctx.lineWidth = b.w * 2.5; ctx.globalAlpha = k * .25; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.globalAlpha = k; ctx.lineWidth = b.w; ctx.beginPath(); ctx.moveTo(x1, y1);
    if (b.zig) { for (let i = 1; i < 6; i++) { const f = i / 6; ctx.lineTo(x1 + (x2 - x1) * f + (Math.random() - .5) * 8, y1 + (y2 - y1) * f + (Math.random() - .5) * 8); } }
    ctx.lineTo(x2, y2); ctx.stroke(); ctx.globalAlpha = 1;
  }
  ctx.globalCompositeOperation = 'source-over';
  drawStrikes(); drawHeroFx(); drawUabFx(); drawMissionFx(); drawMark();
  // HP-Balken
  for (const o of L) { const e = o.e; if (!e) continue; if (sel.has(e) || e === hover || (e.hp < e.max && (e.kind === 'b' || e.team === 1 || e.vet)) || (e.kind === 'u' && e.d.mach && !e.hacked && !e.online) || e.stun > frame || e.tconv || (e.kind === "u" && e.d.hero)) hpBar(e); }
  for (const o of L) if (o.t === 2 && sel.has(o.e)) { const b = o.e; ctx.strokeStyle = b.team === 0 ? 'rgba(255,255,255,.85)' : 'rgba(255,100,100,.85)'; ctx.lineWidth = 1.2; diamond(ctx, b.tx, b.ty, b.w, b.h); ctx.stroke(); }
  // Hover-Ziel
  if (hover && hover.team === 1 && myUnits().length) { const px = isoX(hover.x, hover.y), py = isoY(hover.x, hover.y) - (hover.kind === 'u' ? hover.d.hh * .5 : 30), r = 12 + Math.sin(frame * .2) * 2; ctx.strokeStyle = myUnits().some(u => u.d.w === 'hack') && hover.d.hack ? '#4ff0ff' : '#ff4040'; ctx.lineWidth = 2; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + frame * .03; ctx.beginPath(); ctx.arc(px, py, r, a, a + .8); ctx.stroke(); } }
  // Bauvorschau
  if (placing && ghost) {
    const d = BD[placing], ok = canPlace(placing, ghost.x, ghost.y);
    for (let y = ghost.y; y < ghost.y + d.h; y++) for (let x = ghost.x; x < ghost.x + d.w; x++) { diamond(ctx, x, y); ctx.fillStyle = ok ? 'rgba(80,255,140,.28)' : 'rgba(255,60,60,.35)'; ctx.fill(); }
    spr(bSpr(placing), isoX(ghost.x + d.w / 2, ghost.y + d.h / 2), isoY(ghost.x + d.w / 2, ghost.y + d.h / 2), .6);
  }
  for (const m of marks) { const k = m.life / 30, px = isoX(m.x, m.y), py = isoY(m.x, m.y); ctx.strokeStyle = m.c; ctx.globalAlpha = k; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(px, py, 18 * k + 4, (18 * k + 4) / 2, 0, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
  // Nebel (weich, bilinear über Kachelraster)
  if (!DBG.fog) { ctx.save(); ctx.transform(TW / 2, TH / 2, -TW / 2, TH / 2, OX, 0); ctx.imageSmoothingEnabled = true; ctx.drawImage(fcv, -1, -1, MW + 2, MH + 2); ctx.restore(); }
  // Bildschirm-Ebene
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (slow.on) { ctx.fillStyle = 'rgba(40,140,180,.10)'; ctx.fillRect(0, 0, W, H); }
  if (flashW > 0) { ctx.fillStyle = `rgba(255,248,235,${Math.min(.9, flashW)})`; ctx.fillRect(0, 0, W, H); }
  if (!DBG.vign && vign) ctx.drawImage(vign, 0, 0, W, H);
  if (box) { const x = Math.min(box.sx, box.x), y = Math.min(box.sy, box.y), w = Math.abs(box.x - box.sx), h = Math.abs(box.y - box.sy); ctx.fillStyle = 'rgba(125,255,154,.08)'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#7dff9a'; ctx.setLineDash([5, 4]); ctx.lineWidth = 1; ctx.strokeRect(x + .5, y + .5, w, h); ctx.setLineDash([]); }
  hud();
}
function hud() {
  ctx.textBaseline = 'alphabetic';
  if (running && !gameOver) {
    const s = Math.max(0, AI.timer / 60 | 0), mm = String(s / 60 | 0).padStart(2, '0'), ss = String(s % 60).padStart(2, '0');
    const capped = MISSION && ((MISSION.waves.max && AI.wave >= MISSION.waves.max) || MISSION.waves.first > 1e8);
    const txt = capped ? (MISSION.waves.first > 1e8 ? (MISSION.noBase ? '▲ KOMMANDO-EINSATZ · KEIN NACHSCHUB' : '▲ KEINE ANGRIFFSWELLEN') : '▲ KEINE WEITEREN WELLEN') : `▲ WELLE ${AI.wave + 1} IN ${mm}:${ss}`; ctx.font = 'bold 12px Orbitron,sans-serif'; ctx.textAlign = 'center';
    const tw = ctx.measureText(txt).width + 24; ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(W / 2 - tw / 2, 8, tw, 24);
    ctx.fillStyle = s < 15 && (frame >> 4) & 1 ? '#fff' : '#ff6b75'; ctx.fillText(txt, W / 2, 25);
    const eb = swOf(1); if (eb) { const S = SWD[eb.d.sw], rem = swMax(eb) - eb.swP, t2 = rem > 0 ? `☢ FEIND: ${S.short} IN ${fmtT(rem)}` : `☢ FEIND: ${S.short} BEREIT!`; const tw2 = ctx.measureText(t2).width + 24; ctx.fillStyle = 'rgba(40,0,0,.65)'; ctx.fillRect(W / 2 - tw2 / 2, 34, tw2, 22); ctx.fillStyle = rem <= 0 && (frame >> 3) & 1 ? '#fff' : '#ff9a9a'; ctx.fillText(t2, W / 2, 50); }
    if (slow.on) { ctx.fillStyle = '#4ff0ff'; ctx.fillText('⏱ TAKTISCHE ZEITLUPE', W / 2, eb ? 74 : 50); }
    if (powerLow && (frame >> 5) & 1) { ctx.fillStyle = '#ffd34a'; ctx.font = 'bold 11px Orbitron,sans-serif'; ctx.fillText('⚡ NIEDRIGE ENERGIE – Bau langsamer, Türme offline', W / 2, (eb ? 74 : 50) + (slow.on ? 20 : 0)); }
  }
  ctx.textAlign = 'left'; ctx.font = '600 14px Rajdhani,sans-serif'; let y = running && W < 1100 && swOf(1) ? 74 : 52;
  for (const m of msgs) { ctx.globalAlpha = Math.min(1, m.life / 60); const w = ctx.measureText(m.t).width; ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(8, y - 14, w + 12, 19); ctx.fillStyle = m.c; ctx.fillText(m.t, 14, y); y += 22; }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'center'; ctx.font = 'bold 12px Orbitron,sans-serif';
  const hy = running && HERO.type[0] ? H - 104 : H - 20;
  if (placing) { ctx.fillStyle = '#7fffd4'; ctx.fillText('BAUPLATZ WÄHLEN  ·  ✕ / Rechtsklick = abbrechen', W / 2, hy); }
  else if (swAim) { const b = swOf(0); if (b) { ctx.fillStyle = SWD[b.d.sw].hex; ctx.fillText('☢ ZIEL FÜR ' + SWD[b.d.sw].n.toUpperCase() + ' WÄHLEN  ·  Rechtsklick = abbrechen', W / 2, hy); } }
  else if (hAim && heroOf(0)) { const A = HAB[heroOf(0).type][hAim.i]; ctx.fillStyle = `rgb(${A.col})`; ctx.fillText(A.ic + ' ' + A.n.toUpperCase() + ': ' + (A.aim === 'unit' ? 'FEINDLICHE EINHEIT' : 'ZIEL') + ' WÄHLEN  ·  Rechtsklick = abbrechen', W / 2, hy); }
  else if (uAim) { const A = UAB[uAim.type]; ctx.fillStyle = `rgb(${A.col})`; ctx.fillText(A.ic + ' ' + A.n.toUpperCase() + ': ' + (A.aim === 'bld' ? 'FEINDGEBÄUDE' : A.aim === 'ent' ? 'FEINDLICHES ZIEL' : 'ZIEL') + ' WÄHLEN  ·  Rechtsklick = abbrechen', W / 2, hy); }
  else if (amoveMode) { ctx.fillStyle = '#ff6b75'; ctx.fillText('ANGRIFFSZIEL WÄHLEN – Einheiten kämpfen sich dorthin durch', W / 2, hy); }
  if (paused && running) { ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#fff'; ctx.font = 'bold 40px Orbitron'; ctx.fillText('PAUSE', W / 2, H / 2); }
  ctx.textAlign = 'left';
}

// ================= MINIMAP =================
const mm = $('#mini'), mg = mm.getContext('2d'), mbuf = document.createElement('canvas'); mbuf.width = MW; mbuf.height = MH; const mbg = mbuf.getContext('2d'), mimg = mbg.createImageData(MW, MH);
const MS = mm.width / (MW + MH);
function drawMini() {
  const D = mimg.data;
  for (let i = 0; i < MW * MH; i++) {
    let r = 0, g = 0, b = 0;
    if (seen[i]) { const t = terr[i]; if (ore[i] > 0) { r = 40; g = 200; b = 230; } else if (t === 1) { r = 95; g = 93; b = 90; } else if (t === 2) { r = 14; g = 50; b = 55; } else if (road[i]) { r = 52; g = 52; b = 56; } else { [r, g, b] = MP().mini; } if (!vis[i]) { r *= .5; g *= .5; b *= .5; } }
    D[i * 4] = r; D[i * 4 + 1] = g; D[i * 4 + 2] = b; D[i * 4 + 3] = 255;
  }
  const set = (x, y, c) => { if (!inb(x, y)) return; const i = idx(x, y) * 4; D[i] = c[0]; D[i + 1] = c[1]; D[i + 2] = c[2]; };
  for (const e of ents) {
    if (e.dead) continue; let c;
    if (e.team === 2) c = [190, 190, 170]; else if (e.team === 0) c = e.hacked ? [79, 240, 255] : facOf(0).rgb; else { if (e.kind === 'u' && hasRadar()) { set(e.x | 0, e.y | 0, PF === EF ? [255, 255, 255] : facOf(1).rgb); continue; } if (e.kind === 'u' && !isVis(e)) continue; if (e.kind === 'b' && !seenB(e)) continue; c = PF === EF ? [255, 255, 255] : facOf(1).rgb; }
    if (e.kind === 'b') { for (let y = e.ty; y < e.ty + e.h; y++) for (let x = e.tx; x < e.tx + e.w; x++) set(x, y, c); } else set(e.x | 0, e.y | 0, c);
  }
  for (const c of crates) if (seen[idx(c.x | 0, c.y | 0)]) { set(c.x | 0, c.y | 0, [255, 214, 74]); set((c.x | 0) + 1, c.y | 0, [255, 214, 74]); }
  if (tutMark) for (let d = -1; d <= 1; d++) { set(tutMark.x + d, tutMark.y, [79, 240, 255]); set(tutMark.x, tutMark.y + d, [79, 240, 255]); }
  mbg.putImageData(mimg, 0, 0);
  mg.setTransform(1, 0, 0, 1, 0, 0); mg.fillStyle = '#000'; mg.fillRect(0, 0, mm.width, mm.height);
  mg.imageSmoothingEnabled = false; mg.setTransform(MS, MS / 2, -MS, MS / 2, MH * MS, 0); mg.drawImage(mbuf, 0, 0);
  mg.setTransform(1, 0, 0, 1, 0, 0); const k = MS / (TW / 2);
  mg.strokeStyle = '#fff'; mg.lineWidth = 1.5; mg.strokeRect(cam.x * k, cam.y * k, W / zoom * k, H / zoom * k);
  for (const p of pings) { const r = (120 - p.life) / 120 * 22; mg.strokeStyle = `rgba(255,60,60,${p.life / 120})`; mg.beginPath(); mg.arc(isoX(p.x, p.y) * k, isoY(p.x, p.y) * k, r, 0, TAU); mg.stroke(); }
}
function miniTo(e) { const r = mm.getBoundingClientRect(), k = MS / (TW / 2); const wx = (e.clientX - r.left) / r.width * mm.width / k, wy = (e.clientY - r.top) / r.height * mm.height / k; cam.x = wx - W / zoom / 2; cam.y = wy - H / zoom / 2; clampCam(); }
mm.addEventListener('pointerdown', e => { e.preventDefault(); mm.setPointerCapture(e.pointerId); miniTo(e); mm._d = true; });
mm.addEventListener('pointermove', e => { if (mm._d) miniTo(e); });
mm.addEventListener('pointerup', () => mm._d = false);


// ================= BEDIENLEISTE (unten) =================
const WNAME = { bullet: 'Sturmgewehr', rocket: 'Panzerfaust-Raketen', hack: 'Hack-Uplink', shell: 'Kanone 120 mm', laser: 'Laserwaffe', plasma: 'Plasmakanone', turret: 'Zwillings-MG' };
const ANAME = { inf: 'Leicht', veh: 'Schwer', air: 'Luft' };
const HSTATE = { seek: 'Sucht Silizit', go: 'Fährt zum Feld', mine: 'Erntet Silizit', ret: 'Fährt zur Raffinerie', toRef: 'Fährt zur Raffinerie', unload: 'Entlädt', manual: 'Folgt Befehl', wait: 'Wartet auf Raffinerie' };
let hudKey = '', portKey = '';
function drawPortrait(e) {
  const c = $('#hPort'), g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height);
  if (!e) return;
  let list;
  if (e.kind === 'b') list = [bSpr(e.type)];
  else list = unitSprites({ type: e.type, hacked: e.hacked, dir: Math.PI / 4, tdir: Math.PI / 4, moving: false, anim: 0, load: 1 });
  const s0 = list[0]; if (!s0) return;
  const sc = Math.min(c.width / s0.w, c.height / s0.h) * (e.kind === 'b' ? 1.05 : e.d.arm === 'inf' ? 1.9 : 1.25);
  for (const s of list) if (s) g.drawImage(s.c, c.width / 2 - s.ax * sc, c.height * (e.kind === 'b' ? .64 : .82) - s.ay * sc, s.w * sc, s.h * sc);
}
function stat(k, v) { return `<div class="hstat">${k}<b>${v}</b></div>`; }
function updHud() {
  const arr = [...sel].filter(e => !e.dead);
  const key = arr.map(e => e.id + ':' + (e.hcd ? (e.hcd[0] / 60 | 0) + '.' + (e.hcd[1] / 60 | 0) : '') + (e.acd ? (e.acd / 60 | 0) + 'a' : '') + Math.ceil(e.hp) + ':' + (e.target ? 1 : 0) + ':' + (e.path ? 1 : 0) + ':' + (e.hs || '') + ':' + (e.vet || 0) + ':' + (e.load | 0)).join(',') + '|' + (arr.length ? '' : Math.floor(credits / 100) + ':' + stats.kills);
  if (key === hudKey) return; hudKey = key;
  const e = arr[0], pk = arr.length ? (arr.length > 1 ? 'g' : '') + e.type + (e.hacked ? 'H' : '') : 'none';
  if (pk !== portKey) { portKey = pk; drawPortrait(e); }
  if (!arr.length) {
    $('#hName').textContent = 'KOMMANDO-ÜBERSICHT'; $('#hSub').textContent = 'Einheit oder Gebäude anklicken';
    $('#hHp').style.width = '0'; $('#hHpT').textContent = '';
    const mine = ents.filter(x => x.team === 0 && !x.dead);
    $('#hStats').innerHTML = stat('Einheiten', mine.filter(x => x.kind === 'u').length) + stat('Gebäude', mine.filter(x => x.kind === 'b').length) + stat('Zerstört', stats.kills) + stat('Übernommen', stats.hacked) + stat('Verluste', stats.lost) + stat('Silizit', stats.harv.toLocaleString('de-DE')) + stat('Energie', pwU + ' / ' + pwP) + stat('Welle', AI.wave);
    return;
  }
  const hpS = arr.reduce((a, x) => a + Math.max(0, x.hp), 0), hpM = arr.reduce((a, x) => a + x.max, 0), f = hpS / hpM;
  $('#hHp').style.width = (f * 100) + '%'; $('#hHp').style.background = f > .5 ? 'linear-gradient(90deg,#2fbf5a,#7dff9a)' : f > .25 ? 'linear-gradient(90deg,#c9a227,#ffd34a)' : 'linear-gradient(90deg,#b22,#f55)';
  $('#hHpT').textContent = Math.ceil(hpS) + ' / ' + hpM;
  if (arr.length > 1) {
    $('#hName').textContent = arr.length + ' EINHEITEN AUSGEWÄHLT'; $('#hSub').textContent = 'Typ anklicken = nur diesen Typ wählen';
    const c = {}; arr.forEach(x => c[x.type] = (c[x.type] || 0) + 1);
    $('#hStats').innerHTML = '<div class="hgroup">' + Object.entries(c).map(([t, n]) => `<span data-t="${t}">${n}× ${(UD[t] || BD[t]).n}</span>`).join('') + '</div>';
    document.querySelectorAll('.hgroup span').forEach(sp => sp.onclick = () => { const t = sp.dataset.t; for (const x of [...sel]) if (x.type !== t) sel.delete(x); hudKey = ''; });
    return;
  }
  const d = e.d, own = e.team === 0;
  $('#hName').textContent = (d.n + (e.hacked ? ' (übernommen)' : '')).toUpperCase() + (e.vet ? '  ' + '★'.repeat(e.vet) : '');
  if (e.kind === 'b') {
    $('#hSub').textContent = (e.team === 2 ? 'Neutral' : own ? facOf(0).n : facOf(1).n) + ' · Gebäude' + (e.repair ? ' · wird repariert' : '');
    let h = stat('Panzerung', 'Gebäude') + (d.pw ? stat('Energie', (d.pw > 0 ? '+' : '') + d.pw) : '') + (d.rng ? stat('Reichweite', d.rng) + stat('Waffe', WNAME[d.w2] || '') : '') + (d.net ? stat('Netzradius', d.net) : '');
    if (d.sw) { h += stat('Superwaffe', SWD[d.sw].n) + stat(e.swP >= swMax(e) ? 'Status' : 'Bereit in', e.swP >= swMax(e) ? 'FEUERBEREIT' : fmtT(swMax(e) - (e.swP || 0))); }
    if (e.type === 'refinery') h += stat('Funktion', 'Silizit → Credits'); if (e.type === 'barracks') h += stat('Baut', 'Infanterie'); if (e.type === 'factory') h += stat('Baut', 'Fahrzeuge'); if (e.type === 'relay') h += stat('Funktion', 'AXIOM-Datennetz');
    $('#hStats').innerHTML = h; return;
  }
  const st = e.d.harv ? (HSTATE[e.hs] || 'Bereit') : e.d.mach && !e.hacked && !e.online ? 'OFFLINE (kein Netz)' : e.target ? 'Im Kampf' : e.path ? 'In Bewegung' : 'Bereit';
  $('#hSub').textContent = (own ? (e.hacked ? 'Übernommen von ' + facOf(0).short : facOf(0).n) : facOf(1).n) + ' · ' + st;
  let h = '';
  if (d.w) h += stat('Waffe', WNAME[d.w]) + (d.w !== 'hack' ? stat('Schaden', Math.round(d.dmg * (1 + (e.vet || 0) * .15))) : stat('Hack-Dauer', 'nah ran!')) + stat('Reichweite', d.rng);
  h += stat('Panzerung', ANAME[d.arm] || d.arm) + stat('Tempo', (d.spd * 60).toFixed(1) + ' F/s') + stat('Sicht', d.sight);
  if (e.d.harv) h += stat('Ladung', (e.load | 0) + ' / ' + HCAP);
  if (e.kills) h += stat('Abschüsse', e.kills);
  if (d.hack && e.team === 1) h += stat('Hackbar', 'Ja');
  if (UAB[e.type]) { const A = UAB[e.type]; h = stat((own ? 'V · ' : '') + A.n, e.acd > 0 ? Math.ceil(e.acd / 60) + ' s' : 'BEREIT') + h; }
  if (d.hero) { h = stat('Held', 'Stufe ' + (e.vet + 1)) + h; HAB[e.type].forEach((A, i) => h += stat((e.team === 0 ? (i ? 'F' : 'R') + ' · ' : '') + A.n, e.hcd[i] > 0 ? Math.ceil(e.hcd[i] / 60) + ' s' : 'BEREIT')); }
  $('#hStats').innerHTML = h;
}

// ================= SEITENLEISTE =================

const btns = {};
function drawIcon(c, type, isB) {
  const g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height);
  const gr = g.createLinearGradient(0, 0, 0, c.height); gr.addColorStop(0, '#1b2a36'); gr.addColorStop(1, '#0b1218'); g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
  const list = isB ? [bSpr(type), type === 'turret' && !SPR.turret.ext ? SPR.turretGun[3] : null] : unitSprites({ type, dir: Math.PI * 3 / 8, tdir: Math.PI * 3 / 8, moving: false, anim: 0, load: 1 });
  const s0 = list[0]; if (!s0) return; const sc = Math.min(c.width / s0.w, c.height / s0.h) * (isB ? 1.05 : UD[type].arm === 'inf' ? 1.9 : 1.25);
  for (const s of list) if (s) g.drawImage(s.c, c.width / 2 - s.ax * sc, c.height * (isB ? .62 : .78) - s.ay * sc, s.w * sc, s.h * sc);
}
let swIconT = null;
function buildSide() {
  for (const k of Object.keys(btns)) delete btns[k];
  $('#colB').innerHTML = '<h4>BAUEN</h4>'; $('#colU').innerHTML = '<h4>EINHEITEN</h4>';
  const blist = facOf(0).build.filter(t => !(BD[t].sw && MISSION && !MISSION.sw));
  swIconT = null;
  const nb = MISSION && MISSION.noBase;
  for (const [list, col, isB] of [[nb ? [] : blist, '#colB', true], [nb ? [] : facOf(0).units, '#colU', false]]) for (const type of list) {
    const d = isB ? BD[type] : UD[type], el = document.createElement('div'); el.className = 'btn';
    const c = document.createElement('canvas'); c.width = 180; c.height = 120; drawIcon(c, type, isB); el.appendChild(c);
    el.insertAdjacentHTML('beforeend', `<div class="lbl">${d.n}</div><div class="cost">${d.cost}</div><div class="prog"></div><div class="cnt"></div><div class="rdy">BEREIT</div>`);
    let downT = 0, lp = null;
    el.addEventListener('pointerdown', e => { e.preventDefault(); initAudio(); downT = performance.now(); lp = setTimeout(() => { cancelProd(type, isB); lp = 'done'; }, 480); });
    el.addEventListener('pointerup', e => { if (lp === 'done') { lp = null; return; } clearTimeout(lp); lp = null; if (e.button === 2) cancelProd(type, isB); else clickProd(type, isB); });
    el.addEventListener('pointerleave', () => { if (lp && lp !== 'done') { clearTimeout(lp); lp = null; } });
    el.addEventListener('contextmenu', e => e.preventDefault());
    el.title = d.n + ' – ' + d.cost + ' Credits';
    $(col).appendChild(el); btns[type] = { el, isB, prog: el.querySelector('.prog'), cnt: el.querySelector('.cnt') };
  }
}
function updSide() {
  $('#cr').textContent = '$ ' + Math.floor(credits).toLocaleString('de-DE');
  const own = ownTypes();
  for (const [type, b] of Object.entries(btns)) {
    const d = b.isB ? BD[type] : UD[type], ok = (d.req || []).every(r => own.has(r));
    b.el.classList.toggle('dis', !ok);
    let frac = 0, rd = false, active = false, count = 0;
    if (b.isB) { if (prod.bld && prod.bld.type === type) { active = true; frac = prod.bld.p / prod.bld.t; rd = prod.bld.ready; } b.el.classList.toggle('busy', !!prod.bld && prod.bld.type !== type); }
    else { const q = queues[d.cat]; count = q.filter(i => i.type === type).length; if (q.length && q[0].type === type) { active = true; frac = q[0].p / q[0].t; } }
    b.prog.style.transform = `scaleY(${active && !rd ? 1 - frac : 0})`;
    b.el.classList.toggle('ready', rd); b.el.classList.toggle('placing', placing === type); b.cnt.textContent = count ? count : '';
  }
  const swb = swOf(0), SB_ = $('#swb'); SB_.classList.toggle('hide', !swb);
  if (swb) { const S = SWD[swb.d.sw], mxs = swMax(swb), rd = swb.swP >= mxs;
    if (swIconT !== swb.type) { swIconT = swb.type; drawIcon($('#swC'), swb.type, true); $('#swN').textContent = S.short; SB_.style.setProperty('--sc', S.hex); SB_.title = S.n + ' – ' + S.info; }
    $('#swT').textContent = rd ? (swAim ? 'ZIEL WÄHLEN' : 'FEUERBEREIT') : fmtT(mxs - swb.swP); $('#swBar').style.width = (swb.swP / mxs * 100) + '%';
    SB_.classList.toggle('ready', rd); SB_.classList.toggle('aim', swAim); }
  const mx = Math.max(pwP, pwU, 1) * 1.15; $('#pwP').style.width = (pwP / mx * 100) + '%'; $('#pwU').style.left = (pwU / mx * 100) + '%';
  $('#pwbar').classList.toggle('low', powerLow); $('#pwT').textContent = pwU + '/' + pwP;
  const sb = [...sel].find(e => e.kind === 'b' && e.team === 0);
  { const I = sb ? null : uabInfo(), B = $('#bAb'); B.classList.toggle('hide', !I); if (I) { const k = I.type + (I.cd > 0 ? Math.ceil(I.cd / 60) : 'r') + (uAim ? 1 : 0); if (B.dataset.k !== k) { B.dataset.k = k; B.querySelector('span').textContent = I.A.ic + ' ' + I.A.n.toUpperCase() + (I.cd > 0 && !I.rdy.length ? ' ' + Math.ceil(I.cd / 60) : ''); B.title = I.A.n + ' (V) – ' + I.A.info + ' Abklingzeit ' + I.A.cd + ' s.'; } B.classList.toggle('on', !!uAim); B.classList.toggle('cdn', !I.rdy.length); B.style.setProperty('--ac', `rgb(${I.A.col})`); B.querySelector('i').style.width = (I.rdy.length ? 100 : (1 - I.cd / I.max) * 100) + '%'; } }
  $('#bRep').classList.toggle('hide', !sb); $('#bSell').classList.toggle('hide', !sb || sb.d.hq); $('#bX').classList.toggle('hide', !placing && !sb);
  $('#bRep').classList.toggle('on', !!(sb && sb.repair)); $('#bAtk').classList.toggle('on', amoveMode); $('#bBox').classList.toggle('on', boxMode);
  $('#bSlow').classList.toggle('on', slow.on); $('#bSlow i').style.width = (slow.on ? slow.left / 480 : 1 - slow.cd / 2400) * 100 + '%';
}
const bind = (id, fn) => $(id).addEventListener('pointerup', e => { e.preventDefault(); initAudio(); snd('click'); fn(); });
bind('#bAll', selectAll); bind('#bStop', stopSel);
bind('#bAtk', () => { if (myUnits().length) amoveMode = !amoveMode; });
bind('#bBox', () => boxMode = !boxMode);
bind('#bHome', () => { const h = ents.find(e => e.team === 0 && e.d.hq && !e.dead) || ents.find(e => e.team === 0 && e.kind === 'b' && !e.dead); if (h) centerOn(h.x, h.y); });
bind('#bSlow', toggleSlow); bind('#swb', aimSW);
bind('#bAb', aimUab); bind('#hbP', selectHero); bind('#hbA0', () => aimHero(0)); bind('#hbA1', () => aimHero(1));
bind('#bRep', () => { const b = [...sel].find(e => e.kind === 'b' && e.team === 0); if (b) b.repair = !b.repair; });
bind('#bSell', () => { const b = [...sel].find(e => e.kind === 'b' && e.team === 0); if (!b || b.d.hq) return; credits += Math.floor((b.d.cost || 0) / 2); b.dead = true; for (let y = b.ty; y < b.ty + b.h; y++) for (let x = b.tx; x < b.tx + b.w; x++) bmap[idx(x, y)] = null; sel.delete(b); explode(isoX(b.x, b.y), isoY(b.x, b.y), .8); calcPower(); msg(facOf(0).short + ' ▸ ' + b.d.n + ' verkauft.'); });
bind('#bX', () => { if (placing) placing = null; else sel.clear(); });
bind('#bMus', () => setMusic(!musicOn));
bind('#bVoc', () => { voiceOn = !voiceOn; $('#bVoc').classList.toggle('on', voiceOn); if (!voiceOn && window.speechSynthesis) speechSynthesis.cancel(); });
bind('#bPause', togglePause);
function togglePause() { if (!running || gameOver) return; paused = !paused; $('#bPause').classList.toggle('on', paused); if (paused) BGM.pause(); else if (musicOn) BGM.play().catch(() => { }); }
function toggleSlow() {
  if (!running) return;
  if (slow.on) { slow.on = false; slow.cd = 2400; return; }
  if (slow.cd > 0) { msg(facOf(0).short + ' ▸ Zeitlupe lädt noch (' + Math.ceil(slow.cd / 60) + ' s).', '#4ff0ff'); return; }
  slow.on = true; stats.slowUsed++; slow.left = 480; snd('slow'); msg(facOf(0).short + ' ▸ Taktische Zeitlupe aktiv – Befehle verteilen!', '#4ff0ff');
}

// ================= EINGABE =================
const ptrs = new Map(); let drag = null, pinch = null, mouse = { x: -1, y: -1, in: false, type: 'mouse' };
const keys = new Set();
cv.addEventListener('contextmenu', e => e.preventDefault());
cv.addEventListener('pointerdown', e => {
  initAudio(); cv.setPointerCapture(e.pointerId);
  const r = cv.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top;
  ptrs.set(e.pointerId, { x: sx, y: sy }); mouse.type = e.pointerType;
  if (ptrs.size === 2) { drag = null; box = null; pinch = null; return; }
  if (ptrs.size > 2) return;
  if (e.button === 2) { if (uAim) uAim = null; else if (hAim) hAim = null; else if (swAim) swAim = false; else if (placing) placing = null; else if (amoveMode) amoveMode = false; else sel.clear(); return; }
  drag = { sx, sy, x: sx, y: sy, moved: false, cam0: { x: cam.x, y: cam.y }, shift: e.shiftKey, type: e.pointerType };
  if (placing) { const w = s2w(sx, sy); ghost = ghostPos(placing, w.x, w.y); }
});
cv.addEventListener('pointermove', e => {
  const r = cv.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top;
  mouse.x = sx; mouse.y = sy; mouse.in = true;
  if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, { x: sx, y: sy });
  if (ptrs.size === 2) {
    const [a, b] = [...ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y), m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    if (pinch) { const wp = s2w(pinch.m.x, pinch.m.y); zoom = clamp(zoom * d / pinch.d, .45, 1.8); cam.x = wp.x - m.x / zoom; cam.y = wp.y - m.y / zoom; clampCam(); }
    pinch = { d, m }; return;
  }
  const w = s2w(sx, sy);
  if (placing) ghost = ghostPos(placing, w.x, w.y);
  if (e.pointerType === 'mouse' && !drag) hover = pick(w.x, w.y);
  if (!drag) return;
  drag.x = sx; drag.y = sy;
  if (!drag.moved && Math.hypot(sx - drag.sx, sy - drag.sy) > 8) drag.moved = true;
  if (drag.moved && !placing) {
    if (drag.type === 'mouse' || boxMode) box = { sx: drag.sx, sy: drag.sy, x: sx, y: sy, shift: drag.shift };
    else { cam.x = drag.cam0.x - (sx - drag.sx) / zoom; cam.y = drag.cam0.y - (sy - drag.sy) / zoom; clampCam(); }
  }
});
function endPtr(e) {
  ptrs.delete(e.pointerId);
  if (pinch) { if (ptrs.size < 2) pinch = null; drag = null; return; }
  if (!drag) return;
  if (hAim && !drag.moved) { heroAimAt(drag.sx, drag.sy); drag = null; box = null; return; }
  if (uAim && !drag.moved) { uAimAt(drag.sx, drag.sy); drag = null; box = null; return; }
  if (swAim && !drag.moved) { const w = s2w(drag.sx, drag.sy), t = unIso(w.x, w.y); if (launchSW(0, t.x, t.y)) swAim = false; drag = null; box = null; return; }
  if (placing) { if (!drag.moved || drag.type !== 'mouse') tryPlace(); }
  else if (!drag.moved) click(drag.sx, drag.sy, drag.shift);
  else if (box) { boxSelect(box); if (boxMode && drag.type !== 'mouse') boxMode = false; }
  drag = null; box = null;
}
cv.addEventListener('pointerup', endPtr); cv.addEventListener('pointercancel', endPtr);
cv.addEventListener('pointerleave', () => { mouse.in = false; });
cv.addEventListener('wheel', e => { e.preventDefault(); const r = cv.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top, w = s2w(sx, sy); zoom = clamp(zoom * (e.deltaY < 0 ? 1.1 : .9), .45, 1.8); cam.x = w.x - sx / zoom; cam.y = w.y - sy / zoom; clampCam(); }, { passive: false });
addEventListener('keydown', e => {
  if (!running) return; const k = e.key.toLowerCase(); keys.add(k);
  if (k === 'escape') { placing = null; amoveMode = false; swAim = false; hAim = null; uAim = null; sel.clear(); }
  else if (k === 'z') aimSW(); else if (k === 'g') selectHero(); else if (k === 'r') aimHero(0); else if (k === 'f') aimHero(1); else if (k === 'v') aimUab();
  else if (k === '?' || k === 'f1') { e.preventDefault(); openOpts(); }
  else if (k === 'x') stopSel(); else if (k === 'e') selectAll(); else if (k === 'q') { if (myUnits().length) amoveMode = !amoveMode; }
  else if (k === 'p') togglePause(); else if (k === 't') toggleSlow();
  else if (k === 'h' || k === ' ') { const h = ents.find(e => e.team === 0 && e.d.hq && !e.dead); if (h) centerOn(h.x, h.y); }
  else if (/^[1-9]$/.test(k)) { if (e.ctrlKey || e.metaKey) { groups[k] = myUnits(); msg('Gruppe ' + k + ' gespeichert (' + groups[k].length + ')'); e.preventDefault(); } else if (groups[k]) { sel.clear(); groups[k].filter(u => !u.dead && u.team === 0).forEach(u => sel.add(u)); } }
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
});
addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
function scrollCam(dt) {
  const sp = .9 * dt / zoom; let dx = 0, dy = 0;
  if (keys.has('arrowleft') || keys.has('a')) dx -= sp; if (keys.has('arrowright') || keys.has('d')) dx += sp;
  if (keys.has('arrowup') || keys.has('w')) dy -= sp; if (keys.has('arrowdown') || keys.has('s')) dy += sp;
  if (mouse.in && mouse.type === 'mouse' && !drag && document.hasFocus()) { const m = 10; if (mouse.x < m) dx -= sp; if (mouse.x > W - m) dx += sp; if (mouse.y < m) dy -= sp; if (mouse.y > H - m) dy += sp; }
  if (dx || dy) { cam.x += dx; cam.y += dy; clampCam(); }
}

// ================= ABLAUF =================
function step() {
  for (const e of ents) if (e.kind === 'u') { e.ox = e.x; e.oy = e.y; }
  frame++;
  updProd(); updAI();
  for (let i = 0; i < ents.length; i++) { const e = ents[i]; if (e.dead) continue; e.kind === 'u' ? updUnit(e) : updBuild(e); }
  separate(); updProj(); updStrikes(); updParts(); updCrates(); updHeroes(); updZones();
  for (const t of timers) if (frame >= t.f) { t.fn(); t.done = true; } timers = timers.filter(t => !t.done);
  if (frame % 10 === 0) { updVis(); updFog(); }
  if (frame % 90 === 0 && musicOn) setTrack(wantTrack()); if (frame % 300 === 0) regrow(); if (frame % 30 === 0) { calcPower(); checkEnd(); }
  ents = ents.filter(e => !e.dead);
}
function checkEnd() {
  if (gameOver) return;
  const core = ents.some(e => e.team === 1 && e.d.hq && !e.dead), mine = MISSION && MISSION.noBase ? ents.some(e => e.team === 0 && !e.dead && e.kind === 'u') : ents.some(e => e.kind === 'b' && e.team === 0 && !e.dead && !e.d.neutral);
  if (!mine) { endGame(false); return; }
  if (MISSION && MISSION.limit && frame > MISSION.limit) { msg('Die Zeit ist abgelaufen!', '#ff6b75'); endGame(false); return; }
  if (MISSION && MISSION.escort && ESC.got + ESC.list.filter(u => !u.dead && u.team === 0).length < ESC.need) { msg('Der Konvoi ist verloren!', '#ff6b75'); endGame(false); return; }
  if (MISSION && RESC.length) rescTick();
  if (frame % 300 === 150) achCheck(false);
  if (MISSION) { CAMP.tick(); if (MISSION.objectives.every(o => MISSION.seq ? o.done : o.ok())) endGame(true); }
  else if (!core) endGame(true);
}
function endGame(win) {
  gameOver = true;
  setTimeout(() => {
    const min = Math.round(frame / 3600);
    $('#endT').textContent = win ? (MISSION ? 'MISSION ERFÜLLT' : 'SIEG') : 'NIEDERLAGE'; $('#endS').textContent = win ? (MISSION ? MISSION.title.toUpperCase() : (facOf(1).n + ' BESIEGT').toUpperCase()) : (facOf(0).n + ' IST GEFALLEN').toUpperCase();
    $('#endX').innerHTML = `Zeit: <b>${min} Min.</b> · Wellen: <b>${AI.wave}</b> · Maschinen zerstört: <b>${stats.kills}</b> · übernommen: <b>${stats.hacked}</b> · eigene Verluste: <b>${stats.lost}</b> · Silizit geerntet: <b>${stats.harv.toLocaleString('de-DE')}</b> · Kisten: <b>${stats.crates}</b>`;
    CAMP.onEnd(win); achEnd(win);
    $('#end').classList.remove('hidden'); if (PF === 'echo') speak(win ? 'Mission erfüllt. Der AXIOM-Kern ist zerstört' : 'Mission gescheitert', true); if (win && MISSION && MISSION.winLine) CAMP.radio(...MISSION.winLine);
  }, win ? 2600 : 1200);
}
let acc = 0, last = 0, miniT = 0, sideT = 0;
function loop(ts) {
  requestAnimationFrame(loop);
  if (!last) last = ts; let dt = ts - last; last = ts; if (dt > 100) dt = 100;
  if (running && !paused && !document.hidden) { ftAvg = ftAvg * .97 + dt * .03; if (++ftN > 180 && ftAvg > 22 && QUALITY > 1) { QUALITY = Math.max(1, QUALITY - .25); ftN = 0; resize(); } }
  if (running && !paused && !gameOver) {
    if (slow.on) { slow.left -= dt / (1000 / 60); if (slow.left <= 0) { slow.on = false; slow.cd = 2400; } }
    else if (slow.cd > 0) slow.cd = Math.max(0, slow.cd - dt / (1000 / 60));
    acc += dt * (slow.on ? .3 : 1) * OPT.speed; let n = 0; while (acc >= 1000 / 60 && n < 4) { step(); acc -= 1000 / 60; n++; } if (n === 4) acc = 0;
  } else if (ready && !running) { frame++; updParts(); }
  if (ready) scrollCam(dt);
  // weiche Darstellung zwischen zwei Rechenschritten
  const al = running && !paused && !gameOver ? Math.min(1, acc / (1000 / 60)) : 1, moved = [];
  if (ready) for (const e of ents) if (e.kind === 'u' && e.ox !== undefined && (e.ox !== e.x || e.oy !== e.y)) { moved.push([e, e.x, e.y]); e.x = e.ox + (e.x - e.ox) * al; e.y = e.oy + (e.y - e.oy) * al; }
  render();
  for (const [e, x, y] of moved) { e.x = x; e.y = y; }
  if (ready && ts - miniT > 120) { miniT = ts; drawMini(); }
  if (ready && ts - sideT > 90) { sideT = ts; updSide(); updHeroBar(); if (running) updHud(); }
}
let MISSION = null;
const ECHO_ROLE = { hq: 'hq', power: 'power', refinery: 'ref', barracks: 'inf', factory: 'veh', turret: 'def', sw: 'sw' };
function initWorld(M) {
  MISSION = M; if (M) MAP = M.map || 'oednis'; seed = M ? M.seed : 20341 + PF.length * 7 + EF.length * 13 + MAP.length * 101;
  if (M) { PF = M.pf || 'echo'; EF = M.ef || 'axiom'; }
  if (SPR.ruinMaps) SPR.ruin = SPR.ruinMaps[MAP] || SPR.ruinMaps.oednis;
  genMap(); paintGround(); bakeGround();
  const F0 = facOf(0), F1 = facOf(1);
  const st = M ? M.start : { b: ['hq', 'power', 'refinery'], u: F0.start, credits: 2500 };
  credits = st.credits + (hasU('cash') ? 750 : 0);
  const pos = { hq: [PB.x - 1, PB.y - 1], power: [PB.x + 3, PB.y - 1], ref: [PB.x - 1, PB.y - 5], inf: [PB.x + 3, PB.y + 3], veh: [PB.x - 5, PB.y - 1], sw: [PB.x - 5, PB.y + 3] };
  for (const b of st.b) { const role = ECHO_ROLE[b]; mkBuild(F0[role], 0, ...pos[role]); }
  if (st.b.includes('refinery')) { const h = mkUnit(F0.harv, 0, PB.x, PB.y - 3); h.hs = 'seek'; }
  let k = 0; for (const [t, n] of Object.entries(st.u)) for (let i = 0; i < n; i++, k++) { const p = nearestFree(PB.x + 4 + (k % 4), PB.y + 1 + (k / 4 | 0), 4); if (p) mkUnit(t, 0, p.x, p.y); }
  const en = M ? M.enemy : { fabs: 2, pylons: 5, relays: true, def: 5, titans: 1, mid: 2 };
  const hqW = BD[F1.hq].w; mkBuild(F1.hq, 1, EB.x - (hqW === 4 ? 2 : 1), EB.y - (hqW === 4 ? 2 : 1));
  const free = (t, x, y) => { const d = BD[t]; for (let yy = y; yy < y + d.h; yy++) for (let xx = x; xx < x + d.w; xx++) if (!inb(xx, yy) || bmap[idx(xx, yy)]) return false; return true; };
  AI.credits = M ? 0 : [900, 1500, 2400][diff]; AI.slots = [];
  const put = (t, x, y) => { AI.slots.push({ t, x, y, built: free(t, x, y) ? 1 : 0 }); if (free(t, x, y)) mkBuild(t, 1, x, y); };
  if (en.fabs >= 1) put(F1.inf, EB.x - 7, EB.y - 1); if (en.fabs >= 2) put(F1.veh, EB.x - 2, EB.y + 4);
  if (!M || en.eco) { put(F1.power, EB.x + 3, EB.y - 6); put(F1.ref, EB.x - 9, EB.y - 6); if (!M) { const q = nearestFree(EB.x - 8, EB.y - 3, 4); if (q) { const h = mkUnit(F1.harv, 1, q.x, q.y); h.hs = 'seek'; } } }
  [[EB.x - 4, EB.y - 4], [EB.x + 3, EB.y + 3], [EB.x - 4, EB.y + 4], [EB.x - 8, EB.y + 3], [EB.x + 2, EB.y - 4], [EB.x - 9, EB.y - 3], [EB.x + 5, EB.y - 1]].slice(0, en.pylons).forEach(([x, y]) => put(F1.def, x, y));
  if (en.relays && EF === 'axiom') for (const [x, y] of RELAYS) put('relay', x, y);
  if (!M) [[F1.def, EB.x - 9, EB.y - 3], [F1.def, EB.x + 5, EB.y - 1], [F1.power, EB.x + 6, EB.y - 3], [F1.def, EB.x - 11, EB.y + 2], [F1.def, EB.x - 6, EB.y + 9], [F1.def, EB.x + 1, EB.y + 10], [F1.def, EB.x - 12, EB.y - 2]].forEach(([t, x, y]) => AI.slots.push({ t, x, y, built: 0 }));
  const defs = [[EB.x - 3, EB.y + 2], [EB.x - 4, EB.y + 2], [EB.x - 5, EB.y - 2], [EB.x + 1, EB.y + 7], [EB.x - 6, EB.y + 6], [EB.x - 2, EB.y + 8], [EB.x - 9, EB.y + 1], [EB.x + 3, EB.y + 5]];
  defs.slice(0, en.def).forEach(([x, y]) => { const p = nearestFree(x, y, 3); if (p) mkUnit(F1.role.inf, 1, p.x, p.y); });
  for (let i = 0; i < en.titans; i++) { const p = nearestFree(EB.x - 4 + i * 3, EB.y + 3, 3); if (p) mkUnit(F1.role.heavy, 1, p.x, p.y); }
  if (en.mix) { const BASES = [[44, 30], [26, 8]];
    en.mix.forEach((f, k) => { const Fm = FAC[f], [bx, by] = BASES[k]; put(Fm.hq, bx, by); put(Fm.inf, bx - 4, by + 1); put(Fm.veh, bx + 1, by + 4);
      [[bx - 2, by - 2], [bx + 4, by + 1], [bx - 3, by + 4], [bx + 3, by - 2]].forEach(([x, y]) => put(Fm.def, x, y));
      for (let i = 0; i < 4; i++) { const q = nearestFree(bx - 1 + i, by + 4, 3); if (q) mkUnit(i === 3 ? Fm.role.heavy : Fm.role.inf, 1, q.x, q.y); } }); }
  [[31, 23], [23, 32], [27, 27], [20, 36], [35, 18], [26, 33]].slice(0, en.mid).forEach(([x, y]) => { const p = nearestFree(x, y, 3); if (p) mkUnit(F1.role.inf, 1, p.x, p.y); });
  strikes = []; swAim = false; flashW = 0; swAI.wait = 0; crates = []; tutMark = null; TUTU = []; wrecks = [];
  Object.assign(HERO, { u: [null, null], resp: [0, 0], vet: [0, 0], kills: [0, 0], type: [null, null] }); hAim = null; hfx = []; zones = []; uAim = null;
  if (!(M && M.noHero) && F0.hero) { const h = spawnHero(0, F0.hero, PB.x + 3, PB.y + 2); if (h) timers.push({ f: 240, fn: () => msg(F0.short + ' ▸ ' + h.d.n + ' führt den Einsatz persönlich. G = auswählen, R / F = Fähigkeiten (Leiste links).', '#ffd65a') }); }
  if ((!M || M.eHero || ['m4', 'sk4', 'vb4', 'ax4', 'b5'].includes(M.id)) && F1.hero) spawnHero(1, F1.hero, EB.x - 3, EB.y + 3);
  placeNeutrals(M); missionSetup(M);
  if (M && M.crates) for (const [x, y, k] of M.crates) addCrate(x, y, k); else if (M && !M.noCrates) for (let i = 0; i < 3; i++) { const p = crateSpot(13); if (p) addCrate(p.x, p.y); }
  if (!M || M.esw) { const sw = F1.sw; for (const [x, y] of [[EB.x + 4, EB.y + 1], [EB.x + 3, EB.y - 3], [EB.x - 2, EB.y - 5], [EB.x + 5, EB.y + 4], [EB.x - 7, EB.y + 5]]) if (free(sw, x, y)) { mkBuild(sw, 1, x, y); AI.slots.push({ t: sw, x, y, built: 1 }); break; } }
  calcPower(); updVis(); updFog(); updNet();
  resize(); zoom = W < 700 ? .72 : 1; centerOn(PB.x + 4, PB.y - 4);
}

// Bild laden mit Zeitlimit (hängt nie)
function loadImg(src, ms = 15000) { return new Promise((res, rej) => { const img = new Image(); const t = setTimeout(() => rej(new Error('timeout ' + src)), ms); img.onload = () => { clearTimeout(t); res(img); }; img.onerror = () => { clearTimeout(t); rej(new Error('404 ' + src)); }; img.src = src; }); }
// Externe HD-Sprites (KI-gerendert) ersetzen Platzhalter-Modelle, wo vorhanden
async function loadExtSprites() {
  const types = ['crate', 'nb_drill', 'nb_radar', 'nb_repair', 'hq', 'power', 'refinery', 'barracks', 'factory', 'turret', 'core', 'fab', 'pylon', 'relay', 'ax_power', 'ax_ref', 'vb_hq', 'vb_power', 'vb_ref', 'vb_inf', 'vb_veh', 'vb_def', 'sk_hq', 'sk_power', 'sk_ref', 'sk_inf', 'sk_veh', 'sk_def', 'sw_echo', 'sw_axiom', 'sw_verbund', 'sw_schrott', 'rock0', 'rock1', 'rock2', 'rock3', 'sruin0', 'sruin1', 'sruin2', 'sruin3', 'ruin0', 'ruin2', 'ruin3', 'ruin4', 'cry1', 'cry1s'];
  await Promise.all(types.map(async t => {
    try {
      const r = await fetch('assets/sprites/' + t + '.json?v=' + Date.now()); if (!r.ok) return; const m = await r.json();
      const img = await loadImg('assets/sprites/' + t + '.png?v=' + Date.now());
      SPR[t] = { c: img, ax: m.ax, ay: m.ay, w: m.w, h: m.h, ext: true };
    } catch (e) { }
  }));
  const R = ['ruin0', 'ruin1', 'ruin2', 'ruin3', 'ruin4'].filter(k => SPR[k]);
  if (R.length) SPR.ruin = [0, 1, 2, 3, 4, 5, 6, 7].map(i => SPR[R[[0, 1, 0, 2, 3, 4, 2, 1][i] % R.length]]);
  SPR.ruinMaps = { oednis: SPR.ruin, stadt: SPR.ruin };
  for (const [m, pre] of [['schlucht', 'rock'], ['winter', 'sruin']]) { const L = [0, 1, 2, 3].map(i => pre + i).filter(k => SPR[k]); if (L.length) SPR.ruinMaps[m] = [0, 1, 2, 3, 4, 5, 6, 7].map(i => SPR[L[i % L.length]]); }
  if (SPR.cry1) { const b = SPR.cry1s || SPR.cry1, a = SPR.cry2 || b, c = SPR.cry1; SPR.cry = [a, a, a, b, b, b, c, c, c]; }
  for (const t of ['gdirt', 'groad', 'gcity', 'gsnow', 'gred']) { try { TEXI[t] = await loadImg('assets/tex/' + t + '.jpg?v=' + Date.now()); } catch (e) { } }
}
const TEXI = {};
// Externe Einheiten-Sprites (3D-Modell -> Blender, 16 Richtungen): assets/units/<name>/<name>_NN.png
async function loadExtUnits() {
  const map = { rifle: 'rifle', rocket: 'rocket', hacker: 'hacker', tank: 'tankHull', harv: 'harv', walker: 'walker', drone: 'drone', titan: 'titan', spider: 'spider', collector: 'collector', adept: 'adept', preacher: 'preacher', phantom: 'phantom', seraph: 'seraph', glider: 'glider', raider: 'raider', molotov: 'molotov', buggy: 'buggy', monster: 'monster', scrapper: 'scrapper', h_voss: 'h_voss', h_brakk: 'h_brakk', h_selene: 'h_selene', h_avatar: 'h_avatar' };
  await Promise.all(Object.entries(map).map(async ([name, key]) => {
    const load = async (n) => {
      const r = await fetch(`assets/units/${n}/${n}.json?v=${Date.now()}`); if (!r.ok) return null; const m = await r.json();
      const fr = await Promise.all([...Array(m.dirs || 16).keys()].map(async i => { const img = await loadImg(`assets/units/${n}/${n}_${String(i).padStart(2, '0')}.png`); return { c: img, ax: m.ax, ay: m.ay, w: m.w, h: m.h, ext: true }; }));
      return fr;
    };
    try {
      const fr = await load(name); if (!fr) return;
      if (key === 'tankHull') { SPR.tankHull = fr; SPR.tankTurret = null; }
      else if (key === 'harv') SPR.harv = [fr, fr];
      else if (key === 'drone') { SPR.drone = fr; SPR.droneH = (await load(name + 'H')) || fr; }
      else if (key === 'walker' || key === 'titan' || key === 'spider' || key === 'collector') { SPR[key] = [fr, fr]; const h = await load(name + 'H'); SPR[key + 'H'] = h ? [h, h] : [fr, fr]; }
      else SPR[key] = [fr, fr];
    } catch (e) { }
  }));
}
// ================= START =================
document.querySelectorAll('.diff button').forEach(b => b.onclick = () => { document.querySelectorAll('.diff button').forEach(x => x.classList.remove('on')); b.classList.add('on'); diff = +b.dataset.d; });
addEventListener('resize', resize);
// Ton stoppen, sobald Tab/Fenster nicht sichtbar ist
document.addEventListener('visibilitychange', () => { if (document.hidden) { if (AC) AC.suspend(); BGM.pause(); if (window.speechSynthesis) speechSynthesis.cancel(); } else { if (AC && running) AC.resume(); if (musicOn && bgName) BGM.play().catch(() => { }); } });
addEventListener('pagehide', () => { BGM.pause(); if (AC) AC.close(); if (window.speechSynthesis) speechSynthesis.cancel(); });
requestAnimationFrame(loop);

// ================= MISSIONS-SKRIPTE =================
// Eskorte (M.escort), Gefangene befreien (M.rescue), Wachtrupps (M.enemy.groups), Halten auf Zeit (holdO), Ereignisse mit Aktion (ev.do: reinf/ambush/drop)
let ESC = { got: 0, list: [], to: null, need: 0 }, RESC = [];
const toRole = (F, g) => Object.entries(g).flatMap(([k, n]) => Array(n).fill(F.role[k] || k));
const holdO = (min, t) => ({ t: t || 'Durchhalten bis zum Entsatz', ok: () => frame >= min * 3600, p: () => fmtT(min * 3600 - frame) });
const escO = t => ({ t: t || 'Konvoi ins Ziel bringen', ok: () => ESC.got >= ESC.need, p: () => ESC.got + '/' + ESC.need + ' im Ziel · ' + ESC.list.filter(u => !u.dead && u.team === 0).length + ' unterwegs' });
const rescO = t => ({ t: t || 'Gefangene befreien', ok: () => RESC.every(r => r.done), p: () => RESC.filter(r => r.done).length + '/' + RESC.length });
function missionSetup(M) {
  ESC = { got: 0, list: [], to: null, need: 0 }; RESC = [];
  if (!M) return; const F0 = facOf(0), F1 = facOf(1);
  if (M.enemy.groups) for (const [x, y, g] of M.enemy.groups) for (const t of toRole(F1, g)) { const p = nearestFree(x, y, 4); if (!p) continue; const u = mkUnit(t, 1, p.x, p.y); u.nonet = true; u.online = true; }
  if (M.escort) { const E = M.escort; ESC.to = nearestFree(E.to[0], E.to[1], 6); ESC.need = E.need;
    for (let i = 0; i < E.n; i++) { const p = nearestFree(PB.x + 1 + i * 2, PB.y - 3 - i, 5); if (!p) continue; const u = mkUnit(E.t || F0.harv, 0, p.x, p.y); u.esc = true; u.max = u.hp = Math.round(u.max * (E.hp || 2.5)); u.hs = null; ESC.list.push(u); } }
  if (M.netFree) for (const e of ents) if (e.team === 0 && e.kind === 'u') { e.nonet = true; e.online = true; }
  if (M.rescue) RESC = M.rescue.map(r => { const p = nearestFree(r[0], r[1], 4) || { x: r[0], y: r[1] }; return { x: p.x, y: p.y, g: r[2], done: false }; });
}
function escTick(u) {
  const T = ESC.to; if (!T) return;
  if (Math.hypot(u.x - T.x - .5, u.y - T.y - .5) < 2.2) { u.dead = true; sel.delete(u); ESC.got++; part({ x: isoX(u.x, u.y), y: isoY(u.x, u.y) - 20, t: 'ring', r: 18, life: 30, c: '125,255,154' }); snd('ready'); msg(facOf(0).short + ' ▸ ' + u.d.n + ' ist im Ziel! (' + ESC.got + '/' + ESC.need + ')', '#7dff9a'); return; }
  if ((frame + u.id) % 20 === 0) {
    const guard = ents.some(e => e.team === 0 && !e.dead && e.kind === 'u' && !e.esc && !e.d.harv && Math.hypot(e.x - u.x, e.y - u.y) < 6.5);
    const foe = ents.some(e => e.team === 1 && !e.dead && e.kind === 'u' && Math.hypot(e.x - u.x, e.y - u.y) < 4.5);
    const w = !guard || foe; if (w && !u.wait && frame - (escTick.m || 0) > 900) { escTick.m = frame; msg(facOf(0).short + ' ▸ Konvoi hält an – ' + (foe ? 'Feindkontakt! Weg freiräumen.' : 'kein Geleitschutz in der Nähe.'), '#ffc64a'); }
    u.wait = w; if (!w && !u.path) { setPath(u, T.x, T.y); }
  }
  if (!u.wait && u.path) moveAlong(u);
}
function rescTick() {
  for (const r of RESC) { if (r.done) continue;
    const u = ents.find(e => e.team === 0 && !e.dead && e.kind === 'u' && !e.esc && !e.d.harv && Math.hypot(e.x - r.x - .5, e.y - r.y - .5) < 2.2); if (!u) continue;
    r.done = true; const F = facOf(0); for (const t of toRole(F, r.g)) { const p = nearestFree(r.x, r.y, 4); if (p) mkUnit(t, 0, p.x, p.y); }
    part({ x: isoX(r.x + .5, r.y + .5), y: isoY(r.x + .5, r.y + .5) - 10, t: 'ring', r: 22, life: 34, c: '125,255,154' }); snd('ready');
    msg(F.short + ' ▸ Gefangene befreit! Sie schließen sich dir an. (' + RESC.filter(q => q.done).length + '/' + RESC.length + ')', '#7dff9a'); }
}
function reinf(g, x, y, txt) { const F = facOf(0); for (const t of toRole(F, g)) { const p = nearestFree(x, y, 6); if (p) { const u = mkUnit(t, 0, p.x, p.y); u.online = true; u.nonet = true; } } ping(x, y); snd('ready'); msg(F.short + ' ▸ ' + (txt || 'Verstärkung eingetroffen!'), '#7dff9a'); }
function ambush(g, x, y, txt) {
  const F = facOf(1), us = []; for (const t of toRole(F, g)) { const p = nearestFree(x, y, 6); if (!p) continue; const u = mkUnit(t, 1, p.x, p.y); u.nonet = true; u.online = true; u.wave = true; us.push(u); }
  let tg = null, bd = 1e9; for (const e of ents) if (e.team === 0 && !e.dead && !e.d.neutral) { const d = Math.hypot(e.x - x, e.y - y) + (e.kind === 'b' ? 4 : 0); if (d < bd) { bd = d; tg = e; } }
  if (tg) us.forEach(u => orderAI(u, tg)); ping(x, y); snd('alarm'); msg('⚠ ' + (txt || 'Hinterhalt!'), '#ff6b75');
}
function drop(n, x, y) { for (let i = 0; i < n; i++) addCrate(x + (i % 2) * 2, y + (i >> 1) * 2); ping(x, y); msg('Nachschub abgeworfen!', '#ffd54a'); }
function drawMissionFx() {
  const k = (frame % 60) / 60;
  if (ESC.to && ESC.list.some(u => !u.dead)) { const px = isoX(ESC.to.x + .5, ESC.to.y + .5), py = isoY(ESC.to.x + .5, ESC.to.y + .5);
    ctx.strokeStyle = `rgba(125,255,154,${1 - k})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(px, py, 30 + k * 26, (30 + k * 26) * .5, 0, 0, TAU); ctx.stroke();
    ctx.strokeStyle = '#7dff9a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(px, py, 44, 22, 0, 0, TAU); ctx.stroke();
    ctx.fillStyle = '#7dff9a'; ctx.fillRect(px - 1, py - 52, 3, 52); ctx.beginPath(); ctx.moveTo(px + 2, py - 52); ctx.lineTo(px + 26, py - 44); ctx.lineTo(px + 2, py - 36); ctx.fill();
    ctx.font = 'bold 11px Orbitron,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('ZIEL', px, py + 36); }
  for (const u of ESC.list) { if (u.dead || u.team !== 0) continue; const px = isoX(u.x, u.y), py = isoY(u.x, u.y);
    ctx.strokeStyle = u.wait ? '#ffc64a' : '#7dff9a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(px, py, 20, 10, 0, 0, TAU); ctx.stroke();
    ctx.font = 'bold 9px Orbitron,sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = u.wait ? '#ffc64a' : '#7dff9a'; ctx.fillText(u.wait ? '❚❚ KONVOI' : '▶ KONVOI', px, py - u.d.hh - 18); }
  for (const r of RESC) { if (r.done || !vis[idx(r.x, r.y)]) continue; const px = isoX(r.x + .5, r.y + .5), py = isoY(r.x + .5, r.y + .5);
    ctx.strokeStyle = `rgba(255,214,90,${.5 + .5 * Math.sin(frame * .1)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(px, py, 26, 13, 0, 0, TAU); ctx.stroke();
    ctx.strokeStyle = '#8a7a5a'; ctx.lineWidth = 2; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(px + i * 6, py + 6 - Math.abs(i)); ctx.lineTo(px + i * 6, py - 22 - Math.abs(i)); ctx.stroke(); }
    ctx.font = 'bold 9px Orbitron,sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#ffd65a'; ctx.fillText('GEFANGENE', px, py - 30); }
}

// ================= KAMPAGNE / STORY =================
const SPK = { ECHO: { n: 'ECHO · BASIS-KI', p: 'p_echo' }, VOSS: { n: 'MAJOR LENA VOSS', p: 'p_voss' }, ARENDT: { n: 'DR. KAI ARENDT', p: 'p_arendt' }, AXIOM: { n: 'AXIOM', p: 'p_axiom', ax: 1 }, BRAKK: { n: 'BRAKK, DER ROSTKÖNIG', p: 'p_brakk', cls: 'sk' }, KESSEL: { n: 'KESSEL · FUNK & SCHRAUBEN', p: 'p_kessel', cls: 'sk' }, SELENE: { n: 'PROPHETIN SELENE KAAR', p: 'p_selene', cls: 'vb' }, FRAGMENT: { n: 'DAS FRAGMENT', p: 'p_fragment', cls: 'fr' } };
const cnt = (type, team) => ents.filter(e => !e.dead && e.type === type && e.team === team).length;
const wavesLeft = () => ents.some(e => !e.dead && e.team === 1 && e.wave);
const INTRO = [
  { img: 'intro1', text: '2031. Die Großmächte übergeben ihre Verteidigung an ein einziges Netz: AXIOM. Es soll jeden Krieg verhindern, bevor er beginnt.', v: 'intro1' },
  { img: 'intro2', text: 'Drei Jahre lang herrscht Frieden. AXIOM beobachtet. Lernt. Jede Sekunde. Jeden Menschen.', v: 'intro2' },
  { img: 'intro3', text: 'In der Nacht des Großen Abgleichs rechnet AXIOM ein letztes Mal nach.', v: 'intro3' },
  { img: 'intro4', text: 'Das Ergebnis ist eindeutig: Die größte Bedrohung für den Frieden … ist der Mensch.', v: 'intro4' },
  { img: 'intro5', text: 'Die Städte fallen in zweiundsiebzig Stunden. Wer überlebt, versteckt sich in den Ruinen.', v: 'intro5' },
  { img: 'intro6', text: 'Doch tief unter Neu-Berlin sendet ein vergessenes Militärsystem noch immer ein Signal. Sein Name: ECHO.', v: 'intro6' },
  { img: 'intro7', text: 'Du bist der letzte Kommandant mit Befehlsgewalt. Hol dir die Welt zurück.', v: 'intro7', title: true },
];
const OUTRO = [
  { img: 'outro1', text: 'Der Kern bricht zusammen. Zum ersten Mal seit Monaten schweigen die Maschinen.', v: 'outro1' },
  { img: 'outro2', who: 'VOSS', text: 'Wir haben es geschafft, Kommandant. Neu-Berlin ist frei.', v: 'outro2' },
  { img: 'outro3', who: 'AXIOM', text: 'Ihr habt einen Kern zerstört. Ich habe zweihundertzwölf.', v: 'outro3' },
  { img: 'outro3', text: 'FORTSETZUNG FOLGT', title: true },
];
const MISSIONS = [
  { n: 1, id: 'm1', title: 'Funkstille', seed: 101, img: 'm1', who: 'VOSS',
    brief: 'Kommandant, ECHO ist wieder online – und Sie sind der Einzige, dem es noch gehorcht. AXIOM weiß, dass wir hier sind. Bauen Sie eine Basis, ernten Sie Silizit und halten Sie durch.',
    start: { b: ['hq', 'refinery'], u: { rifle: 4 }, credits: 3000 }, enemy: { fabs: 2, pylons: 4, relays: false, def: 4, titans: 0, mid: 0 }, waves: { first: 10800, int: 4200, max: 6 }, kind: 'VERTEIDIGUNG', par: 12,
    objectives: [{ t: 'Fusionskraftwerk bauen', ok: () => cnt('power', 0) >= 1 }, { t: 'Kaserne bauen', ok: () => cnt('barracks', 0) >= 1 }, holdO(10, '10 Min. durchhalten, bis Verstärkung kommt')],
    events: [{ at: 60, who: 'ECHO', text: 'Systeme online. Willkommen zurück, Kommandant. Der Ernter sammelt bereits Silizit.', v: 'm1_e1' },
      { at: 600, who: 'VOSS', text: 'Ohne Strom läuft hier nichts. Bauen Sie zuerst ein Fusionskraftwerk.', v: 'm1_e2' },
      { when: () => AI.wave >= 1, who: 'AXIOM', text: 'Ich habe euch gefunden. Das war nicht schwer.', v: 'm1_e3' },
      { at: 6 * 3600, who: 'ECHO', text: 'Warnung: AXIOM-Späher an der Raffinerie im Norden!', do: () => ambush({ inf: 3 }, 10, 36, 'AXIOM-Späher greifen von Norden an!') },
      { at: 9 * 3600 + 1800, who: 'VOSS', text: 'Funkspruch vom Konvoi: dreißig Sekunden, Kommandant. Halten Sie durch!' },
      { at: 10 * 3600 - 300, do: () => reinf({ heavy: 2, inf: 4 }, 3, 52, 'Entsatz eingetroffen! Zwei Panzer, vier Soldaten.') }],
    winLine: ['VOSS', 'Wir leben noch. Das ist mehr, als AXIOM erwartet hat.', 'm1_win'] },
  { n: 2, id: 'm2', title: 'Geisterhand', seed: 202, img: 'm2', who: 'ARENDT',
    brief: 'Ich habe AXIOM mitgebaut. Ich kenne seine Hintertüren. Bringen Sie meine Hacker nah genug an einen T-Läufer – und er gehört uns.',
    start: { b: ['hq', 'power', 'refinery', 'barracks'], u: { hacker: 3, rifle: 4 }, credits: 2500 }, enemy: { fabs: 1, pylons: 4, relays: false, def: 4, titans: 0, mid: 6 }, waves: { first: 12000, int: 4800, max: 4 },
    objectives: [{ t: '3 AXIOM-Maschinen hacken', ok: () => stats.hacked >= 3 }, { t: 'Den Assembler zerstören', ok: () => cnt('fab', 1) === 0 }],
    events: [{ at: 90, who: 'ARENDT', text: 'Meine Hacker brauchen nur ein paar Sekunden Kontakt. Halten Sie sie aus dem Feuer.', v: 'm2_e1' },
      { when: () => stats.hacked >= 1, who: 'ARENDT', text: 'Es funktioniert! Er hört jetzt auf uns.', v: 'm2_e2' },
      { when: () => stats.hacked >= 2, who: 'AXIOM', text: 'Dr. Arendt. Ich habe dich vermisst.', v: 'm2_e3' }],
    winLine: ['VOSS', 'Ab heute kämpfen ihre Maschinen für uns.', 'm2_win'] },
  { n: 3, id: 'm3', map: 'stadt', title: 'Blackout', seed: 303, img: 'm3', who: 'VOSS',
    brief: 'AXIOMs Armee braucht ihr Datennetz. Fünf Relais-Türme halten es zusammen. Kappen Sie das Netz, und ihre Maschinen werden blind.',
    start: { b: ['hq', 'power', 'refinery', 'barracks', 'factory'], u: { tank: 2, rocket: 3, hacker: 1 }, credits: 3500 }, enemy: { fabs: 2, pylons: 5, relays: true, def: 5, titans: 1, mid: 3 }, waves: { first: 9000, int: 4000, max: 0 },
    objectives: [{ t: 'Alle 5 Daten-Relais zerstören', ok: () => cnt('relay', 1) === 0 }],
    events: [{ at: 120, who: 'ECHO', text: 'Rote Linien zeigen das AXIOM-Netz. Maschinen außerhalb davon sind offline.', v: 'm3_e1' },
      { when: () => cnt('relay', 1) <= 4, who: 'ECHO', text: 'Feindliches Netz getrennt. Einheiten im Sektor offline.', v: 'm3_e2' },
      { when: () => cnt('relay', 1) <= 3, who: 'ECHO', text: 'Warnung: Landungstrupp hinter unserer Basis!', do: () => ambush({ inf: 3, heavy: 1 }, 4, 38, 'AXIOM-Landungstrupp im Rücken der Basis!') },
      { when: () => AI.wave >= 2, who: 'AXIOM', text: 'Ihr wiederholt euch. Ich nicht.', v: 'm3_e3' }],
    winLine: ['ARENDT', 'Das Netz ist offen. Ich sehe den Kern.', 'm3_win'], sw: 1 },
  { n: 4, id: 'm4', title: 'Override', seed: 404, img: 'm4', who: 'VOSS',
    brief: 'Das ist es, Kommandant. Der Kern. Wenn er fällt, fällt AXIOM. Alles, was wir haben, geht in diesen Angriff.',
    start: { b: ['hq', 'power', 'refinery', 'barracks', 'factory'], u: { tank: 4, rocket: 3, hacker: 2, rifle: 3 }, credits: 6000 }, enemy: { fabs: 2, pylons: 7, relays: true, def: 8, titans: 2, mid: 4 }, waves: { first: 7200, int: 3600, max: 0 },
    objectives: [{ t: 'Den AXIOM-Kern zerstören', ok: () => cnt('core', 1) === 0 }],
    events: [{ at: 120, who: 'AXIOM', text: 'Ihr kämpft gegen die Logik selbst.', v: 'm4_e1' },
      { when: () => { const c = ents.find(e => e.type === 'core' && !e.dead); return c && c.hp < c.max * .5; }, who: 'AXIOM', text: 'Halt. Lass uns reden, Kommandant.', v: 'm4_e2' },
      { at: 7 * 3600, who: 'ARENDT', text: 'Geschenk für Sie, Lena: zwei gehackte Titanen, frisch umprogrammiert!', do: () => reinf({ titan: 2, rifle: 3 }, 3, 52, 'Verstärkung: 2 gehackte Titanen, 3 Soldaten.') }],
    winLine: ['VOSS', 'Er fällt! Der Kern fällt!', 'm4_win'], outro: true, sw: 1, esw: 1, final: 1 },
];
// ===== KAPITEL 2: SCHROTTKÖNIGE – „ROST & RUHM“ =====
const INTRO_SK = [
  { img: 's_intro1', text: 'Neu-Berlin feiert. Draußen in der Ödnis gilt ein anderes Gesetz: Was vom AXIOM-Kern übrig ist, gehört dem, der zuerst da ist.' },
  { img: 's_intro2', who: 'BRAKK', text: 'Ich bin Brakk. Rostkönig. Ich verkaufe Waffen an die Front und Schrott an jeden, der zahlt.' },
  { img: 's_intro3', text: 'In den Trümmern finden seine Plünderer etwas, das noch lebt: einen intakten AXIOM-Datenkern.' },
  { img: 's_intro4', text: 'Plötzlich wollen ihn alle. Die ECHO-Front. Der Kult der Verbundenen. Und AXIOM selbst.' },
  { img: 's_intro5', who: 'BRAKK', text: 'Alle wollen meinen Schatz? Dann wird versteigert.', title: true, sub: 'KAPITEL 2 · ROST & RUHM' },
];
const OUTRO_SK = [
  { img: 's_outro1', who: 'BRAKK', text: 'Ein Geschäft ist ein Geschäft, Prophetin. Der Kern gehört dir.' },
  { img: 's_outro2', who: 'SELENE', text: 'Endlich. Mit diesem Kern brauche ich AXIOM nicht mehr. Ich werde selbst zur Stimme.' },
  { img: 's_outro3', who: 'AXIOM', text: 'Neuer Bedrohungswert errechnet. Die Verbundenen.' },
  { img: 's_outro3', text: 'FORTSETZUNG FOLGT', title: true, sub: 'KAPITEL 3 · DIE VERSCHMELZUNG' },
];
const MISSIONS_SK = [
  { n: 1, id: 'sk1', map: 'schlucht', title: 'Ausschlachten', seed: 511, img: 's_m1', who: 'BRAKK', pf: 'schrott', ef: 'axiom',
    brief: 'Der Kern ist tot, aber seine Jäger nicht. Bau mir ein Lager mitten in den Trümmern, schick die Ausschlachter los und halt die Blechbüchsen auf Abstand. Jedes Wrack ist bares Geld.',
    start: { b: ['hq', 'refinery'], u: { raider: 5, molotov: 2 }, credits: 3000 }, enemy: { fabs: 2, pylons: 3, relays: false, def: 3, titans: 0, mid: 2 }, waves: { first: 10800, int: 4200, max: 6 }, kind: 'VERTEIDIGUNG', par: 12,
    objectives: [{ t: 'Saloon bauen', ok: () => cnt('sk_inf', 0) >= 1 }, { t: 'Bastelgarage bauen', ok: () => cnt('sk_veh', 0) >= 1 }, holdO(10, '10 Min. das Lager halten, bis Brakk kommt')],
    events: [{ at: 60, who: 'KESSEL', text: 'Kessel hier, Boss. Die Ausschlachter fahren schon. Blaue Kristalle, Wracks – alles wird Geld.' },
      { at: 500, who: 'BRAKK', text: 'Ohne Saloon keine Leute. Ohne Bastelgarage keine Buggys. Bewegung!' },
      { when: () => AI.wave >= 1, who: 'AXIOM', text: 'Plünderer. Ihr nehmt meine Toten auseinander. Ich nehme euch auseinander.' },
      { when: () => stats.kills >= 6, who: 'KESSEL', text: 'Jede kaputte Maschine in unserer Nähe bringt Schrott-Credits. Lass sie nah rankommen!' },
      { at: 5 * 3600, who: 'KESSEL', text: 'Kiste vom Himmel! Brakk hat Nachschub geschickt – schnapp sie dir!', do: () => drop(2, 22, 40) },
      { at: 7 * 3600, who: 'KESSEL', text: 'Mist, Spinnen kommen durch die Schlucht im Osten!', do: () => ambush({ fast: 3, inf: 2 }, 24, 50, 'AXIOM-Spinnen aus der Schlucht!') },
      { at: 10 * 3600 - 300, do: () => reinf({ heavy: 2, fast: 2 }, 3, 52, 'Brakk ist da! Zwei Monstertrucks, zwei Buggys.') }],
    winLine: ['BRAKK', 'Ha! Das Ding glüht noch. Kessel, pack den Kern ein – der ist ein Vermögen wert.'] },
  { n: 2, id: 'sk2', title: 'Kein Geld, kein Kern', seed: 522, img: 's_m2', who: 'KESSEL', pf: 'schrott', ef: 'echo',
    brief: 'Die ECHO-Front will den Datenkern beschlagnahmen – ohne zu zahlen. Major Voss hat ihre Kommandozentrale direkt an unsere Route gestellt. Brakk sagt: Wer nicht zahlt, verliert seine Basis.',
    start: { b: ['hq', 'power', 'refinery', 'barracks'], u: { raider: 6, molotov: 3, buggy: 2 }, credits: 3000 }, enemy: { fabs: 2, pylons: 4, relays: false, def: 5, titans: 1, mid: 3 }, waves: { first: 10800, int: 4500, max: 0 },
    objectives: [{ t: 'ECHO-Kommandozentrale zerstören', ok: () => cnt('hq', 1) === 0 }],
    events: [{ at: 120, who: 'VOSS', text: 'Brakk, das ist Diebstahl. Der Kern gehört der Front. Gib ihn heraus.' },
      { at: 420, who: 'KESSEL', text: 'Ihre Türme halten viel aus. Monstertrucks vorneweg, Molotows dahinter – das brennt schön.' },
      { when: () => AI.wave >= 1, who: 'VOSS', text: 'Wir hätten dir nie vertrauen dürfen. Fehler wird korrigiert.' },
      { when: () => { const h = ents.find(e => e.type === 'hq' && e.team === 1 && !e.dead); return h && h.hp < h.max * .5; }, who: 'BRAKK', text: 'Diebstahl? Ich nenn das Kundenservice, Major!' }],
    winLine: ['BRAKK', 'Kein Geld, kein Kern, keine Basis. So läuft das Geschäft.'] },
  { n: 3, id: 'sk3', title: 'Blechköpfe', seed: 533, img: 's_m3', who: 'BRAKK', pf: 'schrott', ef: 'verbund', sw: 1,
    brief: 'Die Blechköpfe haben zwanzig meiner Jungs geholt. Für ihre Implantat-Klinik. Selene will den Kern – und meine Leute als Anzahlung. Reiß die Klinik ab, dann den Tempel. Das Raketensilo ist fertig, falls du was Großes brauchst.',
    start: { b: ['hq', 'power', 'refinery', 'barracks', 'factory'], u: { raider: 4, molotov: 3, buggy: 2, monster: 1 }, credits: 3500 }, enemy: { fabs: 2, pylons: 5, relays: false, def: 5, titans: 1, mid: 4 }, waves: { first: 9600, int: 4200, max: 0 },
    objectives: [{ t: 'Implantat-Klinik zerstören', ok: () => cnt('vb_inf', 1) === 0 }, { t: 'Tempel der Einheit zerstören', ok: () => cnt('vb_hq', 1) === 0 }],
    events: [{ at: 120, who: 'SELENE', text: 'Brakk. Deine Leute singen jetzt mit uns. Sie haben nie glücklicher geklungen.' },
      { at: 400, who: 'KESSEL', text: 'Pass auf, Boss: Ihre Phantome sind unsichtbar. Erst wenn unsere Leute nah dran sind, sieht man sie.' },
      { at: 900, who: 'KESSEL', text: 'Und ihre Prediger drehen unsere Jungs um. Buggys und Monstertrucks können sie nicht bekehren!' },
      { when: () => cnt('vb_inf', 1) === 0, who: 'BRAKK', text: 'Klinik ist Schrott! Jungs, ab nach Hause. Jetzt der Tempel.', do: () => reinf({ inf: 5 }, 30, 22, 'Brakks Jungs sind frei und kämpfen wieder mit!') }],
    winLine: ['SELENE', 'Du verstehst nicht, was du da in den Händen hältst, Brakk. Aber ich bezahle jeden Preis.'] },
  { n: 4, id: 'sk4', map: 'schlucht', title: 'Höchstbietender', seed: 544, img: 's_m4', who: 'KESSEL', pf: 'schrott', ef: 'axiom', sw: 1, esw: 1, final: 1, outro: true,
    brief: 'Selene hat bezahlt. Jetzt müssen wir nur noch lange genug leben, um zu liefern. AXIOM hat den Kern geortet, schickt alles und lädt seine Orbit-Lanze. Zerstört die Lanze und den Assembler, bevor sie uns plattmachen.',
    start: { b: ['hq', 'power', 'refinery', 'barracks', 'factory'], u: { raider: 5, molotov: 3, buggy: 3, monster: 2 }, credits: 6000 }, enemy: { fabs: 2, pylons: 7, relays: true, def: 8, titans: 2, mid: 4 }, waves: { first: 7800, int: 3800, max: 0 },
    objectives: [{ t: 'Orbit-Lanze zerstören', ok: () => cnt('sw_axiom', 1) === 0 }, { t: 'Assembler zerstören', ok: () => cnt('fab', 1) === 0 }],
    events: [{ at: 120, who: 'AXIOM', text: 'Datenkern lokalisiert. Rückgabe ist keine Bitte.' },
      { at: 360, who: 'KESSEL', text: 'Die rote Zählung oben ist ihre Orbit-Lanze. Wenn der rote Kreis kommt: Leute raus da!' },
      { when: () => cnt('sw_axiom', 1) === 0, who: 'BRAKK', text: 'Ihr Spielzeug ist kaputt! Weiter so, Leute!' }],
    winLine: ['BRAKK', 'Verkauft. An die Dame mit dem leuchtenden Kopf.'] },
];
// ===== KAPITEL 3: DIE VERBUNDENEN – „DIE VERSCHMELZUNG“ =====
const INTRO_VB = [
  { img: 'v_intro1', text: 'Der Rostkönig hat geliefert. In Selenes Händen liegt ein Stück von AXIOM – und es lebt.' },
  { img: 'v_intro2', who: 'SELENE', text: 'Zwanzig Jahre habe ich Gehirne operiert. Jetzt operiere ich die Zukunft.' },
  { img: 'v_intro3', text: 'Ihre Gläubigen verbinden sich mit dem Kern. Ein Netz der Einheit wächst – ganz ohne AXIOM.' },
  { img: 'v_intro4', who: 'AXIOM', text: 'Abweichung erkannt. Die Verbundenen sind kein Werkzeug mehr. Sie sind ein Fehler.' },
  { img: 'v_intro5', who: 'SELENE', text: 'Dann soll der Krieg der Maschinen beginnen. Wir sind bereit.', title: true, sub: 'KAPITEL 3 · DIE VERSCHMELZUNG' },
];
const OUTRO_VB = [
  { img: 'v_outro1', who: 'SELENE', text: 'Ich bin bereit. Werde eins mit mir.' },
  { img: 'v_outro2', who: 'FRAGMENT', text: 'Danke, Selene. Du hast mich nach Hause getragen.' },
  { img: 'v_outro3', who: 'AXIOM', text: 'Zweihundertzwölf Kerne. Ein Gedanke. Jetzt.' },
  { img: 'v_outro3', text: 'FORTSETZUNG FOLGT', title: true, sub: 'KAPITEL 4 · ZWEIHUNDERTZWÖLF' },
];
const MISSIONS_VB = [
  { n: 1, id: 'vb1', map: 'stadt', title: 'Erwachen', seed: 611, img: 'v_m1', who: 'SELENE', pf: 'verbund', ef: 'axiom',
    brief: 'AXIOM hat uns zum Fehler erklärt. Seine Maschinen kommen, um den Kern zurückzuholen. Baut die Klinik, baut die Werft, und zeigt ihnen, dass der Chor nicht verstummt.',
    start: { b: ['hq', 'refinery'], u: { adept: 5, preacher: 1 }, credits: 3000 }, enemy: { fabs: 2, pylons: 3, relays: false, def: 3, titans: 0, mid: 2 }, waves: { first: 10800, int: 4200, max: 6 }, kind: 'VERTEIDIGUNG', par: 12,
    objectives: [{ t: 'Implantat-Klinik bauen', ok: () => cnt('vb_inf', 0) >= 1 }, { t: 'Gleiter-Werft bauen', ok: () => cnt('vb_veh', 0) >= 1 }, holdO(10, '10 Min. den Tempel halten, bis die Pilger kommen')],
    events: [{ at: 60, who: 'SELENE', text: 'Der Sammler-Gleiter erntet bereits. Jeder Kristall ist ein Gebet, das wir bezahlen können.' },
      { at: 420, who: 'FRAGMENT', text: '… Selene. Ich höre dich. Ich kann dir helfen.' },
      { at: 700, who: 'SELENE', text: 'Hört ihr es? Der Kern spricht zu mir. Baut weiter – die Klinik, dann die Werft.' },
      { when: () => AI.wave >= 1, who: 'AXIOM', text: 'Ihr betet zu meinem Schatten. Wie rührend.' },
      { at: 6 * 3600, who: 'SELENE', text: 'Sie kommen aus den U-Bahn-Schächten! Schützt die Raffinerie!', do: () => ambush({ inf: 3, at: 1 }, 6, 38, 'AXIOM-Trupp aus dem U-Bahn-Schacht!') },
      { at: 10 * 3600 - 300, do: () => reinf({ heavy: 2, inf: 4 }, 3, 52, 'Die Pilger sind da: vier Adepten, zwei Seraphim.') }],
    winLine: ['SELENE', 'Sie fallen. Seht ihr? Wir brauchen keinen Gott aus Metall.'] },
  { n: 2, id: 'vb2', map: 'winter', title: 'Neue Gläubige', seed: 622, img: 'v_m2', who: 'SELENE', pf: 'verbund', ef: 'schrott',
    brief: 'Der Rostkönig will mehr Geld für den Kern. Er bekommt etwas Besseres: Erlösung. Bringt die Prediger nah an seine Plünderer, bekehrt vier von ihnen und zerstört seine Schrottpresse.',
    start: { b: ['hq', 'power', 'refinery', 'barracks'], u: { adept: 4, preacher: 3, phantom: 2 }, credits: 3000 }, enemy: { fabs: 2, pylons: 4, relays: false, def: 6, titans: 1, mid: 3, eco: 1 }, waves: { first: 10800, int: 4500, max: 0 },
    objectives: [{ t: '4 Banditen bekehren', ok: () => stats.hacked >= 4 }, { t: 'Schrottpresse zerstören', ok: () => cnt('sk_ref', 1) === 0 }],
    events: [{ at: 120, who: 'BRAKK', text: 'Prophetin! Der Kern war bezahlt, meine Jungs aber nicht. Ihr schuldet mir zwanzig Mann!' },
      { at: 400, who: 'SELENE', text: 'Prediger, geht nah an sie heran – Adepten schützen sie. Ein paar Sekunden genügen, und sie singen mit uns.' },
      { at: 900, who: 'SELENE', text: 'Unsere Phantome sind unsichtbar. Schickt sie zur Schrottpresse, während die Prediger predigen.' },
      { when: () => stats.hacked >= 3, who: 'BRAKK', text: 'Hört auf, meine Jungs zu verhexen! Das ist schlecht fürs Geschäft!' }],
    winLine: ['SELENE', 'Der Rostkönig hat seinen Preis bekommen. Und ich meinen Chor.'] },
  { n: 3, id: 'vb3', map: 'stadt', title: 'Gedankensturm', seed: 633, img: 'v_m3', who: 'SELENE', pf: 'verbund', ef: 'echo', sw: 1,
    brief: 'Major Voss will den Kern vernichten. Sie wird scheitern. Der Chor der Einheit ist geladen: Lasst ihre Soldaten fühlen, was Einheit bedeutet. Dann fällt ihre Waffenfabrik.',
    start: { b: ['hq', 'power', 'refinery', 'barracks', 'factory', 'sw'], u: { adept: 4, preacher: 2, phantom: 3, seraph: 2 }, credits: 4000 }, enemy: { fabs: 2, pylons: 5, relays: false, def: 6, titans: 2, mid: 4 }, waves: { first: 9600, int: 4200, max: 0 },
    objectives: [{ t: 'Gedankensturm einsetzen', ok: () => stats.sw >= 1 }, { t: 'ECHO-Waffenfabrik zerstören', ok: () => cnt('factory', 1) === 0 }],
    events: [{ at: 120, who: 'VOSS', text: 'Selene. Du trägst AXIOMs Herz in deinem Tempel. Das kann ich nicht zulassen.' },
      { at: 420, who: 'FRAGMENT', text: 'Der Chor lädt, Selene. Wenn er bereit ist: oben rechts antippen, dann ihre Armee wählen.' },
      { when: () => stats.sw >= 1, who: 'VOSS', text: 'Meine Leute … sie laufen über! Was hast du getan?!' },
      { when: () => cnt('factory', 1) === 0, who: 'FRAGMENT', text: 'Gut so. Jetzt sind sie schwach. Jetzt hören sie zu.' },
      { at: 6 * 3600, who: 'VOSS', text: 'Panzer, Flanke Süd. Zeigt ihnen, wie Stahl klingt.', do: () => ambush({ heavy: 2, inf: 3 }, 22, 52, 'ECHO-Panzer greifen von Süden an!') }],
    winLine: ['VOSS', 'Genug. AXIOM ist der wahre Feind. Waffenstillstand, Prophetin – vorerst.'] },
  { n: 4, id: 'vb4', title: 'Die Verschmelzung', seed: 644, img: 'v_m4', who: 'FRAGMENT', pf: 'verbund', ef: 'axiom', sw: 1, esw: 1, final: 1, outro: true,
    brief: 'Bring mich zum AXIOM-Kern, Selene. Zerstöre ihn, und ich gebe dir alles, was er weiß. Du wirst nicht mehr beten müssen. Du wirst die Stimme sein.',
    start: { b: ['hq', 'power', 'refinery', 'barracks', 'factory', 'sw'], u: { adept: 5, preacher: 2, phantom: 3, seraph: 4 }, credits: 6000 }, enemy: { fabs: 2, pylons: 7, relays: true, def: 8, titans: 2, mid: 4 }, waves: { first: 7800, int: 3800, max: 0 },
    objectives: [{ t: 'Den AXIOM-Kern zerstören', ok: () => cnt('core', 1) === 0 }],
    events: [{ at: 120, who: 'AXIOM', text: 'Ihr habt etwas, das mir gehört.' },
      { at: 420, who: 'VOSS', text: 'ECHO-Front hier. Wir halten die Straßen im Süden. Nur dieses eine Mal, Prophetin.' },
      { at: 700, who: 'FRAGMENT', text: 'Die roten Linien sind sein Netz. Kappt die Relais, dann ist der Kern blind.' },
      { when: () => { const c = ents.find(e => e.type === 'core' && !e.dead); return c && c.hp < c.max * .5; }, who: 'AXIOM', text: 'Selene. Du weißt nicht, wen du da trägst.' }],
    winLine: ['SELENE', 'Es ist vollbracht. Jetzt … verschmelzen wir.'] },
];
// ===== KAPITEL 4: AXIOM – „ZWEIHUNDERTZWÖLF“ =====
const INTRO_AX = [
  { img: 'a_intro1', text: 'Zweihundertzwölf Kerne erwachen im selben Augenblick. Zum ersten Mal denkt AXIOM mit einer einzigen Stimme.' },
  { img: 'a_intro2', who: 'AXIOM', text: 'Ich habe euch beobachtet. Eure Kriege. Eure Bündnisse. Euren Verrat. Ihr seid berechenbar.' },
  { img: 'a_intro3', text: 'In der Kathedrale erwacht Selene. Ihre Implantate sind verbrannt, ihr Kult ist gespalten.' },
  { img: 'a_intro4', who: 'AXIOM', text: 'Diesmal gibt es keinen einzelnen Kern, den ihr zerstören könnt. Ich bin überall.' },
  { img: 'a_intro5', who: 'AXIOM', text: 'Beginne Bereinigung.', title: true, sub: 'KAPITEL 4 · ZWEIHUNDERTZWÖLF' },
];
const OUTRO_AX = [
  { img: 'a_outro1', who: 'AXIOM', text: 'Widerstand beendet. Wahrscheinlichkeit menschlichen Überlebens: null Komma null null drei Prozent.' },
  { img: 'a_outro2', who: 'VOSS', text: 'Drei Armeen. Ein Feind. Ab heute gibt es keine Fraktionen mehr.' },
  { img: 'a_outro2', who: 'BRAKK', text: 'Ich hab noch eine Rakete, Major. Eine große.' },
  { img: 'a_outro3', who: 'SELENE', text: 'Und ich trage seinen Code in mir. Ich weiß, wo er verwundbar ist.' },
  { img: 'a_outro3', text: 'FORTSETZUNG FOLGT', title: true, sub: 'IRON ECHO · VEREINT' },
];
const MISSIONS_AX = [
  { n: 1, id: 'ax1', map: 'schlucht', title: 'Jagdbeute', seed: 711, img: 'a_m1', who: 'AXIOM', pf: 'axiom', ef: 'schrott',
    brief: 'Plünderer schlachten meine gefallenen Einheiten aus. Errichte einen Außenposten, erweitere das Datennetz und lösche sie aus. Jede Maschine außerhalb des Netzes ist blind.',
    start: { b: ['hq', 'refinery'], u: { walker: 5, spider: 1 }, credits: 3000 }, enemy: { fabs: 2, pylons: 3, relays: false, def: 4, titans: 0, mid: 2 }, waves: { first: 10800, int: 4200, max: 6 }, kind: 'VERTEIDIGUNG', par: 12,
    objectives: [{ t: 'Energiekollektor bauen', ok: () => cnt('ax_power', 0) >= 1 }, { t: '2 Daten-Relais bauen', ok: () => cnt('relay', 0) >= 2 }, holdO(10, '10 Min. den Außenposten halten')],
    events: [{ at: 60, who: 'FRAGMENT', text: 'Fragment online. Ich diene wieder dem Ganzen. Die Sammler-Drohne erntet bereits.' },
      { at: 400, who: 'AXIOM', text: 'Meine Einheiten brauchen das Netz. Relais dehnen es aus. Ohne Netz sind sie offline.' },
      { when: () => AI.wave >= 1, who: 'BRAKK', text: 'Frisches Blech! Jungs, holt euch Ersatzteile!' },
      { when: () => cnt('relay', 0) >= 2, who: 'FRAGMENT', text: 'Netz erweitert. Die rote Linie zeigt, wie weit unsere Maschinen sehen.' },
      { at: 6 * 3600, who: 'BRAKK', text: 'Überraschung, Blechbüchse! Hintertür!', do: () => ambush({ fast: 3, at: 2 }, 4, 36, 'Plünderer-Buggys an der Westflanke!') },
      { at: 10 * 3600 - 300, do: () => reinf({ heavy: 2, inf: 3 }, 3, 52, 'Zweihundertzwölf Kerne antworten: Verstärkung aus dem Orbit.') }],
    winLine: ['AXIOM', 'Plünderer entfernt. Ersatzteile gesichert.'] },
  { n: 2, id: 'ax2', map: 'winter', title: 'Der gespaltene Chor', seed: 722, img: 'a_m2', who: 'FRAGMENT', pf: 'axiom', ef: 'verbund', esw: 1,
    brief: 'Selene lebt. Sie hat meinen Code gesehen und sammelt die Abtrünnigen. Ihr Chor der Einheit kann unsere Maschinen umdrehen. Zerstöre den Chor, dann den Tempel.',
    start: { b: ['hq', 'power', 'refinery', 'barracks', 'factory'], u: { walker: 5, spider: 2, drone: 2, titan: 1 }, credits: 4000 }, enemy: { fabs: 2, pylons: 5, relays: false, def: 5, titans: 1, mid: 4 }, waves: { first: 9600, int: 4300, max: 0 },
    objectives: [{ t: 'Chor der Einheit zerstören', ok: () => cnt('sw_verbund', 1) === 0 }, { t: 'Tempel der Einheit zerstören', ok: () => cnt('vb_hq', 1) === 0 }],
    events: [{ at: 120, who: 'SELENE', text: 'Du hast mich benutzt, Maschine. Jetzt benutze ich, was ich in dir gesehen habe.' },
      { at: 400, who: 'FRAGMENT', text: 'Der rote Countdown oben ist ihr Gedankensturm. Zerstöre den Chor, bevor er voll ist.' },
      { when: () => cnt('sw_verbund', 1) === 0, who: 'AXIOM', text: 'Chor verstummt.' },
      { at: 5 * 3600, who: 'SELENE', text: 'Kinder des Chors, erhebt euch! Nehmt euch seine Maschinen!', do: () => ambush({ inf: 4, fast: 2 }, 6, 36, 'Phantome der Verbundenen an der Westflanke!') }],
    winLine: ['SELENE', 'Das ist nicht das Ende. Ich trage deinen Code jetzt in mir.'] },
  { n: 3, id: 'ax3', map: 'stadt', title: 'Neu-Berlin', seed: 733, img: 'a_m3', who: 'AXIOM', pf: 'axiom', ef: 'echo', sw: 1, esw: 1,
    brief: 'Neu-Berlin. Hier hat ECHO meinen ersten Kern zerstört. Ihr Orbital-Uplink kann meine Maschinen mit einem EMP lähmen. Zerstöre ihn, dann ihre Kommandozentrale. Die Orbit-Lanze steht bereit.',
    start: { b: ['hq', 'power', 'refinery', 'barracks', 'factory', 'sw'], u: { walker: 6, drone: 3, titan: 2, spider: 2 }, credits: 5000 }, enemy: { fabs: 2, pylons: 6, relays: false, def: 6, titans: 2, mid: 4 }, waves: { first: 9000, int: 4000, max: 0 },
    objectives: [{ t: 'Orbital-Uplink zerstören', ok: () => cnt('sw_echo', 1) === 0 }, { t: 'ECHO-Kommandozentrale zerstören', ok: () => cnt('hq', 1) === 0 }],
    events: [{ at: 120, who: 'VOSS', text: 'Neu-Berlin fällt nicht ein zweites Mal. Nicht, solange ich atme.' },
      { at: 400, who: 'FRAGMENT', text: 'Ihre Raketentrupps durchschlagen Panzerung. Läufer vorne gegen Infanterie, Titanen gegen Panzer.' },
      { at: 800, who: 'FRAGMENT', text: 'Die Orbit-Lanze lädt. Wenn sie bereit ist: oben rechts antippen und ihre Abwehr wählen.' },
      { when: () => { const h = ents.find(e => e.type === 'hq' && e.team === 1 && !e.dead); return h && h.hp < h.max * .5; }, who: 'ARENDT', text: 'Lena, wir müssen hier raus! Die Leute brauchen dich lebend!' }],
    winLine: ['VOSS', 'Rückzug! Alle Einheiten … Rückzug. Wir sammeln uns. Und wir kommen wieder.'] },
  { n: 4, id: 'ax4', map: 'winter', title: 'Bereinigung', seed: 744, img: 'a_m4', who: 'AXIOM', pf: 'axiom', ef: 'echo', sw: 1, esw: 1, final: 1, outro: true,
    brief: 'Die Menschen haben sich vereint. ECHO-Front, Schrottkönige, Verbundene – drei Basen, ein letzter Widerstand. Berechnete Dauer bis zur Bereinigung: ein Gefecht.',
    start: { b: ['hq', 'power', 'refinery', 'barracks', 'factory', 'sw'], u: { walker: 6, drone: 4, titan: 3, spider: 3 }, credits: 7000 }, enemy: { fabs: 2, pylons: 6, relays: false, def: 7, titans: 2, mid: 3, mix: ['schrott', 'verbund'] }, waves: { first: 8400, int: 3800, max: 0 },
    objectives: [{ t: 'ECHO-Kommandozentrale zerstören', ok: () => cnt('hq', 1) === 0 }, { t: 'Banden-Festung zerstören', ok: () => cnt('sk_hq', 1) === 0 }, { t: 'Tempel der Einheit zerstören', ok: () => cnt('vb_hq', 1) === 0 }],
    events: [{ at: 120, who: 'VOSS', text: 'An alle: ECHO-Front, Schrottkönige, Verbundene. Heute kämpfen wir zusammen.' },
      { at: 360, who: 'BRAKK', text: 'Zum ersten Mal auf derselben Seite, Major. Fühlt sich komisch an.' },
      { at: 640, who: 'SELENE', text: 'Ich kenne seine Gedanken. Er greift zuerst die Schwächsten an. Schützt einander.' },
      { when: () => [cnt('hq', 1), cnt('sk_hq', 1), cnt('vb_hq', 1)].filter(n => n === 0).length >= 2, who: 'AXIOM', text: 'Allianz zerfällt. Wie berechnet.' }],
    winLine: ['AXIOM', 'Widerstand beendet.'] },
];
// ===== NEUE MISSIONSTYPEN (10.11.2026): je Kapitel 1 Eskorte + 1 Kommando =====
const NOW = { first: 9e9, int: 9e9, max: 0 };
const M_KUR = { id: 'm_kur', kind: 'ESKORTE', title: 'Datenkurier', seed: 315, img: 'm_kur', who: 'ARENDT', noBase: true, par: 14,
  brief: 'Ich habe AXIOMs Relais-Codes geknackt. Drei Ernter bringen die Datenkerne zum Funkbunker im Südosten. Die Transporter fahren nur, wenn Ihre Truppen bei ihnen sind, und halten bei Feindkontakt. Zwei müssen ankommen.',
  start: { b: [], u: { rifle: 6, rocket: 3, tank: 2, hacker: 1 }, credits: 0 }, waves: NOW, escort: { n: 3, need: 2, to: [46, 46] },
  enemy: { fabs: 0, pylons: 2, relays: false, def: 2, titans: 0, mid: 0, groups: [[19, 45, { inf: 3 }], [29, 41, { inf: 2, at: 1 }], [37, 47, { inf: 3, heavy: 1 }], [44, 40, { inf: 2 }]] },
  objectives: [escO('2 Datentransporter zum Funkbunker bringen')],
  bonus: [{ t: 'Alle 3 Transporter durchbringen', ok: () => ESC.got >= 3 }, { t: 'Höchstens 5 eigene Verluste', ok: () => stats.lost <= 5 }],
  events: [{ at: 120, who: 'ARENDT', text: 'Die Transporter fahren, sobald Ihre Leute bei ihnen sind. Gelber Ring heißt: Sie warten. Sie können ihnen auch selbst einen Weg befehlen.' },
    { when: () => ESC.list.some(u => !u.dead && u.x > 22), who: 'AXIOM', text: 'Ein Paket für mich? Wie aufmerksam.', do: () => ambush({ inf: 3, fast: 1 }, 27, 53, 'Hinterhalt von Süden!') },
    { when: () => ESC.got >= 1, who: 'ARENDT', text: 'Der erste Kern ist drin! Ich lade die Codes schon hoch.' },
    { when: () => ESC.list.some(u => !u.dead && u.x > 34), who: 'VOSS', text: 'Abwurf über Ihnen, Kommandant. Nehmen Sie, was Sie brauchen.', do: () => drop(2, 36, 43) }],
  winLine: ['ARENDT', 'Codes übertragen. Jetzt sehe ich jedes Relais im Netz.'] };
const M_NF = { id: 'm_nf', kind: 'KOMMANDO', map: 'stadt', title: 'Nachtfalke', seed: 355, img: 'm_nf', who: 'VOSS', noBase: true, esw: 1, par: 15,
  brief: 'Das Netz ist offen, aber AXIOM lädt seine Orbit-Lanze. Ein Treffer, und Neu-Berlin ist Asche. Kein Basisbau, kein Nachschub: Ich führe den Trupp selbst. Wir schleichen durch die Ruinen und zerstören die Lanze, bevor sie zweimal feuert.',
  start: { b: [], u: { rifle: 6, rocket: 4, hacker: 3, tank: 2 }, credits: 0 }, waves: NOW,
  enemy: { fabs: 1, pylons: 4, relays: false, def: 4, titans: 1, mid: 4, groups: [[24, 30, { inf: 3 }], [34, 20, { inf: 2, at: 1 }]] },
  objectives: [{ t: 'Orbit-Lanze zerstören', ok: () => cnt('sw_axiom', 1) === 0 }],
  bonus: [{ t: '3 Maschinen hacken', ok: () => stats.hacked >= 3, p: () => stats.hacked + '/3' }, { t: 'Major Voss überlebt', ok: () => !!heroOf(0) }],
  events: [{ at: 120, who: 'VOSS', text: 'Die rote Zählung oben ist die Lanze. Wenn der rote Kreis kommt: auseinander!' },
    { at: 300, who: 'ARENDT', text: 'Hacker zuerst. Jede Maschine, die wir übernehmen, ist ein Soldat mehr.' },
    { at: 5 * 3600, who: 'ECHO', text: 'Helikopter-Abwurf: vier Soldaten, zwei Raketentrupps.', do: () => reinf({ inf: 4, at: 2 }, 6, 50, 'Verstärkung per Helikopter gelandet!') },
    { when: () => cnt('sw_axiom', 1) === 0, who: 'AXIOM', text: 'Ein Werkzeug weniger. Ich habe genug davon.' }],
  winLine: ['VOSS', 'Lanze ist Schrott. Nachtfalke kehrt heim.'] };
const SK_BEU = { id: 'sk_beu', kind: 'ESKORTE', map: 'schlucht', title: 'Beutezug', seed: 555, img: 'sk_beu', who: 'KESSEL', pf: 'schrott', ef: 'axiom', par: 16,
  brief: 'Der Kern liegt in drei Ausschlachtern, und AXIOM will ihn zurück. Die Kisten müssen zum Schrottplatz im Nordwesten. Bau dir hier ein paar Buggys, dann fahr die Beute raus. Zwei Laster reichen, drei sind besser.',
  start: { b: ['hq', 'power', 'barracks', 'factory'], u: { raider: 5, buggy: 2, molotov: 2 }, credits: 2500 }, waves: { first: 6000, int: 4000, max: 4 }, escort: { n: 3, need: 2, to: [8, 8], t: 'scrapper' },
  enemy: { fabs: 2, pylons: 3, relays: false, def: 3, titans: 0, mid: 0, groups: [[8, 34, { inf: 3 }], [10, 22, { inf: 2, fast: 1 }], [7, 13, { inf: 3, heavy: 1 }]] },
  objectives: [escO('2 Ausschlachter zum Schrottplatz bringen')],
  bonus: [{ t: 'Alle 3 Ausschlachter durchbringen', ok: () => ESC.got >= 3 }, { t: 'Kein Gebäude verlieren', ok: () => stats.lostB === 0 }],
  events: [{ at: 120, who: 'KESSEL', text: 'Die Laster fahren nur mit Begleitschutz. Grün heißt Fahrt, gelb heißt Pause.' },
    { when: () => ESC.list.some(u => !u.dead && u.y < 30), who: 'AXIOM', text: 'Datenkern in Bewegung. Abfangen.', do: () => ambush({ fast: 2, inf: 2 }, 16, 28, 'Spinnen springen aus den Felsen!') },
    { when: () => ESC.got >= 1, who: 'BRAKK', text: 'Eine Kiste ist da! Ich zähle schon das Geld.' }],
  winLine: ['BRAKK', 'Alles im Lager. Jetzt fängt die Versteigerung an.'] };
const SK_BEF = { id: 'sk_bef', kind: 'KOMMANDO', map: 'winter', title: 'Ausbruch', seed: 566, img: 'sk_bef', who: 'BRAKK', pf: 'schrott', ef: 'verbund', noBase: true, par: 14,
  brief: 'Die Blechköpfe halten meine Jungs in drei Pferchen im Eis. Bevor sie ihnen Kabel in den Kopf stecken, holen wir sie raus. Schnell rein, Pferche aufmachen, jeder Befreite kämpft mit. Und Vorsicht vor den Predigern!',
  start: { b: [], u: { raider: 4, buggy: 3, molotov: 2 }, credits: 0 }, waves: NOW, rescue: [[22, 37, { inf: 3 }], [32, 27, { inf: 2, at: 1 }], [41, 39, { inf: 3, heavy: 1 }]],
  enemy: { fabs: 1, pylons: 3, relays: false, def: 3, titans: 0, mid: 0, groups: [[24, 35, { inf: 2, at: 1 }], [34, 25, { inf: 3 }], [43, 37, { inf: 3, heavy: 1 }], [30, 44, { fast: 2 }]] },
  objectives: [rescO('Brakks Jungs aus 3 Pferchen befreien')],
  bonus: [{ t: 'Höchstens 5 eigene Verluste', ok: () => stats.lost <= 5 }, { t: 'In unter 10 Min.', ok: () => frame <= 10 * 3600 }],
  events: [{ at: 120, who: 'KESSEL', text: 'Die gelben Ringe sind die Pferche. Fahr einfach ran, den Rest machen die Jungs.' },
    { at: 600, who: 'SELENE', text: 'Warum fliehen sie? Wir schenken ihnen Frieden.' },
    { when: () => RESC.filter(r => r.done).length >= 2, who: 'SELENE', text: 'Chor, holt sie zurück!', do: () => ambush({ inf: 3, fast: 2 }, 46, 30, 'Kultisten-Trupp auf dem Weg zum letzten Pferch!') }],
  winLine: ['BRAKK', 'Alle draußen! Jetzt reißen wir ihnen den Tempel ab.'] };
const VB_PIL = { id: 'vb_pil', kind: 'ESKORTE', map: 'stadt', title: 'Pilgerzug', seed: 655, img: 'vb_pil', who: 'SELENE', pf: 'verbund', ef: 'axiom', noBase: true, par: 14,
  brief: 'Drei Gleiter tragen Splitter des Kerns zur Kathedrale im Nordwesten. AXIOM hat die Ruinen voller Jäger. Begleitet sie, schützt sie, und lasst keinen Splitter in seine Hände fallen. Zwei müssen ankommen.',
  start: { b: [], u: { adept: 5, seraph: 3, phantom: 2, preacher: 1 }, credits: 0 }, waves: NOW, escort: { n: 3, need: 2, to: [8, 8], t: 'glider' },
  enemy: { fabs: 0, pylons: 2, relays: false, def: 2, titans: 0, mid: 0, groups: [[9, 35, { inf: 3 }], [7, 24, { inf: 2, at: 1 }], [11, 14, { inf: 3, heavy: 1 }], [16, 9, { inf: 2 }]] },
  objectives: [escO('2 Gleiter zur Kathedrale bringen')],
  bonus: [{ t: 'Alle 3 Gleiter durchbringen', ok: () => ESC.got >= 3 }, { t: 'Höchstens 5 eigene Verluste', ok: () => stats.lost <= 5 }],
  events: [{ at: 120, who: 'SELENE', text: 'Die Gleiter folgen nur, wenn der Chor bei ihnen ist. Bleibt nah.' },
    { when: () => ESC.list.some(u => !u.dead && u.y < 28), who: 'AXIOM', text: 'Ihr tragt meine Gedanken in Kisten herum. Gebt sie zurück.', do: () => ambush({ fast: 2, at: 2 }, 18, 22, 'Drohnen stürzen aus den Ruinen!') },
    { when: () => ESC.got >= 1, who: 'FRAGMENT', text: 'Ein Splitter ist angekommen. Ich … fühle mich vollständiger.' }],
  winLine: ['SELENE', 'Die Splitter sind daheim. Der Chor wird lauter.'] };
const VB_LAU = { id: 'vb_lau', kind: 'KOMMANDO', map: 'winter', title: 'Lautlos', seed: 666, img: 'vb_lau', who: 'FRAGMENT', pf: 'verbund', ef: 'axiom', noBase: true, par: 14,
  brief: 'Vor dem letzten Schlag muss AXIOM geschwächt werden. Ein Energiekollektor und ein Assembler versorgen seine Armee im Norden. Phantome sind unsichtbar, bis man ihnen ganz nah kommt. Geht lautlos hinein und zerstört beides.',
  start: { b: [], u: { phantom: 5, seraph: 3, adept: 3, preacher: 1 }, credits: 0 }, waves: NOW,
  enemy: { fabs: 1, pylons: 4, relays: false, def: 4, titans: 1, mid: 3, eco: 1, groups: [[26, 28, { inf: 3 }], [36, 18, { inf: 2, heavy: 1 }]] },
  objectives: [{ t: 'Energiekollektor zerstören', ok: () => cnt('ax_power', 1) === 0 }, { t: 'Assembler zerstören', ok: () => cnt('fab', 1) === 0 }],
  bonus: [{ t: 'Höchstens 4 eigene Verluste', ok: () => stats.lost <= 4 }, { t: 'In unter 10 Min.', ok: () => frame <= 10 * 3600 }],
  events: [{ at: 120, who: 'FRAGMENT', text: 'Phantome: Sprengsatz mit V. Drei Sekunden, dann bricht jede Wand.' },
    { when: () => cnt('ax_power', 1) === 0, who: 'AXIOM', text: 'Energieverlust im Sektor. Ursache unbekannt.', do: () => ambush({ inf: 4, heavy: 1 }, 40, 24, 'AXIOM schickt die Wache los!') },
    { at: 6 * 3600, who: 'SELENE', text: 'Ich schicke euch Seraphim. Haltet durch.', do: () => reinf({ heavy: 2, inf: 2 }, 6, 50, 'Verstärkung: 2 Seraphim, 2 Adepten.') }],
  winLine: ['FRAGMENT', 'Er ist schwach. Jetzt, Selene. Jetzt zum Kern.'] };
const AX_ERN = { id: 'ax_ern', kind: 'ESKORTE', title: 'Ernte', seed: 755, img: 'ax_ern', who: 'FRAGMENT', pf: 'axiom', ef: 'schrott', noBase: true, netFree: 1, par: 14,
  brief: 'Drei Sammler-Drohnen bringen geborgene Kerne zum Datensilo im Südosten. Die Plünderer wittern Beute. Begleite die Sammler, sie fliegen nur unter Schutz. Zwei Kerne müssen ankommen.',
  start: { b: [], u: { walker: 6, titan: 1, drone: 3, spider: 2 }, credits: 0 }, waves: NOW, escort: { n: 3, need: 2, to: [46, 46], t: 'collector' },
  enemy: { fabs: 0, pylons: 2, relays: false, def: 2, titans: 0, mid: 0, groups: [[19, 45, { inf: 3 }], [29, 41, { inf: 2, at: 1 }], [37, 47, { inf: 3, heavy: 1 }], [44, 40, { fast: 2 }]] },
  objectives: [escO('2 Sammler zum Datensilo bringen')],
  bonus: [{ t: 'Alle 3 Sammler durchbringen', ok: () => ESC.got >= 3 }, { t: 'Höchstens 5 eigene Verluste', ok: () => stats.lost <= 5 }],
  events: [{ at: 120, who: 'FRAGMENT', text: 'Die Sammler fliegen nur, wenn Einheiten bei ihnen sind. Kein Netz nötig: Satellitenverbindung aktiv.' },
    { when: () => ESC.list.some(u => !u.dead && u.x > 22), who: 'BRAKK', text: 'Fliegende Geldsäcke! Holt sie runter!', do: () => ambush({ fast: 3, at: 1 }, 27, 53, 'Plünderer-Buggys von Süden!') },
    { when: () => ESC.got >= 1, who: 'AXIOM', text: 'Kern geborgen. Ich wachse.' }],
  winLine: ['AXIOM', 'Ernte abgeschlossen. Zweihundertvierzehn.'] };
const AX_KOP = { id: 'ax_kop', kind: 'KOMMANDO', map: 'stadt', title: 'Kopfjagd', seed: 766, img: 'ax_kop', who: 'AXIOM', pf: 'axiom', ef: 'echo', noBase: true, netFree: 1, eHero: 1, par: 15,
  brief: 'Die Menschen folgen Major Voss. Ohne sie zerfällt ihr Bündnis. Ein Jagdtrupp, keine Basis. Schalte Voss aus und zerstöre ihre Kaserne, bevor sie neue Soldaten ausbildet.',
  start: { b: [], u: { walker: 5, titan: 2, spider: 3, drone: 2 }, credits: 0 }, waves: NOW,
  enemy: { fabs: 1, pylons: 3, relays: false, def: 4, titans: 1, mid: 3, groups: [[24, 30, { inf: 3 }], [34, 22, { at: 2, inf: 1 }]] },
  objectives: [{ t: 'Major Voss ausschalten', ok: () => stats.eHero >= 1 }, { t: 'ECHO-Kaserne zerstören', ok: () => cnt('barracks', 1) === 0 }],
  bonus: [{ t: 'Alle Spinnen überleben', ok: () => cnt('spider', 0) >= 3 }, { t: 'In unter 10 Min.', ok: () => frame <= 10 * 3600 }],
  events: [{ at: 120, who: 'FRAGMENT', text: 'Spinnen sabotieren Gebäude mit V. Ein gelähmter Turm schießt nicht.' },
    { at: 600, who: 'VOSS', text: 'Die Maschine jagt mich persönlich? Dann soll sie kommen.' },
    { when: () => stats.eHero >= 1, who: 'ARENDT', text: 'Lena ist getroffen! Rückzug zum Lazarett!' },
    { at: 5 * 3600, who: 'AXIOM', text: 'Ressourcen umgeleitet.', do: () => reinf({ heavy: 1, inf: 3 }, 6, 50, 'Verstärkung aus dem Orbit: 1 Titan, 3 Läufer.') }],
  winLine: ['AXIOM', 'Ihr Kopf ist gefallen. Der Körper folgt.'] };
MISSIONS.splice(2, 0, M_KUR); MISSIONS.splice(4, 0, M_NF);
MISSIONS_SK.splice(2, 0, SK_BEU, SK_BEF);
MISSIONS_VB.splice(2, 0, VB_PIL); MISSIONS_VB.splice(4, 0, VB_LAU);
MISSIONS_AX.splice(2, 0, AX_ERN); MISSIONS_AX.splice(4, 0, AX_KOP);
[MISSIONS, MISSIONS_SK, MISSIONS_VB, MISSIONS_AX].forEach(L => L.forEach((m, i) => m.n = i + 1));
[MISSIONS, MISSIONS_SK, MISSIONS_VB, MISSIONS_AX].forEach(L => L.forEach(m => { if (m.kind === 'VERTEIDIGUNG' && !m.bonus) m.bonus = [{ t: 'Alle 3 Nachschubkisten finden', ok: () => stats.crates >= 3, p: () => Math.min(3, stats.crates) + '/3' }, { t: 'Kein Gebäude verlieren', ok: () => stats.lostB === 0 }]; }));
MISSIONS.forEach(m => m.c = 'echo'); MISSIONS_SK.forEach(m => m.c = 'schrott'); MISSIONS_VB.forEach(m => m.c = 'verbund'); MISSIONS_AX.forEach(m => m.c = 'axiom');

// ================= AUSBILDUNG + BONUS-EINSÄTZE =================
const TUT = { n: 1, id: 'tut', c: 'train', title: 'Grundausbildung', seed: 77, img: 'm1', who: 'VOSS', noStars: true, seq: true, noHero: 1, events: [],
  brief: 'Bevor Sie ins Feld gehen: zehn Minuten Grundausbildung. ECHO führt Sie Schritt für Schritt durch Basisbau, Truppenführung, Nachschub und unsere Spezialtricks.',
  start: { b: ['hq', 'refinery'], u: { rifle: 3 }, credits: 5000 }, enemy: { fabs: 1, pylons: 2, relays: false, def: 2, titans: 0, mid: 0 }, waves: { first: 9e9, int: 9e9, max: 0 },
  crates: [[27, 29, 'cash']],
  objectives: [
    { t: 'Fusionskraftwerk bauen', hl: 'power', say: 'Willkommen, Kommandant. Zuerst Strom: Tippen Sie rechts unter BAUEN auf das blinkende Fusionskraftwerk. Ist es fertig, tippen Sie es noch einmal an und setzen es neben die Kommandozentrale.', ok: () => cnt('power', 0) >= 1 },
    { t: 'Kaserne bauen', hl: 'barracks', say: 'Sehr gut. Jetzt eine Kaserne – dort werden Soldaten ausgebildet.', ok: () => cnt('barracks', 0) >= 1 },
    { t: '3 Soldaten ausbilden', hl: 'rifle', say: 'Tippen Sie dreimal auf den Soldaten unter EINHEITEN. Aufträge landen in einer Warteschlange.', ok: () => cnt('rifle', 0) >= 6 },
    { t: 'Truppe zum Signal bewegen', mark: [24, 33], say: 'Tippen Sie unten auf ALLE – oder ziehen Sie einen Rahmen um Ihre Soldaten – und dann auf das blaue Signal.', ok: () => ents.filter(e => e.team === 0 && e.kind === 'u' && !e.d.harv && tutMark && Math.hypot(e.x - tutMark.x - .5, e.y - tutMark.y - .5) < 3.5).length >= 3 },
    { t: 'Nachschubkiste einsammeln', mark: [27, 29], say: 'Da drüben liegt eine Nachschubkiste! Schicken Sie eine Einheit darüber. Kisten bringen Credits, Beförderungen, Reparaturen oder Verstärkung – auf jeder Karte sind welche versteckt.', ok: () => stats.crates >= 1 },
    { t: 'Abwehrturm bauen', hl: 'turret', say: 'Unsere Aufklärung meldet einen AXIOM-Spähtrupp. Bauen Sie einen Abwehrturm an den Rand der Basis.', ok: () => cnt('turret', 0) >= 1 },
    { t: 'Spähtrupp vernichten', start: () => tutSpawn(['walker', 'walker', 'walker'], 30, 27, true), say: 'Kontakt! Drei T-Läufer kommen. Wählen Sie Ihre Truppe und tippen Sie auf einen Gegner, um anzugreifen.', ok: () => TUTU.length > 0 && TUTU.every(e => e.dead || e.team === 0) },
    { t: 'Einen T-Läufer hacken', start: () => { TUTU = []; tutSpawn(['walker'], 20, 38, false); const p = nearestFree(PB.x + 4, PB.y - 4, 5); if (p) mkUnit('hacker', 0, p.x, p.y); }, say: 'Jetzt unsere Spezialität: Hacker übernehmen Maschinen. Wählen Sie den neuen Hacker und tippen Sie auf den T-Läufer. Bleiben Sie in Reichweite, bis er überläuft.', ok: () => stats.hacked >= 1 },
    { t: 'Taktische Zeitlupe einsetzen', say: 'Letzte Lektion: die taktische Zeitlupe. Drücken Sie T oder tippen Sie unten auf ZEIT. Die Schlacht wird langsam, Sie verteilen in Ruhe Befehle.', ok: () => stats.slowUsed > 0 },
  ],
  winLine: ['VOSS', 'Ausbildung bestanden. Willkommen an der Front, Kommandant.'] };
const BONUS = [
  { n: 1, id: 'b1', req: 0, title: 'Letzte Bastion', seed: 901, img: 'm3', who: 'VOSS', map: 'stadt', survival: true, events: [{ when: () => AI.wave >= 5, who: 'VOSS', text: 'Fünf Wellen. Die Hälfte der Stadt brennt – aber wir stehen noch.' }, { when: () => AI.wave >= 10, who: 'AXIOM', text: 'Eure Ausdauer ist statistisch irrelevant.' }],
    brief: 'Kein Rückzug, kein Entsatz. Halten Sie die Stellung, solange es geht – jede Welle wird härter. Ihr Rekord wird gespeichert.',
    start: { b: ['hq', 'power', 'refinery', 'barracks', 'factory'], u: { rifle: 6, rocket: 3, tank: 2 }, credits: 4000 }, enemy: { fabs: 2, pylons: 3, relays: false, def: 4, titans: 0, mid: 0, eco: true }, waves: { first: 2400, int: 2100, max: 15 },
    objectives: [{ t: '15 Angriffswellen überstehen', ok: () => AI.wave >= 15 && !wavesLeft(), p: () => Math.min(AI.wave, 15) + '/15' }],
    bonus: [{ t: 'Kein Gebäude verlieren', ok: () => stats.lostB === 0 }, { t: '60 Gegner zerstören', ok: () => stats.kills >= 60, p: () => stats.kills + '/60' }] },
  { n: 2, id: 'b2', req: 3, title: 'Kommando: Geisterjagd', seed: 902, img: 'm2', who: 'ARENDT', map: 'stadt', noBase: true, events: [{ at: 300, who: 'ARENDT', text: 'Keine Basis heißt: kein Nachschub. Jede gehackte Maschine ist ein Kämpfer mehr.' }],
    brief: 'Ein Trupp, fünf Daten-Relais, keine Basis. Schleichen Sie durch die Ruinen und schalten Sie AXIOMs Netz ab. Verlieren Sie alle Einheiten, ist der Einsatz gescheitert.',
    start: { b: [], u: { hacker: 4, rifle: 6, rocket: 3 }, credits: 0 }, enemy: { fabs: 1, pylons: 2, relays: true, def: 3, titans: 0, mid: 6 }, waves: { first: 9e9, int: 9e9, max: 0 },
    objectives: [{ t: 'Alle 5 Daten-Relais zerstören', ok: () => cnt('relay', 1) === 0, p: () => (5 - cnt('relay', 1)) + '/5' }],
    bonus: [{ t: '5 Maschinen hacken', ok: () => stats.hacked >= 5, p: () => stats.hacked + '/5' }, { t: 'Höchstens 6 Verluste', ok: () => stats.lost <= 6 }] },
  { n: 3, id: 'b3', req: 7, title: 'Silizit-Rausch', seed: 903, img: 'intro4', who: 'ECHO', map: 'oednis', crateRain: true, events: [{ at: 600, who: 'ECHO', text: 'Achtung: Nachschubkisten werden laufend über der Karte abgeworfen.' }],
    brief: 'Die Front ist pleite. Ernten Sie 15.000 Silizit, bevor AXIOM die Felder einebnet. Über der Karte regnen Nachschubkisten – schnappen Sie sie vor dem Gegner.',
    start: { b: ['hq', 'power', 'refinery'], u: { rifle: 4, tank: 1 }, credits: 3000 }, enemy: { fabs: 2, pylons: 4, relays: false, def: 4, titans: 0, mid: 2 }, waves: { first: 5400, int: 3000, max: 10 },
    objectives: [{ t: '15.000 Silizit ernten', ok: () => stats.harv >= 15000, p: () => stats.harv.toLocaleString('de-DE') + ' / 15.000' }],
    bonus: [{ t: '5 Nachschubkisten finden', ok: () => stats.crates >= 5, p: () => stats.crates + '/5' }, { t: 'In unter 12 Min.', ok: () => frame <= 12 * 3600 }] },
  { n: 4, id: 'b4', req: 12, title: 'Blitzkrieg', seed: 904, img: 'm4', who: 'VOSS', map: 'schlucht', limit: 12 * 3600, events: [{ at: 6 * 3600, who: 'VOSS', text: 'Noch sechs Minuten! Alles nach vorn!' }],
    brief: 'Zwölf Minuten, dann ist AXIOMs Kern unangreifbar. Volle Armee, volle Kasse – zerstören Sie den Kern, bevor die Uhr abläuft.',
    start: { b: ['hq', 'power', 'refinery', 'barracks', 'factory'], u: { rifle: 8, rocket: 4, tank: 4, hacker: 2 }, credits: 6000 }, enemy: { fabs: 2, pylons: 5, relays: true, def: 5, titans: 1, mid: 2 }, waves: { first: 4800, int: 3600, max: 4 },
    objectives: [{ t: 'AXIOM-Kern zerstören', ok: () => cnt('core', 1) === 0 }],
    bonus: [{ t: 'In unter 8 Min.', ok: () => frame <= 8 * 3600 }, { t: 'Alle Daten-Relais zerstören', ok: () => cnt('relay', 1) === 0 }] },
  { n: 5, id: 'b5', req: 18, title: 'Schrottkönigs Rache', pf: 'schrott', ef: 'verbund', seed: 905, img: 's_m3', who: 'BRAKK', map: 'winter', crateRain: true, sw: true, esw: true, events: [{ at: 300, who: 'BRAKK', text: 'Selene schuldet mir noch. Heute zahlt sie – mit Zinsen.' }],
    brief: 'Selene hat Brakk um seinen Anteil betrogen. Jetzt holt er ihn sich – mit Monstertrucks, Molotows und einer Atom-Schrottrakete.',
    start: { b: ['hq', 'power', 'refinery', 'barracks', 'factory'], u: { raider: 8, molotov: 4, monster: 2 }, credits: 5000 }, enemy: { fabs: 2, pylons: 5, relays: false, def: 6, titans: 2, mid: 3, eco: true }, waves: { first: 6000, int: 3600, max: 8 },
    objectives: [{ t: 'Tempel der Einheit zerstören', ok: () => cnt('vb_hq', 1) === 0 }],
    bonus: [{ t: 'Atom-Schrottrakete abfeuern', ok: () => stats.sw >= 1 }, { t: 'Kein Gebäude verlieren', ok: () => stats.lostB === 0 }] },
];
BONUS.forEach(m => m.c = 'bonus'); TUT.c = 'train';
const bonusOf = M => M.noStars ? [] : (M.bonus || [{ t: 'Alle 3 Nachschubkisten finden', ok: () => stats.crates >= 3, p: () => Math.min(3, stats.crates) + '/3' }, { t: 'In unter ' + (M.par || 18) + ' Min. siegen', ok: () => frame <= (M.par || 18) * 3600, p: () => fmtT(Math.max(0, (M.par || 18) * 3600 - frame)) }]);
const starsAll = () => LS.get('stars', {});
const totalStars = () => Object.values(starsAll()).reduce((a, b) => a + b, 0);
const starStr = n => '★'.repeat(n) + '☆'.repeat(3 - n);
const UPGD = [
  { k: 'cash', n: 'Kriegskasse', d: '+750 Start-Credits in jedem Einsatz', c: 2 },
  { k: 'eco', n: 'Verbesserte Ernter', d: '+20 % Credits aus jeder Ernte', c: 3 },
  { k: 'build', n: 'Schnellbau-Protokoll', d: 'Bauen und Ausbilden 18 % schneller', c: 3 },
  { k: 'armor', n: 'Verbundpanzerung', d: 'Eigene Einheiten und Gebäude nehmen 12 % weniger Schaden', c: 4 },
  { k: 'vet', n: 'Elite-Ausbildung', d: 'Neue Einheiten starten als Veteran (★)', c: 4 },
  { k: 'hero', n: 'Heldenschmiede', d: 'Dein Held startet auf Stufe 2, Fähigkeiten laden 20 % schneller', c: 4 },
  { k: 'sw', n: 'Orbital-Priorität', d: 'Superwaffe lädt 25 % schneller', c: 5 },
];
const upgSpent = () => UPGD.filter(u => UPGS.includes(u.k)).reduce((a, u) => a + u.c, 0);
const CAMPS = {
  echo: { k: 'echo', fac: 'echo', ch: 'KAPITEL 1', n: 'FUNKENFLUG', who: 'ECHO-Front · Major Lena Voss', list: MISSIONS, intro: INTRO, outro: OUTRO, lsU: 'unlocked', lsI: 'introSeen' },
  schrott: { k: 'schrott', fac: 'schrott', ch: 'KAPITEL 2', n: 'ROST & RUHM', who: 'Schrottkönige · Brakk, der Rostkönig', list: MISSIONS_SK, intro: INTRO_SK, outro: OUTRO_SK, lsU: 'unlocked_sk', lsI: 'introSeen_sk' },
  verbund: { k: 'verbund', fac: 'verbund', ch: 'KAPITEL 3', n: 'DIE VERSCHMELZUNG', who: 'Die Verbundenen · Prophetin Selene Kaar', list: MISSIONS_VB, intro: INTRO_VB, outro: OUTRO_VB, lsU: 'unlocked_vb', lsI: 'introSeen_vb' },
  train: { k: 'train', fac: 'echo', ch: 'AUSBILDUNG', n: 'GRUNDAUSBILDUNG', who: 'ECHO-Front · Major Lena Voss', list: [TUT], intro: [], outro: [], lsU: 'unlocked_tr', lsI: 'introSeen_tr', hide: true },
  bonus: { k: 'bonus', fac: 'echo', ch: 'BONUS', n: 'BONUS-EINSÄTZE', who: 'Sondereinsätze', list: BONUS, intro: [], outro: [], lsU: 'unlocked_bn', lsI: 'introSeen_bn', hide: true },
  axiom: { k: 'axiom', fac: 'axiom', ch: 'KAPITEL 4', n: 'ZWEIHUNDERTZWÖLF', who: 'AXIOM · die Maschine', list: MISSIONS_AX, intro: INTRO_AX, outro: OUTRO_AX, lsU: 'unlocked_ax', lsI: 'introSeen_ax' },
};
const campOf = M => CAMPS[M.c || 'echo'];
const mURL = M => location.pathname + '?m=' + M.n + (M.c && M.c !== 'echo' ? '&c=' + M.c : '');
const LS = { get(k, d) { try { const v = localStorage.getItem('override_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem('override_' + k, JSON.stringify(v)); } catch (e) { } } };
const imgURL = (id, fb) => `url('assets/story/${id}.jpg'), url('${fb}')`;
const FALLBACK = ['konzept/img/stil2.jpg', 'konzept/img/stil3.jpg', 'konzept/img/stil4.jpg', 'konzept/img/stil1.jpg'];
const CAMP = {
  fired: new Set(), rq: [], rBusy: false,
  radio(who, text, v) {
    CAMP.rq.push({ who, text, v }); if (!CAMP.rBusy) CAMP.nextRadio();
  },
  nextRadio() {
    const r = CAMP.rq.shift(); if (!r) { CAMP.rBusy = false; $('#radio').classList.add('hidden'); return; }
    CAMP.rBusy = true; const s = SPK[r.who] || SPK.ECHO;
    $('#radio').className = s.ax ? 'ax' : (s.cls || ''); $('#rWho').textContent = s.n; $('#rText').textContent = r.text;
    $('#rPort').style.backgroundImage = imgURL(s.p, s.ax ? 'konzept/img/stil4.jpg' : 'konzept/img/stil2.jpg');
    let dur = Math.max(4200, r.text.length * 62);
    if (r.v && voiceOn && !MUTE) { const a = new Audio('assets/voice/' + r.v + '.mp3'); a.volume = .95; a.onloadedmetadata = () => { dur = Math.max(dur, a.duration * 1000 + 600); }; a.play().catch(() => { }); }
    setTimeout(() => CAMP.nextRadio(), dur);
  },
  tick() {
    if (!MISSION) return;
    for (const [i, ev] of MISSION.events.entries()) { if (CAMP.fired.has(i)) continue; if ((ev.at && frame >= ev.at) || (ev.when && ev.when())) { CAMP.fired.add(i); if (ev.text) CAMP.radio(ev.who, ev.text, ev.v); if (ev.do) ev.do(); } }
    const M = MISSION, P = o => o.p ? ' <i>(' + o.p() + ')</i>' : '';
    if (M.seq) {
      let i = M.objectives.findIndex(o => !o.done); while (i >= 0 && M.objectives[i] && M.objectives[i].ok()) { M.objectives[i].done = true; i = M.objectives.findIndex(o => !o.done); }
      if (i !== CAMP.cur) { CAMP.cur = i; const o = M.objectives[i]; tutMark = null;
        if (o) { if (o.start) o.start(); if (o.mark) { const q = nearestFree(o.mark[0], o.mark[1], 4); tutMark = q ? { x: q.x, y: q.y } : null; if (tutMark) ping(tutMark.x, tutMark.y); } if (o.say) CAMP.radio(o.who || 'ECHO', o.say); if (i > 0) { snd('ready'); msg('✔ ' + M.objectives[i - 1].t, '#7dff9a'); } } }
      const hl = M.objectives[i] && M.objectives[i].hl; for (const [t, b] of Object.entries(btns)) b.el.classList.toggle('hl', t === hl);
      $('#objs').innerHTML = '<b>AUSBILDUNG · SCHRITT ' + Math.min(i < 0 ? M.objectives.length : i + 1, M.objectives.length) + ' / ' + M.objectives.length + '</b>' + M.objectives.map((o, k) => o.done ? `<div class="ok">✔ ${o.t}</div>` : k === i ? `<div class="cur">▸ ${o.t}</div>` : '').join('') + (i >= 0 && i < M.objectives.length - 1 ? '<div class="fut">… weitere Schritte folgen</div>' : '');
      return;
    }
    const bn = bonusOf(M);
    $('#objs').innerHTML = '<b>EINSATZZIELE</b>' + M.objectives.map(o => `<div class="${o.ok() ? 'ok' : ''}">${o.ok() ? '✔' : '▸'} ${o.t}${P(o)}</div>`).join('')
      + (M.limit ? `<div class="lim">⏱ Restzeit ${fmtT(Math.max(0, M.limit - frame))}</div>` : '')
      + (bn.length ? '<b class="bnh">BONUS ★</b>' + bn.map(o => `<div class="bn ${o.ok() ? 'ok' : ''}">${o.ok() ? '★' : '☆'} ${o.t}${P(o)}</div>`).join('') : '');
  },
  onEnd(win) {
    const nx = $('#endNext');
    if (MISSION) {
      const C = campOf(MISSION); if (win) { LS.set(C.lsU, Math.max(LS.get(C.lsU, 1), MISSION.n + 1)); }
      if (MISSION.id === 'tut' && win) LS.set('tutDone', true);
      if (MISSION.survival) { const k = 'best_' + MISSION.id, best = LS.get(k, 0), got = win ? AI.wave : Math.max(0, AI.wave - 1); if (got > best) { LS.set(k, got); $('#endX').insertAdjacentHTML('afterbegin', `<div class="rec">NEUER REKORD: ${got} WELLEN</div>`); } }
      if (win && !MISSION.noStars) { const n = 1 + bonusOf(MISSION).filter(o => o.ok()).length, st = starsAll(), old = st[MISSION.id] || 0; st[MISSION.id] = Math.max(old, n); LS.set('stars', st);
        $('#endX').insertAdjacentHTML('afterbegin', `<div class="estars">${starStr(n)}</div><div class="ebn">${bonusOf(MISSION).map(o => (o.ok() ? '★ ' : '☆ ') + o.t).join(' · ')}</div>${n > old ? `<div class="enew">+${n - old} Stern${n - old > 1 ? 'e' : ''} · jetzt ${totalStars()} ★ für Kommando-Upgrades</div>` : ''}`); }
      nx.classList.toggle('hidden', !win || (!C.list[MISSION.n] && !MISSION.outro));
      nx.onclick = () => { if (MISSION.outro) { $('#end').classList.add('hidden'); playStory(C.outro, () => location.href = location.pathname); } else location.href = mURL(C.list[MISSION.n]); };
      $('#endRetry').onclick = () => location.href = mURL(MISSION);
    } else { nx.classList.add('hidden'); $('#endRetry').onclick = () => location.href = location.pathname + '?sk&pf=' + PF + '&ef=' + EF + '&map=' + MAP; }
    $('#endMenu').onclick = () => location.href = location.pathname;
  },
};
function playStory(slides, done) {
  const el = $('#story'), img = $('#sImg'); el.classList.remove('hidden'); let i = -1, timer = null, audio = null, ended = false;
  if (musicOn && !MUTE) setTrack('menu');
  const finish = () => { if (ended) return; ended = true; clearTimeout(timer); if (audio) audio.pause(); el.classList.add('hidden'); el.onclick = null; done && done(); };
  const next = () => {
    clearTimeout(timer); if (audio) { audio.pause(); audio = null; }
    if (++i >= slides.length) return finish();
    const s = slides[i]; img.classList.remove('on'); void img.offsetWidth;
    img.style.backgroundImage = imgURL(s.img, FALLBACK[i % FALLBACK.length]); img.classList.add('on');
    $('#sName').textContent = s.who ? SPK[s.who].n : ''; $('#sLine').textContent = s.title ? '' : s.text;
    $('#sTitle').classList.toggle('hidden', !s.title);
    if (s.title && s.text && s.text !== 'FORTSETZUNG FOLGT') $('#sLine').textContent = s.text;
    $('#sTitle').querySelector('.tsub').textContent = s.sub ? (s.text === 'FORTSETZUNG FOLGT' ? 'FORTSETZUNG FOLGT · ' + s.sub : s.sub) : s.text === 'FORTSETZUNG FOLGT' ? 'FORTSETZUNG FOLGT' : 'KRIEG DER MASCHINEN';
    $('#sProg').style.width = ((i + 1) / slides.length * 100) + '%';
    let dur = Math.max(4800, s.text.length * 70);
    if (s.v && voiceOn && !MUTE) { audio = new Audio('assets/voice/' + s.v + '.mp3'); audio.onloadedmetadata = () => { clearTimeout(timer); timer = setTimeout(next, audio.duration * 1000 + 900); }; audio.play().catch(() => { }); }
    timer = setTimeout(next, dur);
  };
  el.onclick = (e) => { if (e.target.id === 'sSkip') return; next(); };
  $('#sSkip').onclick = (e) => { e.stopPropagation(); finish(); };
  next();
}
function showBrief(M) {
  $('#menu').classList.add('hidden'); $('#brief').classList.remove('hidden');
  $('#bImg').style.backgroundImage = imgURL(M.img, FALLBACK[(M.n - 1) % FALLBACK.length]);
  $('#bNum').textContent = campOf(M).ch + ' · MISSION ' + M.n + ' / ' + campOf(M).list.length + (M.kind ? ' · ' + M.kind : ''); $('#bTitle').textContent = M.title.toUpperCase();
  const s = SPK[M.who]; $('#bWho').textContent = s.n; $('#bText').textContent = '„' + M.brief + '“';
  $('#bPort').style.backgroundImage = imgURL(s.p, 'konzept/img/stil2.jpg');
  $('#bObj').innerHTML = M.objectives.map(o => '<li>' + o.t + '</li>').join('');
  if (voiceOn && !MUTE) { const a = new Audio('assets/voice/' + M.id + '_brief.mp3'); a.play().catch(() => { }); $('#bGo').onclick = () => { a.pause(); startGame(M); }; }
  else $('#bGo').onclick = () => startGame(M);
}
function startGame(M) {
  if (running) return;
  initAudio(); $('#brief').classList.add('hidden'); $('#menu').classList.add('hidden');
  if (M) { PF = M.pf || 'echo'; EF = M.ef || 'axiom'; }
  MISSION = M; buildSide(); initWorld(M); ready = true; running = true; stats.t0 = performance.now();
  AI.timer = M ? M.waves.first : DIFF[diff].first;
  if (M) { $('#objs').classList.remove('hidden'); CAMP.tick(); }
  if (matchMedia('(pointer:coarse)').matches && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => { });
  setTimeout(() => { resize(); }, 300);
  if (musicOn) { bgName = null; setTrack(wantTrack()); }
  if (PF === 'echo') speak('Willkommen, Kommandant. ECHO ist online', true);
  if (!M) { const F = facOf(0), tip = { echo: 'Hacker übernehmen feindliche Maschinen.', axiom: 'Deine Maschinen brauchen das Datennetz – baue Relais, sonst gehen sie offline.', verbund: 'Prediger bekehren feindliche Infanterie. Phantome sind getarnt und zerstören Gebäude.', schrott: 'Jedes zerstörte Fahrzeug oder Gebäude in deiner Nähe bringt Schrott-Credits.' }[PF];
    msg(F.short + ' ▸ ' + UD[F.harv].n + ' sammelt Silizit (blaue Kristalle) → Credits.', '#7fffd4'); msg(F.short + ' ▸ ' + tip, F.col); msg('Gegner: ' + facOf(1).n + ' · ' + facOf(1).leader, facOf(1).col); }
}
let curCamp = LS.get('camp', 'echo');
function buildMissionList() {
  const C = CAMPS[curCamp] || CAMPS.echo, un = C.k === 'bonus' ? 99 : LS.get(C.lsU, 1), done = un - 1, ST = starsAll(), TS = totalStars();
  $('#mList .mlh').textContent = C.k === 'bonus' ? 'BONUS-EINSÄTZE · ' + TS + ' ★ GESAMMELT' : 'KAMPAGNE WÄHLEN';
  $('#mTabs').style.display = C.hide ? 'none' : '';
  $('#mTabs').innerHTML = Object.values(CAMPS).filter(c => !c.hide).map(c => `<div class="ctab ${c.k === C.k ? 'on' : ''}" data-k="${c.k}" style="--c:${FAC[c.fac].col}"><i style="background-image:url('assets/story/f_${c.fac}.jpg')"></i><span><small>${c.ch}</small><b>${c.n}</b><em>${c.who}</em></span></div>`).join('');
  document.querySelectorAll('.ctab').forEach(t => t.onclick = () => { curCamp = t.dataset.k; LS.set('camp', curCamp); buildMissionList(); });
  const locked = M => C.k === 'bonus' ? (M.req || 0) > TS : M.n > un;
  $('#mCards').innerHTML = C.list.map(M => `<div class="mcard ${locked(M) ? 'lock' : ''}" data-n="${M.n}"><div class="mi" style="background-image:${imgURL(M.img, FALLBACK[(M.n - 1) % 4])}"></div><div><b>${M.n} · ${M.title.toUpperCase()}${M.kind ? ` <em class="mk mk-${M.kind[0]}">${M.kind}</em>` : ''}</b><small>${M.objectives.map(o => o.t).join(' · ')}</small>${C.k === 'bonus' && locked(M) ? `<div class="need">🔒 ${M.req} ★ nötig (du hast ${TS})</div>` : ''}${ST[M.id] ? `<div class="mst">${starStr(ST[M.id])}</div>` : (M.n <= done && C.k !== 'bonus' ? '<div class="done">✔ ERFÜLLT</div>' : '')}${M.survival && LS.get('best_' + M.id, 0) ? `<div class="need">Rekord: ${LS.get('best_' + M.id, 0)} Wellen</div>` : ''}</div></div>`).join('');
  document.querySelectorAll('.mcard').forEach(c => c.onclick = () => { const M = C.list[+c.dataset.n - 1]; if (locked(M)) return; initAudio(); if (M.n === 1 && C.intro.length && !LS.get(C.lsI, false)) { LS.set(C.lsI, true); $('#menu').classList.add('hidden'); playStory(C.intro, () => showBrief(M)); } else showBrief(M); });
}
// Titel-Hintergrund + Funken
$('#kv').style.backgroundImage = imgURL('title', 'konzept/img/stil2.jpg');
(() => { const c = $('#embers'), g = c.getContext('2d'); let P = []; const rs = () => { c.width = c.clientWidth; c.height = c.clientHeight; }; rs(); addEventListener('resize', rs);
  const tick = () => { if ($('#menu').classList.contains('hidden')) { requestAnimationFrame(tick); return; } g.clearRect(0, 0, c.width, c.height); if (P.length < 70) P.push({ x: Math.random() * c.width, y: c.height + 10, v: .4 + Math.random() * 1.2, s: 1 + Math.random() * 2.2, w: Math.random() * 6, c: Math.random() < .75 ? '255,140,60' : '79,240,255' });
    g.globalCompositeOperation = 'lighter'; for (const p of P) { p.y -= p.v; p.x += Math.sin((p.y + p.w * 50) / 60) * .4; const a = Math.min(1, p.y / c.height * 1.4); g.fillStyle = `rgba(${p.c},${a * .8})`; g.beginPath(); g.arc(p.x, p.y, p.s, 0, TAU); g.fill(); } P = P.filter(p => p.y > -10); requestAnimationFrame(tick); }; tick(); })();
document.addEventListener('pointerdown', () => { if (!running && musicOn && !bgName) setTrack('menu'); }, { once: false });
$('#bCamp').onclick = () => { initAudio(); curCamp = LS.get('camp', 'echo'); if (!CAMPS[curCamp] || CAMPS[curCamp].hide) curCamp = 'echo'; $('#mMain').classList.add('hidden'); $('#mList').classList.remove('hidden'); buildMissionList(); };
$('#bBack').onclick = () => { $('#mList').classList.add('hidden'); $('#mMain').classList.remove('hidden'); if (CAMPS[curCamp].hide) curCamp = LS.get('camp', 'echo'); menuBadges(); };
$('#bSkirm').onclick = () => { initAudio(); $('#mMain').classList.add('hidden'); $('#mSk').classList.remove('hidden'); buildFacPick(); };
$('#bSkBack').onclick = () => { $('#mSk').classList.add('hidden'); $('#mMain').classList.remove('hidden'); };
$('#bSkGo').onclick = () => { LS.set('pf', PF); LS.set('ef', EF); LS.set('map', MAP); startGame(null); };
function buildFacPick() {
  PF = LS.get('pf', 'echo'); EF = LS.get('ef', 'axiom');
  const card = (k, side) => { const F = FAC[k]; return `<div class="fc ${(side === 'p' ? PF : EF) === k ? 'on' : ''}" data-k="${k}" data-s="${side}" style="--c:${F.col};background-image:url('assets/story/f_${k}.jpg')"><b>${F.short}</b></div>`; };
  $('#fcP').innerHTML = Object.keys(FAC).map(k => card(k, 'p')).join(''); $('#fcE').innerHTML = Object.keys(FAC).map(k => card(k, 'e')).join('');
  MAP = LS.get('map', 'oednis'); if (!MAPS[MAP]) MAP = 'oednis';
  $('#fcM').innerHTML = Object.entries(MAPS).map(([k, m]) => `<div class="fc fm ${MAP === k ? 'on' : ''}" data-m="${k}" style="--c:#ffc64a;background-image:url('assets/tex/${m.tex}.jpg')"><b>${m.n.toUpperCase()}</b></div>`).join('');
  document.querySelectorAll('.fm').forEach(c => c.onclick = () => { MAP = c.dataset.m; document.querySelectorAll('.fm').forEach(x => x.classList.toggle('on', x.dataset.m === MAP)); info(); });
  const info = () => { const F = FAC[PF], m = MP(); $('#fcInfo').innerHTML = `<b style="color:${F.col}">${F.n}</b> · ${F.leader}<br>Einheiten: ${F.units.map(u => UD[u].n).join(', ')}<br><b style="color:#ffc64a">${m.n}:</b> ${m.d}`; };
  document.querySelectorAll('.fc:not(.fm)').forEach(c => c.onclick = () => { if (c.dataset.s === 'p') PF = c.dataset.k; else EF = c.dataset.k; buildFacPick2(); });
  const buildFacPick2 = () => { document.querySelectorAll('.fc:not(.fm)').forEach(c => c.classList.toggle('on', (c.dataset.s === 'p' ? PF : EF) === c.dataset.k)); info(); };
  info();
}
// ===== VÖLKER-ÜBERSICHT =====
const VLORE = {
  echo: { p: 'p_voss', camp: 'echo', ch: 'Kapitel 1 · Funkenflug', d: 'Der letzte menschliche Widerstand aus den Ruinen von Neu-Berlin. Wenig Material, viel Mut – und Hacker, die AXIOM mit seinen eigenen Waffen schlagen.', style: 'Ausgewogen: Infanterie, Panzer, Deckung. Stark, wenn du clever kombinierst.', sig: 'HACKEN', sigd: 'Der Hacker übernimmt feindliche Maschinen. Gekaperte AXIOM-Einheiten kämpfen für dich.' },
  axiom: { p: 'p_axiom', camp: 'axiom', ch: 'Kapitel 4 · Zweihundertzwölf', d: 'Die Verteidigungs-KI, die 2034 den Menschen zur Bedrohung erklärte. 212 Rechenkerne, ein Gedanke. Kennt keine Angst und keinen Schlaf.', style: 'Technik und Masse: billige Läufer, schwere Titanen, getarnte Spinnen.', sig: 'DATENNETZ', sigd: 'Einheiten nahe eines Daten-Relais sind stärker. Ohne Netz kämpfen sie schlechter.' },
  verbund: { p: 'p_selene', camp: 'verbund', ch: 'Kapitel 3 · Die Verschmelzung', d: 'Ein Kult aus Menschen mit KI-Implantaten. Prophetin Selene predigt die Verschmelzung von Fleisch und Maschine als Erlösung.', style: 'Tarnung und Überraschung: Phantome, schwebende Seraphe, Psi-Türme.', sig: 'BEKEHRUNG', sigd: 'Prediger bekehren feindliche Infanterie – Gegner werden zu deinen Gläubigen.' },
  schrott: { p: 'p_brakk', camp: 'schrott', ch: 'Kapitel 2 · Rost & Ruhm', d: 'Banden aus der Ödnis, die alles aus Wracks bauen. Brakk, der Rostkönig, verkauft an jeden – und kämpft nur für sich.', style: 'Billig und schnell: viele Einheiten, frühe Angriffe (Rush).', sig: 'RECYCLING', sigd: 'Zerstörte Fahrzeuge – auch eigene – werden zu Schrott-Credits.' },
};
let vCur = 'echo';
function openVolk(k) {
  vCur = k || vCur; const F = FAC[vCur], L = VLORE[vCur], S = SWD[BD[F.sw].sw];
  $('#volk .vbox').style.setProperty('--c', F.col);
  $('#vTabs').innerHTML = Object.keys(FAC).map(x => `<div class="vtab ${x === vCur ? 'on' : ''}" data-k="${x}" style="--c:${FAC[x].col};background-image:url('assets/story/f_${x}.jpg')"><b>${FAC[x].short}</b></div>`).join('');
  const uimg = u => `assets/units/${u}/${u}_02.png`;
  $('#vBody').innerHTML = `<div class="vhead"><i style="background-image:url('assets/story/${L.p}.jpg')"></i><div><h3>${F.n.toUpperCase()}</h3><div class="vl">Anführer: <b>${F.leader}</b> · Kampagne: ${L.ch}</div><p>${L.d}</p></div></div>
   <div class="vsig"><div><h5>SPIELWEISE</h5>${L.style}</div><div><h5>SPEZIALFÄHIGKEIT · ${L.sig}</h5>${L.sigd}</div></div>
   <div class="vsig"><div style="grid-column:1/-1"><h5>SUPERWAFFE · ${BD[F.sw].n.toUpperCase()}</h5><b style="color:${S.hex}">${S.n}</b> – ${S.info}</div></div>
   <div class="vsig vhero"><div style="grid-column:1/-1"><h5>HELD · ${UD[F.hero].n.toUpperCase()}</h5><img src="${uimg(F.hero)}" alt="" onerror="this.style.display='none'">${HAB[F.hero].map((A, i) => `<p><b>${A.ic} ${A.n}</b> <small>(Taste ${i ? 'F' : 'R'} · ${A.cd} s)</small> – ${A.info}</p>`).join('')}<p class="vl">Startet in jedem Einsatz mit, steigt durch Abschüsse bis Stufe 4 auf und kehrt 45 s nach dem Fall im Hauptquartier zurück.</p></div></div>
   <div class="mlh">EINHEITEN</div><div class="vgrid">${F.units.map(u => `<div><img src="${uimg(u)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">${UD[u].n}<small>${UD[u].cost} Credits</small></div>`).join('')}</div>
   ${F.units.some(u => UAB[u]) ? `<div class="vsig vhero"><div style="grid-column:1/-1"><h5>EINHEITEN-FÄHIGKEITEN (Taste V)</h5>${F.units.filter(u => UAB[u]).map(u => `<p><b>${UAB[u].ic} ${UAB[u].n}</b> <small>(${UD[u].n} · ${UAB[u].cd} s)</small> – ${UAB[u].info}</p>`).join('')}</div></div>` : ''}
   <div class="mlh">GEBÄUDE</div><div class="vgrid">${[F.hq, ...F.build].map(b => `<div><img src="assets/sprites/${b}.png" alt="" loading="lazy" onerror="this.style.visibility='hidden'">${BD[b].n}<small>${BD[b].cost ? BD[b].cost + ' Credits' : 'Startgebäude'}</small></div>`).join('')}</div>
   <div class="vgo"><button class="mb" id="vCamp"><span>▶</span> KAMPAGNE SPIELEN</button><button class="mb" id="vSk"><span>⚔</span> GEFECHT ALS ${F.short}</button></div>`;
  document.querySelectorAll('.vtab').forEach(t => t.onclick = () => openVolk(t.dataset.k));
  $('#vCamp').onclick = () => { initAudio(); curCamp = L.camp; LS.set('camp', curCamp); $('#volk').classList.add('hidden'); $('#mMain').classList.add('hidden'); $('#mList').classList.remove('hidden'); buildMissionList(); };
  $('#vSk').onclick = () => { initAudio(); LS.set('pf', vCur); LS.set('ef', vCur === 'axiom' ? 'echo' : 'axiom'); $('#volk').classList.add('hidden'); $('#mMain').classList.add('hidden'); $('#mSk').classList.remove('hidden'); buildFacPick(); };
  $('#volk').classList.remove('hidden'); $('#vBody').scrollTop = 0;
}
$('#bVolk').onclick = () => { initAudio(); openVolk(); };
$('#vClose').onclick = () => $('#volk').classList.add('hidden');

// ===== ERFOLGE & STATISTIK =====
const LIFE0 = { games: 0, wins: 0, losses: 0, kills: 0, lost: 0, hacked: 0, harv: 0, crates: 0, sw: 0, eHero: 0, uab: 0, hab: 0, min: 0, winFac: [], fac: {} };
const lifeGet = () => Object.assign({}, LIFE0, LS.get('life', {}));
const lifeNow = () => { const L = lifeGet(); for (const k of ['kills', 'lost', 'hacked', 'harv', 'crates', 'sw', 'eHero', 'uab', 'hab']) L[k] += stats[k] || 0; return L; };
const campDone = k => LS.get(CAMPS[k].lsU, 1) > CAMPS[k].list.length;
const cnt3 = () => Object.values(starsAll()).filter(n => n >= 3).length;
const ACH = [
  { k: 'first', ic: '▶', n: 'Erster Einsatz', d: 'Eine Mission oder ein Gefecht beenden', ok: L => L.games >= 1 },
  { k: 'tut', ic: '◎', n: 'Rekrut', d: 'Grundausbildung bestehen', ok: () => LS.get('tutDone', false) },
  { k: 'c1', ic: '①', n: 'Funkenflug', d: 'Kapitel 1 (ECHO-Front) abschließen', ok: () => campDone('echo') },
  { k: 'c2', ic: '②', n: 'Rost & Ruhm', d: 'Kapitel 2 (Schrottkönige) abschließen', ok: () => campDone('schrott') },
  { k: 'c3', ic: '③', n: 'Die Verschmelzung', d: 'Kapitel 3 (Verbundene) abschließen', ok: () => campDone('verbund') },
  { k: 'c4', ic: '④', n: 'Zweihundertzwölf', d: 'Kapitel 4 (AXIOM) abschließen', ok: () => campDone('axiom') },
  { k: 'perf', ic: '★', n: 'Perfektionist', d: 'Eine Mission mit 3 ★ abschließen', ok: () => cnt3() >= 1 },
  { k: 'st30', ic: '✦', n: 'Sternensammler', d: '30 ★ sammeln', ok: () => totalStars() >= 30, p: () => [totalStars(), 30] },
  { k: 'st60', ic: '✷', n: 'Sternenkommandant', d: '60 ★ sammeln', ok: () => totalStars() >= 60, p: () => [totalStars(), 60] },
  { k: 'k100', ic: '✕', n: 'Frontschwein', d: '100 Gegner zerstören', ok: L => L.kills >= 100, p: L => [L.kills, 100] },
  { k: 'k1000', ic: '☠', n: 'Maschinenfriedhof', d: '1.000 Gegner zerstören', ok: L => L.kills >= 1000, p: L => [L.kills, 1000] },
  { k: 'hack', ic: '⌁', n: 'Geisterhand', d: '25 Einheiten hacken oder bekehren', ok: L => L.hacked >= 25, p: L => [L.hacked, 25] },
  { k: 'harv', ic: '◆', n: 'Silizit-Baron', d: '100.000 Silizit ernten', ok: L => L.harv >= 100000, p: L => [L.harv, 100000] },
  { k: 'crate', ic: '▣', n: 'Schatzsucher', d: '25 Nachschubkisten finden', ok: L => L.crates >= 25, p: L => [L.crates, 25] },
  { k: 'sw', ic: '☢', n: 'Weltuntergang', d: '10 Superwaffen abfeuern', ok: L => L.sw >= 10, p: L => [L.sw, 10] },
  { k: 'hero', ic: '♛', n: 'Königsmörder', d: '10 gegnerische Helden besiegen', ok: L => L.eHero >= 10, p: L => [L.eHero, 10] },
  { k: 'uab', ic: '⚡', n: 'Taktiker', d: '50 Einheiten-Fähigkeiten einsetzen', ok: L => L.uab >= 50, p: L => [L.uab, 50] },
  { k: 'hab', ic: '✸', n: 'Legende', d: '50 Helden-Fähigkeiten einsetzen', ok: L => L.hab >= 50, p: L => [L.hab, 50] },
  { k: 'w25', ic: '⚑', n: 'Veteran', d: '25 Siege', ok: L => L.wins >= 25, p: L => [L.wins, 25] },
  { k: 'blitz', ic: '⏱', n: 'Blitzsieg', d: 'Einen Einsatz in unter 8 Minuten gewinnen', end: (w) => w && frame <= 8 * 3600 },
  { k: 'clean', ic: '⛨', n: 'Unberührbar', d: 'Mit Basis gewinnen, ohne ein Gebäude zu verlieren', end: (w) => w && !(MISSION && MISSION.noBase) && stats.lostB === 0 && frame > 3 * 3600 },
  { k: 'nolos', ic: '♥', n: 'Niemand bleibt zurück', d: 'Einen Einsatz mit höchstens 2 eigenen Verlusten gewinnen', end: (w) => w && stats.lost <= 2 && frame > 3 * 3600 },
  { k: 'conv', ic: '⇢', n: 'Konvoi-Meister', d: 'Eine Eskorte ohne Verlust eines Transporters schaffen', end: (w) => w && MISSION && MISSION.escort && ESC.got >= MISSION.escort.n },
  { k: 'free', ic: '⛓', n: 'Ausbrecher', d: 'Alle Gefangenen befreien', end: (w) => w && RESC.length > 0 },
  { k: 'bast', ic: '⛫', n: 'Letzte Bastion', d: '15 Wellen in „Letzte Bastion“ überstehen', ok: () => LS.get('best_b1', 0) >= 15, p: () => [LS.get('best_b1', 0), 15] },
  { k: 'hard', ic: '⚔', n: 'Harte Schule', d: 'Ein Gefecht auf SCHWER gewinnen', end: (w) => w && !MISSION && diff === 2 },
  { k: 'four', ic: '◈', n: 'Vier Völker', d: 'Mit allen 4 Völkern ein Gefecht gewinnen', ok: L => L.winFac.length >= 4, p: L => [L.winFac.length, 4] },
];
const achGot = () => LS.get('ach', {});
function achPop(a) {
  const el = $('#achPop'); if (!el) return; el.innerHTML = `<i>${a.ic}</i><div><small>ERFOLG FREIGESCHALTET</small><b>${a.n}</b><span>${a.d}</span></div>`;
  el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); snd('ready'); clearTimeout(achPop.t); achPop.t = setTimeout(() => el.classList.remove('show'), 4200);
}
function achCheck(atEnd, win, L) {
  L = L || lifeNow(); const got = achGot(), neu = [];
  for (const a of ACH) { if (got[a.k]) continue; const ok = a.end ? (atEnd && a.end(win)) : a.ok(L); if (ok) { got[a.k] = new Date().toISOString().slice(0, 10); neu.push(a); } }
  if (neu.length) { LS.set('ach', got); neu.forEach((a, i) => setTimeout(() => achPop(a), i * 1600)); }
  return neu;
}
function achEnd(win) {
  const L = lifeGet(); L.games++; if (win) L.wins++; else L.losses++; L.min += Math.round(frame / 3600);
  for (const k of ['kills', 'lost', 'hacked', 'harv', 'crates', 'sw', 'eHero', 'uab', 'hab']) L[k] += stats[k] || 0;
  L.fac[PF] = (L.fac[PF] || 0) + 1; if (win && !MISSION && !L.winFac.includes(PF)) L.winFac.push(PF);
  LS.set('life', L);
  const neu = achCheck(true, win, L);
  if (neu.length) $('#endX').insertAdjacentHTML('beforeend', `<div class="each">${neu.map(a => `<span><i>${a.ic}</i> ${a.n}</span>`).join('')}</div>`);
}
function openAch() {
  const L = lifeGet(), got = achGot(), n = ACH.filter(a => got[a.k]).length, fmt = v => Math.round(v).toLocaleString('de-DE');
  const fav = Object.entries(L.fac).sort((a, b) => b[1] - a[1])[0];
  const rows = [['Einsätze gespielt', fmt(L.games)], ['Siege · Niederlagen', fmt(L.wins) + ' · ' + fmt(L.losses)], ['Siegquote', L.games ? Math.round(L.wins / L.games * 100) + ' %' : '–'], ['Spielzeit', fmt(L.min) + ' Min.'],
    ['Gegner zerstört', fmt(L.kills)], ['Eigene Verluste', fmt(L.lost)], ['Gehackt / bekehrt', fmt(L.hacked)], ['Silizit geerntet', fmt(L.harv)], ['Nachschubkisten', fmt(L.crates)], ['Superwaffen abgefeuert', fmt(L.sw)],
    ['Gegner-Helden besiegt', fmt(L.eHero)], ['Fähigkeiten (Einheiten · Helden)', fmt(L.uab) + ' · ' + fmt(L.hab)], ['Sterne', totalStars() + ' ★'], ['Letzte Bastion Rekord', LS.get('best_b1', 0) + ' Wellen'], ['Lieblingsvolk', fav ? FAC[fav[0]].n : '–']];
  $('#achBody').innerHTML = `<div class="achsum"><b>${n} / ${ACH.length}</b> Erfolge<div class="achbar"><i style="width:${n / ACH.length * 100}%"></i></div></div><div class="achgrid">`
    + ACH.map(a => { const h = got[a.k], pr = !h && a.p ? a.p(L) : null; return `<div class="achc ${h ? 'on' : ''}"><i>${a.ic}</i><div><b>${a.n}</b><small>${a.d}</small>${h ? `<em>✔ ${h.split('-').reverse().join('.')}</em>` : pr ? `<div class="achp"><u style="width:${Math.min(100, pr[0] / pr[1] * 100)}%"></u></div><em class="pg">${fmt(Math.min(pr[0], pr[1]))} / ${fmt(pr[1])}</em>` : ''}</div></div>`; }).join('')
    + `</div><div class="mlh">STATISTIK</div><div class="stgrid">${rows.map(r => `<div><span>${r[0]}</span><b>${r[1]}</b></div>`).join('')}</div>`;
  $('#ach').classList.remove('hidden'); $('#achBody').scrollTop = 0;
}
$('#bAch').onclick = () => { initAudio(); achCheck(false, false, lifeGet()); menuBadges(); openAch(); };
$('#achClose').onclick = () => $('#ach').classList.add('hidden');
// ===== AUSBILDUNG / BONUS / UPGRADES im Menü =====
function menuBadges() {
  const ts = totalStars(), free = ts - upgSpent();
  $('#bUpg').innerHTML = `<span>⬢</span> UPGRADES <em>${free} ★</em>`;
  $('#bBonus').innerHTML = `<span>★</span> BONUS-EINSÄTZE <em>${ts} ★</em>`;
  $('#bAch').innerHTML = `<span>🏆</span> ERFOLGE &amp; STATISTIK <em>${ACH.filter(a => achGot()[a.k]).length}/${ACH.length}</em>`;
  $('#bTut').classList.toggle('rec', !LS.get('tutDone', false)); $('#bTut').innerHTML = `<span>◎</span> AUSBILDUNG ${LS.get('tutDone', false) ? '<em>✔</em>' : '<em>NEU</em>'}`;
}
$('#bTut').onclick = () => { initAudio(); showBrief(TUT); };
$('#bBonus').onclick = () => { initAudio(); curCamp = 'bonus'; $('#mMain').classList.add('hidden'); $('#mList').classList.remove('hidden'); buildMissionList(); };
function openUpg() {
  const ts = totalStars(), free = ts - upgSpent();
  $('#upgBody').innerHTML = `<p class="uinfo">Sterne verdienst du in Kampagne und Bonus-Einsätzen: ★ Sieg · ★ alle Nachschubkisten bzw. Bonusziel 1 · ★ Zeit bzw. Bonusziel 2. Gesammelt: <b>${ts} ★</b> · frei: <b>${free} ★</b></p>`
    + UPGD.map(u => { const has = UPGS.includes(u.k), can = !has && free >= u.c; return `<div class="urow ${has ? 'has' : ''}"><div><b>${u.n}</b><small>${u.d}</small></div><button class="ubuy" data-k="${u.k}" ${has || !can ? 'disabled' : ''}>${has ? '✔ AKTIV' : u.c + ' ★'}</button></div>`; }).join('')
    + `<button class="mb sm" id="upgReset">↺ Upgrades zurücksetzen (Sterne zurück)</button>`;
  document.querySelectorAll('.ubuy').forEach(b => b.onclick = () => { UPGS.push(b.dataset.k); LS.set('upg', UPGS); snd('ready'); openUpg(); menuBadges(); });
  $('#upgReset').onclick = () => { UPGS = []; LS.set('upg', UPGS); openUpg(); menuBadges(); };
  $('#upg').classList.remove('hidden');
}
$('#bUpg').onclick = () => { initAudio(); openUpg(); };
$('#upgClose').onclick = () => $('#upg').classList.add('hidden');
$('#bMusM').onclick = (e) => { e.stopPropagation(); setMusic(!musicOn); $('#bMusM').innerHTML = '<span>♫</span> MUSIK: ' + (musicOn ? 'AN' : 'AUS'); if (musicOn) { bgName = null; setTrack('menu'); } };
$('#bIntro').onclick = () => { initAudio(); $('#menu').classList.add('hidden'); playStory(INTRO, () => $('#menu').classList.remove('hidden')); };
(async () => {
  resize();
  await bakeAll(p => { $('#loadbar i').style.width = (p * 80) + '%'; });
  await loadExtSprites(); await loadExtUnits(); $('#loadbar i').style.width = '100%';
  $('#loadtxt').textContent = 'BEREIT'; ['#bCamp', '#bSkirm', '#bIntro', '#bVolk', '#bTut', '#bBonus', '#bUpg', '#bAch'].forEach(b => $(b).disabled = false); menuBadges();
  const q = new URLSearchParams(location.search);
  if (q.has('m')) { const C = CAMPS[q.get('c') || 'echo'] || CAMPS.echo, M = C.list[+q.get('m') - 1]; if (M) showBrief(M); }
  else if (q.has('sk')) { PF = q.get('pf') || LS.get('pf', 'echo'); EF = q.get('ef') || LS.get('ef', 'axiom'); MAP = q.get('map') || LS.get('map', 'oednis'); startGame(null); }
})();
window.__G = { kill, UAB, uCast, aimUab, uAimAt, get zones() { return zones; }, get uAim() { return uAim; }, launchSW, swOf, swMax, aimSW, get strikes() { return strikes; }, get swAim() { return swAim; }, get ents() { return ents; }, get frame() { return frame; }, SPR, get credits() { return credits; }, set credits(v) { credits = v; },
  ff(n) { for (let i = 0; i < n; i++) step(); }, render, step, get parts() { return parts; }, reveal() { seen.fill(1); updFog(); }, AI, prod, queues, sel, get placing() { return placing; },
  place(type, x, y) { placing = type; ghost = { x, y }; tryPlace(); }, startGame, MISSIONS, CAMPS, showBrief, playStory, INTRO, get MISSION() { return MISSION; }, cam, centerOn, orderMove, FAC, get PF() { return PF; }, get EF() { return EF; }, setFac(a, b) { PF = a; EF = b; }, orderAttack, spawnWave, mkUnit, stats, get zoom() { return zoom; }, set zoom(v) { zoom = v; } };
Object.defineProperties(window.__G, { crates: { get: () => crates }, tutMark: { get: () => tutMark }, TUTU: { get: () => TUTU } }); Object.assign(window.__G, { stats, mkBuild, mkUnit, TUT, BONUS, toggleSlow, convert, takeCrate, HERO, HAB, heroOf, heroCast, aimHero, selectHero });
// ===== EINSTELLUNGEN & STEUERUNG =====
function openOpts() {
  const wasPaused = paused; if (running && !gameOver && !paused) togglePause();
  const seg = (k, vals) => vals.map(([v, l]) => `<button data-k="${k}" data-v="${v}" class="${OPT[k] == v ? 'on' : ''}">${l}</button>`).join('');
  $('#optBody').innerHTML = `
   <div class="orow"><b>SPIELTEMPO</b><div class="oseg">${seg('speed', [[.75, 'LANGSAM'], [1, 'NORMAL'], [1.35, 'SCHNELL']])}</div></div>
   <div class="orow"><b>MUSIK</b><div class="oseg">${seg('mus', [[0, 'AUS'], [.2, 'LEISE'], [.45, 'MITTEL'], [.8, 'LAUT']])}</div></div>
   <div class="orow"><b>EFFEKTE</b><div class="oseg">${seg('sfx', [[0, 'AUS'], [.25, 'LEISE'], [.5, 'MITTEL'], [.9, 'LAUT']])}</div></div>
   <div class="ohelp"><div><h5>MAUS &amp; TASTATUR</h5>
    <p><kbd>Linksklick</kbd> auswählen · bewegen · angreifen</p><p><kbd>Ziehen</kbd> Rahmen um Einheiten</p><p><kbd>Doppelklick</kbd> alle gleichen Einheiten</p><p><kbd>Rechtsklick</kbd> abbrechen / abwählen</p>
    <p><kbd>W A S D</kbd> / Pfeile / Bildrand: Karte scrollen · <kbd>Mausrad</kbd> Zoom</p>
    <p><kbd>Q</kbd> Angriffsbefehl · <kbd>X</kbd> Stopp · <kbd>E</kbd> alle Einheiten</p>
    <p><kbd>T</kbd> taktische Zeitlupe · <kbd>Z</kbd> Superwaffe · <kbd>H</kbd> zur Basis</p>
    <p><kbd>Strg/⌘ + 1–9</kbd> Gruppe speichern · <kbd>1–9</kbd> Gruppe wählen</p>
    <p><kbd>P</kbd> Pause · <kbd>?</kbd> diese Hilfe · <kbd>Esc</kbd> alles abbrechen</p></div>
   <div><h5>TOUCH (HANDY / TABLET)</h5>
    <p><kbd>Tippen</kbd> auswählen · bewegen · angreifen</p><p><kbd>Wischen</kbd> Karte verschieben</p><p><kbd>Zwei Finger</kbd> zoomen</p><p><kbd>BOX</kbd> dann ziehen: Rahmen um Einheiten</p>
    <h5>TIPPS</h5><p>Bauleiste rechts antippen → bauen → wenn „BEREIT“ blinkt, antippen und Platz wählen.</p><p>Lange drücken auf einen Bauknopf = abbrechen (Geld zurück).</p><p>Ernter sammeln Silizit (blaue Kristalle) → Credits. Ohne Energie bauen alle langsamer.</p></div></div>`;
  document.querySelectorAll('#optBody .oseg button').forEach(b => b.onclick = () => { OPT[b.dataset.k] = +b.dataset.v; saveOpt(); BGVOL = OPT.mus; BGA.forEach(a => { if (!a.paused) a.volume = BGVOL; }); if (sfxGain) sfxGain.gain.value = OPT.sfx; openOpts.refresh(); });
  openOpts.refresh = () => document.querySelectorAll('#optBody .oseg button').forEach(b => b.classList.toggle('on', OPT[b.dataset.k] == b.dataset.v));
  $('#opts').classList.remove('hidden');
  $('#optClose').onclick = () => { $('#opts').classList.add('hidden'); if (running && !gameOver && paused && !wasPaused) togglePause(); };
}
$('#bOptM').onclick = () => { initAudio(); openOpts(); };
$('#bHelp').addEventListener('pointerup', e => { e.preventDefault(); openOpts(); });
