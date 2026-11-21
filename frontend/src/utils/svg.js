/* XPAND · utils/svg.js — h() crea elementos HTML; el SVG necesita su propio espacio de nombres. */
const NS = "http://www.w3.org/2000/svg";

export function svg(tag, attrs, ...hijos) {
  const el = document.createElementNS(NS, tag);
  Object.entries(attrs || {}).forEach(([k, v]) => el.setAttribute(k, v));
  hijos.forEach((c) => c && el.appendChild(c));
  return el;
}
