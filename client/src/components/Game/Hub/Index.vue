<script setup lang="ts">
import Buildings from "@/components/Game/Hub/Buildings.vue";
interface Props {
  ws: WebSocket;
  state: any;
}
const props = defineProps<Props>();
</script>
<template>
  <div id="game-hub" class="mb-4">
    <p class="text-xl text-gray-600">Hub</p>
    <Buildings :ws="ws" :state="state"></Buildings>
  </div>
</template>
