const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;

// Middleware
app.use(express.static(__dirname));
app.use(express.json());

const archivoAlumnos = path.join(__dirname, "alumnos.json");

// GET - Obtener todos los alumnos
app.get("/api/alumnos", (req, res) => {
  try {
    const datos = fs.readFileSync(archivoAlumnos, "utf8");
    res.json(JSON.parse(datos));
  } catch (error) {
    res.status(500).json({ error: "Error al leer los alumnos" });
  }
});

// POST - Agregar un nuevo alumno
app.post("/api/alumnos", (req, res) => {
  try {
    const datos = JSON.parse(fs.readFileSync(archivoAlumnos, "utf8"));
    const nuevoAlumno = req.body;

    // Generar ID automático
    const maxId = Math.max(...datos.alumnos.map((a) => a.id), 0);
    nuevoAlumno.id = maxId + 1;

    // Validar campos requeridos
    if (!nuevoAlumno.nombre || !nuevoAlumno.apellido || !nuevoAlumno.correo) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    datos.alumnos.push(nuevoAlumno);
    fs.writeFileSync(archivoAlumnos, JSON.stringify(datos, null, 2));
    res
      .status(201)
      .json({ mensaje: "Alumno agregado correctamente", alumno: nuevoAlumno });
  } catch (error) {
    res.status(500).json({ error: "Error al agregar el alumno" });
  }
});

// DELETE - Eliminar un alumno
app.delete("/api/alumnos/:id", (req, res) => {
  try {
    const datos = JSON.parse(fs.readFileSync(archivoAlumnos, "utf8"));
    const id = parseInt(req.params.id);

    datos.alumnos = datos.alumnos.filter((a) => a.id !== id);
    fs.writeFileSync(archivoAlumnos, JSON.stringify(datos, null, 2));

    res.json({ mensaje: "Alumno eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el alumno" });
  }
});

// PUT - Actualizar un alumno
app.put("/api/alumnos/:id", (req, res) => {
  try {
    const datos = JSON.parse(fs.readFileSync(archivoAlumnos, "utf8"));
    const id = parseInt(req.params.id);
    const alumnoIndex = datos.alumnos.findIndex((a) => a.id === id);

    if (alumnoIndex === -1) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    datos.alumnos[alumnoIndex] = { ...datos.alumnos[alumnoIndex], ...req.body };
    fs.writeFileSync(archivoAlumnos, JSON.stringify(datos, null, 2));

    res.json({
      mensaje: "Alumno actualizado correctamente",
      alumno: datos.alumnos[alumnoIndex],
    });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el alumno" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
