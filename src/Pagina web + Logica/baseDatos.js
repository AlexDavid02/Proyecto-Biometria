const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

function guardarError(msg) {
    const linea = `[${new Date().toLocaleString()}] ${msg}\n`;
    fs.appendFile(path.join(__dirname, "fallos.log"), linea, () => {});
}

class BaseDatos {
    constructor(ruta) {
        const fichero = path.resolve(ruta);
        this.con = new sqlite3.Database(fichero, (err) => {
            if (err) guardarError("Error abriendo BD: " + err.message);
        });

        this.con.run(`
            CREATE TABLE IF NOT EXISTS Registros (
                Codigo INTEGER PRIMARY KEY AUTOINCREMENT,
                Categoria TEXT NOT NULL,
                Medida REAL NOT NULL,
                Cuenta INTEGER DEFAULT 0,
                FechaHora TEXT NOT NULL
            )
        `, (err) => { if (err) guardarError(err.message); });
    }

    nuevoRegistro(info) {
        return new Promise((resolve, reject) => {
            const categoria = info.categoria || info.Categoria;
            const medida = parseFloat(info.medida || info.Medida);
            const cuenta = parseInt(info.cuenta || info.Cuenta) || 0;
            const fechaHora = info.fecha || info.Fecha || info.timestamp || info.Timestamp;

            if (!categoria || isNaN(medida) || !fechaHora) {
                return reject(new Error("Información incompleta"));
            }

            this.con.run(
                "INSERT INTO Registros (Categoria, Medida, Cuenta, FechaHora) VALUES (?,?,?,?)",
                [categoria, medida, cuenta, fechaHora],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    ultimoRegistro() {
        return new Promise((resolve, reject) => {
            this.con.get(
                "SELECT * FROM Registros ORDER BY Codigo DESC LIMIT 1",
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
