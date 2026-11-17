import { h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'
import ConjunctionTruthTable from '../components/inference-rules/ConjunctionTruthTable.vue'
import ModusTollensTruthTable from '../components/inference-rules/ModusTollensTruthTable.vue'
import { createOperationTruthTable, evaluateOperation } from './operations'
import { generateMediumProofExercise } from './proofs'
import { generateQuestion } from './questionGenerator'
import { awardCorrectAnswer } from './scoring'

describe('Boolean operations', () => {
  it.each([
    ['AND', [false, false], false],
    ['AND', [false, true], false],
    ['AND', [true, false], false],
    ['AND', [true, true], true],
    ['OR', [false, false], false],
    ['OR', [false, true], true],
    ['OR', [true, false], true],
    ['OR', [true, true], true],
    ['IMPLIES', [false, false], true],
    ['IMPLIES', [false, true], true],
    ['IMPLIES', [true, false], false],
    ['IMPLIES', [true, true], true],
    ['MODUS_TOLLENS', [false, false], true],
    ['MODUS_TOLLENS', [false, true], true],
    ['MODUS_TOLLENS', [true, false], false],
    ['MODUS_TOLLENS', [true, true], true],
    ['DISJUNCTIVE_SYLLOGISM', [false, false], false],
    ['DISJUNCTIVE_SYLLOGISM', [false, true], true],
    ['DISJUNCTIVE_SYLLOGISM', [true, false], false],
    ['DISJUNCTIVE_SYLLOGISM', [true, true], true],
    ['DOUBLE_NEGATION', [false], false],
    ['DOUBLE_NEGATION', [true], true],
    ['NOT', [false], true],
    ['NOT', [true], false],
    ['XOR', [false, false], false],
    ['XOR', [false, true], true],
    ['XOR', [true, false], true],
    ['XOR', [true, true], false],
  ] as const)('%s %j evaluates to %s', (operation, inputs, output) => {
    expect(evaluateOperation(operation, inputs)).toBe(output)
  })

  it('creates two rows for NOT and four rows for binary operations', () => {
    expect(createOperationTruthTable('NOT')).toHaveLength(2)
    expect(createOperationTruthTable('XOR')).toHaveLength(4)
    expect(createOperationTruthTable('IMPLIES')).toHaveLength(4)
    expect(createOperationTruthTable('MODUS_TOLLENS')).toHaveLength(4)
    expect(createOperationTruthTable('DISJUNCTIVE_SYLLOGISM')).toHaveLength(4)
    expect(createOperationTruthTable('DOUBLE_NEGATION')).toHaveLength(2)
  })
})

describe('question generation', () => {
  it('requires answers for every easy row while keeping the answer key separate', () => {
    const exercise = generateQuestion('AND', 'easy', undefined, () => 0)
    expect(exercise.missingRowIds).toHaveLength(exercise.rows.length)
    expect(exercise.rows.filter((row) => row.output === null)).toHaveLength(exercise.rows.length)
    expect(Object.keys(exercise.answerKey)).toHaveLength(4)
    expect(exercise.inputLabels).toEqual(['A', 'B'])
  })

  it('requires answers for every medium row and keeps every generated answer correct', () => {
    const exercise = generateQuestion('XOR', 'medium', undefined, () => 0)
    expect(exercise.missingRowIds).toHaveLength(exercise.rows.length)
    for (const row of exercise.rows) {
      const expected = row.inputs[0] !== row.inputs[1]
      expect(exercise.answerKey[row.id]).toBe(expected)
    }
  })

  it('uses three inputs for hard difficulty operations', () => {
    const exercise = generateQuestion('OR', 'hard', undefined, () => 0)
    expect(exercise.rows).toHaveLength(8)
    expect(exercise.inputLabels).toEqual(['A', 'B', 'C'])
    for (const row of exercise.rows) {
      const expected = row.inputs.some((value) => value === true)
      expect(exercise.answerKey[row.id]).toBe(expected)
    }
  })

  it('uses four inputs for advanced binary operations', () => {
    const exercise = generateQuestion('AND', 'advanced', undefined, () => 0)
    expect(exercise.rows).toHaveLength(16)
    expect(exercise.inputLabels).toEqual(['A', 'B', 'C', 'D'])
    for (const row of exercise.rows) {
      const expected = row.inputs.every((value) => value === true)
      expect(exercise.answerKey[row.id]).toBe(expected)
    }
  })

  it('uses composite NOT behavior for advanced difficulty', () => {
    const exercise = generateQuestion('NOT', 'advanced', undefined, () => 0)
    expect(exercise.rows).toHaveLength(8)
    expect(exercise.inputLabels).toEqual(['A', 'B', 'C'])
    for (const row of exercise.rows) {
      const expected = !((row.inputs[0] === true || row.inputs[1] === true) && row.inputs[2] === true)
      expect(exercise.answerKey[row.id]).toBe(expected)
    }
  })

  it('uses five inputs for expert binary operations', () => {
    const exercise = generateQuestion('OR', 'expert', undefined, () => 0)
    expect(exercise.rows).toHaveLength(32)
    expect(exercise.inputLabels).toEqual(['A', 'B', 'C', 'D', 'E'])
    for (const row of exercise.rows) {
      const expected = row.inputs.some((value) => value === true)
      expect(exercise.answerKey[row.id]).toBe(expected)
    }
  })

  it('uses expert NOT behavior for expert difficulty', () => {
    const exercise = generateQuestion('NOT', 'expert', undefined, () => 0)
    expect(exercise.rows).toHaveLength(16)
    expect(exercise.inputLabels).toEqual(['A', 'B', 'C', 'D'])
    for (const row of exercise.rows) {
      const expected = !((row.inputs[0] !== row.inputs[1]) || (row.inputs[2] === true && row.inputs[3] === true))
      expect(exercise.answerKey[row.id]).toBe(expected)
    }
  })

  it('creates Modus Ponens truth tables with implication semantics', () => {
    const exercise = generateQuestion('IMPLIES', 'easy', undefined, () => 0)
    expect(exercise.inputLabels).toEqual(['P', 'Q'])
    expect(exercise.rows).toHaveLength(4)
    for (const row of exercise.rows) {
      const expected = !(row.inputs[0] === true && row.inputs[1] === false)
      expect(exercise.answerKey[row.id]).toBe(expected)
    }
  })

  it('creates Modus Tollens truth tables with negated-conditional semantics', () => {
    const exercise = generateQuestion('MODUS_TOLLENS', 'easy', undefined, () => 0)
    expect(exercise.inputLabels).toEqual(['P', 'Q'])
    expect(exercise.rows).toHaveLength(4)
    expect(exercise.ruleText).toBe('If Q is false, then P must also be false (¬Q → ¬P).')
    for (const row of exercise.rows) {
      const expected = row.inputs[1] === true || row.inputs[0] !== true
      expect(exercise.answerKey[row.id]).toBe(expected)
    }
  })

  it('creates Double Negation truth tables with identity semantics', () => {
    const exercise = generateQuestion('DOUBLE_NEGATION', 'easy', undefined, () => 0)
    expect(exercise.inputLabels).toEqual(['P'])
    expect(exercise.rows).toHaveLength(2)
    expect(exercise.ruleText).toBe('Double negation: ¬¬P is equivalent to P.')
    for (const row of exercise.rows) {
      expect(exercise.answerKey[row.id]).toBe(row.inputs[0])
    }
  })

  it('cycles through the full proof set without repeating a rule before each proof type is used once', () => {
    const first = generateMediumProofExercise('medium')
    const second = generateMediumProofExercise('medium')
    const third = generateMediumProofExercise('medium')
    const fourth = generateMediumProofExercise('medium')

    expect([first.rule, second.rule, third.rule, fourth.rule]).toHaveLength(4)
    expect(new Set([first.rule, second.rule, third.rule, fourth.rule]).size).toBe(4)
    expect(['modus-ponens', 'modus-tollens', 'disjunctive-syllogism', 'double-negation']).toEqual(
      expect.arrayContaining([first.rule, second.rule, third.rule, fourth.rule]),
    )
  })

  it('creates a one-step medium proof with unique conclusions and multiple answer choices', () => {
    const exercise = generateMediumProofExercise('medium')
    expect(exercise.kind).toBe('proof')
    expect(exercise.premises.length).toBeGreaterThan(0)
    expect(exercise.options).toHaveLength(3)
    expect(new Set(exercise.options).size).toBe(exercise.options.length)
    expect(exercise.options).toContain(exercise.proofAnswer)
    expect(exercise.conclusion).toBe(exercise.proofAnswer)
  })
})

describe('table rendering', () => {
  it('shows negated headers for Modus Tollens to mirror ¬Q → ¬P form', async () => {
    const rows = [
      { id: 'r1', inputs: [false, false], output: true },
      { id: 'r2', inputs: [false, true], output: true },
      { id: 'r3', inputs: [true, false], output: false },
      { id: 'r4', inputs: [true, true], output: true },
    ]

    const html = await renderToString(h(ModusTollensTruthTable, {
      notationMode: 'symbolic',
      inputLabels: ['P', 'Q'],
      rows,
      answers: {},
      locked: false,
      wrongRowIds: [],
    }))

    expect(html).toContain('¬Q')
    expect(html).toContain('¬P')
  })

  it('passes wrong-row IDs through so incorrect rows show their highlight and expected value', async () => {
    const rows = [
      { id: 'r1', inputs: [false, false], output: true },
      { id: 'r2', inputs: [true, false], output: false },
    ]

    const html = await renderToString(h(ConjunctionTruthTable, {
      notationMode: 'polish',
      inputLabels: ['A', 'B'],
      rows,
      answers: { r1: false, r2: false },
      locked: false,
      wrongRowIds: ['r1'],
    }))

    expect(html).toContain('wrong-row')
    expect(html).toContain('Expected:')
  })
})

describe('scoring', () => {
  it('awards ten points and one star without mutating the old score', () => {
    const score = { points: 20, stars: 2 }
    expect(awardCorrectAnswer(score)).toEqual({ points: 30, stars: 3 })
    expect(score).toEqual({ points: 20, stars: 2 })
  })
})