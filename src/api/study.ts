import api from './client'

export async function getStudyResources(type?: string) {
  const params = new URLSearchParams()
  if (type) params.set('type', type)
  return api.get(`/study?${params}`)
}

export async function createStudyResource(data: any) {
  return api.post('/study', data)
}
