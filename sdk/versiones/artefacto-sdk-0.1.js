/*
 * Artefacto SDK 0.1 · protocolo artefacto/v0
 * Conecta cualquier app web (un "artefacto") con el host aurigaQ.
 *
 * Uso mínimo dentro de la app:
 *   <script src="../sdk/artefacto-sdk.js"></script>
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
