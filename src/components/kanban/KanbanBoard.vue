<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import KanbanColumn from './KanbanColumn.vue'
import { KANBAN_COLUMNS } from '@/types'
import type { Task, KanbanStatus } from '@/types'

const store = useTasksStore()

// Local mutable arrays per column — needed for vue-draggable-plus v-model
const localColumns = ref<Record<KanbanStatus, Task[]>>({
  backlog: [],
  in_progress: [],
  waiting: [],
  done: [],
})

function syncFromStore() {
  KANBAN_COLUMNS.forEach(col => {
    localColumns.value[col.id] = store.tasks.filter(t => t.status === col.id)
  })
}

// Sync whenever store tasks change (fetch, update, delete)
watch(() => store.tasks, syncFromStore, { deep: true })

onMounted(syncFromStore)

async function onStatusChange(taskId: string, status: KanbanStatus) {
  // Optimistic: local arrays already updated by vue-draggable-plus
  await store.updateTaskStatus(taskId, status)
}
</script>

<template>
  <div
    v-if="store.loading"
    class="flex items-center justify-center h-64 text-[#55556a] text-sm"
  >
    <svg class="animate-spin h-5 w-5 mr-2 text-[#7c6dfa]" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
    Carregando tarefas...
  </div>

  <div
    v-else
    class="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:snap-none scroll-smooth"
    style="scroll-padding: 16px;"
  >
    <KanbanColumn
      v-for="col in KANBAN_COLUMNS"
      :key="col.id"
      :column="col"
      v-model="localColumns[col.id]"
      class="snap-start"
      @status-change="onStatusChange"
    />
    <div class="min-w-4 md:hidden" aria-hidden="true" />
  </div>
</template>
