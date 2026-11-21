"""Controlador de auth: solo HTTP. Parsea el DTO, llama al servicio y responde JSON."""
from flask import Blueprint, g, jsonify, request

from ...common.security import require_auth
from . import service
from .dto import CambiarClaveDTO, LoginDTO, SolicitarClaveDTO

bp = Blueprint("auth", __name__)


def _body():
    return request.get_json(silent=True)


@bp.post("/login")
def r_login():
    d = LoginDTO.parse(_body())
    return jsonify(service.login(d["correo"], d["password"]))


@bp.post("/solicitar-clave")
def r_solicitar_clave():
    return jsonify(service.solicitar_clave(SolicitarClaveDTO.parse(_body())["correo"]))


@bp.get("/me")
@require_auth
def r_me():
    user, debe = service.me(g.user["id"])
    return jsonify({"user": user, "debeCambiarClave": debe})


@bp.post("/cambiar-clave")
@require_auth
def r_cambiar_clave():
    d = CambiarClaveDTO.parse(_body())
    return jsonify(service.cambiar_clave(g.user["id"], d["actual"], d["nueva"]))


@bp.post("/logout")
@require_auth
def r_logout():
    return "", 204
