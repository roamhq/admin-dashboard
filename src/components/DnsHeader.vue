<script setup>
    import LogoHeader from "./LogoHeader.vue";
</script>

<template>
  <div>
    <LogoHeader />

    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold mb-6 mt-9 text-gray-900">DNS Setup</h1>
        <p class="text-l mt-2 mb-6 text-sm text-gray-700">
          Add all of these records to your DNS host to connect your domain with Roam.
        </p>
      </div>
    </div>
  </div>
</template>