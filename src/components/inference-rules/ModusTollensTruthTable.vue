<script setup lang="ts">
import { computed } from 'vue'
import BaseInferenceRuleTruthTable from './BaseInferenceRuleTruthTable.vue'
import type { InferenceRuleTableProps } from './types'

const props = defineProps<InferenceRuleTableProps>()

const emit = defineEmits<{
  select: [rowId: string, answer: boolean]
}>()

const displayInputLabels = computed(() => ['¬Q', '¬P'])

const displayRows = computed(() => props.rows.map((row) => ({
  ...row,
  inputs: [!row.inputs[1], !row.inputs[0]],
})))
</script>

<template>
  <BaseInferenceRuleTruthTable
    operation="MODUS_TOLLENS"
    operator-token="→"
    :notation-mode="props.notationMode"
    :input-labels="displayInputLabels"
    :rows="displayRows"
    :answers="props.answers"
    :locked="props.locked"
    :wrong-row-ids="props.wrongRowIds"
    @select="(rowId, answer) => emit('select', rowId, answer)"
  />
</template>
