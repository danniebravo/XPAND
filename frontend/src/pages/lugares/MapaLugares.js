/* XPAND · pages/lugares/MapaLugares.js — mapa esquemático (SVG) + cobertura por barrio. */
import { h } from "../../core/h.js";
import store from "../../services/store.js";
import { svg } from "../../utils/svg.js";

const colorDe = (estado) => (estado === "publicado" ? "#12703A" : estado === "en_revision" ? "#5F6570" : "#B98900");

function Punto(l, i) {
  return svg("circle", {
    cx: 60 + (i % 5) * 90 + (i % 2) * 20, cy: 70 + Math.floor(i / 5) * 80, r: 9,
    fill: "#fff", stroke: colorDe(l.estado), "stroke-width": 4,
  });
}

function Leyenda() {
  const item = (color, texto) => h("span", null, h("i", { style: { background: color } }), texto);
  return h("div", { class: "map-legend" }, item("#12703A", "Publicado"), item("#5F6570", "En revisión"), item("#B98900", "Borrador"));
}

function CoberturaBarrios() {
  const cob = store.coberturaPorBarrio();
  return h("aside", { class: "card map-side" },
    h("div", { class: "card-head" }, h("h3", null, "Cobertura por barrio"), h("span", { class: "muted" }, cob.length + " barrios")),
    cob.map((b) => h("div", { class: ["cov-row", b.lugares === 0 && "cov-cero"] },
      h("span", { class: "cov-name" }, b.barrio), h("span", { class: "cov-num" }, b.lugares))));
}

export function MapaLugares() {
  const mapa = svg("svg", { viewBox: "0 0 560 360", preserveAspectRatio: "xMidYMid slice" },
    svg("rect", { width: 560, height: 360, fill: "#EDEEF0" }),
    svg("polygon", { points: "70,60 470,50 500,300 120,320", fill: "#DDEBE4", stroke: "#003893", "stroke-dasharray": "6 6", "stroke-width": 2 }),
    ...store.all("lugares").map(Punto));
  return h("div", { class: "map-layout" },
    h("div", { class: "map-canvas" }, mapa, h(Leyenda), h("div", { class: "map-attr" }, "Mapbox · OpenStreetMap")),
    h(CoberturaBarrios));
}
