/* XPAND · components/Field.js — campos de formulario: Field (etiqueta + ayuda) y Select. */
import { h } from "../core/h.js";

export function Field({ label, help, class: extra, children }) {
  return h("label", { class: ["field", extra] },
    h("span", null, label),
    children,
    help ? h("small", { class: "fhelp" }, help) : null);
}

/** options: [{ v, t }]; placeholder agrega una primera opción vacía. */
export function Select({ options = [], value, placeholder, children, ...resto }) {
  const sel = h("select", resto,
    placeholder != null ? h("option", { value: "" }, placeholder) : null,
    options.map((o) => h("option", { value: o.v }, o.t)));
  sel.value = value == null ? "" : value;
  return sel;
}
