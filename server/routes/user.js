import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import db from '../db.js'

const router = Router()

router.put('/profile', (req, res) => {
  const { userId, name } = req.body
  if (!userId) return res.status(400).json({ error: '缺少用户ID' })
  db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, userId)
  res.json({ success: true })
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

// 每日签到
router.post('/checkin', (req, res) => {
  const { userId } = req.body
  const today = new Date().toISOString().slice(0, 10)
  const existing = db.prepare('SELECT id FROM checkins WHERE user_id = ? AND date = ?').get(userId, today)
  if (existing) return res.status(400).json({ error: '今天已签到' })

  db.prepare('INSERT INTO checkins (id, user_id, date) VALUES (?, ?, ?)').run(uuidv4(), userId, today)
  db.prepare('UPDATE users SET coin_balance = coin_balance + 1 WHERE id = ?').run(userId)
  db.prepare("INSERT INTO transactions (id, user_id, type, amount, description) VALUES (?, ?, 'earn', 1, '每日签到')")
    .run(uuidv4(), userId)
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
