// Standard built-in IndexedDB utility for storing large video Blobs with metadata locally.
// This allows Google Drive videos and uploaded files to be played fully offline and managed cleanly.

const DB_NAME = "EcoSphereOfflineDB";
const STORE_NAME = "videos";
const DB_VERSION = 2; // Incremented version to support rich objects

export interface OfflineVideo {
  id: string;
  name: string;
  blob: Blob;
  size?: number;
}

export function initOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not supported in this environment."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      // Upgrade store if needed or recreate it
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
      }
      db.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveOfflineVideo(id: string, name: string, blob: Blob, size?: number): Promise<void> {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const data: OfflineVideo = { id, name, blob, size };
    const request = store.put(data);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getOfflineVideo(id: string): Promise<OfflineVideo | null> {
  try {
    const db = await initOfflineDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB get error:", err);
    return null;
  }
}

export async function deleteOfflineVideo(id: string): Promise<void> {
  const db = await initOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAllOfflineVideos(): Promise<OfflineVideo[]> {
  try {
    const db = await initOfflineDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => resolve((request.result as OfflineVideo[]) || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB getAll error:", err);
    return [];
  }
}
