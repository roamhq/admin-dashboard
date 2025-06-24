<!-- views/AdminPage.vue -->
<script setup>
import { ref, onMounted } from "vue";
import AdminPanel from "../components/AdminPanel.vue";
import LogoHeader from "../components/LogoHeader.vue";

const authenticated = ref(false);
const username = ref("");
const password = ref("");
const authError = ref("");

const authenticate = async () => {
  try {
    authenticated.value = true;

    const response = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.value, password: password.value }),
    });

    if (response.ok) {
      authenticated.value = true;
      authError.value = "";
    } else {
      authError.value = "Invalid credentials";
    }
  } catch (error) {
    authError.value = "Authentication failed";
  }
};
</script>

<template>
  <div class="min-h-screen flex flex-col items-center bg-gray-100 p-6">
    <div class="bg-white p-6 rounded-xl shadow-lg">
      <div class="px-4 sm:px-6 lg:px-8">
        <div class="divide-y divide-gray-900/10">
          <LogoHeader />

          <div v-if="!authenticated" class="mt-8">
            <div class="space-y-4">
              <div>
                <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
                <input
                  id="username"
                  v-model="username"
                  type="text"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                <input
                  id="password"
                  v-model="password"
                  type="password"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div v-if="authError" class="text-red-500 text-sm">{{ authError }}</div>

              <button
                @click="authenticate"
                class="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Login
              </button>
            </div>
          </div>

          <AdminPanel
            v-if="authenticated"
          />
      </div>
    </div>
    </div>
  </div>
</template>