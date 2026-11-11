import { describe, expect, it } from 'vitest'
import { createTruthTable, evaluateGate } from './gates'
import { generateQuestion } from './questionGenerator'
import { awardCorrectAnswer } from './scoring'

describe('Boolean gates', () => {
  it.each([
    ['AND', [false, false], false],
    ['AND', [false, true], false],
    ['AND', [true, false], false],
    ['AND', [true, true], true],
    ['OR', [false, false], false],
    ['OR', [false, true], true],
    ['OR', [true, false], true],
    ['OR', [true, true], true],
    ['NOT', [false], true],
    ['NOT', [true], false],
    ['XOR', [false, false], false],
    ['XOR', [false, true], true],
    ['XOR', [true, false], true],
    ['XOR', [true, true], false],
  ] as const)('%s %j evaluates to %s', (operation, inputs, output) => {
    expect(evaluateGate(operation, inputs)).toBe(output)
  })

  it('creates two rows for NOT and four rows for binary gates', () => {
    expect(createTruthTable('NOT')).toHaveLength(2)
    expect(createTruthTable('XOR')).toHaveLength(4)
  })
})

describe('question generation', () => {
  it('requires answers for every easy row while keeping the answer key separate', () => {
    const exercise = generateQuestion('AND', 'easy', undefined, () => 0)
    expect(exercise.missingRowIds).toHaveLength(exercise.rows.length)
    expect(exercise.rows.filter((row) => row.output === null)).toHaveLength(exercise.rows.length)
    expect(Object.keys(exercise.answerKey)).toHaveLength(4)
  })

  it('requires answers for every medium row and keeps every generated answer correct', () => {
    const exercise = generateQuestion('XOR', 'medium', undefined, () => 0)
    expect(exercise.missingRowIds).toHaveLength(exercise.rows.length)
    for (const row of exercise.rows) {
      const expected = row.inputs[0] !== row.inputs[1]
      expect(exercise.answerKey[row.id]).toBe(expected)
    }
  })
})

describe('scoring', () => {
  it('awards ten points and one star without mutating the old score', () => {
    const score = { points: 20, stars: 2 }
    expect(awardCorrectAnswer(score)).toEqual({ points: 30, stars: 3 })
    expect(score).toEqual({ points: 20, stars: 2 })
  })
})