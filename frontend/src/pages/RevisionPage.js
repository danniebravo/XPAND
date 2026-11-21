/* XPAND · pages/RevisionPage.js — cola de revisión (pestañas Lugares · Retos · Insignias) y detalle #revision/<tab>:<id>. Solo coordinador. */
import { h } from "../core/h.js";
import { Component } from "../core/component.js";
import { app } from "../core/app.js";
import auth from "../services/auth.js";
import store from "../services/store.js";
import { Button, Chip, closeModal, confirmDialog, DataTable, DetailField, DetailHeader, fail, Field, openModal, PageHeader, toast } from "../components/index.js";
import { costo } from "../utils/format.js";
import { lugarNombre } from "../utils/nombres.js";
import { abrirPublicacionConfirmada } from "./PublicacionConfirmada.js";

const TABS = [
  { id: "lugares", label: "Lugares", uno: "Lugar", vacio: "No hay lugares pendientes de revisión", col: "Barrio" },
  { id: "retos", label: "Retos", uno: "Reto", vacio: "No hay retos pendientes de revisión", col: "Lugar asociado" },
  { id: "insignias", label: "Insignias", uno: "Insignia", vacio: "No hay insignias pendientes de revisión", col: "Condición" },
];
const memoria = { tab: "lugares" };            // la pestaña elegida sobrevive a app.refresh()

const tabInfo = (id) => TABS.find((t) => t.id === id);
const nombre = (it) => it.nombre || it.titulo || "Sin título";
const extra = (tab, it) => (tab === "lugares" ? it.barrio || "—" : tab === "retos" ? lugarNombre(it.lugarId) : it.condicion || "—");
const irADetalle = (tab, id) => app.go("#revision/" + tab + ":" + encodeURIComponent(id));

// ---- Lista --------------------------------------------------------------
class ColaRevision extends Component {
  constructor(props) { super(props); this.state = { tab: memoria.tab }; }

  elegir(tab) { memoria.tab = tab; this.setState({ tab }); }

  render() {
    const { tab } = this.state;
    const c = store.colaRevision();
    const total = c.lugares.length + c.retos.length + c.insignias.length;
    const info = tabInfo(tab);
    const columnas = [
      { label: "Nombre", class: "td-strong", render: (it) => nombre(it) },
      { label: info.col, render: (it) => extra(tab, it) },
      { label: "Enviado por", render: (it) => it.creadoPor || "—" },
      { label: "Estado", render: (it) => h(Chip, { estado: it.estado }) },
      { label: "", class: "td-action", render: (it) => h("button", { type: "button", class: "link-detail", "aria-label": "Ver detalle de " + nombre(it) }, "Ver detalle ›") },
    ];
    return h("div", null,
      h(PageHeader, { title: "Revisión", sub: total + " en espera de aprobación" }),
      h("div", { class: "pad" },
        h("div", { class: "review-tabs" },
          TABS.map((t) => {
            const n = c[t.id].length;
            return h("button", { type: "button", class: ["rtab", tab === t.id && "on"], onClick: () => this.elegir(t.id) },
              t.label, n ? [" ", h("span", { class: "rtab-badge" }, n)] : null);
          })),
        h(DataTable, { columns: columnas, rows: c[tab], empty: info.vacio, onRowClick: (it) => irADetalle(tab, it.id) })));
  }
}

// ---- Detalle ------------------------------------------------------------
function Campos({ tab, it }) {
  const enviado = h(DetailField, { k: "Enviado por", v: it.creadoPor || "—" });
  if (tab === "lugares") {
    return [h(DetailField, { k: "Categoría", v: it.categoria || "—" }), h(DetailField, { k: "Barrio", v: it.barrio || "—" }),
      h(DetailField, { k: "Costo", v: costo(it) }), h(DetailField, { k: "Duración", v: it.duracion || "—" }),
      h(DetailField, { k: "Dirección", v: it.direccion || "—" }), enviado];
  }
  if (tab === "retos") {
    return [h(DetailField, { k: "Lugar asociado", v: lugarNombre(it.lugarId) }),
      h(DetailField, { k: "Puntos", v: (it.puntos || 0) + " XP" }),
      h(DetailField, { k: "Tipo", v: it.tipo || "—" }), enviado];
  }
  return [h(DetailField, { k: "Condición", v: it.condicion || "—" }), h(DetailField, { k: "Requisito", v: it.requisito || "—" }), enviado];
}

function aprobar(tab, it) {
  confirmDialog("¿Publicar “" + nombre(it) + "”?", () => {
    store.publicar(tab, it.id).then(() => {
      const sig = store.colaRevision()[tab][0];
      // el cambio de ruta cierra los modales: el de éxito se muestra cuando ya navegó a la lista
      app.go("#revision", () => abrirPublicacionConfirmada(nombre(it), store.stats(), sig ? () => irADetalle(tab, sig.id) : null));
    }).catch(fail);
  }, "Publicar", { tono: "primary", detalle: "Aparecerá en las recomendaciones de la app." });
}

function devolver(tab, it) {
  const ta = h("textarea", { id: "rev-com", required: true, placeholder: "Explica qué debe corregir" });
  const err = h("p", { class: "login-error", id: "rev-err", role: "alert" });
  const enviar = () => {
    const com = ta.value.trim();
    if (!com) { err.textContent = "Escribe un comentario para devolver."; ta.focus(); return; }
    confirmDialog("¿Devolver “" + nombre(it) + "” a borrador?", () => {
      store.devolver(tab, it.id, com).then(() => {
        toast("Devuelto a borrador");
        app.go("#revision");
      }).catch(fail);
    }, "Devolver", { tono: "primary", detalle: "Quien lo cargó verá tu comentario." });
  };
  openModal(
    h("div", { class: "modal-body" },
      h("h3", { class: "modal-title" }, "Devolver “" + nombre(it) + "” a borrador"),
      h(Field, { label: "Comentario para quien lo cargó", class: "mt" }, ta),
      err,
      h("div", { class: "modal-actions" },
        h(Button, { variant: "ghost", onClick: closeModal }, "Cancelar"),
        h(Button, { onClick: enviar }, "Devolver"))),
    { size: "modal-sm" });
  ta.focus();
}

function DetalleRevision({ tab, it }) {
  return h("div", { class: "pad" },
    h(DetailHeader, { volverHash: "#revision", volverLabel: "Revisión", titulo: nombre(it), sub: tabInfo(tab).uno, estado: it.estado }),
    h("div", { class: "detail-card" },
      h("div", { class: "detail-grid" }, h(Campos, { tab, it })),
      h("div", { class: "detail-actions" },
        h(Button, { onClick: () => aprobar(tab, it) }, "Aprobar y publicar"),
        h(Button, { variant: "outline", onClick: () => devolver(tab, it) }, "Devolver a borrador"))));
}

export function RevisionPage({ param }) {
  if (!auth.can("ver_revision")) { app.go("#panel"); return h("div"); }
  if (param) {
    const [tab, id] = param.split(":");
    const it = tabInfo(tab) && store.byId(tab, id);
    if (it && it.estado === "en_revision") { memoria.tab = tab; return h(DetalleRevision, { tab, it }); }
    app.go("#revision");
    return h("div");
  }
  return h(ColaRevision);
}
