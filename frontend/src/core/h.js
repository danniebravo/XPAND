/* XPAND · core/h.js
 * Crea elementos DOM con una sintaxis parecida a JSX (sin compilar): h("div", { class: "card" }, hijos…).
 * `tag` puede ser un string ("div"), una función (componente funcional) o una clase que extiende Component.
 * El texto se inserta como nodo de texto, así que se escapa solo (no hace falta esc()).
 */
import { Component } from "./component.js";

const BOOLEANS = new Set(["multiple", "autofocus"]);       // atributos sin valor (el resto va como propiedad)
const AS_PROPERTY = new Set(["value", "checked", "selected", "disabled", "hidden", "required", "readOnly"]);

function aplicarHijo(parent, child) {
  if (child == null || child === false || child === true) return;
  if (Array.isArray(child)) { child.forEach((c) => aplicarHijo(parent, c)); return; }
  parent.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
}

function aplicarProps(el, props) {
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false && !AS_PROPERTY.has(k)) continue;
    if (k === "class" || k === "className") el.className = Array.isArray(v) ? v.filter(Boolean).join(" ") : v;
    else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
    else if (k === "ref") v(el);
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (AS_PROPERTY.has(k)) el[k] = v;
    else if (BOOLEANS.has(k)) el.setAttribute(k, "");
    else el.setAttribute(k, v === true ? "" : v);
  }
}

export function h(tag, props, ...children) {
  if (typeof tag === "function") {
    const p = { ...(props || {}), children };
    if (tag.prototype instanceof Component) return new tag(p).mountedNode();
    return tag(p);                       // componente funcional: (props) => Node
  }
  const el = document.createElement(tag);
  aplicarProps(el, props);
  children.forEach((c) => aplicarHijo(el, c));
  return el;
}
