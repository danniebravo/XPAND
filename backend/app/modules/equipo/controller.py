"""Controlador de equipo: solo HTTP. Parsea el DTO, llama al servicio y responde JSON."""
from flask import Blueprint, g, jsonify, request

from ...common.security import require_auth, require_permission
from . import service
from .dto import EstadoDTO, InvitarDTO, RolDTO

bp = Blueprint("equipo", __name__)


def _body():
    return request.get_json(silent=True)


@bp.get("")
@require_auth
@require_permission("ver_equipo")
def r_list():
    return jsonify(service.listar())


@bp.post("")
@require_auth
@require_permission("gestionar_roles")
def r_invitar():
    return jsonify(service.invitar(InvitarDTO.parse(_body()))), 201


@bp.put("/<id_>/rol")
@require_auth
@require_permission("gestionar_roles")
def r_set_rol(id_):
    return jsonify(service.set_rol(id_, RolDTO.parse(_body())["rol"], g.user))


@bp.post("/<id_>/restablecer-clave")
@require_auth
@require_permission("gestionar_roles")
def r_restablecer(id_):
    return jsonify(service.restablecer_clave(id_, g.user))


@bp.put("/<id_>/estado")
@require_auth
@require_permission("gestionar_roles")
def r_estado(id_):
    return jsonify(service.set_estado(id_, EstadoDTO.parse(_body())["activo"], g.user))
