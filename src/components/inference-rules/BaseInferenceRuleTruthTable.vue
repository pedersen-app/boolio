<script setup lang="ts">
import { computed, ref } from 'vue'
import type { BaseInferenceRuleTableProps } from './types'

type ColumnSpec = { kind: 'input'; inputIndex: number } | { kind: 'operator' }

const props = defineProps<BaseInferenceRuleTableProps>()

const emit = defineEmits<{
  select: [rowId: string, answer: boolean]
}>()

const tooltipVisible = ref(false)
const tooltipDirection = ref<'above' | 'below'>('above')
const tooltipStyle = ref<Record<string, string>>({ left: '0px', top: '0px' })

function truthLabel(value: boolean) {
  return value ? 'TRUE' : 'FALSE'
}

const tableMinWidth = computed(() => {
  const operatorCols = columnSpecs.value.filter((col) => col.kind === 'operator').length
  const inputCols = props.inputLabels.length
  const base = 150 + (inputCols * 88) + (operatorCols * 42)
  return `${Math.max(440, base)}px`
})

const operatorTooltip = computed(() => {
  const tooltipByOperation: Record<BaseInferenceRuleTableProps['operation'], string> = {
    AND: 'AND (conjunction): true only when all inputs are true.',
    OR: 'OR (disjunction): true when at least one input is true.',
    NOT: 'NOT (negation): flips true and false.',
    XOR: 'XOR (exclusive OR): true when inputs are different.',
  }

  return tooltipByOperation[props.operation]
})

function showOperatorTooltip(event: MouseEvent | FocusEvent) {
  const target = event.currentTarget as HTMLElement | null
  if (!target) return

  const rect = target.getBoundingClientRect()
  const tooltipHalfWidth = 130
  const edgePadding = 12
  const centerX = rect.left + (rect.width / 2)
  const clampedX = Math.max(
    edgePadding + tooltipHalfWidth,
    Math.min(window.innerWidth - edgePadding - tooltipHalfWidth, centerX),
  )

  tooltipDirection.value = rect.top < 96 ? 'below' : 'above'
  tooltipStyle.value = {
    left: `${clampedX}px`,
    top: tooltipDirection.value === 'above'
      ? `${rect.top}px`
      : `${rect.bottom}px`,
  }
  tooltipVisible.value = true
}

function hideOperatorTooltip() {
  tooltipVisible.value = false
}

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
          <template v-else>
            <span
              class="logic-symbol"
              :aria-label="operatorTooltip"
              tabindex="0"
              @mouseenter="showOperatorTooltip"
              @mouseleave="hideOperatorTooltip"
              @focus="showOperatorTooltip"
              @blur="hideOperatorTooltip"
            >{{ operatorToken }}</span>
          </template>
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

  <Teleport to="body">
    <div
      v-if="tooltipVisible"
      class="logic-tooltip-overlay"
      :class="`logic-tooltip-overlay--${tooltipDirection}`"
      :style="tooltipStyle"
      role="tooltip"
      aria-live="polite"
    >
      {{ operatorTooltip }}
    </div>
  </Teleport>
</template>
