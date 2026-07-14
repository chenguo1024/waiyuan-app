import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import db from '../db.js'

const router = Router()

router.get('/', (req, res) => {
  const rides = db.prepare('SELECT * FROM carpool_rides WHERE seats_left > 0 ORDER BY departure_time ASC').all()
  res.json(rides.map(r => ({
    id: r.id, from: r.from_location, to: r.to_location,
    departureTime: r.departure_time, seats: r.seats, seatsLeft: r.seats_left,
    fee: r.fee, publisherId: r.publisher_id, publisherName: r.publisher_name,
    publisherPhone: r.publisher_phone, note: r.note, createdAt: r.created_at,
  })))
})

router.post('/', (req, res) => {
  const { from, to, departureTime, seats, fee, publisherId, publisherName, publisherPhone, note } = req.body
  const id = uuidv4()
  db.prepare(`
    INSERT INTO carpool_rides (id, from_location, to_location, departure_time, seats, seats_left, fee, publisher_id, publisher_name, publisher_phone, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, from, to, departureTime, seats, seats, fee, publisherId, publisherName, publisherPhone || '', note || '')
  res.json({ success: true, id })
})

router.post('/:id/join', (req, res) => {
  const ride = db.prepare('SELECT * FROM carpool_rides WHERE id = ?').get(req.params.id)
  if (!ride) return res.status(404).json({ error: '拼车不存在' })
  if (ride.seats_left <= 0) return res.status(400).json({ error: '座位已满' })
  db.prepare('UPDATE carpool_rides SET seats_left = seats_left - 1 WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

export default router
