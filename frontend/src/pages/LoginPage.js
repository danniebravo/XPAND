/* XPAND · pages/LoginPage.js — ingreso, y pantalla "Crea tu contraseña" del primer ingreso. */
import { h } from "../core/h.js";
import auth from "../services/auth.js";
import { Button, Field, Logo } from "../components/index.js";

/** Marco de las pantallas de acceso: marca a la izquierda, formulario a la derecha. */
function Marco({ titulo, sub, children }) {
  return h("div", { class: "login-wrap" },
    h("div", { class: "login-card" },
      h("aside", { class: "login-brand" },
        h(Logo, { mascota: true, height: 190 }),
        h(Logo, { height: 70 }),
        h("p", null, "Panel de catálogo de la Comuna 10 de Medellín")),
      h("div", { class: "login-panel" },
        h("h1", { class: "login-title" }, titulo),
        h("p", { class: "login-sub" }, sub),
        children)));
}

export function LoginPage({ aviso, onLogin }) {
  const err = h("p", { class: "login-error", id: "login-error", role: "alert" }, aviso || "");
  const olvide = h("p", { class: "muted" }, "Solicita a la coordinación que restablezca tu clave.");
  const correo = h("input", { type: "email", id: "login-correo", autocomplete: "username", required: true });
  const pass = h("input", { type: "password", id: "login-pass", autocomplete: "current-password", required: true });
  const enviar = h(Button, { type: "submit", block: true }, "Entrar");

  const onSubmit = (e) => {
    e.preventDefault();
    enviar.disabled = true; err.textContent = "";
    auth.login(correo.value, pass.value).then(onLogin)
      .catch((ex) => { err.textContent = ex.message; enviar.disabled = false; });
  };
  const solicitarClave = () => {
    if (!correo.value.trim()) { err.textContent = "Escribe tu correo arriba y vuelve a pulsar."; correo.focus(); return; }
    err.textContent = "";
    auth.solicitarClave(correo.value)
      .then(() => { olvide.textContent = "Listo. Avisamos a la coordinación; te entregará una clave temporal."; })
      .catch((ex) => { err.textContent = ex.message; });
  };

  return h(Marco, { titulo: "Inicia sesión", sub: "Espacio de trabajo del equipo que carga los lugares y retos de la Comuna 10." },
    h("form", { id: "login-form", onSubmit },
      h(Field, { label: "Correo del equipo" }, correo),
      h(Field, { label: "Contraseña" }, pass),
      enviar, err),
    h("div", { class: "login-foot" },
      h("button", { type: "button", class: "link-detail", id: "olvide", onClick: solicitarClave }, "¿Olvidaste tu contraseña?"),
      olvide));
}

export function CambiarClavePage({ onListo, onCancelar }) {
  const err = h("p", { class: "login-error", role: "alert" });
  const actual = h("input", { type: "password", autocomplete: "current-password", required: true });
  const nueva = h("input", { type: "password", autocomplete: "new-password", minLength: 8, required: true });
  const rep = h("input", { type: "password", autocomplete: "new-password", required: true });

  const onSubmit = (e) => {
    e.preventDefault();
    if (nueva.value.length < 8) { err.textContent = "La contraseña debe tener al menos 8 caracteres."; return; }
    if (nueva.value !== rep.value) { err.textContent = "Las contraseñas no coinciden."; return; }
    auth.cambiarClave(actual.value, nueva.value).then(onListo).catch((ex) => { err.textContent = ex.message; });
  };

  return h(Marco, { titulo: "Crea tu contraseña", sub: "Ingresaste con una clave temporal. Define una propia para continuar." },
    h("form", { onSubmit },
      h(Field, { label: "Clave temporal" }, actual),
      h(Field, { label: "Nueva contraseña", help: "Mínimo 8 caracteres." }, nueva),
      h(Field, { label: "Repite la nueva contraseña" }, rep),
      h(Button, { type: "submit", block: true }, "Guardar y entrar"),
      h(Button, { variant: "ghost", block: true, onClick: onCancelar }, "Cancelar"),
      err));
}
