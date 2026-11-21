"""Traducción de errores a HTTP: DomainError -> código, IntegrityError (SQLAlchemy) -> 409, resto -> 500."""
from flask import jsonify
from sqlalchemy.exc import IntegrityError
from werkzeug.exceptions import HTTPException

from ..domain.errors import DomainError, NoAutenticado, NotFound, Prohibido, ReglaNegocio, Validacion

# (clase, status, code)
_HTTP = ((NotFound, 404, "not_found"), (Validacion, 422, "validation"), (ReglaNegocio, 409, "conflict"),
         (NoAutenticado, 401, "unauthorized"), (Prohibido, 403, "forbidden"))


class ApiError(Exception):
    """Error de la capa HTTP (token ausente, ruta inexistente). Los servicios lanzan DomainError, no esto."""

    def __init__(self, status, code, message):
        super().__init__(message)
        self.status, self.code, self.message = status, code, message

    @staticmethod
    def unauthorized(message="No autenticado"):
        return ApiError(401, "unauthorized", message)

    @staticmethod
    def forbidden(message="Sin permiso para esta acción"):
        return ApiError(403, "forbidden", message)

    @staticmethod
    def not_found(message="Recurso no encontrado"):
        return ApiError(404, "not_found", message)


def _body(code, message, details=None):
    body = {"code": code, "message": message}
    if details is not None:
        body["details"] = details
    return jsonify({"error": body})


def register_error_handlers(app):
    @app.errorhandler(DomainError)
    def _domain(err):
        for clase, status, code in _HTTP:
            if isinstance(err, clase):
                return _body(code, err.message, err.details), status
        return _body("internal", err.message), 500

    @app.errorhandler(ApiError)
    def _api(err):
        return _body(err.code, err.message), err.status

    @app.errorhandler(IntegrityError)
    def _integridad(err):
        return _body("conflict", "Conflicto de integridad en la base de datos (dato duplicado o referencia inválida)."), 409

    @app.errorhandler(404)
    def _404(err):
        return _body("not_found", "Ruta no encontrada."), 404

    @app.errorhandler(Exception)
    def _unexpected(err):
        if isinstance(err, HTTPException):
            return _body(err.name.lower().replace(" ", "_"), err.description), err.code
        app.logger.exception("Error no controlado")
        return _body("internal", "Error interno del servidor."), 500
