/* XPAND · components/StatCard.js — tarjeta de métrica del panel. */
import { h } from "../core/h.js";

export function StatCard({ num, label, sub, tono }) {
  return h("div", { class: ["stat-card", tono] },
    h("div", { class: "stat-num" }, num), h("div", { class: "stat-label" }, label), h("div", { class: "stat-sub" }, sub));
}
