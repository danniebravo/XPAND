/* XPAND · utils/catalogo.js — listas fijas del catálogo (el servidor las valida igual). */
const BBOX = { latMin: 6.238, latMax: 6.260, lngMin: -75.578, lngMax: -75.558 }; // igual que backendpp\domain\catalogo.py
/** true si "lat, lng" cae dentro del rectángulo de la Comuna 10. */
export const dentroComuna10 = (coords) => {
  const p = String(coords || "").split(",").map((x) => parseFloat(x));
  return p.length === 2 && p.every(Number.isFinite) && p[0] >= BBOX.latMin && p[0] <= BBOX.latMax && p[1] >= BBOX.lngMin && p[1] <= BBOX.lngMax;
};
export const TIPOS = ["Visita", "Recorrido", "Foto", "Registro"];
export const BARRIOS = ["Plaza Botero", "Guayaquil", "La Veracruz", "Prado Centro", "Boston", "San Benito", "Prado", "Jesús Nazareno", "Corazón de Jesús"];
