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
  enviar({ accion: 'escaneo', origen: (prefijo || '') + ORIGEN }).catch(function () {});
  try { sessionStorage.setItem(clave, '1'); } catch (e) {}
}

function enlaceFicha() {
  return location.origin + location.pathname.replace(/[^/]*$/, '') + 'ficha.html?o=' + encodeURIComponent(ORIGEN);
}
