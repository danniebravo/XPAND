"""Controlador de usuarios_app: solo HTTP. Parsea el DTO, llama al servicio y responde JSON."""
from flask import Blueprint, jsonify, request

from ...common.security import require_auth, require_permission
from . import service
from .dto import EstadoUsuarioDTO

bp = Blueprint("usuarios_app", __name__)


@bp.get("")
@require_auth
@require_permission("ver_usuarios")
def r_list():
    return jsonify(service.listar())


@bp.get("/<id_>")
@require_auth
@require_permission("ver_usuarios")
def r_get(id_):
    return jsonify(service.obtener(id_))


@bp.post("/<id_>/suspender")
@require_auth
@require_permission("suspender_usuario")
def r_suspender(id_):
    estado = EstadoUsuarioDTO.parse(request.get_json(silent=True)).get("estado") or "suspendida"
    return jsonify(service.set_estado(id_, estado))
