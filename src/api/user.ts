import api from './client'

export async function updateProfile(userId: string, data: { name?: string; avatar?: string; gender?: string; major?: string; qq?: string; birthday?: string }) {
  return api.put('/user/profile', { userId, ...data })
}

export async function getTransactions(userId: string) {
  return api.get(`/user/${userId}/transactions`)
}

export async function getOrders(userId: string) {
  return api.get(`/user/${userId}/orders`)
}

export async function getNotifications(userId: string) {
  return api.get(`/user/${userId}/notifications`)
}

export async function markNotificationRead(id: string) {
  return api.put(`/user/notifications/${id}/read`, {})
}

export async function checkin(userId: string) {
  return api.post('/user/checkin', { userId })
}

export async function getCheckinStatus(userId: string) {
  return api.get(`/user/checkin/status/${userId}`)
}

export async function recharge(userId: string, amount: number) {
  return api.post('/user/recharge', { userId, amount })
}

export async function buyMembership(userId: string, plan: string) {
  return api.post('/user/membership', { userId, plan })
}
