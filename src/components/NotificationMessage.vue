<script setup>
import { defineProps } from 'vue'

defineProps({
  show: Boolean,
  message: String,
})
</script>

<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed bottom-5 right-5 bg-red-400 text-white px-4 py-2 rounded-lg shadow-lg"
    >
      {{ message }}
    </div>
  </transition>
</template>

<style scoped>
/* Fade-in/out animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
