/* XPAND · pages/retos/RetoForm.js — formulario flotante de nuevo / editar reto, con puntos calculados por el servidor. */
import { h } from "../../core/h.js";
import { Component } from "../../core/component.js";
import { app } from "../../core/app.js";
import store from "../../services/store.js";
import { Button, closeAll, confirmDialog, Field, FormError, openModal, Select, toast } from "../../components/index.js";
import { abrirEnviadoARevision } from "../EnviadoARevision.js";
import { TIPOS } from "../../utils/catalogo.js";

/** Tarjeta "Puntos calculados": vista previa del servidor (solo lectura; los puntos no se editan por reto). */
class PuntosCard extends Component {
  constructor(props) {
    super(props);
    const d = props.draft;
    this.state = { estado: "cargando", total: 0, desglose: [] };
    this.q = [d.lugarId, d.tipo, d.insigniaId];
  }

  onMount() {
    store.puntosPreview(...this.q).then((p) => {
      if (!this.el.isConnected) return;      // el formulario se redibujó con otra elección
      this.setState({ estado: "ok", total: p.total, desglose: p.desglose });
    }).catch(() => { if (this.el.isConnected) this.setState({ estado: "error" }); });
  }

  render() {
    const { estado, total, desglose } = this.state;
    const pts = estado === "cargando" ? h("p", { class: "muted small" }, "Calculando…")
      : estado === "error" ? h("p", { class: "muted small" }, "No se pudieron calcular los puntos.")
      : [h("div", { class: "points-big" }, total, " ", h("span", null, "XP")),
         h("div", { class: "points-list" }, desglose.map((x) =>
           h("div", { class: "pl-row" }, h("span", null, x[0]), h("b", null, "+" + x[1]))))];
    return h("div", { class: "card points-card" },
      h("div", { class: "card-head" }, h("h3", null, "Puntos calculados"), h("span", { class: "chip chip-azul" }, "Automático")),
      h("div", null, pts),
      h("small", { class: "fhelp" }, "Se calcula con las reglas de Ajustes, el lugar, el tipo y la medalla."));
  }
}

class RetoForm extends Component {
  constructor(props) {
    super(props);
    const existing = props.existing;
    const d = existing ? JSON.parse(JSON.stringify(existing)) : {
      id: null, titulo: "", lugarId: "", insigniaId: null, tipo: "Visita", instruccion: "",
    };
    d.lugarId = d.lugarId || ""; d.instruccion = d.instruccion || "";
    d.insigniaId = d.insigniaId || null; d.tipo = d.tipo || "Visita";
    this.draft = d;
    this.inicial = JSON.stringify(d);
    this.publicados = store.all("lugares").filter((l) => l.estado === "publicado");
    // el lugar actual del reto debe seguir disponible aunque ya no esté publicado
    if (d.lugarId && !this.publicados.some((l) => l.id === d.lugarId)) {
      const actual = store.byId("lugares", d.lugarId);
      if (actual) this.publicados.push(actual);
    }
  }

  collect() {
    const d = this.draft;
    d.titulo = this.tit.value; d.lugarId = this.lugar.value; d.instruccion = this.inst.value;
    d.tipo = this.tipo.value; d.insigniaId = this.ins.value || null;
  }

  redibujar() { this.collect(); this.update(); }

  cancelar() {
    this.collect();
    if (JSON.stringify(this.draft) === this.inicial) { closeAll(); return; }
    confirmDialog("¿Descartar los cambios?", () => closeAll(), "Descartar",
      { detalle: "Se perderá lo que escribiste.", cancelLabel: "Seguir editando" });
  }

  guardar(enviar) {
    this.collect();
    const d = this.draft, error = (m) => this.errBox.show(m);
    error("");
    if (enviar && (!d.titulo.trim() || !d.lugarId || !d.instruccion.trim())) {
      return error("Completa el título, el lugar asociado y la instrucción para enviar a revisión.");
    }
    const btns = [this.bBorrador, this.bEnviar];
    btns.forEach((b) => { b.disabled = true; });
    store.save("retos", d).then((saved) => {
      d.id = saved.id; // si falla el envío, el reintento actualiza en vez de duplicar
      return enviar ? store.enviarRevision("retos", saved.id) : null;
    }).then(() => {
      closeAll();
      if (enviar) abrirEnviadoARevision(d.titulo); else toast("Borrador guardado");
      app.refresh();
    }).catch((err) => {
      btns.forEach((b) => { b.disabled = false; });
      error((err && err.message) || "No se pudo guardar el reto.");
    });
  }

  render() {
    const d = this.draft, existing = this.props.existing;
    const err = h(FormError);
    this.errBox = err._component;
    return h("div", { class: "modal-body" },
      h("div", { class: "wiz-head" }, h("h3", { class: "modal-title" }, existing ? "Editar reto" : "Nuevo reto")),
      err,
      h("div", { class: "cols-2" },
        h("div", null,
          h(Field, { label: "Título del reto" }, h("input", { value: d.titulo, ref: (el) => { this.tit = el; } })),
          h(Field, { label: "Lugar asociado" },
            h(Select, {
              options: this.publicados.map((l) => ({ v: l.id, t: l.nombre + " · " + l.barrio })), value: d.lugarId,
              placeholder: "Elige un lugar publicado", ref: (el) => { this.lugar = el; }, onChange: () => this.redibujar(),
            })),
          h(Field, { label: "Instrucción para el usuario" }, h("textarea", { ref: (el) => { this.inst = el; } }, d.instruccion)),
          h("div", { class: "grid2" },
            h(Field, { label: "Tipo de reto" },
              h(Select, { options: TIPOS.map((t) => ({ v: t, t })), value: d.tipo, ref: (el) => { this.tipo = el; }, onChange: () => this.redibujar() })),
            h(Field, { label: "Insignia que otorga" },
              h(Select, {
                options: store.all("insignias").map((i) => ({ v: i.id, t: i.nombre + " · +" + (i.xp || 0) + " XP" })), value: d.insigniaId,
                placeholder: "Ninguna", ref: (el) => { this.ins = el; }, onChange: () => this.redibujar(),
              })))),
        h(PuntosCard, { draft: d })),
      h("div", { class: "wiz-footer" },
        h(Button, { variant: "ghost", onClick: () => this.cancelar() }, "Cancelar"),
        h("div", { class: "wiz-right" },
          h(Button, { variant: "outline", ref: (el) => { this.bBorrador = el; }, onClick: () => this.guardar(false) }, "Guardar borrador"),
          h(Button, { ref: (el) => { this.bEnviar = el; }, onClick: () => this.guardar(true) }, "Enviar a revisión"))));
  }
}

/** Abre el formulario: sin argumento o null = nuevo reto; con un reto = editarlo. */
export function abrirRetoForm(existing = null) {
  const form = h(RetoForm, { existing });
  openModal(form, { size: "modal-lg", dismissable: false, onDismiss: () => form._component.cancelar() });
}
