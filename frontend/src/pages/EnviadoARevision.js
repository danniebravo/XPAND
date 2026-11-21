/* XPAND · pages/EnviadoARevision.js — modal "X se envió a revisión", con la mascota (par de PublicacionConfirmada). */
import { h } from "../core/h.js";
import { Button, Logo, closeModal, openModal } from "../components/index.js";

export function abrirEnviadoARevision(nombre) {
  openModal(
    h("div", { class: "modal-body confirm-pub" },
      h("div", { class: "login-logo" }, h(Logo, { mascota: true, height: 110 })),
      h("h3", { class: "modal-title" }, nombre + " se envió a revisión"),
      h("p", { class: "muted center" }, "La coordinación lo revisará y, si hay algo por corregir, lo verás devuelto con un comentario."),
      h("div", { class: "modal-actions center" },
        h(Button, { onClick: closeModal }, "Entendido"))),
    { size: "modal-sm" });
}
