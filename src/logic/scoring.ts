import type { GameScore } from '../types/game'

export function awardCorrectAnswer(score: GameScore): GameScore {
  return { points: score.points + 10, stars: score.stars + 1 }
}