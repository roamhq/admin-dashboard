import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    authenticated: false,
    user: null,
  }),

  actions: {
    login(user) {
      this.authenticated = true
      this.user = user || null

      localStorage.setItem('auth_authenticated', 'true')

      if (user) {
        localStorage.setItem('auth_user', JSON.stringify(user))
      }
    },
    logout() {
      this.authenticated = false
      this.user = null

      localStorage.removeItem('auth_authenticated')
      localStorage.removeItem('auth_user')
    },

    initAuth() {
      const authenticated = localStorage.getItem('auth_authenticated') === 'true'
      const userStr = localStorage.getItem('auth_user')

      this.authenticated = authenticated
      this.user = userStr ? JSON.parse(userStr) : null
    },
  },

  getters: {
    isAuthenticated: (state) => state.authenticated,
  },
})
