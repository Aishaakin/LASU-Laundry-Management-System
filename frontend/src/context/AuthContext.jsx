import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'
import { setAuthToken, removeAuthToken } from '../services/api'

const AuthContext = createContext(null)

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true, isLoading: false }
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, isLoading: false }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user_data')
    if (token && userData) {
      setAuthToken(token)
      try {
        dispatch({ type: 'SET_USER', payload: JSON.parse(userData) })
      } catch {
        dispatch({ type: 'LOGOUT' })
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password)
    localStorage.setItem('access_token', data.tokens.access)
    localStorage.setItem('refresh_token', data.tokens.refresh)
    localStorage.setItem('user_data', JSON.stringify(data.user))
    setAuthToken(data.tokens.access)
    dispatch({ type: 'SET_USER', payload: data.user })
    return data.user
  }, [])

  const register = useCallback(async (formData) => {
    const data = await authService.register(formData)
    localStorage.setItem('access_token', data.tokens.access)
    localStorage.setItem('refresh_token', data.tokens.refresh)
    localStorage.setItem('user_data', JSON.stringify(data.user))
    setAuthToken(data.tokens.access)
    dispatch({ type: 'SET_USER', payload: data.user })
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) await authService.logout(refresh)
    } catch {}
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_data')
    removeAuthToken()
    dispatch({ type: 'LOGOUT' })
  }, [])

  const updateUser = useCallback((user) => {
    localStorage.setItem('user_data', JSON.stringify(user))
    dispatch({ type: 'SET_USER', payload: user })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
