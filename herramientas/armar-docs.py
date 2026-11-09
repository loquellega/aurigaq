#!/usr/bin/env python3
"""
Regenera la documentación que se deriva del código de aurigaQ. Córrelo desde la raíz
del repositorio antes de cada versión:  python3 herramientas/armar-docs.py

1. docs/guia-de-medios.md         <- la guía de medios que vive en index.html (bloque /*GUIA*/)
2. sdk/versiones/artefacto-sdk-X.js <- copia congelada del SDK actual (X = su versión)
3. crear-artefacto-aurigaq.md     <- plantilla y SDK copiados tal cual de sus archivos
4. sdk/version.json               <- versión del SDK, del protocolo y de aQ

No toca el código de la app. Solo usa la biblioteca estándar de Python.
"""
import json, os, re, shutil, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def ruta(*p): return os.path.join(RAIZ, *p)
def leer(*p):
    with open(ruta(*p), encoding='utf-8') as f: return f.read()
def escribir(texto, *p):
    os.makedirs(os.path.dirname(ruta(*p)), exist_ok=True)
    with open(ruta(*p), 'w', encoding='utf-8') as f: f.write(texto)
    print('·', os.path.join(*p))

app = leer('index.html')
sdk = leer('sdk', 'artefacto-sdk.js')
version_aq = re.search(r"version:'(v\d+)'", app).group(1)
version_sdk = re.search(r"var SDK = '([\d.]+)'", sdk).group(1)
protocolo = re.search(r"var NS = '([^']+)'", sdk).group(1)

# 1. guía de medios
m = re.search(r'/\*GUIA\*/const GUIA=(.*?);/\*FIN GUIA\*/', app, re.S)
if not m: sys.exit('no encontré el bloque /*GUIA*/ en index.html')
guia = json.loads(m.group(1))
md = ['# Guía de medios · aurigaQ ' + version_aq, '',
      'Buenas prácticas para que videos, audios, imágenes, artefactos y cámaras corran bien en aurigaQ.',
      'Es la misma guía que aparece en la app (Ajustes › Guía de medios). Allí, la pestaña «esta computadora» '
      'pregunta al navegador qué formatos abre, si los reproduce con fluidez y si usa la tarjeta gráfica.', '',
      'Las recetas usan [ffmpeg](https://ffmpeg.org/), libre y gratuito para Windows, Mac y Linux. '
      'Cambia «entrada» y «salida» por tus archivos.', '']
for sec in guia:
    md += ['## ' + sec['t'][0].upper() + sec['t'][1:], '']
    for it in sec['items']:
        if it[0] == 'p': md += [it[1], '']
        elif it[0] == 'h': md += ['### ' + it[1], '']
        elif it[0] == 'li': md += ['- ' + x for x in it[1]] + ['']
        elif it[0] == 'cmd': md += ['**' + it[1] + '**', '', '```sh', it[2], '```', '']
md += ['---', 'Alchemy of Meaning (Alquimia del Significado) · Héctor Cruz Juárez · GPL-3.0-or-later', '']
escribir('\n'.join(md), 'docs', 'guia-de-medios.md')

# 2. copia congelada del SDK
destino = ruta('sdk', 'versiones', 'artefacto-sdk-' + version_sdk + '.js')
if os.path.exists(destino) and leer('sdk', 'versiones', 'artefacto-sdk-' + version_sdk + '.js') != sdk:
    print('! sdk/versiones/artefacto-sdk-' + version_sdk + '.js ya existe y es distinto del SDK actual:')
    print('  si cambiaste el SDK, sube su versión (var SDK) y anótala en sdk/CHANGELOG.md')
else:
    escribir(sdk, 'sdk', 'versiones', 'artefacto-sdk-' + version_sdk + '.js')

# 3. guía para crear artefactos
guia_art = leer('crear-artefacto-aurigaq.md')
plantilla = leer('artefactos', 'plantilla.html')
sdk_pegable = sdk.replace('</script>', '<\\/script>')
def poner(texto, marca, lenguaje, contenido):
    patron = re.compile(r'(<!-- ' + marca + r' -->\n)```' + lenguaje + r'\n.*?```\n(<!-- /' + marca + ' -->)', re.S)
    if not patron.search(texto): sys.exit('falta la marca ' + marca + ' en crear-artefacto-aurigaq.md')
    return patron.sub(lambda m: m.group(1) + '```' + lenguaje + '\n' + contenido.rstrip('\n') + '\n```\n' + m.group(2), texto)
guia_art = poner(guia_art, 'PLANTILLA', 'html', plantilla)
guia_art = poner(guia_art, 'SDK', 'js', sdk_pegable)
guia_art = re.sub(r'\*\*SDK [\d.]+ · protocolo [^·]+· aurigaQ v\d+\*\*',
                  '**SDK ' + version_sdk + ' · protocolo ' + protocolo + ' · aurigaQ ' + version_aq + '**', guia_art)
escribir(guia_art, 'crear-artefacto-aurigaq.md')

# 4. versión
escribir(json.dumps({'sdk': version_sdk, 'protocolo': protocolo, 'aurigaq': version_aq}, ensure_ascii=False, indent=2) + '\n',
         'sdk', 'version.json')
print('SDK', version_sdk, '·', protocolo, '· aurigaQ', version_aq)
