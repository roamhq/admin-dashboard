import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, AuthState } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const authenticated = ref<boolean>(false)
  const user = ref<User | null>(null)
  const isLoading = ref<boolean>(false)

  const isAuthenticated = computed<boolean>(() => authenticated.value)

  const login = async (credentials?: { user?: User }): Promise<void> => {
    isLoading.value = true
    try {
      authenticated.value = true
      user.value = credentials?.user || null

      localStorage.setItem('auth_authenticated', 'true')

      if (credentials?.user) {
        localStorage.setItem('auth_user', JSON.stringify(credentials.user))
      }
    } finally {
      isLoading.value = false
    }
  }

  const logout = (): void => {
    authenticated.value = false
    user.value = null

    localStorage.removeItem('auth_authenticated')
    localStorage.removeItem('auth_user')
  }

  const initAuth = (): void => {
    const authStored = localStorage.getItem('auth_authenticated') === 'true'
    const userStr = localStorage.getItem('auth_user')

    authenticated.value = authStored
    user.value = userStr ? JSON.parse(userStr) : null
  }

  return {
    authenticated,
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    initAuth
  }
}) 