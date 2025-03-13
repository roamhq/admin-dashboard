<script setup>
import { ref, defineEmits } from "vue";

const emit = defineEmits(["recordAdded", "tokenGenerated"]);

const newRecord = ref({ client: "", type: "", host: "", data: "" });
const clientName = ref("");
const generatedToken = ref("");

const addRecord = () => {
  if (newRecord.value.client && newRecord.value.type && newRecord.value.host && newRecord.value.data) {
    emit("recordAdded", { ...newRecord.value });
    // Reset form
    newRecord.value = { client: "", type: "", host: "", data: "" };
  }
};

const generateClientToken = async () => {
  if (clientName.value.trim()) {
    const token = await emit("tokenGenerated", clientName.value);
    generatedToken.value = token;
  }
};
</script>

<template>
  <div>
    <!-- Add Record Form -->
    <div class="mt-6">
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
</template>