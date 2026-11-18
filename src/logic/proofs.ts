import type { Difficulty } from '../types/game'

export type ProofRule = 'modus-ponens' | 'modus-tollens' | 'disjunctive-syllogism' | 'double-negation' | 'multi-step'

type ProofDifficulty = Exclude<Difficulty, 'easy'>

export interface ProofExercise {
  id: string
  kind: 'proof'
  difficulty: ProofDifficulty
  premises: string[]
  conclusion: string
  options: string[]
  proofAnswer: string
  ruleText: string
  rule: ProofRule
}

type RandomSource = () => number

interface ProofTemplate {
  id: string
  rule: ProofRule
  premises: string[]
  conclusion: string
  ruleText?: string
}

const coreProofTemplates: readonly ProofTemplate[] = [
  {
    id: 'mp-basic',
    rule: 'modus-ponens' as const,
    premises: ['P → Q', 'P'],
    conclusion: 'Q',
  },
  {
    id: 'mt-basic',
    rule: 'modus-tollens' as const,
    premises: ['P → Q', '¬Q'],
    conclusion: '¬P',
  },
  {
    id: 'ds-basic',
    rule: 'disjunctive-syllogism' as const,
    premises: ['P ∨ Q', '¬P'],
    conclusion: 'Q',
  },
  {
    id: 'dn-basic',
    rule: 'double-negation' as const,
    premises: ['¬¬P'],
    conclusion: 'P',
  },
] as const

const extendedOneStepTemplates: readonly ProofTemplate[] = [
  ...coreProofTemplates,
  {
    id: 'mp-alt',
    rule: 'modus-ponens',
    premises: ['R → S', 'R'],
    conclusion: 'S',
  },
  {
    id: 'mt-alt',
    rule: 'modus-tollens',
    premises: ['X → Y', '¬Y'],
    conclusion: '¬X',
  },
  {
    id: 'ds-alt',
    rule: 'disjunctive-syllogism',
    premises: ['P ∨ Q', '¬Q'],
    conclusion: 'P',
  },
  {
    id: 'dn-alt',
    rule: 'double-negation',
    premises: ['T'],
    conclusion: '¬¬T',
  },
] as const

const mediumBridgeTemplates: readonly ProofTemplate[] = [
  {
    id: 'bridge-mp-chain',
    rule: 'multi-step',
    premises: ['P → Q', 'Q → R', 'P'],
    conclusion: 'R',
    ruleText: 'Chain two inferences: use Modus Ponens twice (P → Q, then Q → R).',
  },
  {
    id: 'bridge-ds-mp',
    rule: 'multi-step',
    premises: ['P ∨ Q', '¬P', 'Q → R'],
    conclusion: 'R',
    ruleText: 'Use Disjunctive Syllogism to get Q, then Modus Ponens to conclude R.',
  },
  {
    id: 'bridge-dn-mp',
    rule: 'multi-step',
    premises: ['¬¬P', 'P → Q'],
    conclusion: 'Q',
    ruleText: 'Use Double Negation to derive P, then Modus Ponens to conclude Q.',
  },
] as const

const hardMultiStepTemplates: readonly ProofTemplate[] = [
  {
    id: 'hard-chain-1',
    rule: 'multi-step',
    premises: ['P → Q', 'Q → R', 'R → S', 'P'],
    conclusion: 'S',
    ruleText: 'Apply a three-link Modus Ponens chain from P to S.',
  },
  {
    id: 'hard-mixed-1',
    rule: 'multi-step',
    premises: ['P ∨ Q', '¬P', 'Q → R', 'R → S'],
    conclusion: 'S',
    ruleText: 'Use Disjunctive Syllogism, then chain two Modus Ponens steps.',
  },
  {
    id: 'hard-mixed-2',
    rule: 'multi-step',
    premises: ['¬¬P', 'P → Q', 'Q → R'],
    conclusion: 'R',
    ruleText: 'Use Double Negation first, then two Modus Ponens steps.',
  },
] as const

const coreTemplateOrder = shuffle([...coreProofTemplates])
const extendedOneStepOrder = shuffle([...extendedOneStepTemplates])
const mediumBridgeOrder = shuffle([...mediumBridgeTemplates])
const hardMultiStepOrder = shuffle([...hardMultiStepTemplates])

const coreTemplateCycle = new Map<ProofDifficulty, number>()
const extendedOneStepCycle = new Map<ProofDifficulty, number>()
const mediumBridgeCycle = new Map<ProofDifficulty, number>()
const hardMultiStepCycle = new Map<ProofDifficulty, number>()

function shuffle<T>(values: T[]): T[] {
  const shuffled = [...values]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex]!, shuffled[index]!]
  }
  return shuffled
}

function nextTemplate(
  cycle: Map<ProofDifficulty, number>,
  order: readonly ProofTemplate[],
  difficulty: ProofDifficulty,
): ProofTemplate {
  const currentIndex = cycle.get(difficulty) ?? 0
  const template = order[currentIndex % order.length] ?? order[0]!
  cycle.set(difficulty, currentIndex + 1)
  return template
}

function proofRuleText(rule: ProofRule): string {
  if (rule === 'multi-step') return 'Use multiple valid inference moves to reach the conclusion.'
  return `Apply ${rule.replace('-', ' ')} to the premises.`
}

interface ProofGenerationOptions {
  allowMediumBridge?: boolean
  random?: RandomSource
}

export function generateMediumProofExercise(
  difficulty: ProofDifficulty,
  options: ProofGenerationOptions = {},
): ProofExercise {
  const random = options.random ?? Math.random
  const allowMediumBridge = options.allowMediumBridge ?? false

  let template: ProofTemplate
  if (difficulty === 'medium') {
    const shouldUseBridge = allowMediumBridge && random() < 0.25
    template = shouldUseBridge
      ? nextTemplate(mediumBridgeCycle, mediumBridgeOrder, difficulty)
      : nextTemplate(coreTemplateCycle, coreTemplateOrder, difficulty)
  } else {
    const shouldUseMultiStep = difficulty === 'hard' ? true : random() < 0.8
    template = shouldUseMultiStep
      ? nextTemplate(hardMultiStepCycle, hardMultiStepOrder, difficulty)
      : nextTemplate(extendedOneStepCycle, extendedOneStepOrder, difficulty)
  }

  const conclusionPool = [
    ...coreProofTemplates,
    ...extendedOneStepTemplates,
    ...mediumBridgeTemplates,
    ...hardMultiStepTemplates,
  ]
  const uniqueConclusions = [...new Set(conclusionPool.map((entry) => entry.conclusion))]
  const incorrectOptions = shuffle(
    uniqueConclusions.filter((conclusion) => conclusion !== template.conclusion),
  ).slice(0, Math.min(2, uniqueConclusions.length - 1))

  const answerOptions = shuffle([template.conclusion, ...incorrectOptions])

  return {
    id: `proof:${difficulty}:${template.id}`,
    kind: 'proof',
    difficulty,
    premises: [...template.premises],
    conclusion: template.conclusion,
    options: answerOptions,
    proofAnswer: template.conclusion,
    ruleText: template.ruleText ?? proofRuleText(template.rule),
    rule: template.rule,
  }
}
