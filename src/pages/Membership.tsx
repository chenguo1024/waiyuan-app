import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store'
import PaymentModal from '../components/PaymentModal'
import { buyMembership } from '../api/user'
import { toDate, formatDateTime } from '../mock'

export default function Membership() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [showPayment, setShowPayment] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'semester'>('monthly')
  const [toast, setToast] = useState('')

  const isMember = state.user?.membership !== 'none'
  const planLabel = selectedPlan === 'monthly' ? '月卡' : '学期卡'

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000) }

  const handleBuy = () => {
    if (isMember) { showToast('您已是会员'); return }
    if (!state.user) { showToast('请先登录'); return }
    setShowPayment(true)
  }

  const handlePayment = () => {
    if (!state.user) return
    setShowPayment(false)
    buyMembership(state.user.id, selectedPlan).then((res: any) => {
      dispatch({ type: 'SET_USER', user: {
        membership: selectedPlan,
        membershipExpireAt: res.expireAt,
        freeUrgentCount: selectedPlan === 'monthly' ? 3 : 12,
      }})
      showToast(`🎉 ${planLabel}购买成功！`)
    }).catch((e: any) => showToast('购买失败: ' + e.message))
  }

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #FFD700, #FFA000, #FF8F00)', padding: '24px 20px 40px', borderRadius: '0 0 24px 24px', textAlign: 'center', color: '#fff' }}>
        <button onClick={() => navigate(-1)} style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(0,0,0,0.15)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}>← 返回</button>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 8 }}>👑</span>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>帮帮会员</h2>
        <p style={{ fontSize: 14, opacity: 0.9 }}>享受更多权益，让校园生活更便捷</p>
        {state.user && (
          <div style={{ marginTop: 20, background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 12, backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontWeight: 600 }}>{isMember ? `${state.user.name} · ${state.user.membership === 'monthly' ? '月卡' : '学期卡'}会员` : `${state.user.name} · 未开通会员`}</span>
            </div>
            {isMember && state.user.membershipExpireAt && <span style={{ fontSize: 12, opacity: 0.8 }}>到期：{formatDateTime(state.user.membershipExpireAt)}</span>}
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.9 }}>🆓 剩余免费加急：{state.user.freeUrgentCount}次</div>
          </div>
        )}
      </div>

      <div style={{ padding: '0 16px', marginTop: -16 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <button onClick={() => setSelectedPlan('monthly')} style={{ flex: 1, background: selectedPlan === 'monthly' ? '#fff' : 'var(--bg)', borderRadius: 'var(--radius)', padding: 20, boxShadow: selectedPlan === 'monthly' ? 'var(--shadow-lg)' : 'none', border: selectedPlan === 'monthly' ? '2px solid #FFD700' : '2px solid transparent', textAlign: 'center' }}>
            <span style={{ fontSize: 28, display: 'block', marginBottom: 4 }}>🌙</span>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>月卡</h3>
            <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>¥9.9</p>
            <ul style={{ listStyle: 'none', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <li>✓ 帮帮会员勋章</li><li>✓ 3次免费加急/月</li><li>✓ 任务优先展示</li><li>✓ 30天有效</li>
            </ul>
          </button>
          <button onClick={() => setSelectedPlan('semester')} style={{ flex: 1, background: selectedPlan === 'semester' ? '#fff' : 'var(--bg)', borderRadius: 'var(--radius)', padding: 20, boxShadow: selectedPlan === 'semester' ? 'var(--shadow-lg)' : 'none', border: selectedPlan === 'semester' ? '2px solid #FFD700' : '2px solid transparent', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <span style={{ position: 'absolute', top: 8, right: -20, transform: 'rotate(45deg)', background: 'var(--accent)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 24px' }}>推荐</span>
            <span style={{ fontSize: 28, display: 'block', marginBottom: 4 }}>⭐</span>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>学期卡</h3>
            <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>¥29.9</p>
            <ul style={{ listStyle: 'none', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <li>✓ 帮帮会员勋章</li><li>✓ 12次免费加急</li><li>✓ 任务优先展示</li><li>✓ 120天有效</li>
            </ul>
            <div style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600, marginTop: 8 }}>节省 ¥69</div>
          </button>
        </div>

        <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 16, boxShadow: 'var(--shadow)', marginBottom: 16 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>权益对比</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8, fontSize: 12 }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>权益项目</span>
            <span style={{ textAlign: 'center', fontWeight: 600 }}>普通</span>
            <span style={{ textAlign: 'center', fontWeight: 600, color: '#FFA000' }}>会员</span>
            <span>会员勋章</span><span style={{ textAlign: 'center', color: 'var(--text-light)' }}>-</span><span style={{ textAlign: 'center' }}>✓</span>
            <span>免费加急次数</span><span style={{ textAlign: 'center', color: 'var(--text-light)' }}>0次/月</span><span style={{ textAlign: 'center' }}>3次/月</span>
            <span>任务优先展示</span><span style={{ textAlign: 'center', color: 'var(--text-light)' }}>-</span><span style={{ textAlign: 'center' }}>✓</span>
            <span>加急费用</span><span style={{ textAlign: 'center' }}>正常</span><span style={{ textAlign: 'center' }}>8折</span>
          </div>
        </div>

        <button onClick={handleBuy} style={{ width: '100%', padding: '14px 0', borderRadius: 10, marginBottom: 80, background: isMember ? 'var(--bg)' : 'linear-gradient(135deg, #FFD700, #FFA000)', color: isMember ? 'var(--text-secondary)' : '#fff', fontSize: 15, fontWeight: 700, boxShadow: isMember ? 'none' : '0 4px 15px rgba(255,160,0,0.3)' }}>
          {isMember ? '✓ 已是会员' : `开通${planLabel}`}
        </button>
      </div>

      {showPayment && <PaymentModal amount={selectedPlan === 'monthly' ? 9.9 : 29.9} title={`帮帮会员-${planLabel}`} onConfirm={handlePayment} onClose={() => setShowPayment(false)} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
