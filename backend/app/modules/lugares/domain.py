"""Reglas propias de lugares."""
from ...domain.catalogo import BARRIOS, CATEGORIAS, dentro_comuna10
from ...domain.errors import Validacion
from ...domain.validacion import exigir


def validar_para_revision(lugar):
    """Un lugar solo pasa a revisión (o se publica) si tiene los datos mínimos y está dentro de la Comuna 10."""
    exigir(lugar, ["nombre", "categoria", "barrio", "descripcion", "direccion", "coords"])
    if lugar["categoria"] not in CATEGORIAS:
        raise Validacion('Valor inválido para "categoria".', {"campo": "categoria", "permitidos": CATEGORIAS})
    if lugar["barrio"] not in BARRIOS:
        raise Validacion('Valor inválido para "barrio".', {"campo": "barrio", "permitidos": BARRIOS})
    if not dentro_comuna10(lugar["coords"]):
        raise Validacion("Las coordenadas están fuera de la Comuna 10 (La Candelaria).", {"campo": "coords"})
