/* XPAND · components/FilterPills.js — botones de filtro (pills). Props: filtros [{id,label}], valor, onChange(id). */
import { h } from "../core/h.js";
import { Component } from "../core/component.js";

export class FilterPills extends Component {
  constructor(props) { super(props); this.state = { valor: props.valor }; }
  render() {
    return h("div", { class: "filters" }, this.props.filtros.map((f) =>
      h("button", { class: ["pill", this.state.valor === f.id && "on"], onClick: () => { this.setState({ valor: f.id }); this.props.onChange(f.id); } }, f.label)));
  }
}
