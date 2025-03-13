<script setup>
import { ref } from "vue";

const newRecord = ref({ client: "", type: "", host: "", data: "" });
const clientName = ref("");
const generatedToken = ref("");

const addRecord = async () => {
  if (newRecord.value.client && newRecord.value.type && newRecord.value.host && newRecord.value.data) {
    await fetch("/api/dns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRecord.value),
    });

    // Reset form
    newRecord.value = { client: "", type: "", host: "", data: "" };
  }
};

const generateClientToken = async () => {
  if (clientName.value.trim()) {
    const res = await fetch("/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientName: clientName.value })
    });

    const data = await res.json();

    generatedToken.value = data.token || "sss";
  }
};

</script>

<template>
    <div class="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
      <div class="px-4 sm:px-0">
        <h2 class="text-base/7 font-semibold text-gray-900">DNS Record</h2>
        <p class="mt-1 text-sm/6 text-gray-600">Create new DNS records</p>
      </div>

      <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div class="px-4 py-6 sm:p-8">
          <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-8">
            <div class="sm:col-span-2">
              <label for="client" class="block text-sm/6 font-medium text-gray-900">Client</label>
              <div class="mt-2">
                <input v-model="newRecord.client" placeholder="roamhq" type="text" name="client" id="client" autocomplete="given-name" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
              </div>
            </div>

            <div class="sm:col-span-2">
              <label for="type" class="block text-sm/6 font-medium text-gray-900">Type (CNAME, TXT)</label>
              <div class="mt-2">
                <input v-model="newRecord.type" type="text" name="type" id="type" autocomplete="given-name" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
              </div>
            </div>

            <div class="sm:col-span-2">
              <label for="host" class="block text-sm/6 font-medium text-gray-900">Host</label>
              <div class="mt-2">
                <input v-model="newRecord.host" type="text" name="host" id="host" autocomplete="given-name" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
              </div>
            </div>

            <div class="sm:col-span-2">
              <label for="data" class="block text-sm/6 font-medium text-gray-900">Data</label>
              <div class="mt-2">
                <input v-model="newRecord.data" type="text" name="data" id="data" autocomplete="given-name" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
              </div>
            </div>
        </div>
        </div>
        <div class="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
          <button class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" @click="addRecord">Add</button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
      <div class="px-4 sm:px-0">
        <h2 class="text-base/7 font-semibold text-gray-900">Generate Client Token</h2>
        <p class="mt-1 text-sm/6 text-gray-600">Token used to provide a unique URL to access DNS records</p>
      </div>

      <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div class="px-4 py-6 sm:p-8">
          <div class="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-4">
            <div class="sm:col-span-2">
              <label for="clientName" class="block text-sm/6 font-medium text-gray-900">Client</label>
              <div class="mt-2">
                <input v-model="clientName" placeholder="roamhq" type="text" name="client" id="clientName" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
              </div>
            </div>
            <div v-if="generatedToken" class="sm:col-span-2">
              <label for="token" class="block text-sm/6 font-medium text-gray-900">Token</label>
              <div class="mt-2">
                <input  placeholder="roamhq" type="text" v-model="generatedToken" name="client" id="token" class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
              </div>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
          <button class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" @click="generateClientToken">Generate</button>
        </div>
      </div>
    </div>
</template>