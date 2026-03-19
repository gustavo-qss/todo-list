/**
 * Offline queue using IndexedDB.
 * Operations that fail due to connectivity are stored and replayed when online.
 */

export type QueuedOperation =
  | { type: 'createTask'; payload: Record<string, unknown> }
  | { type: 'updateTask'; id: string; payload: Record<string, unknown> }
  | { type: 'deleteTask'; id: string }
  | { type: 'updateTaskStatus'; id: string; status: string }

interface QueueEntry {
  id?: number
  op: QueuedOperation
  timestamp: number
}

const DB_NAME = 'taskflow-offline'
const STORE_NAME = 'queue'
const DB_VERSION = 1

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function enqueue(op: QueuedOperation): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).add({ op, timestamp: Date.now() } satisfies QueueEntry)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function dequeue(): Promise<(QueueEntry & { id: number }) | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).openCursor()
    req.onsuccess = () => {
      const cursor = req.result
      resolve(cursor ? (cursor.value as QueueEntry & { id: number }) : null)
    }
    req.onerror = () => reject(req.error)
  })
}

export async function removeEntry(id: number): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function queueSize(): Promise<number> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).count()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}
