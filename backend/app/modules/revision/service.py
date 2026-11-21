"""Servicio de revision: registra el historial dentro de la transacción del caso de uso que lo llama."""
from . import repository as repo


def registrar(entidad, entidad_id, accion, usuario_id, comentario=None):
    repo.insert(entidad, entidad_id, accion, usuario_id, comentario)
