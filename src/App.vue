<!-- Main App.vue -->
<script setup>
import { ref } from "vue";
import DnsHeader from "./components/DnsHeader.vue";
import DnsTable from "./components/DnsTable.vue";
import AdminPanel from "./components/AdminPanel.vue";
import Notification from "./components/Notification.vue";

const records = ref([]);
const token = ref("");
const verificationStatus = ref({});
const loading = ref(false);
const showNotification = ref(false);

const isAdmin = ref(false);

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

const addRecord = async (recordData) => {
  await fetch("/api/dns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recordData),
  });
  await fetchRecords();
};

const generateClientToken = async (clientName) => {
  if (clientName.trim()) {
    const res = await fetch("/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientName }),
    });
    const data = await res.json();
    return data.token || "Error generating token";
  }
  return "";
};

const showCopyNotification = () => {
  showNotification.value = true;
  setTimeout(() => {
    showNotification.value = false;
  }, 2000);
};

// Check if user is admin based on URL parameter
const checkAdminStatus = () => {
  const urlParams = new URLSearchParams(window.location.search);
  isAdmin.value = urlParams.get("roam-admin") === "1";
  token.value = urlParams.get("token") || "";
};

// Initialize app data
const initApp = () => {
  checkAdminStatus();
  fetchRecords();
};

// Call init function when component is mounted
initApp();
</script>

<template>
  <div class="min-h-screen flex flex-col items-center bg-gray-100 p-6">
    <div class="bg-white p-6 rounded-xl shadow-lg">
      <div class="px-4 sm:px-6 lg:px-8">
        <!-- Header Component -->
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
          v-if="!isAdmin"
          :records="records"
          :verification-status="verificationStatus"
          @copy-success="showCopyNotification"
        />

        <!-- Admin Panel Component -->
        <AdminPanel
          v-if="isAdmin"
          @record-added="addRecord"
          @token-generated="generateClientToken"
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