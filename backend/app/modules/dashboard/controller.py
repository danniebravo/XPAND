"""Controlador de dashboard: solo HTTP. Llama al servicio y responde JSON."""
from flask import Blueprint, jsonify

from ...common.security import require_auth, require_permission
from . import service

bp = Blueprint("dashboard", __name__)


@bp.get("/stats")
@require_auth
@require_permission("ver_panel")
def r_stats():
    return jsonify(service.stats())


@bp.get("/cobertura")
@require_auth
@require_permission("ver_panel")
def r_cobertura():
    return jsonify(service.cobertura())


@bp.get("/cola-revision")
@require_auth
@require_permission("ver_revision")
def r_cola():
    return jsonify(service.cola_revision())
