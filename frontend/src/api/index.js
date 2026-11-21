/* XPAND · api/index.js — API del servidor: cliente HTTP + un archivo de endpoints por recurso. */
import api from "./client.js";
import authApi from "./endpoints/auth.js";
import lugaresApi from "./endpoints/lugares.js";
import retosApi from "./endpoints/retos.js";
import insigniasApi from "./endpoints/insignias.js";
import usuariosAppApi from "./endpoints/usuariosApp.js";
import equipoApi from "./endpoints/equipo.js";
import ajustesApi from "./endpoints/ajustes.js";
import dashboardApi from "./endpoints/dashboard.js";

export { api, authApi, lugaresApi, retosApi, insigniasApi, usuariosAppApi, equipoApi, ajustesApi, dashboardApi };
