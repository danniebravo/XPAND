/* XPAND · components/Icon.js — íconos SVG de línea (heredan el color del texto). */
const TRAZOS = {
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  delete: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M10.8 12.2 20 3"/><path d="M16 7l3 3"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
};

export function Icon({ name }) {
  const wrap = document.createElement("span");
  wrap.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (TRAZOS[name] || "") + "</svg>";
  return wrap.firstChild;
}
