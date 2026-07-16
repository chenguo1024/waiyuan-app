import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import db from '../db.js'

const router = Router()

router.get('/:itemId/:itemType', (req, res) => {
  const { itemId, itemType } = req.params
  const comments = db.prepare('SELECT * FROM comments WHERE item_id = ? AND item_type = ? ORDER BY created_at ASC').all(itemId, itemType)
  res.json(comments.map(c => ({
    id: c.id, userId: c.user_id, userName: c.user_name, content: c.content, createdAt: c.created_at,
  })))
})

router.post('/', (req, res) => {
  const { userId, userName, itemId, itemType, content } = req.body
  if (!userId || !itemId || !itemType || !content) return res.status(400).json({ error: '参数不完整' })
  const id = uuidv4()
  db.prepare('INSERT INTO comments (id, user_id, user_name, item_id, item_type, content) VALUES (?, ?, ?, ?, ?, ?)').run(id, userId, userName || '', itemId, itemType, content)
  db.prepare(`UPDATE ${itemType === 'wall' ? 'wall_posts' : itemType + 's'} SET comment_count = comment_count + 1 WHERE id = ?`).run(itemId)
  res.json({ success: true, comment: { id, userId, userName: userName || '', content, createdAt: new Date().toISOString() } })
})

router.delete('/:id', (req, res) => {
  const { id } = req.params
  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(id)
  if (!comment) return res.status(404).json({ error: '评论不存在' })
  db.prepare('DELETE FROM comments WHERE id = ?').run(id)
  db.prepare(`UPDATE ${comment.item_type === 'wall' ? 'wall_posts' : comment.item_type + 's'} SET comment_count = MAX(0, comment_count - 1) WHERE id = ?`).run(comment.item_id)
  res.json({ success: true })
})

export default router
