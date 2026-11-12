<script setup lang="ts">
import { computed } from 'vue'
import type { LogicOperation, TruthTableRow } from '../types/game'

type NotationMode = 'symbolic' | 'polish' | 'reversePolish'
type ColumnSpec = { kind: 'input'; inputIndex: number } | { kind: 'operator' }

const props = defineProps<{
  operation: LogicOperation
  notationMode: NotationMode
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
  const operatorCols = columnSpecs.value.filter((col) => col.kind === 'operator').length
  const inputCols = props.inputLabels.length
  const base = 150 + (inputCols * 88) + (operatorCols * 42)
  return `${Math.max(440, base)}px`
})

const operatorToken = computed(() => {
  const logicSymbolByOperation: Record<LogicOperation, string> = {
    AND: '∧',
    OR: '∨',
    XOR: '⊕',
    NOT: '¬',
  }

  return logicSymbolByOperation[props.operation]
})

const columnSpecs = computed<ColumnSpec[]>(() => {
  const count = props.inputLabels.length
  if (count === 0) return []

  if (props.operation === 'NOT') {
    return props.notationMode === 'reversePolish'
      ? [{ kind: 'input', inputIndex: 0 }, { kind: 'operator' }]
      : [{ kind: 'operator' }, { kind: 'input', inputIndex: 0 }]
  }

  if (props.notationMode === 'symbolic') {
    const cols: ColumnSpec[] = [{ kind: 'input', inputIndex: 0 }]
    for (let inputIndex = 1; inputIndex < count; inputIndex += 1) {
      cols.push({ kind: 'operator' }, { kind: 'input', inputIndex })
    }
    return cols
  }

  if (props.notationMode === 'polish') {
    return [{ kind: 'operator' }, ...props.inputLabels.map((_, inputIndex) => ({ kind: 'input' as const, inputIndex }))]
  }

  return [...props.inputLabels.map((_, inputIndex) => ({ kind: 'input' as const, inputIndex })), { kind: 'operator' }]
})
</script>

<template>
  <table class="truth-table" :style="{ minWidth: tableMinWidth }">
    <thead>
      <tr>
        <th
          v-for="(column, columnIndex) in columnSpecs"
          :key="`head:${columnIndex}`"
          scope="col"
          :class="{ 'operator-heading': column.kind === 'operator' }"
        >
          <template v-if="column.kind === 'input'">{{ inputLabels[column.inputIndex] }}</template>
          <template v-else>{{ operatorToken }}</template>
        </th>
        <th scope="col" class="output-heading">OUTPUT</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, index) in rows" :key="row.id">
        <td
          v-for="(column, columnIndex) in columnSpecs"
          :key="`${row.id}:${columnIndex}`"
          :class="{ 'operator-cell': column.kind === 'operator' }"
          :aria-hidden="column.kind === 'operator' ? 'true' : undefined"
        >
          <span
            v-if="column.kind === 'input'"
            class="truth-value"
            :class="{ true: row.inputs[column.inputIndex] }"
          >
            {{ truthLabel(row.inputs[column.inputIndex]) }}
          </span>
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