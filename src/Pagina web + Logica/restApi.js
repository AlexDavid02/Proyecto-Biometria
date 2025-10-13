const express = require("express");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const BaseDatos = require("./baseDatos.js");


// Inicialización del servidor
const aplicacion = express();



aplicacion.use(express.json()); // Para leer JSON del cuerpo de las peticiones
aplicacion.use(express.urlencoded({ extended: true })); // Para formularios, opcional

aplicacion.use((req, res, next) => {
  console.log("Petición recibida:", req.method, req.url);
  console.log("Headers:", req.headers["content-type"]);
  console.log("Body:", req.body);
  next();
});


// Inicializar la capa de acceso a datos
const archivoBD = path.join(__dirname, "registros.db");
const bd = new BaseDatos(archivoBD);

// Función de log
const escribirLog = (texto) => {
    const linea = `${new Date().toISOString()} :: ${texto}\n`;
    fs.appendFile(path.join(__dirname, "fallos.log"), linea, () => {});
};

// Endpoint para insertar un registro
aplicacion.post("/datos/nuevo", (req, res) => {
  console.log("📥 Cuerpo recibido en /datos/nuevo:", req.body);
  bd.nuevoRegistro(req.body)
    .then(id => res.send({ resultado: "ok", id }))
    .catch(err => {
      console.error("", err.message);
      res.status(400).send({ error: err.message });
    });
});



aplicacion.get("/datos/ultimo", async (req, res) => {
  try {
    const fila = await bd.ultimoRegistro();
    console.log("✅ Último registro leído:", fila);
    res.json(fila || {});
  } catch (err) {
    console.error("💥 Error en /datos/ultimo:", err);
    escribirLog(err.message);
    res.status(500).json({
      error: "No se pudo leer",
      detalle: err.message,
    });
  }
});


// Página principal
aplicacion.get("/", (_, resp) => {
    resp.sendFile(path.join(__dirname, "index.html"));
});

// Levantar el servidor
const PUERTO = process.env.PUERTO || 8080;
aplicacion.listen(PUERTO, () => console.log(`API disponible en http://localhost:${PUERTO}`));
