<script setup lang="ts">
import {useUser} from "@/composable/useUser.ts";
import {ref} from "vue";
import Character from "@/components/Game/Character/Index.vue";
import Hub from "@/components/Game/Hub/Index.vue";
import Intro from "@/components/Game/Intro/Index.vue";
import FightLog from "@/components/Game/Message/FightLog.vue";
import Fight from "@/components/Game/Action/Fight.vue";
import {useResourcesStore} from "@/stores/resources.ts";
import {useResources} from "@/composable/useResources.ts";
import StatusBar from "@/components/Misc/StatusBar.vue";

const { setEnergy, setEnergyMax, setScraps } = useResourcesStore();
const { user, token } = useUser();
const { energy, energyMax, scraps } = useResources();

//ToDo: Refactor into pinia
const ws = ref<WebSocket>(new WebSocket("ws://localhost:3000"));
let state = ref<any|null>(null);
let stateTimestamp = ref<number>(0);

ws.value.onmessage = (event) => {
  try {
    const message = JSON.parse(event.data);
    console.log("[Game Content] WebSocket Message:", message);
    if(message?.action === 'state'){
      if(stateTimestamp.value < message.timestamp){
        state.value = message.data;
        stateTimestamp.value = message.timestamp;
        console.log("[Game Content] State updated.");
      } else {
        console.log("[Game Content] Outdated State Message. Ignored.");
      }
    }
    if(message?.action === 'updateResources'){
      if(!counterActive){initCounter()}

      setEnergy(message.data.energy);
      setEnergyMax(message.data.energy_max);
      setScraps(message.data.scraps);
    }
  } catch (e) {
    console.error(e);
  }
};

ws.value.onopen = () => {
  console.log("[Game Content] WebSocket connection established");
  ws.value.send(JSON.stringify({ payload: {action:"init"}, user: user.value, token:token.value }));
};

ws.value.onclose = () => {
  console.log("[Game Content] WebSocket connection closed");
};
let counter:any|null = null;
const clearFightLog = () => {
  delete state.value?.oneTimeData.fight_log;
}

let counterActive = false;
const initCounter = () => {
  counterActive = true;
}

</script>
<template>
  <div id="game-content" class="bg-gray-50 p-6 rounded-lg shadow">
    <div v-if="!state">
      Missing "state" from backend.
    </div>
    <!--
    <div v-else-if="state?.oneTimeData.fight_log">
      <FightLog :fightLog="state?.oneTimeData.fight_log" v-on:clearFightLog="clearFightLog"></FightLog>
    </div>
    -->
    <div v-else-if="!state?.character.has_hub">
      <Intro :ws="ws" :state="state"></Intro>
    </div>
    <div v-else>
      <p class="text-xl text-gray-700">GAME CONTENT</p>
      <hr class="my-4 border-gray-300"/>
      <p class="text-xl text-gray-600">Resources</p>
      <div class="status-container">
        <div class="flex w-full">
          <div class="flex-shrink-0 pe-3">
            Energy: {{ energy }} / {{ energyMax }}
          </div>
          <div class="w-20 overflow-x-auto">
            <StatusBar :seconds="5"></StatusBar>
          </div>
        </div>
      </div>
      <div>
        Scraps: {{ scraps }}
      </div>
      <hr class="my-4 border-gray-300"/>
      <p class="text-xl text-gray-600">Fights</p>
      <Fight :ws="ws" type="dev">Random Fight (DEVELOPMENT)</Fight>
      <hr class="my-4 border-gray-300"/>
      <Hub :ws="ws" :state="state"></Hub>
      <Character :ws="ws" :character="state?.character"></Character>
      <hr class="my-4 border-gray-300"/>
    </div>
  </div>
</template>
