<!-- views/AdminPage.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import AdminPanel from '../components/AdminPanel.vue'
import LogoHeader from '../components/LogoHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { API_CONFIG } from '@/config/api'
import type { LoginForm } from '@/types'

const auth = useAuthStore()
const username = ref<string>('')
const password = ref<string>('')
const authError = ref<string>('')
const isLoading = ref<boolean>(false)

const authenticate = async (): Promise<void> => {
  if (isLoading.value) return
  isLoading.value = true
  authError.value = ''

  try {
    const loginData: LoginForm = {
      username: username.value,
      password: password.value
    }

    const response = await fetch(API_CONFIG.buildUrl('/api/admin'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    })
    
    if (response.ok) {
      await auth.login()
      authError.value = ''
    } else {
      authError.value = 'Invalid credentials'
    }
  } catch (error) {
    console.error(error)
    authError.value = 'Authentication failed'
  } finally {
    isLoading.value = false
  }
}

const handleKeyPress = (event: KeyboardEvent): void => {
  if (event.key === 'Enter') {
    authenticate()
  }
}
</script>

<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6"
  >
    <LogoHeader />
    <div class="w-full flex flex-col items-center">
      <div v-if="!auth.isAuthenticated" class="w-full max-w-xl mx-auto">
        <div class="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div class="px-6 py-8 sm:px-8">
            <div class="mt-8">
              <div class="space-y-6">
                <div>
                  <label for="username" class="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <div class="relative">
                    <div
                      class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    >
                      <svg
                        class="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <input
                      id="username"
                      v-model="username"
                      type="text"
                      @keypress="handleKeyPress"
                      placeholder="Enter your username"
                      class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      :disabled="isLoading"
                    />
                  </div>
                </div>
                <div>
                  <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div class="relative">
                    <div
                      class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    >
                      <svg
                        class="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <input
                      id="password"
                      v-model="password"
                      type="password"
                      @keypress="handleKeyPress"
                      placeholder="Enter your password"
                      class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      :disabled="isLoading"
                    />
                  </div>
                </div>
                <div v-if="authError" class="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg
                        class="h-5 w-5 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm text-red-700">{{ authError }}</p>
                    </div>
                  </div>
                </div>
                <button
                  @click="authenticate"
                  :disabled="isLoading || !username || !password"
                  class="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                >
                  <svg
                    v-if="isLoading"
                    class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {{ isLoading ? 'Signing in...' : 'Sign in' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="w-full max-w-7xl mx-auto">
        <AdminPanel />
      </div>
    </div>
  </div>
</template>
