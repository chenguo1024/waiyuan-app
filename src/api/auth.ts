import api from './client'

export async function sendCode(phone: string) {
  return api.post('/auth/send-code', { phone })
}

export async function register(phone: string, code: string, password: string, name?: string, studentId?: string, idCard?: string) {
  return api.post('/auth/register', { phone, code, password, name, studentId, idCard })
}

export async function login(phone: string, password: string) {
  return api.post('/auth/login', { phone, password })
}

export async function loginWithCode(phone: string, code: string) {
  return api.post('/auth/login-code', { phone, code })
}

export async function bindInfo(userId: string, name: string, studentId: string, idCard?: string) {
  return api.post('/auth/bind', { userId, name, studentId, idCard })
}

export async function getUser(userId: string) {
  return api.get(`/auth/user/${userId}`)
}
