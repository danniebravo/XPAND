/* XPAND · components/DetailHeader.js
 * Cabecera del detalle en página: botón "‹ Volver", título con chip de estado, subtítulo y acciones (íconos).
 * Devuelve un arreglo de nodos (h() lo aplana al usarlo como hijo).
 */
import { h } from "../core/h.js";
import { Chip } from "./Chip.js";

export function DetailHeader({ volverHash, volverLabel = "Volver", titulo, sub, estado, children }) {
  const acciones = (children || []).flat(Infinity).filter(Boolean);
  return [
    h("a", { class: "back-link", href: volverHash }, "‹ " + volverLabel),
    h("div", { class: "detail-page-head" },
      h("div", { class: "dph-main" },
        h("div", { class: "dph-title" }, h("h2", null, titulo), estado ? h(Chip, { estado }) : null),
        sub ? h("p", { class: "muted small" }, sub) : null),
      acciones.length ? h("div", { class: "dph-actions" }, acciones) : null),
  ];
}
