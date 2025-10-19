import { describe, it, expect, beforeEach } from 'vitest'
import { Rank } from '../../src/features/sudoku/types'
import {
  loadLeaderboard,
  saveLeaderboard,
  addToLeaderboard,
  calculateFinalScore,
  formatTime,
  formatScore,
  getScoreRank,
  isLeaderboardWorthy,
} from '../../src/features/sudoku/scoring'
import type { GameResult, Leaderboard } from '../../src/features/sudoku/scoring'

describe('scoring', () => {
  beforeEach(() => {
    // Očisti localStorage
    localStorage.clear()
  })

  it('loads empty leaderboard when none exists', () => {
    const leaderboard = loadLeaderboard()
    
    expect(leaderboard.beginner).toHaveLength(0)
    expect(leaderboard.intermediate).toHaveLength(0)
    expect(leaderboard.hard).toHaveLength(0)
    expect(leaderboard.expert).toHaveLength(0)
  })

  it('saves and loads leaderboard correctly', () => {
    const leaderboard: Leaderboard = {
      beginner: [
        {
          id: '1',
          score: 1000,
          timeElapsed: 120,
          rank: Rank.Beginner,
          hintsUsed: 2,
          errorsCount: 1,
          date: '2024-01-01T00:00:00.000Z',
        },
      ],
      intermediate: [],
      hard: [],
      expert: [],
    }
    
    saveLeaderboard(leaderboard)
    const loaded = loadLeaderboard()
    
    expect(loaded).toEqual(leaderboard)
  })

  it('adds completed game to leaderboard', () => {
    const leaderboard = loadLeaderboard()
    const result: GameResult = {
      score: 800,
      timeElapsed: 180,
      hintsUsed: 3,
      errorsCount: 2,
      rank: Rank.Beginner,
      completed: true,
    }
    
    const updated = addToLeaderboard(leaderboard, result)
    expect(updated.beginner).toHaveLength(1)
    expect(updated.beginner[0]?.score).toBe(800)
  })

  it('does not add incomplete game to leaderboard', () => {
    const leaderboard = loadLeaderboard()
    const result: GameResult = {
      score: 800,
      timeElapsed: 180,
      hintsUsed: 3,
      errorsCount: 2,
      rank: Rank.Beginner,
      completed: false,
    }
    
    const updated = addToLeaderboard(leaderboard, result)
    expect(updated.beginner).toHaveLength(0)
  })

  it('maintains top 3 entries only', () => {
    let leaderboard = loadLeaderboard()
    
    // Dodaj 5 rezultata
    for (let i = 0; i < 5; i++) {
      const result: GameResult = {
        score: 1000 - i * 100,
        timeElapsed: 120,
        hintsUsed: 0,
        errorsCount: 0,
        rank: Rank.Beginner,
        completed: true,
      }
      leaderboard = addToLeaderboard(leaderboard, result)
    }
    
    expect(leaderboard.beginner).toHaveLength(3)
    expect(leaderboard.beginner[0]?.score).toBe(1000) // Najbolji
    expect(leaderboard.beginner[2]?.score).toBe(800) // Najgori od top 3
  })

  it('calculates final score correctly', () => {
    const result: GameResult = {
      score: 400,
      timeElapsed: 120,
      hintsUsed: 2,
      errorsCount: 1,
      rank: Rank.Beginner,
      completed: true,
    }
    
    const finalScore = calculateFinalScore(result)
    expect(finalScore).toBe(780) // 400 + (500 - 120)
  })

  it('formats time correctly', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(59)).toBe('0:59')
    expect(formatTime(60)).toBe('1:00')
    expect(formatTime(125)).toBe('2:05')
  })

  it('formats score correctly', () => {
    expect(formatScore(1234)).toBe('1,234')
    expect(formatScore(0)).toBe('0')
    expect(formatScore(1000000)).toBe('1,000,000')
  })

  it('returns correct score rank', () => {
    expect(getScoreRank(1200)).toBe('Master')
    expect(getScoreRank(900)).toBe('Expert')
    expect(getScoreRank(700)).toBe('Advanced')
    expect(getScoreRank(500)).toBe('Intermediate')
    expect(getScoreRank(300)).toBe('Beginner')
    expect(getScoreRank(100)).toBe('Novice')
  })

  it('identifies leaderboard worthy results', () => {
    let leaderboard = loadLeaderboard()
    
    // Dodaj 3 rezultata da popunimo leaderboard
    leaderboard = addToLeaderboard(leaderboard, {
      score: 1000,
      timeElapsed: 120,
      hintsUsed: 0,
      errorsCount: 0,
      rank: Rank.Beginner,
      completed: true,
    })
    
    leaderboard = addToLeaderboard(leaderboard, {
      score: 800,
      timeElapsed: 150,
      hintsUsed: 1,
      errorsCount: 0,
      rank: Rank.Beginner,
      completed: true,
    })
    
    leaderboard = addToLeaderboard(leaderboard, {
      score: 600,
      timeElapsed: 180,
      hintsUsed: 2,
      errorsCount: 1,
      rank: Rank.Beginner,
      completed: true,
    })
    
    // Rezultat bolji od najgoreg
    const goodResult: GameResult = {
      score: 700,
      timeElapsed: 130,
      hintsUsed: 0,
      errorsCount: 0,
      rank: Rank.Beginner,
      completed: true,
    }
    
    expect(isLeaderboardWorthy(leaderboard, goodResult)).toBe(true)
    
    // Rezultat gori od najgoreg
    const badResult: GameResult = {
      score: 500,
      timeElapsed: 200,
      hintsUsed: 3,
      errorsCount: 2,
      rank: Rank.Beginner,
      completed: true,
    }
    
    expect(isLeaderboardWorthy(leaderboard, badResult)).toBe(false)
  })
})
