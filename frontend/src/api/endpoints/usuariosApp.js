/* XPAND · api/endpoints/usuariosApp.js — /api/usuarios-app */
import api from "../client.js";

export default {
  listar: () => api("GET", "/usuarios-app"),
  obtener: (id) => api("GET", `/usuarios-app/${id}`),
  suspender: (id, estado) => api("POST", `/usuarios-app/${id}/suspender`, { estado }),
};
