import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../store'
import { getProductCategoryLabel, getConditionLabel } from '../mock'
import { getProducts } from '../api/products'
import { useState, useEffect } from 'react'
import PaymentModal from '../components/PaymentModal'

export default function MarketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state } = useApp()
  const [product, setProduct] = useState<any>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000) }

  useEffect(() => {
    getProducts().then(data => {
      const p = (Array.isArray(data) ? data : []).find((x: any) => x.id === id)
      setProduct(p || null)
    })
  }, [id])

  if (!product) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-light)' }}>
      <p style={{ fontSize: 40, marginBottom: 8 }}>😕</p>
      <p>商品不存在</p>
      <button onClick={() => navigate(-1)} style={{ color: 'var(--primary)', marginTop: 12, background: 'none', fontSize: 14 }}>返回</button>
    </div>
  )

  const isSeller = state.user?.id === product.sellerId
  const colors = ['#FFE0B2', '#C8E6C9', '#BBDEFB', '#F8BBD0']
  const color = colors[Math.floor(Math.random() * colors.length)]
  const categoryIcons: Record<string, string> = { book: '📖', electronics: '💻', daily: '🪥', free: '🎁' }

  const handleBuy = () => {
    if (isSeller) { showToast('这是您发布的商品'); return }
    if (product.price === 0) { showToast('🎁 已发送请求，等待回复'); return }
    setShowPayment(true)
  }

  const handlePayment = () => { setShowPayment(false); showToast('🎉 购买成功！请联系卖家取货') }

  return (
    <div>
      <div style={{ height: 220, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', borderRadius: '0 0 20px 20px' }}>
        <span style={{ fontSize: 80, opacity: 0.5 }}>{categoryIcons[product.category]}</span>
        <button onClick={() => navigate(-1)} style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(0,0,0,0.3)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 13, cursor: 'pointer' }}>← 返回</button>
        {product.isUrgent && <span style={{ position: 'absolute', top: 16, right: 16, background: 'linear-gradient(135deg, var(--accent), #FFB74D)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 16 }}>⚡ 急售</span>}
      </div>

      <div style={{ padding: '0 16px', marginTop: -16 }}>
        <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 20, boxShadow: 'var(--shadow-lg)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{product.title}</h2>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            <span style={{ fontSize: 12, background: 'var(--bg)', padding: '2px 8px', borderRadius: 4 }}>{getProductCategoryLabel(product.category)}</span>
            <span style={{ fontSize: 12, background: 'var(--bg)', padding: '2px 8px', borderRadius: 4 }}>{getConditionLabel(product.condition)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: product.price === 0 ? 'var(--success)' : 'var(--accent)' }}>{product.price === 0 ? '免费' : `¥${product.price}`}</span>
            {product.originalPrice && <span style={{ fontSize: 14, color: 'var(--text-light)', textDecoration: 'line-through' }}>¥{product.originalPrice}</span>}
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 20 }}>{product.description}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: '1px solid var(--border)', marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--primary)' }}>{product.sellerName?.[0]}</div>
            <div><div style={{ fontSize: 14, fontWeight: 600 }}>{product.sellerName}</div><span style={{ fontSize: 12, color: 'var(--text-light)' }}>⭐ {product.sellerCredit}</span></div>
          </div>
        </div>

        <button onClick={() => showToast(`📞 请联系卖家：${product.sellerPhone}`)} style={{ width: '100%', padding: '14px 0', borderRadius: 10, background: 'linear-gradient(135deg, var(--primary), #42A5F5)', color: '#fff', fontSize: 15, fontWeight: 700, marginTop: 16, boxShadow: '0 4px 15px rgba(30,136,229,0.3)' }}>💬 联系卖家</button>
        {!isSeller && <button onClick={handleBuy} style={{ width: '100%', padding: '12px 0', borderRadius: 10, marginTop: 8, background: product.price === 0 ? 'var(--success)' : 'var(--accent)', color: '#fff', fontSize: 14, fontWeight: 600 }}>{product.price === 0 ? '🎁 我想要' : '🛒 立即购买'}</button>}
      </div>

      {showPayment && <PaymentModal amount={product.price} title={product.title} onConfirm={handlePayment} onClose={() => setShowPayment(false)} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
