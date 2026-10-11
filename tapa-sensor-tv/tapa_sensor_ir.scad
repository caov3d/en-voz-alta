// Tapa para el sensor infrarrojo (IR) del televisor de la cartelera.
// Se pega con cinta doble faz (3M VHB) sobre el borde inferior del marco,
// justo donde está el sensor, y no deja pasar la señal de los celulares.
// Imprimir en PLA o PETG NEGRO, 100 % de relleno, con la cara grande sobre la cama.
//
// Medidas en milímetros. Ajuste solo estas cinco:
ancho   = 50;  // largo del marco que se tapa (el sensor queda en el medio)
alto    = 25;  // cuánto sube la tapa por el frente del marco
holgura = 6;   // espacio entre la tapa y el marco (para el bulto del sensor/LED)
fondo   = 20;  // cuánto entra la base por debajo del televisor (ahí va la cinta)
pared   = 2.4; // grosor de las paredes (2.4 mm = 6 líneas con boquilla de 0.4)

difference() {
  // Bloque completo
  cube([ancho + 2*pared, pared + holgura + fondo, pared + alto + pared]);

  // Hueco frente al sensor (abierto hacia el televisor)
  translate([pared, pared, pared])
    cube([ancho, holgura + 0.01, alto]);

  // Espacio que ocupa el televisor: la base queda debajo y la tapa delante
  translate([-1, pared + holgura, pared])
    cube([ancho + 2*pared + 2, fondo + 1, alto + pared + 1]);
}
