import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import db from '../db.js'

const router = Router()

router.get('/', (req, res) => {
  const { type } = req.query
  let sql = 'SELECT * FROM study_resources WHERE 1=1'
  const params = []
  if (type && type !== 'all') { sql += ' AND type = ?'; params.push(type) }
  sql += ' ORDER BY created_at DESC'
  const resources = db.prepare(sql).all(...params)
  res.json(resources.map(r => ({
    id: r.id, type: r.type, title: r.title, description: r.description,
    price: r.price, publisherId: r.publisher_id, publisherName: r.publisher_name,
    tags: r.tags ? r.tags.split(',').filter(Boolean) : [],
    createdAt: r.created_at,
  })))
})

router.post('/', (req, res) => {
  const { type, title, description, price, publisherId, publisherName, tags } = req.body
  const id = uuidv4()
  db.prepare(`
    INSERT INTO study_resources (id, type, title, description, price, publisher_id, publisher_name, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, type, title, description, price || 0, publisherId, publisherName, (tags || []).join(','))
  res.json({ success: true, id })
})

export default router
