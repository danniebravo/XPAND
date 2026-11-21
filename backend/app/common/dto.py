"""DTOs de entrada: definen la FORMA válida del JSON de cada endpoint.

Cada DTO declara sus campos con `Field`; `Dto.parse()` valida tipo, obligatoriedad, enum y rango y devuelve un dict
limpio solo con los campos recibidos (lo desconocido se descarta). Las reglas de NEGOCIO viven en servicio/dominio.
"""
from ..domain.errors import Validacion


def _entero(valor, campo):
    if isinstance(valor, bool) or (isinstance(valor, float) and not valor.is_integer()):
        raise Validacion(f'"{campo}" debe ser un número entero.', {"campo": campo})
    try:
        return int(valor)
    except (TypeError, ValueError):
        raise Validacion(f'"{campo}" debe ser un número entero.', {"campo": campo})


class Field:
    def __init__(self, tipo=None, required=False, enum=None, max_len=None, min=None, max=None, strip=True):
        self.tipo, self.required, self.enum = tipo, required, enum
        self.max_len, self.min, self.max, self.strip = max_len, min, max, strip

    def _falta(self, nombre):
        raise Validacion("Faltan campos obligatorios.", {"campos": [nombre]})

    def clean(self, nombre, v):
        t = self.tipo
        if t is int:
            if v is None or v == "":
                return self._falta(nombre) if self.required else None
            n = _entero(v, nombre)
            if (self.min is not None and n < self.min) or (self.max is not None and n > self.max):
                rango = f"entre {self.min} y {self.max}" if self.max is not None else f"como mínimo {self.min}"
                raise Validacion(f'"{nombre}" debe estar {rango}.', {"campo": nombre})
            return n
        if t is bool:
            if not isinstance(v, bool):
                raise Validacion(f'"{nombre}" debe ser true o false.', {"campo": nombre})
            return v
        if t is dict:
            if not isinstance(v, dict):
                raise Validacion(f'"{nombre}" debe ser un objeto.', {"campo": nombre})
            return v
        if t is str and v is not None and not isinstance(v, str):
            raise Validacion(f'"{nombre}" debe ser texto.', {"campo": nombre})
        if isinstance(v, str) and self.strip:
            v = v.strip()
        if v is None or v == "":
            if self.required:
                self._falta(nombre)
            return v
        if self.max_len and isinstance(v, str) and len(v) > self.max_len:
            raise Validacion(f'"{nombre}" supera el máximo de {self.max_len} caracteres.',
                             {"campo": nombre, "max": self.max_len})
        if self.enum is not None and v not in self.enum:
            raise Validacion(f'Valor inválido para "{nombre}".', {"campo": nombre, "permitidos": list(self.enum)})
        return v


class Dto:
    FIELDS = {}

    @classmethod
    def parse(cls, data, partial=False):
        """partial=True (PUT/PATCH): solo valida lo recibido; False: exige los campos `required`."""
        if data is None:
            data = {}
        if not isinstance(data, dict):
            raise Validacion("El cuerpo de la petición debe ser un objeto JSON.")
        out, faltan = {}, []
        for nombre, campo in cls.FIELDS.items():
            if nombre in data:
                out[nombre] = campo.clean(nombre, data[nombre])
            elif campo.required and not partial:
                faltan.append(nombre)
        if faltan:
            raise Validacion("Faltan campos obligatorios.", {"campos": faltan})
        return out


class DevolverDTO(Dto):
    """Cuerpo de POST …/devolver (lugares, retos, insignias)."""
    FIELDS = {"comentario": Field(str, required=True, max_len=500)}
