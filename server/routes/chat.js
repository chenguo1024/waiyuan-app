import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import db from '../db.js'

const router = Router()

router.get('/conversations/:userId', (req, res) => {
  const { userId } = req.params
  const convos = db.prepare(`
    SELECT * FROM conversations
    WHERE user1_id = ? OR user2_id = ?
    ORDER BY last_message_at DESC
  `).all(userId, userId)
  res.json(convos.map(c => {
    const otherId = c.user1_id === userId ? c.user2_id : c.user1_id
    const other = db.prepare('SELECT id, name, avatar FROM users WHERE id = ?').get(otherId)
    return {
      id: c.id,
      otherUser: other,
      lastMessage: c.last_message,
      lastMessageAt: c.last_message_at,
      unread: c.user1_id === userId ? c.unread_user1 : c.unread_user2,
    }
  }))
})

router.get('/messages/:conversationId', (req, res) => {
  const msgs = db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC').all(req.params.conversationId)
  res.json(msgs.map(m => ({
    id: m.id, senderId: m.sender_id, content: m.content, type: m.type || 'text', createdAt: m.created_at,
  })))
})

router.post('/messages', (req, res) => {
  const { senderId, receiverId, content, type } = req.body
  if (!senderId || !receiverId || !content) {
    return res.status(400).json({ error: '缺少参数' })
  }

  const id1 = senderId < receiverId ? senderId : receiverId
  const id2 = senderId < receiverId ? receiverId : senderId

  let convo = db.prepare(
    'SELECT * FROM conversations WHERE user1_id = ? AND user2_id = ?'
  ).get(id1, id2)

  if (!convo) {
    convo = { id: uuidv4(), user1_id: id1, user2_id: id2 }
    db.prepare(
      'INSERT INTO conversations (id, user1_id, user2_id) VALUES (?, ?, ?)'
    ).run(convo.id, convo.user1_id, convo.user2_id)
  }

  const msgType = type || 'text'
  const msgId = uuidv4()
  db.prepare(
    'INSERT INTO messages (id, conversation_id, sender_id, content, type) VALUES (?, ?, ?, ?, ?)'
  ).run(msgId, convo.id, senderId, content, msgType)

  const unreadField = senderId === convo.user1_id ? 'unread_user2' : 'unread_user1'
  const lastMsg = msgType === 'image' ? '[图片]' : msgType === 'voice' ? '[语音]' : content
  db.prepare(
    `UPDATE conversations SET last_message = ?, last_message_at = datetime('now'), ${unreadField} = ${unreadField} + 1 WHERE id = ?`
  ).run(lastMsg, convo.id)

  res.json({ success: true, message: { id: msgId, senderId, content, type: msgType, createdAt: new Date().toISOString() } })
})

router.put('/conversations/:id/read', (req, res) => {
  const { userId } = req.body
  const convo = db.prepare('SELECT * FROM conversations WHERE id = ?').get(req.params.id)
  if (!convo) return res.status(404).json({ error: '会话不存在' })
  if (convo.user1_id === userId) {
    db.prepare('UPDATE conversations SET unread_user1 = 0 WHERE id = ?').run(convo.id)
  } else {
    db.prepare('UPDATE conversations SET unread_user2 = 0 WHERE id = ?').run(convo.id)
  }
  res.json({ success: true })
})

export default router
