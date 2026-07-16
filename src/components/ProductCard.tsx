import { useNavigate } from 'react-router-dom'
import { useApp } from '../store'
import type { Product } from '../types'
import { getProductCategoryLabel, getConditionLabel, timeAgo } from '../mock'
import { deleteProduct } from '../api/products'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { state } = useApp()
  const navigate = useNavigate()
  const isOwner = state.user?.id === product.sellerId

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('确定删除此商品？')) return
    try {
      await deleteProduct(product.id)
      window.location.reload()
    } catch { alert('删除失败') }
  }

  const colors = ['#FFE0B2', '#C8E6C9', '#BBDEFB', '#F8BBD0']
  const color = colors[Math.floor(Math.random() * colors.length)]

  const card = (
    <div
      onClick={() => navigate(`/market/${product.id}`)}
      style={{
        background: '#fff', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 12,
        boxShadow: 'var(--shadow)', cursor: 'pointer', transition: 'transform 0.15s',
        animation: 'fadeIn 0.3s ease',
        border: product.isUrgent ? '1px solid var(--accent-light)' : 'none',
        position: 'relative',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {product.isUrgent && (
        <div style={{
          position: 'absolute', top: 0, left: 0, zIndex: 2,
          background: 'linear-gradient(135deg, var(--accent), #FFB74D)',
          color: '#fff', fontSize: 11, fontWeight: 700,
          padding: '3px 10px', borderRadius: '12px 0 12px 0',
          animation: 'breathe 2s ease-in-out infinite',
        }}>
          ⚡ 急售
        </div>
      )}
      <div style={{ height: 140, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <span style={{ fontSize: 48, opacity: 0.6 }}>
          {product.category === 'book' ? '📖' : product.category === 'electronics' ? '💻' : product.category === 'free' ? '🎁' : '🪥'}
        </span>
        {product.price === 0 && (
          <span style={{
            position: 'absolute', top: 12, right: 12,
            background: 'var(--success)', color: '#fff', fontSize: 11, fontWeight: 700,
            padding: '2px 8px', borderRadius: 6,
          }}>
            免费
          </span>
        )}
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{product.title}</span>
          {product.isSellerMember && <span className="member-badge">👑 会员</span>}
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, background: 'var(--bg)', padding: '2px 6px', borderRadius: 4 }}>
            {getProductCategoryLabel(product.category)}
          </span>
          <span style={{ fontSize: 11, background: 'var(--bg)', padding: '2px 6px', borderRadius: 4 }}>
            {getConditionLabel(product.condition)}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-light)' }}>
            {timeAgo(product.createdAt)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            {product.originalPrice ? (
              <span style={{ fontSize: 12, color: 'var(--text-light)', textDecoration: 'line-through', marginRight: 6 }}>
                ¥{product.originalPrice}
              </span>
            ) : null}
            <span style={{ fontSize: 18, fontWeight: 700, color: product.price === 0 ? 'var(--success)' : 'var(--accent)' }}>
              {product.price === 0 ? '免费' : `¥${product.price}`}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {isOwner && (
              <button onClick={handleDelete}
                style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--danger)', color: '#fff', fontSize: 11, border: 'none', marginRight: 4 }}>
                删除
              </button>
            )}
            <div style={{
              width: 20, height: 20, borderRadius: '50%', background: 'var(--primary-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--primary)',
            }}>
              {product.sellerName[0]}
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{product.sellerName}</span>
          </div>
        </div>
      </div>
    </div>
  )

  if (product.isUrgent) {
    return <div className="urgent-border">{card}</div>
  }
  return card
}
