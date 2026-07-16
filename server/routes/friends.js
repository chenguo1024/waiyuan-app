import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import db from '../db.js'

const router = Router()

router.get('/:userId', (req, res) => {
  const { userId } = req.params
  const friends = db.prepare(`
    SELECT u.id, u.name, u.avatar FROM friends f
    JOIN users u ON u.id = CASE WHEN f.user_id = ? THEN f.friend_id ELSE f.user_id END
    WHERE (f.user_id = ? OR f.friend_id = ?) AND f.status = 'accepted'
  `).all(userId, userId, userId)
  res.json(friends.map(f => ({ id: f.id, name: f.name, avatar: f.avatar })))
})

router.get('/requests/:userId', (req, res) => {
  const { userId } = req.params
  const requests = db.prepare(`
    SELECT f.id as requestId, u.id, u.name, u.avatar FROM friends f
    JOIN users u ON u.id = f.user_id
    WHERE f.friend_id = ? AND f.status = 'pending'
  `).all(userId)
  res.json(requests.map(r => ({ requestId: r.requestId, id: r.id, name: r.name, avatar: r.avatar })))
})

router.post('/request', (req, res) => {
  const { userId, friendId } = req.body
  if (!userId || !friendId) return res.status(400).json({ error: '参数不完整' })
  const existing = db.prepare('SELECT id, status FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)').get(userId, friendId, friendId, userId)
  if (existing) return res.status(400).json({ error: existing.status === 'accepted' ? '已经是好友' : '已发送过好友请求' })
  db.prepare('INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, ?)').run(userId, friendId, 'pending')
  res.json({ success: true })
})

router.post('/accept', (req, res) => {
  const { userId, friendId } = req.body
  db.prepare('UPDATE friends SET status = ? WHERE user_id = ? AND friend_id = ?').run('accepted', friendId, userId)
  const conv = db.prepare('SELECT id FROM conversations WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)').get(userId, friendId, friendId, userId)
  if (!conv) {
    const convId = uuidv4()
    db.prepare('INSERT INTO conversations (id, user1_id, user2_id) VALUES (?, ?, ?)').run(convId, userId, friendId)
  }
  res.json({ success: true })
})

router.post('/reject', (req, res) => {
  const { userId, friendId } = req.body
  db.prepare('DELETE FROM friends WHERE user_id = ? AND friend_id = ?').run(friendId, userId)
  res.json({ success: true })
})

export default router
