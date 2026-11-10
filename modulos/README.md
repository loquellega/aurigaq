# Módulos de la colección · aurigaQ

Módulos de usuario listos para usar. En aQ aparecen en el panel de nodos, categoría «módulos», con la marca «colección». También se pueden traer con «importar .aqmodulo…».

| Archivo | Qué hace |
|---|---|
| `estado-por-cue.aqmodulo` | Cada GO de la cue list pasa al siguiente de cuatro valores, con transición. |
| `parpadeo-de-vela.aqmodulo` | Un número que tiembla como una llama, entre base − variación y base. |
| `video-con-aspecto.aqmodulo` | Película HP5 y máscara de elipse suave sobre el video que entre. |
| `fachada-mapeada.aqmodulo` | Un Proyector con su mapa (muro, columna curva, muro) para reusar en cada escena. |

Para agregar uno: expórtalo desde aQ con «exportar .aqmodulo», ponlo en esta carpeta y súmalo a `indice.json` (archivo, nombre y una línea de descripción).

---

Ready-made user modules for aurigaQ. They show up in the node panel under «módulos». Each `.aqmodulo` file is JSON: `{ aqmodulo: 1, raiz, nombre, modulos: [...] }`, with the root module and every module it uses inside.

Alchemy of Meaning (Alquimia del Significado) · Héctor Cruz Juárez · GPL-3.0-or-later
