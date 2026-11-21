/* XPAND · components/PageHeader.js — cabecera de cada página: título, subtítulo y acciones. */
import { h } from "../core/h.js";

export function PageHeader({ title, sub, children }) {
  return h("div", { class: "page-head" },
    h("div", null, h("h2", { class: "page-title" }, title), sub ? h("p", { class: "page-sub" }, sub) : null),
    h("div", { class: "page-actions" }, children));
}
