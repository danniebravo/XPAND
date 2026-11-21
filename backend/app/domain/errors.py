"""Errores de dominio. No llevan códigos HTTP: common/errors.py los traduce."""


class DomainError(Exception):
    def __init__(self, message, details=None):
        super().__init__(message)
        self.message = message
        self.details = details


class NotFound(DomainError):
    """El recurso pedido no existe."""


class ReglaNegocio(DomainError):
    """Conflicto con una regla de negocio (duplicado, transición de estado inválida, último coordinador…)."""


class Validacion(DomainError):
    """Datos de entrada inválidos."""


class NoAutenticado(DomainError):
    """Credenciales o cuenta inválidas."""


class Prohibido(DomainError):
    """La cuenta no puede realizar la acción."""
