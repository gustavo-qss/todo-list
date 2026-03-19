<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import AppBadge from '@/components/ui/AppBadge.vue'
import type { Task } from '@/types'
import { PRIORITY_CONFIG } from '@/types'

const props = defineProps<{ task: Task }>()
const router = useRouter()

const isOverdue = computed(() => {
  if (!props.task.due_date) return false
  return dayjs(props.task.due_date).isBefore(dayjs(), 'day')
})

const formattedDue = computed(() => {
  if (!props.task.due_date) return null
  return dayjs(props.task.due_date).format('DD/MM/YY')
})

const hasAttachments = computed(() =>
  (props.task.task_attachments?.length ?? 0) > 0
)
</script>

<template>
  <div
    class="group bg-[#111118] border border-[#2a2a3a] hover:border-[#3a3a50] rounded-xl p-3.5 cursor-pointer
           transition-all duration-200 hover:shadow-lg hover:shadow-black/30 active:scale-[0.98]
           hover:-translate-y-0.5"
    @click="router.push(`/task/${task.id}`)"
  >
    <!-- Title -->
    <p class="text-sm font-medium text-[#f0f0f5] leading-snug mb-2.5 line-clamp-2">
      {{ task.title }}
    </p>

    <!-- Badges row -->
    <div class="flex flex-wrap items-center gap-1.5">
      <AppBadge
        v-if="task.task_types"
        :label="task.task_types.name"
        :color="task.task_types.color"
        size="sm"
      />
      <AppBadge
        v-if="task.priority"
        :label="PRIORITY_CONFIG[task.priority].label"
        :color="PRIORITY_CONFIG[task.priority].color"
        size="sm"
      />
    </div>

    <!-- Footer -->
    <div
      v-if="formattedDue || hasAttachments"
      class="flex items-center justify-between mt-2.5 pt-2 border-t border-[#1a1a24]"
    >
      <span
        v-if="formattedDue"
        :class="[
          'flex items-center gap-1 text-[11px] font-medium font-mono',
          isOverdue ? 'text-[#ef4444]' : 'text-[#55556a]'
        ]"
      >
        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        {{ formattedDue }}
      </span>
      <span v-else />
      <span v-if="hasAttachments" class="flex items-center gap-1 text-[11px] text-[#55556a]">
        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
        </svg>
        {{ task.task_attachments?.length }}
      </span>
    </div>
  </div>
</template>
