"""Servicio de auth: casos de uso. Hace commit una vez al final de cada uno."""
from ...common.security import check_password, hash_password, issue_token
from ...database import commit
from ...domain.errors import NoAutenticado, Prohibido, Validacion
from . import domain
from . import repository as repo


def _public(u):
    return {"id": u["id"], "nombre": u["nombre"], "correo": u["correo"], "rol": u["rol"]}


def _cuenta(user_id):
    u = repo.find_by_id(user_id)
    if not u:
        raise NoAutenticado("La cuenta ya no existe.")
    return u


def login(correo, password):
    u = repo.find_by_correo(correo.strip().lower())
    if not u or not check_password(password, u["passwordHash"]):
        raise NoAutenticado("Correo o contraseña incorrectos.")
    if not u["activo"]:
        raise Prohibido("Cuenta desactivada")
    user = _public(u)
    return {"token": issue_token(user), "user": user, "debeCambiarClave": u["debeCambiarClave"]}


def solicitar_clave(correo):
    """Marca la cuenta para que coordinación la restablezca. Responde igual exista o no (no revela cuentas)."""
    repo.marcar_clave_solicitada(correo.strip().lower())
    commit()
    return {"ok": True}


def me(user_id):
    u = _cuenta(user_id)
    return _public(u), u["debeCambiarClave"]


def cambiar_clave(user_id, actual, nueva):
    u = _cuenta(user_id)
    if not check_password(actual, u["passwordHash"]):
        raise Validacion("La clave actual es incorrecta.", {"campo": "actual"})
    domain.validar_clave_nueva(actual, nueva)
    repo.set_password(user_id, hash_password(nueva))
    commit()
    return {"ok": True}
