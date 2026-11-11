<script setup lang="ts">
import boolioAsset from '../assets/boolio.svg'

defineProps<{
  mood: 'thinking' | 'cheering' | 'encouraging'
}>()
</script>

<template>
  <div class="mascot-stage" :class="`mascot-${mood}`">
    <span class="mascot-spark spark-one" aria-hidden="true">✦</span>
    <span class="mascot-spark spark-two" aria-hidden="true">✳</span>
    <img class="mascot-art" :src="boolioAsset" alt="Boolio the friendly beaver" />
    <span class="mascot-ground" aria-hidden="true"></span>
  </div>
</template>