/* XPAND · pages/RetosPage.js — retos: lista (#retos) y detalle (#retos/<id>). */
import { h } from "../core/h.js";
import { app } from "../core/app.js";
import store from "../services/store.js";
import { RetosList } from "./retos/RetosList.js";
import { RetoDetail } from "./retos/RetoDetail.js";

export function RetosPage({ param }) {
  if (!param) return h(RetosList);
  if (store.byId("retos", param)) return h(RetoDetail, { id: param });
  app.go("#retos");
  return h("div");
}
