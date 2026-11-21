/* XPAND · components/Alert.js — aviso en bloque. tono: "error" | "warn". */
import { h } from "../core/h.js";

export function Alert({ tono = "error", role, children }) {
  return h("div", { class: ["alert", "alert-" + tono], role }, children);
}
