import { Router } from 'express'
import db from '../db.js'

const router = Router()

router.post('/toggle', (req, res) => {
  const { userId, itemId, itemType } = req.body
  if (!userId || !itemId || !itemType) return res.status(400).json({ error: '参数不完整' })

  const existing = db.prepare('SELECT id FROM likes WHERE user_id = ? AND item_id = ? AND item_type = ?').get(userId, itemId, itemType)
  if (existing) {
    db.prepare('DELETE FROM likes WHERE id = ?').run(existing.id)
    db.prepare(`UPDATE ${itemType === 'wall' ? 'wall_posts' : itemType + 's'} SET like_count = MAX(0, like_count - 1) WHERE id = ?`).run(itemId)
    res.json({ liked: false })
  } else {
    db.prepare('INSERT INTO likes (user_id, item_id, item_type) VALUES (?, ?, ?)').run(userId, itemId, itemType)
    db.prepare(`UPDATE ${itemType === 'wall' ? 'wall_posts' : itemType + 's'} SET like_count = like_count + 1 WHERE id = ?`).run(itemId)
    res.json({ liked: true })
  }
})

router.get('/status/:userId/:itemId/:itemType', (req, res) => {
  const { userId, itemId, itemType } = req.params
  const existing = db.prepare('SELECT id FROM likes WHERE user_id = ? AND item_id = ? AND item_type = ?').get(userId, itemId, itemType)
  res.json({ liked: !!existing })
})

export default router
