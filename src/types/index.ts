export type KanbanStatus = 'backlog' | 'in_progress' | 'waiting' | 'done'
export type Priority = 'urgente' | 'alta' | 'media' | 'baixa'

export interface TaskType {
  id: string
  name: string
  color: string
  created_at?: string
}

export interface Task {
  id: string
  title: string
  body: string | null
  type_id: string
  priority: Priority | null
  due_date: string | null
  status: KanbanStatus
  created_at: string
  updated_at: string
  task_types?: TaskType
  task_attachments?: TaskAttachment[]
}

export interface TaskAttachment {
  id: string
  task_id: string
  file_name: string
  file_url: string
  file_type: 'image' | 'pdf'
  created_at: string
}

export interface KanbanColumn {
  id: KanbanStatus
  label: string
  color: string
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'backlog', label: 'Backlog', color: '#3b82f6' },
  { id: 'in_progress', label: 'In Progress', color: '#7c6dfa' },
  { id: 'waiting', label: 'Waiting for Dependencies', color: '#f59e0b' },
  { id: 'done', label: 'Done', color: '#10b981' },
]

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  urgente: { label: 'Urgente', color: '#ef4444' },
  alta: { label: 'Alta', color: '#f97316' },
  media: { label: 'Média', color: '#eab308' },
  baixa: { label: 'Baixa', color: '#6b7280' },
}

export const DEFAULT_TASK_TYPES: Omit<TaskType, 'id' | 'created_at'>[] = [
  { name: 'somos', color: '#c4b5fd' },
  { name: 'unifil', color: '#fb923c' },
  { name: 'casa', color: '#34d399' },
  { name: 'rawane', color: '#f472b6' },
]
