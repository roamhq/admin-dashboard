<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { API_CONFIG } from '@/config/api'
import type { Client, ClientForm } from '@/types'

const clients = ref<Client[]>([])
const isLoading = ref<boolean>(false)
const isSaving = ref<boolean>(false)
const isDeleting = ref<boolean>(false)
const showAddForm = ref<boolean>(false)
const editingClient = ref<Client | null>(null)
const notification = ref<{ message: string; type: 'success' | 'error' } | null>(null)

const newClient = ref<ClientForm>({
  name: '',
  origin: '',
  hostname: '',
  enabled: true,
})

const fetchClients = async (): Promise<void> => {
  isLoading.value = true

  try {
    const res = await fetch(API_CONFIG.buildUrl('/api/clients'))
    const data = await res.json()

    if (data.success) {
      clients.value = data.data || []
    } else {
      showNotification('Failed to fetch clients', 'error')
    }
  } catch (error) {
    console.error('Error fetching clients:', error)
    showNotification('Failed to fetch clients', 'error')
  } finally {
    isLoading.value = false
  }
}

const saveClient = async (): Promise<void> => {
  if (!newClient.value.name || !newClient.value.origin || !newClient.value.hostname) {
    showNotification('Please fill in all required fields', 'error')
    return
  }

  isSaving.value = true

  try {
    const url = editingClient.value
      ? API_CONFIG.buildUrl('/api/clients')
      : API_CONFIG.buildUrl('/api/clients')

    const method = editingClient.value ? 'PUT' : 'POST'
    const body = editingClient.value
      ? { ...newClient.value, id: editingClient.value.id }
      : newClient.value

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (data.success) {
      showNotification(
        editingClient.value ? 'Client updated successfully' : 'Client created successfully',
        'success',
      )
      await fetchClients()
      resetForm()
    } else {
      showNotification(data.error || 'Failed to save client', 'error')
    }
  } catch (error) {
    console.error('Error saving client:', error)
    showNotification('Failed to save client', 'error')
  } finally {
    isSaving.value = false
  }
}

const deleteClient = async (id: number): Promise<void> => {
  if (!confirm('Are you sure you want to delete this client?')) {
    return
  }

  isDeleting.value = true

  try {
    const res = await fetch(API_CONFIG.buildUrl(`/api/clients?id=${id}`), {
      method: 'DELETE',
    })

    const data = await res.json()

    if (data.success) {
      showNotification('Client deleted successfully', 'success')
      await fetchClients()
    } else {
      showNotification(data.error || 'Failed to delete client', 'error')
    }
  } catch (error) {
    console.error('Error deleting client:', error)
    showNotification('Failed to delete client', 'error')
  } finally {
    isDeleting.value = false
  }
}

const editClient = (client: Client): void => {
  editingClient.value = client
  newClient.value = {
    name: client.name,
    origin: client.origin,
    hostname: client.hostname,
    enabled: client.enabled,
  }
  showAddForm.value = true
}

const resetForm = (): void => {
  newClient.value = {
    name: '',
    origin: '',
    hostname: '',
    enabled: true,
  }
  editingClient.value = null
  showAddForm.value = false
}

const showNotification = (message: string, type: 'success' | 'error'): void => {
  notification.value = { message, type }
  setTimeout(() => {
    notification.value = null
  }, 5000)
}

onMounted(() => {
  fetchClients()
})
</script>

<template>
  <div class="overflow-hidden">
    <div class="px-6 py-6 sm:px-8">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg
              class="h-6 w-6 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div class="ml-3">
            <h2 class="text-lg font-semibold text-gray-900">Client Management</h2>
            <p class="text-sm text-gray-600">Manage clients and their configurations</p>
          </div>
        </div>
        <button
          @click="showAddForm = true"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm"
        >
          <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add Client
        </button>
      </div>

      <!-- Notification -->
      <div
        v-if="notification"
        :class="[
          'mb-6 p-4 rounded-lg border',
          notification.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800',
        ]"
      >
        {{ notification.message }}
      </div>

      <!-- Add/Edit Form -->
      <div v-if="showAddForm" class="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {{ editingClient ? 'Edit Client' : 'Add New Client' }}
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="clientName" class="block text-sm font-medium text-gray-700 mb-2">
              Client Name
            </label>
            <input
              v-model="newClient.name"
              type="text"
              id="clientName"
              placeholder="melbournenow"
              class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label for="clientOrigin" class="block text-sm font-medium text-gray-700 mb-2">
              Origin URL
            </label>
            <input
              v-model="newClient.origin"
              type="url"
              id="clientOrigin"
              placeholder="https://melbournenow.roamhq.com"
              class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label for="clientHostname" class="block text-sm font-medium text-gray-700 mb-2">
              Hostname
            </label>
            <input
              v-model="newClient.hostname"
              type="text"
              id="clientHostname"
              placeholder="melbournenow.com.au"
              class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div class="flex items-center">
            <input
              v-model="newClient.enabled"
              type="checkbox"
              id="clientEnabled"
              class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label for="clientEnabled" class="ml-2 block text-sm text-gray-900"> Enabled </label>
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button
            @click="resetForm"
            class="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            @click="saveClient"
            :disabled="isSaving"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          >
            <svg
              v-if="isSaving"
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
            {{ isSaving ? 'Saving...' : editingClient ? 'Update Client' : 'Add Client' }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
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
        <p class="text-sm text-gray-600">Loading clients...</p>
      </div>

      <!-- Clients Table -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                scope="col"
                class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ID
              </th>
              <th
                scope="col"
                class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Origin
              </th>
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
                Status
              </th>
              <th scope="col" class="relative px-3 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="client in clients" :key="client.id" class="hover:bg-gray-50">
              <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                {{ client.id }}
              </td>
              <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ client.name }}
              </td>
              <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                <span class="truncate max-w-xs block" :title="client.origin">
                  {{ client.origin }}
                </span>
              </td>
              <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                <span class="truncate max-w-xs block" :title="client.hostname">
                  {{ client.hostname }}
                </span>
              </td>
              <td class="px-3 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                    client.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
                  ]"
                >
                  {{ client.enabled ? 'Enabled' : 'Disabled' }}
                </span>
              </td>
              <td class="px-3 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button
                  @click="editClient(client)"
                  class="text-indigo-600 hover:text-indigo-900 transition-colors"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  @click="deleteClient(client.id!)"
                  :disabled="isDeleting"
                  class="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
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

        <!-- Empty State -->
        <div v-if="clients.length === 0" class="text-center py-8">
          <svg
            class="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No clients</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by adding a new client.</p>
        </div>
      </div>
    </div>
  </div>
</template>
