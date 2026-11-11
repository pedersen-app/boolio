import type { Difficulty, Exercise, LogicOperation, TruthTableRow } from '../types/game'

type RandomSource = () => number
type NotVariant = 'single' | 'and' | 'composite' | 'expert'

interface DifficultyProfile {
  inputCount: number
  shuffleRows: boolean
  notVariant: NotVariant
}

const inputLetters = ['A', 'B', 'C', 'D', 'E']

function shuffle<T>(values: T[], random: RandomSource): T[] {
  const shuffled = [...values]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex]!, shuffled[index]!]
  }
  return shuffled
}

function difficultyProfile(operation: LogicOperation, difficulty: Difficulty): DifficultyProfile {
  if (operation === 'NOT') {
    switch (difficulty) {
      case 'easy': return { inputCount: 1, shuffleRows: false, notVariant: 'single' }
      case 'medium': return { inputCount: 1, shuffleRows: true, notVariant: 'single' }
      case 'hard': return { inputCount: 2, shuffleRows: true, notVariant: 'and' }
      case 'advanced': return { inputCount: 3, shuffleRows: true, notVariant: 'composite' }
      case 'expert': return { inputCount: 4, shuffleRows: true, notVariant: 'expert' }
    }
  }

  switch (difficulty) {
    case 'easy': return { inputCount: 2, shuffleRows: false, notVariant: 'single' }
    case 'medium': return { inputCount: 2, shuffleRows: true, notVariant: 'single' }
    case 'hard': return { inputCount: 3, shuffleRows: true, notVariant: 'single' }
    case 'advanced': return { inputCount: 4, shuffleRows: true, notVariant: 'single' }
    case 'expert': return { inputCount: 5, shuffleRows: true, notVariant: 'single' }
  }
}

function inputCombinations(inputCount: number): boolean[][] {
  const totalRows = 2 ** inputCount
  const rows: boolean[][] = []

  for (let row = 0; row < totalRows; row += 1) {
    const inputs: boolean[] = []
    for (let bit = inputCount - 1; bit >= 0; bit -= 1) {
      inputs.push(((row >> bit) & 1) === 1)
    }
    rows.push(inputs)
  }

  return rows
}

function evaluateForDifficulty(
  operation: LogicOperation,
  inputs: readonly boolean[],
  notVariant: NotVariant,
): boolean {
  switch (operation) {
    case 'AND':
      return inputs.every((value) => value === true)
    case 'OR':
      return inputs.some((value) => value === true)
    case 'XOR':
      return inputs.reduce((isTrue, current) => (isTrue !== current), false)
    case 'NOT':
      if (notVariant === 'single') return inputs[0] !== true
      if (notVariant === 'and') return !(inputs[0] === true && inputs[1] === true)
      if (notVariant === 'composite') return !((inputs[0] === true || inputs[1] === true) && inputs[2] === true)
      return !((inputs[0] !== inputs[1]) || (inputs[2] === true && inputs[3] === true))
  }
}

function ruleTextFor(operation: LogicOperation, inputCount: number, notVariant: NotVariant): string {
  switch (operation) {
    case 'AND':
      return inputCount > 2
        ? 'AND is true only when every input is true.'
        : 'AND is true only when both inputs are true.'
    case 'OR':
      return 'OR is true when at least one input is true.'
    case 'XOR':
      return inputCount > 2
        ? 'XOR is true when an odd number of inputs are true.'
        : 'XOR is true when the two inputs are different.'
    case 'NOT':
      if (notVariant === 'single') return 'NOT flips the input: true becomes false and false becomes true.'
      if (notVariant === 'and') return 'NOT(AND) is true unless both inputs are true.'
      if (notVariant === 'composite') return 'NOT((A OR B) AND C) is true unless C is true and at least one of A or B is true.'
      return 'NOT((A XOR B) OR (C AND D)) is true only when A and B match and C AND D are not both true.'
  }
}

function makeExercise(
  operation: LogicOperation,
  difficulty: Difficulty,
  random: RandomSource,
): Exercise {
  const profile = difficultyProfile(operation, difficulty)
  const baseRows = inputCombinations(profile.inputCount).map((inputs) => ({
    id: inputs.map((value) => String(value)).join('-'),
    inputs,
    output: evaluateForDifficulty(operation, inputs, profile.notVariant),
  }))
  const visibleOrder = profile.shuffleRows ? shuffle(baseRows, random) : baseRows
  const missingRowIds = visibleOrder.map((row) => row.id)
  const answerKey = Object.fromEntries(
    baseRows.map((row) => [row.id, row.output === true]),
  )
  const rows: TruthTableRow[] = visibleOrder.map((row) => ({
    ...row,
    output: null,
  }))

  return {
    id: `${operation}:${difficulty}:${visibleOrder.map((row) => row.id).join(',')}:${[...missingRowIds].sort().join(',')}`,
    operation,
    difficulty,
    inputLabels: inputLetters.slice(0, profile.inputCount),
    ruleText: ruleTextFor(operation, profile.inputCount, profile.notVariant),
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