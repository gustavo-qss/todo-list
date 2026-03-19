<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, remove } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <TransitionGroup
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-2 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl max-w-sm text-sm font-medium"
          :class="
            toast.type === 'success'
              ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]'
              : toast.type === 'error'
              ? 'bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]'
              : 'bg-[#7c6dfa]/10 border-[#7c6dfa]/30 text-[#c4b5fd]'
          "
          @click="remove(toast.id)"
        >
          <span v-if="toast.type === 'success'">✓</span>
          <span v-else-if="toast.type === 'error'">✕</span>
          <span v-else>●</span>
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
