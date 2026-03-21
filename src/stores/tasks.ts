import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Task, TaskType, KanbanStatus } from '@/types'
import { supabase } from '@/lib/supabase'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const taskTypes = ref<TaskType[]>([])
  const loading = ref(false)

  async function fetchTaskTypes() {
    const { data, error } = await supabase
      .from('task_types')
      .select('*')
      .order('name')
    if (error) throw error
    taskTypes.value = data ?? []
  }

  async function fetchTasks() {
    loading.value = true
    const { data, error } = await supabase
      .from('tasks')
      .select(`*, task_types(*), task_attachments(*)`)
      .order('created_at', { ascending: false })
    loading.value = false
    if (error) throw error
    tasks.value = data ?? []
  }

  async function getTask(id: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select(`*, task_types(*), task_attachments(*)`)
      .eq('id', id)
      .single()
    if (error) return tasks.value.find(t => t.id === id) ?? null
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
    const { data, error } = await supabase
      .from('tasks')
      .update(updated)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    const idx = tasks.value.findIndex(t => t.id === id)
    if (idx !== -1) tasks.value[idx] = { ...tasks.value[idx], ...data }
    return data as Task
  }

  async function updateTaskStatus(id: string, status: KanbanStatus) {
    // Optimistic local update for instant kanban feedback
    const idx = tasks.value.findIndex(t => t.id === id)
    if (idx !== -1) tasks.value[idx].status = status

    const { error } = await supabase
      .from('tasks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) {
      if (idx !== -1) await fetchTasks()
      throw error
    }
  }

  async function deleteTask(id: string) {
    tasks.value = tasks.value.filter(t => t.id !== id)

    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) {
      await fetchTasks()
      throw error
    }
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
