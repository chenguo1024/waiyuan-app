import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store'
import PaymentModal from '../components/PaymentModal'
import { checkin, recharge, getTransactions } from '../api/user'

const RECHARGE_OPTIONS = [
  { amount: 10, coins: 100, bonus: 0 },
  { amount: 30, coins: 300, bonus: 30 },
  { amount: 50, coins: 500, bonus: 80 },
  { amount: 100, coins: 1000, bonus: 200 },
]

export default function CoinCenter() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [showPayment, setShowPayment] = useState(false)
  const [selectedRecharge, setSelectedRecharge] = useState(RECHARGE_OPTIONS[0])
  const [toast, setToast] = useState('')
  const [transactions, setTransactions] = useState<any[]>([])
  const [checkedInToday, setCheckedInToday] = useState(false)
  const [coinBalance, setCoinBalance] = useState(state.user?.coinBalance || 0)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000) }

  useEffect(() => {
    if (!state.user) return
    getTransactions(state.user.id).then(data => {
      setTransactions(Array.isArray(data) ? data : [])
    }).catch(() => {})
  }, [state.user])

  const handleCheckIn = () => {
    const u = state.user
    if (!u) return
    checkin(u.id).then(() => {
      const newBalance = (u.coinBalance || 0) + 1
      setCoinBalance(newBalance)
      dispatch({ type: 'SET_USER', user: { coinBalance: newBalance } })
      setCheckedInToday(true)
      showToast('🎉 签到成功 +1 帮帮币')
    }).catch((e: any) => {
      if (e.message.includes('今天已签到')) { setCheckedInToday(true); showToast('今天已签到') }
      else showToast('签到失败: ' + e.message)
    })
  }

  const handleRechargeClick = (opt: typeof RECHARGE_OPTIONS[0]) => {
    setSelectedRecharge(opt)
    setShowPayment(true)
  }

  const handlePayment = () => {
    const u = state.user
    if (!u) return
    recharge(u.id, selectedRecharge.amount).then(() => {
      setShowPayment(false)
      const total = selectedRecharge.coins + selectedRecharge.bonus
      const newBalance = (u.coinBalance || 0) + total
      setCoinBalance(newBalance)
      dispatch({ type: 'SET_USER', user: { coinBalance: newBalance } })
      showToast(`💰 充值成功！获得 ${total} 帮帮币`)
      getTransactions(u.id).then(data => setTransactions(Array.isArray(data) ? data : []))
    }).catch((e: any) => showToast('充值失败: ' + e.message))
  }

  const displayBalance = state.user?.coinBalance ?? coinBalance

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #1E88E5, #00BCD4)', padding: '20px 16px 30px', borderRadius: '0 0 20px 20px', color: '#fff' }}>
        <button onClick={() => navigate(-1)}
          style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 13, cursor: 'pointer', marginBottom: 16 }}>
          ← 返回
        </button>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 40, display: 'block', marginBottom: 4 }}>🪙</span>
          <p style={{ fontSize: 13, opacity: 0.8 }}>我的余额</p>
          <p style={{ fontSize: 40, fontWeight: 700 }}>{displayBalance}</p>
          <p style={{ fontSize: 12, opacity: 0.7 }}>帮帮币</p>
        </div>
      </div>

      <div style={{ padding: '0 16px', marginTop: -16 }}>
        <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 16, boxShadow: 'var(--shadow)', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>每日签到</h3>
            <button onClick={handleCheckIn}
              style={{ padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                background: checkedInToday ? 'var(--bg)' : 'linear-gradient(135deg, #FFD700, #FFA000)',
                color: checkedInToday ? 'var(--text-light)' : '#fff',
                cursor: checkedInToday ? 'default' : 'pointer',
              }}>
              {checkedInToday ? '已签到' : '签到领1币'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', padding: '6px 0', borderRadius: 6, background: i === 0 && checkedInToday ? '#FFF8E1' : 'var(--bg)', fontSize: 12, color: i === 0 && checkedInToday ? '#FFA000' : 'var(--text-light)' }}>
                <div>{['一', '二', '三', '四', '五', '六', '日'][i]}</div>
                <div style={{ fontSize: 16 }}>{i === 0 ? (checkedInToday ? '✅' : '⬜') : '⬜'}</div>
                <div style={{ fontSize: 10 }}>+{i + 1}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 16, boxShadow: 'var(--shadow)', marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>充值帮帮币</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {RECHARGE_OPTIONS.map(opt => (
              <button key={opt.amount} onClick={() => handleRechargeClick(opt)}
                style={{ padding: 14, borderRadius: 10, background: selectedRecharge.amount === opt.amount && !showPayment ? 'var(--primary-light)' : 'var(--bg)', border: selectedRecharge.amount === opt.amount ? '2px solid var(--primary)' : '2px solid transparent', textAlign: 'center', transition: 'all 0.2s' }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)', display: 'block' }}>{opt.coins + opt.bonus} 币</span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>¥{opt.amount}</span>
                {opt.bonus > 0 && <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, display: 'block', marginTop: 2 }}>赠送 {opt.bonus} 币</span>}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-light)', textAlign: 'center', marginTop: 8 }}>1元 = 10帮帮币</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 16, boxShadow: 'var(--shadow)', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>帮帮币用途</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
              <span>二手商品置顶</span>
              <span style={{ fontWeight: 600, color: 'var(--primary)' }}>20 币</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
              <span>外卖代取置顶</span>
              <span style={{ fontWeight: 600, color: 'var(--primary)' }}>30 币</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
              <span>加急费用抵扣</span>
              <span style={{ fontWeight: 600, color: 'var(--primary)' }}>5 币起</span>
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 16, boxShadow: 'var(--shadow)', marginBottom: 80 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>交易记录</h3>
          {transactions.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-light)', textAlign: 'center', padding: 20 }}>暂无记录</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {transactions.slice(0, 10).map((t: any) => (
                <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ fontSize: 13 }}>{t.description}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-light)' }}>{new Date(t.createdAt).toLocaleDateString('zh-CN')}</p>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 600, color: t.type === 'earn' || t.type === 'recharge' ? 'var(--success)' : 'var(--danger)' }}>
                    {t.type === 'earn' || t.type === 'recharge' ? '+' : '-'}{t.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showPayment && (
        <PaymentModal amount={selectedRecharge.amount} title={`充值 ${selectedRecharge.coins + selectedRecharge.bonus} 帮帮币`} onConfirm={handlePayment} onClose={() => setShowPayment(false)} />
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
