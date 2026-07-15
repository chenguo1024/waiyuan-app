import api from './client'

export async function sendCode(phone: string) {
  return api.post('/auth/send-code', { phone })
}

export async function sendEmailCode(email: string) {
  return api.post('/auth/send-email-code', { email })
}

export async function register(params: { email?: string; phone?: string; code: string; password: string; name?: string; studentId?: string; idCard?: string }) {
  return api.post('/auth/register', params)
}

export async function login(params: { email?: string; phone?: string; password: string }) {
  return api.post('/auth/login', params)
}

export async function loginWithCode(params: { email?: string; phone?: string; code: string }) {
  return api.post('/auth/login-code', params)
}

export async function bindInfo(userId: string, name: string, studentId: string, idCard?: string) {
  return api.post('/auth/bind', { userId, name, studentId, idCard })
}

export async function getUser(userId: string) {
  return api.get(`/auth/user/${userId}`)
}
