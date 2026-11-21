/* XPAND · pages/lugares/LugaresList.js — cabecera con alternancia Lista/Mapa, búsqueda, filtros y tabla. */
import { h } from "../../core/h.js";
import { Component } from "../../core/component.js";
import { app } from "../../core/app.js";
import auth from "../../services/auth.js";
import store from "../../services/store.js";
import { Button, Chip, DataTable, PageHeader } from "../../components/index.js";
import { costo } from "../../utils/format.js";
import { MapaLugares } from "./MapaLugares.js";
import { abrirWizard } from "./LugarWizard.js";

// Filtros y modo viven fuera de los componentes para sobrevivir a app.refresh()
const est = { filtro: "todos", q: "", modo: "lista" };

const FILTROS = [
  { id: "todos", label: "Todos" },
  { id: "en_revision", label: "En revisión" },
  { id: "borrador", label: "Borradores" },
  { id: "publicado", label: "Publicados" },
];

function filtrar() {
  const q = est.q.trim().toLowerCase();
  return store.all("lugares").filter((l) => {
    if (est.filtro === "borrador" && !(l.estado === "borrador" || l.estado === "incompleto")) return false;
    if (est.filtro === "en_revision" && l.estado !== "en_revision") return false;
    if (est.filtro === "publicado" && l.estado !== "publicado") return false;
    if (q && (l.nombre + " " + l.barrio).toLowerCase().indexOf(q) < 0) return false;
    return true;
  });
}

const verDetalle = (l) => app.go("#lugares/" + encodeURIComponent(l.id));

const COLUMNAS = [
  { label: "Categoría", render: (l) => h(Chip, { tono: "cat" }, l.categoria) },
  { label: "Nombre", class: "td-strong", render: (l) => l.nombre },
  { label: "Barrio", render: (l) => l.barrio },
  { label: "Costo", render: (l) => costo(l) },
  { label: "Estado", render: (l) => h(Chip, { estado: l.estado }) },
  { class: "td-action", render: (l) =>
    h("button", { type: "button", class: "link-detail", "aria-label": "Ver detalle de " + l.nombre }, "Ver detalle ›") },
];

/** Tabla de resultados: se re-dibuja sola al cambiar búsqueda o filtro (el input queda fuera). */
class TablaLugares extends Component {
  render() {
    return h(DataTable, { columns: COLUMNAS, rows: filtrar(), onRowClick: verDetalle, empty: "No hay lugares para este filtro." });
  }
}

class Filtros extends Component {
  render() {
    return h("div", { class: "filters" }, FILTROS.map((f) =>
      h("button", { class: ["pill", est.filtro === f.id && "on"],
        onClick: () => { est.filtro = f.id; this.update(); this.props.tabla().update(); } }, f.label)));
  }
}

function ListaLugares() {
  const tabla = h(TablaLugares);
  const instancia = () => tabla._component;
  return h("div", null,
    h("div", { class: "toolbar" },
      h("input", { class: "search", id: "q", placeholder: "Buscar por nombre o barrio", value: est.q,
        onInput: (e) => { est.q = e.target.value; instancia().update(); } }),
      h(Filtros, { tabla: instancia })),
    tabla);
}

export class LugaresList extends Component {
  constructor(props) { super(props); this.state = { modo: est.modo }; }

  onMount() {
    if (app.pending === "nuevo-lugar") { app.pending = null; abrirWizard(null); }
  }

  render() {
    const todos = store.all("lugares");
    const pub = todos.filter((l) => l.estado === "publicado").length;
    const rev = todos.filter((l) => l.estado === "en_revision").length;
    const modo = (id, label) => h("button", { class: this.state.modo === id ? "on" : null, "data-modo": id,
      onClick: () => { est.modo = id; this.setState({ modo: id }); } }, label);

    return h("div", null,
      h(PageHeader, { title: "Lugares", sub: todos.length + " registros · " + pub + " publicados · " + rev + " en revisión" },
        h("div", { class: "toggle" }, modo("lista", "Lista"), modo("mapa", "Mapa")),
        auth.can("crear") ? h(Button, { id: "nuevo", onClick: () => abrirWizard(null) }, "+ Nuevo lugar") : null),
      h("div", { class: "pad", id: "lug-body" }, this.state.modo === "mapa" ? h(MapaLugares) : h(ListaLugares)));
  }
}
