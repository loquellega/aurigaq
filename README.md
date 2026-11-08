# aurigaQ (aQ)

**Versión 0.38 (v038)** · Alchemy of Meaning (Alquimia del Significado) · Héctor Cruz Juárez

## Español

aurigaQ es un media server y una cue list en el navegador para presentar en vivo artefactos web (apps propias de la colección), video, foto, audio y cámaras. Junta la cue list de QLab (GO, fundidos, cues de acción) con las escenas de nodos de Isadora.

- **Cue = escena o acción.** Escenas de video con nodos (Movie Player, Timeline, Transformación, Compositor, Aspecto, efectos, disparos) y escenas de audio en línea de tiempo multipista con bucle y devamp.
- **Timeline** (v038): línea de tiempo de videos y fotos dentro de una escena, con capas, recortes, fundidos, marcas y control por disparos (Enter Scene, Sequential, Trigger Delay, Pulse Generator, GO / Ir a cue).
- **Salida** en otra ventana, mapeo y escenarios; **modo museo** sin internet con horario; **monitoreo remoto** y agente local.

### Cómo usarlo
1. Sube la carpeta completa a un servidor con HTTPS (o ábrela en `http://localhost`), junto a tus artefactos.
2. Ábrela en Chrome o Edge y abre la ventana de salida.
3. El manual completo está en `LEEME.txt`; para hacer artefactos compatibles, `PROTOCOLO.md`, `crear-artefacto-aurigaq.md` y `sdk/artefacto-sdk.js`.

Para probar en local: `python3 -m http.server 8000` dentro de la carpeta y abre `http://localhost:8000/`.

## English

aurigaQ is a browser-based media server and cue list for performing web artefacts live, plus video, stills, audio and cameras. It blends QLab's cue list (GO, fades, action cues) with Isadora-style node scenes.

- **A cue is a scene or an action.** Video scenes are node patches; audio scenes are multitrack timelines with loop and devamp.
- **Timeline node** (v038): a video/photo timeline inside a scene with layers, trims, fades, markers and trigger control.
- Separate output window with mapping, offline museum mode with schedule, remote monitoring and a local agent.

**Run it:** serve the folder over HTTPS or `localhost` and open it in Chrome or Edge. Full manual (Spanish) in `LEEME.txt`.

## Créditos · Credits

Diseño y desarrollo: Héctor Cruz Juárez — https://hectorcruz.com.mx  
Colección Alchemy of Meaning (Alquimia del Significado).

## Licencia · License

GPL-3.0-or-later. Ver `LICENSE`.
