import api from './client'

export async function toggleLike(userId: string, itemId: string, itemType: string) {
  return api.post('/likes/toggle', { userId, itemId, itemType })
}

export async function getLikeStatus(userId: string, itemId: string, itemType: string) {
  return api.get(`/likes/status/${userId}/${itemId}/${itemType}`)
}
