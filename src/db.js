// db.js
const DB_NAME = "MedicionesDB";
const STORE_NAME = "Mediciones";

export function abrirBD() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      // Creamos la “tabla” con clave autoincremental
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "Id", autoIncrement: true });
        store.createIndex("Timestamp", "Timestamp");
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function insertarMedicion(registro) {
  const db = await abrirBD();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).add(registro);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function obtenerUltimaMedicion() {
  const db = await abrirBD();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const cursorReq = store.openCursor(null, "prev"); // Último insertado
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;
      resolve(cursor ? cursor.value : null);
    };
    cursorReq.onerror = () => reject(cursorReq.error);
  });
}
