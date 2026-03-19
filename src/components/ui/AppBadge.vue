<script setup lang="ts">
defineProps<{
  color?: string
  label: string
  size?: 'sm' | 'md'
}>()
</script>

<template>
  <span
    :style="color ? { backgroundColor: color + '22', color, borderColor: color + '44' } : {}"
    :class="[
      'inline-flex items-center rounded-md border font-mono font-medium tracking-wide uppercase',
      size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]',
      !color ? 'bg-[#1a1a24] text-[#8888aa] border-[#2a2a3a]' : ''
    ]"
  >
    {{ label }}
  </span>
</template>
