/* XPAND · main.js — punto de entrada: monta el componente raíz en #root. */
import { mount } from "./core/component.js";
import { App } from "./App.js";

mount(document.getElementById("root"), App);
