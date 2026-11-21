"""Reglas propias de retos: cálculo de puntos y requisitos para revisión."""
from ...domain.validacion import exigir


def calcular_puntos(cfg, lugar, tipo=None, medalla=None):
    """
    base + bonos por barrio/categoría poco visitados + bono por tipo + XP de la medalla.
    `cfg` son las reglas de Ajustes; `lugar` el contexto del lugar (o None); `medalla` {"nombre","xp"} (o None).
    Devuelve {"total", "desglose": [[etiqueta, puntos], ...]}.
    """
    if lugar:
        desglose = [["Lugar nuevo para el usuario", cfg["base"]]]
        if lugar["publicadosBarrio"] <= cfg["umbralBarrio"]:
            desglose.append([f'{lugar["barrio"]} no suele estar recorrido', cfg["bonoBarrio"]])
        if lugar["enCategoria"] <= cfg["umbralCategoria"]:
            desglose.append([f'{lugar["categoria"]} es categoría poco visitada', cfg["bonoCategoria"]])
    else:
        desglose = [["Reto base", cfg["base"]]]
    if tipo and cfg["bonoTipo"].get(tipo):
        desglose.append([f"Reto tipo {tipo}", cfg["bonoTipo"][tipo]])
    if medalla and medalla["xp"]:
        desglose.append([f'Medalla «{medalla["nombre"]}»', medalla["xp"]])
    return {"total": sum(p for _, p in desglose), "desglose": desglose}


def validar_para_revision(reto):
    exigir(reto, ["titulo", "instruccion"])
