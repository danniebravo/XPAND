/* XPAND · layouts/Sidebar.js — menú lateral: marca, secciones según rol y menú del usuario. */
import { h } from "../core/h.js";
import { Component } from "../core/component.js";
import auth from "../services/auth.js";
import store from "../services/store.js";
import { confirmDialog, Icon, Logo } from "../components/index.js";
import { rolLabel } from "../utils/roles.js";
import { abrirCambiarClave } from "./CambiarClaveModal.js";

const iniciales = (n) => n.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();

class UserMenu extends Component {
  constructor(props) { super(props); this.state = { abierto: false }; this.cerrarFuera = this.cerrarFuera.bind(this); this.onKey = this.onKey.bind(this); }
  onMount() { document.addEventListener("click", this.cerrarFuera); document.addEventListener("keydown", this.onKey); }
  onUnmount() { document.removeEventListener("click", this.cerrarFuera); document.removeEventListener("keydown", this.onKey); }
  cerrarFuera(e) { if (this.state.abierto && this.el && !this.el.contains(e.target)) this.setState({ abierto: false }); }
  onKey(e) { if (e.key === "Escape" && this.state.abierto) this.setState({ abierto: false }); }

  render() {
    const u = auth.user();
    const { abierto } = this.state;
    return h("div", { class: "side-user-wrap" },
      h("div", { class: "user-menu", hidden: !abierto },
        h("button", { class: "nav-item", type: "button", onClick: () => { this.setState({ abierto: false }); abrirCambiarClave(); } },
          h("span", { class: "nav-ico" }, h(Icon, { name: "key" })), h("span", null, "Cambiar contraseña")),
        h("button", { class: "nav-item", type: "button", onClick: () => {
          this.setState({ abierto: false });
          confirmDialog("¿Cerrar sesión?", this.props.onLogout, "Cerrar sesión",
            { detalle: "Tendrás que ingresar de nuevo con tu correo y contraseña.", tono: "primary" });
        } }, h("span", { class: "nav-ico" }, h(Icon, { name: "logout" })), h("span", null, "Cerrar sesión"))),
      h("button", { class: "side-user", type: "button", "aria-haspopup": "true", "aria-expanded": String(abierto),
        onClick: (e) => { e.stopPropagation(); this.setState({ abierto: !abierto }); } },
        h("div", { class: "avatar" }, iniciales(u.nombre)),
        h("div", { class: "side-user-txt" }, h("b", null, u.nombre), h("span", null, rolLabel(u.rol))),
        h("span", { class: "user-caret", "aria-hidden": "true" }, "▴")));
  }
}

export function Sidebar({ activa, onLogout }) {
  const cola = store.colaRevision();
  const pendientes = cola.lugares.length + cola.retos.length + cola.insignias.length;
  // En móvil el menú es un cajón. Al navegar la app se vuelve a dibujar, así que el cajón se cierra solo.
  const alternar = (abrir) => {
    aside.classList.toggle("nav-open", abrir);
    menuBtn.setAttribute("aria-expanded", String(abrir));
  };
  const menuBtn = h("button", { class: "menu-btn", type: "button", "aria-label": "Abrir menú", "aria-expanded": "false",
    "aria-controls": "nav-principal", onClick: () => alternar(true) }, h("span"), h("span"), h("span"));
  const aside = h("aside", { class: "sidebar" },
    menuBtn,
    h("div", { class: "brand" }, h(Logo, { height: 34 }), h("span", { class: "brand-tag" }, "admin")),
    h("div", { class: "nav-overlay", onClick: () => alternar(false) }),
    h("nav", { class: "nav", id: "nav-principal" },
      h("button", { class: "nav-close", type: "button", "aria-label": "Cerrar menú", onClick: () => alternar(false) }, "✕"),
      auth.menu().map((m) =>
        h("a", { class: ["nav-item", m.id === activa && "active"], "data-view": m.id, href: "#" + m.id, onClick: () => alternar(false) },
          h("span", { class: "nav-ico" }, m.icon), h("span", null, m.label),
          m.badge && pendientes ? h("span", { class: "nav-badge" }, pendientes) : null))),
    h(UserMenu, { onLogout }));
  return aside;
}
