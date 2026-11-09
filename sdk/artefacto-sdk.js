/*
 * Artefacto SDK 0.2 · protocolo artefacto/v0
 * Conecta cualquier app web (un "artefacto") con el host aurigaQ.
 * Alchemy of Meaning (Alquimia del Significado) · Héctor Cruz Juárez · GPL-3.0-or-later
 *
 * Uso mínimo dentro de la app:
 *   <script src="../sdk/artefacto-sdk.js"></script>
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
