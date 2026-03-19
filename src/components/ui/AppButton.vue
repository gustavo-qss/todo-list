<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit'
  full?: boolean
}>()
</script>

<template>
  <button
    :type="type ?? 'button'"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 select-none cursor-pointer',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      full ? 'w-full' : '',
      // size
      size === 'sm' ? 'px-3 py-1.5 text-sm' :
      size === 'lg' ? 'px-6 py-4 text-base' :
      'px-4 py-2.5 text-sm',
      // variant
      variant === 'primary' || !variant
        ? 'bg-[#7c6dfa] hover:bg-[#9d8ffc] active:bg-[#6a5ce8] text-white focus-visible:ring-[#7c6dfa]'
        : variant === 'secondary'
        ? 'bg-[#1a1a24] hover:bg-[#22223a] border border-[#2a2a3a] hover:border-[#3a3a50] text-[#f0f0f5] focus-visible:ring-[#3a3a50]'
        : variant === 'danger'
        ? 'bg-[#ef4444]/10 hover:bg-[#ef4444]/20 border border-[#ef4444]/30 hover:border-[#ef4444]/50 text-[#ef4444] focus-visible:ring-[#ef4444]'
        : 'bg-transparent hover:bg-[#1a1a24] text-[#8888aa] hover:text-[#f0f0f5] focus-visible:ring-[#3a3a50]'
    ]"
  >
    <svg v-if="loading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
    <slot />
  </button>
</template>
