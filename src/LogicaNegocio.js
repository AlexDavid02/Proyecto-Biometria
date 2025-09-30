// main.js
import { guardarMedicion, obtenerUltimaMedicion } from './dbFake.js';

const form = document.getElementById("formMedicion");
const salida = document.getElementById("salida");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  try {
    const id = guardarMedicion({
      tipo: document.getElementById("tipo").value.trim(),
      valor: document.getElementById("valor").value,
      contador: document.getElementById("contador").value
    });
    salida.textContent = "Medición guardada con ID: " + id;
    form.reset();
  } catch (err) {
    salida.textContent = "Error: " + err.message;
  }
});

document.getElementById("btnUltima").addEventListener("click", () => {
  const ultima = obtenerUltimaMedicion();
  salida.textContent = ultima
    ? JSON.stringify(ultima, null, 2)
    : "No hay mediciones guardadas.";
});
