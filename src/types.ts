export interface User {
  id: string
  phone: string
  name: string
  avatar: string
  studentId: string
  creditScore: number
  coinBalance: number
  membership: 'none' | 'monthly' | 'semester'
  membershipExpireAt?: string
  freeUrgentCount: number
}

export type TaskCategory = 'food' | 'print' | 'delivery' | 'other'
export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'confirmed'

export interface Task {
  id: string
  category: TaskCategory
  title: string
  description: string
  pickupLocation: string
  deliveryLocation: string
  reward: number
  isUrgent: boolean
  urgentFee: number
  urgentDeadline?: string
  status: TaskStatus
  publisherId: string
  publisherName: string
  publisherAvatar: string
  publisherCredit: number
  isPublisherMember: boolean
  createdAt: string
  acceptedBy?: string
  acceptedByName?: string
}

export type ProductCategory = 'book' | 'electronics' | 'daily' | 'free'

export interface Product {
  id: string
  category: ProductCategory
  title: string
  description: string
  price: number
  originalPrice?: number
  condition: 'new' | 'like-new' | 'good' | 'fair'
  images: string[]
  isUrgent: boolean
  sellerId: string
  sellerName: string
  sellerAvatar: string
  sellerCredit: number
  sellerPhone: string
  isSellerMember: boolean
  createdAt: string
}

export interface Order {
  id: string
  type: 'errand' | 'product' | 'study'
  itemId: string
  title: string
  amount: number
  status: string
  createdAt: string
}

export interface Transaction {
  id: string
  type: 'earn' | 'spend' | 'recharge'
  amount: number
  description: string
  createdAt: string
}

export interface StudyResource {
  id: string
  type: 'note' | 'tutor' | 'group'
  title: string
  description: string
  price: number
  publisherId: string
  publisherName: string
  publisherAvatar: string
  tags: string[]
  createdAt: string
}

export interface CarpoolRide {
  id: string
  from: string
  to: string
  departureTime: string
  seats: number
  seatsLeft: number
  fee: number
  publisherId: string
  publisherName: string
  publisherAvatar: string
  publisherPhone: string
  note: string
  createdAt: string
}

export interface Notification {
  id: string
  type: 'system' | 'task' | 'order'
  title: string
  message: string
  read: boolean
  createdAt: string
}

export type TabType = 'follow' | 'recommend' | 'all'

export interface AppState {
  user: User | null
  isLoggedIn: boolean
  tasks: Task[]
  products: Product[]
  orders: Order[]
  transactions: Transaction[]
  checkedInToday: boolean
  studyResources: StudyResource[]
  carpoolRides: CarpoolRide[]
  notifications: Notification[]
}
