/* XPAND · pages/AjustesPage.js — integración con Mapbox, territorio del MVP y puntos de los retos. Solo coordinador. */
import { h } from "../core/h.js";
import { app } from "../core/app.js";
import auth from "../services/auth.js";
import store from "../services/store.js";
import { Button, Chip, Field, PageHeader, Select, fail, toast } from "../components/index.js";
import { TIPOS } from "../utils/catalogo.js";
import { svg } from "../utils/svg.js";

const ESTILOS = ["Streets v12 · claro", "Streets v12 · oscuro", "Light v11", "Outdoors v12"];
const POLIGONOS = ["Comuna 10 · La Candelaria", "Comuna 10 · núcleo", "Centro ampliado"];

/** Select de textos simples; si el valor guardado no está en la lista se muestra la primera opción. */
function Opciones({ id, opciones, valor }) {
  return h(Select, { id, options: opciones.map((o) => ({ v: o, t: o })), value: opciones.includes(valor) ? valor : opciones[0] });
}

function Numero({ id, valor, min, max }) {
  return h("input", { type: "number", id, inputmode: "numeric", step: 1, min, max, value: valor });
}

function MapaMini() {
  return h("div", { class: "map-canvas mini" },
    svg("svg", { viewBox: "0 0 460 200", preserveAspectRatio: "xMidYMid meet" },
      svg("rect", { width: 460, height: 200, fill: "#EDEEF0" }),
      svg("polygon", { points: "60,40 400,30 420,170 100,180", fill: "#DDEBE4", stroke: "#003893", "stroke-dasharray": "6 6", "stroke-width": 2 })),
    h("div", { class: "map-attr" }, "Mapbox · OpenStreetMap"));
}

export function AjustesPage() {
  if (!auth.can("ver_ajustes")) { app.go("#panel"); return h("div"); }
  const a = store.getAjustes(), pt = a.puntos || {}, mb = a.mapbox || {}, te = a.territorio || {};

  const tok = h("input", { id: "tok", value: mb.tokenPublico });
  const estilo = h(Opciones, { id: "estilo", opciones: ESTILOS, valor: mb.estilo });
  const zoom = h("input", { id: "zoom", value: mb.zoom });
  const centro = h("input", { id: "centro", value: mb.centro });
  const poligono = h(Opciones, { id: "poligono", opciones: POLIGONOS, valor: te.poligono });
  const barrios = h("input", { id: "barrios", value: te.barriosHabilitados });
  const meta = h(Numero, { id: "meta-lugares", valor: te.metaLugares, min: 1, max: 500 });

  const base = h(Numero, { id: "p-base", valor: pt.base, min: 0, max: 200 });
  const bbar = h(Numero, { id: "p-bbar", valor: pt.bonoBarrio, min: 0, max: 200 });
  const ubar = h(Numero, { id: "p-ubar", valor: pt.umbralBarrio, min: 0, max: 20 });
  const bcat = h(Numero, { id: "p-bcat", valor: pt.bonoCategoria, min: 0, max: 200 });
  const ucat = h(Numero, { id: "p-ucat", valor: pt.umbralCategoria, min: 0, max: 20 });
  const tipos = TIPOS.map((t) => [t, h(Numero, { id: "p-tipo-" + t, valor: (pt.bonoTipo || {})[t] || 0, min: 0, max: 200 })]);

  const guardar = () => {
    store.saveAjustes({
      puntos: {
        base: base.value, bonoBarrio: bbar.value, umbralBarrio: ubar.value,
        bonoCategoria: bcat.value, umbralCategoria: ucat.value,
        bonoTipo: Object.fromEntries(tipos.map(([t, el]) => [t, el.value])),
      },
      mapbox: { tokenPublico: tok.value, estilo: estilo.value, zoom: zoom.value, centro: centro.value },
      territorio: { poligono: poligono.value, barriosHabilitados: barrios.value, metaLugares: meta.value },
    }).then(() => { toast("Cambios guardados"); app.refresh(); }).catch(fail);
  };

  return h("div", null,
    h(PageHeader, { title: "Ajustes", sub: "Integraciones y territorio · solo la coordinadora" },
      h(Button, { id: "guardar", onClick: guardar }, "Guardar cambios")),
    h("div", { class: "pad" },
      h("div", { class: "cols-2" },
        h("section", { class: "card" },
          h("div", { class: "card-head" }, h("h3", null, "Conexión con Mapbox"), h(Chip, { tono: "azul" }, mb.conectado ? "Conectado" : "Sin conexión")),
          h(Field, { label: "Token público" }, tok),
          h(Field, { label: "Estilo del mapa" }, estilo),
          h("div", { class: "grid2" }, h(Field, { label: "Zoom inicial" }, zoom), h(Field, { label: "Centro" }, centro))),

        h("section", { class: "card" },
          h("div", { class: "card-head" }, h("h3", null, "Territorio del MVP")),
          h(MapaMini),
          h(Field, { label: "Polígono activo" }, poligono),
          h(Field, { label: "Barrios habilitados" }, barrios),
          h(Field, { label: "Meta de lugares publicados", help: "Con esta meta se calcula la completitud del panel (1–500)" }, meta),
          h("div", { class: "verif-row" }, h("span", { class: "blk-ico ok" }, "✓"), "Consumo del mes ", h("b", { class: "ml" }, te.consumo))),

        h("section", { class: "card span-all" },
          h("div", { class: "card-head" }, h("h3", null, "Puntos de los retos")),
          h("p", { class: "muted small" }, "Con estos valores se calcula el puntaje sugerido de cada reto. Los retos ya creados conservan sus puntos hasta que se editen."),
          h("div", { class: "mt grid2" },
            h(Field, { label: "Puntos base", help: "Todo reto parte de aquí (0–200)" }, base),
            h("div"),
            h(Field, { label: "Bono por barrio poco recorrido", help: "Puntos extra (0–200)" }, bbar),
            h(Field, { label: "Aplica si el barrio tiene hasta", help: "lugares publicados (0–20)" }, ubar),
            h(Field, { label: "Bono por categoría poco visitada", help: "Puntos extra (0–200)" }, bcat),
            h(Field, { label: "Aplica si la categoría tiene hasta", help: "lugares en total (0–20)" }, ucat)),
          h("h4", { class: "mini-title" }, "Bono por tipo de reto"),
          h("div", { class: "grid2" }, tipos.map(([t, el]) => h(Field, { label: t, help: "Puntos extra (0–200)" }, el))),
          h("p", { class: "muted small mt" }, "Los puntos de cada medalla se definen en Insignias.")))));
}
