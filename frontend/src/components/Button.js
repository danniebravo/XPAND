/* XPAND · components/Button.js
 * <Button variant="primary|ghost|outline|danger|danger-ghost" block onClick …>texto</Button>
 */
import { h } from "../core/h.js";

export function Button({ variant = "primary", type = "button", block, class: extra, children, ...resto }) {
  return h("button", { type, class: ["btn", "btn-" + variant, block && "btn-block", extra], ...resto }, children);
}

/** Botón cuadrado solo-ícono (editar / borrar). */
export function IconButton({ label, danger, children, ...resto }) {
  return h("button", { type: "button", class: ["icon-btn", danger && "danger"], title: label, "aria-label": label, ...resto }, children);
}
