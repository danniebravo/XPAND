"""DTOs de entrada de usuarios_app."""
from ...common.dto import Dto, Field
from ...domain.estados import ESTADOS_USUARIO_APP


class EstadoUsuarioDTO(Dto):
    FIELDS = {"estado": Field(str, enum=ESTADOS_USUARIO_APP)}
