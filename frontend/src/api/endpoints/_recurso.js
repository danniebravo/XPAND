/* XPAND · api/endpoints/_recurso.js
 * Fábrica de los endpoints REST que comparten lugares, retos e insignias:
 *   GET /x · GET /x/:id · POST /x · PUT /x/:id · DELETE /x/:id · POST /x/:id/(enviar-revision|publicar|devolver)
 */
import api from "../client.js";

export function crearRecurso(base) {
  return {
    listar: () => api("GET", base),
    obtener: (id) => api("GET", `${base}/${id}`),
    crear: (datos) => api("POST", base, datos),
    actualizar: (id, datos) => api("PUT", `${base}/${id}`, datos),
    borrar: (id) => api("DELETE", `${base}/${id}`),
    enviarRevision: (id) => api("POST", `${base}/${id}/enviar-revision`),
    publicar: (id) => api("POST", `${base}/${id}/publicar`),
    devolver: (id, comentario) => api("POST", `${base}/${id}/devolver`, { comentario }),
  };
}
