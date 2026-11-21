/* XPAND · components/DetailField.js — par etiqueta/valor de las tarjetas de detalle (.df). */
import { h } from "../core/h.js";

export function DetailField({ k, v }) {
  return h("div", { class: "df" }, h("span", { class: "dl" }, k), h("span", { class: "dv" }, v));
}
