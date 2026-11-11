<script setup lang="ts">
import type { LogicOperation, TruthTableRow } from '../types/game'

defineProps<{
  operation: LogicOperation
  rows: TruthTableRow[]
  missingRowIds: string[]
  answers: Record<string, boolean>
  locked: boolean
}>()

const emit = defineEmits<{
  select: [rowId: string, answer: boolean]
}>()

function truthLabel(value: boolean) {
  return value ? 'TRUE' : 'FALSE'
}
</script>

<template>
  <table class="truth-table" :class="{ 'not-table': operation === 'NOT' }">
    <thead>
      <tr>
        <th scope="col">A</th>
        <th v-if="operation !== 'NOT'" scope="col">B</th>
        <th scope="col">OUTPUT</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, index) in rows" :key="row.id">
        <td><span class="truth-value" :class="{ true: row.inputs[0] }">{{ truthLabel(row.inputs[0]!) }}</span></td>
        <td v-if="operation !== 'NOT'"><span class="truth-value" :class="{ true: row.inputs[1] }">{{ truthLabel(row.inputs[1]!) }}</span></td>
        <td class="output-cell">
          <template v-if="missingRowIds.includes(row.id)">
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
          </template>
          <span v-else class="truth-value output-value" :class="{ true: row.output }">{{ truthLabel(row.output === true) }}</span>
        </td>
      </tr>
    </tbody>
  </table>
</template>