<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTasksStore } from '@/stores/tasks'
import { useAttachments } from '@/composables/useAttachments'
import { useToast } from '@/composables/useToast'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import TaskEditor from '@/components/task/TaskEditor.vue'
import AttachmentUpload from '@/components/task/AttachmentUpload.vue'
import type { Task, TaskAttachment, KanbanStatus, Priority } from '@/types'
import { KANBAN_COLUMNS, PRIORITY_CONFIG } from '@/types'

const route = useRoute()
const router = useRouter()
const store = useTasksStore()
const { uploading, uploadFile, deleteAttachment } = useAttachments()
const toast = useToast()

const isEditing = computed(() => !!route.params.id)
const taskId = computed(() => route.params.id as string)

const task = ref<Task | null>(null)
const loading = ref(false)
const saving = ref(false)
const showDeleteModal = ref(false)
const deleting = ref(false)

// Form state
const title = ref('')
const body = ref('')
const typeId = ref('')
const priority = ref<Priority | ''>('')
const dueDate = ref('')
const status = ref<KanbanStatus>('backlog')
const attachments = ref<TaskAttachment[]>([])

onMounted(async () => {
  await store.fetchTaskTypes()

  if (isEditing.value) {
    loading.value = true
    try {
      const t = await store.getTask(taskId.value)
      if (!t) { router.push('/'); return }
      task.value = t
      title.value = t.title
      body.value = t.body ?? ''
      typeId.value = t.type_id
      priority.value = t.priority ?? ''
      dueDate.value = t.due_date ?? ''
      status.value = t.status
      attachments.value = t.task_attachments ?? []
    } finally {
      loading.value = false
    }
  }
})

async function save() {
  if (!title.value.trim()) {
    toast.show('Título é obrigatório.', 'error')
    return
  }
  if (!typeId.value) {
    toast.show('Tipo de tarefa é obrigatório.', 'error')
    return
  }

  saving.value = true
  try {
    const payload = {
      title: title.value.trim(),
      body: body.value,
      type_id: typeId.value,
      priority: priority.value || null,
      due_date: dueDate.value || null,
      status: status.value,
    }

    if (isEditing.value) {
      await store.updateTask(taskId.value, payload)
      toast.show('Tarefa atualizada!', 'success')
      router.push('/board')
    } else {
      const created = await store.createTask(payload)
      // Upload pending attachments to new task
      for (const file of pendingFiles.value) {
        const att = await uploadFile(created.id, file)
        attachments.value.push(att)
      }
      pendingFiles.value = []
      toast.show('Tarefa criada!', 'success')
      router.push('/')
    }
  } catch (e) {
    toast.show('Erro ao salvar. Tente novamente.', 'error')
  } finally {
    saving.value = false
  }
}

const pendingFiles = ref<File[]>([])

async function onUpload(files: File[]) {
  if (isEditing.value) {
    for (const file of files) {
      try {
        const att = await uploadFile(taskId.value, file)
        attachments.value.push(att)
      } catch {
        toast.show('Erro ao enviar arquivo.', 'error')
      }
    }
  } else {
    pendingFiles.value.push(...files)
    // Create preview attachments for new tasks
    for (const file of files) {
      const url = URL.createObjectURL(file)
      attachments.value.push({
        id: `pending-${Date.now()}-${Math.random()}`,
        task_id: '',
        file_name: file.name,
        file_url: url,
        file_type: file.type === 'application/pdf' ? 'pdf' : 'image',
        created_at: new Date().toISOString(),
      })
    }
  }
}

async function onRemoveAttachment(att: TaskAttachment) {
  if (att.id.startsWith('pending-')) {
    attachments.value = attachments.value.filter(a => a.id !== att.id)
    pendingFiles.value = pendingFiles.value.filter((_, i) => {
      const idx = attachments.value.findIndex(a => a.id.includes('pending'))
      return i !== idx
    })
    return
  }
  try {
    await deleteAttachment(att)
    attachments.value = attachments.value.filter(a => a.id !== att.id)
  } catch {
    toast.show('Erro ao remover arquivo.', 'error')
  }
}

async function deleteTask() {
  deleting.value = true
  try {
    await store.deleteTask(taskId.value)
    toast.show('Tarefa removida.', 'info')
    router.push('/board')
  } catch {
    toast.show('Erro ao remover tarefa.', 'error')
  } finally {
    deleting.value = false
    showDeleteModal.value = false
  }
}

const selectedType = computed(() =>
  store.taskTypes.find(t => t.id === typeId.value)
)
</script>

<template>
  <div class="min-h-svh bg-[#0a0a0f]">
    <!-- Header -->
    <header class="sticky top-0 z-10 bg-[#0a0a0f]/90 backdrop-blur-sm border-b border-[#1a1a24]">
      <div class="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          class="flex items-center gap-2 text-sm text-[#8888aa] hover:text-[#f0f0f5] transition-colors py-1"
          @click="isEditing ? router.push('/board') : router.push('/')"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
          </svg>
          Voltar
        </button>
        <h1 class="text-sm font-semibold text-[#f0f0f5]">
          {{ isEditing ? 'Editar tarefa' : 'Nova tarefa' }}
        </h1>
        <div class="w-16" />
      </div>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center h-64 text-[#55556a] text-sm">
      <svg class="animate-spin h-5 w-5 mr-2 text-[#7c6dfa]" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>

    <!-- Form -->
    <form v-else class="max-w-2xl mx-auto px-4 py-6 space-y-5" @submit.prevent="save">

      <!-- Title -->
      <div>
        <input
          v-model="title"
          type="text"
          placeholder="Título da tarefa"
          class="w-full bg-transparent text-2xl font-bold text-[#f0f0f5] placeholder-[#2a2a3a]
                 outline-none border-b border-[#1a1a24] focus:border-[#7c6dfa] pb-2 transition-colors"
        />
      </div>

      <!-- Body editor -->
      <div>
        <label class="block text-xs font-medium text-[#8888aa] mb-2">Descrição</label>
        <TaskEditor v-model="body" placeholder="Descreva a tarefa..." />
      </div>

      <!-- Fields grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <!-- Task type -->
        <div>
          <label class="block text-xs font-medium text-[#8888aa] mb-2">
            Tipo <span class="text-[#ef4444]">*</span>
          </label>
          <div class="relative">
            <select
              v-model="typeId"
              class="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-xl px-4 py-3 text-base
                     text-[#f0f0f5] outline-none focus:border-[#7c6dfa] transition-colors appearance-none cursor-pointer"
              :class="!typeId ? 'text-[#55556a]' : ''"
            >
              <option value="" disabled>Selecione um tipo</option>
              <option v-for="t in store.taskTypes" :key="t.id" :value="t.id">
                {{ t.name }}
              </option>
            </select>
            <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <div v-if="selectedType" class="w-2 h-2 rounded-full" :style="{ backgroundColor: selectedType.color }" />
              <svg class="w-4 h-4 text-[#55556a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Priority -->
        <div>
          <label class="block text-xs font-medium text-[#8888aa] mb-2">Prioridade</label>
          <div class="relative">
            <select
              v-model="priority"
              class="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-xl px-4 py-3 text-base
                     text-[#f0f0f5] outline-none focus:border-[#7c6dfa] transition-colors appearance-none cursor-pointer"
            >
              <option value="">Sem prioridade</option>
              <option v-for="(cfg, key) in PRIORITY_CONFIG" :key="key" :value="key">
                {{ cfg.label }}
              </option>
            </select>
            <svg class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#55556a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
            </svg>
          </div>
        </div>

        <!-- Due date -->
        <div>
          <label class="block text-xs font-medium text-[#8888aa] mb-2">Data limite</label>
          <input
            v-model="dueDate"
            type="date"
            class="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-xl px-4 py-3 text-base
                   text-[#f0f0f5] outline-none focus:border-[#7c6dfa] transition-colors"
          />
        </div>

        <!-- Status (edit only) -->
        <div v-if="isEditing">
          <label class="block text-xs font-medium text-[#8888aa] mb-2">Status</label>
          <div class="relative">
            <select
              v-model="status"
              class="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-xl px-4 py-3 text-base
                     text-[#f0f0f5] outline-none focus:border-[#7c6dfa] transition-colors appearance-none cursor-pointer"
            >
              <option v-for="col in KANBAN_COLUMNS" :key="col.id" :value="col.id">
                {{ col.label }}
              </option>
            </select>
            <svg class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#55556a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Attachments -->
      <div>
        <label class="block text-xs font-medium text-[#8888aa] mb-2">Anexos</label>
        <AttachmentUpload
          :attachments="attachments"
          :uploading="uploading"
          @upload="onUpload"
          @remove="onRemoveAttachment"
        />
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3 pt-2">
        <AppButton type="submit" :loading="saving" size="lg" full>
          {{ isEditing ? 'Salvar alterações' : 'Criar tarefa' }}
        </AppButton>
        <AppButton variant="secondary" size="lg" @click="isEditing ? router.push('/board') : router.push('/')">
          Cancelar
        </AppButton>
      </div>

      <!-- Delete -->
      <div v-if="isEditing" class="pt-4 border-t border-[#1a1a24]">
        <AppButton variant="danger" size="sm" @click="showDeleteModal = true">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
          </svg>
          Remover tarefa
        </AppButton>
      </div>
    </form>
  </div>

  <!-- Delete confirmation modal -->
  <AppModal :show="showDeleteModal" title="Remover tarefa" @close="showDeleteModal = false">
    <p class="text-sm text-[#8888aa] mb-6">
      Tem certeza que deseja remover esta tarefa? Esta ação não pode ser desfeita.
    </p>
    <div class="flex gap-3">
      <AppButton variant="danger" :loading="deleting" full @click="deleteTask">
        Remover
      </AppButton>
      <AppButton variant="secondary" full @click="showDeleteModal = false">
        Cancelar
      </AppButton>
    </div>
  </AppModal>
</template>
