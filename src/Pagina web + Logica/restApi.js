const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const fs = require("fs");
const BaseDatos = require("./baseDatos.js");

const rutaBD = path.join(__dirname, "registros.db");
const bd = new BaseDatos(rutaBD);

const app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname));

// log de errores
function logError(error) {
  const linea = `${new Date().toISOString()} - ${error.stack || error.message}\n`;
  fs.appendFileSync(path.join(__dirname, "errores.log"), linea, { encoding: "utf8" });
}

// insertar nuevo registro
app.put("/datos/nuevo", async (req, res) => {
  try {
    const id = await bd.insertarRegistro(req.body);
    res.json({ resultado: "ok", id });
  } catch (err) {
    logError(err);
    res.status(400).json({ error: err.message });
  }
});

// obtener último registro
app.get("/datos/ultimo", async (req, res) => {
  try {
    const ultimo = await bd.ultimoRegistro();
    res.json(ultimo || {});
  } catch (err) {
    logError(err);
    res.status(500).json({ error: "Error obteniendo registro" });
  }
});

// servir index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => {
  console.log(`Servidor escuchando en puerto ${PUERTO}`);
});
