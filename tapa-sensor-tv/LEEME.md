# Tapa para el sensor IR del televisor de la cartelera

Una pieza en forma de L con paredes laterales. Va pegada al borde inferior del
marco del televisor, sobre el sensor infrarrojo, para que los celulares con emisor IR
no puedan apagarlo.

- `tapa_sensor_ir.stl`: lista para imprimir (50 mm de ancho, 25 mm de alto, 6 mm de espacio frente al sensor).
- `tapa_sensor_ir.scad`: la misma pieza en OpenSCAD, por si hay que cambiar las medidas.
- `generar_stl.py`: crea el STL otra vez si cambia las medidas sin tener OpenSCAD.

## Cómo imprimirla

- PLA o PETG **negro**. El blanco y los colores claros dejan pasar algo de infrarrojo.
- 100 % de relleno, paredes de 2.4 mm, sin soportes. Se imprime con la cara de atrás
  (la del lado del televisor) contra la cama.
- Para estar seguros, forre el hueco por dentro con cinta de aluminio.

## Cómo instalarla

1. Busque el sensor: casi siempre está en el borde de abajo, cerca del logo o de la luz de encendido.
   Si no lo ve, apunte el control desde cerca y tápelo con el dedo en distintos puntos hasta que deje de responder.
2. Limpie el marco con alcohol.
3. Pegue la base (debajo del televisor) y el borde de arriba (contra el frente del marco) con cinta 3M VHB.
4. Pruebe con el celular desde varios ángulos y distancias.

El control original del televisor también deja de funcionar. Para manejarlo se usan
los botones del televisor o se quita la tapa.
