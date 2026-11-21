/* XPAND · services/auth.js
 * Login contra la API (JWT), sesión, matriz de permisos y menú. No conoce el store (quien cierra sesión lo limpia).
 */
import { api, authApi } from "../api/index.js";
import { ROUTES } from "../router/routes.js";

let current = null;
let debeCambiar = false;

const guardar = (r) => {
  current = r.user;
  debeCambiar = !!(r.debeCambiarClave || (r.user && r.user.debeCambiarClave));
  return current;
};

// Restaura la sesión validando el token guardado contra /auth/me.
async function loadSession() {
  if (!api.getToken()) return null;
  try {
    return guardar(await authApi.me());
  } catch (e) {
    api.setToken(null);
    current = null;
    return null;
  }
}

// Devuelve Promise<user>; rechaza con el mensaje del servidor (credenciales, cuenta desactivada…)
async function login(correo, password) {
  const r = await authApi.login(String(correo || "").trim(), password || "");
  api.setToken(r.token);
  return guardar(r);
}

async function cambiarClave(actual, nueva) {
  await authApi.cambiarClave(actual, nueva);
  debeCambiar = false;
}

const solicitarClave = (correo) => authApi.solicitarClave(String(correo || "").trim());

function logout() {
  current = null;
  debeCambiar = false;
  api.setToken(null);
}

const user = () => current;
const debeCambiarClave = () => debeCambiar;
const isCoordinador = () => !!current && current.rol === "coordinador";

// Matriz de permisos. El editor carga y envía a revisión; el coordinador
// además revisa, publica, gestiona roles y ajustes.
function can(accion) {
  if (!current) return false;
  switch (accion) {
    case "ver_panel":
    case "ver_lugares":
    case "ver_retos":
    case "ver_insignias":
    case "ver_usuarios":
    case "crear":
    case "editar":
    case "borrar":
    case "enviar_revision":
      return true;                 // editor y coordinador
    case "aprobar":
    case "publicar":
    case "devolver":
    case "ver_revision":
    case "ver_equipo":
    case "gestionar_roles":
    case "ver_ajustes":
    case "editar_ajustes":
    case "suspender_usuario":
      return isCoordinador();      // solo coordinador
    default:
      return false;
  }
}

// Secciones visibles del menú: las rutas que el rol puede ver (router/routes.js)
const menu = () => Object.entries(ROUTES)
  .filter(([, r]) => can(r.permiso))
  .map(([id, r]) => ({ id, label: r.label, icon: r.icon, badge: !!r.badge }));

const auth = {
  loadSession, login, logout, cambiarClave, solicitarClave,
  user, debeCambiarClave, isCoordinador, can, menu,
};

export default auth;
