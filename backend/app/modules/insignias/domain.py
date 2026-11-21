"""Reglas propias de insignias."""

XP_POR_DEFECTO = 10


def estado_inicial(rol):
    """El coordinador crea insignias activas; las de un editor nacen en borrador y pasan por revisión."""
    return "activa" if rol == "coordinador" else "borrador"
