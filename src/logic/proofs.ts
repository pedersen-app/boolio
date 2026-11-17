export type ProofRule = 'modus-ponens' | 'modus-tollens' | 'disjunctive-syllogism' | 'double-negation'

export interface ProofExercise {
  id: string
  kind: 'proof'
  difficulty: 'medium' | 'hard' | 'advanced' | 'expert'
  premises: string[]
  conclusion: string
  options: string[]
  proofAnswer: string
  ruleText: string
  rule: ProofRule
}

const proofTemplates = [
  {
    rule: 'modus-ponens' as const,
    premises: ['P → Q', 'P'],
    conclusion: 'Q',
  },
  {
    rule: 'modus-tollens' as const,
    premises: ['P → Q', '¬Q'],
    conclusion: '¬P',
  },
  {
    rule: 'disjunctive-syllogism' as const,
    premises: ['P ∨ Q', '¬P'],
    conclusion: 'Q',
  },
  {
    rule: 'double-negation' as const,
    premises: ['¬¬P'],
    conclusion: 'P',
  },
] as const

const proofTemplateOrder = shuffle([...proofTemplates])
const proofTemplateCycle = new Map<ProofExercise['difficulty'], number>()

function shuffle<T>(values: T[]): T[] {
  const shuffled = [...values]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex]!, shuffled[index]!]
  }
  return shuffled
}

export function generateMediumProofExercise(difficulty: ProofExercise['difficulty']): ProofExercise {
  const currentIndex = proofTemplateCycle.get(difficulty) ?? 0
  const template = proofTemplateOrder[currentIndex % proofTemplateOrder.length] ?? proofTemplateOrder[0]!
  proofTemplateCycle.set(difficulty, currentIndex + 1)

  const uniqueConclusions = [...new Set(proofTemplates.map((entry) => entry.conclusion))]
  const incorrectOptions = shuffle(
    uniqueConclusions.filter((conclusion) => conclusion !== template.conclusion),
  ).slice(0, Math.min(2, uniqueConclusions.length - 1))

  const options = shuffle([template.conclusion, ...incorrectOptions])

  return {
    id: `proof:${difficulty}:${template.rule}:${template.conclusion}`,
    kind: 'proof',
    difficulty,
    premises: [...template.premises],
    conclusion: template.conclusion,
    options,
    proofAnswer: template.conclusion,
    ruleText: `Apply ${template.rule.replace('-', ' ')} to the premises.`,
    rule: template.rule,
  }
}
