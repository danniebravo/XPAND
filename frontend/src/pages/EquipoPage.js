/* XPAND · pages/EquipoPage.js — gestión del equipo (solo coordinador): lista, detalle #equipo/<id> y acciones. */
import { h } from "../core/h.js";
import { app } from "../core/app.js";
import auth from "../services/auth.js";
import store from "../services/store.js";
import { Button, Chip, closeAll, closeModal, confirmDialog, DataTable, DetailField, DetailHeader, estadoLabel, fail, Field, openModal, PageHeader, Select, toast } from "../components/index.js";
import { rolLabel } from "../utils/roles.js";

const ROLES = [{ v: "editor", t: "Editor" }, { v: "coordinador", t: "Coordinador" }];
function fecha(s) {
  const d = s ? new Date(s) : null;
  return d && !isNaN(d) ? d.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" }) : "—";
}

// ---- Clave temporal (invitar y restablecer): se muestra una sola vez -----
function mostrarClave(titulo, clave) {
  const code = h("code", null, clave);
  const copiar = () => {
    const ok = () => toast("Clave copiada");
    const seleccionar = () => {
      const r = document.createRange(); r.selectNodeContents(code);
      const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      try { if (document.execCommand("copy")) return ok(); } catch (e) { /* cae al aviso */ }
      toast("Selecciona y copia la clave");
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(clave).then(ok, seleccionar); else seleccionar();
  };
  // Sin ✕, Esc ni clic afuera: la clave solo se cierra con "Listo".
  openModal(
    h("div", { class: "modal-body" },
      h("h3", { class: "modal-title" }, titulo),
      h("div", { class: "clave-box" }, code, h(Button, { variant: "ghost", onClick: copiar }, "Copiar")),
      h("p", { class: "muted small" }, "Compártela por un canal privado. Se pedirá cambiarla al ingresar. No volverás a verla."),
      h("div", { class: "modal-actions" }, h(Button, { onClick: () => { closeAll(); app.refresh(); } }, "Listo"))),
    { size: "modal-sm", dismissable: false, ocultarX: true });
}

// ---- Invitar ------------------------------------------------------------
function invitar() {
  const nom = h("input", { id: "inv-nom", autocomplete: "off" });
  const mail = h("input", { id: "inv-mail", type: "email", autocomplete: "off" });
  const rol = h(Select, { id: "inv-rol", options: ROLES, value: "editor" });
  const salir = () => {
    if (nom.value.trim() || mail.value.trim()) {
      confirmDialog("¿Descartar los cambios?", () => closeAll(), "Descartar", { detalle: "Se perderá lo que escribiste.", cancelLabel: "Seguir editando" });
    } else closeModal();
  };
  const crear = h(Button, {
    onClick: () => {
      const n = nom.value.trim(), m = mail.value.trim();
      if (!n) { toast("Escribe el nombre"); return; }
      if (m.indexOf("@") < 1 || m.lastIndexOf(".") < m.indexOf("@")) { toast("Escribe un correo válido"); return; }
      crear.disabled = true;
      store.invitar(n, m, rol.value).then((r) => mostrarClave("Cuenta creada", r.claveTemporal))
        .catch((e) => { crear.disabled = false; fail(e); });
    },
  }, "Crear cuenta");
  openModal(
    h("div", { class: "modal-body" },
      h("h3", { class: "modal-title" }, "Invitar al equipo"),
      h(Field, { label: "Nombre" }, nom),
      h(Field, { label: "Correo" }, mail),
      h(Field, { label: "Rol" }, rol),
      h("div", { class: "modal-actions" }, h(Button, { variant: "ghost", onClick: salir }, "Cancelar"), crear)),
    { size: "modal-md", onDismiss: salir });
}

// ---- Cambiar rol --------------------------------------------------------
function cambiarRol(m) {
  const rol = h(Select, { id: "rol", options: ROLES, value: m.rol });
  const guardar = () => {
    if (rol.value === m.rol) { closeModal(); return; }
    confirmDialog("¿Cambiar el rol de " + m.nombre + " a " + rolLabel(rol.value) + "?", () => {
      store.setRol(m.id, rol.value).then(() => { closeAll(); toast("Rol actualizado"); app.refresh(); }).catch(fail);
    }, "Cambiar rol", { tono: "primary" });
  };
  openModal(
    h("div", { class: "modal-body" },
      h("h3", { class: "modal-title" }, "Cambiar rol"),
      h(Field, { label: "Rol de " + m.nombre, class: "mt" }, rol),
      h("div", { class: "modal-actions" }, h(Button, { variant: "ghost", onClick: closeModal }, "Cancelar"), h(Button, { onClick: guardar }, "Guardar"))),
    { size: "modal-sm" });
}

// ---- Lista --------------------------------------------------------------
function ListaEquipo() {
  const equipo = store.usuariosEquipo();
  const columnas = [
    { label: "Nombre", class: "td-strong", key: "nombre" },
    { label: "Rol", render: (m) => h(Chip, { tono: "cat" }, rolLabel(m.rol)) },
    { label: "Estado", render: (m) => [h(Chip, { estado: m.activo ? "activo" : "desactivado" }),
      m.claveSolicitada ? [" ", h(Chip, { tono: "amarillo" }, "Pidió nueva clave")] : null] },
    { label: "", class: "td-action", render: (m) => h("a", { class: "link-detail", href: "#equipo/" + encodeURIComponent(m.id) }, "Ver detalle ›") },
  ];
  return h("div", null,
    h(PageHeader, { title: "Equipo", sub: equipo.length + (equipo.length === 1 ? " persona" : " personas") },
      auth.can("gestionar_roles") ? h(Button, { id: "invitar", onClick: invitar }, "+ Invitar") : null),
    h("div", { class: "pad" },
      h(DataTable, { columns: columnas, rows: equipo, onRowClick: (m) => app.go("#equipo/" + encodeURIComponent(m.id)) })));
}

// ---- Detalle ------------------------------------------------------------
function restablecer(m) {
  confirmDialog("¿Restablecer la contraseña de " + m.nombre + "?", () => {
    store.restablecerClave(m.id).then((r) => mostrarClave("Contraseña restablecida", r.claveTemporal)).catch(fail);
  }, "Restablecer", { tono: "primary", detalle: "Se generará una clave temporal y la actual dejará de servir." });
}

function cambiarActivo(m) {
  const des = m.activo;
  confirmDialog(des ? "¿Suspender la cuenta de " + m.nombre + "?" : "¿Activar la cuenta de " + m.nombre + "?", () => {
    store.setActivo(m.id, !des).then(() => { toast(des ? "Cuenta suspendida" : "Cuenta activada"); app.refresh(); }).catch(fail);
  }, des ? "Suspender" : "Activar", des ? { detalle: "No podrá ingresar al panel hasta que la reactives." } : { tono: "primary" });
}

function AccionesMiembro({ m }) {
  if (!auth.can("gestionar_roles")) return null;
  if (auth.user() && auth.user().id === m.id) return h("p", { class: "muted small mt" }, "Esta es tu cuenta.");
  return h("div", { class: "detail-actions" },
    h(Button, { variant: "ghost", onClick: () => cambiarRol(m) }, "Cambiar rol"),
    h(Button, { variant: "ghost", onClick: () => restablecer(m) }, "Restablecer contraseña"),
    m.activo
      ? h(Button, { variant: "danger-ghost", onClick: () => cambiarActivo(m) }, "Suspender")
      : h(Button, { onClick: () => cambiarActivo(m) }, "Activar"));
}

function DetalleMiembro({ m }) {
  const estado = m.activo ? "activo" : "desactivado";
  return h("div", { class: "pad" },
    h(DetailHeader, { volverHash: "#equipo", volverLabel: "Equipo", titulo: m.nombre, sub: rolLabel(m.rol), estado }),
    h("div", { class: "detail-card" },
      h("div", { class: "detail-grid" },
        h(DetailField, { k: "Correo", v: m.correo }), h(DetailField, { k: "Rol", v: rolLabel(m.rol) }),
        h(DetailField, { k: "Estado", v: estadoLabel(estado) }), h(DetailField, { k: "Miembro desde", v: fecha(m.creadoEn) })),
      h(AccionesMiembro, { m })));
}

export function EquipoPage({ param }) {
  if (!auth.can("ver_equipo")) { app.go("#panel"); return h("div"); }
  if (!param) return h(ListaEquipo);
  const m = store.byId("usuariosEquipo", param);
  if (!m) { app.go("#equipo"); return h("div"); }
  return h(DetalleMiembro, { m });
}
