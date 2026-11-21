/* XPAND · api/endpoints/ajustes.js — /api/ajustes */
import api from "../client.js";

export default {
  obtener: () => api("GET", "/ajustes"),
  guardar: (cambios) => api("PUT", "/ajustes", cambios),
};
