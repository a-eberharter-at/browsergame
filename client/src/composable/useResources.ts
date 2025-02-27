import { useResourcesStore } from '@/stores/resources';  // Import your user store
import { computed } from 'vue';

export function useResources() {
  const resourcesStore = useResourcesStore();  // Access the user store

  // You can return computed properties and actions to manipulate the store
  const energy = computed(() => resourcesStore.energy);
  const energyMax = computed(() => resourcesStore.energyMax);
  const scraps = computed(() => resourcesStore.scraps);
  const setEnergy = (newEnergy: number) => resourcesStore.setEnergy(newEnergy);
  const setEnergyMax = (newEnergyMax: number) => resourcesStore.setEnergyMax(newEnergyMax);
  const setScraps = (newScraps: number) => resourcesStore.setScraps(newScraps);

  return {
    energy,
    energyMax,
    scraps,
    setEnergy,
    setEnergyMax,
    setScraps
  };
}
