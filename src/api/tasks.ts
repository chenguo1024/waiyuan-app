import api from './client'

export async function getTasks(category?: string, status?: string, publisherId?: string, acceptedBy?: string) {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (status) params.set('status', status)
  if (publisherId) params.set('publisherId', publisherId)
  if (acceptedBy) params.set('acceptedBy', acceptedBy)
  return api.get(`/tasks?${params}`)
}

export async function createTask(data: any) {
  return api.post('/tasks', data)
}

export async function updateTask(id: string, data: any) {
  return api.put(`/tasks/${id}`, data)
}

export async function deleteTask(id: string) {
  return api.delete(`/tasks/${id}`)
}

export async function editTask(id: string, data: any) {
  return api.put(`/tasks/${id}/edit`, data)
}
