/* XPAND · pages/retos/RetoDetail.js — detalle en página de un reto (#retos/<id>). */
import { h } from "../../core/h.js";
import { app } from "../../core/app.js";
import auth from "../../services/auth.js";
import store from "../../services/store.js";
import { confirmDialog, DetailField, DetailHeader, fail, Icon, IconButton, toast } from "../../components/index.js";
import { abrirRetoForm } from "./RetoForm.js";
import { lugarNombre, insigniaNombre } from "../../utils/nombres.js";

export function RetoDetail({ id }) {
  const r = store.byId("retos", id);
  const otro = r.creadoPor && auth.user() && r.creadoPor !== auth.user().nombre;

  const borrar = () => confirmDialog("¿Borrar el reto “" + r.titulo + "”?", () => {
    store.remove("retos", id).then(() => { toast("Reto borrado"); app.go("#retos"); app.refresh(); }).catch(fail);
  });

  return h("div", { class: "pad" },
    h(DetailHeader, { volverHash: "#retos", volverLabel: "Retos", titulo: r.titulo, sub: lugarNombre(r.lugarId), estado: r.estado },
      auth.can("editar") ? h(IconButton, { label: "Editar", onClick: () => abrirRetoForm(r) }, h(Icon, { name: "edit" })) : null,
      auth.can("borrar") ? h(IconButton, { label: "Borrar", danger: true, onClick: borrar }, h(Icon, { name: "delete" })) : null),
    h("div", { class: "detail-card" },
      h("div", { class: "detail-grid" },
        h(DetailField, { k: "Puntos", v: (r.puntos || 0) + " XP" }),
        h(DetailField, { k: "Tipo", v: r.tipo || "—" }),
        h(DetailField, { k: "Insignia", v: insigniaNombre(r.insigniaId) })),
      h("div", { class: "detail-block" }, h("span", { class: "dl" }, "Instrucción para el usuario"), h("p", null, r.instruccion || "—")),
      otro ? h("div", { class: "creado-aviso" }, "Creado por ", h("b", null, r.creadoPor)) : null));
}
