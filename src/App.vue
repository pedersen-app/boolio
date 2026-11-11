<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BoolioMascot from './components/BoolioMascot.vue'
import OperationSelector from './components/OperationSelector.vue'
import TruthTable from './components/TruthTable.vue'
import { generateQuestion } from './logic/questionGenerator'
import { awardCorrectAnswer } from './logic/scoring'
import type { Difficulty, Exercise, GameScore, LogicOperation } from './types/game'

const correctMessages = [
  'Amazing thinking! You got it!',
  'Great work! Boolio is so proud of you!',
  'You cracked the puzzle. High five!',
]
const difficulties: Difficulty[] = ['easy', 'medium']

const operation = ref<LogicOperation>('AND')
const difficulty = ref<Difficulty>('easy')
const score = ref<GameScore>(loadScore())
const exercise = ref<Exercise>(generateQuestion(operation.value, difficulty.value))
const answers = ref<Record<string, boolean>>({})
const feedback = ref('Pick TRUE or FALSE for each empty box.')
const isCorrect = ref(false)
const allAnswered = computed(() =>
  exercise.value.missingRowIds.every((rowId) => answers.value[rowId] !== undefined),
)

watch(score, (newScore) => {
  try {
    localStorage.setItem('boolio-score', JSON.stringify(newScore))
  } catch {
    // The game still works if browser storage is unavailable.
  }
}, { deep: true })

watch([operation, difficulty], () => startNextQuestion())

function loadScore(): GameScore {
  try {
    const saved = localStorage.getItem('boolio-score')
    if (saved) {
      const parsed: unknown = JSON.parse(saved)
      if (
        typeof parsed === 'object' && parsed !== null &&
        'points' in parsed && typeof parsed.points === 'number' &&
        'stars' in parsed && typeof parsed.stars === 'number'
      ) {
        return { points: parsed.points, stars: parsed.stars }
      }
    }
  } catch {
    // Ignore invalid or unavailable local storage.
  }
  return { points: 0, stars: 0 }
}

function startNextQuestion() {
  exercise.value = generateQuestion(
    operation.value,
    difficulty.value,
    exercise.value?.id,
  )
  answers.value = {}
  isCorrect.value = false
  feedback.value = 'Pick TRUE or FALSE for each empty box.'
}

function selectAnswer(rowId: string, value: boolean) {
  if (isCorrect.value) return
  answers.value = { ...answers.value, [rowId]: value }
  feedback.value = 'You can change your answers before checking.'
}

function checkAnswers() {
  if (!allAnswered.value || isCorrect.value) return
  const correct = exercise.value.missingRowIds.every(
    (rowId) => answers.value[rowId] === exercise.value.answerKey[rowId],
  )

  if (correct) {
    score.value = awardCorrectAnswer(score.value)
    isCorrect.value = true
    feedback.value = correctMessages[Math.floor(Math.random() * correctMessages.length)] ?? correctMessages[0]!
    return
  }

  feedback.value = `Almost! ${operationHint(operation.value)}`
}

function operationHint(selectedOperation: LogicOperation) {
  switch (selectedOperation) {
    case 'AND': return 'AND is true only when both answers are true. Have another go!'
    case 'OR': return 'OR is true when at least one answer is true. Have another go!'
    case 'NOT': return 'NOT flips the answer: true becomes false. Have another go!'
    case 'XOR': return 'XOR is true when the answers are different. Have another go!'
  }
}
</script>

<template>
  <div class="app-shell min-h-screen">
    <header class="topbar">
      <a class="brand" href="#top" aria-label="Boolio home">
        <img src="/boolio.svg" alt="" class="brand-mascot" />
        <span>boolio<span class="brand-period">.</span></span>
      </a>
      <div class="score-strip" aria-label="Your session score">
        <div class="score-item">
          <span class="score-icon points-icon" aria-hidden="true">✦</span>
          <span class="score-number">{{ score.points }}</span>
          <span class="score-label">points</span>
        </div>
        <span class="score-divider" aria-hidden="true"></span>
        <div class="score-item">
          <span class="score-icon star-icon" aria-hidden="true">★</span>
          <span class="score-number">{{ score.stars }}</span>
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
        <div class="puzzle-panel">
          <div class="puzzle-heading">
            <div>
              <p class="section-kicker">TODAY'S PUZZLE</p>
              <h2>Complete the truth table</h2>
            </div>
            <div class="level-control" aria-label="Choose difficulty">
              <button
                v-for="level in difficulties"
                :key="level"
                type="button"
                :aria-pressed="difficulty === level"
                :class="{ active: difficulty === level }"
                @click="difficulty = level"
              >
                {{ level }}
              </button>
            </div>
          </div>

          <OperationSelector v-model="operation" />

          <div class="rule-line">
            <span class="rule-icon" aria-hidden="true">?</span>
            <p v-if="operation === 'AND'">AND is true only when <strong>both</strong> are true.</p>
            <p v-else-if="operation === 'OR'">OR is true when <strong>at least one</strong> is true.</p>
            <p v-else-if="operation === 'NOT'">NOT <strong>flips</strong> the answer around.</p>
            <p v-else>XOR is true when the answers are <strong>different</strong>.</p>
          </div>

          <div class="table-scroll">
            <TruthTable
              :operation="operation"
              :rows="exercise.rows"
              :missing-row-ids="exercise.missingRowIds"
              :answers="answers"
              :locked="isCorrect"
              @select="selectAnswer"
            />
          </div>

          <div class="puzzle-footer">
            <p class="feedback" :class="{ success: isCorrect }" aria-live="polite">
              <span class="feedback-mark" aria-hidden="true">{{ isCorrect ? '✦' : '•' }}</span>
              {{ feedback }}
            </p>
            <div class="action-row">
              <button
                v-if="!isCorrect"
                class="check-button transition-colors duration-150"
                type="button"
                :disabled="!allAnswered"
                @click="checkAnswers"
              >
                Check answers <span aria-hidden="true">↗</span>
              </button>
              <button
                v-else
                class="check-button next-button transition-colors duration-150"
                type="button"
                @click="startNextQuestion"
              >
                Next puzzle <span aria-hidden="true">→</span>
              </button>
            </div>
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
      </section>

      <footer class="page-footer">
        <span>Made for curious minds</span>
        <span class="footer-tree" aria-hidden="true">✳</span>
        <span>One puzzle at a time</span>
      </footer>
    </main>
  </div>
</template>
