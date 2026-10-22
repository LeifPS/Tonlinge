/* ===== Zeichnung der Totem-Tonlinge: kleine Holztotems mit Gesicht und dem Wettersymbol auf dem Bauch ===== */
function totemForm(c, s, sp, t, bc, bl) {
  const k = sp.tot, cc = sp.capc, bob = Math.sin(t * 2.2) * s * .015;
  c.lineWidth = Math.max(2, s * .06); c.strokeStyle = INK;
  // Füße
  c.fillStyle = bc; [-1, 1].forEach(d => { c.beginPath(); c.ellipse(d * s * .16, s * .64, s * .1, s * .055, 0, 0, 7); FS(c, bc); });
  // Pfahl (Körper)
  c.beginPath(); c.moveTo(-.3 * s, .62 * s); c.lineTo(-.31 * s, -.26 * s); c.quadraticCurveTo(-.31 * s, -.34 * s, -.22 * s, -.34 * s); c.lineTo(.22 * s, -.34 * s); c.quadraticCurveTo(.31 * s, -.34 * s, .31 * s, -.26 * s); c.lineTo(.3 * s, .62 * s); c.closePath(); FS(c, bc);
  // Maserung
  c.save(); c.strokeStyle = "rgba(70,40,20,.28)"; c.lineWidth = Math.max(1, s * .022); [[-.2, .1, -.21, .5], [.18, 0, .2, .42], [-.05, .2, -.04, .55]].forEach(l => { c.beginPath(); c.moveTo(l[0] * s, l[1] * s); c.lineTo(l[2] * s, l[3] * s); c.stroke(); }); c.restore();
  // Krone in der Farbe des Totems: drei Zacken
  c.beginPath(); c.moveTo(-.34 * s, -.3 * s); c.lineTo(-.28 * s, -.52 * s + bob); c.lineTo(-.14 * s, -.36 * s); c.lineTo(0, -.58 * s + bob); c.lineTo(.14 * s, -.36 * s); c.lineTo(.28 * s, -.52 * s + bob); c.lineTo(.34 * s, -.3 * s); c.closePath(); FS(c, cc);
  // Gesicht: zwei Augen und ein kantiger Mund
  c.fillStyle = INK; [-1, 1].forEach(d => { c.beginPath(); c.ellipse(d * s * .13, -.14 * s, s * .055, s * .075 * bl, 0, 0, 7); c.fill(); });
  c.fillStyle = "#fff"; [-1, 1].forEach(d => { c.beginPath(); c.arc(d * s * .13 - s * .018, -.17 * s, s * .02, 0, 7); c.fill(); });
  c.strokeStyle = INK; c.lineWidth = Math.max(1.6, s * .04); c.beginPath(); c.moveTo(-.1 * s, -.01 * s); c.lineTo(-.05 * s, .03 * s); c.lineTo(0, -.01 * s); c.lineTo(.05 * s, .03 * s); c.lineTo(.1 * s, -.01 * s); c.stroke();
  // Wettersymbol auf dem Bauch
  c.fillStyle = "rgba(255,250,230,.85)"; c.beginPath(); c.ellipse(0, .34 * s, s * .21, s * .19, 0, 0, 7); c.fill(); c.lineWidth = Math.max(1.4, s * .035); c.stroke();
  if (k === "sun") wxIcon(c, "klar", -.17 * s, .17 * s, .34 * s); else wxIcon(c, k, -.17 * s, .17 * s, .34 * s);
  // Seitliche Federn
  c.fillStyle = cc; [-1, 1].forEach(d => { c.beginPath(); c.moveTo(d * s * .31, -.05 * s); c.quadraticCurveTo(d * s * .5, -.02 * s + Math.sin(t * 3 + d) * s * .02, d * s * .46, .18 * s); c.quadraticCurveTo(d * s * .4, .08 * s, d * s * .31, .12 * s); c.closePath(); FS(c, cc); });
}
TOTEM_IDS.forEach(k => { FORMS["tot_" + k] = totemForm; });
