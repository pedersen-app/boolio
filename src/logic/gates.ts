import type { LogicOperation, TruthTableRow } from '../types/game'

export const logicOperations: LogicOperation[] = ['AND', 'OR', 'NOT', 'XOR']

export function evaluateGate(operation: LogicOperation, inputs: readonly boolean[]): boolean {
  switch (operation) {
    case 'AND': return inputs[0] === true && inputs[1] === true
    case 'OR': return inputs[0] === true || inputs[1] === true
    case 'NOT': return inputs[0] !== true
    case 'XOR': return inputs[0] !== inputs[1]
  }
}

export function createTruthTable(operation: LogicOperation): TruthTableRow[] {
  const inputCombinations = operation === 'NOT'
    ? [[false], [true]]
    : [[false, false], [false, true], [true, false], [true, true]]

  return inputCombinations.map((inputs) => ({
    id: inputs.map(String).join('-'),
    inputs,
    output: evaluateGate(operation, inputs),
  }))
}