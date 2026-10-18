/* ===== Warehouse: the only file that talks to IndexedDB ===== */
import { upgradeNote } from "./model.js";

const DB_NAME = "note-or-not"; // keep this name, or saved notes disappear
const DB_VERSION = 2;          // 1 = the first app, 2 = folders store + upgraded notes
const NOTES = "notes";
const FOLDERS = "folders";
let db;

// Open (or create, or upgrade) the database. Call once at start-up.
export async function initDB() {
  db = await new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    // Runs only when the stored version is older than DB_VERSION
    req.onupgradeneeded = (event) => {
      const database = req.result;
      const tx = req.transaction;
      const from = event.oldVersion; // 0 = brand new, 1 = the old v1 database

      if (from < 1) {
        database.createObjectStore(NOTES, { keyPath: "id", autoIncrement: true });
      }

      if (from < 2) {
        // a place for folders (used by a later feature)
        database.createObjectStore(FOLDERS, { keyPath: "id", autoIncrement: true });

        // give every old note the new fields
        tx.objectStore(NOTES).openCursor().onsuccess = (e) => {
          const cursor = e.target.result;
          if (!cursor) return;
          cursor.update(upgradeNote(cursor.value));
          cursor.continue();
        };
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () =>
      console.log("Database upgrade is waiting: close other tabs of this app.");
  });

  // if a newer version of the app opens in another tab, let it upgrade
  db.onversionchange = () => db.close();
}

// Run one action on the notes store inside a transaction
function run(mode, action) {
  return new Promise((resolve, reject) => {
    const t = db.transaction(NOTES, mode);
    const request = action(t.objectStore(NOTES));
    t.oncomplete = () => resolve(request ? request.result : undefined);
    t.onerror = () => reject(t.error);
  });
}

export const dbGetAll = () => run("readonly", (s) => s.getAll());
export const dbSave = (note) => run("readwrite", (s) => s.put(note));
export const dbDelete = (id) => run("readwrite", (s) => s.delete(id));
