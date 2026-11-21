"""DTOs de entrada de lugares."""
from ...common.dto import Dto, Field
from ...domain.catalogo import BARRIOS, CATEGORIAS


class LugarDTO(Dto):
    FIELDS = {"nombre": Field(str, required=True, max_len=120), "categoria": Field(str, enum=CATEGORIAS),
              "barrio": Field(str, enum=BARRIOS), "costo": Field(int, min=0), "costoDesde": Field(bool),
              "duracion": Field(str, max_len=40), "descripcion": Field(str, max_len=200),
              "direccion": Field(str, max_len=200), "coords": Field(str, max_len=60),
              "horario": Field(str, max_len=160), "reserva": Field(str, max_len=10),
              "fuente": Field(str, max_len=160)}
