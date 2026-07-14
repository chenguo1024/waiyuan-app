import { useState, useEffect } from 'react'
import { useApp } from '../store'
import { getStudyTypeLabel, timeAgo } from '../mock'
import PaymentModal from '../components/PaymentModal'
import { getStudyResources, createStudyResource } from '../api/study'

const TABS = [
  { key: 'note', label: '📝 笔记/真题' },
  { key: 'tutor', label: '👨‍🏫 找辅导' },
  { key: 'group', label: '👥 组队学习' },
]

export default function Study() {
  const { state } = useApp()
  const [tab, setTab] = useState('all')
  const [showPublish, setShowPublish] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [payAmount, setPayAmount] = useState(0)
  const [toast, setToast] = useState('')
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({ title: '', description: '', price: 0, type: 'note', tags: '' })

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000) }

  const load = () => {
    setLoading(true)
    getStudyResources(tab === 'all' ? undefined : tab).then(data => {
      setResources(Array.isArray(data) ? data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [tab])

  const handlePublish = () => {
    if (!form.title || !form.description) { showToast('请填写完整信息'); return }
    if (form.price > 0) { setPayAmount(form.price); setShowPayment(true); return }
    submitResource(0)
  }

  const submitResource = (price: number) => {
    createStudyResource({
      type: form.type, title: form.title, description: form.description,
      price: price > 0 ? price : form.price,
      publisherId: state.user?.id || '', publisherName: state.user?.name || '',
      tags: form.tags.split(/[,，、\s]+/).filter(Boolean),
    }).then(() => {
      setShowPublish(false)
      setForm({ title: '', description: '', price: 0, type: 'note', tags: '' })
      showToast('✅ 发布成功！')
      load()
    }).catch((e: any) => showToast('发布失败: ' + e.message))
  }

  const handlePayment = () => {
    setShowPayment(false)
    submitResource(form.price)
  }

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #4CAF50, #66BB6A)', padding: '16px 16px 20px', borderRadius: '0 0 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 28 }}>📚</span>
          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>学习互助</h2>
          <button onClick={() => setShowPublish(!showPublish)}
            style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: 8, padding: '6px 12px', fontSize: 12 }}>
            + 发布
          </button>
        </div>
      </div>

      <div style={{ padding: '0 12px', marginTop: -8 }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '4px 0 8px', scrollbarWidth: 'none' }}>
          <button onClick={() => setTab('all')}
            style={{ padding: '6px 14px', borderRadius: 16, fontSize: 12, whiteSpace: 'nowrap',
              background: tab === 'all' ? 'var(--success)' : 'var(--card)',
              color: tab === 'all' ? '#fff' : 'var(--text-secondary)',
              fontWeight: tab === 'all' ? 600 : 400, boxShadow: tab === 'all' ? '0 2px 8px rgba(76,175,80,0.3)' : 'var(--shadow)',
            }}>全部</button>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: '6px 14px', borderRadius: 16, fontSize: 12, whiteSpace: 'nowrap',
                background: tab === t.key ? 'var(--success)' : 'var(--card)',
                color: tab === t.key ? '#fff' : 'var(--text-secondary)',
                fontWeight: tab === t.key ? 600 : 400, boxShadow: tab === t.key ? '0 2px 8px rgba(76,175,80,0.3)' : 'var(--shadow)',
              }}>{t.label}</button>
          ))}
        </div>

        {showPublish && (
          <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 16, boxShadow: 'var(--shadow)', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>发布学习资源</h3>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {TABS.map(t => (
                <button key={t.key} onClick={() => setForm(f => ({ ...f, type: t.key }))}
                  style={{ flex: 1, padding: '8px 0', borderRadius: 6, fontSize: 11,
                    background: form.type === t.key ? 'var(--success)' : 'var(--bg)',
                    color: form.type === t.key ? '#fff' : 'var(--text-secondary)',
                  }}>{t.label}</button>
              ))}
            </div>
            <input placeholder="标题" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 6, background: 'var(--bg)', fontSize: 13, marginBottom: 8 }} />
            <textarea placeholder="描述" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2} style={{ width: '100%', padding: '10px 12px', borderRadius: 6, background: 'var(--bg)', fontSize: 13, marginBottom: 8, resize: 'none' }} />
            {form.type !== 'group' && (
              <input type="number" placeholder="价格（元），免费填0" value={form.price || ''}
                onChange={e => setForm(f => ({ ...f, price: Math.max(0, Number(e.target.value)) }))}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 6, background: 'var(--bg)', fontSize: 13, marginBottom: 8 }} />
            )}
            <input placeholder="标签（逗号分隔）" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 6, background: 'var(--bg)', fontSize: 13, marginBottom: 12 }} />
            <button onClick={handlePublish}
              style={{ width: '100%', padding: '10px 0', borderRadius: 8, background: 'var(--success)', color: '#fff', fontSize: 13, fontWeight: 600 }}>
              发布
            </button>
          </div>
        )}

        {loading ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>加载中...</div>
          : resources.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-light)' }}>
              <p style={{ fontSize: 40, marginBottom: 8 }}>📭</p>
              <p style={{ fontSize: 14 }}>暂无学习资源</p>
            </div>
          ) : (
            resources.map(r => (
              <div key={r.id} style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 14, marginBottom: 10, boxShadow: 'var(--shadow)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontSize: 28 }}>{r.type === 'note' ? '📝' : r.type === 'tutor' ? '👨‍🏫' : '👥'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{r.title}</span>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'var(--success)', color: '#fff' }}>
                        {getStudyTypeLabel(r.type)}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0', lineHeight: 1.5 }}>{r.description}</p>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                      {(r.tags || []).map((t: string) => <span key={t} style={{ fontSize: 10, background: 'var(--bg)', padding: '1px 6px', borderRadius: 4, color: 'var(--text-light)' }}>#{t}</span>)}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-light)' }}>{r.publisherName}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-light)' }}>· {timeAgo(r.createdAt)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {r.price > 0 ? (
                          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>¥{r.price}</span>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>免费</span>
                        )}
                        <button onClick={() => showToast('✅ 已发送请求，等待回复')}
                          style={{ padding: '4px 12px', borderRadius: 6, background: 'var(--primary)', color: '#fff', fontSize: 11 }}>
                          {r.type === 'group' ? '加入' : r.price > 0 ? '购买' : '获取'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
      </div>

      {showPayment && <PaymentModal amount={payAmount} title={form.title} onConfirm={handlePayment} onClose={() => setShowPayment(false)} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
