/* XPAND · services/store.js
 * Caché en memoria sobre la API. Las lecturas (all, byId, stats…) son síncronas y salen de la caché;
 * todo lo que escribe devuelve una Promise, llama a la API y recarga la caché.
 * Panel, cobertura y cola de revisión los calcula el servidor (/api/dashboard/*); aquí solo se guardan.
 * No conoce la sesión: quien carga le dice si es coordinador (load) y quien cierra sesión llama a clear().
 */
import { lugaresApi, retosApi, insigniasApi, usuariosAppApi, equipoApi, ajustesApi, dashboardApi } from "../api/index.js";

// colección de la caché -> endpoints REST de ese recurso
const RECURSOS = { lugares: lugaresApi, retos: retosApi, insignias: insigniasApi };

const vacio = () => ({
  lugares: [], retos: [], insignias: [], usuariosApp: [], usuariosEquipo: [],
  ajustes: { mapbox: {}, territorio: {} },
  stats: { publicados: 0, enRevision: 0, borradores: 0, barriosCubiertos: 0, totalBarrios: 0, metaLugares: 0, completitud: 0 },
  cobertura: [],
  cola: { lugares: [], retos: [], insignias: [] },
});

let db = vacio();
let esCoordinador = false;

// ---- Carga --------------------------------------------------------------
const llenar = (clave) => (filas) => { db[clave] = filas || []; };

// coordinador = true carga además equipo, ajustes y cola de revisión (endpoints solo para ese rol)
function load(coordinador = esCoordinador) {
  esCoordinador = coordinador;
  const jobs = [
    lugaresApi.listar().then(llenar("lugares")),
    retosApi.listar().then(llenar("retos")),
    insigniasApi.listar().then(llenar("insignias")),
    usuariosAppApi.listar().then(llenar("usuariosApp")),
    dashboardApi.stats().then((s) => { if (s) db.stats = s; }),
    dashboardApi.cobertura().then(llenar("cobertura")),
  ];
  if (coordinador) {
    jobs.push(equipoApi.listar().then(llenar("usuariosEquipo")));
    jobs.push(ajustesApi.obtener().then((a) => { if (a) db.ajustes = a; }));
    jobs.push(dashboardApi.colaRevision().then((c) => { if (c) db.cola = c; }));
  }
  return Promise.all(jobs);
}

function clear() { db = vacio(); esCoordinador = false; }

// ---- Lecturas (síncronas, desde caché) ----------------------------------
const all = (coll) => db[coll].slice();
const byId = (coll, id) => db[coll].find((x) => x.id === id) || null;

// ---- Escrituras (Promise; recargan la caché) ----------------------------
// Campos que calcula el servidor: no se envían al guardar.
const SERVER_FIELDS = ["id", "creadoPor", "puntos", "revisorId", "comentarioRevision", "creadoEn", "actualizadoEn", "estado"];

const reload = (res) => load().then(() => res);

// Crea o actualiza (según tenga id). El estado nunca se envía: cambia con enviarRevision/publicar/devolver.
// Excepción: las insignias, cuyo estado (activa/bloqueada) sí es editable.
function save(coll, draft) {
  const body = {};
  Object.keys(draft).forEach((k) => {
    if (SERVER_FIELDS.includes(k) && !(coll === "insignias" && k === "estado")) return;
    body[k] = draft[k];
  });
  const p = draft.id ? RECURSOS[coll].actualizar(draft.id, body) : RECURSOS[coll].crear(body);
  return p.then(reload);
}

const remove = (coll, id) => RECURSOS[coll].borrar(id).then(reload);

// Flujo editorial (lugares, retos; insignias solo publicar/devolver)
const enviarRevision = (coll, id) => RECURSOS[coll].enviarRevision(id).then(reload);
const publicar = (coll, id) => RECURSOS[coll].publicar(id).then(reload);
const devolver = (coll, id, comentario) => RECURSOS[coll].devolver(id, comentario).then(reload);

// Usuarios de la app
const suspender = (id, estado) => usuariosAppApi.suspender(id, estado).then(reload);

// Equipo
const invitar = (nombre, correo, rol) => equipoApi.invitar(nombre, correo, rol).then(reload);
const setRol = (id, rol) => equipoApi.setRol(id, rol).then(reload);
const setActivo = (id, activo) => equipoApi.setActivo(id, activo).then(reload);
const restablecerClave = (id) => equipoApi.restablecerClave(id).then(reload);

// Retos: vista previa de puntos del servidor → { total, desglose: [[label, pts]] }
const puntosPreview = (lugarId, tipo, insigniaId) => retosApi.puntosPreview(lugarId, tipo, insigniaId);

// Ajustes
const getAjustes = () => db.ajustes;
const saveAjustes = (patch) => ajustesApi.guardar(patch).then(reload);

// ---- Dashboard (calculado por el servidor) ------------------------------
const stats = () => db.stats;
const coberturaPorBarrio = () => db.cobertura;
const colaRevision = () => db.cola;   // { lugares, retos, insignias } en revisión

const store = {
  load, clear,
  all, byId,
  save, remove,
  enviarRevision, publicar, devolver,
  suspender,
  invitar, setRol, setActivo, restablecerClave,
  puntosPreview,
  getAjustes, saveAjustes,
  stats, coberturaPorBarrio, colaRevision,
  usuariosEquipo: () => db.usuariosEquipo,
};

export default store;
