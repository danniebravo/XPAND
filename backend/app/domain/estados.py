"""Estados de cada entidad y el flujo de publicación compartido por lugares, retos e insignias:
borrador -> en_revision -> (publicado | devuelto)."""
from .errors import ReglaNegocio

EN_REVISION = "en_revision"
ESTADOS_LUGAR = ("publicado", "en_revision", "borrador", "incompleto")
ESTADOS_RETO = ("activo", "en_revision", "borrador")
ESTADOS_INSIGNIA = ("activa", "bloqueada", "en_revision", "borrador")
ESTADOS_USUARIO_APP = ("activa", "sin_actividad", "suspendida")
ENTIDADES_REVISION = ("lugar", "reto", "insignia")
ACCIONES_REVISION = ("enviar_revision", "publicar", "devolver")


class Flujo:
    """Transiciones válidas de una entidad. Cada método devuelve el estado destino o lanza ReglaNegocio."""

    def __init__(self, uno, varios, publicado, desde_envio=("borrador",), devuelto="borrador"):
        self.uno, self.varios, self.publicado = uno, varios, publicado
        self.desde_envio, self.devuelto = desde_envio, devuelto

    def enviar(self, actual):
        if actual not in self.desde_envio:
            raise ReglaNegocio(f'{self.uno.capitalize()} en estado "{actual}" no se puede enviar a revisión.')
        return EN_REVISION

    def publicar(self, actual):
        self._exigir_revision(actual, "publican")
        return self.publicado

    def devolver(self, actual):
        self._exigir_revision(actual, "devuelven")
        return self.devuelto

    def _exigir_revision(self, actual, verbo):
        if actual != EN_REVISION:
            raise ReglaNegocio(f'Solo se {verbo} {self.varios} en revisión (estado actual: "{actual}").')


FLUJO_LUGAR = Flujo("un lugar", "lugares", "publicado", desde_envio=("borrador", "incompleto"))
FLUJO_RETO = Flujo("un reto", "retos", "activo")
# Una insignia devuelta queda bloqueada; desde ahí (o desde borrador) se reenvía a revisión.
FLUJO_INSIGNIA = Flujo("una insignia", "insignias", "activa", desde_envio=("borrador", "bloqueada"), devuelto="bloqueada")
