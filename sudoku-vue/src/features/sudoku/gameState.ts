// src/features/sudoku/gameState.ts
import type { Grid, Digit, Rank, MaybeDigit } from './types'
import { cloneGrid, emptyGrid } from './types'
import { isValidPlacement, isSolved } from './validate'
import { generatePuzzle } from './generator'
import { solve } from './solver'

export interface GameState {
  // Grid state
  currentGrid: Grid
  originalGrid: Grid // Initial puzzle (cannot be changed)
  solutionGrid: Grid // Completely solved grid
  
  // Game info
  rank: Rank
  startTime: number
  endTime?: number
  isCompleted: boolean
  
  // Scoring
  score: number
  hintsUsed: number
  errorsCount: number
  
  // Hint system
  maxHints: number
  hintCost: number // Current cost of next hint
}

export interface GameResult {
  score: number
  timeElapsed: number
  hintsUsed: number
  errorsCount: number
  rank: Rank
  completed: boolean
}

/**
 * Creates new game
 */
export function createNewGame(rank: Rank): GameState {
  const puzzle = generatePuzzle(rank)
  const solution = cloneGrid(puzzle)
  
  // Solve puzzle to get solution
  solve(solution)
  
  return {
    currentGrid: cloneGrid(puzzle),
    originalGrid: cloneGrid(puzzle),
    solutionGrid: solution,
    rank,
    startTime: Date.now(),
    isCompleted: false,
    score: 0,
    hintsUsed: 0,
    errorsCount: 0,
    maxHints: 10,
    hintCost: 3, // First hint costs 3 points
  }
}

/**
 * Sets value in cell
 */
export function setCellValue(
  state: GameState,
  row: number,
  col: number,
  value: MaybeDigit
): GameState {
  // Don't allow editing original cells
  if (state.originalGrid[row]?.[col] !== null) {
    return state
  }
  
  const newState = { ...state }
  newState.currentGrid = cloneGrid(state.currentGrid)
  newState.currentGrid[row]![col] = value
  
  // Check if valid
  if (value !== null) {
    const isValid = isValidPlacement(newState.currentGrid, row, col, value as Digit)
    if (!isValid) {
      newState.errorsCount++
      newState.score = Math.max(0, newState.score - 1) // -1 point for error
    } else {
      newState.score += 5 // +5 points for correct cell
    }
  }
  
  // Check if game is completed
  if (value !== null && isSolved(newState.currentGrid)) {
    newState.isCompleted = true
    newState.endTime = Date.now()
    
    // Add time bonus
    const timeElapsed = Math.floor((newState.endTime - newState.startTime) / 1000)
    const timeBonus = Math.max(0, 500 - timeElapsed)
    newState.score += timeBonus
  }
  
  return newState
}

/**
 * Gives hint for specific cell
 */
export function getHint(
  state: GameState,
  row: number,
  col: number
): { success: boolean; value?: Digit; newState?: GameState } {
  // Check if hint can be given
  if (state.hintsUsed >= state.maxHints) {
    return { success: false }
  }
  
  // Don't allow hint for original cells
  if (state.originalGrid[row]?.[col] !== null) {
    return { success: false }
  }
  
  // Don't allow hint for already filled cells
  if (state.currentGrid[row]?.[col] !== null) {
    return { success: false }
  }
  
  const hintValue = state.solutionGrid[row]?.[col] as Digit
  if (!hintValue) {
    return { success: false }
  }
  
  const newState = { ...state }
  newState.hintsUsed++
  newState.score = Math.max(0, newState.score - newState.hintCost)
  newState.hintCost++ // Next hint costs more
  
  // Set hint value
  newState.currentGrid = cloneGrid(state.currentGrid)
  newState.currentGrid[row]![col] = hintValue
  newState.score += 5 // +5 points for correct cell
  
  // Check if game is completed
  if (isSolved(newState.currentGrid)) {
    newState.isCompleted = true
    newState.endTime = Date.now()
    
    // Add time bonus
    const timeElapsed = Math.floor((newState.endTime - newState.startTime) / 1000)
    const timeBonus = Math.max(0, 500 - timeElapsed)
    newState.score += timeBonus
  }
  
  return {
    success: true,
    value: hintValue,
    newState,
  }
}

/**
 * Returns current game time in seconds
 */
export function getCurrentTime(state: GameState): number {
  const endTime = state.endTime || Date.now()
  return Math.floor((endTime - state.startTime) / 1000)
}

/**
 * Returns game result
 */
export function getGameResult(state: GameState): GameResult {
  return {
    score: state.score,
    timeElapsed: getCurrentTime(state),
    hintsUsed: state.hintsUsed,
    errorsCount: state.errorsCount,
    rank: state.rank,
    completed: state.isCompleted,
  }
}

/**
 * Checks if cell is original (cannot be changed)
 */
export function isOriginalCell(state: GameState, row: number, col: number): boolean {
  return state.originalGrid[row]?.[col] !== null
}

/**
 * Returns available digits for entire game
 */
export function getAvailableDigits(state: GameState): { digit: Digit; isComplete: boolean }[] {
  const digitCounts = new Map<Digit, number>()
  
  // Count how many times each digit appears
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const value = state.currentGrid[r]?.[c]
      if (value !== null) {
        digitCounts.set(value, (digitCounts.get(value) || 0) + 1)
      }
    }
  }
  
  // Return all digits with completion status
  const result: { digit: Digit; isComplete: boolean }[] = []
  for (let d = 1 as Digit; d <= 9; d = (d + 1) as Digit) {
    const count = digitCounts.get(d) || 0
    result.push({
      digit: d,
      isComplete: count === 9, // Complete if appears 9 times
    })
  }
  
  return result
}
