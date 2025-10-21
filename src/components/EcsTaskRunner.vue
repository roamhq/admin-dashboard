<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { API_CONFIG } from '@/config/api'
import type { EcsClientGroup, EcsTaskResponse, EcsTask } from '@/types'

const clientGroups = ref<EcsClientGroup[]>([])
const selectedTasks = ref<Set<string>>(new Set())
const selectedClient = ref<string | null>(null)
const isRunningTask = ref<boolean>(false)
const isLoadingTasks = ref<boolean>(false)
const lastTaskResult = ref<EcsTaskResponse | null>(null)
const showResult = ref<boolean>(false)

const fetchClientGroups = async (): Promise<void> => {
  isLoadingTasks.value = true

  try {
    const res = await fetch(API_CONFIG.buildUrl('/api/ecs'))
    const data: EcsClientGroup[] = await res.json()
    clientGroups.value = data || []

    // Pre-select first client if available
    if (clientGroups.value.length > 0) {
      selectedClient.value = clientGroups.value[0].client
    }
  } catch (error) {
    console.error('Error fetching client groups:', error)
    clientGroups.value = []
  } finally {
    isLoadingTasks.value = false
  }
}

const currentClientGroup = computed(() => {
  return clientGroups.value.find((group) => group.client === selectedClient.value)
})

const selectedTaskCount = computed(() => {
  return selectedTasks.value.size
})

const toggleTask = (taskDefinition: string): void => {
  if (selectedTasks.value.has(taskDefinition)) {
    selectedTasks.value.delete(taskDefinition)
  } else {
    selectedTasks.value.add(taskDefinition)
  }
  // Trigger reactivity
  selectedTasks.value = new Set(selectedTasks.value)
}

const selectAllTasks = (): void => {
  if (!currentClientGroup.value) return

  const allSelected = currentClientGroup.value.tasks.every((task) =>
    selectedTasks.value.has(task.taskDefinition),
  )

  if (allSelected) {
    // Deselect all
    currentClientGroup.value.tasks.forEach((task) => {
      selectedTasks.value.delete(task.taskDefinition)
    })
  } else {
    // Select all
    currentClientGroup.value.tasks.forEach((task) => {
      selectedTasks.value.add(task.taskDefinition)
    })
  }

  selectedTasks.value = new Set(selectedTasks.value)
}

const isAllSelected = computed(() => {
  if (!currentClientGroup.value) return false
  return currentClientGroup.value.tasks.every((task) =>
    selectedTasks.value.has(task.taskDefinition),
  )
})

const isSomeSelected = computed(() => {
  if (!currentClientGroup.value) return false
  return (
    currentClientGroup.value.tasks.some((task) => selectedTasks.value.has(task.taskDefinition)) &&
    !isAllSelected.value
  )
})

const runTasks = async (): Promise<void> => {
  if (!currentClientGroup.value || selectedTasks.value.size === 0 || isRunningTask.value) {
    return
  }

  isRunningTask.value = true
  lastTaskResult.value = null
  showResult.value = false

  try {
    const tasksToRun = Array.from(selectedTasks.value)

    const res = await fetch(API_CONFIG.buildUrl('/api/ecs'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tasks: tasksToRun,
        cluster: currentClientGroup.value.cluster,
        region: currentClientGroup.value.region,
        subnets: currentClientGroup.value.subnets,
        securityGroups: currentClientGroup.value.securityGroups,
        assignPublicIp: currentClientGroup.value.assignPublicIp,
      }),
    })

    const data: EcsTaskResponse = await res.json()
    lastTaskResult.value = data
    showResult.value = true

    // Auto-hide success message after 10 seconds
    if (data.success) {
      setTimeout(() => {
        showResult.value = false
      }, 10000)
    }

    // Clear selections on success
    if (data.success && !data.partial) {
      selectedTasks.value.clear()
    }
  } catch (error) {
    console.error('Error running ECS tasks:', error)
    lastTaskResult.value = {
      success: false,
      error: 'Network error occurred',
    }
    showResult.value = true
  } finally {
    isRunningTask.value = false
  }
}

const selectClient = (clientName: string): void => {
  selectedClient.value = clientName
  selectedTasks.value.clear()
}

onMounted(() => {
  fetchClientGroups()
})
</script>

<template>
  <div class="overflow-hidden">
    <div class="px-6 py-6 sm:px-8">
      <div class="flex items-center mb-6">
        <div class="flex-shrink-0">
          <svg
            class="h-6 w-6 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
            />
          </svg>
        </div>
        <div class="ml-3">
          <h2 class="text-lg font-semibold text-gray-900">ECS Task Runner</h2>
          <p class="text-sm text-gray-600">Trigger AWS ECS tasks by client</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoadingTasks" class="text-center py-8">
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
        <p class="text-sm text-gray-600">Loading clients and tasks...</p>
      </div>

      <!-- Content -->
      <div v-else class="space-y-6">
        <!-- Client Selector -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">Select Client</label>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            <button
              v-for="group in clientGroups"
              :key="group.client"
              @click="selectClient(group.client)"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                selectedClient === group.client
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
              ]"
            >
              {{ group.displayName }}
            </button>
          </div>
        </div>

        <!-- Tasks List -->
        <div v-if="currentClientGroup" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900">
              Tasks for {{ currentClientGroup.displayName }}
            </h3>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-600">
                {{ selectedTaskCount }} of {{ currentClientGroup.tasks.length }} selected
              </span>
              <button
                @click="selectAllTasks"
                class="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
              >
                {{ isAllSelected ? 'Deselect All' : 'Select All' }}
              </button>
            </div>
          </div>

          <div class="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200">
            <label
              v-for="task in currentClientGroup.tasks"
              :key="task.taskDefinition"
              class="flex items-center px-4 py-3 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <input
                type="checkbox"
                :checked="selectedTasks.has(task.taskDefinition)"
                @change="toggleTask(task.taskDefinition)"
                class="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
              />
              <span class="ml-3 text-sm text-gray-900">{{ task.name }}</span>
              <span class="ml-auto text-xs text-gray-500 font-mono">{{ task.taskDefinition }}</span>
            </label>
          </div>
        </div>

        <!-- Result Message -->
        <div
          v-if="showResult && lastTaskResult"
          :class="[
            'rounded-lg p-4 border',
            lastTaskResult.success && !lastTaskResult.partial
              ? 'bg-green-50 border-green-200'
              : lastTaskResult.partial
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-red-50 border-red-200',
          ]"
        >
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg
                v-if="lastTaskResult.success && !lastTaskResult.partial"
                class="h-5 w-5 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              <svg
                v-else-if="lastTaskResult.partial"
                class="h-5 w-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              <svg v-else class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3 flex-1">
              <h3
                :class="[
                  'text-sm font-medium',
                  lastTaskResult.success && !lastTaskResult.partial
                    ? 'text-green-800'
                    : lastTaskResult.partial
                      ? 'text-yellow-800'
                      : 'text-red-800',
                ]"
              >
                {{ lastTaskResult.message }}
              </h3>
              <div
                v-if="lastTaskResult.results"
                :class="[
                  'mt-2 text-xs space-y-2',
                  lastTaskResult.success && !lastTaskResult.partial
                    ? 'text-green-700'
                    : lastTaskResult.partial
                      ? 'text-yellow-700'
                      : 'text-red-700',
                ]"
              >
                <div v-if="lastTaskResult.results.successful.length > 0">
                  <p class="font-semibold mb-1">Successful tasks:</p>
                  <ul class="space-y-1 ml-4">
                    <li
                      v-for="result in lastTaskResult.results.successful"
                      :key="result.taskArn"
                      class="break-all"
                    >
                      ✓ {{ result.taskDefinition }}
                    </li>
                  </ul>
                </div>
                <div v-if="lastTaskResult.results.failed.length > 0">
                  <p class="font-semibold mb-1">Failed tasks:</p>
                  <ul class="space-y-1 ml-4">
                    <li
                      v-for="result in lastTaskResult.results.failed"
                      :key="result.taskDefinition"
                      class="break-all"
                    >
                      ✗ {{ result.taskDefinition }}: {{ result.error }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <button
              @click="showResult = false"
              :class="[
                'flex-shrink-0 ml-4',
                lastTaskResult.success && !lastTaskResult.partial
                  ? 'text-green-500 hover:text-green-600'
                  : lastTaskResult.partial
                    ? 'text-yellow-500 hover:text-yellow-600'
                    : 'text-red-500 hover:text-red-600',
              ]"
            >
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Run Task Button -->
        <div class="flex justify-between items-center">
          <p class="text-sm text-gray-600">
            <span class="font-medium">Cluster:</span> {{ currentClientGroup?.cluster }} •
            <span class="font-medium">Region:</span> {{ currentClientGroup?.region }}
          </p>
          <button
            @click="runTasks"
            :disabled="isRunningTask || selectedTaskCount === 0"
            class="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          >
            <svg
              v-if="isRunningTask"
              class="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
              class="-ml-1 mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{
              isRunningTask
                ? `Running ${selectedTaskCount} task(s)...`
                : `Run ${selectedTaskCount} Selected Task(s)`
            }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
