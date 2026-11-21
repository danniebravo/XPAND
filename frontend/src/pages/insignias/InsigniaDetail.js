/* XPAND · pages/insignias/InsigniaDetail.js — detalle en página de una insignia (#insignias/<id>). */
import { h } from "../../core/h.js";
import { app } from "../../core/app.js";
import auth from "../../services/auth.js";
import store from "../../services/store.js";
import { confirmDialog, DetailField, DetailHeader, fail, Icon, IconButton, toast } from "../../components/index.js";
import { abrirInsigniaForm } from "./InsigniaForm.js";

export function InsigniaDetail({ id }) {
  const i = store.byId("insignias", id);
  const otro = i.creadoPor && auth.user() && i.creadoPor !== auth.user().nombre;

  const borrar = () => confirmDialog("¿Borrar la insignia “" + i.nombre + "”?", () => {
    store.remove("insignias", id).then(() => { toast("Insignia borrada"); app.go("#insignias"); app.refresh(); }).catch(fail);
  });

  return h("div", { class: "pad" },
    h(DetailHeader, { volverHash: "#insignias", volverLabel: "Insignias", titulo: i.nombre, estado: i.estado },
      auth.can("editar") ? h(IconButton, { label: "Editar", onClick: () => abrirInsigniaForm(i) }, h(Icon, { name: "edit" })) : null,
      auth.can("borrar") ? h(IconButton, { label: "Borrar", danger: true, onClick: borrar }, h(Icon, { name: "delete" })) : null),
    h("div", { class: "detail-card" },
      h("div", { class: "detail-grid" },
        h(DetailField, { k: "Condición", v: i.condicion || "—" }),
        h(DetailField, { k: "Requisito", v: i.requisito || "—" }),
        h(DetailField, { k: "Puntos que vale", v: (i.xp || 0) + " XP" })),
      otro ? h("div", { class: "creado-aviso" }, "Creada por ", h("b", null, i.creadoPor)) : null));
}
