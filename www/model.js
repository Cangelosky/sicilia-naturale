/* Copiato da Sottobosco (Funghi-V2/trail/www/model.js) senza modifiche. Sottobosco Trail - modello di previsione "T1" (scala 1-10).
   Regole scritte PRIMA dei risultati; i parametri non sono stati ritoccati sulle date di prova.
   Idea: ancorare la stima all'ultima misura sul campo e correggerla con il meteo successivo.
   Fonti delle regole: Martinez-Pena 2019, Karavani, Alday 2017, Pinna 2010 (vedi progetto Micologia).
   NON validato: servono uscite nuove (verifica in avanti). */
(function (root) {
'use strict';
var KER = [[0, 0.1], [2, 0.25], [5, 0.55], [7, 1], [14, 1], [21, 0.65], [30, 0.35], [45, 0.15], [60, 0]]; // ritardo pioggia -> peso (come Beta v3.1, da letteratura)
function kw(l) { for (var j = 1; j < KER.length; j++) if (l <= KER[j][0]) { var a = KER[j - 1], b = KER[j]; return a[1] + (b[1] - a[1]) * (l - a[0]) / (b[0] - a[0]); } return 0; }
var P = { tau: 14, scalaR: 40, secco: 10, ptSecco: 0.2, tnAlto: 14, tnBasso: 3 };
var BANDS = ['quasi nulla', 'scarso', 'a macchie', 'buono', 'tappeto'];
function parola(v) { v = Math.round(v); return v <= 1 ? BANDS[0] : v <= 3 ? BANDS[1] : v <= 5 ? BANDS[2] : v <= 8 ? BANDS[3] : BANDS[4]; }
function dnum(s) { return Math.round(Date.parse(s + 'T00:00:00Z') / 864e5); }
function dstr(n) { return new Date(n * 864e5).toISOString().slice(0, 10); }
function clip(x, a, b) { return Math.max(a, Math.min(b, x)); }
function prior(d) { var m = +d.slice(5, 7); return (m === 11 || m === 12) ? 3 : 2; }

function Model(M, Z, RIF) { this.M = M; this.Z = Z; this.RIF = RIF; this.s0 = dnum(M.start); }
Model.prototype.serie = function (zid) {
  var cp = this.M.cp[zid], p = this.M.pts[cp]; if (!p) return null;
  var s = { r: p.r.slice(), tx: p.tx.slice(), tn: p.tn.slice(), n: p.r.length }, f = (this.M.forecast || {})[zid] || [];
  var last = this.s0 + s.n - 1;
  f.forEach(function (x) { var i = dnum(x.d) - this.s0; if (i >= s.n) { while (s.r.length < i) { s.r.push(0); s.tx.push(null); s.tn.push(null); } s.r[i] = x.r || 0; s.tx[i] = x.tx; s.tn[i] = x.tn; } }, this);
  s.fine = this.s0 + s.r.length - 1; s.ultimoDato = last; return s;
};
Model.prototype.stato = function (s, d) {
  var i = dnum(d) - this.s0, a, k, LR = 0, sec = 0, tn = [], tx = [];
  for (k = 1; k <= 60; k++) LR += (s.r[i - k] || 0) * kw(k) * 0.5; // 0.5: pioggia pesata in mm equivalenti
  for (k = i - 1; k >= i - 30; k--) { if ((s.r[k] || 0) >= 5) break; sec++; }
  for (k = i - 7; k <= i - 1; k++) { if (s.tn[k] != null) tn.push(s.tn[k]); if (s.tx[k] != null) tx.push(s.tx[k]); }
  var avg = function (a) { return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : null; };
  return { LR: LR, sec: sec, tn: avg(tn), tx: avg(tx) };
};
Model.prototype.ancora = function (zid, d, escludiOggi) {
  var dn = dnum(d), z = this.Z.filter(function (x) { return x.id === zid; })[0], best = null;
  this.RIF.forEach(function (r) { var t = dnum(r.d); if (r.z === zid && (escludiOggi ? t < dn : t <= dn) && (!best || t > dnum(best.d))) best = r; });
  if (best) return { v: best.q / 10, d: best.d, tipo: 'zona' };
  var area = z && z.area, vs = [], Z = this.Z;
  this.RIF.forEach(function (r) { var t = dnum(r.d), zz = Z.filter(function (x) { return x.id === r.z; })[0]; if (zz && zz.area === area && r.z !== zid && t < dn && dn - t <= 30) vs.push(r); });
  if (vs.length) { var m = vs.reduce(function (a, r) { return a + r.q / 10; }, 0) / vs.length, dm = vs.reduce(function (a, r) { return Math.max(a, dnum(r.d)); }, 0); return { v: m, d: dstr(dm), tipo: 'area' }; }
  return null;
};
Model.prototype.stima = function (zid, d, opz) {
  opz = opz || {}; var s = this.serie(zid); if (!s) return null;
  var A = opz.ancora !== undefined ? opz.ancora : this.ancora(zid, d, opz.escludiOggi), st = this.stato(s, d), pr = prior(d), why = [], est, w, dt = null;
  if (A) {
    dt = Math.max(0, dnum(d) - dnum(A.d)); var base = pr + (A.v - pr) * Math.exp(-dt / P.tau), sA = this.stato(s, A.d);
    var dR = clip((st.LR - sA.LR) / P.scalaR, -2, 2); est = base + dR;
    why.push('Ultima misura ' + (A.tipo === 'area' ? 'in zone vicine' : 'qui') + ': ' + (Math.round(A.v * 10) / 10) + ' il ' + A.d.split('-').reverse().join('/'));
    if (Math.abs(dR) >= 0.3) why.push((dR > 0 ? 'Più' : 'Meno') + ' pioggia utile (con il ritardo giusto) rispetto ad allora: ' + (dR > 0 ? '+' : '') + dR.toFixed(1));
    w = Math.min(3.5, 1 + 0.12 * dt) + (A.tipo === 'area' ? 1 : 0);
  } else {
    est = pr + clip((st.LR - 30) / P.scalaR, -1.5, 2); why.push('Nessuna misura vicina: stima dal meteo e dalla stagione'); w = 3;
  }
  var pen = function (q, out) {
    var t = 0, pd = q.sec > P.secco ? Math.min(2, P.ptSecco * (q.sec - P.secco)) : 0, pc = (q.tn != null && q.tn > P.tnAlto) ? Math.min(1.5, (q.tn - P.tnAlto) * 0.25) : 0, pf = (q.tn != null && q.tn < P.tnBasso) ? Math.min(1.5, (P.tnBasso - q.tn) * 0.5) : 0;
    if (out) { out.pd = pd; out.pc = pc; out.pf = pf; } return pd + pc + pf;
  };
  var pT = {}, pT0 = pen(st, pT), pA = A ? pen(this.stato(s, A.d)) : 0, dp = pT0 - pA; // le penalità contano solo se PEGGIORANO rispetto al giorno della misura
  est -= dp;
  if (dp > 0.05) {
    if (pT.pd > 0) why.push(st.sec + ' giorni senza pioggia utile: lettiera asciutta');
    if (pT.pc > 0) why.push('Notti ancora calde (' + st.tn.toFixed(1) + ' °C)');
    if (pT.pf > 0) why.push('Notti molto fredde (' + st.tn.toFixed(1) + ' °C)');
    why.push('Penalità meteo rispetto alla misura: -' + dp.toFixed(1));
  }
  est = clip(est, 1, 10);
  var lo = Math.round(clip(est - w, 1, 10)), hi = Math.round(clip(est + w, 1, 10));
  var conf = w <= 1.6 ? 'media' : w <= 2.6 ? 'bassa' : 'molto bassa';
  return { d: d, est: Math.round(est * 10) / 10, lo: lo, hi: hi, parola: parola(est), conf: conf, why: why, ancora: A, stato: st, oltre: dnum(d) > s.fine };
};
var api = { Model: Model, parola: parola, P: P, BANDS: BANDS, dnum: dnum, dstr: dstr };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.TrailModel = api;
})(typeof self !== 'undefined' ? self : this);
