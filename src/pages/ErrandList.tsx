import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store'
import TaskCard from '../components/TaskCard'
import { getTasks } from '../api/tasks'

const SORT_OPTIONS = [
  { key: 'all', label: '全部' },
  { key: 'food', label: '外卖代取' },
  { key: 'delivery', label: '快递代取' },
  { key: 'print', label: '打印' },
  { key: 'other', label: '其他' },
]

export default function ErrandList() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<any[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getTasks().then(data => {
      setTasks(Array.isArray(data) ? data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = tasks
    .filter((t: any) => t.status === 'open' || t.status === 'in_progress')
    .filter((t: any) => filter === 'all' || t.category === filter)
    .sort((a: any, b: any) => {
      if (a.isUrgent && !b.isUrgent) return -1
      if (!a.isUrgent && b.isUrgent) return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const openTasks = filtered.filter((t: any) => t.status === 'open')
  const inProgressTasks = filtered.filter((t: any) => t.status === 'in_progress')

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, var(--primary), #42A5F5)', padding: '16px 16px 20px', borderRadius: '0 0 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 28 }}>🏃</span>
          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>万能跑腿</h2>
          {state.user && <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>🪙 {state.user.coinBalance}</span>}
        </div>
        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>🔍</span>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>搜索跑腿任务...</span>
        </div>
      </div>

      <div style={{ padding: '0 12px', marginTop: -8 }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '4px 0 8px', scrollbarWidth: 'none' }}>
          {SORT_OPTIONS.map(opt => (
            <button key={opt.key} onClick={() => setFilter(opt.key)}
              style={{ padding: '6px 14px', borderRadius: 16, fontSize: 12, whiteSpace: 'nowrap', background: filter === opt.key ? 'var(--primary)' : 'var(--card)', color: filter === opt.key ? '#fff' : 'var(--text-secondary)', fontWeight: filter === opt.key ? 600 : 400, boxShadow: filter === opt.key ? '0 2px 8px rgba(30,136,229,0.3)' : 'var(--shadow)' }}>
              {opt.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>加载中...</div>
        ) : openTasks.length === 0 && inProgressTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-light)' }}>
            <p style={{ fontSize: 40, marginBottom: 8 }}>📭</p>
            <p style={{ fontSize: 14, marginBottom: 12 }}>暂无跑腿任务</p>
            <button onClick={() => navigate('/publish')} style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--primary)', color: '#fff', fontSize: 13 }}>发布任务</button>
          </div>
        ) : (
          <>
            {openTasks.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>待接单</span>
                  <span style={{ fontSize: 12, color: 'var(--text-light)', background: 'var(--bg)', padding: '1px 8px', borderRadius: 8 }}>{openTasks.length}</span>
                </div>
                {openTasks.map((t: any) => <TaskCard key={t.id} task={t} />)}
              </>
            )}
            {inProgressTasks.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, marginTop: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>进行中</span>
                  <span style={{ fontSize: 12, color: 'var(--text-light)', background: 'var(--bg)', padding: '1px 8px', borderRadius: 8 }}>{inProgressTasks.length}</span>
                </div>
                {inProgressTasks.map((t: any) => <TaskCard key={t.id} task={t} />)}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
