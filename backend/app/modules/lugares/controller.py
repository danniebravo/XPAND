"""Controlador de lugares: solo HTTP. Parsea el DTO, llama al servicio y responde JSON."""
from flask import Blueprint, g, jsonify, request

from ...common.dto import DevolverDTO
from ...common.security import require_auth, require_permission
from . import service
from .dto import LugarDTO

bp = Blueprint("lugares", __name__)


def _body():
    return request.get_json(silent=True)


@bp.get("")
@require_auth
@require_permission("ver_lugares")
def r_list():
    return jsonify(service.listar())


@bp.get("/<id_>")
@require_auth
@require_permission("ver_lugares")
def r_get(id_):
    return jsonify(service.obtener(id_))


@bp.post("")
@require_auth
@require_permission("crear")
def r_create():
    return jsonify(service.create(LugarDTO.parse(_body()), g.user)), 201


@bp.put("/<id_>")
@require_auth
@require_permission("editar")
def r_update(id_):
    return jsonify(service.update(id_, LugarDTO.parse(_body(), partial=True)))


@bp.delete("/<id_>")
@require_auth
@require_permission("borrar")
def r_delete(id_):
    service.delete(id_)
    return "", 204


@bp.post("/<id_>/enviar-revision")
@require_auth
@require_permission("enviar_revision")
def r_enviar(id_):
    return jsonify(service.enviar_revision(id_, g.user))


@bp.post("/<id_>/publicar")
@require_auth
@require_permission("publicar")
def r_publicar(id_):
    return jsonify(service.publicar(id_, g.user))


@bp.post("/<id_>/devolver")
@require_auth
@require_permission("devolver")
def r_devolver(id_):
    return jsonify(service.devolver(id_, DevolverDTO.parse(_body())["comentario"], g.user))
