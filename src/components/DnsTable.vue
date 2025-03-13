<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  records: Array,
  verificationStatus: Object
});

const emit = defineEmits(["copySuccess"]);

const copyToClipboard = async (text, event) => {
  try {
    await navigator.clipboard.writeText(text);
    
    // Emit event to parent for notification
    emit("copySuccess");

    // Button animation
    const button = event.target;
    button.classList.add("scale-90");
    setTimeout(() => button.classList.remove("scale-90"), 150);
  } catch (error) {
    console.error("Failed to copy:", error);
  }
};
</script>

<template>
  <div class="mt-8 flow-root">
    <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
        <table class="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th scope="col" class="py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-0">
                Type
              </th>
              <th scope="col" class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                Host
              </th>
              <th scope="col" class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                Data
              </th>
              <th scope="col" class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                Status
              </th>
              <th scope="col" class="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="record in records" :key="record.id">
              <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                {{ record.type }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {{ record.host }}
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {{ record.data }}
              </td>
              <td class="px-3 py-4 text-sm">
                <span v-if="verificationStatus[record.host]" class="text-green-500">✅</span>
                <span v-else class="text-red-500">❌</span>
              </td>
              <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                <button
                  class="bg-red-400 text-white px-3 py-1 rounded transition-transform duration-150 active:scale-90"
                  @click="copyToClipboard(record.data, $event)"
                >
                  Copy
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>