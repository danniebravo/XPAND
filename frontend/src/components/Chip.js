/* XPAND · components/Chip.js — etiqueta de estado con color según el estado. */
import { h } from "../core/h.js";

const ESTADOS = {
  publicado: { label: "Publicado", cls: "chip-verde" },
  en_revision: { label: "En revisión", cls: "chip-gris" },
  borrador: { label: "Borrador", cls: "chip-amarillo" },
  incompleto: { label: "Incompleto", cls: "chip-rojo" },
  activo: { label: "Activo", cls: "chip-verde" },
  activa: { label: "Activa", cls: "chip-verde" },
  desactivado: { label: "Suspendida", cls: "chip-gris" },
  bloqueada: { label: "Bloqueada", cls: "chip-amarillo" },
  sin_actividad: { label: "Sin actividad", cls: "chip-amarillo" },
  suspendida: { label: "Suspendida", cls: "chip-rojo" },
};

export const estadoLabel = (estado) => (ESTADOS[estado] || { label: estado }).label;

/** <Chip estado="publicado" /> o, con color propio, <Chip tono="amarillo">texto</Chip> */
export function Chip({ estado, tono, children }) {
  const e = estado ? ESTADOS[estado] || { label: estado, cls: "chip-gris" } : { label: null, cls: "chip-" + (tono || "gris") };
  return h("span", { class: ["chip", e.cls] }, e.label ?? children);
}
