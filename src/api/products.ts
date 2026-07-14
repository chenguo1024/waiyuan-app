import api from './client'

export async function getProducts(category?: string, sellerId?: string) {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  if (sellerId) params.set('sellerId', sellerId)
  return api.get(`/products?${params}`)
}

export async function createProduct(data: any) {
  return api.post('/products', data)
}
