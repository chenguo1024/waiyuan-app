import api from './client'

export async function getWallPosts() {
  return api.get('/wall')
}

export async function createWallPost(userId: string, userName: string, content: string, images?: string[]) {
  return api.post('/wall', { userId, userName, content, images })
}

export async function updateWallPost(id: string, content: string, images?: string[]) {
  return api.put(`/wall/${id}`, { content, images })
}

export async function deleteWallPost(id: string) {
  return api.delete(`/wall/${id}`)
}
