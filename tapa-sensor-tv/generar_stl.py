# Genera tapa_sensor_ir.stl con las mismas medidas del .scad (sin necesitar OpenSCAD).
# Uso: pip install manifold3d numpy && python3 generar_stl.py
import struct
from manifold3d import Manifold

ancho, holgura, fondo, alto_modulo, sube, pestana, pared = 80, 4, 30, 15, 15, 15, 2.4

def caja(x, y, z, tx, ty, tz):
    return Manifold.cube((x, y, z)).translate((tx, ty, tz))

W = ancho + 2*pared
D = pared + holgura + fondo + pared
techo = pared + alto_modulo  # altura donde va la parte de abajo del televisor

pieza = (caja(W, D, techo, 0, 0, 0)
         - caja(ancho, holgura + fondo, alto_modulo + 1, pared, pared, pared)
         + caja(W, pared + holgura, sube + pared, 0, 0, techo)
         - caja(ancho, holgura + 0.01, sube, pared, pared, techo - 0.01)
         + caja(W, pestana, pared, 0, D, techo - pared))

malla = pieza.to_mesh()
v, t = malla.vert_properties, malla.tri_verts
with open("tapa_sensor_ir.stl", "wb") as f:
    f.write(b"tapa sensor IR Samsung 43".ljust(80, b" "))
    f.write(struct.pack("<I", len(t)))
    for a, b, c in t:
        f.write(struct.pack("<12fH", 0, 0, 0, *v[a][:3], *v[b][:3], *v[c][:3], 0))
print("Listo: tapa_sensor_ir.stl, %.1f x %.1f x %.1f mm, volumen %.1f cm3, genus %d"
      % (W, D + pestana, techo + sube + pared, pieza.volume() / 1000, pieza.genus()))
