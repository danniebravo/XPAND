/* XPAND · core/app.js
 * Punto de contacto entre las páginas y la aplicación (equivalente a un contexto global):
 *   app.refresh()          vuelve a dibujar la pantalla actual con los datos de la caché
 *   app.go("#lugares", fn) navega (única vía de navegación); `fn` opcional corre cuando la nueva pantalla ya se dibujó
 *   app.pending            acción pendiente para la próxima página (ej. "nuevo-lugar")
 * App.js reemplaza refresh() al arrancar y ejecuta app.despues tras cada cambio de ruta.
 */
export const app = {
  refresh() {},
  go(hash, despues) {
    if (location.hash === hash) { app.refresh(); if (despues) despues(); return; }   // sin cambio de hash no hay evento
    app.despues = despues || null;
    location.hash = hash;
  },
  pending: null,
  despues: null,
};
