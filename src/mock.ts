export function getTaskCategoryLabel(cat: string): string {
  const m: Record<string, string> = { food: '外卖代取', print: '打印', delivery: '快递代取', other: '其他' }
  return m[cat] || cat
}

export function getProductCategoryLabel(cat: string): string {
  const m: Record<string, string> = { book: '二手书', electronics: '电子产品', daily: '生活用品', free: '免费赠送' }
  return m[cat] || cat
}

export function getConditionLabel(c: string): string {
  const m: Record<string, string> = { new: '全新', 'like-new': '几乎全新', good: '良好', fair: '一般' }
  return m[c] || c
}

export function getStudyTypeLabel(t: string): string {
  const m: Record<string, string> = { note: '笔记/真题', tutor: '找辅导', group: '组队学习' }
  return m[t] || t
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}天前`
  return `${Math.floor(days / 30)}个月前`
}

export function formatTimeLeft(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now()
  if (diff <= 0) return '已截止'
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}分钟`
  const hours = Math.floor(mins / 60)
  const remainMins = mins % 60
  return `${hours}小时${remainMins}分钟`
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}
