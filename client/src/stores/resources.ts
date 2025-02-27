// stores/resources.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useResourcesStore = defineStore('resources', () => {
  // Define a reactive reference to hold the user data
  const energy = ref<number>(0);
  const energyMax = ref<number>(0);
  const scraps = ref<number>(0);
  // Define actions to modify the user data
  function setEnergy(newEnergy: number) {
    energy.value = newEnergy;
  }
  function setEnergyMax(newEnergyMax: number) {
    energyMax.value = newEnergyMax;
  }
  function setScraps(newScraps: number) {
    scraps.value = newScraps;
  }

  return {
    energy,
    energyMax,
    scraps,
    setEnergy,
    setEnergyMax,
    setScraps,
  };
});
