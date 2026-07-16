import api from './client'

export async function getConversations(userId: string) {
  return api.get(`/chat/conversations/${userId}`)
}

export async function getMessages(conversationId: string) {
  return api.get(`/chat/messages/${conversationId}`)
}

export async function sendMessage(senderId: string, receiverId: string, content: string) {
  return api.post('/chat/messages', { senderId, receiverId, content })
}

export async function markConversationRead(conversationId: string, userId: string) {
  return api.put(`/chat/conversations/${conversationId}/read`, { userId })
}

export async function getOrCreateConversation(userId: string, otherUserId: string) {
  return api.post('/chat/conversations', { userId, otherUserId })
}
