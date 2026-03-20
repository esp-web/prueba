const SUPABASE_URL = "https://ikkhybqhxnythbwlywfi.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlra2h5YnFoeG55dGhid2x5d2ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMzQ1OTUsImV4cCI6MjA4OTYxMDU5NX0.vV5r22jVdN_8Of2kv-QB-pt-hVZK2sZw7RBUEBv0u5A";

const { createClient } = window.supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let alumnosOriginales = [];
let alumnosFiltrados = [];

async function cargarAlumnos() {
  try {
    const { data, error } = await supabaseClient
      .from("alumnos")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    alumnosOriginales = data || [];
    alumnosFiltrados = [...alumnosOriginales];
    llenarTabla(alumnosFiltrados);
  } catch (error) {
    console.error("Error al cargar los alumnos:", error);
    mostrarMensaje("Error al cargar los alumnos", "error");
  }
}

function llenarTabla(alumnos) {
  const cuerpo = document.getElementById("cuerpoTabla");
  cuerpo.innerHTML = "";

  if (alumnos.length === 0) {
    cuerpo.innerHTML =
      '<tr><td colspan="10" class="sin-resultados">No se encontraron alumnos</td></tr>';
  } else {
    alumnos.forEach((alumno) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${alumno.id}</td>
        <td>${alumno.nombre}</td>
        <td>${alumno.apellido}</td>
        <td>${alumno.correo}</td>
        <td>${alumno.telefono || ""}</td>
        <td>${alumno.matricula || ""}</td>
        <td>${alumno.carrera || ""}</td>
        <td>${alumno.semestre || ""}</td>
        <td>${alumno.promedio || ""}</td>
        <td><button class="btn-eliminar" onclick="eliminarAlumno(${alumno.id})">Eliminar</button></td>
      `;
      cuerpo.appendChild(fila);
    });
  }

  const resultados = document.getElementById("resultados");
  resultados.textContent = `Mostrando ${alumnos.length} de ${alumnosOriginales.length} alumnos`;
}

function filtrarTabla() {
  const nombre = document.getElementById("filtroNombre").value.toLowerCase();
  const apellido = document
    .getElementById("filtroApellido")
    .value.toLowerCase();
  const carrera = document.getElementById("filtroCarrera").value.toLowerCase();
  const semestre = document.getElementById("filtroSemestre").value;

  alumnosFiltrados = alumnosOriginales.filter((alumno) => {
    const coincideNombre = alumno.nombre.toLowerCase().includes(nombre);
    const coincideApellido = alumno.apellido.toLowerCase().includes(apellido);
    const coincideCarrera = (alumno.carrera || "")
      .toLowerCase()
      .includes(carrera);
    const coincideSemestre = semestre === "" || alumno.semestre == semestre;

    return (
      coincideNombre && coincideApellido && coincideCarrera && coincideSemestre
    );
  });

  llenarTabla(alumnosFiltrados);
}

function limpiarFiltros() {
  document.getElementById("filtroNombre").value = "";
  document.getElementById("filtroApellido").value = "";
  document.getElementById("filtroCarrera").value = "";
  document.getElementById("filtroSemestre").value = "";
  alumnosFiltrados = [...alumnosOriginales];
  llenarTabla(alumnosFiltrados);
}

async function agregarAlumno(event) {
  event.preventDefault();

  const nuevoAlumno = {
    nombre: document.getElementById("nombre").value,
    apellido: document.getElementById("apellido").value,
    correo: document.getElementById("correo").value,
    telefono: document.getElementById("telefono").value,
    matricula: document.getElementById("matricula").value,
    carrera: document.getElementById("carrera").value,
    semestre: parseInt(document.getElementById("semestre").value) || 1,
    promedio: parseFloat(document.getElementById("promedio").value) || 0,
  };

  try {
    if (!nuevoAlumno.nombre || !nuevoAlumno.apellido || !nuevoAlumno.correo) {
      mostrarMensaje("Debe completar nombre, apellido y correo", "error");
      return;
    }

    const { error } = await supabaseClient
      .from("alumnos")
      .insert([nuevoAlumno]);

    if (error) throw error;

    mostrarMensaje("Alumno agregado correctamente", "exito");
    document.getElementById("formNuevoAlumno").reset();
    cargarAlumnos();
    limpiarFiltros();
  } catch (error) {
    console.error("Error:", error);
    mostrarMensaje("Error al agregar el alumno", "error");
  }
}

async function eliminarAlumno(id) {
  if (confirm("¿Está seguro de que desea eliminar este alumno?")) {
    try {
      const { error } = await supabaseClient
        .from("alumnos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      mostrarMensaje("Alumno eliminado correctamente", "exito");
      cargarAlumnos();
    } catch (error) {
      console.error("Error:", error);
      mostrarMensaje("Error al eliminar el alumno", "error");
    }
  }
}

function mostrarMensaje(texto, tipo) {
  const elemento = document.getElementById("mensajeForm");
  elemento.textContent = texto;
  elemento.className = `mensaje ${tipo}`;

  setTimeout(() => {
    elemento.textContent = "";
    elemento.className = "mensaje";
  }, 4000);
}

// Event listeners
document.getElementById("filtroNombre").addEventListener("input", filtrarTabla);
document
  .getElementById("filtroApellido")
  .addEventListener("input", filtrarTabla);
document
  .getElementById("filtroCarrera")
  .addEventListener("input", filtrarTabla);
document
  .getElementById("filtroSemestre")
  .addEventListener("input", filtrarTabla);
document
  .getElementById("limpiarFiltros")
  .addEventListener("click", limpiarFiltros);
document
  .getElementById("formNuevoAlumno")
  .addEventListener("submit", agregarAlumno);

// Acordeón
const btnAcordeon = document.getElementById("btnAcordeon");
const contenidoAcordeon = document.getElementById("contenidoAcordeon");

btnAcordeon.addEventListener("click", () => {
  btnAcordeon.classList.toggle("activo");
  contenidoAcordeon.classList.toggle("activo");
});

// Cargar alumnos al iniciar
document.addEventListener("DOMContentLoaded", cargarAlumnos);
