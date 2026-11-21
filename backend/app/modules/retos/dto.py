"""DTOs de entrada de retos."""
from ...common.dto import Dto, Field
from ...domain.catalogo import TIPOS_RETO


class RetoDTO(Dto):
    FIELDS = {"titulo": Field(str, required=True, max_len=160), "lugarId": Field(str, max_len=40),
              "instruccion": Field(str), "tipo": Field(str, enum=TIPOS_RETO), "insigniaId": Field(str, max_len=40)}
