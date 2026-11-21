/* XPAND · layouts/CambiarClaveModal.js — cambiar la propia contraseña (cualquier usuario con sesión). */
import { h } from "../core/h.js";
import auth from "../services/auth.js";
import { Button, closeModal, Field, openModal, toast } from "../components/index.js";

export function abrirCambiarClave() {
  const err = h("p", { class: "login-error", role: "alert" });
  const actual = h("input", { type: "password", autocomplete: "current-password", required: true });
  const nueva = h("input", { type: "password", autocomplete: "new-password", minLength: 8, required: true });
  const rep = h("input", { type: "password", autocomplete: "new-password", required: true });

  const onSubmit = (e) => {
    e.preventDefault();
    if (nueva.value.length < 8) { err.textContent = "La contraseña debe tener al menos 8 caracteres."; return; }
    if (nueva.value !== rep.value) { err.textContent = "Las contraseñas no coinciden."; return; }
    auth.cambiarClave(actual.value, nueva.value)
      .then(() => { closeModal(); toast("Contraseña actualizada"); })
      .catch((ex) => { err.textContent = ex.message; });
  };

  openModal(
    h("div", { class: "modal-body" },
      h("h3", { class: "modal-title" }, "Cambiar contraseña"),
      h("form", { class: "mt", onSubmit },
        h(Field, { label: "Contraseña actual" }, actual),
        h(Field, { label: "Nueva contraseña", help: "Mínimo 8 caracteres y distinta de la actual." }, nueva),
        h(Field, { label: "Repite la nueva contraseña" }, rep),
        err,
        h("div", { class: "modal-actions" },
          h(Button, { variant: "ghost", onClick: closeModal }, "Cancelar"),
          h(Button, { type: "submit" }, "Guardar")))),
    { size: "modal-sm" });
  actual.focus();
}
