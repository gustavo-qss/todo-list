import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Task, TaskType, KanbanStatus } from '@/types'
import { supabase } from '@/lib/supabase'
import { isOnline } from '@/composables/useOfflineSync'
import { enqueue } from '@/lib/offlineQueue'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const taskTypes = ref<TaskType[]>([])
  const loading = ref(false)

  async function fetchTaskTypes() {
    if (!isOnline.value) return
    const { data, error } = await supabase
      .from('task_types')
      .select('*')
      .order('name')
    if (error) throw error
    taskTypes.value = data ?? []
  }

  async function fetchTasks() {
    if (!isOnline.value) return
    loading.value = true
    const { data, error } = await supabase
      .from('tasks')
      .select(`*, task_types(*), task_attachments(*)`)
      .order('created_at', { ascending: false })
    if (error) { loading.value = false; throw error }
    tasks.value = data ?? []
    loading.value = false
  }

  async function getTask(id: string): Promise<Task | null> {
    // Try local cache first (offline fallback)
    const cached = tasks.value.find(t => t.id === id)
    if (!isOnline.value) return cached ?? null

    const { data, error } = await supabase
      .from('tasks')
      .select(`*, task_types(*), task_attachments(*)`)
      .eq('id', id)
      .single()
    if (error) return cached ?? null
    return data
  }

  type CreatePayload = {
    title: string
    body: string
    type_id: string
    priority: string | null
    due_date: string | null
    status: KanbanStatus
  }

  async function createTask(payload: CreatePayload) {
    const now = new Date().toISOString()
    const optimisticId = `local-${Date.now()}`

    if (!isOnline.value) {
      // Optimistic local insert
      const optimistic: Task = {
        id: optimisticId,
        ...payload,
        priority: payload.priority as Task['priority'],
        created_at: now,
        updated_at: now,
        task_types: taskTypes.value.find(t => t.id === payload.type_id),
        task_attachments: [],
      }
      tasks.value.unshift(optimistic)
      await enqueue({ type: 'createTask', payload: { ...payload, created_at: now, updated_at: now } })
      return optimistic
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...payload, created_at: now, updated_at: now })
      .select(`*, task_types(*), task_attachments(*)`)
      .single()
    if (error) throw error
    tasks.value.unshift(data as Task)
    return data as Task
  }

  async function updateTask(id: string, payload: Partial<Task>) {
    const updated = { ...payload, updated_at: new Date().toISOString() }

    // Optimistic local update always
    const idx = tasks.value.findIndex(t => t.id === id)
    if (idx !== -1) tasks.value[idx] = { ...tasks.value[idx], ...updated }

    if (!isOnline.value) {
      await enqueue({ type: 'updateTask', id, payload: updated })
      return tasks.value[idx]
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updated)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    if (idx !== -1) tasks.value[idx] = { ...tasks.value[idx], ...data }
    return data as Task
  }

  async function updateTaskStatus(id: string, status: KanbanStatus) {
    // Optimistic local update
    const idx = tasks.value.findIndex(t => t.id === id)
    if (idx !== -1) tasks.value[idx].status = status

    if (!isOnline.value) {
      await enqueue({ type: 'updateTaskStatus', id, status })
      return
    }

    const { error } = await supabase
      .from('tasks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  }

  async function deleteTask(id: string) {
    // Optimistic local removal
    tasks.value = tasks.value.filter(t => t.id !== id)

    if (!isOnline.value) {
      await enqueue({ type: 'deleteTask', id })
      return
    }

    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) throw error
  }

  return {
    tasks,
    taskTypes,
    loading,
    fetchTaskTypes,
    fetchTasks,
    getTask,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
  }
})
