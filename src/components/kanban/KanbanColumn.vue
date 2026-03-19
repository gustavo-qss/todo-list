<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import TaskCard from './TaskCard.vue'
import type { Task, KanbanColumn, KanbanStatus } from '@/types'

defineProps<{
  column: KanbanColumn
}>()

const tasks = defineModel<Task[]>({ required: true })

const emit = defineEmits<{
  statusChange: [taskId: string, status: KanbanStatus]
}>()
</script>

<template>
  <div class="flex flex-col min-w-[280px] w-[280px] md:w-auto md:flex-1 max-w-xs md:max-w-none">
    <!-- Column header -->
    <div class="flex items-center justify-between mb-3 px-1">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: column.color }" />
        <h3 class="text-xs font-semibold text-[#8888aa] uppercase tracking-wider">
          {{ column.label }}
        </h3>
      </div>
      <span class="text-xs font-mono text-[#55556a] bg-[#1a1a24] px-1.5 py-0.5 rounded-md border border-[#2a2a3a]">
        {{ tasks.length }}
      </span>
    </div>

    <!-- Column body -->
    <div
      class="flex-1 rounded-xl bg-[#0d0d14] border border-[#1a1a24] p-2 min-h-[120px]"
      :style="{ borderTopColor: column.color + '40' }"
    >
      <VueDraggable
        v-model="tasks"
        :group="{ name: 'tasks', pull: true, put: true }"
        item-key="id"
        :animation="200"
        ghost-class="sortable-ghost"
        chosen-class="sortable-chosen"
        class="flex flex-col gap-2 min-h-[80px]"
        @add="(evt: any) => {
          const taskId = evt.item.dataset.id
          if (taskId) emit('statusChange', taskId, column.id)
        }"
      >
        <div v-for="task in tasks" :key="task.id" :data-id="task.id">
          <TaskCard :task="task" />
        </div>
      </VueDraggable>
    </div>
  </div>
</template>
