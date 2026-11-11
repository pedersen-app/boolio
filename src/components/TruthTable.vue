<script setup lang="ts">
import { computed } from 'vue'
import type { TruthTableRow } from '../types/game'

const props = defineProps<{
  inputLabels: string[]
  rows: TruthTableRow[]
  answers: Record<string, boolean>
  locked: boolean
}>()

const emit = defineEmits<{
  select: [rowId: string, answer: boolean]
}>()

function truthLabel(value: boolean) {
  return value ? 'TRUE' : 'FALSE'
}

const tableMinWidth = computed(() => {
  const base = 150 + (props.inputLabels.length * 88)
  return `${Math.max(440, base)}px`
})
</script>

<template>
  <table class="truth-table" :style="{ minWidth: tableMinWidth }">
    <thead>
      <tr>
        <th v-for="label in inputLabels" :key="label" scope="col">{{ label }}</th>
        <th scope="col" class="output-heading">OUTPUT</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, index) in rows" :key="row.id">
        <td v-for="(value, inputIndex) in row.inputs" :key="`${row.id}:${inputIndex}`">
          <span class="truth-value" :class="{ true: value }">{{ truthLabel(value) }}</span>
        </td>
        <td class="output-cell">
          <div class="answer-options" role="group" :aria-label="`Answer for row ${index + 1}`">
            <button
              type="button"
              class="answer-option answer-true"
              :class="{ selected: answers[row.id] === true }"
              :aria-pressed="answers[row.id] === true"
              :disabled="locked"
              @click="emit('select', row.id, true)"
            >TRUE</button>
            <button
              type="button"
              class="answer-option answer-false"
              :class="{ selected: answers[row.id] === false }"
              :aria-pressed="answers[row.id] === false"
              :disabled="locked"
              @click="emit('select', row.id, false)"
            >FALSE</button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>