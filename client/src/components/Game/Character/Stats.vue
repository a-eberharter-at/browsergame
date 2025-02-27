<script setup lang="ts">
import {computed, ref, useTemplateRef, watch} from 'vue';
import {useUser} from "@/composable/useUser.ts";
const { user, token } = useUser();
import Chart, {type ChartConfiguration} from 'chart.js/auto';

interface Props {
  ws: WebSocket;
  character: any;
}
const props = defineProps<Props>();

const chartRef = useTemplateRef('stat-chart');
let chartInstance:Chart | null = null;

const statsAdded = ref<number>(0);
const statPointsLeft = computed(() => {
  return props.character.points - statsAdded.value;
})
const improveStats = ref<{[key:string]:any}>({
  str: 0,
  vit: 0,
  int: 0,
  agi: 0,
  dex: 0,
  luk: 0,
})



const improveStat = (stat:string) => {
  if(!props.character){return ;}
  if(props.character.points - statsAdded.value <= 0){
    alert("No Upgrade Tokens Available.");
    return;
  }
  improveStats.value[stat] ++;
  statsAdded.value ++;
};
const reset = () => {
  improveStats.value.str = 0;
  improveStats.value.vit = 0;
  improveStats.value.int = 0;
  improveStats.value.agi = 0;
  improveStats.value.dex = 0;
  improveStats.value.luk = 0;
  statsAdded.value = 0;
};

const submitStats = () => {
  if (!props.ws) return;
  props.ws.send(JSON.stringify({ payload: {action:"addCharacterStats", stats: improveStats.value}, user: user.value, token:token.value }));
};

//ToDo: move to backend
const stats = computed<Array<{name:string, short:string, description:string, knownStat:string, value:number}>>(() => {
  if(!props.character){return []}
  return [
    {
      name: "Torque Capacity",
      short: "TC",
      description: "Maximum mechanical force exerted by servos for heavy tasks.",
      knownStat: "str",
      value: props.character.str,
    },
    {
      name: "Structural Integrity",
      short: "SI",
      description: "Resilience of the chassis against damage and wear.",
      knownStat: "vit",
      value: props.character.vit,
    },
    {
      name: "Processing Power",
      short: "PP",
      description: "Computational efficiency for decision-making and complex tasks.",
      knownStat: "int",
      value: props.character.int,
    },
    {
      name: "Servo Optimization",
      short: "SO",
      description: "Precision and speed of movement for enhanced mobility.",
      knownStat: "agi",
      value: props.character.agi,
    },
    {
      name: "Actuator Responsiveness",
      short: "AR",
      description: "Accuracy and speed of mechanical actions.",
      knownStat: "dex",
      value: props.character.dex,
    },
    {
      name: "Signal Entropy ",
      short: "SE",
      description: "Ability to harness chaotic signals for favorable outcomes.",
      knownStat: "luk",
      value: props.character.luk,
    },
  ]
});


const chartData = computed(() => {
  const labels = stats.value.map(stat => `${stat.short}`);
  const data = stats.value.map(stat => stat.value);
  const dataNew = stats.value.map(stat => (stat.value + improveStats.value[stat.knownStat]));
  const dataSets = [
    {
      label: 'Level',
      data: data,
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    },
    {
      label: 'New Level',
      data: dataNew,
      backgroundColor: 'rgba(128, 128, 128, 0.2)',
      borderColor: 'rgba(128, 128, 128, 1)',
      borderWidth: 1,
      hidden: statsAdded.value <= 0,
    }
  ];
  return {
    labels,
    datasets: dataSets
  };
});

const config = computed<ChartConfiguration>(() => {

  const dataValues = chartData.value.datasets[0].data; // Assuming you are using the first dataset
  let maxValue = Math.max(...dataValues);

  // Ensure the max value is at least 10
  if (maxValue < 10) {
    maxValue = 10;
  } else {
    // Round the max value up to the nearest whole number
    maxValue = Math.ceil(maxValue);
  }

  return {
    type: 'radar',
    data: chartData.value,
    options: {
      elements: {
        line: {
          tension: 0 // ensures sharp edges
        }
      },
      scales: {
        r: {
          min: 0,
          max: maxValue,
          pointLabels: {
            display: true
          },
        }
      },
      plugins: {
        legend: {
          display: false // Hide the entire legend
        }
      }
    }
  }
});

watch(chartRef, (newValue) => {
  if (newValue) {
    chartInstance = new Chart(newValue, config.value);
  }
});
watch(chartData, (newValue) => {
  if (chartInstance) {
    chartInstance.config.data.datasets = newValue.datasets;
    chartInstance.update();
  }
});

watch(() => props.character, (first, second) => {
  console.log("NEW CHARACTER DATA");
  reset();
});

</script>
<template>
  <div id="game-buildings" v-if="props.character">
    <div class="flex w-full">
      <div class="w-2/3 overflow-x-auto">
        <p class="text-right">Available Upgrade Tokens: {{character.points - statsAdded}}</p>
        <table class="border-collapse border border-gray-300 w-full">
          <thead>
          <tr class="bg-gray-100">
            <th class="border border-gray-300 px-4 py-2 text-left font-medium text-gray-600">Name</th>
            <th class="border border-gray-300 px-4 py-2 text-left font-medium text-gray-600">Description</th>
            <th class="border border-gray-300 px-4 py-2 text-left font-medium text-gray-600">Level</th>
            <th class="border border-gray-300 px-4 py-2 text-left font-medium text-gray-600">CTA</th>
          </tr>
          </thead>
          <tbody>
          <tr class="hover:bg-gray-50" v-for="stat in stats">
            <td class="border border-gray-300 px-4 py-2">{{stat.name}} ({{stat.short}})</td>
            <td class="border border-gray-300 px-4 py-2">
              {{stat.description}}
              <br />
              Formerly known as: {{stat.knownStat.toUpperCase()}}
            </td>
            <td class="border border-gray-300 px-4 py-2">{{stat.value}}<span v-if="improveStats[stat.knownStat] > 0">(+{{ improveStats[stat.knownStat] }})</span></td>
            <td class="border border-gray-300 px-4 py-2">
              <button
                :disabled="statPointsLeft <= 0"
                class="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                @click="improveStat(stat.knownStat)">
                Upgrade
              </button>
            </td>
          </tr>
          </tbody>
        </table>
        <p class="text-right">
          <button
            :disabled="statsAdded <= 0"
            class="rounded bg-blue-500 me-3 mt-3 px-3 py-1 text-white hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
            @click="submitStats">
            Submit
          </button>
          <button
            :disabled="statsAdded <= 0"
            class="rounded bg-blue-500 me-3 mt-3 px-3 py-1 text-white hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
            @click="reset">
            Reset
          </button>
        </p>
      </div>
      <div class="w-1/3 flex items-center justify-center p-4 bg-gray-50">
        <canvas ref="stat-chart">
        </canvas>
      </div>
    </div>
  </div>
</template>
