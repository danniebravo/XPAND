"""Validación de dominio reutilizable."""
from .errors import Validacion


def exigir(datos, campos):
    """Lanza Validacion si algún campo falta o está vacío."""
    faltan = [c for c in campos if datos.get(c) is None or (isinstance(datos[c], str) and not datos[c].strip())]
    if faltan:
        raise Validacion("Faltan campos obligatorios.", {"campos": faltan})
