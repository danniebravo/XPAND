"""Seguridad: hash de claves (bcrypt), JWT y decoradores de autenticación/permiso."""
import secrets
from datetime import datetime, timedelta, timezone
from functools import wraps

import bcrypt
import jwt
from flask import g, request

from ..config import config
from ..domain.roles import can
from .errors import ApiError


def hash_password(clave):
    return bcrypt.hashpw(clave.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def check_password(clave, hash_):
    return bcrypt.checkpw(str(clave).encode("utf-8"), hash_.encode("utf-8"))


def clave_temporal():
    return secrets.token_urlsafe(9)


def issue_token(user):
    now = datetime.now(timezone.utc)
    payload = {"sub": user["id"], "nombre": user["nombre"], "correo": user["correo"], "rol": user["rol"],
               "iat": now, "exp": now + timedelta(hours=config.JWT_EXPIRES_HOURS)}
    return jwt.encode(payload, config.JWT_SECRET, algorithm="HS256")


def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        parts = request.headers.get("Authorization", "").split(" ")
        if len(parts) != 2 or parts[0] != "Bearer" or not parts[1]:
            raise ApiError.unauthorized("Falta el token de autenticación.")
        try:
            p = jwt.decode(parts[1], config.JWT_SECRET, algorithms=["HS256"])
        except jwt.PyJWTError:
            raise ApiError.unauthorized("Token inválido o expirado.")
        g.user = {"id": p.get("sub"), "nombre": p.get("nombre"), "correo": p.get("correo"), "rol": p.get("rol")}
        return fn(*args, **kwargs)
    return wrapper


def require_permission(accion):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user = getattr(g, "user", None)
            if not user:
                raise ApiError.unauthorized()
            if not can(user["rol"], accion):
                raise ApiError.forbidden(f"Tu rol ({user['rol']}) no puede: {accion}.")
            return fn(*args, **kwargs)
        return wrapper
    return decorator
