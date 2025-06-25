<!-- Main App.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import LogoHeader from './LogoHeader.vue'
import DnsTable from './DnsTable.vue'
import NotificationMessage from './NotificationMessage.vue'
import { API_CONFIG } from '@/config/api'
import type { DnsRecord } from '@/types'

interface VerificationStatus {
  [key: string]: boolean
}

const records = ref<DnsRecord[]>([])
const token = ref<string>('')
const verificationStatus = ref<VerificationStatus>({})
const loading = ref<boolean>(false)
const showNotification = ref<boolean>(false)

const fetchRecords = async (): Promise<void> => {
  loading.value = true
  const query = token.value ? `?token=${encodeURIComponent(token.value)}` : ''
  const res = await fetch(API_CONFIG.buildUrl(`/api/dns${query}`))

  if (!res.ok) {
    records.value = []
  } else {
    records.value = await res.json()
  }

  await verifyRecords()
  loading.value = false
}

const verifyRecords = async (): Promise<void> => {
  for (const record of records.value) {
    const queryUrl = `https://cloudflare-dns.com/dns-query?name=${record.host}&type=${record.type}`
    const res = await fetch(queryUrl, {
      headers: { Accept: 'application/dns-json' },
    })
    const data = await res.json()
    const matched = data.Answer?.some((ans: any) => ans.data === record.data)
    verificationStatus.value[record.host] = matched
  }
}

const showCopyNotification = (): void => {
  showNotification.value = true
  setTimeout(() => {
    showNotification.value = false
  }, 2000)
}

// Initialize app data
const initApp = (): void => {
  const urlParams = new URLSearchParams(window.location.search)
  token.value = urlParams.get('token') || ''
  fetchRecords()
}

// Call init function when component is mounted
initApp()
</script>

<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6"
  >
    <div class="w-full max-w-6xl mx-auto">
      <div class="flex justify-center mb-6">
        <LogoHeader />
      </div>

      <div class="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div class="px-8 py-8">
          <!-- DNS Records Table Component -->
          <DnsTable
            :records="records"
            :verification-status="verificationStatus"
            @copy-success="showCopyNotification"
          />
        </div>
      </div>

      <div class="flex items-center justify-center gap-3 mt-6">
        <div class="text-center">
          <p class="text-sm text-gray-600">Check if DNS records are properly configured</p>
          <p class="text-xs text-gray-500">Verifies against Cloudflare DNS</p>
        </div>
        <button
          @click="fetchRecords"
          :disabled="loading"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg shadow-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            v-if="loading"
            class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
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
          <svg
            v-else
            class="-ml-1 mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {{ loading ? 'Checking...' : 'Refresh' }}
        </button>
      </div>
    </div>

    <!-- Notification Component -->
    <NotificationMessage :show="showNotification" message="Copied to clipboard!" />
  </div>
</template>
