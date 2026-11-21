/* XPAND · components/Logo.js — logo de marca (PNG en img/). `height` en px. */
import { h } from "../core/h.js";

export function Logo({ height = 30, mascota }) {
  const nombre = mascota ? "mascota" : height >= 40 ? "logo-xpand" : "logo-wordmark";
  return h("img", { class: ["logo-img", "logo-" + nombre], src: "img/" + nombre + ".png", alt: "XPAND", style: { height: height + "px" } });
}
