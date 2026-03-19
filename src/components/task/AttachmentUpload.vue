<script setup lang="ts">
import { ref } from 'vue'
import type { TaskAttachment } from '@/types'

defineProps<{
  attachments: TaskAttachment[]
  uploading?: boolean
}>()

const emit = defineEmits<{
  upload: [File[]]
  remove: [TaskAttachment]
}>()

const dragOver = ref(false)
const fileInput = ref<HTMLInputElement>()

function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files?.length) emit('upload', Array.from(files))
}

function onDrop(e: DragEvent) {
  dragOver.value = false
  const files = Array.from(e.dataTransfer?.files ?? []).filter(
    f => f.type.startsWith('image/') || f.type === 'application/pdf'
  )
  if (files.length) emit('upload', files)
}
</script>

<template>
  <div class="space-y-3">
    <!-- Upload area -->
    <div
      :class="[
        'relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer',
        dragOver
          ? 'border-[#7c6dfa] bg-[#7c6dfa]/5'
          : 'border-[#2a2a3a] hover:border-[#3a3a50] bg-[#1a1a24]'
      ]"
      @click="fileInput?.click()"
      @dragover.prevent="dragOver = true"
      @dragleave="dragOver = false"
      @drop.prevent="onDrop"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/*,.pdf"
        multiple
        class="hidden"
        @change="onFileChange"
      />
      <div class="flex flex-col items-center gap-2">
        <div class="w-10 h-10 rounded-full bg-[#22223a] flex items-center justify-center">
          <svg v-if="!uploading" class="w-5 h-5 text-[#8888aa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"/>
          </svg>
          <svg v-else class="w-5 h-5 text-[#7c6dfa] animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
        <div>
          <p class="text-sm text-[#8888aa]">
            {{ uploading ? 'Enviando...' : 'Clique ou arraste arquivos aqui' }}
          </p>
          <p class="text-xs text-[#55556a] mt-0.5">Imagens e PDFs aceitos</p>
        </div>
      </div>
    </div>

    <!-- Attachment list -->
    <div v-if="attachments.length" class="grid grid-cols-2 sm:grid-cols-3 gap-2">
      <div
        v-for="att in attachments"
        :key="att.id"
        class="relative group rounded-lg overflow-hidden border border-[#2a2a3a] bg-[#1a1a24]"
      >
        <!-- Image preview -->
        <img
          v-if="att.file_type === 'image'"
          :src="att.file_url"
          :alt="att.file_name"
          class="w-full h-20 object-cover"
        />
        <!-- PDF preview -->
        <div
          v-else
          class="w-full h-20 flex flex-col items-center justify-center gap-1"
        >
          <svg class="w-8 h-8 text-[#ef4444]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8.5 17.5v-5h1.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5H9.5v2H8.5zm2.5-3c.28 0 .5-.22.5-.5s-.22-.5-.5-.5H9.5v1H11zm3 3v-5h1c1.1 0 2 .9 2 2v1c0 1.1-.9 2-2 2h-1zm1-4v3c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1zm3 0v1.5h1v1h-1v1.5h-1v-5h2.5v1H16z"/>
          </svg>
          <span class="text-xs text-[#8888aa] truncate px-2 w-full text-center">{{ att.file_name }}</span>
        </div>

        <!-- Remove button -->
        <button
          type="button"
          class="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#ef4444]"
          @click.stop="emit('remove', att)"
        >
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
