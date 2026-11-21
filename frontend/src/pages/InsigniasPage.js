/* XPAND · pages/InsigniasPage.js — insignias: lista (#insignias) y detalle (#insignias/<id>). */
import { h } from "../core/h.js";
import { app } from "../core/app.js";
import store from "../services/store.js";
import { InsigniasList } from "./insignias/InsigniasList.js";
import { InsigniaDetail } from "./insignias/InsigniaDetail.js";

export function InsigniasPage({ param }) {
  if (!param) return h(InsigniasList);
  if (store.byId("insignias", param)) return h(InsigniaDetail, { id: param });
  app.go("#insignias");
  return h("div");
}
