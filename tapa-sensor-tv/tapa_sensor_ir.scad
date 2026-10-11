// Tapa para el sensor infrarrojo (IR) del Samsung de 43" de la cartelera.
// En los Samsung Crystal UHD el sensor del control está debajo del televisor,
// en el centro, junto al botón de encendido. Esta tapa lo encierra por abajo,
// por delante y por los lados, y se pega con cinta 3M VHB:
//   - la pestaña de atrás y los bordes de arriba, contra la parte de abajo del TV;
//   - el borde de arriba del frente, contra el marco de la pantalla.
// Imprimir en PLA o PETG NEGRO, 100 % de relleno, acostada de lado.
//
// Medidas en milímetros. Ajuste solo estas:
ancho       = 80;  // ancho interior (el sensor y el botón quedan en el medio)
holgura     = 4;   // espacio entre el frente de la tapa y la pantalla
fondo       = 30;  // cuánto entra por debajo del televisor, desde la pantalla hacia atrás
alto_modulo = 15;  // espacio libre debajo del televisor para el botón/sensor
sube        = 15;  // cuánto sube el frente por delante del marco
pestana     = 15;  // pestaña de atrás para la cinta
pared       = 2.4; // grosor de las paredes (6 líneas con boquilla de 0.4)

W = ancho + 2*pared;
D = pared + holgura + fondo + pared;
techo = pared + alto_modulo; // altura donde queda la parte de abajo del TV

union() {
  // Bandeja que va debajo del televisor
  difference() {
    cube([W, D, techo]);
    translate([pared, pared, pared]) cube([ancho, holgura + fondo, alto_modulo + 1]);
  }
  // Frente que sube por delante del marco, cerrado arriba y a los lados
  difference() {
    translate([0, 0, techo]) cube([W, pared + holgura, sube + pared]);
    translate([pared, pared, techo - 0.01]) cube([ancho, holgura + 0.01, sube]);
  }
  // Pestaña de atrás para la cinta
  translate([0, D, techo - pared]) cube([W, pestana, pared]);
}
