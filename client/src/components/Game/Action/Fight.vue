<script setup lang="ts">
import {useUser} from "@/composable/useUser.ts";

const { user, token } = useUser();
interface Props {
  type: string,
  ws: WebSocket;
}
const props = defineProps<Props>();

const fight = () => {
  if (!props.ws) return;
  props.ws.send(JSON.stringify({ payload: {action:"fight", type: props.type}, user: user.value, token:token.value }));
};
</script>
<template>
  <div id="game-fight" class="mb-4">
    <button
      class="rounded bg-blue-500 me-3 mt-3 px-3 py-1 text-white hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
      @click="fight">
      <slot></slot>
    </button>
  </div>
</template>
