# aurigaQ (aQ)

**Versión 0.44 (v044)** · Alchemy of Meaning (Alquimia del Significado) · Héctor Cruz Juárez

![La cue list en función: el cue en espera arriba, el Monitor y lo que está al aire a la derecha](docs/capturas/01-funcion.png)

## Español

aurigaQ es un media server y una cue list que corre en el navegador. Sirve para presentar en vivo artefactos web (instrumentos visuales y sonoros de la colección), video, foto, audio y cámaras, en teatro, danza, música, instalación y museo.

### Una herramienta que viene de la escena

aurigaQ es el resultado de más de una década y media de investigación en diseño multimedia y videoproyección para las artes escénicas, a lo largo de más de cien producciones en distintos países. Esa práctica dejó preguntas concretas: qué necesita una función en vivo para no fallar, cómo se ensaya una imagen junto con un cuerpo y un texto, cómo se arma un dispositivo que un equipo pequeño pueda operar en una sala y otro pueda montar en un museo lejos del autor, y cómo se enseña todo eso en un taller.

La herramienta responde a esas preguntas con decisiones de diseño:

- **El paso de un cue a otro es la esencia de la función.** Todo se organiza en una lista que avanza con GO, con su transición y su comportamiento.
- **Estabilidad antes que efectos.** Límites puestos a propósito: 720p o 1080p, audio estéreo, recursos que solo trabajan cuando están al aire o en espera. Está pensada para la laptop de un taller.
- **Abierta y portátil.** Un solo archivo HTML, sin instalación ni internet, con licencia libre.
- **Una sola gramática visual.** La interfaz sigue el estilo de la colección Alchemy of Meaning: fondo negro, ventanas pequeñas con líneas finas y el verde reservado para lo que está vivo (GO, lo que está al aire, el progreso). El modo de contraste «alto» devuelve el blanco sobre negro para la función.

### Qué hace

**Cue list y función.** Cada cue presenta una escena o hace una acción sobre lo que está sonando o al aire: fundido, detener, pausar, reanudar, devamp, disparar, ir a, esperar. Los estados de cada cue se ven de un vistazo: al aire, entrando, en bucle o en pausa. Las escenas se reusan por referencia.

![Modo edición: fuentes y escenas a la izquierda, la cue list al centro y el Monitor a la derecha](docs/capturas/02-edicion.png)

**Escenas de video con nodos.** Un patch de fuentes, transformaciones, efectos y composición que termina en uno o varios Proyectores, organizado en categorías: entradas, generadores, transformar, efectos, componer, control, lógica y salida. Los números se conectan entre nodos: ondas, azar, ratón, teclado, nivel de audio, disparos, contadores, comparaciones, puertas y cronómetros. Así una escena puede cambiar sola, responder al público o seguir a la cue list.

![Una escena de lógica: un cronómetro, comparaciones, una puerta, Sample and Hold y un Selector mueven una forma](docs/capturas/03-nodos-logica.png)

**Timeline de video y foto.** Un nodo con una línea de tiempo por capas: recortes, fundidos de entrada y de salida, cruces, opacidad y fusión por capa, marcas, bucle y devamp. Se prepara en su primer cuadro y se controla con disparos: al entrar la escena, en secuencia, con una tecla o al terminar.

![El nodo Timeline dentro de una escena, con sus disparos](docs/capturas/04-nodos-timeline.png)

![El editor del Timeline: capas, clips con miniaturas, fundidos y marcas](docs/capturas/05-editor-timeline.png)

**Mapa en cada Proyector.** Cada nodo Proyector guarda su propio mapa de proyección. Las slices toman una parte de la imagen y la deforman sobre la superficie real: rectángulos con perspectiva o mallas curvas para columnas, telones y superficies que no son planas. Cada slice tiene borde suave, intensidad, fusión para traslapes y espejo. Una carta de prueba ayuda a alinear en la sala, y un mapa se copia de un Proyector a otro.

![El editor del mapa: a la izquierda, de dónde sale cada slice; a la derecha, dónde cae en el proyector](docs/capturas/11-mapa-proyector.png)

![La carta de prueba de cada slice, para alinear en la sala](docs/capturas/12-mapa-carta.png)

**Módulos de usuario.** Un pedazo de patch con entradas y salidas propias que se reusa en muchas escenas. Lo que cambias adentro cambia todas sus copias, y cada copia conserva sus valores y su estado. Se crea seleccionando nodos y eligiendo «convertir en módulo». Se guarda en el show, en una biblioteca personal o en archivos `.aqmodulo`. La carpeta [modulos/](modulos/) trae los de la colección, entre ellos una fachada mapeada lista para reusar.

![Una escena con dos módulos: video con aspecto y fachada mapeada](docs/capturas/13-modulo-en-escena.png)

![Dentro de un módulo: sus entradas, un Proyector con su mapa y la escena que lo usa en la vista previa](docs/capturas/14-modulo-editor.png)

**Escenas de audio.** Una línea de tiempo estéreo multipista con clips, recortes, curvas de volumen, fundidos cruzados, región de bucle y devamp, programada con el reloj de audio.

![Escena de audio con su región de bucle](docs/capturas/06-escena-audio.png)

**Salida y escenario.** Ventana de salida para el proyector, con corner pin, recortes y bordes difuminados. Los escenarios guardan lo propio de cada sala sin tocar el show.

![Modo salida con corner pin sobre la imagen](docs/capturas/07-salida.png)

**Para museo y gira.** Modo museo sin internet con horario, reinicio diario y lanzadores; monitoreo remoto con panel propio; agente local que reabre la pieza y enciende los proyectores por red. Revisión de recursos para saber qué está trabajando.

![Modo ajustes: interfaz, esta computadora, revisión de recursos, modo museo y monitoreo remoto](docs/capturas/08-ajustes.png)

**Guía de medios.** Dentro de la app (Ajustes › Guía de medios, o «guía» en Fuentes), las buenas prácticas para video, audio, imágenes, artefactos, cámaras y equipo, con recetas de ffmpeg listas para copiar. La pestaña «esta computadora» pregunta al navegador qué formatos abre, si los reproduce con fluidez y si usa la tarjeta gráfica. La misma guía está en [docs/guia-de-medios.md](docs/guia-de-medios.md).

![Guía de medios: video para la función, otros códecs y transparencia](docs/capturas/09-guia-medios.png)

**Artefactos y SDK.** Cualquier app web puede volverse artefacto con el protocolo `artefacto/v0` y el SDK incluido. Sus parámetros quedan como entradas del nodo Artefacto y, desde el SDK 0.2, sus números y eventos quedan como salidas que mueven otros nodos o disparan cues. La carpeta [sdk/](sdk/) reúne el SDK actual, una copia de cada versión, ejemplos, la tabla de compatibilidad y recetas para adaptar piezas de Canvas 2D, WebGL, p5.js y Three.js.

![Un artefacto que publica datos: sus choques hacen contar un Counter y su energía mueve un Aspecto](docs/capturas/10-artefacto-datos.png)

### Cómo usarlo

1. Sube la carpeta completa a un servidor con HTTPS, junto a tus artefactos, o pruébala en local con `python3 -m http.server 8000` dentro de la carpeta. Luego abre `http://localhost:8000/`.
2. Ábrela en Chrome o Edge y abre la ventana de salida en el proyector.
3. El manual completo está en `LEEME.txt`. Para preparar los archivos, [docs/guia-de-medios.md](docs/guia-de-medios.md). Para hacer artefactos, [sdk/README.md](sdk/README.md) y `crear-artefacto-aurigaq.md`.

Antes de publicar una versión, `python3 herramientas/armar-docs.py` regenera la guía de medios, la guía de artefactos y la copia del SDK en `sdk/versiones/`.

Las capturas (v041, contraste «suave») se tomaron en un navegador sin GPU, así que los cuadros por segundo que muestran no reflejan el rendimiento real.

## English

aurigaQ is a browser-based media server and cue list for performing web artefacts (visual and sound instruments from the collection), video, stills, audio and cameras live in theatre, dance, music, installation and museum settings.

It is the outcome of more than fifteen years of research in multimedia and projection design for the performing arts, across more than a hundred productions in several countries. The tool turns that practice into design decisions:

- the move from one cue to the next is the heart of a performance;
- stability comes before effects;
- everything runs offline from a single HTML file under a free licence.

**Features:**

- **Cues.** Every cue is a scene or an action.
- **Video scenes.** Node patches with generators, effects, compositing, numeric control and logic: comparators, gates, timers, selectors and cue triggers.
- **Video timeline node.** Layers, trims, fades, markers and trigger control.
- **Audio scenes.** Multitrack timelines with loop and devamp.
- **User modules.** Reusable sub-patches with their own inputs and outputs, linked by reference, with per-copy values and state; built-in collection in [modulos/](modulos/).
- **Per-projector mapping.** Each Projector node has its own map: perspective quads and curved meshes, soft edges, test card, copy and paste.
- **Output and venues.** A separate output window with corner pin, plus venue setups kept apart from the show.
- **Touring.** Museum mode with a schedule, remote monitoring and a local agent.
- **Media guide.** In-app best practices for video, audio, stills, artefacts and hardware, with a codec test for the current machine ([docs/guia-de-medios.md](docs/guia-de-medios.md)).
- **Artefacto SDK 0.2.** Params in, data and events out, versioned in [sdk/](sdk/).

**Run it:** serve the folder over HTTPS or `localhost` and open it in Chrome or Edge. The full manual (in Spanish) is in `LEEME.txt`.

## Créditos · Credits

Diseño, investigación y desarrollo: Héctor Cruz Juárez — https://hectorcruz.com.mx  
Colección Alchemy of Meaning (Alquimia del Significado).

## Licencia · License

GPL-3.0-or-later. Ver `LICENSE`.
