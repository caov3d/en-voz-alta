# Genera tapa_sensor_ir.stl con las mismas medidas del .scad (sin necesitar OpenSCAD).
# Uso: pip install manifold3d numpy && python3 generar_stl.py
import struct
from manifold3d import Manifold

ancho, alto, holgura, fondo, pared = 50, 25, 6, 20, 2.4

def caja(x, y, z, tx, ty, tz):
    return Manifold.cube((x, y, z)).translate((tx, ty, tz))

pieza = (caja(ancho + 2*pared, pared + holgura + fondo, pared + alto + pared, 0, 0, 0)
         - caja(ancho, holgura + 0.01, alto, pared, pared, pared)
         - caja(ancho + 2*pared + 2, fondo + 1, alto + pared + 1, -1, pared + holgura, pared))

malla = pieza.to_mesh()
v, t = malla.vert_properties, malla.tri_verts
with open("tapa_sensor_ir.stl", "wb") as f:
    f.write(b"tapa sensor IR".ljust(80, b" "))
    f.write(struct.pack("<I", len(t)))
    for a, b, c in t:
        f.write(struct.pack("<12fH", 0, 0, 0, *v[a][:3], *v[b][:3], *v[c][:3], 0))
print("Listo: tapa_sensor_ir.stl, volumen %.1f cm3" % (pieza.volume() / 1000))
