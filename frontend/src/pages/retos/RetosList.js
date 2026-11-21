/* XPAND · pages/retos/RetosList.js — lista de retos: búsqueda, filtros por estado y tabla. */
import { h } from "../../core/h.js";
import { Component } from "../../core/component.js";
import { app } from "../../core/app.js";
import auth from "../../services/auth.js";
import store from "../../services/store.js";
import { Button, Chip, DataTable, FilterPills, PageHeader } from "../../components/index.js";
import { abrirRetoForm } from "./RetoForm.js";
import { lugarNombre, insigniaNombre } from "../../utils/nombres.js";

const FILTROS = [
  { id: "todos", label: "Todos" },
  { id: "activo", label: "Activos" },
  { id: "en_revision", label: "En revisión" },
  { id: "borrador", label: "Borradores" },
];

// Se conserva entre visitas a la lista (igual que el módulo anterior).
const vista = { filtro: "todos", q: "" };

function filtrar() {
  const q = vista.q.trim().toLowerCase();
  return store.all("retos").filter((r) => {
    if (vista.filtro !== "todos" && r.estado !== vista.filtro) return false;
    return !q || (r.titulo + " " + lugarNombre(r.lugarId)).toLowerCase().includes(q);
  });
}

const COLUMNAS = [
  { label: "Reto", class: "td-strong", render: (r) => r.titulo },
  { label: "Lugar asociado", render: (r) => lugarNombre(r.lugarId) },
  { label: "Puntos", class: "td-xp", render: (r) => (r.puntos || 0) + " XP" },
  { label: "Insignia", render: (r) => insigniaNombre(r.insigniaId) },
  { label: "Estado", render: (r) => h(Chip, { estado: r.estado }) },
  { class: "td-action", render: () => h("button", { class: "link-detail" }, "Ver detalle ›") },
];

/** Tabla filtrada; se redibuja sola con tabla._component.update() sin tocar el buscador. */
class RetosTabla extends Component {
  render() {
    return h(DataTable, {
      columns: COLUMNAS, rows: filtrar(), empty: "Sin retos para este filtro.",
      onRowClick: (r) => app.go("#retos/" + encodeURIComponent(r.id)),
    });
  }
}

export function RetosList() {
  const todos = store.all("retos");
  const activos = todos.filter((r) => r.estado === "activo").length;
  const tabla = h(RetosTabla);
  const t = tabla._component;
  const buscar = h("input", {
    class: "search", placeholder: "Buscar reto o lugar", "aria-label": "Buscar reto o lugar", value: vista.q,
    onInput: (e) => { vista.q = e.target.value; t.update(); },
  });
  return h("div", null,
    h(PageHeader, { title: "Retos", sub: todos.length + " retos · " + activos + " activos" },
      auth.can("crear") ? h(Button, { onClick: () => abrirRetoForm(null) }, "+ Nuevo reto") : null),
    h("div", { class: "pad" },
      h("div", { class: "toolbar" }, buscar,
        h(FilterPills, { filtros: FILTROS, valor: vista.filtro, onChange: (f) => { vista.filtro = f; t.update(); } })),
      tabla));
}
