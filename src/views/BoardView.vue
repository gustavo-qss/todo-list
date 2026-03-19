<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTasksStore } from '@/stores/tasks'
import KanbanBoard from '@/components/kanban/KanbanBoard.vue'

const router = useRouter()
const store = useTasksStore()

onMounted(() => {
  store.fetchTaskTypes()
  store.fetchTasks()
})

</script>

<template>
  <div class="min-h-svh bg-[#0a0a0f] flex flex-col">
    <!-- Header -->
    <header class="sticky top-0 z-10 bg-[#0a0a0f]/90 backdrop-blur-sm border-b border-[#1a1a24]">
      <div class="px-4 py-3 flex items-center justify-between max-w-full">
        <button
          class="flex items-center gap-2 text-sm text-[#8888aa] hover:text-[#f0f0f5] transition-colors py-1"
          @click="router.push('/')"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
          </svg>
          Home
        </button>

        <div class="flex items-center gap-2">
          <div class="w-5 h-5 rounded-md bg-[#7c6dfa]/20 border border-[#7c6dfa]/30 flex items-center justify-center">
            <svg class="w-3 h-3 text-[#7c6dfa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
            </svg>
          </div>
          <h1 class="text-sm font-semibold text-[#f0f0f5]">Board</h1>
        </div>

        <button
          class="flex items-center gap-1.5 bg-[#7c6dfa] hover:bg-[#9d8ffc] text-white text-sm font-medium
                 px-3 py-1.5 rounded-lg transition-colors"
          @click="router.push('/task/new')"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
          </svg>
          Nova
        </button>
      </div>
    </header>

    <!-- Board -->
    <div class="flex-1 p-4">
      <KanbanBoard />
    </div>
  </div>
</template>
