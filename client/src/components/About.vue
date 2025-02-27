<script setup lang="ts">

interface Props {
  msg?: string;
}
const props = defineProps<Props>();
const message = props.msg || "About";
</script>

<template>
  <div class="about">
    <h1>{{message}}</h1>
    <hr />
  </div>
</template>
