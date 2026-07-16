import api from './client'

export async function getFriends(userId: string) {
  return api.get(`/friends/${userId}`)
}

export async function getFriendRequests(userId: string) {
  return api.get(`/friends/requests/${userId}`)
}

export async function requestFriend(userId: string, friendId: string) {
  return api.post('/friends/request', { userId, friendId })
}

export async function acceptFriend(userId: string, friendId: string) {
  return api.post('/friends/accept', { userId, friendId })
}

export async function rejectFriend(userId: string, friendId: string) {
  return api.post('/friends/reject', { userId, friendId })
}

export async function searchUser(query: string) {
  return api.get(`/friends/search/${encodeURIComponent(query)}`)
}
