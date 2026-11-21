/* XPAND · router/routes.js — tabla de rutas: id de la URL (#lugares) → página, permiso y datos del menú (el orden es el del menú). */
import { PanelPage } from "../pages/PanelPage.js";
import { LugaresPage } from "../pages/LugaresPage.js";
import { RetosPage } from "../pages/RetosPage.js";
import { InsigniasPage } from "../pages/InsigniasPage.js";
import { RevisionPage } from "../pages/RevisionPage.js";
import { UsuariosPage } from "../pages/UsuariosPage.js";
import { EquipoPage } from "../pages/EquipoPage.js";
import { AjustesPage } from "../pages/AjustesPage.js";

export const ROUTES = {
  panel: { Page: PanelPage, permiso: "ver_panel", label: "Panel", icon: "▦" },
  lugares: { Page: LugaresPage, permiso: "ver_lugares", label: "Lugares", icon: "◎" },
  retos: { Page: RetosPage, permiso: "ver_retos", label: "Retos", icon: "⚑" },
  insignias: { Page: InsigniasPage, permiso: "ver_insignias", label: "Insignias", icon: "❉" },
  revision: { Page: RevisionPage, permiso: "ver_revision", label: "Revisión", icon: "✉", badge: true },
  usuarios: { Page: UsuariosPage, permiso: "ver_usuarios", label: "Usuarios", icon: "☺" },
  equipo: { Page: EquipoPage, permiso: "ver_equipo", label: "Equipo", icon: "⛊" },
  ajustes: { Page: AjustesPage, permiso: "ver_ajustes", label: "Ajustes", icon: "⚙" },
};
