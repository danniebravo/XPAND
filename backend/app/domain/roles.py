"""Roles del equipo y matriz de permisos."""
ROLES = ["coordinador", "editor"]

_COMPARTIDAS = {
    "ver_panel", "ver_lugares", "ver_retos", "ver_insignias", "ver_usuarios",
    "crear", "editar", "borrar", "enviar_revision",
}
_SOLO_COORDINADOR = {
    "publicar", "devolver", "ver_revision", "ver_equipo",
    "gestionar_roles", "ver_ajustes", "editar_ajustes", "suspender_usuario",
}
_PERMISOS = {"editor": _COMPARTIDAS, "coordinador": _COMPARTIDAS | _SOLO_COORDINADOR}


def can(rol, accion):
    return accion in _PERMISOS.get(rol, set())
