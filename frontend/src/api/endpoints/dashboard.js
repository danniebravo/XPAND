/* XPAND · api/endpoints/dashboard.js — /api/dashboard */
import api from "../client.js";

export default {
  stats: () => api("GET", "/dashboard/stats"),
  cobertura: () => api("GET", "/dashboard/cobertura"),
  colaRevision: () => api("GET", "/dashboard/cola-revision"),
};
