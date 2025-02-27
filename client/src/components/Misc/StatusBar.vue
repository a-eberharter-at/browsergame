<script setup lang="ts">
import {onMounted, ref, useTemplateRef} from 'vue';
interface Props {
  seconds: number;
}
const props = defineProps<Props>();
const seconds = props.seconds;
const root = useTemplateRef('root');

const resetStatusBar = () => {
  if(!root.value){return;}
  root.value.style.width = '100%'; // Fill the bar

  setTimeout(() => {
    if(!root.value){return;}
    root.value.style.transition = 'none';
    root.value.style.width = '0%';
    void root.value.offsetWidth; // Trigger reflow
    root.value.style.transition = 'width '+seconds+'s linear';
    resetStatusBar(); // Restart the bar
  }, seconds*1000);
}

onMounted(async () => {
  resetStatusBar();
})
</script>

<template>
  <div class="h-full flex items-center">
    <div class="status-bar-border border-blue-600 border flex items-center w-full">
      <div class="status-bar-filler bg-blue-600" ref="root">
        <div id="statusBar" class="status-bar"></div>
      </div>
    </div>
  </div>
</template>

<style>
  .status-bar-border {
    border-radius: 10px;
    overflow: hidden;
  }
  .status-bar-filler {
    position: relative;
    height: 10px;
    overflow: hidden;
  }

  .status-bar {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 0;
    transition: width 5s linear;
  }
</style>
