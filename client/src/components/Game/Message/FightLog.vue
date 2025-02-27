<style>
  .player-color {
    color: #06402B;
    font-weight: bold;
  }
  .enemy-color {
    color: #8B0000;
    font-weight: bold;
  }
</style>
<script setup lang="ts">
import {ref} from "vue";

interface Props {
  fightLog: any;
}
const props = defineProps<Props>();

const characterIsPlayer = (name:string) => {
  return name === 'Player';
}
const getColorClassOfParticipant = (participant:string) => {
  return characterIsPlayer(participant) ? 'player-color' : 'enemy-color';
}

let showFullInfo = ref<boolean>(false);
const toggleInfo = () => {
  showFullInfo.value = !showFullInfo.value
}
</script>
<template>
  <div id="game-fight-log" class="mb-4">
    <p class="text-xl text-gray-600">FightLog</p>
    <button
      class="rounded bg-blue-500 me-3 mt-3 px-3 py-1 text-white hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
      @click="toggleInfo">
      Toggle FullInfo {{showFullInfo ? 'off' : 'on'}}
    </button>
    <hr class="my-4 border-gray-300"/>
    <table class="min-w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-gray-300 px-4 py-2 text-left font-medium text-gray-600">Round</th>
          <th class="border border-gray-300 px-4 py-2 text-left font-medium text-gray-600">description</th>
          <th class="border border-gray-300 px-4 py-2 text-left font-medium text-gray-600" v-if="showFullInfo">attacker</th>
          <th class="border border-gray-300 px-4 py-2 text-left font-medium text-gray-600" v-if="showFullInfo">defender</th>
          <th class="border border-gray-300 px-4 py-2 text-left font-medium text-gray-600" v-if="showFullInfo">attackHit</th>
          <th class="border border-gray-300 px-4 py-2 text-left font-medium text-gray-600" v-if="showFullInfo">criticalHit</th>
          <th class="border border-gray-300 px-4 py-2 text-left font-medium text-gray-600" v-if="showFullInfo">luckyDodge</th>
          <th class="border border-gray-300 px-4 py-2 text-left font-medium text-gray-600" v-if="showFullInfo">mitigatedDamage</th>
          <th class="border border-gray-300 px-4 py-2 text-left font-medium text-gray-600" v-if="showFullInfo">damageDealt</th>
          <th class="border border-gray-300 px-4 py-2 text-left font-medium text-gray-600">defenderRemainingHealth</th>
        </tr>
      </thead>
      <tbody>
        <tr class="hover:bg-gray-50" v-for="(logEntry, index) in fightLog.log">
          <td class="border border-gray-300 px-4 py-2">#{{logEntry.round}}</td>
          <td class="border border-gray-300 px-4 py-2">{{ logEntry.description }}</td>
          <td class="border border-gray-300 px-4 py-2" v-if="showFullInfo">{{ logEntry.attacker }}</td>
          <td class="border border-gray-300 px-4 py-2" v-if="showFullInfo">{{ logEntry.defender }}</td>
          <td class="border border-gray-300 px-4 py-2" v-if="showFullInfo">{{ logEntry.attackHit }}</td>
          <td class="border border-gray-300 px-4 py-2" v-if="showFullInfo">{{ logEntry.criticalHit }}</td>
          <td class="border border-gray-300 px-4 py-2" v-if="showFullInfo">{{ logEntry.luckyDodge }}</td>
          <td class="border border-gray-300 px-4 py-2" v-if="showFullInfo">{{ logEntry.mitigatedDamage }}</td>
          <td class="border border-gray-300 px-4 py-2" v-if="showFullInfo">{{ logEntry.damageDealt }}</td>
          <td class="border border-gray-300 px-4 py-2"><span :class="getColorClassOfParticipant(logEntry.defender)">{{logEntry.defenderRemainingHealth}} HP remaining</span></td>
        </tr>
      </tbody>
    </table>
    <hr class="my-4 border-gray-300"/>
    <div>Winner: {{fightLog.winner.name}}</div>
    <div>Experience: {{fightLog.rewards.exp}}</div>
    <div>Loot: {{fightLog.loot}}</div>
    <div>Scraps: {{fightLog.rewards.scraps}}</div>
    <div>Level Up?: {{fightLog.rewards.levelUp}}</div>
    <div>Player Won?: {{fightLog.winner.playerWon}}</div>
    <hr class="my-4 border-gray-300"/>
    <button
      class="rounded bg-blue-500 me-3 mt-3 px-3 py-1 text-white hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
      @click="$emit('clearFightLog')">
      Ok
    </button>
  </div>
</template>
