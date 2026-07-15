import { createContext, useContext, useReducer, useEffect } from 'react'
import type { ReactNode, Dispatch } from 'react'

interface User {
  id: string
  phone?: string
  email?: string
  name: string
  studentId: string
  creditScore: number
  coinBalance: number
  membership: 'none' | 'monthly' | 'semester'
  membershipExpireAt?: string
  freeUrgentCount: number
  avatar?: string
  gender?: string
  major?: string
  qq?: string
  birthday?: string
}

interface AppState {
  user: User | null
  isLoggedIn: boolean
  loading: boolean
}

type Action =
  | { type: 'LOGIN'; user: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; user: Partial<User> }
  | { type: 'SET_LOADING'; loading: boolean }

const initialState: AppState = {
  user: null,
  isLoggedIn: false,
  loading: false,
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.user, isLoggedIn: true }
    case 'LOGOUT':
      return { ...state, user: null, isLoggedIn: false }
    case 'SET_USER':
      return { ...state, user: state.user ? { ...state.user, ...action.user } : null }
    case 'SET_LOADING':
      return { ...state, loading: action.loading }
    default:
      return state
  }
}

const AppContext = createContext<{ state: AppState; dispatch: Dispatch<Action> } | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    const token = localStorage.getItem('waiyuan_token')
    if (token) {
      const base = import.meta.env.VITE_API_URL || window.location.origin + '/api'
      fetch(`${base}/auth/user/${token}`)
        .then(r => r.json())
        .then(user => {
          if (user.id) dispatch({ type: 'LOGIN', user })
          else localStorage.removeItem('waiyuan_token')
        })
        .catch(() => localStorage.removeItem('waiyuan_token'))
    }
  }, [])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export function saveToken(token: string) {
  localStorage.setItem('waiyuan_token', token)
}

export function clearToken() {
  localStorage.removeItem('waiyuan_token')
}

export type { User }
