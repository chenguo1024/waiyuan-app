import { useState } from 'react'

interface PaymentModalProps {
  amount: number
  title: string
  onConfirm: (method: 'coins' | 'wechat') => void
  onClose: () => void
}

export default function PaymentModal({ amount, title, onConfirm, onClose }: PaymentModalProps) {
  const [method, setMethod] = useState<'coins' | 'wechat'>('wechat')

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 320, background: '#fff', borderRadius: 16, padding: 24,
          animation: 'slideUp 0.3s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{ textAlign: 'center', marginBottom: 16, fontSize: 18 }}>确认支付</h3>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 8, fontSize: 13 }}>{title}</p>
        <p style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, color: 'var(--primary)', marginBottom: 20 }}>
          ¥{amount.toFixed(2)}
        </p>

        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>支付方式</p>
          <button
            onClick={() => setMethod('wechat')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '12px 16px', borderRadius: 10, border: `2px solid ${method === 'wechat' ? 'var(--success)' : 'var(--border)'}`,
              background: '#fff', marginBottom: 8, transition: 'border 0.2s',
            }}
          >
            <span style={{ fontSize: 22 }}>💚</span>
            <span style={{ flex: 1, textAlign: 'left', fontSize: 14 }}>微信支付</span>
            {method === 'wechat' && <span style={{ color: 'var(--success)' }}>✓</span>}
          </button>
          <button
            onClick={() => setMethod('coins')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '12px 16px', borderRadius: 10, border: `2px solid ${method === 'coins' ? 'var(--primary)' : 'var(--border)'}`,
              background: '#fff', transition: 'border 0.2s',
            }}
          >
            <span style={{ fontSize: 22 }}>🪙</span>
            <span style={{ flex: 1, textAlign: 'left', fontSize: 14 }}>帮帮币支付</span>
            {method === 'coins' && <span style={{ color: 'var(--primary)' }}>✓</span>}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '12px 0', borderRadius: 10, background: 'var(--bg)',
              color: 'var(--text-secondary)', fontSize: 15, fontWeight: 600,
            }}
          >
            取消
          </button>
          <button
            onClick={() => onConfirm(method)}
            style={{
              flex: 1, padding: '12px 0', borderRadius: 10, background: 'var(--primary)',
              color: '#fff', fontSize: 15, fontWeight: 600,
            }}
          >
            确认支付
          </button>
        </div>
      </div>
    </div>
  )
}
