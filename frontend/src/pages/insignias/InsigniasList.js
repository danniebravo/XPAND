/* XPAND · pages/insignias/InsigniasList.js — lista de insignias (Insignia · Condición · Requisito · Estado). */
import { h } from "../../core/h.js";
import { app } from "../../core/app.js";
import auth from "../../services/auth.js";
import store from "../../services/store.js";
import { Alert, Button, Chip, DataTable, PageHeader } from "../../components/index.js";
import { abrirInsigniaForm } from "./InsigniaForm.js";

const COLUMNAS = [
  { label: "Insignia", class: "td-strong", render: (i) => [h("span", { class: "ins-ico" }, "❉"), i.nombre] },
  { label: "Condición", render: (i) => i.condicion },
  { label: "Requisito", render: (i) => h("span", { class: "chip chip-cat" }, i.requisito) },
  { label: "Estado", render: (i) => h(Chip, { estado: i.estado }) },
  { class: "td-action", render: () => h("button", { class: "link-detail" }, "Ver detalle ›") },
];

/** Aviso de insignias que dependen de barrios sin lugares publicados. */
function AvisoBloqueadas({ cantidad }) {
  return h(Alert, { tono: "warn" },
    h("b", null, cantidad === 1 ? "1 insignia no se puede obtener todavía" : cantidad + " insignias no se pueden obtener todavía"),
    h("span", null, "Dependen de barrios sin lugares publicados en el catálogo."));
}

export function InsigniasList() {
  const todas = store.all("insignias");
  const activas = todas.filter((i) => i.estado === "activa").length;
  const bloqueadas = todas.filter((i) => i.estado === "bloqueada").length;
  return h("div", null,
    h(PageHeader, { title: "Insignias", sub: todas.length + " definidas · " + activas + " alcanzables hoy" },
      auth.can("crear") ? h(Button, { onClick: () => abrirInsigniaForm(null) }, "+ Nueva insignia") : null),
    h("div", { class: "pad" },
      bloqueadas ? h(AvisoBloqueadas, { cantidad: bloqueadas }) : null,
      h(DataTable, {
        columns: COLUMNAS, rows: todas, empty: "Aún no hay insignias.",
        onRowClick: (i) => app.go("#insignias/" + encodeURIComponent(i.id)),
      })));
}
