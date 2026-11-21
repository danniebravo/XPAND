/* XPAND · api/endpoints/retos.js — /api/retos (+ vista previa de puntos) */
import api from "../client.js";
import { crearRecurso } from "./_recurso.js";

export default {
  ...crearRecurso("/retos"),
  /** → { total, desglose: [[etiqueta, puntos]] } según lugar, tipo e insignia */
  puntosPreview(lugarId, tipo, insigniaId) {
    const q = Object.entries({ lugarId, tipo, insigniaId }).filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
    return api("GET", "/retos/points-preview" + (q ? "?" + q : ""));
  },
};
