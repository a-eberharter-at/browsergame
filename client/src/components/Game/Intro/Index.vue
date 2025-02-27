<script setup lang="ts">
import Fight from "@/components/Game/Action/Fight.vue";
interface Props {
  ws: WebSocket;
  state: any;
}
const props = defineProps<Props>();
</script>
<template>
  <div id="game-intro" class="mb-4">
    Some mindless Intro Text
    <hr class="my-4 border-gray-300"/>
    <Fight :ws="ws" type="intro">Intro Fight</Fight>
  </div>
</template>
