import { h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'
import ConjunctionTruthTable from '../components/inference-rules/ConjunctionTruthTable.vue'
import { createOperationTruthTable, evaluateOperation } from './operations'
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
})

describe('table rendering', () => {
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