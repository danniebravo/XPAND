/* XPAND · utils/format.js — formato de valores para mostrar. */
export function costo(l) {
  if (l.costo === 0 || l.costo === "0") return "Gratis";
  if (l.costo == null || l.costo === "") return "Sin dato";
  const n = "$" + Number(l.costo).toLocaleString("es-CO");
  return l.costoDesde ? "desde " + n : n;
}
