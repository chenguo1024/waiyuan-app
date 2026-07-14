import { useState, useEffect } from 'react'
import { useApp } from '../store'
import { formatDateTime, timeAgo } from '../mock'
import { getCarpoolRides, createCarpoolRide, joinCarpool } from '../api/carpool'

export default function Carpool() {
  const { state } = useApp()
  const [showPublish, setShowPublish] = useState(false)
  const [toast, setToast] = useState('')
  const [filter, setFilter] = useState('all')
  const [rides, setRides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({ from: '', to: '', departureTime: '', seats: 4, fee: 10, note: '' })

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000) }

  const load = () => {
    setLoading(true)
    getCarpoolRides().then(data => {
      setRides(Array.isArray(data) ? data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const now = Date.now()

  let filtered = rides.filter((r: any) => r.seatsLeft > 0)
  if (filter === 'upcoming') filtered = filtered.filter((r: any) => new Date(r.departureTime).getTime() > now)
  else if (filter === 'my') filtered = filtered.filter((r: any) => r.publisherId === state.user?.id)

  filtered.sort((a: any, b: any) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime())

  const handlePublish = () => {
    if (!form.from || !form.to || !form.departureTime) { showToast('请填写完整信息'); return }
    createCarpoolRide({
      from: form.from, to: form.to,
      departureTime: new Date(form.departureTime).toISOString(),
      seats: form.seats, fee: form.fee,
      publisherId: state.user?.id || '', publisherName: state.user?.name || '',
      publisherPhone: state.user?.phone || '',
      note: form.note,
    }).then(() => {
      setShowPublish(false)
      setForm({ from: '', to: '', departureTime: '', seats: 4, fee: 10, note: '' })
      showToast('✅ 拼车信息已发布！')
      load()
    }).catch((e: any) => showToast('发布失败: ' + e.message))
  }

  const handleJoin = (rideId: string) => {
    joinCarpool(rideId).then(() => {
      showToast('✅ 已加入拼车！')
      load()
    }).catch((e: any) => showToast('加入失败: ' + e.message))
  }

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #9C27B0, #AB47BC)', padding: '16px 16px 20px', borderRadius: '0 0 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 28 }}>🚗</span>
          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>拼车出行</h2>
          <button onClick={() => setShowPublish(!showPublish)}
            style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: 8, padding: '6px 12px', fontSize: 12 }}>
            + 发布拼车
          </button>
        </div>
      </div>

      <div style={{ padding: '0 12px', marginTop: -8 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8, padding: '4px 0' }}>
          {[{ key: 'all', label: '全部' }, { key: 'upcoming', label: '即将出发' }, { key: 'my', label: '我的发布' }].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{ padding: '6px 14px', borderRadius: 16, fontSize: 12, whiteSpace: 'nowrap',
                background: filter === f.key ? 'var(--primary)' : 'var(--card)',
                color: filter === f.key ? '#fff' : 'var(--text-secondary)',
                fontWeight: filter === f.key ? 600 : 400,
                boxShadow: filter === f.key ? '0 2px 8px rgba(30,136,229,0.3)' : 'var(--shadow)',
              }}>{f.label}</button>
          ))}
        </div>

        {showPublish && (
          <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 16, boxShadow: 'var(--shadow)', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>发布拼车信息</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <input placeholder="出发地" value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))}
                style={{ padding: '10px 12px', borderRadius: 6, background: 'var(--bg)', fontSize: 13 }} />
              <input placeholder="目的地" value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))}
                style={{ padding: '10px 12px', borderRadius: 6, background: 'var(--bg)', fontSize: 13 }} />
            </div>
            <input type="datetime-local" value={form.departureTime} onChange={e => setForm(f => ({ ...f, departureTime: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 6, background: 'var(--bg)', fontSize: 13, marginBottom: 8 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>座位数</label>
                <input type="number" min={1} max={8} value={form.seats} onChange={e => setForm(f => ({ ...f, seats: Math.max(1, Math.min(8, Number(e.target.value))) }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 6, background: 'var(--bg)', fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>费用分摊（元）</label>
                <input type="number" min={0} value={form.fee} onChange={e => setForm(f => ({ ...f, fee: Math.max(0, Number(e.target.value)) }))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 6, background: 'var(--bg)', fontSize: 13 }} />
              </div>
            </div>
            <input placeholder="备注（选填）" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 6, background: 'var(--bg)', fontSize: 13, marginBottom: 12 }} />
            <button onClick={handlePublish}
              style={{ width: '100%', padding: '10px 0', borderRadius: 8, background: 'var(--primary)', color: '#fff', fontSize: 13, fontWeight: 600 }}>
              发布拼车
            </button>
          </div>
        )}

        {loading ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>加载中...</div>
          : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-light)' }}>
              <p style={{ fontSize: 40, marginBottom: 8 }}>🚗</p>
              <p style={{ fontSize: 14 }}>暂无拼车信息</p>
            </div>
          ) : filtered.map(r => {
            const isPast = new Date(r.departureTime).getTime() < now
            const isMy = r.publisherId === state.user?.id
            return (
              <div key={r.id} style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 14, marginBottom: 10, boxShadow: 'var(--shadow)', opacity: isPast ? 0.5 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 28 }}>🚗</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{r.from}</span>
                        <span style={{ fontSize: 14, color: 'var(--text-light)', margin: '0 6px' }}>→</span>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{r.to}</span>
                      </div>
                      {isPast && <span style={{ fontSize: 11, color: 'var(--text-light)' }}>已出发</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, margin: '4px 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                      <span>🕐 {formatDateTime(r.departureTime)}</span>
                      <span>👥 {r.seatsLeft}/{r.seats}座</span>
                    </div>
                    {r.note && <p style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 4 }}>📝 {r.note}</p>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-light)' }}>{r.publisherName}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-light)' }}>· {timeAgo(r.createdAt)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>¥{r.fee}</span>
                        {isMy ? (
                          <span style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--bg)', fontSize: 11, color: 'var(--text-secondary)' }}>我的发布</span>
                        ) : !isPast && r.seatsLeft > 0 ? (
                          <button onClick={() => handleJoin(r.id)}
                            style={{ padding: '4px 12px', borderRadius: 6, background: 'var(--primary)', color: '#fff', fontSize: 11 }}>
                            加入
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
