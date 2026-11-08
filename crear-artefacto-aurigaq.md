# Crear un artefacto para aurigaQ (aQ)

Documento para iniciar un chat nuevo que construya un artefacto (una pieza visual o sonora en HTML) que se cargue en aurigaQ. Pégalo o adjúntalo al principio y luego describe la pieza.

## Qué es un artefacto

- Una app web de la colección *Alchemy of Meaning (Alquimia del Significado)*, en un solo archivo `index.html`, sin conexión, con licencia GPL-3.0-or-later.
- aurigaQ la carga en un iframe del mismo servidor, toma la imagen de **un canvas** y le genera controles a partir de sus **parámetros**.
- Cada cue de aurigaQ puede guardar un estado de esos parámetros y lo interpola al dispararse. Por eso el diseño de los parámetros es la parte más importante.

## Reglas

1. **Un canvas de salida.** Todo lo que deba verse en el proyector se dibuja en el canvas que se registra. aurigaQ no ve el DOM, el CSS ni las capas HTML.
2. **Resolución del host.** Al recibir `resize` (`onResize(w, h)`), el canvas toma ese tamaño y la pieza se adapta. No fijes 1280 × 720.
3. **Sin pantalla de inicio dentro del host.** Si `art.inHost` es verdadero, la pieza no muestra pantallas de bienvenida ni pide clics. Arranca en `onStart` y libera recursos (audio, cámara, procesos) en `onStop`. aQ detiene los artefactos que salen de escena, así que `onStop` debe liberar de verdad.
4. **Interfaz propia opcional.** Dentro de aurigaQ empieza oculta. `onHud(true/false)` la muestra u oculta cuando el operador pide «interfaz propia».
5. **Parámetros pensados para cues.**
   - `float` e `int` para lo que deba transformarse con suavidad (se interpolan).
   - `enum` y `bool` para cambios de estado (cambian al final de la transición).
   - `color` para tintas.
   - `trigger` para eventos (un destello, otra imagen, un golpe de sonido).
   - Rangos con sentido escénico; nombres en español; entre 4 y 12 parámetros.
6. **No dupliques lo que hace aQ.** aurigaQ ya aplica a cada elemento escala, posición, rotación, espejo, tono, saturación, luminancia, contraste, recorte y grano. Los parámetros del artefacto son para su lenguaje propio, no para esas transformaciones.
7. **Lo que cambia la interfaz propia se avisa** con `art.set(id, valor)`, para que aurigaQ lo refleje y lo pueda guardar en un cue.
8. **Audio.** La pieza maneja su propio audio. Arráncalo en `onStart` y detenlo en `onStop`.
9. **Fuera del host** la pieza funciona sola, con su propia interfaz y su pantalla de inicio si la necesita.
10. **Estilo de la colección.**
    - Fondo negro, filetes blancos de 1 px y Arial a 11 px.
    - Ventanas con barra de título blanca.
    - Botones negros que se invierten al activarse.
    - Marca «i · nombre» que abre el «Acerca de» con la semblanza y la licencia.
11. **No congelar la página.** aQ pregunta a cada artefacto en uso, cada 10 s, si sigue vivo (`ping`; el SDK contesta solo). Si no contesta en 6 s, aQ lo recarga y le devuelve sus valores. Ningún cálculo debe bloquear la página más de un par de segundos: lo pesado se reparte entre cuadros o va en un Worker.
12. **Puede recargarse en cualquier momento.** Al abrir la ventana de salida, aQ recarga los artefactos allá una vez, y la vigilancia también puede recargarlos. La pieza debe arrancar limpia desde sus parámetros, sin depender de lo que pasó antes.

## Estados entre cues, sin recargar

aurigaQ (aQ) carga cada artefacto **una sola vez**. Los presets no viven en el artefacto ni en el SDK: viven en cada cue de aQ (el operador ajusta y pulsa «capturar»). Si el mismo artefacto está en dos cues seguidos, aQ no lo reinicia: solo lleva sus parámetros del estado de un cue al del siguiente, cuadro a cuadro, durante el tiempo de transición del cue.

Lo que esto le pide a la pieza:

- **Aplicar el valor en cada cuadro.** `onParam` puede llegar 60 veces por segundo durante una transición. Debe ser barato: guardar el valor y usarlo en el siguiente cuadro, nunca reconstruir la escena ni reiniciar la simulación.
- **Todo lo que deba fundirse es `float`.** Ejemplo para partículas: velocidad, turbulencia, gravedad, dispersión, tamaño, estela, brillo, `mezcla` 0–1 entre dos paletas o dos formas. Una paleta como `enum` cambia de golpe; una paleta como `float` se funde.
- **Cantidad sin saltos.** Si un parámetro crea o destruye partículas, que aparezcan o se apaguen gradualmente (alfa o tamaño), no de golpe.
- **Estados con nombre, opcional.** Si la pieza tiene «estados» internos (calma, tormenta, dispersión), exponlos como `float`s que los definen, o como un `float` «estado» 0–1 que interpola internamente entre ellos. Así un cue puede pasar de uno a otro en 8 s.
- **`enum`, `bool` y `trigger` para lo que sí debe ser un corte**: cambio de modo, invertir, un destello.
- **Nada de valores aleatorios nuevos al recibir un parámetro.** La pieza debe verse igual cada vez que llega al mismo estado, para que un cue sea repetible en función.

## Entrega

- Una carpeta con `index.html` (con el SDK pegado dentro), `LEEME.txt` y `LICENSE.txt`.
- **Recomendado:** dentro de la carpeta de aurigaQ, en `/app/aurigaq/artefactos/mi-pieza/`, y se carga con `artefactos/mi-pieza/` desde Biblioteca › artefactos › «+». Así queda guardada en el navegador y funciona sin internet en la sala.
- También funciona al lado de aurigaQ (`/app/mi-pieza/`, cargada con `../mi-pieza/`), pero fuera de su carpeta no queda guardada para trabajar sin conexión.
- Al pegar el SDK dentro del `index.html`, cualquier `</script>` que aparezca en un comentario o texto debe escribirse `<\/script>`; si no, cierra el script antes de tiempo y rompe la página.

## Pruebas de aceptación

1. Abierta sola, funciona con su interfaz.
2. Cargada en aurigaQ: aparece «conectado», sin pantalla de inicio, y con todos sus controles en el inspector.
3. Un cue que interpola dos estados de sus parámetros se ve suave.
4. Un `trigger` desde aurigaQ hace su evento.
5. Tres cues seguidos con el mismo artefacto y estados distintos: pasa de uno a otro sin reiniciarse, sin saltos y sin parpadeo.
6. Al sacarla de escena deja de consumir recursos (`onStop`).
7. Si cambia de resolución, se redibuja sin deformarse.
8. Con la ventana de salida abierta (el artefacto se recarga allá), vuelve con sus valores, sin pantalla de inicio, y sigue contestando a la vigilancia.

## Plantilla (artefactos/plantilla.html)

```html
<!doctype html>
<!--
  Plantilla de artefacto para aurigaQ (protocolo artefacto/v0, SDK 0.1).
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
    onParam(id,valor){v[id]=valor;sincronizarUI();},     // el host cambió un valor (cue, preset, control)
    onTrigger(id){if(id==='destello')destello=1;},       // el host disparó un evento
    onStart(){corriendo=true;},                         // entra a escena: arrancar audio, cámaras, procesos
    onStop(){corriendo=false;},                         // sale de escena: liberar recursos
    onHud(visible){document.body.classList.toggle('sinui',!visible);}
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
    t+=dt*v.vel;destello*=Math.pow(.05,dt);
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

## SDK 0.1 (pegar dentro del index.html, en lugar del script externo)

El `<\/script>` del comentario de uso ya va escapado, para que se pueda pegar tal cual dentro de un `<script>`.

```js
/*
 * Artefacto SDK 0.1 · protocolo artefacto/v0
 * Conecta cualquier app web (un "artefacto") con el host aurigaQ.
 *
 * Uso mínimo dentro de la app:
 *   <script src="../sdk/artefacto-sdk.js"><\/script>
 *   const art = Artefacto.register({
 *     id: 'mi-app', name: 'Mi app', version: '0.1',
 *     canvas: document.querySelector('canvas'),
 *     params: [ { id:'velocidad', type:'float', min:0, max:2, default:1 } ],
 *     onParam(id, value, values) { ... },   // el host cambió un parámetro
 *     onTrigger(id) { ... },                 // el host disparó un trigger
 *     onResize(w, h) { ... },                // el host fijó la resolución del canvas
 *     onStart() { ... }, onStop() { ... },   // el host arranca o detiene la pieza (sin pantalla de inicio)
 *     onHud(visible) { ... }                 // el host pide mostrar u ocultar la interfaz propia
 *   });
 *   art.set('velocidad', 1.4);  // avisar al host de un cambio hecho en la propia app
 *
 * Fuera del host la app funciona igual: el SDK no hace nada si no hay padre.
 */
(function () {
  'use strict';
  var NS = 'artefacto/v0';

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
    var values = {};
    params.forEach(function (p) { if (p.type !== 'trigger') values[p.id] = defaultFor(p); });

    var inHost = window.parent && window.parent !== window;
    var mode = 'none';
    var running = false;

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
        case 'ping': sayHello(); break;
      }
    });

    function sayHello() {
      post({
        type: 'hello',
        manifest: {
          protocol: NS,
          sdk: '0.1',
          id: def.id,
          name: def.name || def.id,
          version: def.version || '0',
          author: def.author || '',
          outputs: def.outputs || ['video'],
          params: params
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
      get mode() { return mode; }
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sayHello);
    else sayHello();
    return api;
  }

  window.Artefacto = { register: register, NS: NS };
})();
```
