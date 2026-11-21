/* XPAND · core/component.js
 * Clase base de los componentes con estado (equivalente a un componente de clase de React):
 *   props       datos que recibe del padre (incluye `children`)
 *   state       estado propio; setState() lo actualiza y vuelve a dibujar SOLO este componente
 *   render()    devuelve un Node (usa h())
 *   onMount()   se llama cuando el componente ya está en el documento
 *   onUnmount() se llama al quitarlo, o cuando un ancestro se vuelve a dibujar y lo descarta
 */
export class Component {
  constructor(props = {}) {
    this.props = props;
    this.state = {};
    this.el = null;
  }

  setState(patch) {
    const cambios = typeof patch === "function" ? patch(this.state) : patch;
    this.state = { ...this.state, ...cambios };
    this.update();
  }

  render() { throw new Error(this.constructor.name + " debe implementar render()"); }

  /** Vuelve a dibujar y reemplaza el nodo anterior en el DOM. */
  update() {
    this.desmontarHijos();
    const nuevo = this.render();
    nuevo._component = this;
    if (this.el && this.el.parentNode) this.el.replaceWith(nuevo);
    this.el = nuevo;
    if (this.onUpdate) this.onUpdate();
  }

  /** Dibuja el componente y programa onMount para cuando ya esté insertado. */
  mountedNode() {
    this.el = this.render();
    this.el._component = this;
    if (this.onMount) queueMicrotask(() => this.onMount());
    return this.el;
  }

  /** Avisa (onUnmount) a los componentes hijos que están por descartarse, para que quiten sus listeners. */
  desmontarHijos() {
    if (!this.el) return;
    this.el.querySelectorAll("*").forEach((n) => {
      const c = n._component;
      if (c && c !== this && c.onUnmount) c.onUnmount();
    });
  }

  unmount() {
    this.desmontarHijos();
    if (this.onUnmount) this.onUnmount();
    if (this.el) this.el.remove();
  }
}

/** Monta un componente en un contenedor, reemplazando su contenido. Devuelve la instancia. */
export function mount(contenedor, Comp, props) {
  const comp = new Comp(props);
  contenedor.replaceChildren(comp.mountedNode());
  return comp;
}
