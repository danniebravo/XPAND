/* XPAND · App.js
 * Componente raíz: decide qué pantalla mostrar (cargando · login · crear contraseña · panel con menú)
 * y enruta por hash (#panel, #lugares/l-1 …) hacia la página correspondiente.
 */
import { h } from "./core/h.js";
import { Component } from "./core/component.js";
import { app } from "./core/app.js";
import { api } from "./api/index.js";
import auth from "./services/auth.js";
import store from "./services/store.js";
import { closeAll } from "./components/index.js";
import { Sidebar } from "./layouts/Sidebar.js";
import { LoginPage, CambiarClavePage } from "./pages/LoginPage.js";
import { resolverRuta, alCambiarRuta } from "./router/index.js";

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = { pantalla: "cargando", aviso: "" };
    app.refresh = () => this.update();
    api.onUnauthorized = () => this.salir("Tu sesión venció. Ingresa de nuevo.");
    this.onHash = () => {
      if (this.state.pantalla !== "panel") return;
      closeAll();
      window.scrollTo(0, 0);
      this.update();
      const despues = app.despues;               // acción que pidió app.go(hash, fn)
      app.despues = null;
      if (despues) despues();
    };
  }

  onMount() {
    this.dejarDeEscuchar = alCambiarRuta(this.onHash);
    auth.loadSession().then((u) => {
      if (!u) return this.irALogin();
      if (auth.debeCambiarClave()) return this.setState({ pantalla: "cambiar" });
      return this.entrar(false);
    });
  }
  onUnmount() { this.dejarDeEscuchar(); }

  irALogin(aviso = "") { this.setState({ pantalla: "login", aviso }); }

  // Carga los datos de la API y muestra el panel.
  entrar(irAlPanel) {
    return store.load(auth.isCoordinador()).then(() => {
      if (irAlPanel || !location.hash) app.go("#panel");
      this.setState({ pantalla: "panel" });
    }).catch((e) => this.salir(e.message));
  }

  // Cierra la sesión: borra token, datos en caché y ruta, y vuelve al login.
  salir(aviso = "") {
    auth.logout();
    store.clear();
    app.go("");
    this.irALogin(aviso);
  }

  render() {
    document.body.classList.toggle("login-mode", this.state.pantalla !== "panel");
    const { pantalla, aviso } = this.state;
    if (pantalla === "cargando") return h("div", { class: "login-wrap" }, h("p", { class: "muted" }, "Cargando…"));
    if (pantalla === "login") {
      return h(LoginPage, { aviso, onLogin: () => (auth.debeCambiarClave() ? this.setState({ pantalla: "cambiar" }) : this.entrar(true)) });
    }
    if (pantalla === "cambiar") {
      return h(CambiarClavePage, { onListo: () => this.entrar(true), onCancelar: () => this.salir() });
    }
    return this.renderPanel();
  }

  renderPanel() {
    const { id, param, Page } = resolverRuta();
    return h("div", { class: "shell" },
      h(Sidebar, { activa: id, onLogout: () => this.salir() }),
      h("main", { class: "main", id: "main" }, h(Page, { param })));
  }
}
