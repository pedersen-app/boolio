import type { LogicOperation, TruthTableRow } from '../types/game'

export const supportedOperations: LogicOperation[] = ['AND', 'OR', 'NOT', 'XOR', 'IMPLIES']

export function evaluateOperation(operation: LogicOperation, inputs: readonly boolean[]): boolean {
  switch (operation) {
    case 'AND': return inputs[0] === true && inputs[1] === true
    case 'OR': return inputs[0] === true || inputs[1] === true
    case 'IMPLIES': return inputs[0] !== true || inputs[1] === true
    case 'NOT': return inputs[0] !== true
    case 'XOR': return inputs[0] !== inputs[1]
  }
}

export function createOperationTruthTable(operation: LogicOperation): TruthTableRow[] {
  const inputCombinations = operation === 'NOT'
    ? [[false], [true]]
    : [[false, false], [false, true], [true, false], [true, true]]

  return inputCombinations.map((inputs) => ({
    id: inputs.map(String).join('-'),
    inputs,
    output: evaluateOperation(operation, inputs),
  }))
}