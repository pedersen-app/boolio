import type { LogicOperation, TruthTableRow } from '../types/game'

export const supportedOperations: LogicOperation[] = ['AND', 'OR', 'NOT', 'XOR', 'IMPLIES', 'MODUS_TOLLENS', 'DISJUNCTIVE_SYLLOGISM', 'DOUBLE_NEGATION']

export function evaluateOperation(operation: LogicOperation, inputs: readonly boolean[]): boolean {
  switch (operation) {
    case 'AND': return inputs[0] === true && inputs[1] === true
    case 'OR': return inputs[0] === true || inputs[1] === true
    case 'IMPLIES': return inputs[0] !== true || inputs[1] === true
    case 'MODUS_TOLLENS': return inputs[1] === true || inputs[0] !== true
    case 'DISJUNCTIVE_SYLLOGISM': return inputs[1] === true
    case 'DOUBLE_NEGATION': return inputs[0] === true
    case 'NOT': return inputs[0] !== true
    case 'XOR': return inputs[0] !== inputs[1]
  }
}

export function createOperationTruthTable(operation: LogicOperation): TruthTableRow[] {
  const inputCombinations = operation === 'NOT' || operation === 'DOUBLE_NEGATION'
    ? [[false], [true]]
    : [[false, false], [false, true], [true, false], [true, true]]

  return inputCombinations.map((inputs) => ({
    id: inputs.map(String).join('-'),
    inputs,
    output: evaluateOperation(operation, inputs),
  }))
}