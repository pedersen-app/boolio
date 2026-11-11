<script setup lang="ts">
import type { LogicOperation } from '../types/game'

const model = defineModel<LogicOperation>({ required: true })
const choices: { value: LogicOperation; label: string }[] = [
  { value: 'AND', label: 'A AND B' },
  { value: 'OR', label: 'A OR B' },
  { value: 'NOT', label: 'NOT A' },
  { value: 'XOR', label: 'A XOR B' },
]
</script>

<template>
  <div class="operation-control">
    <span class="control-label">CHOOSE A GATE</span>
    <div class="operation-list" role="group" aria-label="Logic operation">
      <button
        v-for="choice in choices"
        :key="choice.value"
        type="button"
        :aria-pressed="model === choice.value"
        :class="{ active: model === choice.value }"
        @click="model = choice.value"
      >
        {{ choice.label }}
      </button>
    </div>
  </div>
</template>