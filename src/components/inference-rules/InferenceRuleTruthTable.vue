<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import ConjunctionTruthTable from './ConjunctionTruthTable.vue'
import DisjunctiveSyllogismTruthTable from './DisjunctiveSyllogismTruthTable.vue'
import DisjunctionTruthTable from './DisjunctionTruthTable.vue'
import DoubleNegationTruthTable from './DoubleNegationTruthTable.vue'
import ModusPonensTruthTable from './ModusPonensTruthTable.vue'
import ModusTollensTruthTable from './ModusTollensTruthTable.vue'
import type { InferenceRuleSelectorTableProps } from './types'

const props = defineProps<InferenceRuleSelectorTableProps>()

const emit = defineEmits<{
  select: [rowId: string, answer: boolean]
}>()

const tableByRule: Partial<Record<InferenceRuleSelectorTableProps['inferenceRule'], Component>> = {
  conjunction: ConjunctionTruthTable,
  disjunction: DisjunctionTruthTable,
  'modus-ponens': ModusPonensTruthTable,
  'modus-tollens': ModusTollensTruthTable,
  'disjunctive-syllogism': DisjunctiveSyllogismTruthTable,
  'double-negation': DoubleNegationTruthTable,
}

const activeTable = computed(() => tableByRule[props.inferenceRule] ?? ConjunctionTruthTable)

function handleSelect(rowId: string, answer: boolean) {
  emit('select', rowId, answer)
}
</script>

<template>
  <component
    :is="activeTable"
    :notation-mode="props.notationMode"
    :input-labels="props.inputLabels"
    :rows="props.rows"
    :answers="props.answers"
    :locked="props.locked"
    :wrong-row-ids="props.wrongRowIds"
    @select="handleSelect"
  />
</template>
