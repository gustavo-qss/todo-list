<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppToast from '@/components/ui/AppToast.vue'
import { useOfflineSync } from '@/composables/useOfflineSync'

const { isOnline, pendingCount, syncing } = useOfflineSync()
</script>

<template>
  <RouterView />
  <AppToast />

  <!-- Offline / sync banner -->
  <Transition
    enter-active-class="transition duration-300"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-200"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2"
  >
    <div
      v-if="!isOnline || syncing"
      class="fixed bottom-4 left-4 z-[99] flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium shadow-xl"
      :class="syncing
        ? 'bg-[#7c6dfa]/10 border-[#7c6dfa]/30 text-[#c4b5fd]'
        : 'bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#f59e0b]'"
    >
      <svg v-if="syncing" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      <svg v-else class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M3 3l18 18M9.879 9.879A3 3 0 0012 15a3 3 0 002.121-.879"/>
      </svg>
      <span>
        {{ syncing
          ? `Sincronizando ${pendingCount} operaç${pendingCount === 1 ? 'ão' : 'ões'}...`
          : `Offline${pendingCount > 0 ? ` · ${pendingCount} pendente${pendingCount === 1 ? '' : 's'}` : ''}` }}
      </span>
    </div>
  </Transition>
</template>
