<script setup>
import { ref, onMounted } from "vue";

const newRecord = ref({ client: "", type: "", host: "", data: "" });
const clientName = ref("");
const generatedToken = ref("");
const authenticationData = ref([]);
const isLoading = ref(false);

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

const fetchAuthenticationData = async () => {
  isLoading.value = true;

  try {
    const res = await fetch("/api/authentication");
    const data = await res.json();

    authenticationData.value = (data || []).map(entry => ({
      ...entry,
      enabled: Boolean(entry.enabled)
    }));
  } catch (error) {
    authenticationData.value = [];
  } finally {
    isLoading.value = false;
  }
};

const saveAuthenticationData = async () => {
  try {
    await fetch("/api/authentication", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(authenticationData.value),
    });
  } catch (error) {
    console.error("Error saving authentication data:", error);
  }
};

const addNewAuthEntry = () => {
  authenticationData.value.push({
    hostname: "",
    uri: "",
    username: "",
    password: "",
    theme: "",
    enabled: 1
  });
};

const removeAuthEntry = (index) => {
  authenticationData.value.splice(index, 1);
};

onMounted(() => {
  fetchAuthenticationData();
});

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

    <div class="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
      <div class="px-4 sm:px-0">
        <h2 class="text-base/7 font-semibold text-gray-900">Authentication</h2>
        <p class="mt-1 text-sm/6 text-gray-600">Manage authentication credentials for different hostnames</p>
      </div>

      <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div class="px-4 py-6 sm:p-8">
          <div v-if="isLoading" class="text-center py-4">
            <p class="text-sm text-gray-600">Loading authentication data...</p>
          </div>
          
          <div v-else>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Hostname</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">URI</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Username</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Password</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Theme</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Enabled</th>
                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-0">
                      <span class="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="(entry, index) in authenticationData" :key="index">
                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-0">
                      <input 
                        v-model="entry.hostname" 
                        type="text" 
                        class="block w-full rounded-md bg-white px-3 py-1.5 text-sm text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                        placeholder="roam.client.com.au"
                      />
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm">
                      <input 
                        v-model="entry.uri" 
                        type="text" 
                        class="block w-full rounded-md bg-white px-3 py-1.5 text-sm text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                      />
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm">
                      <input 
                        v-model="entry.username" 
                        type="text" 
                        class="block w-full rounded-md bg-white px-3 py-1.5 text-sm text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                        placeholder="username"
                      />
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm">
                      <input 
                        v-model="entry.password" 
                        type="password" 
                        class="block w-full rounded-md bg-white px-3 py-1.5 text-sm text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                        placeholder="password"
                      />
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm">
                      <input 
                        v-model="entry.theme"
                        type="text"
                        class="block w-full rounded-md bg-white px-3 py-1.5 text-sm text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                        placeholder="roam"
                      />
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm">
                      <input 
                        v-model="entry.enabled"
                        type="checkbox" 
                        class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </td>
                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <button 
                        @click="removeAuthEntry(index)"
                        class="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="mt-4">
              <button 
                @click="addNewAuthEntry"
                class="rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
              >
                Add New Entry
              </button>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
          <button 
            class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" 
            @click="saveAuthenticationData"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
</template>