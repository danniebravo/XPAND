/* XPAND · api/client.js
 * Cliente mínimo de la API Flask: api(method, path, body) → Promise con el JSON (null si es 204).
 * Rechaza con Error (message legible, .status, .code, .details).
 */
const TOKEN_KEY = "xpand_admin_token_v2";
// Servido por Flask (:5000) usa rutas relativas; desde cualquier otro origen (Live Server, file://) apunta al backend local.
const BASE = location.port === "5000" ? "" : "http://localhost:5000";
const NOMBRES = { descripcion: "descripción", direccion: "dirección", coords: "coordenadas", categoria: "categoría", duracion: "duración", instruccion: "instrucción", titulo: "título" };

const getToken = () => { try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; } };
const setToken = (t) => {
  try { if (t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY); } catch (e) { /* sin almacenamiento */ }
};

async function api(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  const t = getToken();
  if (t) headers.Authorization = "Bearer " + t;

  let res;
  try {
    res = await fetch(BASE + "/api" + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch (e) {
    throw new Error("No hay conexión con el servidor. Verifica que esté encendido.");
  }
  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (res.ok) return data;

  const e = data && data.error;
  let msg = (e && e.message) || "No se pudo completar la acción.";
  const faltan = e && e.details && e.details.campos;
  if (faltan && faltan.length) msg = msg.replace(/\.$/, "") + ": " + faltan.map((c) => NOMBRES[c] || c).join(", ") + ".";
  const err = new Error(msg);
  err.status = res.status;
  err.code = e && e.code;
  err.details = e && e.details;
  // Token vencido o inválido (el login mismo responde 401 por credenciales: no cuenta)
  if (res.status === 401 && !path.startsWith("/auth/login") && api.onUnauthorized) api.onUnauthorized();
  throw err;
}

api.getToken = getToken;
api.setToken = setToken;
api.onUnauthorized = null;

export default api;
