/* XPAND · pages/UsuariosPage.js — usuarios finales de la app: lista con filtros y detalle #usuarios/<id>. */
import { h } from "../core/h.js";
import { Component } from "../core/component.js";
import { app } from "../core/app.js";
import auth from "../services/auth.js";
import store from "../services/store.js";
import { Button, Chip, confirmDialog, DataTable, DetailField, DetailHeader, estadoLabel, fail, PageHeader, StatCard, toast } from "../components/index.js";

const FILTROS = [
  { id: "todos", label: "Todos" }, { id: "activa", label: "Activos" },
  { id: "sin_actividad", label: "Sin actividad" }, { id: "suspendida", label: "Suspendidos" },
];
const memoria = { filtro: "todos", q: "" };     // filtro y búsqueda sobreviven a app.refresh()

/** Tabla filtrada. Es la única parte que se redibuja al escribir en el buscador (el input queda fuera). */
class TablaUsuarios extends Component {
  constructor(props) { super(props); this.state = { q: props.q }; }

  filas() {
    const q = this.state.q.trim().toLowerCase();
    return store.all("usuariosApp").filter((u) => {
      if (this.props.filtro !== "todos" && u.estado !== this.props.filtro) return false;
      return !q || (u.nombre + " " + u.correo).toLowerCase().includes(q);
    });
  }

  render() {
    const columnas = [
      { label: "Persona", class: "td-strong", key: "nombre" },
      { label: "Registro", key: "registro" },
      { label: "Exploraciones", class: "td-strong", key: "exploraciones" },
      { label: "Nivel", key: "nivel" },
      { label: "Estado", render: (u) => h(Chip, { estado: u.estado }) },
      { label: "", class: "td-action", render: (u) => h("button", { type: "button", class: "link-detail", "aria-label": "Ver detalle de " + u.nombre }, "Ver detalle ›") },
    ];
    return h("div", { id: "utable" },
      h(DataTable, { columns: columnas, rows: this.filas(), empty: "Sin usuarios para este filtro.",
        onRowClick: (u) => app.go("#usuarios/" + encodeURIComponent(u.id)) }));
  }
}

class UsuariosLista extends Component {
  constructor(props) { super(props); this.state = { filtro: memoria.filtro }; }

  render() {
    const all = store.all("usuariosApp");
    const conExp = all.filter((u) => u.exploraciones > 0).length;
    const totalExp = all.reduce((a, u) => a + u.exploraciones, 0);
    const susp = all.filter((u) => u.estado === "suspendida").length;
    const { filtro } = this.state;

    const tabla = h(TablaUsuarios, { q: memoria.q, filtro });
    const tablaComp = tabla._component;
    const buscar = h("input", { class: "search", id: "q", placeholder: "Buscar por nombre o correo", value: memoria.q,
      onInput: (e) => { memoria.q = e.target.value; tablaComp.setState({ q: memoria.q }); } });

    return h("div", null,
      h(PageHeader, { title: "Usuarios", sub: all.length + " registrados · " + conExp + " con al menos una exploración" }),
      h("div", { class: "pad" },
        h("div", { class: "stat-row" },
          h(StatCard, { num: all.length, label: "Registrados", sub: "en la app", tono: "sc-azul" }),
          h(StatCard, { num: conExp, label: "Con exploraciones", sub: (all.length ? Math.round((conExp / all.length) * 100) : 0) + "% del total", tono: "sc-plano" }),
          h(StatCard, { num: totalExp, label: "Exploraciones", sub: "registradas en total", tono: "sc-plano" }),
          h(StatCard, { num: susp, label: "Cuentas suspendidas", sub: "por reporte", tono: "sc-plano" })),
        h("div", { class: "toolbar" },
          buscar,
          h("div", { class: "filters" },
            FILTROS.map((f) => h("button", { class: ["pill", filtro === f.id && "on"],
              onClick: () => { memoria.filtro = f.id; this.setState({ filtro: f.id }); } }, f.label)))),
        tabla));
  }
}

function cambiarEstado(u, estado, msg) {
  store.suspender(u.id, estado).then(() => { toast(msg); app.refresh(); }).catch(fail);
}

function DetalleUsuario({ u }) {
  const puede = auth.can("suspender_usuario");
  const susp = u.estado === "suspendida";
  const suspender = () => confirmDialog("¿Suspender la cuenta de " + u.nombre + "?", () => cambiarEstado(u, "suspendida", "Cuenta suspendida"),
    "Suspender", { tono: "danger", detalle: "No podrá usar la app hasta que la reactives." });
  const reactivar = () => confirmDialog("¿Reactivar la cuenta de " + u.nombre + "?", () => cambiarEstado(u, "activa", "Cuenta reactivada"),
    "Reactivar", { tono: "primary" });
  return h("div", { class: "pad" },
    h(DetailHeader, { volverHash: "#usuarios", volverLabel: "Usuarios", titulo: u.nombre, estado: u.estado }),
    h("div", { class: "detail-card" },
      h("div", { class: "detail-grid" },
        h(DetailField, { k: "Correo", v: u.correo }), h(DetailField, { k: "Registro", v: u.registro }),
        h(DetailField, { k: "Exploraciones", v: u.exploraciones }), h(DetailField, { k: "Nivel", v: u.nivel }),
        h(DetailField, { k: "Estado", v: estadoLabel(u.estado) })),
      puede ? h("div", { class: "detail-actions" },
        susp ? h(Button, { onClick: reactivar }, "Reactivar cuenta") : h(Button, { variant: "danger-ghost", onClick: suspender }, "Suspender cuenta")) : null));
}

export function UsuariosPage({ param }) {
  if (!param) return h(UsuariosLista);
  const u = store.byId("usuariosApp", param);
  if (!u) { app.go("#usuarios"); return h("div"); }
  return h(DetalleUsuario, { u });
}
