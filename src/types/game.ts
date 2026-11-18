export type LogicOperation = 'AND' | 'OR' | 'NOT' | 'XOR' | 'IMPLIES' | 'MODUS_TOLLENS' | 'DISJUNCTIVE_SYLLOGISM' | 'DOUBLE_NEGATION'

export type InferenceRule = 'conjunction' | 'disjunction' | 'modus-ponens' | 'modus-tollens' | 'disjunctive-syllogism' | 'double-negation'

export type Difficulty = 'easy' | 'medium' | 'hard' | 'advanced' | 'expert' | 'collegiate' | 'professor'

export interface InferenceRuleDefinition {
  id: InferenceRule
  label: string
  operation: LogicOperation
  symbol: string
  tooltip: string
  description: string
}

export const inferenceRuleDefinitions: Record<InferenceRule, InferenceRuleDefinition> = {
  conjunction: {
    id: 'conjunction',
    label: 'Conjunction (AND)',
    operation: 'AND',
    symbol: '∧',
    tooltip: 'AND (conjunction): true only when all inputs are true.',
    description: 'AND is true only when all inputs are true.',
  },
  disjunction: {
    id: 'disjunction',
    label: 'Disjunction (OR)',
    operation: 'OR',
    symbol: '∨',
    tooltip: 'OR (disjunction): true when at least one input is true.',
    description: 'OR is true when at least one input is true.',
  },
  'modus-ponens': {
    id: 'modus-ponens',
    label: 'Modus Ponens (P → Q)',
    operation: 'IMPLIES',
    symbol: '→',
    tooltip: 'IMPLIES (conditional): false only when the premise is true and the conclusion is false.',
    description: 'If the premise is true, the conclusion must also be true.',
  },
  'modus-tollens': {
    id: 'modus-tollens',
    label: 'Modus Tollens (¬Q → ¬P)',
    operation: 'MODUS_TOLLENS',
    symbol: '→',
    tooltip: 'MODUS TOLLENS: true unless P is true while Q is false.',
    description: 'If Q is false, then P must also be false.',
  },
  'disjunctive-syllogism': {
    id: 'disjunctive-syllogism',
    label: 'Disjunctive Syllogism (P ∨ Q, ¬P ⇒ Q)',
    operation: 'DISJUNCTIVE_SYLLOGISM',
    symbol: '∨',
    tooltip: 'DISJUNCTIVE SYLLOGISM: if P is false and Q is the remaining valid option, then Q must be true.',
    description: 'If P is false while either statement is true, then Q must be true.',
  },
  'double-negation': {
    id: 'double-negation',
    label: 'Double Negation (¬¬P)',
    operation: 'DOUBLE_NEGATION',
    symbol: '¬',
    tooltip: 'DOUBLE NEGATION: a statement is equivalent to its double negation.',
    description: 'Double negation means ¬¬P is equivalent to P.',
  },
}

export const inferenceRuleOrder: InferenceRule[] = Object.keys(inferenceRuleDefinitions) as InferenceRule[]

export type GameMode = 'practice' | 'test'

export interface TruthTableRow {
  id: string
  inputs: boolean[]
  output: boolean | null
}

export interface Exercise {
  id: string
  kind?: 'truth-table'
  operation: LogicOperation
  difficulty: Difficulty
  inputLabels: string[]
  ruleText: string
  rows: TruthTableRow[]
  missingRowIds: string[]
  answerKey: Record<string, boolean>
}

export interface GameScore {
  points: number
  stars: number
}

export type ScoreByMode = Record<GameMode, GameScore>