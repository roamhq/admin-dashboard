<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { API_CONFIG } from '@/config/api'
import type { DnsRecord, AuthEntry, TokenResponse } from '@/types'
import EcsTaskRunner from './EcsTaskRunner.vue'

const activeTab = ref<string>('ecs')
const newRecord = ref<DnsRecord>({ client: '', type: '', host: '', data: '' })
const clientName = ref<string>('')
const generatedToken = ref<string>('')
const authenticationData = ref<AuthEntry[]>([])
const isLoading = ref<boolean>(false)
const isAddingRecord = ref<boolean>(false)
const isGeneratingToken = ref<boolean>(false)
const isSavingAuth = ref<boolean>(false)

const addRecord = async (): Promise<void> => {
  if (
    !newRecord.value.client ||
    !newRecord.value.type ||
    !newRecord.value.host ||
    !newRecord.value.data
  ) {
    return
  }

  isAddingRecord.value = true

  try {
    await fetch(API_CONFIG.buildUrl('/api/dns'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord.value),
    })

    // Reset form
    newRecord.value = { client: '', type: '', host: '', data: '' }
  } catch (error) {
    console.error('Error adding DNS record:', error)
  } finally {
    isAddingRecord.value = false
  }
}

const generateClientToken = async (): Promise<void> => {
  if (!clientName.value.trim()) {
    return
  }

  isGeneratingToken.value = true

  try {
    const res = await fetch(API_CONFIG.buildUrl('/api/token'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientName: clientName.value }),
    })

    const data: TokenResponse = await res.json()
    generatedToken.value = data.token || ''
  } catch (error) {
    console.error('Error generating token:', error)
  } finally {
    isGeneratingToken.value = false
  }
}

const fetchAuthenticationData = async (): Promise<void> => {
  isLoading.value = true

  try {
    const res = await fetch(API_CONFIG.buildUrl('/api/authentication'))
    const data: AuthEntry[] = await res.json()

    authenticationData.value = (data || []).map((entry) => ({
      ...entry,
      enabled: Boolean(entry.enabled),
    }))
  } catch (error) {
    console.error(error)
    authenticationData.value = []
  } finally {
    isLoading.value = false
  }
}

const saveAuthenticationData = async (): Promise<void> => {
  isSavingAuth.value = true

  try {
    await fetch(API_CONFIG.buildUrl('/api/authentication'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authenticationData.value),
    })
  } catch (error) {
    console.error('Error saving authentication data:', error)
  } finally {
    isSavingAuth.value = false
  }
}

const addNewAuthEntry = (): void => {
  authenticationData.value.push({
    hostname: '',
    uri: '',
    username: '',
    password: '',
    theme: '',
    enabled: true,
  })
}

const removeAuthEntry = (index: number): void => {
  authenticationData.value.splice(index, 1)
}

const handleKeyPress = (event: KeyboardEvent, action: 'addRecord' | 'generateToken'): void => {
  if (event.key === 'Enter') {
    event.preventDefault()
    if (action === 'addRecord') {
      addRecord()
    } else if (action === 'generateToken') {
      generateClientToken()
    }
  }
}

onMounted(() => {
  fetchAuthenticationData()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Tab Navigation -->
    <div
      class="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden h-[900px] flex flex-col"
    >
      <div role="tablist" class="flex border-b border-gray-200 bg-gray-50">
        <button
          role="tab"
          class="flex items-center px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 focus:outline-none"
          :class="
            activeTab === 'ecs'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
          "
          @click="activeTab = 'ecs'"
        >
          <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
          ECS Tasks
        </button>
        <button
          role="tab"
          class="flex items-center px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 focus:outline-none"
          :class="
            activeTab === 'dns'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
          "
          @click="activeTab = 'dns'"
        >
          <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          DNS Records
        </button>
        <button
          role="tab"
          class="flex items-center px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 focus:outline-none"
          :class="
            activeTab === 'tokens'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
          "
          @click="activeTab = 'tokens'"
        >
          <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
          Tokens
        </button>
        <button
          role="tab"
          class="flex items-center px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 focus:outline-none"
          :class="
            activeTab === 'auth'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
          "
          @click="activeTab = 'auth'"
        >
          <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          Authentication
        </button>
      </div>

      <!-- Tab Content -->
      <div class="p-6 sm:p-8 flex-1 flex flex-col">
        <!-- ECS Task Runner Tab -->
        <div v-show="activeTab === 'ecs'" class="flex-1 overflow-y-auto">
          <EcsTaskRunner />
        </div>

        <!-- DNS Record Tab -->
        <div v-show="activeTab === 'dns'" class="flex-1 flex flex-col">
          <div class="flex items-center mb-6">
            <div class="flex-shrink-0">
              <svg
                class="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div class="ml-3">
              <h2 class="text-lg font-semibold text-gray-900">DNS Record</h2>
              <p class="text-sm text-gray-600">Create new DNS records for client domains</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label for="client" class="block text-sm font-medium text-gray-700 mb-2"
                >Client</label
              >
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                  v-model="newRecord.client"
                  @keypress="(e) => handleKeyPress(e, 'addRecord')"
                  placeholder="roamhq"
                  type="text"
                  name="client"
                  id="client"
                  :disabled="isAddingRecord"
                  class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label for="type" class="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
                <input
                  v-model="newRecord.type"
                  @keypress="(e) => handleKeyPress(e, 'addRecord')"
                  placeholder="CNAME, TXT"
                  type="text"
                  name="type"
                  id="type"
                  :disabled="isAddingRecord"
                  class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label for="host" class="block text-sm font-medium text-gray-700 mb-2">Host</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                    />
                  </svg>
                </div>
                <input
                  v-model="newRecord.host"
                  @keypress="(e) => handleKeyPress(e, 'addRecord')"
                  placeholder="subdomain.example.com"
                  type="text"
                  name="host"
                  id="host"
                  :disabled="isAddingRecord"
                  class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label for="data" class="block text-sm font-medium text-gray-700 mb-2">Data</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <input
                  v-model="newRecord.data"
                  @keypress="(e) => handleKeyPress(e, 'addRecord')"
                  placeholder="target.example.com"
                  type="text"
                  name="data"
                  id="data"
                  :disabled="isAddingRecord"
                  class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <button
              @click="addRecord"
              :disabled="
                isAddingRecord ||
                !newRecord.client ||
                !newRecord.type ||
                !newRecord.host ||
                !newRecord.data
              "
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              <svg
                v-if="isAddingRecord"
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              {{ isAddingRecord ? 'Adding...' : 'Add Record' }}
            </button>
          </div>
        </div>

        <!-- Generate Client Token Tab -->
        <div v-show="activeTab === 'tokens'" class="flex-1 flex flex-col">
          <div class="flex items-center mb-6">
            <div class="flex-shrink-0">
              <svg
                class="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <div class="ml-3">
              <h2 class="text-lg font-semibold text-gray-900">Generate Client Token</h2>
              <p class="text-sm text-gray-600">
                Create unique access tokens for client DNS management
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="clientName" class="block text-sm font-medium text-gray-700 mb-2"
                >Client Name</label
              >
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                  v-model="clientName"
                  @keypress="(e) => handleKeyPress(e, 'generateToken')"
                  placeholder="roamhq"
                  type="text"
                  name="clientName"
                  id="clientName"
                  :disabled="isGeneratingToken"
                  class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
            </div>

            <div v-if="generatedToken">
              <label for="token" class="block text-sm font-medium text-gray-700 mb-2"
                >Generated Token</label
              >
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                    />
                  </svg>
                </div>
                <input
                  v-model="generatedToken"
                  type="text"
                  name="token"
                  id="token"
                  readonly
                  class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-900 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <button
              @click="generateClientToken"
              :disabled="isGeneratingToken || !clientName.trim()"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              <svg
                v-if="isGeneratingToken"
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              {{ isGeneratingToken ? 'Generating...' : 'Generate Token' }}
            </button>
          </div>
        </div>

        <!-- Authentication Tab -->
        <div v-show="activeTab === 'auth'" class="flex-1 flex flex-col">
          <div class="flex items-center mb-6">
            <div class="flex-shrink-0">
              <svg
                class="h-6 w-6 text-purple-600"
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
            <div class="ml-3">
              <h2 class="text-lg font-semibold text-gray-900">Authentication</h2>
              <p class="text-sm text-gray-600">
                Manage authentication credentials for different hostnames
              </p>
            </div>
          </div>

          <div v-if="isLoading" class="text-center py-8">
            <svg
              class="animate-spin h-8 w-8 text-gray-400 mx-auto mb-4"
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
            <p class="text-sm text-gray-600">Loading authentication data...</p>
          </div>

          <div v-else>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Hostname
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      URI
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Username
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Password
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Theme
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Enabled
                    </th>
                    <th scope="col" class="relative px-3 py-3">
                      <span class="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr
                    v-for="(entry, index) in authenticationData"
                    :key="index"
                    class="hover:bg-gray-50"
                  >
                    <td class="px-3 py-4 whitespace-nowrap">
                      <input
                        v-model="entry.hostname"
                        type="text"
                        placeholder="roam.client.com.au"
                        class="block w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-purple-500 focus:ring-opacity-50 text-sm transition-colors"
                      />
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap">
                      <input
                        v-model="entry.uri"
                        type="text"
                        placeholder="/page-uri"
                        class="block w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-purple-500 focus:ring-opacity-50 text-sm transition-colors"
                      />
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap">
                      <input
                        v-model="entry.username"
                        type="text"
                        placeholder="username"
                        class="block w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-purple-500 focus:ring-opacity-50 text-sm transition-colors"
                      />
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap">
                      <input
                        v-model="entry.password"
                        type="password"
                        placeholder="password"
                        class="block w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-purple-500 focus:ring-opacity-50 text-sm transition-colors"
                      />
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap">
                      <input
                        v-model="entry.theme"
                        type="text"
                        placeholder="roam"
                        class="block w-full px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-purple-500 focus:ring-opacity-50 text-sm transition-colors"
                      />
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap">
                      <input
                        v-model="entry.enabled"
                        type="checkbox"
                        class="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        @click="removeAuthEntry(index)"
                        class="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mt-6 flex justify-between items-center">
              <button
                @click="addNewAuthEntry"
                class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
              >
                <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add New Entry
              </button>

              <button
                @click="saveAuthenticationData"
                :disabled="isSavingAuth"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              >
                <svg
                  v-if="isSavingAuth"
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                {{ isSavingAuth ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
