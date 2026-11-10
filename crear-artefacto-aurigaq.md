# Crear un artefacto para aurigaQ (aQ)

Documento para iniciar un chat nuevo que construya un artefacto (una pieza visual o sonora en HTML) que se cargue en aurigaQ, o para adaptar una app que ya existe. Pégalo o adjúntalo al principio y luego describe la pieza.

Versión de este documento: **SDK 0.2 · protocolo artefacto/v0 · aurigaQ v043**. Se regenera con `herramientas/armar-docs.py` en cada versión de aQ; la plantilla y el SDK de abajo son copia exacta de los archivos del repositorio.

## Qué es un artefacto

- Una app web de la colección *Alchemy of Meaning (Alquimia del Significado)*, de preferencia en un solo archivo `index.html`, sin conexión, con licencia GPL-3.0-or-later.
- aurigaQ la carga en un iframe del mismo servidor y toma la imagen de **un canvas**.
- En una escena de video, el nodo **Artefacto** da la imagen como fuente, convierte sus **parámetros** en entradas (con cable o fijas) y, desde el SDK 0.2, sus **datos** (números y eventos) en salidas que pueden mover otros nodos o disparar cues.

## Reglas

1. **Un canvas de salida.** Todo lo que deba verse en el proyector se dibuja en el canvas que se registra. aurigaQ no ve el DOM, el CSS ni las capas HTML.
2. **Resolución del host.** Al recibir `resize` (`onResize(w, h)`), el canvas toma ese tamaño y la pieza se adapta. No fijes 1280 × 720. `onHost(info)` dice además si el equipo pide calidad «ligera» o «completa»: con «ligera», baja la cantidad de partículas, pasadas o muestras.
3. **Sin pantalla de inicio dentro del host.** Si `art.inHost` es verdadero, la pieza no muestra pantallas de bienvenida ni pide clics. Arranca en `onStart` y libera recursos (audio, cámara, procesos) en `onStop`. aQ detiene los artefactos que salen de escena, así que `onStop` debe liberar de verdad.
4. **Interfaz propia opcional.** Dentro de aurigaQ empieza oculta. `onHud(true/false)` la muestra u oculta cuando el operador la pide.
5. **Parámetros pensados para escenas y cues.**
   - `float` e `int` para lo que deba transformarse con suavidad (se interpolan y se pueden mover con cables).
   - `enum` y `bool` para cambios de estado.
   - `color` para tintas.
   - `trigger` para eventos (un destello, otra imagen, un golpe de sonido).
   - Rangos con sentido escénico; nombres en español; entre 4 y 12 parámetros. `label` da el nombre visible y `step` el paso de los números.
6. **No dupliques lo que hace aQ.** Las escenas de aQ ya tienen nodos de Transformación (escala, posición, giro, espejo), Aspecto, HSL, Contraste, Levels, Crop, Tile, Máscara, Gaussian Blur, Displace, llaves de luma y de color, y composición por capas. Los parámetros del artefacto son para su lenguaje propio.
7. **Lo que cambia la interfaz propia se avisa** con `art.set(id, valor)`, para que aurigaQ lo refleje y lo pueda guardar.
8. **Datos hacia aQ (SDK 0.2).** Si la pieza mide o decide algo que pueda servir a la escena (la posición de algo que se mueve, un nivel, una densidad, el momento en que algo choca o termina un ciclo), decláralo en `data` y publícalo:
   - `art.emit(id, número)` para valores continuos; el SDK manda como mucho uno por cuadro, así que se puede llamar en cada cuadro.
   - `art.fire(id)` para eventos; en aQ llegan como un pulso que puede disparar un Counter, un Timeline o un GO.
   - Rangos declarados con `min` y `max` para que quien conecte sepa qué esperar. Con 0 a 1 se conecta directo a casi cualquier entrada.
9. **Audio.** La pieza maneja su propio audio y sale directo del navegador. Arráncalo en `onStart`, detenlo en `onStop` y dale un parámetro de volumen.
10. **Fuera del host** la pieza funciona sola, con su propia interfaz y su pantalla de inicio si la necesita.
11. **Estilo de la colección.**
    - Fondo negro, filetes blancos de 1 px y Arial a 11 px.
    - Ventanas con barra de título blanca.
    - Botones negros que se invierten al activarse.
    - Marca «i · nombre» que abre el «Acerca de» con la semblanza y la licencia.
12. **No congelar la página.** aQ pregunta a cada artefacto en uso, cada 10 s, si sigue vivo (`ping`; el SDK contesta solo). Si no contesta en 6 s, aQ lo recarga y le devuelve sus valores. Ningún cálculo debe bloquear la página más de un par de segundos: lo pesado se reparte entre cuadros o va en un Worker.
13. **Puede recargarse en cualquier momento.** Al abrir la ventana de salida, aQ recarga los artefactos allá una vez, y la vigilancia también puede recargarlos. La pieza debe arrancar limpia desde sus parámetros, sin depender de lo que pasó antes.
14. **WebGL.** Crea el contexto con `preserveDrawingBuffer: true` (en Three.js: `new THREE.WebGLRenderer({ canvas, preserveDrawingBuffer: true })`). Si no, el host puede leer un cuadro vacío.

## Estados entre cues, sin recargar

aurigaQ (aQ) carga cada artefacto **una sola vez**. Si el mismo artefacto está en dos escenas seguidas, aQ no lo reinicia: solo lleva sus parámetros de un estado al siguiente, cuadro a cuadro, durante la transición del cue. Si dos escenas usan el mismo artefacto, manda la que entró al último.

Lo que esto le pide a la pieza:

- **Aplicar el valor en cada cuadro.** `onParam` puede llegar 60 veces por segundo durante una transición o cuando un cable lo mueve. Debe ser barato: guardar el valor y usarlo en el siguiente cuadro, nunca reconstruir la escena ni reiniciar la simulación.
- **Todo lo que deba fundirse es `float`.** Ejemplo para partículas: velocidad, turbulencia, gravedad, dispersión, tamaño, estela, brillo, `mezcla` 0–1 entre dos paletas o dos formas.
- **Cantidad sin saltos.** Si un parámetro crea o destruye partículas, que aparezcan o se apaguen gradualmente.
- **Estados con nombre, opcional.** Si la pieza tiene «estados» internos (calma, tormenta, dispersión), exponlos como `float`s que los definen, o como un `float` «estado» 0–1 que interpola internamente entre ellos.
- **`enum`, `bool` y `trigger` para lo que sí debe ser un corte.**
- **Nada de valores aleatorios nuevos al recibir un parámetro.** La pieza debe verse igual cada vez que llega al mismo estado, para que la función sea repetible.

## Adaptar una app que ya existe

1. **Encuentra el canvas que se ve.** Canvas 2D: el que se dibuja. p5.js: `p5.canvas` o el que devuelve `createCanvas` (`.elt`). Three.js: `renderer.domElement`, con `preserveDrawingBuffer: true`.
2. **Agrega el SDK**: pegado dentro del `index.html` (sección final) o con `<script src="../../sdk/artefacto-sdk.js"></script>` si vive en `artefactos/mi-pieza/`.
3. **Registra** el canvas, los parámetros que ya tiene la app (los deslizadores de su interfaz suelen ser los parámetros) y, si tiene algo que medir, sus datos.
4. **Conecta su interfaz**: donde la app cambia un valor por su cuenta, agrega `art.set(id, valor)`; donde lee un valor, que lo lea del mismo estado que actualiza `onParam`.
5. **Pantalla de inicio y audio**: si `art.inHost`, sáltate la pantalla de inicio y arranca en `onStart`.
6. **Tamaño**: en `onResize`, recalcula lo que dependa del tamaño (márgenes, cuadrícula, cámara de Three.js con `setSize(w, h, false)` y `camera.aspect`).

## Entrega

- Una carpeta con `index.html` (con el SDK pegado dentro), `LEEME.txt` y `LICENSE.txt`.
- **Recomendado:** dentro de la carpeta de aurigaQ, en `artefactos/mi-pieza/`, y se carga en Fuentes › «+ fuente» › «artefacto por su ruta…» con `artefactos/mi-pieza/`. Así queda guardada en el navegador y funciona sin internet en la sala.
- También funciona al lado de aurigaQ (cargada con `../mi-pieza/`), pero fuera de su carpeta no queda guardada para trabajar sin conexión.
- Al pegar el SDK dentro del `index.html`, cualquier `</script>` que aparezca en un comentario o texto debe escribirse `<\/script>`; si no, cierra el script antes de tiempo y rompe la página.

## Pruebas de aceptación

1. Abierta sola, funciona con su interfaz.
2. Cargada en aurigaQ: aparece en Fuentes, sin pantalla de inicio, y el nodo Artefacto muestra todos sus parámetros.
3. Un cue que interpola dos estados de sus parámetros se ve suave.
4. Un `trigger` desde aurigaQ hace su evento.
5. Tres cues seguidos con el mismo artefacto y estados distintos: pasa de uno a otro sin reiniciarse, sin saltos y sin parpadeo.
6. Al sacarla de escena deja de consumir recursos (`onStop`).
7. Si cambia de resolución, se redibuja sin deformarse.
8. Con la ventana de salida abierta (el artefacto se recarga allá), vuelve con sus valores, sin pantalla de inicio, y sigue contestando a la vigilancia.
9. Si declara `data`, sus salidas aparecen en el nodo Artefacto y mueven un nodo conectado; sus eventos hacen contar un Counter. Revisión de recursos dice «SDK 0.2».

## Plantilla (artefactos/plantilla.html)

<!-- PLANTILLA -->
```html
<!doctype html>
<!--
  Plantilla de artefacto para aurigaQ (protocolo artefacto/v0, SDK 0.2).
  Copia esta carpeta, cambia el dibujo y los parámetros, y cárgala en la biblioteca.
  Parte de la colección Alchemy of Meaning (Alquimia del Significado).
  © 2026 Héctor Cruz Juárez · https://hectorcruz.com.mx
  Software libre bajo licencia GPL-3.0-or-later.
-->
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Plantilla · artefacto</title>
<style>
  html,body{margin:0;height:100%;background:#000;overflow:hidden;color:#fff;font:11px Arial,Helvetica,sans-serif}
  canvas{display:block;width:100%;height:100%}
  /* interfaz propia: aparece cuando la app se abre sola o cuando aurigaQ pide verla («interfaz propia») */
  #ui{position:fixed;left:8px;top:8px;border:1px solid #fff;background:rgba(0,0,0,.85);padding:8px;display:grid;gap:6px;width:220px}
  body.sinui #ui{display:none}
  label{display:flex;justify-content:space-between;gap:8px;color:#8a8a8a}
  input[type=range]{width:120px}
</style>
</head>
<body>
<canvas id="c" width="1280" height="720"></canvas>
<div id="ui">
  <b>Plantilla</b>
  <label>tamaño <input id="uTam" type="range" min="0.05" max="1" step="0.01"></label>
  <label>velocidad <input id="uVel" type="range" min="0" max="3" step="0.01"></label>
</div>
<!-- SDK: en una app de un solo archivo, pega aquí el contenido de sdk/artefacto-sdk.js -->
<script src="../sdk/artefacto-sdk.js"></script>
<script>
(()=>{
  'use strict';
  const c=document.getElementById('c'),x=c.getContext('2d');
  // 1. estado de la pieza: un valor por parámetro
  const v={tam:.35,vel:1,forma:'círculo',color:'#ffffff',invertir:false};
  let corriendo=true,destello=0,t=0;

  // 2. registro: el host lee estos parámetros y arma los controles solo
  const art=Artefacto.register({
    id:'plantilla',name:'Plantilla',version:'0.1',author:'Héctor Cruz Juárez',
    canvas:c,
    params:[
      {id:'tam',label:'Tamaño',type:'float',min:.05,max:1,default:v.tam},
      {id:'vel',label:'Velocidad',type:'float',min:0,max:3,default:v.vel},
      {id:'forma',label:'Forma',type:'enum',options:['círculo','cuadro','línea'],default:v.forma},
      {id:'color',label:'Color',type:'color',default:v.color},
      {id:'invertir',label:'Invertir',type:'bool',default:v.invertir},
      {id:'destello',label:'Destello',type:'trigger'}
    ],
    // SDK 0.2: lo que la pieza publica hacia aurigaQ (salidas del nodo Artefacto)
    data:[
      {id:'x',label:'posición x',type:'float',min:0,max:1},
      {id:'y',label:'posición y',type:'float',min:0,max:1},
      {id:'vuelta',label:'vuelta',type:'event'}
    ],
    onParam(id,valor){v[id]=valor;sincronizarUI();},     // el host cambió un valor (cue, preset, control)
    onTrigger(id){if(id==='destello')destello=1;},       // el host disparó un evento
    onStart(){corriendo=true;},                         // entra a escena: arrancar audio, cámaras, procesos
    onStop(){corriendo=false;},                         // sale de escena: liberar recursos
    onHud(visible){document.body.classList.toggle('sinui',!visible);},
    onHost(info){/* SDK 0.2: info.version, info.width, info.height, info.calidad ('ligera' o 'completa') */}
  });
  // dentro de aurigaQ la interfaz propia empieza oculta
  if(art.inHost)document.body.classList.add('sinui');

  // 3. la interfaz propia avisa al host de sus cambios con art.set
  const uTam=document.getElementById('uTam'),uVel=document.getElementById('uVel');
  function sincronizarUI(){uTam.value=v.tam;uVel.value=v.vel;}
  uTam.oninput=()=>{v.tam=+uTam.value;art.set('tam',v.tam);};
  uVel.oninput=()=>{v.vel=+uVel.value;art.set('vel',v.vel);};
  sincronizarUI();

  // 4. dibujo: siempre en el canvas registrado (es lo único que ve el host)
  let ant=performance.now();
  function cuadro(ahora){
    requestAnimationFrame(cuadro);
    const dt=Math.min(.05,(ahora-ant)/1000);ant=ahora;
    if(!corriendo)return;
    const vueltaAntes=Math.floor(t/(Math.PI*2));
    t+=dt*v.vel;destello*=Math.pow(.05,dt);
    if(Math.floor(t/(Math.PI*2))!==vueltaAntes)art.fire('vuelta');          // un evento: el host lo recibe como pulso
    art.emit('x',.5+Math.cos(t)*.25);art.emit('y',.5+Math.sin(t*1.3)*.2); // números: como mucho uno por cuadro
    const W=c.width,H=c.height,r=Math.min(W,H)*v.tam*.5*(1+destello*.3);
    x.fillStyle=v.invertir?'#fff':'#000';x.fillRect(0,0,W,H);
    x.save();x.translate(W/2+Math.cos(t)*W*.25,H/2+Math.sin(t*1.3)*H*.2);x.rotate(t*.5);
    x.fillStyle=x.strokeStyle=v.invertir?'#000':v.color;x.lineWidth=Math.max(2,r*.08);
    if(v.forma==='círculo'){x.beginPath();x.arc(0,0,r,0,Math.PI*2);x.fill();}
    else if(v.forma==='cuadro')x.fillRect(-r,-r,r*2,r*2);
    else{x.beginPath();x.moveTo(-r*1.5,0);x.lineTo(r*1.5,0);x.stroke();}
    x.restore();
  }
  requestAnimationFrame(cuadro);
})();
</script>
</body>
</html>
```
<!-- /PLANTILLA -->

## SDK (pegar dentro del index.html, en lugar del script externo)

El `<\/script>` del comentario de uso ya va escapado, para que se pueda pegar tal cual dentro de un `<script>`.

<!-- SDK -->
```js
/*
 * Artefacto SDK 0.2 · protocolo artefacto/v0
 * Conecta cualquier app web (un "artefacto") con el host aurigaQ.
 * Alchemy of Meaning (Alquimia del Significado) · Héctor Cruz Juárez · GPL-3.0-or-later
 *
 * Uso mínimo dentro de la app:
 *   <script src="../sdk/artefacto-sdk.js"><\/script>
 *   const art = Artefacto.register({
 *     id: 'mi-app', name: 'Mi app', version: '0.1',
 *     canvas: document.querySelector('canvas'),
 *     params: [ { id:'velocidad', type:'float', min:0, max:2, default:1 } ],
 *     data:   [ { id:'nivel', type:'float', min:0, max:1 }, { id:'golpe', type:'event' } ],  // SDK 0.2
 *     onParam(id, value, values) { ... },   // el host cambió un parámetro
 *     onTrigger(id) { ... },                 // el host disparó un trigger
 *     onResize(w, h) { ... },                // el host fijó la resolución del canvas
 *     onStart() { ... }, onStop() { ... },   // el host arranca o detiene la pieza (sin pantalla de inicio)
 *     onHud(visible) { ... },                // el host pide mostrar u ocultar la interfaz propia
 *     onHost(info) { ... }                   // SDK 0.2: quién es el host (versión, resolución, calidad)
 *   });
 *   art.set('velocidad', 1.4);  // avisar al host de un cambio hecho en la propia app
 *   art.emit('nivel', 0.62);    // SDK 0.2: un número que el host usa como salida del nodo Artefacto
 *   art.fire('golpe');          // SDK 0.2: un evento (pulso) que el host usa como salida del nodo
 *
 * Fuera del host la app funciona igual: el SDK no hace nada si no hay padre.
 * Un host anterior (que no conoce SDK 0.2) ignora data, emit y fire sin errores.
 */
(function () {
  'use strict';
  var NS = 'artefacto/v0';
  var SDK = '0.2';

  function defaultFor(p) {
    if (p.default !== undefined) return p.default;
    switch (p.type) {
      case 'bool': return false;
      case 'enum': return p.options ? p.options[0] : '';
      case 'color': return '#ffffff';
      case 'trigger': return null;
      default: return p.min !== undefined ? p.min : 0;
    }
  }

  function register(def) {
    if (!def || !def.id || !def.canvas) throw new Error('Artefacto.register necesita id y canvas');
    var params = (def.params || []).map(function (p) { return Object.assign({}, p); });
    var data = (def.data || []).map(function (d) { return Object.assign({ type: 'float' }, d); });
    var values = {};
    params.forEach(function (p) { if (p.type !== 'trigger') values[p.id] = defaultFor(p); });

    var inHost = window.parent && window.parent !== window;
    var mode = 'none';
    var running = false;
    var host = null;

    function post(msg, transfer) {
      if (!inHost) return;
      msg.ns = NS;
      try { window.parent.postMessage(msg, '*', transfer || []); } catch (e) { /* host ausente */ }
    }

    function applyValue(id, v) {
      values[id] = v;
      if (typeof def.onParam === 'function') def.onParam(id, v, values);
    }

    // Transporte "bitmap": cuando el host no puede leer el canvas directamente
    // (otro origen o sandbox), el SDK le envía cada cuadro como ImageBitmap.
    function bitmapLoop() {
      if (mode !== 'bitmap') { running = false; return; }
      running = true;
      var c = def.canvas;
      if (c.width > 0 && c.height > 0 && window.createImageBitmap) {
        createImageBitmap(c, { imageOrientation: 'flipY' }).then(function (bmp) {
          post({ type: 'frame', bitmap: bmp }, [bmp]);
        }).catch(function () {});
      }
      requestAnimationFrame(bitmapLoop);
    }

    // SDK 0.2: los números de emit() se juntan y salen como mucho una vez por cuadro,
    // para no llenar el canal de mensajes si la app los calcula muchas veces.
    var pending = {}, hayPendientes = false;
    function flush() {
      hayPendientes = false;
      var p = pending; pending = {};
      Object.keys(p).forEach(function (k) { post({ type: 'data', id: k, value: p[k] }); });
    }
    function programa() {
      if (hayPendientes) return;
      hayPendientes = true;
      if (document.hidden) setTimeout(flush, 33); else requestAnimationFrame(flush);
    }

    window.addEventListener('message', function (e) {
      if (e.source !== window.parent) return;
      var m = e.data;
      if (!m || m.ns !== NS) return;
      switch (m.type) {
        case 'setParam': applyValue(m.id, m.value); break;
        case 'applyState':
          Object.keys(m.values || {}).forEach(function (k) { applyValue(k, m.values[k]); });
          break;
        case 'trigger': if (typeof def.onTrigger === 'function') def.onTrigger(m.id); break;
        case 'getState': post({ type: 'state', reqId: m.reqId, values: Object.assign({}, values) }); break;
        case 'resize':
          def.canvas.width = m.width; def.canvas.height = m.height;
          if (typeof def.onResize === 'function') def.onResize(m.width, m.height);
          break;
        case 'transport':
          mode = m.mode;
          if (mode === 'bitmap' && !running) bitmapLoop();
          break;
        case 'start': if (typeof def.onStart === 'function') def.onStart(); break;
        case 'stop': if (typeof def.onStop === 'function') def.onStop(); break;
        case 'hud': if (typeof def.onHud === 'function') def.onHud(!!m.visible); break;
        case 'welcome':
          host = { host: m.host, version: m.version, sdk: m.sdk, width: m.width, height: m.height, calidad: m.calidad };
          if (typeof def.onHost === 'function') def.onHost(host);
          break;
        case 'ping': sayHello(); break;
      }
    });

    function sayHello() {
      post({
        type: 'hello',
        manifest: {
          protocol: NS,
          sdk: SDK,
          id: def.id,
          name: def.name || def.id,
          version: def.version || '0',
          author: def.author || '',
          outputs: def.outputs || ['video'],
          params: params,
          data: data
        }
      });
    }

    // El host lee esto directamente cuando comparte origen (transporte "direct").
    window.__artefacto = { canvas: def.canvas, values: values };

    var api = {
      values: values,
      inHost: inHost,
      set: function (id, v) { values[id] = v; post({ type: 'param', id: id, value: v }); },
      status: function (text) { post({ type: 'status', text: String(text) }); },
      emit: function (id, v) { var n = +v; if (!isFinite(n)) return; pending[id] = n; programa(); },
      fire: function (id) { post({ type: 'event', id: String(id) }); },
      get mode() { return mode; },
      get host() { return host; }
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sayHello);
    else sayHello();
    return api;
  }

  window.Artefacto = { register: register, NS: NS, SDK: SDK };
})();
```
<!-- /SDK -->
