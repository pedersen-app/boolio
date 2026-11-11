import { createTruthTable } from './gates'
import type { Difficulty, Exercise, LogicOperation, TruthTableRow } from '../types/game'

type RandomSource = () => number

function shuffle<T>(values: T[], random: RandomSource): T[] {
  const shuffled = [...values]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex]!, shuffled[index]!]
  }
  return shuffled
}

function makeExercise(
  operation: LogicOperation,
  difficulty: Difficulty,
  random: RandomSource,
): Exercise {
  const truthTable = createTruthTable(operation)
  const visibleOrder = difficulty === 'medium' ? shuffle(truthTable, random) : truthTable
  const missingCount = difficulty === 'easy' ? 1 : Math.min(2, truthTable.length)
  const missingRowIds = shuffle(visibleOrder.map((row) => row.id), random).slice(0, missingCount)
  const missing = new Set(missingRowIds)
  const answerKey = Object.fromEntries(
    truthTable.map((row) => [row.id, row.output === true]),
  )
  const rows: TruthTableRow[] = visibleOrder.map((row) => ({
    ...row,
    output: missing.has(row.id) ? null : row.output,
  }))

  return {
    id: `${operation}:${difficulty}:${visibleOrder.map((row) => row.id).join(',')}:${[...missingRowIds].sort().join(',')}`,
    operation,
    difficulty,
    rows,
    missingRowIds,
    answerKey,
  }
}

export function generateQuestion(
  operation: LogicOperation,
  difficulty: Difficulty,
  previousQuestionId?: string,
  random: RandomSource = Math.random,
): Exercise {
  let question = makeExercise(operation, difficulty, random)
  for (let attempt = 0; question.id === previousQuestionId && attempt < 8; attempt += 1) {
    question = makeExercise(operation, difficulty, random)
  }
  return question
}