// src/features/sudoku/scoring.ts
import type { Rank } from './types'
import type { GameResult } from './gameState'

export interface LeaderboardEntry {
  id: string
  score: number
  timeElapsed: number
  rank: Rank
  hintsUsed: number
  errorsCount: number
  date: string
}

export interface Leaderboard {
  beginner: LeaderboardEntry[]
  intermediate: LeaderboardEntry[]
  hard: LeaderboardEntry[]
  expert: LeaderboardEntry[]
}

const LEADERBOARD_KEY = 'sudoku-leaderboard'
const MAX_LEADERBOARD_ENTRIES = 3

/**
 * Loads leaderboard from localStorage
 */
export function loadLeaderboard(): Leaderboard {
  try {
    const stored = localStorage.getItem(LEADERBOARD_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.warn('Failed to load leaderboard:', error)
  }
  
  return {
    beginner: [],
    intermediate: [],
    hard: [],
    expert: [],
  }
}

/**
 * Saves leaderboard to localStorage
 */
export function saveLeaderboard(leaderboard: Leaderboard): void {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard))
  } catch (error) {
    console.warn('Failed to save leaderboard:', error)
  }
}

/**
 * Adds new result to leaderboard
 */
export function addToLeaderboard(
  leaderboard: Leaderboard,
  result: GameResult
): Leaderboard {
  if (!result.completed) {
    return leaderboard // Only completed games go to leaderboard
  }
  
  const newEntry: LeaderboardEntry = {
    id: generateId(),
    score: result.score,
    timeElapsed: result.timeElapsed,
    rank: result.rank,
    hintsUsed: result.hintsUsed,
    errorsCount: result.errorsCount,
    date: new Date().toISOString(),
  }
  
  const rankKey = result.rank as keyof Leaderboard
  const currentEntries = leaderboard[rankKey]
  
  // Add new entry
  const updatedEntries = [...currentEntries, newEntry]
    .sort((a, b) => b.score - a.score) // Sort by score (descending)
    .slice(0, MAX_LEADERBOARD_ENTRIES) // Keep only top 3
  
  return {
    ...leaderboard,
    [rankKey]: updatedEntries,
  }
}

/**
 * Generates unique ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Calculates final score based on result
 */
export function calculateFinalScore(result: GameResult): number {
  // Part 1: Base score (already calculated in gameState)
  let score = result.score
  
  // Part 2: Time bonus
  const timeBonus = Math.max(0, 500 - result.timeElapsed)
  score += timeBonus
  
  return Math.max(0, score) // Score cannot be negative
}

/**
 * Formats time in readable format
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Formats score with separators
 */
export function formatScore(score: number): string {
  return score.toLocaleString()
}

/**
 * Returns rank based on score
 */
export function getScoreRank(score: number): string {
  if (score >= 1000) return 'Master'
  if (score >= 800) return 'Expert'
  if (score >= 600) return 'Advanced'
  if (score >= 400) return 'Intermediate'
  if (score >= 200) return 'Beginner'
  return 'Novice'
}

/**
 * Checks if result is good enough for leaderboard
 */
export function isLeaderboardWorthy(
  leaderboard: Leaderboard,
  result: GameResult
): boolean {
  if (!result.completed) return false
  
  const rankKey = result.rank as keyof Leaderboard
  const currentEntries = leaderboard[rankKey]
  
  // If less than 3 entries, automatically good enough
  if (currentEntries.length < MAX_LEADERBOARD_ENTRIES) return true
  
  // Check if score is better than worst in leaderboard
  const worstScore = currentEntries[currentEntries.length - 1]?.score || 0
  return result.score > worstScore
}

