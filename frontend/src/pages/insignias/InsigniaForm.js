/* XPAND · pages/insignias/InsigniaForm.js — formulario flotante de nueva / editar insignia (con campo XP). */
import { h } from "../../core/h.js";
import { app } from "../../core/app.js";
import store from "../../services/store.js";
import { Button, closeAll, confirmDialog, Field, FormError, openModal, Select, toast } from "../../components/index.js";

const ESTADOS = [{ v: "activa", t: "Activa" }, { v: "bloqueada", t: "Bloqueada" }];

/** Abre el formulario: sin argumento o null = nueva insignia; con una insignia = editarla. */
export function abrirInsigniaForm(existing = null) {
  const draft = existing ? JSON.parse(JSON.stringify(existing))
    : { id: null, nombre: "", condicion: "", requisito: "", xp: 10, estado: "activa" };
  draft.nombre = draft.nombre || ""; draft.condicion = draft.condicion || ""; draft.requisito = draft.requisito || "";
  draft.xp = draft.xp == null ? 10 : draft.xp;
  draft.estado = draft.estado === "bloqueada" ? "bloqueada" : "activa";
  const inicial = JSON.stringify(draft);

  const nom = h("input", { value: draft.nombre });
  const cond = h("input", { value: draft.condicion, placeholder: "Cinco lugares distintos" });
  const req = h("input", { value: draft.requisito, placeholder: "5 retos" });
  const xp = h("input", { type: "number", min: 0, max: 500, step: 5, value: draft.xp });
  const est = h(Select, { options: ESTADOS, value: draft.estado });
  const err = h(FormError);
  const showError = (m) => err._component.show(m);

  const collect = () => {
    draft.nombre = nom.value; draft.condicion = cond.value; draft.requisito = req.value;
    draft.xp = Number(xp.value) || 0; draft.estado = est.value;
  };
  const cancelar = () => {
    collect();
    if (JSON.stringify(draft) === inicial) { closeAll(); return; }
    confirmDialog("¿Descartar los cambios?", () => closeAll(), "Descartar",
      { detalle: "Se perderá lo que escribiste.", cancelLabel: "Seguir editando" });
  };

  let ok;
  const guardar = () => {
    collect(); showError("");
    if (!draft.nombre.trim()) return showError("Escribe el nombre de la insignia.");
    ok.disabled = true;
    store.save("insignias", draft).then((saved) => {
      draft.id = saved.id;
      closeAll(); toast("Insignia guardada"); app.refresh();
    }).catch((e) => {
      ok.disabled = false;
      showError((e && e.message) || "No se pudo guardar la insignia.");
    });
  };

  openModal(
    h("div", { class: "modal-body" },
      h("h3", { class: "modal-title" }, existing ? "Editar insignia" : "Nueva insignia"),
      err,
      h(Field, { label: "Nombre" }, nom),
      h(Field, { label: "Condición" }, cond),
      h("div", { class: "grid2" },
        h(Field, { label: "Requisito" }, req),
        h(Field, { label: "Puntos que vale (XP)" }, xp),
        h(Field, { label: "Estado" }, est)),
      h("div", { class: "modal-actions" },
        h(Button, { variant: "ghost", onClick: cancelar }, "Cancelar"),
        h(Button, { ref: (el) => { ok = el; }, onClick: guardar }, "Guardar"))),
    { size: "modal-md", dismissable: false, onDismiss: cancelar });
}
