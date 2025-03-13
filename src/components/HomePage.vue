<!-- Main App.vue -->
<script setup>
import { ref, computed } from "vue";
import DnsHeader from "./DnsHeader.vue";
import DnsTable from "./DnsTable.vue";
import Notification from "./Notification.vue";

const records = ref([]);
const token = ref("");
const verificationStatus = ref({});
const loading = ref(false);
const showNotification = ref(false);

const fetchRecords = async () => {
  loading.value = true;
  const query = token.value ? `?token=${encodeURIComponent(token.value)}` : "";
  const res = await fetch(`/api/dns${query}`);

  if (!res.ok) {
    records.value = [];
  } else {
    records.value = await res.json();
  }

  await verifyRecords();
  loading.value = false;
};

const verifyRecords = async () => {
  for (const record of records.value) {
    const queryUrl = `https://cloudflare-dns.com/dns-query?name=${record.host}&type=${record.type}`;
    const res = await fetch(queryUrl, {
      headers: { Accept: "application/dns-json" },
    });
    const data = await res.json();
    const matched = data.Answer?.some((ans) => ans.data === record.data);
    verificationStatus.value[record.host] = matched;
  }
};

const showCopyNotification = () => {
  showNotification.value = true;
  setTimeout(() => {
    showNotification.value = false;
  }, 2000);
};

// Initialize app data
const initApp = () => {
  const urlParams = new URLSearchParams(window.location.search);
  token.value = urlParams.get("token") || "";
  fetchRecords();
};

// Call init function when component is mounted
initApp();
</script>

<template>
  <div class="min-h-screen flex flex-col items-center bg-gray-100 p-6">
    <div class="bg-white p-6 rounded-xl shadow-lg">
      <div class="px-4 sm:px-6 lg:px-8">
        <DnsHeader />

        <button
          @click="fetchRecords"
          :disabled="loading"
          class="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50"
        >
          {{ loading ? "Checking..." : "Refresh" }}
        </button>

        <!-- DNS Records Table Component -->
        <DnsTable
          :records="records"
          :verification-status="verificationStatus"
          @copy-success="showCopyNotification"
        />
      </div>
    </div>

    <!-- Notification Component -->
    <Notification
      :show="showNotification"
      message="Copied to clipboard!"
    />
  </div>
</template>