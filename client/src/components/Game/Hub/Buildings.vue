<script setup lang="ts">
import {useUser} from "@/composable/useUser.ts";
import {computed} from "vue";
const { user, token } = useUser();

interface Props {
  ws: WebSocket;
  state: any;
}
const props = defineProps<Props>();

const upgradeBuilding = (buildingTypeId:number) => {
  if (!props.ws) return;
  props.ws.send(JSON.stringify({ payload: {action:"upgrade", buildingType: buildingTypeId}, user: user.value, token:token.value }));
};
const canUpgradeBuilding = (buildingTypeId:number):boolean => {
  return props.state.upgradable.find((entry:any) => {
    return entry.buildingType === buildingTypeId;
  })?.canUpgrade || false;
}

const getBuildingLevelMap = computed(() => {
  const map = new Map();
  props.state.userBuildings.forEach((building: any) => {
    map.set(building.id, building.level);
  });
  return map;
});

const getBuildingLevelOfBuildingId = (id: number) => {
  return getBuildingLevelMap.value.get(id) || 0;
};

</script>
<template>
  <div id="game-buildings" v-if="props.state">
    <p class="text-l text-gray-600">Buildings</p>
    <div class="overflow-x-auto">
      <table class="min-w-full border-collapse border border-gray-300">
        <thead>
        <tr class="bg-gray-100">
          <th class="border border-gray-300 px-4 py-2 text-left font-medium text-gray-600">Name</th>
          <th class="border border-gray-300 px-4 py-2 text-left font-medium text-gray-600">Level</th>
          <th class="border border-gray-300 px-4 py-2 text-left font-medium text-gray-600">Cost</th>
          <th class="border border-gray-300 px-4 py-2 text-left font-medium text-gray-600">CTA</th>
        </tr>
        </thead>
        <tbody>
          <tr class="hover:bg-gray-50" v-for="buildingType in props.state.buildingTypes">
            <td class="border border-gray-300 px-4 py-2">{{buildingType.name}}</td>
            <td class="border border-gray-300 px-4 py-2">{{getBuildingLevelOfBuildingId(buildingType.id)}}</td>
            <td class="border border-gray-300 px-4 py-2">ToDo</td>
            <td class="border border-gray-300 px-4 py-2">
              <button :disabled="!canUpgradeBuilding(buildingType.id)" class="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer" @click="upgradeBuilding(buildingType.id)">
                Upgrade
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
