import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import db from '../db.js'

const router = Router()

router.put('/profile', (req, res) => {
  const { userId, name, avatar, gender, major, qq, birthday } = req.body
  if (!userId) return res.status(400).json({ error: '缺少用户ID' })
  if (name !== undefined) db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, userId)
  if (avatar !== undefined) db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(avatar, userId)
  if (gender !== undefined) db.prepare('UPDATE users SET gender = ? WHERE id = ?').run(gender, userId)
  if (major !== undefined) db.prepare('UPDATE users SET major = ? WHERE id = ?').run(major, userId)
  if (qq !== undefined) db.prepare('UPDATE users SET qq = ? WHERE id = ?').run(qq, userId)
  if (birthday !== undefined) db.prepare('UPDATE users SET birthday = ? WHERE id = ?').run(birthday, userId)
  const user = db.prepare('SELECT id, phone, email, name, student_id, credit_score, coin_balance, membership, membership_expire_at, free_urgent_count, avatar, gender, major, qq, birthday FROM users WHERE id = ?').get(userId)
  res.json({ success: true, user: user ? {
    id: user.id, phone: user.phone, email: user.email, name: user.name, studentId: user.student_id,
    creditScore: user.credit_score, coinBalance: user.coin_balance,
    membership: user.membership, membershipExpireAt: user.membership_expire_at,
    freeUrgentCount: user.free_urgent_count, avatar: user.avatar,
    gender: user.gender, major: user.major, qq: user.qq, birthday: user.birthday,
  } : null })
})

router.get('/:id/transactions', (req, res) => {
  const txns = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC').all(req.params.id)
  res.json(txns.map(t => ({
    id: t.id, type: t.type, amount: t.amount, description: t.description, createdAt: t.created_at,
  })))
})

router.get('/:id/orders', (req, res) => {
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.params.id)
  res.json(orders)
})

router.get('/:id/notifications', (req, res) => {
  const notifs = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC').all(req.params.id)
  res.json(notifs.map(n => ({
    id: n.id, type: n.type, title: n.title, message: n.message, read: !!n.read, createdAt: n.created_at,
  })))
})

router.put('/notifications/:id/read', (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

// 签到状态
router.get('/checkin/status/:userId', (req, res) => {
  const { userId } = req.params
  if (!userId) return res.status(400).json({ error: '缺少用户ID' })
  const today = new Date().toISOString().slice(0, 10)
  const existing = db.prepare('SELECT id FROM checkins WHERE user_id = ? AND date = ?').get(userId, today)
  res.json({ checkedIn: !!existing })
})

// 每日签到
router.post('/checkin', (req, res) => {
  const { userId } = req.body
  if (!userId) return res.status(400).json({ error: '缺少用户ID' })
  const today = new Date().toISOString().slice(0, 10)

  const doCheckin = db.transaction(() => {
    const existing = db.prepare('SELECT id FROM checkins WHERE user_id = ? AND date = ?').get(userId, today)
    if (existing) return '今天已签到'
    db.prepare('INSERT INTO checkins (user_id, date) VALUES (?, ?)').run(userId, today)
    db.prepare('UPDATE users SET coin_balance = coin_balance + 1 WHERE id = ?').run(userId)
    db.prepare("INSERT INTO transactions (id, user_id, type, amount, description) VALUES (?, ?, 'earn', 1, '每日签到')")
      .run(uuidv4(), userId)
    return null
  })

  const err = doCheckin()
  if (err) return res.status(400).json({ error: err })
  res.json({ success: true, coins: 1 })
})

// 充值
router.post('/recharge', (req, res) => {
  const { userId, amount } = req.body
  const coins = amount * 10
  const bonus = amount >= 100 ? 200 : amount >= 50 ? 80 : amount >= 30 ? 30 : 0
  const total = coins + bonus
  db.prepare('UPDATE users SET coin_balance = coin_balance + ? WHERE id = ?').run(total, userId)
  db.prepare("INSERT INTO transactions (id, user_id, type, amount, description) VALUES (?, ?, 'recharge', ?, ?)")
    .run(uuidv4(), userId, total, `充值 ¥${amount}，获得 ${total} 帮帮币`)
  res.json({ success: true, coins: total })
})

// 购买会员
router.post('/membership', (req, res) => {
  const { userId, plan } = req.body
  const days = plan === 'monthly' ? 30 : 120
  const count = plan === 'monthly' ? 3 : 12
  const expireAt = new Date(Date.now() + days * 86400000).toISOString()
  db.prepare('UPDATE users SET membership = ?, membership_expire_at = ?, free_urgent_count = ? WHERE id = ?')
    .run(plan, expireAt, count, userId)
  res.json({ success: true, membership: plan, expireAt })
})

export default router
