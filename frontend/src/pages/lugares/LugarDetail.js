/* XPAND · pages/lugares/LugarDetail.js — detalle en página (#lugares/<id>) con editar / borrar. */
import { h } from "../../core/h.js";
import { app } from "../../core/app.js";
import auth from "../../services/auth.js";
import store from "../../services/store.js";
import { Alert, confirmDialog, DetailField, DetailHeader, fail, Icon, IconButton, toast } from "../../components/index.js";
import { costo } from "../../utils/format.js";
import { abrirWizard } from "./LugarWizard.js";

export function LugarDetail({ id }) {
  const l = store.byId("lugares", id);
  if (!l) { app.go("#lugares"); return h("div"); }
  const u = auth.user();
  const ajeno = l.creadoPor && (!u || l.creadoPor !== u.nombre); // "Creado por" solo si lo creó otra persona

  const borrar = () => confirmDialog("¿Borrar “" + l.nombre + "”? Esta acción no se puede deshacer.", () => {
    store.remove("lugares", id).then(() => {
      toast("Lugar borrado");
      app.go("#lugares");
      app.refresh();
    }).catch(fail);
  });

  return h("div", { class: "pad" },
    h(DetailHeader, {
      volverHash: "#lugares", volverLabel: "Lugares", titulo: l.nombre,
      sub: [l.categoria, l.barrio].filter(Boolean).join(" · "), estado: l.estado,
    },
      auth.can("editar") ? h(IconButton, { label: "Editar", "data-editar": "", onClick: () => abrirWizard(l) }, h(Icon, { name: "edit" })) : null,
      auth.can("borrar") ? h(IconButton, { label: "Borrar", danger: true, "data-borrar": "", onClick: borrar }, h(Icon, { name: "delete" })) : null),
    l.comentarioRevision && l.estado === "borrador"
      ? h(Alert, { tono: "warn", role: "alert" }, h("b", null, "Devuelto por el coordinador"), h("span", null, l.comentarioRevision)) : null,
    h("div", { class: "detail-card" },
      h("div", { class: "detail-grid" },
        h(DetailField, { k: "Costo", v: costo(l) }), h(DetailField, { k: "Duración", v: l.duracion || "Sin dato" }),
        h(DetailField, { k: "Dirección", v: l.direccion || "—" }), h(DetailField, { k: "Coordenadas", v: l.coords || "Sin ubicar" }),
        h(DetailField, { k: "Horario", v: l.horario || "—" }), h(DetailField, { k: "¿Reserva?", v: l.reserva || "—" })),
      h("div", { class: "detail-block" }, h("span", { class: "dl" }, "Descripción"), h("p", null, l.descripcion || "—")),
      ajeno ? h("div", { class: "creado-aviso" }, "Creado por ", h("b", null, l.creadoPor), l.fuente ? " · " + l.fuente : "") : null));
}
