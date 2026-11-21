"""DTOs de entrada de insignias. No aceptan `estado`: solo cambia con enviar-revision / publicar / devolver."""
from ...common.dto import Dto, Field


class InsigniaDTO(Dto):
    FIELDS = {"nombre": Field(str, required=True, max_len=120), "condicion": Field(str, max_len=200),
              "requisito": Field(str, max_len=60), "xp": Field(int, min=0, max=500)}
