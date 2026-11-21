/* XPAND · api/endpoints/equipo.js — /api/equipo */
import api from "../client.js";

export default {
  listar: () => api("GET", "/equipo"),
  invitar: (nombre, correo, rol) => api("POST", "/equipo", { nombre, correo, rol }),
  setRol: (id, rol) => api("PUT", `/equipo/${id}/rol`, { rol }),
  setActivo: (id, activo) => api("PUT", `/equipo/${id}/estado`, { activo: !!activo }),
  restablecerClave: (id) => api("POST", `/equipo/${id}/restablecer-clave`),
};
