/* XPAND · components/DataTable.js
 * Tabla de datos. En pantallas pequeñas el CSS la convierte en tarjetas usando el data-label de cada celda.
 *   columns: [{ label, render(fila) | key, class }]   rows: [...]   onRowClick(fila)   empty: texto si no hay filas
 */
import { h } from "../core/h.js";
import { Logo } from "./Logo.js";

export function DataTable({ columns, rows, onRowClick, empty = "Sin resultados" }) {
  const cuerpo = rows.length
    ? rows.map((fila) =>
        h("tr", { class: onRowClick ? "row-click" : null, onClick: onRowClick ? () => onRowClick(fila) : null },
          columns.map((c) =>
            h("td", { class: c.class, "data-label": c.label || null }, c.render ? c.render(fila) : fila[c.key]))))
    : [h("tr", null, h("td", { class: "empty", colSpan: columns.length },
        h("div", { class: "vacio" }, h(Logo, { mascota: true, height: 84 }), h("p", null, empty))))];
  return h("div", { class: "table-wrap" },
    h("table", { class: "table" },
      h("thead", null, h("tr", null, columns.map((c) => h("th", null, c.label || h("span", { class: "sr-only" }, "Acciones"))))),
      h("tbody", null, cuerpo)));
}
