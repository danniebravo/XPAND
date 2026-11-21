"""Controlador de ajustes: solo HTTP. Parsea el DTO, llama al servicio y responde JSON."""
from flask import Blueprint, jsonify, request

from ...common.security import require_auth, require_permission
from . import service
from .dto import AjustesDTO

bp = Blueprint("ajustes", __name__)


@bp.get("")
@require_auth
@require_permission("ver_ajustes")
def r_get():
    return jsonify(service.get())


@bp.put("")
@require_auth
@require_permission("editar_ajustes")
def r_save():
    return jsonify(service.save(AjustesDTO.parse(request.get_json(silent=True))))
