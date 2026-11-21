"""Reglas propias de equipo: protección de la propia cuenta y del último coordinador."""
from ...domain.errors import ReglaNegocio


def validar_restablecer(actor_id, id_):
    if actor_id == id_:
        raise ReglaNegocio("No puedes restablecer tu propia clave; usa cambiar clave.")


def validar_desactivar(actor_id, miembro, coordinadores_activos):
    if actor_id == miembro["id"]:
        raise ReglaNegocio("No puedes desactivar tu propia cuenta.")
    if miembro["rol"] == "coordinador" and miembro["activo"] and coordinadores_activos <= 1:
        raise ReglaNegocio("Debe quedar al menos un coordinador activo en el equipo.")


def validar_cambio_rol(actor_id, miembro, rol_nuevo, coordinadores_activos):
    if actor_id == miembro["id"]:
        raise ReglaNegocio("No puedes cambiar tu propio rol.")
    if miembro["rol"] == "coordinador" and rol_nuevo != "coordinador" and coordinadores_activos <= 1:
        raise ReglaNegocio("Debe quedar al menos un coordinador en el equipo.")
