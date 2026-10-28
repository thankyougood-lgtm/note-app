/* ==========================================================================
   FOLDERS — All folder-related logic (Create, Read, Update, Delete)
   ========================================================================== */

const FOLDERS_KEY = 'noteapp_folders';

function getFoldersStorage() {
  const data = localStorage.getItem(FOLDERS_KEY);
  return data ? JSON.parse(data) : [];
}

function setFoldersStorage(folders) {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

function getAllFolders() {
  return getFoldersStorage();
}

function createFolder(name) {
  const folders = getFoldersStorage();
  const folder = {
    id: generateId(),
    name: name || 'Untitled Folder',
    createdAt: Date.now()
  };
  folders.unshift(folder);
  setFoldersStorage(folders);
  return folder;
}

function renameFolder(id, newName) {
  const folders = getFoldersStorage();
  const folder = folders.find(f => f.id === id);
  if (folder) {
    folder.name = newName;
    setFoldersStorage(folders);
  }
}

function deleteFolder(id) {
  const folders = getFoldersStorage().filter(f => f.id !== id);
  setFoldersStorage(folders);
}
