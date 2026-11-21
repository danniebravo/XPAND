/* XPAND · pages/LugaresPage.js — Lugares: lista / mapa, o detalle en página si llega `param` (#lugares/<id>). */
import { h } from "../core/h.js";
import { LugaresList } from "./lugares/LugaresList.js";
import { LugarDetail } from "./lugares/LugarDetail.js";

export function LugaresPage({ param }) {
  return param ? h(LugarDetail, { id: param }) : h(LugaresList);
}
