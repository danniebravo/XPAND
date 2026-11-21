/* XPAND · api/endpoints/auth.js — /api/auth */
import api from "../client.js";

export default {
  login: (correo, password) => api("POST", "/auth/login", { correo, password }),
  me: () => api("GET", "/auth/me"),
  cambiarClave: (actual, nueva) => api("POST", "/auth/cambiar-clave", { actual, nueva }),
  solicitarClave: (correo) => api("POST", "/auth/solicitar-clave", { correo }),
};
