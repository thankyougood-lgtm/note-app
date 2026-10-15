/* ===== Warehouse: the only file that talks to IndexedDB ===== */

const DB_NAME = "note-or-not"; // keep this name, or saved notes disappear
const STORE = "notes";
let db;

// Open (or create) the database. Call once at start-up.
export async function initDB() {
  db = await new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Run one action inside a transaction
function run(mode, action) {
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const request = action(t.objectStore(STORE));
    t.oncomplete = () => resolve(request ? request.result : undefined);
    t.onerror = () => reject(t.error);
  });
}

export const dbGetAll = () => run("readonly", (s) => s.getAll());
export const dbSave = (note) => run("readwrite", (s) => s.put(note));
export const dbDelete = (id) => run("readwrite", (s) => s.delete(id));