<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import KanbanColumn from './KanbanColumn.vue'
import { KANBAN_COLUMNS } from '@/types'
import type { Task, KanbanStatus, KanbanColumn as KanbanColumnType } from '@/types'

const store = useTasksStore()

const localColumns = ref<Record<KanbanStatus, Task[]>>({
  backlog: [],
  in_progress: [],
  waiting: [],
  done: [],
})

const activeTab = ref<KanbanStatus>('backlog')

const mobileTabLabels: Record<KanbanStatus, string> = {
  backlog: 'Backlog',
  in_progress: 'Fazendo',
  waiting: 'Aguardando',
  done: 'Feito',
}

function syncFromStore() {
  KANBAN_COLUMNS.forEach(col => {
    localColumns.value[col.id] = store.tasks.filter(t => t.status === col.id)
  })
}

watch(() => store.tasks, syncFromStore, { deep: true })
onMounted(syncFromStore)

async function onStatusChange(taskId: string, status: KanbanStatus) {
  await store.updateTaskStatus(taskId, status)
}

function otherColumns(colId: KanbanStatus): KanbanColumnType[] {
  return KANBAN_COLUMNS.filter(c => c.id !== colId)
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

  <div v-else class="flex flex-col flex-1">
    <!-- ── Mobile: tab layout ── -->
    <div class="md:hidden flex flex-col flex-1">
      <!-- Tab bar -->
      <div class="flex border-b border-[#1a1a24] mb-3 -mx-4 px-4 overflow-x-auto">
        <button
          v-for="col in KANBAN_COLUMNS"
          :key="col.id"
          class="flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors relative whitespace-nowrap"
          :class="activeTab === col.id ? 'text-[#f0f0f5]' : 'text-[#55556a]'"
          @click="activeTab = col.id"
        >
          <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :style="{ backgroundColor: col.color }" />
          {{ mobileTabLabels[col.id] }}
          <span
            class="text-[10px] font-mono px-1 py-0.5 rounded"
            :style="activeTab === col.id
              ? { color: col.color, backgroundColor: col.color + '18' }
              : { color: '#55556a' }"
          >
            {{ localColumns[col.id].length }}
          </span>
          <!-- Active indicator -->
          <span
            v-if="activeTab === col.id"
            class="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
            :style="{ backgroundColor: col.color }"
          />
        </button>
      </div>

      <!-- Active column (v-show keeps drag state alive) -->
      <KanbanColumn
        v-for="col in KANBAN_COLUMNS"
        v-show="activeTab === col.id"
        :key="col.id"
        :column="col"
        v-model="localColumns[col.id]"
        :other-columns="otherColumns(col.id)"
        :mobile="true"
        @status-change="onStatusChange"
      />
    </div>

    <!-- ── Desktop: horizontal layout ── -->
    <div class="hidden md:flex gap-4 overflow-x-auto pb-4">
      <KanbanColumn
        v-for="col in KANBAN_COLUMNS"
        :key="col.id"
        :column="col"
        v-model="localColumns[col.id]"
        :other-columns="otherColumns(col.id)"
        class="snap-start"
        @status-change="onStatusChange"
      />
    </div>
  </div>
</template>
