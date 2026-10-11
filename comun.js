// Lo que comparten el formulario corto (index.html) y la ficha (ficha.html).
// Programa de Google que guarda en la hoja privada del sindicato.
var ENDPOINT = 'https://script.google.com/macros/s/AKfycbykDRC_ClIg6aw_BS9NG8Hqdb0b8FPX-an8pwFUI5OlowfQEmwC5nZH2N1aomz3TzN_/exec';
var ORIGEN = (new URLSearchParams(location.search).get('o') || 'directo').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40) || 'directo';
var CLAVE_BORRADOR = 'evz-ficha-borrador';

function enviarUnaVez(datos, ms) {
  // texto plano y sin cookies: así no importa cuántas cuentas de Google tenga abiertas el celular
  var ctrl = window.AbortController ? new AbortController() : null;
  var reloj = ctrl ? setTimeout(function () { ctrl.abort(); }, ms) : null;
  return fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(datos),
    credentials: 'omit',
    redirect: 'follow',
    signal: ctrl ? ctrl.signal : undefined
  }).then(function (r) { return r.json(); })
    .finally(function () { if (reloj) clearTimeout(reloj); });
}

// Google a veces tarda en "despertar": se reintenta con el mismo id y el servidor no duplica.
function enviar(datos, alReintentar) {
  var esperas = [0, 2000, 4000];
  var i = 0;
  function intento() {
    return enviarUnaVez(datos, 20000).catch(function (e) {
      i++;
      if (i >= esperas.length) throw e;
      if (alReintentar) alReintentar(i);
      return new Promise(function (ok) { setTimeout(ok, esperas[i]); }).then(intento);
    });
  }
  return intento();
}

function nuevoId() {
  try { return crypto.randomUUID(); } catch (e) {}
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

function leerBorrador() {
  try { return JSON.parse(localStorage.getItem(CLAVE_BORRADOR) || '{}') || {}; } catch (e) { return {}; }
}

function guardarBorrador(obj) {
  try { localStorage.setItem(CLAVE_BORRADOR, JSON.stringify(obj)); } catch (e) {}
}

function borrarBorrador() {
  try { localStorage.removeItem(CLAVE_BORRADOR); } catch (e) {}
}

// cuenta el escaneo una sola vez por visita (si recarga, no se cuenta doble)
function contarEscaneo(prefijo) {
  var clave = 'evz-escaneo-' + (prefijo || '') + ORIGEN, visto = false;
  try { visto = sessionStorage.getItem(clave) === '1'; } catch (e) {}
  if (visto) return;
  enviar(datosMedicion({ accion: 'escaneo', origen: (prefijo || '') + ORIGEN })).catch(function () {});
  try { sessionStorage.setItem(clave, '1'); } catch (e) {}
}

function enlaceFicha() {
  return location.origin + location.pathname.replace(/[^/]*$/, '') + 'ficha.html?o=' + encodeURIComponent(ORIGEN);
}

// ---------- Medición anónima (11-oct-2026) ----------
// Nunca se manda nombre, número ni nada de lo que la persona escribe: solo un código al azar guardado en ESTE celular
// (para saber si son personas distintas o la misma que vuelve), el tipo de celular y por dónde va en la página.
var T0 = Date.now();
var VISITANTE = (function () {
  try {
    var v = localStorage.getItem('evz-visitante');
    if (!v) { v = Math.random().toString(36).slice(2, 10); localStorage.setItem('evz-visitante', v); }
    return v;
  } catch (e) { return 'sin-memoria'; }
})();
var VISITA = (function () {
  // número de visita de este celular (1 = primera vez). Una visita = una sesión del navegador.
  try {
    var n = Number(sessionStorage.getItem('evz-visita'));
    if (!n) {
      n = Number(localStorage.getItem('evz-visitas') || 0) + 1;
      localStorage.setItem('evz-visitas', String(n));
      sessionStorage.setItem('evz-visita', String(n));
    }
    return n;
  } catch (e) { return 0; }
})();
var EQUIPO = (function () {
  var ua = navigator.userAgent || '';
  var so = /iPhone|iPad|iPod/.test(ua) ? 'iPhone' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Computador Windows' : /Macintosh/.test(ua) ? 'Computador Mac' : 'Otro';
  var m = /Android[^;)]*;\s*([^;)]+?)(?:\s+Build|\))/.exec(ua);
  var modelo = so === 'iPhone' ? 'iPhone' : (m && m[1] && m[1] !== 'K' ? m[1] : '');
  var nav = /WhatsApp/i.test(ua) ? 'Dentro de WhatsApp' : /FBAN|FBAV|FB_IAB/.test(ua) ? 'Dentro de Facebook' : /Instagram/.test(ua) ? 'Dentro de Instagram' :
    /SamsungBrowser/.test(ua) ? 'Samsung Internet' : /CriOS|Chrome/.test(ua) ? 'Chrome' : /Safari/.test(ua) ? 'Safari' : /Firefox|FxiOS/.test(ua) ? 'Firefox' : 'Otro';
  return { sistema: so, modelo: modelo.slice(0, 40), navegador: nav };
})();
var ULTIMO_PASO = '';

function datosMedicion(extra) {
  var d = { origen: ORIGEN, visitante: VISITANTE, visita: VISITA, segundos: Math.round((Date.now() - T0) / 1000),
    sistema: EQUIPO.sistema, modelo: EQUIPO.modelo, navegador: EQUIPO.navegador, pantalla: (screen && screen.width) || 0 };
  for (var k in extra) d[k] = extra[k];
  return d;
}

// sendBeacon sigue funcionando aunque la persona ya se esté yendo de la página
function mandarSuelto(d) {
  var cuerpo = JSON.stringify(d);
  try { if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, new Blob([cuerpo], { type: 'text/plain;charset=utf-8' }))) return; } catch (e) {}
  enviarUnaVez(d, 8000).catch(function () {});
}

// Marca que la persona llegó a un punto. unaVez: no repetir en esta visita (si recarga o va y vuelve).
function marcarPaso(paso, detalle, unaVez) {
  if (unaVez !== false) {
    var clave = 'evz-paso-' + paso + '-' + ORIGEN, visto = false;
    try { visto = sessionStorage.getItem(clave) === '1'; sessionStorage.setItem(clave, '1'); } catch (e) {}
    if (visto) return;
  }
  if (paso !== 'error' && paso !== 'fallo') ULTIMO_PASO = paso;
  mandarSuelto(datosMedicion({ accion: 'paso', paso: paso, detalle: String(detalle || '').slice(0, 80) }));
}

// al salir (cerrar, cambiar de app, irse a otra página) se manda cuánto tiempo estuvo y hasta dónde llegó
(function () {
  var mandado = false;
  function salir() {
    if (mandado) return;
    mandado = true;
    mandarSuelto(datosMedicion({ accion: 'paso', paso: 'salio', detalle: ULTIMO_PASO || 'solo miró' }));
  }
  // una sola vez por página: si cambia de app y vuelve, cuenta el tiempo hasta la primera salida
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') salir(); });
  window.addEventListener('pagehide', salir);
})();
