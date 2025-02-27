<script setup lang="ts">
import {useUser} from "@/composable/useUser.ts";

const { user, token } = useUser();
</script>
<template>
  <div id="game-header" class="text-4xl font-bold text-gray-800">
    <h1>Welcome, <span class="text-blue-600">{{ user?.name || "User" }}!</span></h1>
    <hr class="my-4 border-gray-300">
  </div>
</template>
