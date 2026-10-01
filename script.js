
const $ = id => document.getElementById(id), mx = n => n.toLocaleString("es-MX", { style: "currency", currency: "MXN" }), DAY = 864e5;
const v = $("venc"), d = new Date(Date.now() - 90 * DAY); v.value = d.toISOString().slice(0, 10);
function calc() {
    const m = +$("monto").value || 0, t = (+$("tasa").value || 0) / 100, f = new Date(v.value + "T00:00:00");
    if (isNaN(f)) { return }
    const dias = Math.max(0, Math.floor((Date.now() - f) / DAY)), int = m * t * (dias / 30),
        lim = new Date(f); lim.setFullYear(lim.getFullYear() + 3),
            pct = Math.min(100, Math.max(0, (Date.now() - f) / (lim - f) * 100));
    $("dias").textContent = dias; $("int").textContent = mx(int); $("tot").textContent = mx(m + int);
    const e = $("est");
    e.textContent = dias === 0 ? "Al corriente" : pct >= 100 ? "Prescrito" : pct >= 66 ? "Urgente: cerca de prescribir" : "Vencido";
    e.className = "badge" + (dias > 0 ? " bad" : "");
    $("bar").style.width = pct + "%";
    $("presc").textContent = "Prescripción estimada: " + lim.toLocaleDateString("es-MX", { dateStyle: "long" }) + " (" + pct.toFixed(0) + "% del plazo de 3 años).";
}
["monto", "venc", "tasa"].forEach(i => $(i).addEventListener("input", calc)); calc();
