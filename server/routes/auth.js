import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import db from '../db.js'
import sendSMS from '../sms.js'

const router = Router()

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'waiyuan_salt_2024').digest('hex')
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

// 发送验证码
router.post('/send-code', async (req, res) => {
  const { phone } = req.body
  if (!phone || !/^1\d{10}$/.test(phone)) {
    return res.status(400).json({ error: '请输入正确的手机号' })
  }

  const code = generateCode()
  const result = await sendSMS(phone, code)

  db.prepare('DELETE FROM sms_codes WHERE phone = ?').run(phone)
  db.prepare('INSERT INTO sms_codes (phone, code) VALUES (?, ?)').run(phone, code)

  res.json({ success: true, message: '验证码已发送', debug: code })
})

// 注册
router.post('/register', (req, res) => {
  const { phone, code, password, name, studentId, idCard } = req.body

  if (!phone || !code || !password) {
    return res.status(400).json({ error: '手机号、验证码和密码为必填' })
  }

  // 验证码校验
  const smsRecord = db.prepare(
    "SELECT * FROM sms_codes WHERE phone = ? AND code = ? AND datetime(created_at) > datetime('now', '-10 minutes')"
  ).get(phone, code)

  if (!smsRecord) {
    return res.status(400).json({ error: '验证码错误或已过期' })
  }

  const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone)
  if (existing) {
    return res.status(400).json({ error: '该手机号已注册' })
  }

  const id = uuidv4()
  const passwordHash = hashPassword(password)

  db.prepare(`
    INSERT INTO users (id, phone, name, student_id, id_card, password_hash, coin_balance, free_urgent_count)
    VALUES (?, ?, ?, ?, ?, ?, 10, 0)
  `).run(id, phone, name || `用户${phone.slice(-4)}`, studentId || '', idCard || '', passwordHash)

  db.prepare('DELETE FROM sms_codes WHERE phone = ?').run(phone)

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
  res.json({
    success: true,
    user: {
      id: user.id, phone: user.phone, name: user.name, studentId: user.student_id,
      creditScore: user.credit_score, coinBalance: user.coin_balance,
      membership: user.membership, freeUrgentCount: user.free_urgent_count,
    },
    token: id,
  })
})

// 密码登录
router.post('/login', (req, res) => {
  const { phone, password } = req.body
  if (!phone || !password) {
    return res.status(400).json({ error: '请输入手机号和密码' })
  }

  const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone)
  if (!user || user.password_hash !== hashPassword(password)) {
    return res.status(400).json({ error: '手机号或密码错误' })
  }

  res.json({
    success: true,
    user: {
      id: user.id, phone: user.phone, name: user.name, studentId: user.student_id,
      creditScore: user.credit_score, coinBalance: user.coin_balance,
      membership: user.membership, membershipExpireAt: user.membership_expire_at,
      freeUrgentCount: user.free_urgent_count,
    },
    token: user.id,
  })
})

// 验证码登录
router.post('/login-code', (req, res) => {
  const { phone, code } = req.body
  if (!phone || !code) {
    return res.status(400).json({ error: '请输入手机号和验证码' })
  }

  const smsRecord = db.prepare(
    "SELECT * FROM sms_codes WHERE phone = ? AND code = ? AND datetime(created_at) > datetime('now', '-10 minutes')"
  ).get(phone, code)

  if (!smsRecord) {
    return res.status(400).json({ error: '验证码错误或已过期' })
  }

  let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone)
  if (!user) {
    // 自动注册
    const id = uuidv4()
    const passwordHash = hashPassword(phone.slice(-6))
    db.prepare(`
      INSERT INTO users (id, phone, name, password_hash, coin_balance, free_urgent_count)
      VALUES (?, ?, ?, ?, 10, 0)
    `).run(id, phone, `用户${phone.slice(-4)}`, passwordHash)
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
  }

  db.prepare('DELETE FROM sms_codes WHERE phone = ?').run(phone)

  res.json({
    success: true,
    user: {
      id: user.id, phone: user.phone, name: user.name, studentId: user.student_id,
      creditScore: user.credit_score, coinBalance: user.coin_balance,
      membership: user.membership, membershipExpireAt: user.membership_expire_at,
      freeUrgentCount: user.free_urgent_count,
    },
    token: user.id,
  })
})

// 绑定学号和实名
router.post('/bind', (req, res) => {
  const { userId, name, studentId, idCard } = req.body
  if (!userId || !name || !studentId) {
    return res.status(400).json({ error: '请填写完整信息' })
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
  if (!user) return res.status(404).json({ error: '用户不存在' })

  db.prepare('UPDATE users SET name = ?, student_id = ?, id_card = ? WHERE id = ?')
    .run(name, studentId, idCard || user.id_card, userId)

  res.json({ success: true, message: '绑定成功' })
})

// 获取用户信息
router.get('/user/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id)
  if (!user) return res.status(404).json({ error: '用户不存在' })

  res.json({
    id: user.id, phone: user.phone, name: user.name, studentId: user.student_id,
    creditScore: user.credit_score, coinBalance: user.coin_balance,
    membership: user.membership, membershipExpireAt: user.membership_expire_at,
    freeUrgentCount: user.free_urgent_count,
  })
})

export default router
