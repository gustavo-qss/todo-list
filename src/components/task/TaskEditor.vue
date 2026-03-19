<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { watch } from 'vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [string]
}>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Link.configure({ openOnClick: false }),
    Placeholder.configure({
      placeholder: props.placeholder ?? 'Descreva a tarefa...',
    }),
  ],
  editorProps: {
    attributes: {
      class: 'tiptap-editor',
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

watch(() => props.modelValue, (val) => {
  if (editor.value && editor.value.getHTML() !== val) {
    editor.value.commands.setContent(val)
  }
})
</script>

<template>
  <div class="flex flex-col rounded-xl border border-[#2a2a3a] bg-[#1a1a24] overflow-hidden focus-within:border-[#7c6dfa] transition-colors">
    <!-- Toolbar -->
    <div v-if="editor" class="flex items-center gap-0.5 px-2 py-1.5 border-b border-[#2a2a3a]">
      <button
        v-for="btn in [
          { action: () => editor?.chain().focus().toggleBold().run(), icon: 'B', label: 'Negrito', active: editor?.isActive('bold') },
          { action: () => editor?.chain().focus().toggleItalic().run(), icon: 'I', label: 'Itálico', active: editor?.isActive('italic') },
        ]"
        :key="btn.label"
        type="button"
        :title="btn.label"
        :class="[
          'w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold transition-colors',
          btn.active ? 'bg-[#7c6dfa]/20 text-[#7c6dfa]' : 'text-[#8888aa] hover:bg-[#22223a] hover:text-[#f0f0f5]'
        ]"
        @click="btn.action()"
      >
        {{ btn.icon }}
      </button>
      <div class="w-px h-4 bg-[#2a2a3a] mx-1" />
      <button
        type="button"
        title="Lista"
        :class="[
          'w-7 h-7 flex items-center justify-center rounded-md transition-colors',
          editor?.isActive('bulletList') ? 'bg-[#7c6dfa]/20 text-[#7c6dfa]' : 'text-[#8888aa] hover:bg-[#22223a] hover:text-[#f0f0f5]'
        ]"
        @click="editor?.chain().focus().toggleBulletList().run()"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
      <button
        type="button"
        title="Lista numerada"
        :class="[
          'w-7 h-7 flex items-center justify-center rounded-md transition-colors',
          editor?.isActive('orderedList') ? 'bg-[#7c6dfa]/20 text-[#7c6dfa]' : 'text-[#8888aa] hover:bg-[#22223a] hover:text-[#f0f0f5]'
        ]"
        @click="editor?.chain().focus().toggleOrderedList().run()"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" d="M10 6h11M10 12h11M10 18h11M4 6h.01M4 12h.01M4 18h.01"/>
        </svg>
      </button>
    </div>

    <!-- Editor area -->
    <div class="tiptap-editor px-3 py-3">
      <EditorContent :editor="editor" />
    </div>
  </div>
</template>
