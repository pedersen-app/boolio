import type { InferenceRule, LogicOperation, TruthTableRow } from '../../types/game'

export type NotationMode = 'symbolic' | 'polish' | 'reversePolish'

export interface InferenceRuleTableProps {
  notationMode: NotationMode
  inputLabels: string[]
  rows: TruthTableRow[]
  answers: Record<string, boolean>
  locked: boolean
  wrongRowIds?: string[]
}

export interface BaseInferenceRuleTableProps extends InferenceRuleTableProps {
  operation: LogicOperation
  operatorToken: string
}

export interface InferenceRuleSelectorTableProps extends InferenceRuleTableProps {
  inferenceRule: InferenceRule
}
