<script setup>
import { ref, onMounted, computed } from "vue";

const records = ref([]);
const newRecord = ref({ client: "", type: "", host: "", data: "" });
const clientName = ref("");
const generatedToken = ref("");
const token = ref("");
const showNotification = ref(false);
const verificationStatus = ref({});
const loading = ref(false);

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

const addRecord = async () => {
    await fetch("/api/dns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord.value),
    });
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

const copyToClipboard = async (text, event) => {
    try {
        await navigator.clipboard.writeText(text);

        // Show notification
        showNotification.value = true;
        setTimeout(() => {
            showNotification.value = false;
        }, 2000);

        // Button animation
        const button = event.target;
        button.classList.add("scale-90");
        setTimeout(() => button.classList.remove("scale-90"), 150);
    } catch (error) {
        console.error("Failed to copy:", error);
    }
};

const isAdmin = computed(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("roam-admin") === "1";
});

const generateClientToken = async () => {
    if (clientName.value.trim()) {
        const res = await fetch("/api/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clientName: clientName.value }),
        });
        const data = await res.json();
        generatedToken.value = data.token || "Error generating token";
    }
};

onMounted(() => {
    const urlParams = new URLSearchParams(window.location.search);
    token.value = urlParams.get("token") || "";

    fetchRecords();
});
</script>

<template>
    <div class="min-h-screen flex flex-col items-center bg-gray-100 p-6">
        <div class="bg-white p-6 rounded-xl shadow-lg">
            <div class="px-4 sm:px-6 lg:px-8">
                <!-- Logo -->
                <div class="flex justify-center mb-4">
                    <img src="@/assets/logo.svg" alt="Logo" class="h-12 w-auto">
                </div>

                <div class="sm:flex sm:items-center">
                    <div class="sm:flex-auto">
                        <h1 class="text-2xl font-semibold mb-6 mt-9 text-gray-900">DNS Setup</h1>
                        <p class="text-l mt-2 mb-6 text-sm text-gray-700">
                            Add all of these records to your DNS host to connect your domain with Roam.
                        </p>
                    </div>
                </div>

                <button
                    @click="fetchRecords"
                    :disabled="loading"
                    class="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50"
                >
                    {{ loading ? "Checking..." : "Refresh" }}
                </button>

                <div v-if="!isAdmin" class="mt-8 flow-root">
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
            </div>

            <!-- Add Record Form -->
            <div v-if="isAdmin" class="mt-6">
                <h2 class="text-xl font-semibold mb-2">Add DNS Record</h2>
                <div class="flex space-x-2">
                    <input v-model="newRecord.client" placeholder="Client" class="border p-2 w-1/5" />
                    <input v-model="newRecord.type" placeholder="Type (CNAME, TXT)" class="border p-2 w-1/5" />
                    <input v-model="newRecord.host" placeholder="Host" class="border p-2 w-2/5" />
                    <input v-model="newRecord.data" placeholder="Data" class="border p-2 w-2/5" />
                    <button class="bg-green-500 text-white px-4 py-2 rounded" @click="addRecord">
                        Add
                    </button>
                </div>

                <div class="mt-6">
                    <h2 class="text-xl font-semibold mb-2">Generate Client Token</h2>
                    <div class="flex space-x-2">
                        <input v-model="clientName" placeholder="Client Name" class="border p-2 w-3/5" />
                        <button class="bg-purple-500 text-white px-4 py-2 rounded" @click="generateClientToken">
                            Generate Token
                        </button>
                    </div>
                    <p v-if="generatedToken" class="mt-2 text-green-600">Token: {{ generatedToken }}</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Notification -->
    <transition name="fade">
        <div v-if="showNotification" class="fixed bottom-5 right-5 bg-red-400 text-white px-4 py-2 rounded-lg shadow-lg">
            Copied to clipboard!
        </div>
    </transition>
</template>

<style>
/* Fade-in/out animation */
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s ease-in-out;
}
.fade-enter, .fade-leave-to {
    opacity: 0;
}
</style>
