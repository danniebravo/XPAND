/* XPAND · pages/lugares/LugarWizard.js — asistente de 3 pasos para crear / editar un lugar (en un modal). */
import { h } from "../../core/h.js";
import { Component } from "../../core/component.js";
import { app } from "../../core/app.js";
import store from "../../services/store.js";
import { Button, Chip, closeAll, confirmDialog, DetailField, Field, openModal, Select, toast } from "../../components/index.js";
import { abrirEnviadoARevision } from "../EnviadoARevision.js";
import { costo } from "../../utils/format.js";
import { BARRIOS, dentroComuna10 } from "../../utils/catalogo.js";

const CATEGORIAS = ["Cultura", "Gastronomía", "Arte urbano", "Historia", "Naturaleza", "Arquitectura", "Música"];
const DURACIONES = ["30 min", "45 min", "1 h", "1 h 30 min", "2 h", "Media jornada"];

const opciones = (lista) => lista.map((o) => ({ v: o, t: o }));
const REQ = (txt) => h("span", { class: "req" }, txt);

/** Abre el asistente: sin argumento crea un lugar nuevo; con un lugar lo edita. */
export function abrirWizard(existing) {
  const nodo = h(LugarWizard, { existing });
  openModal(nodo, { size: "modal-lg", dismissable: false, onDismiss: () => nodo._component.cancelar() });
}

function Paso({ n, label, actual }) {
  const cls = actual === n ? "on" : actual > n ? "done" : "";
  return h("div", { class: ["step", cls] }, h("span", { class: "step-n" }, actual > n ? "✓" : n), label);
}

function Verif({ ok, texto }) {
  return h("div", { class: "verif-row" }, h("span", { class: ["blk-ico", ok ? "ok" : "warn"] }, ok ? "✓" : "⚠"), texto);
}

class LugarWizard extends Component {
  constructor(props) {
    super(props);
    const existing = props.existing;
    this.existing = existing;
    this.draft = existing ? JSON.parse(JSON.stringify(existing)) : {
      id: null, nombre: "", categoria: "", barrio: "", costo: "", duracion: "",
      descripcion: "", direccion: "", coords: "", horario: "", reserva: "No",
    };
    Object.keys(this.draft).forEach((k) => { if (this.draft[k] == null) this.draft[k] = ""; }); // null → "" para no marcar cambios falsos
    if (!BARRIOS.includes(this.draft.barrio)) this.draft.barrio = BARRIOS[0]; // el <select> sin placeholder muestra la primera opción
    this.inicial = JSON.stringify(this.draft);
    this.state = { paso: 1, err: null, busy: false };
  }

  // Pide confirmación solo si hay cambios sin guardar
  cancelar() {
    if (JSON.stringify(this.draft) === this.inicial) { closeAll(); return; }
    confirmDialog("¿Descartar los cambios?", () => closeAll(), "Descartar",
      { detalle: "Se perderá lo que escribiste.", cancelLabel: "Seguir editando" });
  }

  set(campo) { return (e) => { this.draft[campo] = e.target.value; }; }

  faltantes() {
    const d = this.draft, faltan = [];
    if (!d.categoria) faltan.push("categoría");
    if (d.costo === "" || d.costo == null) faltan.push("costo");
    if (!d.duracion) faltan.push("duración");
    return faltan;
  }

  errFaltan(faltan) {
    return { titulo: "Faltan campos obligatorios", msg: "Sin " + faltan.join(", ") + " el lugar no puede entrar en las recomendaciones." };
  }

  siguiente() {
    if (this.state.paso === 2) {
      const faltan = this.faltantes();
      if (faltan.length) { this.setState({ err: this.errFaltan(faltan) }); return; }
    }
    this.setState({ paso: this.state.paso + 1, err: null });
  }

  enviar() {
    const faltan = this.faltantes();
    if (faltan.length) { this.setState({ paso: 2, err: this.errFaltan(faltan) }); return; }
    this.guardar(true);
  }

  guardar(enviar) {
    if (this.state.busy) return;
    this.setState({ busy: true });
    store.save("lugares", this.draft).then((saved) => {
      if (saved && saved.id) this.draft.id = saved.id; // evita duplicar si el envío falla y se reintenta
      return enviar ? store.enviarRevision("lugares", this.draft.id) : saved;
    }).then(() => {
      closeAll();
      if (enviar) abrirEnviadoARevision(this.draft.nombre); else toast("Borrador guardado");
      app.refresh();
    }).catch((e) => {
      this.setState({ busy: false, err: { titulo: "No se pudo completar", msg: (e && e.message) || "Inténtalo de nuevo." } });
    });
  }

  paso1() {
    const d = this.draft;
    return [
      h(Field, { label: "Nombre del lugar" },
        h("input", { id: "f-nombre", value: d.nombre, placeholder: "Como lo conoce la gente", onInput: this.set("nombre") })),
      h(Field, { label: "Descripción corta" },
        h("textarea", { id: "f-desc", maxlength: 200, placeholder: "Máximo 200 caracteres", value: d.descripcion, onInput: this.set("descripcion") })),
      h("div", { class: "grid2" },
        h(Field, { label: "Dirección" }, h("input", { id: "f-dir", value: d.direccion, onInput: this.set("direccion") })),
        h(Field, { label: "Barrio" }, h(Select, { id: "f-barrio", options: opciones(BARRIOS), value: d.barrio, onChange: this.set("barrio") }))),
      h(Field, { label: "Coordenadas" },
        h("input", { id: "f-coords", value: d.coords, placeholder: "6.25180, -75.56860", onInput: this.set("coords") })),
    ];
  }

  paso2() {
    const d = this.draft;
    const dur = h(Select, { id: "f-dur", options: opciones(DURACIONES), value: d.duracion, placeholder: "Elige una opción", onChange: this.set("duracion") });
    dur.options[0].disabled = true;
    return [
      h(Field, { label: ["Categoría ", REQ("obligatoria")] },
        h("div", { class: "chips-select", id: "f-cat" }, CATEGORIAS.map((c) =>
          h("button", { type: "button", class: ["chip-sel", d.categoria === c && "on"], "data-cat": c,
            onClick: () => { d.categoria = c; this.setState({}); } }, c)))),
      h("div", { class: "grid2" },
        h(Field, { label: ["Costo aproximado en pesos ", REQ("obligatorio")] },
          h("input", { id: "f-costo", type: "number", min: 0, value: d.costo, placeholder: "0 si es gratis",
            onInput: (e) => { d.costo = e.target.value === "" ? "" : Number(e.target.value); } })),
        h(Field, { label: ["Duración estimada ", REQ("obligatoria")] }, dur)),
      h("div", { class: "grid2" },
        h(Field, { label: "Horario" },
          h("input", { id: "f-horario", value: d.horario, placeholder: "Martes a domingo, 10:00 a 17:30", onInput: this.set("horario") })),
        h(Field, { label: "¿Requiere reserva?" }, h(Select, { id: "f-reserva", options: opciones(["No", "Sí"]), value: d.reserva, onChange: this.set("reserva") }))),
    ];
  }

  paso3() {
    const d = this.draft;
    return [
      h("div", { class: "review-card" },
        h("div", { class: "detail-head" }, h("h3", { class: "modal-title" }, d.nombre || "Sin nombre"), h(Chip, { tono: "amarillo" }, "Listo para enviar")),
        h("div", { class: "detail-grid" },
          h(DetailField, { k: "Categoría", v: d.categoria || "—" }), h(DetailField, { k: "Barrio", v: d.barrio || "—" }),
          h(DetailField, { k: "Costo", v: costo(d) }), h(DetailField, { k: "Duración", v: d.duracion || "—" })),
        h("div", { class: "detail-block" }, h("span", { class: "dl" }, "Descripción"), h("p", null, d.descripcion || "—"))),
      h("div", { class: "verif" },
        h("h4", { class: "mini-title" }, "Verificación automática"),
        h(Verif, { ok: !!(d.nombre && d.categoria && d.costo !== "" && d.duracion && d.descripcion && d.direccion),
          texto: "Campos obligatorios completos (incluye descripción y dirección)" }),
        h(Verif, { ok: BARRIOS.indexOf(d.barrio) >= 0, texto: "El barrio pertenece a la comuna 10" }),
        h(Verif, { ok: dentroComuna10(d.coords), texto: !d.coords ? "Falta ubicar el marcador (coordenadas)" : dentroComuna10(d.coords) ? "El marcador está dentro de la Comuna 10" : "Las coordenadas están fuera de la Comuna 10 (o con formato inválido)" })),
    ];
  }

  footer() {
    const { paso, busy } = this.state;
    const borrador = h(Button, { variant: "outline", "data-borrador": "", disabled: busy, onClick: () => this.guardar(false) }, "Guardar borrador");
    return h("div", { class: "wiz-footer" },
      paso > 1
        ? h(Button, { variant: "outline", "data-prev": "", disabled: busy, onClick: () => this.setState({ paso: paso - 1, err: null }) }, "‹ Volver")
        : h(Button, { variant: "ghost", "data-cancel": "", disabled: busy, onClick: () => this.cancelar() }, "Cancelar"),
      h("div", { class: "wiz-right" }, borrador,
        paso < 3
          ? h(Button, { "data-next": "", disabled: busy, onClick: () => this.siguiente() }, "Continuar")
          : h(Button, { "data-enviar": "", disabled: busy, onClick: () => this.enviar() }, "Enviar a revisión")));
  }

  render() {
    const { paso, err } = this.state;
    return h("div", { class: "modal-body wizard" },
      h("div", { class: "wiz-head" }, h("h3", { class: "modal-title" }, this.existing ? "Editar lugar" : "Nuevo lugar")),
      h("div", { class: "steps" },
        h(Paso, { n: 1, label: "Identificación", actual: paso }),
        h(Paso, { n: 2, label: "Clasificación", actual: paso }),
        h(Paso, { n: 3, label: "Revisión propia", actual: paso })),
      h("div", { id: "wiz-err" },
        err ? h("div", { class: "alert alert-error" }, h("b", null, err.titulo), h("span", null, err.msg)) : null),
      h("div", { class: "wiz-content" }, paso === 1 ? this.paso1() : paso === 2 ? this.paso2() : this.paso3()),
      this.footer());
  }
}
