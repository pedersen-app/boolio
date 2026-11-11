<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BoolioMascot from './components/BoolioMascot.vue'
import TruthTable from './components/TruthTable.vue'
import boolioAsset from './assets/boolio.svg'
import { generateQuestion } from './logic/questionGenerator'
import { awardCorrectAnswer } from './logic/scoring'
import type { Difficulty, Exercise, GameMode, GameScore, InferenceRule, LogicOperation, ScoreByMode } from './types/game'

const correctMessages = [
  'Amazing thinking! You got it!',
  'Great work! Boolio is so proud of you!',
  'You cracked the puzzle. High five!',
]
const modes: GameMode[] = ['practice', 'test']
const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'advanced', 'expert']
const inferenceRules: InferenceRule[] = ['conjunction']
const modeLabels: Record<GameMode, string> = {
  practice: 'Practice',
  test: 'Test',
}
const difficultyLabels: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  advanced: 'Advanced',
  expert: 'Expert',
}
const inferenceRuleLabels: Record<InferenceRule, string> = {
  conjunction: 'Conjunction (AND)',
}
const operationsByInferenceRuleAndDifficulty: Record<InferenceRule, Record<Difficulty, LogicOperation[]>> = {
  conjunction: {
    easy: ['AND'],
    medium: ['AND'],
    hard: ['AND'],
    advanced: ['AND'],
    expert: ['AND'],
  },
}

const mode = ref<GameMode>('practice')
const difficulty = ref<Difficulty>('easy')
const inferenceRule = ref<InferenceRule>('conjunction')
const isTestStarted = ref(false)
const scores = ref<ScoreByMode>(loadScores())
const exercise = ref<Exercise>(generateQuestion(nextOperation(mode.value), difficulty.value))
const answers = ref<Record<string, boolean>>({})
const feedback = ref('Pick TRUE or FALSE for each output box.')
const isCorrect = ref(false)
const activeScore = computed(() => scores.value[mode.value])
const allAnswered = computed(() =>
  exercise.value.missingRowIds.every((rowId) => answers.value[rowId] !== undefined),
)
const isInteractionLocked = computed(() =>
  isCorrect.value || (mode.value === 'test' && !isTestStarted.value),
)

watch(scores, (newScores) => {
  try {
    localStorage.setItem('boolio-scores', JSON.stringify(newScores))
  } catch {
    // The game still works if browser storage is unavailable.
  }
}, { deep: true })

watch([mode, difficulty, inferenceRule], ([nextMode, nextDifficulty, nextInferenceRule], [prevMode, prevDifficulty, prevInferenceRule]) => {
  if (nextMode !== prevMode) {
    if (nextMode === 'test') {
      isTestStarted.value = false
      resetRound('Press Start to begin test mode.')
      return
    }

    isTestStarted.value = false
    startNextQuestion()
    return
  }

  if (nextMode === 'practice') {
    if (nextDifficulty !== prevDifficulty || nextInferenceRule !== prevInferenceRule) {
      startNextQuestion()
    }
    return
  }

  if (nextDifficulty !== prevDifficulty) {
    isTestStarted.value = false
    resetRound('Difficulty updated. Press Start to begin test mode.')
  }
})

function loadScores(): ScoreByMode {
  const emptyScore: GameScore = { points: 0, stars: 0 }
  try {
    const savedScores = localStorage.getItem('boolio-scores')
    if (savedScores) {
      const parsed: unknown = JSON.parse(savedScores)
      if (typeof parsed === 'object' && parsed !== null && 'practice' in parsed && 'test' in parsed) {
        const practice = (parsed as { practice: unknown }).practice
        const test = (parsed as { test: unknown }).test
        if (isGameScore(practice) && isGameScore(test)) {
          return { practice, test }
        }
      }
    }

    const legacyScore = localStorage.getItem('boolio-score')
    if (legacyScore) {
      const parsedLegacy: unknown = JSON.parse(legacyScore)
      if (isGameScore(parsedLegacy)) {
        return { practice: parsedLegacy, test: emptyScore }
      }
    }
  } catch {
    // Ignore invalid or unavailable local storage.
  }
  return { practice: emptyScore, test: emptyScore }
}

function isGameScore(value: unknown): value is GameScore {
  return typeof value === 'object' && value !== null
    && 'points' in value && typeof value.points === 'number'
    && 'stars' in value && typeof value.stars === 'number'
}

function allowedOperations(currentInferenceRule: InferenceRule, currentDifficulty: Difficulty): LogicOperation[] {
  return operationsByInferenceRuleAndDifficulty[currentInferenceRule][currentDifficulty] ?? ['AND']
}

function availableInferenceRulesForDifficulty(currentDifficulty: Difficulty): InferenceRule[] {
  return inferenceRules.filter((rule) => allowedOperations(rule, currentDifficulty).length > 0)
}

function nextOperation(currentMode: GameMode) {
  const availableOperations = allowedOperations(inferenceRule.value, difficulty.value)
  const fallbackOperation = availableOperations[0] ?? 'AND'

  if (currentMode === 'practice') return fallbackOperation

  const index = Math.floor(Math.random() * availableOperations.length)
  return availableOperations[index] ?? fallbackOperation
}

function resetRound(message: string) {
  answers.value = {}
  isCorrect.value = false
  feedback.value = message
}

function startNextQuestion() {
  const questionOperation = nextOperation(mode.value)
  exercise.value = generateQuestion(
    questionOperation,
    difficulty.value,
    exercise.value?.id,
  )
  resetRound('Pick TRUE or FALSE for each output box.')
}

function startTestRound() {
  const availableRules = availableInferenceRulesForDifficulty(difficulty.value)
  const index = Math.floor(Math.random() * availableRules.length)
  inferenceRule.value = availableRules[index] ?? 'conjunction'
  isTestStarted.value = true
  startNextQuestion()
}

function selectAnswer(rowId: string, value: boolean) {
  if (isInteractionLocked.value) return
  answers.value = { ...answers.value, [rowId]: value }
  feedback.value = 'You can change your answers before checking.'
}

function checkAnswers() {
  if (isInteractionLocked.value || !allAnswered.value) return
  const correct = exercise.value.missingRowIds.every(
    (rowId) => answers.value[rowId] === exercise.value.answerKey[rowId],
  )

  if (correct) {
    scores.value = {
      ...scores.value,
      [mode.value]: awardCorrectAnswer(scores.value[mode.value]),
    }
    isCorrect.value = true
    feedback.value = correctMessages[Math.floor(Math.random() * correctMessages.length)] ?? correctMessages[0]!
    return
  }

  feedback.value = `Almost! ${exercise.value.ruleText} Have another go!`
}
</script>

<template>
  <div class="app-shell min-h-screen">
    <header class="topbar">
      <a class="brand" href="#top" aria-label="Boolio home">
        <img :src="boolioAsset" alt="" class="brand-mascot" />
        <span>boolio<span class="brand-period">.</span></span>
      </a>
      <div class="score-strip" :aria-label="`${mode} mode score`">
        <div class="score-item">
          <span class="score-icon points-icon" aria-hidden="true">✦</span>
          <span class="score-number">{{ activeScore.points }}</span>
          <span class="score-label">points</span>
        </div>
        <span class="score-divider" aria-hidden="true"></span>
        <div class="score-item">
          <span class="score-icon star-icon" aria-hidden="true">★</span>
          <span class="score-number">{{ activeScore.stars }}</span>
          <span class="score-label">stars</span>
        </div>
      </div>
    </header>

    <main id="top" class="main-content">
      <section class="intro-row" aria-labelledby="page-title">
        <div class="intro-copy">
          <p class="eyebrow"><span class="eyebrow-dot"></span> THE WOODLAND LOGIC CLUB</p>
          <h1 id="page-title">Little logic.<br /><span>Big ideas.</span></h1>
          <p class="intro-text">Help Boolio figure out what comes next. Ready, clever beaver?</p>
        </div>
        <div class="intro-stamp" aria-hidden="true">
          <span>THINK</span>
          <span class="stamp-spark">✳</span>
          <span>BUILD</span>
        </div>
      </section>

      <section class="play-layout" aria-label="Boolean logic puzzle">
        <div class="play-top-row">
          <div class="puzzle-panel puzzle-panel-top">
          <div class="puzzle-heading">
            <div>
              <p class="section-kicker">TODAY'S PUZZLE</p>
              <h2>Complete the truth table</h2>
            </div>
            <div class="session-controls">
              <label class="session-field" for="mode-select">
                <span class="session-label">Game mode</span>
                <select id="mode-select" v-model="mode" class="session-select" aria-label="Choose game mode">
                  <option v-for="value in modes" :key="value" :value="value">
                    {{ modeLabels[value] }}
                  </option>
                </select>
              </label>

              <label class="session-field" for="difficulty-select">
                <span class="session-label">Difficulty</span>
                <select id="difficulty-select" v-model="difficulty" class="session-select" aria-label="Choose difficulty">
                  <option v-for="level in difficulties" :key="level" :value="level">
                    {{ difficultyLabels[level] }}
                  </option>
                </select>
              </label>

              <label v-if="mode === 'practice'" class="session-field" for="inference-rule-select">
                <span class="session-label">Inference rule</span>
                <select id="inference-rule-select" v-model="inferenceRule" class="session-select" aria-label="Choose inference rule">
                  <option v-for="rule in inferenceRules" :key="rule" :value="rule">
                    {{ inferenceRuleLabels[rule] }}
                  </option>
                </select>
              </label>
              <div v-else class="session-field">
                <span class="session-label">Test round</span>
                <button type="button" class="session-start-button" @click="startTestRound">Start</button>
              </div>
            </div>
          </div>

          <div class="test-mode-note" aria-live="polite">
            <template v-if="mode === 'practice'">
              Practice mode uses the selected inference rule. Current inference rule: <strong>{{ inferenceRuleLabels[inferenceRule] }}</strong>
            </template>
            <template v-else-if="!isTestStarted">
              Press Start to choose an inference rule for this difficulty and begin your test round.
            </template>
            <template v-else>
              Test mode selected an inference rule for this difficulty. Current inference rule: <strong>{{ inferenceRuleLabels[inferenceRule] }}</strong>
            </template>
          </div>

          <div v-if="mode === 'practice' || isTestStarted" class="rule-line">
            <span class="rule-icon" aria-hidden="true">?</span>
            <p>{{ exercise.ruleText }}</p>
          </div>
          </div>

          <aside class="guide-panel" aria-label="Boolio's encouragement">
            <div class="guide-topline"><span class="guide-dot"></span> YOUR PUZZLE PAL</div>
            <BoolioMascot :mood="isCorrect ? 'cheering' : feedback.startsWith('Almost') ? 'encouraging' : 'thinking'" />
            <div class="speech-bubble" aria-live="polite">
              <span class="speech-tail" aria-hidden="true"></span>
              <p>{{ isCorrect ? 'That was some sharp thinking!' : feedback.startsWith('Almost') ? 'Mistakes help our brains grow. Try again!' : 'Let’s think it through together!' }}</p>
            </div>
            <div class="guide-bottom">
              <span class="guide-leaf" aria-hidden="true">✳</span>
              <p>Every great builder starts with one good idea.</p>
            </div>
          </aside>
        </div>

        <div class="puzzle-panel puzzle-panel-bottom">
          <div v-if="mode === 'practice' || isTestStarted" class="table-scroll">
            <TruthTable
              :input-labels="exercise.inputLabels"
              :rows="exercise.rows"
              :answers="answers"
              :locked="isInteractionLocked"
              @select="selectAnswer"
            />
          </div>

          <div class="puzzle-footer">
            <p class="feedback" :class="{ success: isCorrect }" aria-live="polite">
              <span class="feedback-mark" aria-hidden="true">{{ isCorrect ? '✦' : '•' }}</span>
              {{ feedback }}
            </p>
            <div v-if="mode === 'practice' || isTestStarted" class="action-row">
              <button
                v-if="!isCorrect"
                class="check-button transition-colors duration-150"
                type="button"
                :disabled="!allAnswered || isInteractionLocked"
                @click="checkAnswers"
              >
                Check answers <span aria-hidden="true">↗</span>
              </button>
              <button
                v-else
                class="check-button next-button transition-colors duration-150"
                type="button"
                @click="mode === 'test' ? startTestRound() : startNextQuestion()"
              >
                Next puzzle <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer class="page-footer">
        <span>Made for curious minds</span>
        <span class="footer-tree" aria-hidden="true">✳</span>
        <span>One puzzle at a time</span>
      </footer>
    </main>
  </div>
</template>
