import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../store'
import { getTaskCategoryLabel, formatTimeLeft } from '../mock'
import { getTasks, updateTask } from '../api/tasks'
import PaymentModal from '../components/PaymentModal'

export default function ErrandDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state } = useApp()
  const [task, setTask] = useState<any>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000) }

  useEffect(() => {
    getTasks().then(data => {
      const t = (Array.isArray(data) ? data : []).find((x: any) => x.id === id)
      setTask(t || null)
    })
  }, [id])

  if (!task) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-light)' }}>
      <p style={{ fontSize: 40, marginBottom: 8 }}>😕</p>
      <p>任务不存在</p>
      <button onClick={() => navigate(-1)} style={{ color: 'var(--primary)', marginTop: 12, background: 'none', fontSize: 14 }}>返回</button>
    </div>
  )

  const isPublisher = state.user?.id === task.publisherId
  const isAccepted = task.status === 'in_progress'
  const isCompleted = task.status === 'completed'
  const isConfirmed = task.status === 'confirmed'
  const isOpen = task.status === 'open'
  const categoryIcons: Record<string, string> = { food: '🍔', print: '🖨️', delivery: '📦', other: '📋' }

  const handleAccept = () => {
    const u = state.user
    if (!isOpen || !u) return
    updateTask(task.id, { status: 'in_progress', acceptedBy: u.id, acceptedName: u.name }).then(() => {
      setTask({ ...task, status: 'in_progress', acceptedBy: u.id, acceptedByName: u.name })
      showToast('✅ 接单成功！完成任务后请确认')
    }).catch((e: any) => showToast('操作失败: ' + e.message))
  }

  const handleConfirmComplete = () => {
    updateTask(task.id, { status: 'completed' }).then(() => {
      setTask({ ...task, status: 'completed' })
      setShowComplete(false)
      showToast('✅ 已确认完成！等待发布者确认')
    })
  }

  const handlePublisherConfirm = () => {
    updateTask(task.id, { status: 'confirmed' }).then(() => {
      setTask({ ...task, status: 'confirmed' })
      showToast('✅ 已确认！报酬已发放')
    })
  }

  const handlePayment = () => { setShowPayment(false); showToast('✅ 支付成功') }

  return (
    <div style={{ padding: 0 }}>
      <div style={{ background: 'linear-gradient(135deg, var(--primary), #42A5F5)', padding: '16px 16px 30px', borderRadius: '0 0 20px 20px', color: '#fff' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 13, marginBottom: 12, cursor: 'pointer' }}>← 返回</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 40 }}>{categoryIcons[task.category]}</span>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>{task.title}</h2>
            <span style={{ fontSize: 13, opacity: 0.8 }}>{getTaskCategoryLabel(task.category)}</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px', marginTop: -16 }}>
        <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 20, boxShadow: 'var(--shadow-lg)' }}>
          {task.isUrgent && <div style={{ background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)', borderRadius: 8, padding: '8px 12px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>🔥 加急任务</span>
            {task.urgentDeadline && <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>⏱ {formatTimeLeft(task.urgentDeadline)}</span>}
          </div>}

          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text)', marginBottom: 20 }}>{task.description}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>📍 取货：<strong>{task.pickupLocation}</strong></div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>🏁 送达：<strong>{task.deliveryLocation}</strong></div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--primary)' }}>{task.publisherName?.[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{task.publisherName}</span>
                {task.isPublisherMember && <span className="member-badge">👑 会员</span>}
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-light)' }}>⭐ 信誉分 {task.publisherCredit}</span>
            </div>
            {task.acceptedByName && <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-light)' }}><div>接单者</div><div style={{ fontWeight: 600, color: 'var(--text)' }}>{task.acceptedByName}</div></div>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>赏金</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)', marginLeft: 8 }}>¥{task.reward}</span>
              {task.isUrgent && task.urgentFee > 0 && <div style={{ fontSize: 12, color: 'var(--text-light)' }}>+ 加急费 ¥{task.urgentFee}</div>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 12, color: 'var(--text-light)' }}>总计</span>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>¥{task.reward + task.urgentFee}</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {isPublisher ? (
            <>
              {isOpen && <button onClick={() => setShowPayment(true)} style={{ width: '100%', padding: '14px 0', borderRadius: 10, background: 'var(--accent)', color: '#fff', fontSize: 15, fontWeight: 700, boxShadow: '0 4px 15px rgba(255,112,67,0.3)', animation: 'pulse 2s infinite' }}>支付并发布</button>}
              {isCompleted && <button onClick={handlePublisherConfirm} style={{ width: '100%', padding: '14px 0', borderRadius: 10, background: 'var(--success)', color: '#fff', fontSize: 15, fontWeight: 700 }}>✅ 确认完成并付款</button>}
              {isConfirmed && <div style={{ background: '#E8F5E9', borderRadius: 10, padding: 12, textAlign: 'center' }}><span style={{ fontSize: 13, color: 'var(--success)' }}>✅ 已完成</span></div>}
            </>
          ) : (
            <>
              {isOpen && <button onClick={handleAccept} style={{ width: '100%', padding: '14px 0', borderRadius: 10, background: 'linear-gradient(135deg, var(--primary), #42A5F5)', color: '#fff', fontSize: 15, fontWeight: 700, boxShadow: '0 4px 15px rgba(30,136,229,0.3)' }}>🤝 一键接单</button>}
              {isAccepted && <><div style={{ background: '#FFF8E1', borderRadius: 10, padding: 12, textAlign: 'center' }}><span style={{ fontSize: 13, color: '#F57F17' }}>⏳ 进行中</span></div><button onClick={() => setShowComplete(true)} style={{ width: '100%', padding: '14px 0', borderRadius: 10, background: 'var(--success)', color: '#fff', fontSize: 15, fontWeight: 700 }}>✅ 确认完成</button></>}
              {isCompleted && <div style={{ background: '#E8F5E9', borderRadius: 10, padding: 12, textAlign: 'center' }}><span style={{ fontSize: 13, color: 'var(--success)' }}>✅ 等待发布者确认</span></div>}
              {isConfirmed && <div style={{ background: '#E8F5E9', borderRadius: 10, padding: 12, textAlign: 'center' }}><span style={{ fontSize: 13, color: 'var(--success)' }}>🎉 任务完成</span></div>}
            </>
          )}
        </div>
      </div>

      {showPayment && <PaymentModal amount={task.reward + task.urgentFee} title={task.title} onConfirm={handlePayment} onClose={() => setShowPayment(false)} />}
      {showComplete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 300, background: '#fff', borderRadius: 16, padding: 24, textAlign: 'center' }}>
            <span style={{ fontSize: 48, marginBottom: 12 }}>🎉</span>
            <h3 style={{ marginBottom: 8 }}>确认完成任务？</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>确认后将通知发布者最终确认</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowComplete(false)} style={{ flex: 1, padding: '12px 0', borderRadius: 10, background: 'var(--bg)', color: 'var(--text-secondary)', fontSize: 14 }}>取消</button>
              <button onClick={handleConfirmComplete} style={{ flex: 1, padding: '12px 0', borderRadius: 10, background: 'var(--success)', color: '#fff', fontSize: 14, fontWeight: 600 }}>确认</button>
            </div>
          </div>
        </div>
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
