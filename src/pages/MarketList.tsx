import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store'
import ProductCard from '../components/ProductCard'
import { getProducts } from '../api/products'

const CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'book', label: '二手书' },
  { key: 'electronics', label: '电子产品' },
  { key: 'daily', label: '生活用品' },
  { key: 'free', label: '免费赠送' },
]

export default function MarketList() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [products, setProducts] = useState<any[]>([])
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('newest')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getProducts().then(data => {
      setProducts(Array.isArray(data) ? data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  let filtered = products.filter((p: any) => category === 'all' || p.category === category)
  if (sort === 'price-asc') filtered.sort((a: any, b: any) => a.price - b.price)
  else if (sort === 'price-desc') filtered.sort((a: any, b: any) => b.price - a.price)
  else filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #FF7043, #FF8A65)', padding: '16px 16px 20px', borderRadius: '0 0 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 28 }}>🏪</span>
          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>校园集市</h2>
          {state.user && <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>🪙 {state.user.coinBalance}</span>}
        </div>
      </div>

      <div style={{ padding: '0 12px', marginTop: -8 }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '4px 0 8px', scrollbarWidth: 'none' }}>
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setCategory(c.key)}
              style={{ padding: '6px 14px', borderRadius: 16, fontSize: 12, whiteSpace: 'nowrap', background: category === c.key ? 'var(--accent)' : 'var(--card)', color: category === c.key ? '#fff' : 'var(--text-secondary)', fontWeight: category === c.key ? 600 : 400, boxShadow: category === c.key ? '0 2px 8px rgba(255,112,67,0.3)' : 'var(--shadow)' }}>
              {c.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
          {[{ key: 'newest', label: '最新' }, { key: 'price-asc', label: '价格↑' }, { key: 'price-desc', label: '价格↓' }].map(s => (
            <button key={s.key} onClick={() => setSort(s.key)} style={{ padding: '4px 12px', borderRadius: 6, fontSize: 11, background: sort === s.key ? 'var(--bg)' : 'transparent', color: sort === s.key ? 'var(--text)' : 'var(--text-light)' }}>{s.label}</button>
          ))}
        </div>

        {loading ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>加载中...</div>
          : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-light)' }}>
              <p style={{ fontSize: 40, marginBottom: 8 }}>📭</p>
              <p style={{ fontSize: 14, marginBottom: 12 }}>暂无商品</p>
              <button onClick={() => navigate('/publish')} style={{ padding: '8px 20px', borderRadius: 8, background: 'var(--primary)', color: '#fff', fontSize: 13 }}>发布商品</button>
            </div>
          ) : filtered.map((p: any) => <ProductCard key={p.id} product={p} />)
        }
      </div>
    </div>
  )
}
