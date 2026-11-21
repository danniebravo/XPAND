/* XPAND · utils/nombres.js — nombres de lugar e insignia asociados a un reto. */
import store from "../services/store.js";

export function lugarNombre(id) { const l = id && store.byId("lugares", id); return l ? l.nombre : "Varios lugares"; }
export function insigniaNombre(id) { const i = id && store.byId("insignias", id); return i ? i.nombre : "—"; }
