/* XPAND · components/FormError.js — caja de error de un formulario; se actualiza sin redibujar el formulario.
 * Uso: const err = h(FormError); err._component.show("mensaje") (cadena vacía la limpia).
 */
import { h } from "../core/h.js";
import { Component } from "../core/component.js";
import { Alert } from "./Alert.js";

export class FormError extends Component {
  constructor(props) { super(props); this.state = { msg: "" }; }
  show(msg) { this.setState({ msg }); }
  onUpdate() { if (this.state.msg) this.el.scrollIntoView({ block: "nearest" }); }
  render() {
    const { msg } = this.state;
    return h("div", null, msg ? h(Alert, { tono: "error", role: "alert" }, h("span", null, msg)) : null);
  }
}
