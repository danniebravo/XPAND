/* XPAND · router/router.js
 * Enrutador por hash (#panel, #lugares/l-1 …). Convierte la URL en { id, param, Page } respetando los permisos.
 */
import auth from "../services/auth.js";
import { ROUTES } from "./routes.js";

/** Lee location.hash. Si la ruta no existe o el rol no la puede ver, cae en el panel. */
export function resolverRuta(hash = location.hash) {
  const [primero, resto] = (hash || "#panel").replace("#", "").split("/");
  let id = primero || "panel";
  let param = resto ? decodeURIComponent(resto) : null;      // ej. #lugares/l-1 → detalle de l-1
  if (!ROUTES[id] || !auth.can(ROUTES[id].permiso)) {
    id = "panel"; param = null;
    if (location.hash !== "#panel") history.replaceState(null, "", "#panel"); // corrige la URL sin disparar hashchange
  }
  return { id, param, Page: ROUTES[id].Page };
}

/** Ejecuta `fn` cada vez que cambia la ruta. Devuelve la función para dejar de escuchar. */
export function alCambiarRuta(fn) {
  window.addEventListener("hashchange", fn);
  return () => window.removeEventListener("hashchange", fn);
}
