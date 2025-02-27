<script setup lang="ts">
import About from "@/components/About.vue";
import Game from "@/components/Game.vue";
import {useUser} from "@/composable/useUser.ts";

const { user } = useUser(); // Access the user store via the composable

</script>

<template>
  <div class="home bg-white shadow-md rounded-lg p-6">
    <Game v-if="user">
    </Game>
    <About v-else>
    </About>
  </div>
</template>
