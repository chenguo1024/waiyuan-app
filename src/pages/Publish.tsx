import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store'
import PaymentModal from '../components/PaymentModal'
import { createTask } from '../api/tasks'
import { createProduct } from '../api/products'

type PublishType = 'errand' | 'product' | null

export default function Publish() {
  const navigate = useNavigate()
  const { state } = useApp()
  const [type, setType] = useState<PublishType>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [toast, setToast] = useState('')

  const [errandData, setErrandData] = useState({ category: 'food', title: '', description: '', pickupLocation: '', deliveryLocation: '', reward: 5, isUrgent: false })
  const [productData, setProductData] = useState({ category: 'book', title: '', description: '', price: 0, condition: 'good', isUrgent: false })

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000) }

  const handlePublish = () => {
    if (!state.user) { showToast('请先登录'); return }
    if (type === 'errand') {
      if (!errandData.title || !errandData.description) { showToast('请填写完整信息'); return }
      if (errandData.isUrgent) { setShowPayment(true); return }
      submitErrand(0)
    } else if (type === 'product') {
      if (!productData.title || !productData.description) { showToast('请填写完整信息'); return }
      if (productData.isUrgent) { setShowPayment(true); return }
      submitProduct()
    }
  }

  const submitErrand = (_urgentFee: number) => {
    createTask({
      category: errandData.category, title: errandData.title, description: errandData.description,
      pickupLocation: errandData.pickupLocation || '未指定',
      deliveryLocation: errandData.deliveryLocation || '未指定',
      reward: errandData.reward, isUrgent: errandData.isUrgent,
      urgentFee: _urgentFee,
      urgentDeadline: errandData.isUrgent ? new Date(Date.now() + 60 * 60 * 1000).toISOString() : undefined,
      publisherId: state.user?.id, publisherName: state.user?.name,
    }).then(() => {
      showToast('✅ 跑腿任务发布成功！')
      setTimeout(() => navigate('/errands'), 1000)
    }).catch((e: any) => showToast('发布失败: ' + e.message))
  }

  const submitProduct = () => {
    createProduct({
      category: productData.category, title: productData.title, description: productData.description,
      price: productData.price, condition: productData.condition,
      isUrgent: productData.isUrgent, sellerId: state.user?.id,
      sellerName: state.user?.name, sellerPhone: state.user?.phone || '',
    }).then(() => {
      showToast('✅ 商品发布成功！')
      setTimeout(() => navigate('/market'), 1000)
    }).catch((e: any) => showToast('发布失败: ' + e.message))
  }

  const handlePayment = (_method?: string) => {
    setShowPayment(false)
    if (type === 'errand') submitErrand(3); else submitProduct()
  }

  if (!type) {
    return (
      <div style={{ padding: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>发布内容</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>选择要发布的模块</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={() => setType('errand')} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, background: '#fff', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', textAlign: 'left', width: '100%' }}>
            <span style={{ fontSize: 36 }}>🏃</span>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>万能跑腿</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>外卖代取 · 打印 · 快递 · 代办</p>
            </div>
            <span style={{ marginLeft: 'auto', color: 'var(--text-light)', fontSize: 18 }}>›</span>
          </button>
          <button onClick={() => setType('product')} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, background: '#fff', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', textAlign: 'left', width: '100%' }}>
            <span style={{ fontSize: 36 }}>🏪</span>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>校园集市</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>二手书 · 电子产品 · 生活用品</p>
            </div>
            <span style={{ marginLeft: 'auto', color: 'var(--text-light)', fontSize: 18 }}>›</span>
          </button>
          <button onClick={() => navigate('/study')} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, background: '#fff', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', textAlign: 'left', width: '100%' }}>
            <span style={{ fontSize: 36 }}>📚</span>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>学习互助</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>笔记分享 · 找辅导 · 组队学习</p>
            </div>
            <span style={{ marginLeft: 'auto', color: 'var(--text-light)', fontSize: 18 }}>›</span>
          </button>
          <button onClick={() => navigate('/carpool')} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, background: '#fff', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', textAlign: 'left', width: '100%' }}>
            <span style={{ fontSize: 36 }}>🚗</span>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>拼车出行</h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>发布拼车信息 · 分摊费用</p>
            </div>
            <span style={{ marginLeft: 'auto', color: 'var(--text-light)', fontSize: 18 }}>›</span>
          </button>
        </div>
      </div>
    )
  }

  if (type === 'errand') {
    return (
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <button onClick={() => setType(null)} style={{ background: 'none', fontSize: 20, color: 'var(--text-secondary)' }}>‹</button>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>发布跑腿任务</h2>
        </div>
        <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 20, boxShadow: 'var(--shadow)' }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>任务类别</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {[{ k: 'food', l: '🍔 外卖代取' }, { k: 'delivery', l: '📦 快递代取' }, { k: 'print', l: '🖨️ 打印' }, { k: 'other', l: '📋 其他' }].map(c => (
              <button key={c.k} onClick={() => setErrandData(d => ({ ...d, category: c.k }))} style={{ padding: '10px', borderRadius: 8, background: errandData.category === c.k ? 'var(--primary-light)' : 'var(--bg)', color: errandData.category === c.k ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: errandData.category === c.k ? 600 : 400, fontSize: 13 }}>
                {c.l}
              </button>
            ))}
          </div>
          <input placeholder="任务标题" value={errandData.title} onChange={e => setErrandData(d => ({ ...d, title: e.target.value }))} style={{ width: '100%', padding: '12px 14px', borderRadius: 8, background: 'var(--bg)', fontSize: 14, marginBottom: 12 }} />
          <textarea placeholder="任务描述" value={errandData.description} onChange={e => setErrandData(d => ({ ...d, description: e.target.value }))} rows={3} style={{ width: '100%', padding: '12px 14px', borderRadius: 8, background: 'var(--bg)', fontSize: 14, marginBottom: 12, resize: 'none' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <input placeholder="取货地点" value={errandData.pickupLocation} onChange={e => setErrandData(d => ({ ...d, pickupLocation: e.target.value }))} style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--bg)', fontSize: 14 }} />
            <input placeholder="送达地点" value={errandData.deliveryLocation} onChange={e => setErrandData(d => ({ ...d, deliveryLocation: e.target.value }))} style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--bg)', fontSize: 14 }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>赏金（元）</label>
            <input type="number" value={errandData.reward} onChange={e => setErrandData(d => ({ ...d, reward: Math.max(0, Number(e.target.value)) }))} style={{ width: '100%', padding: '12px 14px', borderRadius: 8, background: 'var(--bg)', fontSize: 14 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 14 }}>加急发布（¥3起）</span>
            <button onClick={() => setErrandData(d => ({ ...d, isUrgent: !d.isUrgent }))} style={{ width: 48, height: 26, borderRadius: 13, background: errandData.isUrgent ? 'var(--accent)' : 'var(--border)', position: 'relative', transition: 'all 0.2s' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: errandData.isUrgent ? 24 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </button>
          </div>
          {errandData.isUrgent && <div style={{ background: '#FFF3E0', borderRadius: 8, padding: 10, marginBottom: 12 }}><p style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>加急费用：30分钟内¥5 | 1小时内¥3 | 2小时内¥2</p></div>}
        </div>
        <button onClick={handlePublish} style={{ width: '100%', padding: '14px 0', borderRadius: 10, marginTop: 16, background: 'linear-gradient(135deg, var(--primary), #42A5F5)', color: '#fff', fontSize: 15, fontWeight: 700, boxShadow: '0 4px 15px rgba(30,136,229,0.3)' }}>
          {errandData.isUrgent ? '去支付' : '免费发布'}
        </button>
        {showPayment && <PaymentModal amount={errandData.isUrgent ? 3 : 0} title={errandData.title} onConfirm={handlePayment} onClose={() => setShowPayment(false)} />}
        {toast && <div className="toast">{toast}</div>}
      </div>
    )
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <button onClick={() => setType(null)} style={{ background: 'none', fontSize: 20, color: 'var(--text-secondary)' }}>‹</button>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>发布商品</h2>
      </div>
      <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 20, boxShadow: 'var(--shadow)' }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>商品分类</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {[{ k: 'book', l: '📖 二手书' }, { k: 'electronics', l: '💻 电子产品' }, { k: 'daily', l: '🪥 生活用品' }, { k: 'free', l: '🎁 免费赠送' }].map(c => (
            <button key={c.k} onClick={() => setProductData(d => ({ ...d, category: c.k }))} style={{ padding: '10px', borderRadius: 8, background: productData.category === c.k ? 'var(--primary-light)' : 'var(--bg)', color: productData.category === c.k ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: productData.category === c.k ? 600 : 400, fontSize: 13 }}>
              {c.l}
            </button>
          ))}
        </div>
        <input placeholder="商品标题" value={productData.title} onChange={e => setProductData(d => ({ ...d, title: e.target.value }))} style={{ width: '100%', padding: '12px 14px', borderRadius: 8, background: 'var(--bg)', fontSize: 14, marginBottom: 12 }} />
        <textarea placeholder="商品描述" value={productData.description} onChange={e => setProductData(d => ({ ...d, description: e.target.value }))} rows={3} style={{ width: '100%', padding: '12px 14px', borderRadius: 8, background: 'var(--bg)', fontSize: 14, marginBottom: 12, resize: 'none' }} />
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>价格（元）</label>
          <input type="number" value={productData.price} onChange={e => setProductData(d => ({ ...d, price: Math.max(0, Number(e.target.value)) }))} style={{ width: '100%', padding: '12px 14px', borderRadius: 8, background: 'var(--bg)', fontSize: 14 }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>新旧程度</p>
          <div style={{ display: 'flex', gap: 6 }}>
            {[{ k: 'new', l: '全新' }, { k: 'like-new', l: '几乎全新' }, { k: 'good', l: '良好' }, { k: 'fair', l: '一般' }].map(c => (
              <button key={c.k} onClick={() => setProductData(d => ({ ...d, condition: c.k }))} style={{ flex: 1, padding: '8px 0', borderRadius: 6, fontSize: 12, background: productData.condition === c.k ? 'var(--primary)' : 'var(--bg)', color: productData.condition === c.k ? '#fff' : 'var(--text-secondary)' }}>
                {c.l}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14 }}>加急发布（¥2起）</span>
          <button onClick={() => setProductData(d => ({ ...d, isUrgent: !d.isUrgent }))} style={{ width: 48, height: 26, borderRadius: 13, background: productData.isUrgent ? 'var(--accent)' : 'var(--border)', position: 'relative' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: productData.isUrgent ? 24 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
          </button>
        </div>
        {productData.isUrgent && <div style={{ background: '#FFF3E0', borderRadius: 8, padding: 10, marginTop: 12 }}><p style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>加急费用：6小时内¥2 | 12小时内¥1</p></div>}
      </div>
      <button onClick={handlePublish} style={{ width: '100%', padding: '14px 0', borderRadius: 10, marginTop: 16, background: 'linear-gradient(135deg, var(--primary), #42A5F5)', color: '#fff', fontSize: 15, fontWeight: 700, boxShadow: '0 4px 15px rgba(30,136,229,0.3)' }}>
        {productData.isUrgent ? '去支付' : '免费发布'}
      </button>
      {showPayment && <PaymentModal amount={productData.isUrgent ? 2 : 0} title={productData.title} onConfirm={handlePayment} onClose={() => setShowPayment(false)} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
