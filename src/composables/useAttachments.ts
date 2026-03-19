import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { TaskAttachment } from '@/types'

export function useAttachments() {
  const uploading = ref(false)

  async function uploadFile(taskId: string, file: File): Promise<TaskAttachment> {
    uploading.value = true
    try {
      const ext = file.name.split('.').pop()
      const path = `${taskId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('attachments')
        .getPublicUrl(path)

      const fileType: 'image' | 'pdf' = file.type === 'application/pdf' ? 'pdf' : 'image'

      const { data, error } = await supabase
        .from('task_attachments')
        .insert({
          task_id: taskId,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_type: fileType,
        })
        .select()
        .single()

      if (error) throw error
      return data as TaskAttachment
    } finally {
      uploading.value = false
    }
  }

  async function deleteAttachment(attachment: TaskAttachment) {
    const urlParts = attachment.file_url.split('/attachments/')
    if (urlParts.length > 1) {
      await supabase.storage.from('attachments').remove([urlParts[1]])
    }
    await supabase.from('task_attachments').delete().eq('id', attachment.id)
  }

  return { uploading, uploadFile, deleteAttachment }
}
