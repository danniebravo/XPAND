"""DTOs de entrada de ajustes. Los valores de puntos se validan aquí (tipo y rango); lo desconocido se descarta."""
from ...common.dto import Dto, Field
from ...domain.catalogo import TIPOS_RETO
from .domain import LIMITE_BONO, LIMITE_UMBRAL


class BonoTipoDTO(Dto):
    FIELDS = {t: Field(int, min=LIMITE_BONO[0], max=LIMITE_BONO[1]) for t in TIPOS_RETO}


class PuntosDTO(Dto):
    FIELDS = {
        "base": Field(int, min=LIMITE_BONO[0], max=LIMITE_BONO[1]),
        "bonoBarrio": Field(int, min=LIMITE_BONO[0], max=LIMITE_BONO[1]),
        "bonoCategoria": Field(int, min=LIMITE_BONO[0], max=LIMITE_BONO[1]),
        "umbralBarrio": Field(int, min=LIMITE_UMBRAL[0], max=LIMITE_UMBRAL[1]),
        "umbralCategoria": Field(int, min=LIMITE_UMBRAL[0], max=LIMITE_UMBRAL[1]),
        "bonoTipo": Field(dict),
    }

    @classmethod
    def parse(cls, data, partial=True):
        out = {k: v for k, v in super().parse(data, partial=True).items() if v is not None}
        if "bonoTipo" in out:
            out["bonoTipo"] = {k: v for k, v in BonoTipoDTO.parse(out["bonoTipo"], partial=True).items() if v is not None}
        return out


class TerritorioDTO(Dto):
    FIELDS = {"metaLugares": Field(int, min=1, max=500)}


class AjustesDTO(Dto):
    FIELDS = {"mapbox": Field(dict), "territorio": Field(dict), "puntos": Field(dict)}

    @classmethod
    def parse(cls, data, partial=True):
        out = super().parse(data, partial=True)
        if "puntos" in out:
            out["puntos"] = PuntosDTO.parse(out["puntos"])
        if "territorio" in out:
            validados = {k: v for k, v in TerritorioDTO.parse(out["territorio"]).items() if v is not None}
            out["territorio"] = {**{k: v for k, v in out["territorio"].items() if k not in TerritorioDTO.FIELDS}, **validados}
        return out
