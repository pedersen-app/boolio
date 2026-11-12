<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import ConjunctionTruthTable from './ConjunctionTruthTable.vue'
import DisjunctionTruthTable from './DisjunctionTruthTable.vue'
import type { InferenceRuleSelectorTableProps } from './types'

const props = defineProps<InferenceRuleSelectorTableProps>()

const emit = defineEmits<{
  select: [rowId: string, answer: boolean]
}>()

const tableByRule: Record<InferenceRuleSelectorTableProps['inferenceRule'], Component> = {
  conjunction: ConjunctionTruthTable,
  disjunction: DisjunctionTruthTable,
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
    @select="handleSelect"
  />
</template>
