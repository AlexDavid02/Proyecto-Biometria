const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

class BaseDatos {
  constructor(fichero) {
    const ruta = path.resolve(fichero);
    this.db = new sqlite3.Database(ruta, (err) => {
      if (err) this._log(err);
    });

    this.db.run(`
      CREATE TABLE IF NOT EXISTS Registros (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        Categoria TEXT NOT NULL,
        Medida REAL NOT NULL,
        Cuenta INTEGER DEFAULT 0,
        Fecha TEXT NOT NULL
      )
    `, (err) => { if (err) this._log(err); });
  }

  _log(err) {
    const linea = `${new Date().toISOString()} - ${err.stack || err.message}\n`;
    fs.appendFileSync(path.join(__dirname, "errores.log"), linea, { encoding: "utf8" });
  }

  insertarRegistro(datos) {
    return new Promise((resolve, reject) => {
      const categoria = datos.categoria || datos.Categoria;
      const medida = Number(datos.medida || datos.Medida);
      const cuenta = parseInt(datos.cuenta || datos.Cuenta) || 0;
      const fecha = datos.fecha || datos.Fecha;

      if (!categoria || isNaN(medida) || !fecha) {
        return reject(new Error("Datos inválidos"));
      }

      this.db.run(
        "INSERT INTO Registros (Categoria, Medida, Cuenta, Fecha) VALUES (?,?,?,?)",
        [categoria, medida, cuenta, fecha],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  ultimoRegistro() {
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT * FROM Registros ORDER BY Id DESC LIMIT 1",
        [],
        (err, fila) => {
          if (err) reject(err);
          else resolve(fila);
        }
      );
    });
  }
}

module.exports = BaseDatos;
