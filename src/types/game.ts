export type LogicOperation = 'AND' | 'OR' | 'NOT' | 'XOR'

export type Difficulty = 'easy' | 'medium'

export interface TruthTableRow {
  id: string
  inputs: boolean[]
  output: boolean | null
}

export interface Exercise {
  id: string
  operation: LogicOperation
  difficulty: Difficulty
  rows: TruthTableRow[]
  missingRowIds: string[]
  answerKey: Record<string, boolean>
}

export interface GameScore {
  points: number
  stars: number
}