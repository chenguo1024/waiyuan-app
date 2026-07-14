import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import db from '../db.js'

const router = Router()

router.get('/', (req, res) => {
  const { category, sellerId } = req.query
  let sql = 'SELECT * FROM products WHERE 1=1'
  const params = []
  if (category && category !== 'all') { sql += ' AND category = ?'; params.push(category) }
  if (sellerId) { sql += ' AND seller_id = ?'; params.push(sellerId) }
  sql += ' ORDER BY is_urgent DESC, created_at DESC'
  const products = db.prepare(sql).all(...params)
  res.json(products.map(p => ({
    id: p.id, category: p.category, title: p.title, description: p.description,
    price: p.price, originalPrice: p.original_price, condition: p.condition_text,
    isUrgent: !!p.is_urgent, sellerId: p.seller_id, sellerName: p.seller_name,
    sellerCredit: p.seller_credit, sellerPhone: p.seller_phone,
    isSellerMember: !!p.is_seller_member, createdAt: p.created_at,
  })))
})

router.post('/', (req, res) => {
  const { category, title, description, price, condition, isUrgent, sellerId, sellerName, sellerPhone } = req.body
  const id = uuidv4()
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(sellerId)
  db.prepare(`
    INSERT INTO products (id, category, title, description, price, condition_text, is_urgent, seller_id, seller_name, seller_credit, seller_phone, is_seller_member)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, category, title, description, price, condition, isUrgent ? 1 : 0, sellerId, sellerName, user?.credit_score || 100, sellerPhone || '', user?.membership !== 'none' ? 1 : 0)
  res.json({ success: true, id })
})

export default router
