import { useNavigate } from 'react-router-dom'
import { useApp } from '../store'
import type { Task } from '../types'
import { getTaskCategoryLabel, timeAgo, formatTimeLeft } from '../mock'
import { deleteTask } from '../api/tasks'

const categoryIcons: Record<string, string> = {
  food: '🍔', print: '🖨️', delivery: '📦', other: '📋',
}

interface TaskCardProps {
  task: Task
  onDelete?: (id: string) => void
}

export default function TaskCard({ task, onDelete }: TaskCardProps) {
  const { state } = useApp()
  const navigate = useNavigate()
  const isOwner = state.user?.id === task.publisherId

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('确定删除此任务？')) return
    try {
      await deleteTask(task.id)
      onDelete?.(task.id)
    } catch { alert('删除失败') }
  }
  const card = (
    <div
      onClick={() => navigate(`/errand/${task.id}`)}
      style={{
        background: '#fff', borderRadius: 'var(--radius)', padding: 16, marginBottom: 12,
        boxShadow: 'var(--shadow)', cursor: 'pointer', transition: 'transform 0.15s',
        animation: 'fadeIn 0.3s ease',
        border: task.isUrgent ? '1px solid var(--accent-light)' : 'none',
        position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={e => { if (!task.isUrgent) e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { if (!task.isUrgent) e.currentTarget.style.transform = 'translateY(0)' }}
    >
      {task.isUrgent && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          background: 'linear-gradient(135deg, var(--accent), #FFB74D)',
          color: '#fff', fontSize: 11, fontWeight: 700,
          padding: '3px 10px', borderRadius: '0 12px 0 12px',
          animation: 'breathe 2s ease-in-out infinite',
        }}>
          🔥 加急
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 28 }}>{categoryIcons[task.category] || '📋'}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>{task.title}</span>
            {task.isPublisherMember && <span className="member-badge">👑 会员</span>}
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-light)' }}>
            {getTaskCategoryLabel(task.category)} · {timeAgo(task.createdAt)}
          </span>
        </div>
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.5 }}>
        {task.description.length > 50 ? task.description.slice(0, 50) + '...' : task.description}
      </p>

      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, background: 'var(--bg)', padding: '3px 8px', borderRadius: 6 }}>
          📍 {task.pickupLocation}
        </span>
        <span style={{ fontSize: 12, background: 'var(--bg)', padding: '3px 8px', borderRadius: 6 }}>
          🏁 {task.deliveryLocation}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%', background: 'var(--primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--primary)',
          }}>
            {task.publisherName[0]}
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{task.publisherName}</span>
          <span style={{ fontSize: 11, color: 'var(--text-light)' }}>⭐{task.publisherCredit}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isOwner && task.status === 'open' && (
            <button onClick={handleDelete}
              style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--danger)', color: '#fff', fontSize: 11, border: 'none' }}>
              删除
            </button>
          )}
          {task.isUrgent && task.urgentDeadline && (
            <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>
              ⏱ {formatTimeLeft(task.urgentDeadline)}
            </span>
          )}
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>
            ¥{task.reward + task.urgentFee}
          </span>
        </div>
      </div>

      {task.isUrgent && (
        <div style={{
          marginTop: 8, height: 3, borderRadius: 2, background: 'var(--bg)', overflow: 'hidden',
        }}>
          {task.urgentDeadline && (() => {
            const total = new Date(task.urgentDeadline).getTime() - new Date(task.createdAt).getTime()
            const elapsed = Date.now() - new Date(task.createdAt).getTime()
            const pct = Math.max(0, Math.min(100, (1 - elapsed / total) * 100))
            return (
              <div style={{
                height: '100%', width: `${pct}%`,
                background: 'linear-gradient(90deg, var(--accent), #FFB74D)',
                borderRadius: 2, transition: 'width 1s linear',
              }} />
            )
          })()}
        </div>
      )}
    </div>
  )

  if (task.isUrgent) {
    return <div className="urgent-border">{card}</div>
  }
  return card
}
