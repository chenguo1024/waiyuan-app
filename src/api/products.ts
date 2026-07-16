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

export async function deleteProduct(id: string) {
  return api.delete(`/products/${id}`)
}

export async function editProduct(id: string, data: any) {
  return api.put(`/products/${id}/edit`, data)
}
