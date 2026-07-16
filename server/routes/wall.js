import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import db from '../db.js'

const router = Router()

router.get('/', (req, res) => {
  const posts = db.prepare('SELECT * FROM wall_posts ORDER BY created_at DESC').all()
  res.json(posts.map(p => ({
    id: p.id, userId: p.user_id, userName: p.user_name,
    content: p.content, images: p.images ? p.images.split(',').filter(Boolean) : [],
    likeCount: p.like_count, commentCount: p.comment_count,
    createdAt: p.created_at,
  })))
})

router.post('/', (req, res) => {
  const { userId, userName, content, images } = req.body
  if (!userId || !content) return res.status(400).json({ error: '内容不能为空' })
  const id = uuidv4()
  db.prepare('INSERT INTO wall_posts (id, user_id, user_name, content, images) VALUES (?, ?, ?, ?, ?)')
    .run(id, userId, userName || '', content, (images || []).join(','))
  res.json({
    success: true, post: {
      id, userId, userName: userName || '', content, images: images || [],
      likeCount: 0, commentCount: 0, createdAt: new Date().toISOString(),
    },
  })
})

router.put('/:id', (req, res) => {
  const { content, images } = req.body
  const post = db.prepare('SELECT * FROM wall_posts WHERE id = ?').get(req.params.id)
  if (!post) return res.status(404).json({ error: '帖子不存在' })
  db.prepare('UPDATE wall_posts SET content = ?, images = ? WHERE id = ?').run(content || post.content, (images || []).join(','), req.params.id)
  res.json({ success: true })
})

router.delete('/:id', (req, res) => {
  const post = db.prepare('SELECT * FROM wall_posts WHERE id = ?').get(req.params.id)
  if (!post) return res.status(404).json({ error: '帖子不存在' })
  db.prepare('DELETE FROM comments WHERE item_id = ? AND item_type = ?').run(req.params.id, 'wall')
  db.prepare('DELETE FROM likes WHERE item_id = ? AND item_type = ?').run(req.params.id, 'wall')
  db.prepare('DELETE FROM wall_posts WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

export default router
