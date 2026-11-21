"""DTOs de entrada de equipo."""
from ...common.dto import Dto, Field
from ...domain.roles import ROLES


class InvitarDTO(Dto):
    FIELDS = {"nombre": Field(str, required=True, max_len=120), "correo": Field(str, required=True, max_len=160),
              "rol": Field(str, required=True, enum=ROLES)}


class RolDTO(Dto):
    FIELDS = {"rol": Field(str, required=True, enum=ROLES)}


class EstadoDTO(Dto):
    FIELDS = {"activo": Field(bool, required=True)}
