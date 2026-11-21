/* XPAND · pages/PublicacionConfirmada.js — modal "X está publicado" con métricas del catálogo. */
import { h } from "../core/h.js";
import { Button, Logo, closeModal, openModal } from "../components/index.js";

function Metrica({ grande, pequeno }) {
  return h("div", { class: "pub-metric" }, h("div", { class: "pm-big" }, grande), h("div", { class: "pm-small" }, pequeno));
}

/** stats = store.stats(); onSiguiente (opcional) muestra el botón "Revisar el siguiente". */
export function abrirPublicacionConfirmada(nombre, stats, onSiguiente) {
  openModal(
    h("div", { class: "modal-body confirm-pub" },
      h("div", { class: "login-logo" }, h(Logo, { mascota: true, height: 110 })),
      h("h3", { class: "modal-title" }, nombre + " está publicado"),
      h("p", { class: "muted center" }, "Ya aparece en las recomendaciones de la app."),
      h("div", { class: "pub-metrics" },
        h(Metrica, { grande: stats.publicados, pequeno: "lugares publicados" }),
        h(Metrica, { grande: stats.barriosCubiertos + "/" + stats.totalBarrios, pequeno: "barrios cubiertos" }),
        h(Metrica, { grande: stats.completitud + "%", pequeno: "del catálogo meta" })),
      h("div", { class: "modal-actions center" },
        onSiguiente ? h(Button, { onClick: () => { closeModal(); onSiguiente(); } }, "Revisar el siguiente") : null,
        h(Button, { variant: "ghost", onClick: closeModal }, "Cerrar"))),
    { size: "modal-sm" });
}
