import api from './client'

export async function getComments(itemId: string, itemType: string) {
  return api.get(`/comments/${itemId}/${itemType}`)
}

export async function addComment(userId: string, userName: string, itemId: string, itemType: string, content: string) {
  return api.post('/comments', { userId, userName, itemId, itemType, content })
}

export async function deleteComment(id: string) {
  return api.delete(`/comments/${id}`)
}
