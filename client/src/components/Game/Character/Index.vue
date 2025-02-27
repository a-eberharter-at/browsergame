<script setup lang="ts">
import Stats from "@/components/Game/Character/Stats.vue";
interface Props {
  ws: WebSocket;
  character: any;
}
const props = defineProps<Props>();
</script>
<template>
  <div id="game-hub" class="mb-4">
    <p class="text-xl text-gray-600">Character (Level: {{character.level}} ; EXP: {{character.experience}}/{{character.exp_required}})</p>
    <Stats :ws="ws" :character="character"></Stats>
  </div>
</template>
