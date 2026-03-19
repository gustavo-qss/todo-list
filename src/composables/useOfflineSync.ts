/**
 * Watches network status and flushes the offline queue when back online.
 * Call `startSync()` once in the app root.
 */
import { ref, onMounted, onUnmounted } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { dequeue, removeEntry, queueSize, type QueuedOperation } from '@/lib/offlineQueue'

export const isOnline = ref(navigator.onLine)
export const pendingCount = ref(0)
export const syncing = ref(false)

async function refreshPendingCount() {
  pendingCount.value = await queueSize()
}

async function applyOp(op: QueuedOperation) {
  const store = useTasksStore()
  switch (op.type) {
    case 'createTask':
      await store.createTask(op.payload as Parameters<typeof store.createTask>[0])
      break
    case 'updateTask':
      await store.updateTask(op.id, op.payload)
      break
    case 'deleteTask':
      await store.deleteTask(op.id)
      break
    case 'updateTaskStatus':
      await store.updateTaskStatus(op.id, op.status as Parameters<typeof store.updateTaskStatus>[1])
      break
  }
}

async function flushQueue() {
  if (syncing.value) return
  syncing.value = true
  try {
    let entry = await dequeue()
    while (entry) {
      await applyOp(entry.op)
      await removeEntry(entry.id)
      await refreshPendingCount()
      entry = await dequeue()
    }
    // Refresh tasks after flushing
    const store = useTasksStore()
    await store.fetchTasks()
  } catch (e) {
    console.warn('[OfflineSync] flush failed:', e)
  } finally {
    syncing.value = false
  }
}

function onOnline() {
  isOnline.value = true
  flushQueue()
}

function onOffline() {
  isOnline.value = false
}

export function useOfflineSync() {
  onMounted(async () => {
    await refreshPendingCount()
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    // If we're online and have pending ops (e.g. after app restart), flush now
    if (isOnline.value) await flushQueue()
  })

  onUnmounted(() => {
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)
  })

  return { isOnline, pendingCount, syncing }
}
