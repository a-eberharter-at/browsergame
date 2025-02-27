<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import Auth from "@/components/Auth.vue";
</script>

<template>
  <header class="bg-blue-600 text-white py-4 shadow-lg">
    <nav class="container mx-auto flex justify-between items-center px-4">
      <ul class="flex space-x-4">
        <li>
            <RouterLink to="/">Home</RouterLink>
        </li>
      </ul>
      <Auth></Auth>
    </nav>
    <hr />
  </header>
  <RouterView />
</template>
