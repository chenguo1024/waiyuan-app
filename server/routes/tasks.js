import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import db from '../db.js'

const router = Router()

router.get('/', (req, res) => {
  const { category, status, publisherId, acceptedBy } = req.query
  let sql = 'SELECT * FROM tasks WHERE 1=1'
  const params = []
  if (category && category !== 'all') { sql += ' AND category = ?'; params.push(category) }
  if (status) { sql += ' AND status = ?'; params.push(status) }
  if (publisherId) { sql += ' AND publisher_id = ?'; params.push(publisherId) }
  if (acceptedBy) { sql += ' AND accepted_by = ?'; params.push(acceptedBy) }
  sql += ' ORDER BY is_urgent DESC, created_at DESC'
  const tasks = db.prepare(sql).all(...params)
  res.json(tasks.map(t => ({
    id: t.id, category: t.category, title: t.title, description: t.description,
    pickupLocation: t.pickup_location, deliveryLocation: t.delivery_location,
    reward: t.reward, isUrgent: !!t.is_urgent, urgentFee: t.urgent_fee,
    urgentDeadline: t.urgent_deadline, status: t.status,
    publisherId: t.publisher_id, publisherName: t.publisher_name,
    publisherCredit: t.publisher_credit, isPublisherMember: !!t.is_publisher_member,
    acceptedBy: t.accepted_by, acceptedByName: t.accepted_name,
    createdAt: t.created_at,
  })))
})

router.post('/', (req, res) => {
  const { category, title, description, pickupLocation, deliveryLocation, reward, isUrgent, urgentFee, urgentDeadline, publisherId, publisherName } = req.body
  const id = uuidv4()
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(publisherId)
  db.prepare(`
    INSERT INTO tasks (id, category, title, description, pickup_location, delivery_location, reward, is_urgent, urgent_fee, urgent_deadline, publisher_id, publisher_name, publisher_credit, is_publisher_member)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, category, title, description, pickupLocation, deliveryLocation, reward, isUrgent ? 1 : 0, urgentFee || 0, urgentDeadline || null, publisherId, publisherName, user?.credit_score || 100, user?.membership !== 'none' ? 1 : 0)
  res.json({ success: true, id })
})

router.put('/:id', (req, res) => {
  const { id } = req.params
  const updates = req.body
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id)
  if (!task) return res.status(404).json({ error: '任务不存在' })

  if (updates.status === 'in_progress') {
    db.prepare('UPDATE tasks SET status = ?, accepted_by = ?, accepted_name = ? WHERE id = ?')
      .run('in_progress', updates.acceptedBy, updates.acceptedName, id)
    // 添加通知
    db.prepare("INSERT INTO notifications (id, user_id, type, title, message) VALUES (?, ?, 'task', ?, ?)")
      .run(uuidv4(), task.publisher_id, '任务已被接单', `您的任务"${task.title}"已被 ${updates.acceptedName} 接单`)
  } else if (updates.status === 'completed') {
    db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run('completed', id)
    db.prepare("INSERT INTO notifications (id, user_id, type, title, message) VALUES (?, ?, 'task', ?, ?)")
      .run(uuidv4(), task.publisher_id, '任务已完成', `接单者已完成任务"${task.title}"，请确认付款`)
  } else if (updates.status === 'confirmed') {
    db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run('confirmed', id)
    const reward = task.reward + task.urgent_fee
    // 给接单者加钱和信誉分
    if (task.accepted_by) {
      db.prepare('UPDATE users SET coin_balance = coin_balance + ?, credit_score = MIN(100, credit_score + 2) WHERE id = ?')
        .run(reward, task.accepted_by)
      db.prepare("INSERT INTO transactions (id, user_id, type, amount, description) VALUES (?, ?, 'earn', ?, ?)")
        .run(uuidv4(), task.accepted_by, reward, `完成跑腿任务: ${task.title}`)
    }
    // 发布者信誉分+1
    db.prepare('UPDATE users SET credit_score = MIN(100, credit_score + 1) WHERE id = ?').run(task.publisher_id)
  }

  res.json({ success: true })
})

export default router
