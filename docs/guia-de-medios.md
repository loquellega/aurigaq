# Guía de medios · aurigaQ v040

Buenas prácticas para que videos, audios, imágenes, artefactos y cámaras corran bien en aurigaQ.
Es la misma guía que aparece en la app (Ajustes › Guía de medios). Allí, la pestaña «esta computadora» pregunta al navegador qué formatos abre, si los reproduce con fluidez y si usa la tarjeta gráfica.

Las recetas usan [ffmpeg](https://ffmpeg.org/), libre y gratuito para Windows, Mac y Linux. Cambia «entrada» y «salida» por tus archivos.

## Video

Para la función, lo más seguro es MP4 con H.264. Casi toda computadora lo decodifica con la tarjeta gráfica, Chrome y Edge lo abren en Windows, Mac y Linux, y deja libre el procesador para la escena y los artefactos.

### Cómo exportarlo

- Códec H.264 (perfil High), 8 bits, color 4:2:0 (yuv420p).
- Tamaño igual a la salida del proyecto: 1280 × 720 o 1920 × 1080. Un video más grande cuesta decodificación y no se ve mejor.
- Cuadros por segundo constantes e iguales a los del material: 25, 30 o 60. No mezcles 25 y 30 en una misma escena.
- Un cuadro clave por segundo (GOP corto). Los bucles, los saltos, los recortes del Timeline y «ir a marca» caen exactos y rápido. El archivo crece un poco.
- Tasa de datos: 8 a 12 Mb/s para 1080p y 4 a 6 Mb/s para 720p. En proyección, más no se nota.
- Índice al inicio del archivo (+faststart): abre de inmediato.
- Sonido dentro del video: AAC estéreo a 48 kHz. Si el video no lleva sonido, quítalo: es un decodificador menos.

**1080p para la función (30 cuadros; para 25 cambia fps=25 y -g 25)**

```sh
ffmpeg -i entrada.mov -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30" -c:v libx264 -profile:v high -pix_fmt yuv420p -preset slow -crf 18 -maxrate 12M -bufsize 24M -g 30 -keyint_min 30 -sc_threshold 0 -c:a aac -b:a 192k -ar 48000 -movflags +faststart salida-1080.mp4
```

**720p ligera, sin sonido (laptop de taller, Raspberry Pi)**

```sh
ffmpeg -i entrada.mov -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,fps=30" -c:v libx264 -profile:v high -pix_fmt yuv420p -preset slow -crf 20 -maxrate 6M -bufsize 12M -g 30 -keyint_min 30 -sc_threshold 0 -an -movflags +faststart salida-720.mp4
```

### Otros códecs

- HEVC (H.265): Chrome solo lo abre si la computadora lo decodifica por hardware. Puede funcionar en tu máquina y no abrir en la del museo. Úsalo solo si lo probaste en la computadora de la función (pestaña «esta computadora»).
- VP9 (WebM): buena calidad, pero en muchas computadoras se decodifica con el procesador. Úsalo sobre todo para video con transparencia.
- AV1: archivos pequeños, pero pesado si no hay decodificación por hardware. No lo uses para la función sin probarlo.
- No abren en el navegador: ProRes, DNxHD/DNxHR, HAP, Animation ni otros códecs de edición. Expórtalos a H.264.

### Transparencia, bucles y reversa

- H.264 no tiene canal alfa. Para video con transparencia: WebM VP9 con alfa. Para fijos: PNG.
- Otra vía sin alfa: fondo negro con fusión «pantalla», o un fondo de color con Luma Key o Chroma Key en la escena.
- Bucle sin salto: que el último cuadro empate con el primero y que haya cuadros clave cortos.
- aQ no reproduce video en reversa: exporta una copia al revés (solo con clips cortos, porque ocupa mucha memoria al exportar).

**WebM VP9 con transparencia**

```sh
ffmpeg -i entrada.mov -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 6M -g 30 -an salida-alfa.webm
```

**Copia al revés de un clip corto**

```sh
ffmpeg -i clip.mp4 -vf reverse -af areverse -c:v libx264 -pix_fmt yuv420p -crf 18 -g 30 -movflags +faststart clip-reversa.mp4
```

### Cuántos videos a la vez

Cada video que suena o se ve es un decodificador trabajando, y los preparados también ocupan memoria. Como guía: en una laptop de taller, dos o tres videos a 1080p o cuatro a 720p. Mídelo en tu equipo con «Revisión de recursos»: si aparecen cuadros perdidos, baja a 720p o junta capas en un solo video.

## Audio

Las escenas de audio decodifican cada archivo completo en memoria para poder recortar, cruzar y hacer bucles con precisión. Un estéreo de 10 minutos a 48 kHz ocupa unos 230 MB. Para material más largo, pártelo en clips.

- Formato: WAV o FLAC (16 o 24 bits) para lo que ya está editado. MP3 a 320 kb/s, AAC a 256 kb/s u Opus también funcionan y cargan más rápido.
- Frecuencia: 48 kHz, la de casi todas las interfaces de audio y salidas HDMI. Evita mezclar 44.1 y 48 kHz en un mismo show.
- Estéreo. aQ mezcla en estéreo: un archivo 5.1 se reduce a dos canales.
- Nivel: picos a −1 dBFS y una sonoridad parecida entre cues. El ajuste fino se hace en la escena, no subiendo el archivo.
- Recorta el silencio del inicio para que el GO responda al instante.
- Bucles: corta en un cruce por cero o usa el fundido cruzado de la región de bucle.

**Pasar a WAV 48 kHz, 24 bits, estéreo**

```sh
ffmpeg -i entrada.aif -ar 48000 -ac 2 -c:a pcm_s24le salida.wav
```

**Igualar sonoridad (−18 LUFS, picos a −1 dB)**

```sh
ffmpeg -i entrada.wav -af loudnorm=I=-18:TP=-1:LRA=11 -ar 48000 -c:a pcm_s24le salida-normalizada.wav
```

## Imágenes

- JPG para fotografías (calidad 85 a 92), PNG para gráficos o con transparencia; WebP sirve para ambos.
- Tamaño cercano a la salida. Máximo 4096 px por lado: muchas tarjetas gráficas no aceptan texturas más grandes.
- Una foto de 6000 × 4000 ocupa unos 96 MB en la memoria de video aunque se vea pequeña.
- Color en sRGB. Los archivos CMYK o con perfiles de impresión se ven mal o no abren.
- Una secuencia larga de fotos funciona mejor convertida en video.

**Foto grande a JPG del tamaño de la salida**

```sh
ffmpeg -i foto.tif -vf "scale=1920:1080:force_original_aspect_ratio=decrease" -q:v 2 foto-1080.jpg
```

**Secuencia de fotos a video (foto-0001.png, foto-0002.png…)**

```sh
ffmpeg -framerate 30 -i foto-%04d.png -c:v libx264 -pix_fmt yuv420p -crf 18 -g 30 -movflags +faststart secuencia.mp4
```

## Artefactos

- Pon los artefactos en el mismo servidor que aQ, de preferencia en la carpeta artefactos/. Así el host lee su lienzo directamente, sin costo. Desde otro origen, el lienzo viaja como una copia por cuadro, más costosa.
- Usa el SDK (sdk/artefacto-sdk.js): sus parámetros quedan como entradas del nodo Artefacto, y desde el SDK 0.2 sus números y eventos quedan como salidas.
- Dibuja al tamaño que pide el host (onResize). En equipos justos, baja «artefactos» en Salida › Proyecto a 75 % o a la mitad.
- Respeta onStart y onStop: fuera de escena el artefacto descansa y no gasta.
- Sin pantalla de inicio ni botones de «empezar» dentro de aQ. El audio arranca con onStart.
- Que funcione sin internet: copia en su carpeta las fuentes tipográficas, las librerías y los modelos que use.
- Con WebGL o Three.js, crea el contexto con preserveDrawingBuffer: true para que el host pueda leer el cuadro.
- El sonido de un artefacto sale directo del navegador: dale un parámetro de volumen propio.

La guía completa del SDK, con ejemplos para adaptar apps de Canvas 2D, WebGL, Three.js y p5.js, está en la carpeta sdk/ del repositorio.

## Cámaras

- Cámara web USB: 1280 × 720 a 30 cuadros es lo que la mayoría da sin comprimir. Muchas solo dan 1080p comprimido (MJPEG), que usa más procesador.
- Capturadora HDMI o SDI por USB 3: aparece como una cámara más.
- Capturar otra ventana cuesta más que una cámara: úsalo cuando no haya otra vía.
- Las cámaras piden permiso: abre aQ con su lanzador, por HTTPS o en localhost.
- Una cámara abierta fuera de escena sigue trabajando: ciérrala si no la vas a usar pronto.

## Equipo

- Chrome o Edge actualizados, abiertos con el lanzador de aQ (Ajustes › Esta computadora).
- Computadora con tarjeta gráfica (Windows o Mac): 1080p cómodo. Laptop de taller: salida 1280 × 720 · ligera.
- Proyector a su resolución nativa y salida de aQ con la misma proporción.
- Para museo: desactiva la suspensión, el protector de pantalla y las actualizaciones automáticas en horario de sala.
- Raspberry Pi 5: 720p, un video a la vez y artefactos ligeros. No decodifica H.264 por hardware (solo HEVC, que el navegador puede no aprovechar), así que el video depende del procesador. Para meses de sala: SSD o modo de solo lectura, y la pila del reloj si no hay internet para la hora.
- Raspberry Pi 4: decodifica H.264 por hardware, pero su gráfica es más limitada: 720p y escenas sencillas.
- Antes de una función en una máquina nueva, corre la «prueba larga» de Revisión de recursos y revisa la pestaña «esta computadora».

---
Alchemy of Meaning (Alquimia del Significado) · Héctor Cruz Juárez · GPL-3.0-or-later
