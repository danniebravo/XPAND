"""DTOs de entrada de auth."""
from ...common.dto import Dto, Field


class LoginDTO(Dto):
    FIELDS = {"correo": Field(str, required=True), "password": Field(str, required=True, strip=False)}


class CambiarClaveDTO(Dto):
    FIELDS = {"actual": Field(str, required=True, strip=False), "nueva": Field(str, required=True, strip=False)}


class SolicitarClaveDTO(Dto):
    FIELDS = {"correo": Field(str, required=True)}
