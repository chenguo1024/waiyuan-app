import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import db from '../db.js'
import sendSMS from '../sms.js'
import sendVerifyEmail from '../email.js'

const router = Router()

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'waiyuan_salt_2024').digest('hex')
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

// 发送短信验证码
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

// 发送邮箱验证码
router.post('/send-email-code', async (req, res) => {
  const { email } = req.body
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: '请输入正确的邮箱地址' })
  }

  const code = generateCode()
  const result = await sendVerifyEmail(email, code)

  db.prepare('DELETE FROM email_codes WHERE email = ?').run(email)
  db.prepare('INSERT INTO email_codes (email, code) VALUES (?, ?)').run(email, code)

  res.json({ success: true, message: '验证码已发送', debug: code })
})

// 注册
router.post('/register', (req, res) => {
  const { email, code, password, name, studentId, idCard, phone } = req.body

  if ((!email && !phone) || !code || !password) {
    return res.status(400).json({ error: '邮箱/手机号、验证码和密码为必填' })
  }

  if (email) {
    const record = db.prepare(
      "SELECT * FROM email_codes WHERE email = ? AND code = ? AND datetime(created_at) > datetime('now', '-10 minutes')"
    ).get(email, code)
    if (!record) return res.status(400).json({ error: '验证码错误或已过期' })
  } else {
    const record = db.prepare(
      "SELECT * FROM sms_codes WHERE phone = ? AND code = ? AND datetime(created_at) > datetime('now', '-10 minutes')"
    ).get(phone, code)
    if (!record) return res.status(400).json({ error: '验证码错误或已过期' })
  }

  const existing = email
    ? db.prepare('SELECT id FROM users WHERE email = ?').get(email)
    : db.prepare('SELECT id FROM users WHERE phone = ?').get(phone)

  if (existing) return res.status(400).json({ error: '该账号已注册' })

  const id = uuidv4()
  const passwordHash = hashPassword(password)
  const displayName = name || (email ? email.split('@')[0] : `用户${phone.slice(-4)}`)

  db.prepare(`
    INSERT INTO users (id, email, phone, name, student_id, id_card, password_hash, coin_balance, free_urgent_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, 10, 0)
  `).run(id, email || '', phone || '', displayName, studentId || '', idCard || '', passwordHash)

  if (email) db.prepare('DELETE FROM email_codes WHERE email = ?').run(email)
  else db.prepare('DELETE FROM sms_codes WHERE phone = ?').run(phone)

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
  res.json({
    success: true,
    user: {
      id: user.id, email: user.email, phone: user.phone, name: user.name, studentId: user.student_id,
      creditScore: user.credit_score, coinBalance: user.coin_balance,
      membership: user.membership, freeUrgentCount: user.free_urgent_count,
      avatar: user.avatar,
    },
    token: id,
  })
})

// 密码登录
router.post('/login', (req, res) => {
  const { email, phone, password } = req.body
  if ((!email && !phone) || !password) {
    return res.status(400).json({ error: '请输入邮箱/手机号和密码' })
  }

  let user
  if (email) user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  else user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone)

  if (!user || user.password_hash !== hashPassword(password)) {
    return res.status(400).json({ error: '账号或密码错误' })
  }

  res.json({
    success: true,
    user: {
      id: user.id, email: user.email, phone: user.phone, name: user.name, studentId: user.student_id,
      creditScore: user.credit_score, coinBalance: user.coin_balance,
      membership: user.membership, membershipExpireAt: user.membership_expire_at,
      freeUrgentCount: user.free_urgent_count, avatar: user.avatar,
    },
    token: user.id,
  })
})

// 验证码登录
router.post('/login-code', (req, res) => {
  const { email, phone, code } = req.body
  if ((!email && !phone) || !code) {
    return res.status(400).json({ error: '请输入邮箱/手机号和验证码' })
  }

  if (email) {
    const record = db.prepare(
      "SELECT * FROM email_codes WHERE email = ? AND code = ? AND datetime(created_at) > datetime('now', '-10 minutes')"
    ).get(email, code)
    if (!record) return res.status(400).json({ error: '验证码错误或已过期' })

    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    if (!user) {
      const id = uuidv4()
      const passwordHash = hashPassword(email.split('@')[0])
      db.prepare(`
        INSERT INTO users (id, email, name, password_hash, coin_balance, free_urgent_count)
        VALUES (?, ?, ?, ?, 10, 0)
      `).run(id, email, email.split('@')[0], passwordHash)
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
    }
    db.prepare('DELETE FROM email_codes WHERE email = ?').run(email)

    res.json({
      success: true,
      user: {
        id: user.id, email: user.email, phone: user.phone, name: user.name, studentId: user.student_id,
        creditScore: user.credit_score, coinBalance: user.coin_balance,
        membership: user.membership, membershipExpireAt: user.membership_expire_at,
        freeUrgentCount: user.free_urgent_count, avatar: user.avatar,
      },
      token: user.id,
    })
  } else {
    const smsRecord = db.prepare(
      "SELECT * FROM sms_codes WHERE phone = ? AND code = ? AND datetime(created_at) > datetime('now', '-10 minutes')"
    ).get(phone, code)
    if (!smsRecord) return res.status(400).json({ error: '验证码错误或已过期' })

    let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone)
    if (!user) {
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
        id: user.id, email: user.email, phone: user.phone, name: user.name, studentId: user.student_id,
        creditScore: user.credit_score, coinBalance: user.coin_balance,
        membership: user.membership, membershipExpireAt: user.membership_expire_at,
        freeUrgentCount: user.free_urgent_count, avatar: user.avatar,
      },
      token: user.id,
    })
  }
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

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
  res.json({
    success: true, message: '绑定成功',
    user: {
      id: updated.id, email: updated.email, phone: updated.phone, name: updated.name,
      studentId: updated.student_id, creditScore: updated.credit_score,
      coinBalance: updated.coin_balance, membership: updated.membership,
      membershipExpireAt: updated.membership_expire_at,
      freeUrgentCount: updated.free_urgent_count, avatar: updated.avatar,
    },
  })
})

// 获取用户信息
router.get('/user/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id)
  if (!user) return res.status(404).json({ error: '用户不存在' })

  res.json({
    id: user.id, email: user.email, phone: user.phone, name: user.name, studentId: user.student_id,
    creditScore: user.credit_score, coinBalance: user.coin_balance,
    membership: user.membership, membershipExpireAt: user.membership_expire_at,
    freeUrgentCount: user.free_urgent_count, avatar: user.avatar,
  })
})

export default router
