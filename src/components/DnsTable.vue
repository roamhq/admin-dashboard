<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { DnsRecord } from '@/types'

interface VerificationStatus {
  [key: string]: boolean
}

interface Props {
  records: DnsRecord[]
  verificationStatus: VerificationStatus
}

defineProps<Props>()

const emit = defineEmits<{
  copySuccess: []
}>()

const copyToClipboard = async (text: string, event: Event): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text)

    // Emit event to parent for notification
    emit('copySuccess')

    // Button animation
    const button = event.target as HTMLElement
    button.classList.add('scale-90')
    setTimeout(() => button.classList.remove('scale-90'), 150)
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}
</script>

<template>
  <div>
    <div class="flex items-center mb-6">
      <div class="flex-shrink-0">
        <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div class="ml-3">
        <h2 class="text-lg font-semibold text-gray-900">DNS Records</h2>
        <p class="text-sm text-gray-600">
          Add these records to your DNS host to connect your domain with Roam.
        </p>
      </div>
    </div>

    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="px-4 py-6 sm:px-6 lg:px-8">
        <table class="mt-6 w-full whitespace-nowrap text-left">
          <colgroup>
            <col class="w-2/12" />
            <col class="w-3/12" />
            <col class="w-4/12" />
            <col class="w-1/12" />
            <col class="w-2/12" />
          </colgroup>
          <thead class="border-b border-gray-200 text-sm/6 text-gray-500">
            <tr>
              <th scope="col" class="py-3 pl-0 pr-8 font-semibold">Type</th>
              <th scope="col" class="py-3 pl-0 pr-8 font-semibold">Host</th>
              <th scope="col" class="py-3 pl-0 pr-8 font-semibold">Data</th>
              <th scope="col" class="py-3 pl-0 pr-8 font-semibold">Status</th>
              <th scope="col" class="py-3 pl-0 pr-0 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="record in records"
              :key="record.host"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="py-4 pl-0 pr-8">
                <div class="flex items-center">
                  <div
                    class="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                  >
                    {{ record.type }}
                  </div>
                </div>
              </td>
              <td class="py-4 pl-0 pr-8">
                <div class="truncate text-sm/6 font-medium text-gray-900">{{ record.host }}</div>
              </td>
              <td class="py-4 pl-0 pr-8">
                <div class="flex items-center gap-x-3">
                  <div class="font-mono text-sm/6 text-gray-600 mx-auto">
                    {{ record.data }}
                  </div>
                </div>
              </td>
              <td class="py-4 pl-0 pr-8">
                <div class="flex items-center gap-x-2">
                  <div
                    v-if="verificationStatus[record.host]"
                    class="flex-none rounded-full bg-green-400/10 p-1 text-green-400"
                  >
                    <div class="size-1.5 rounded-full bg-current"></div>
                  </div>
                  <div v-else class="flex-none rounded-full bg-red-400/10 p-1 text-red-400">
                    <div class="size-1.5 rounded-full bg-current"></div>
                  </div>
                  <div class="hidden text-sm/6 text-gray-900 sm:block">
                    {{ verificationStatus[record.host] ? 'Verified' : 'Pending' }}
                  </div>
                </div>
              </td>
              <td class="py-4 pl-0 pr-0">
                <button
                  class="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150 shadow-sm active:scale-95"
                  @click="copyToClipboard(record.data, $event)"
                >
                  <svg class="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 16h8M8 12h8m-6 8h6a2 2 0 002-2V6a2 2 0 00-2-2H8a2 2 0 00-2 2v2"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
