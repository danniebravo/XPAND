/* XPAND · pages/PanelPage.js — dashboard: métricas, completitud del catálogo y cobertura por barrio. */
import { h } from "../core/h.js";
import { app } from "../core/app.js";
import auth from "../services/auth.js";
import store from "../services/store.js";
import { Button, Logo, PageHeader, StatCard } from "../components/index.js";

// Distribución del catálogo por categoría
function distribucionCategorias() {
  const cats = {};
  store.all("lugares").forEach((l) => { cats[l.categoria] = (cats[l.categoria] || 0) + 1; });
  return Object.keys(cats).map((c) => ({ categoria: c, total: cats[c] })).sort((a, b) => b.total - a.total);
}

/** Fila con barra de proporción (categorías y barrios). */
function BarraFila({ nombre, valor, maximo, cero }) {
  return h("div", { class: ["cov-row", cero && "cov-cero"] },
    h("span", { class: "cov-name" }, nombre),
    h("span", { class: "cov-track" }, h("span", { class: "cov-fill", style: { width: Math.round((valor / maximo) * 100) + "%" } })),
    h("span", { class: "cov-num" }, valor));
}

export function PanelPage() {
  const s = store.stats();
  const cob = store.coberturaPorBarrio();
  const maxBarrio = Math.max(1, ...cob.map((b) => b.lugares));
  const cats = distribucionCategorias();
  const maxCat = Math.max(1, ...cats.map((c) => c.total));

  const nuevoLugar = () => { app.pending = "nuevo-lugar"; app.go("#lugares"); };

  return h("div", null,
    h(PageHeader, { title: "Panel", sub: "Catálogo de la comuna 10 · La Candelaria" },
      auth.can("crear") ? h(Button, { onClick: nuevoLugar }, "+ Nuevo lugar") : null),
    h("div", { class: "pad" },
      h("div", { class: "saludo" },
        h(Logo, { mascota: true, height: 76 }),
        h("div", null, h("h3", null, "Hola, " + auth.user().nombre),
          h("p", { class: "muted" }, "Así va el catálogo de la Comuna 10 hoy."))),
      h("div", { class: "stat-row" },
        h(StatCard, { num: s.publicados, label: "Publicados", sub: "visibles en la app", tono: "sc-azul" }),
        h(StatCard, { num: s.enRevision, label: "En revisión", sub: "esperan aprobación", tono: "sc-gris" }),
        h(StatCard, { num: s.borradores, label: "Borradores", sub: "faltan datos", tono: "sc-amarillo" }),
        h(StatCard, { num: s.barriosCubiertos + "/" + s.totalBarrios, label: "Barrios cubiertos", sub: "de la comuna 10", tono: "sc-plano" })),
      h("div", { class: "cols-2" },
        h("section", { class: "card" },
          h("div", { class: "card-head" }, h("h3", null, "Completitud del catálogo"), h("span", { class: "muted" }, "Meta: " + s.metaLugares + " lugares")),
          h("div", { class: "progress" }, h("div", { class: "progress-bar", style: { width: Math.min(100, s.completitud) + "%" } })),
          h("div", { class: "progress-legend" }, h("span", null, s.publicados + " de " + s.metaLugares + " publicados"), h("b", null, s.completitud + "%")),
          h("h4", { class: "mini-title" }, "Distribución por categoría"),
          cats.map((c) => h(BarraFila, { nombre: c.categoria, valor: c.total, maximo: maxCat }))),
        h("section", { class: "card" },
          h("div", { class: "card-head" }, h("h3", null, "Cobertura por barrio"), h("span", { class: "muted" }, cob.length + " barrios")),
          cob.map((b) => h(BarraFila, { nombre: b.barrio, valor: b.lugares, maximo: maxBarrio, cero: b.lugares === 0 }))))));
}
