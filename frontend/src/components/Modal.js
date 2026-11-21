/* XPAND · components/Modal.js
 * Ventanas modales y avisos:
 *   openModal(contenido, { size, dismissable, stack, onDismiss, ocultarX }) → { overlay, modal, close }
 *   confirmDialog(mensaje, onOk, okLabel, { detalle, tono, cancelLabel })   (se apila sobre el modal abierto)
 *   toast(mensaje) · fail(error)
 */
import { h } from "../core/h.js";
import { Button } from "./Button.js";

export function closeModal() {
  const todos = document.querySelectorAll(".overlay");
  const ov = todos[todos.length - 1];
  if (ov) {
    if (ov._onKey) document.removeEventListener("keydown", ov._onKey);
    ov.remove();
  }
  if (!document.querySelector(".overlay")) document.body.classList.remove("no-scroll");
}

export function closeAll() { while (document.querySelector(".overlay")) closeModal(); }

export function openModal(contenido, opts = {}) {
  if (!opts.stack) closeAll();
  const modal = h("div", { class: ["modal", opts.size], role: "dialog", "aria-modal": "true" },
    opts.ocultarX ? null : h("button", { class: "modal-x", "aria-label": "Cerrar", onClick: () => (opts.onDismiss ? opts.onDismiss() : closeModal()) }, "✕"),
    contenido);
  const overlay = h("div", { class: "overlay" }, modal);
  const onKey = (e) => {
    const todos = document.querySelectorAll(".overlay");
    if (e.key === "Escape" && opts.dismissable !== false && todos[todos.length - 1] === overlay) closeModal();
  };
  overlay.addEventListener("click", (e) => { if (e.target === overlay && opts.dismissable !== false) closeModal(); });
  document.addEventListener("keydown", onKey);
  overlay._onKey = onKey;
  document.body.appendChild(overlay);
  document.body.classList.add("no-scroll");
  return { overlay, modal, close: closeModal };
}

export function confirmDialog(mensaje, onOk, okLabel = "Borrar", opts = {}) {
  openModal(
    h("div", { class: "modal-body" },
      h("h3", { class: "modal-title" }, mensaje),
      opts.detalle ? h("p", { class: "muted small mt" }, opts.detalle) : null,
      h("div", { class: "modal-actions" },
        h(Button, { variant: "ghost", onClick: closeModal }, opts.cancelLabel || "Cancelar"),
        h(Button, { variant: opts.tono === "primary" ? "primary" : "danger", onClick: () => { closeModal(); if (onOk) onOk(); } }, okLabel))),
    { size: "modal-sm", stack: true });
}

export function toast(mensaje) {
  const t = h("div", { class: "toast" }, mensaje);
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, 2400);
}

/** Error de la API → toast con el mensaje del servidor. */
export const fail = (err) => toast((err && err.message) || "No se pudo completar la acción.");
