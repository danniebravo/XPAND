"""Reglas propias de auth."""
from ...domain.errors import Validacion

LARGO_MINIMO_CLAVE = 8


def validar_clave_nueva(actual, nueva):
    if len(nueva) < LARGO_MINIMO_CLAVE:
        raise Validacion(f"La nueva clave debe tener al menos {LARGO_MINIMO_CLAVE} caracteres.", {"campo": "nueva"})
    if nueva == actual:
        raise Validacion("La nueva clave debe ser distinta de la actual.", {"campo": "nueva"})
