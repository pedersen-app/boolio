<script setup lang="ts">
import BaseInferenceRuleTruthTable from './BaseInferenceRuleTruthTable.vue'
import type { InferenceRuleTableProps } from './types'

const props = defineProps<InferenceRuleTableProps>()

const emit = defineEmits<{
  select: [rowId: string, answer: boolean]
}>()
</script>

<template>
  <BaseInferenceRuleTruthTable
    operation="OR"
    operator-token="∨"
    :notation-mode="props.notationMode"
    :input-labels="props.inputLabels"
    :rows="props.rows"
    :answers="props.answers"
    :locked="props.locked"
    :wrong-row-ids="props.wrongRowIds"
    @select="(rowId, answer) => emit('select', rowId, answer)"
  />
</template>
