import { describe, it, expect } from 'vitest'
import { Rank } from '../../src/features/sudoku/types'
import {
  createNewGame,
  setCellValue,
  getHint,
  getCurrentTime,
  getGameResult,
  isOriginalCell,
  getAvailableDigits,
} from '../../src/features/sudoku/gameState'
import { isSolved } from '../../src/features/sudoku/validate'

describe('gameState', () => {
  it('creates new game with correct initial state', () => {
    const game = createNewGame(Rank.Beginner)
    
    expect(game.rank).toBe(Rank.Beginner)
    expect(game.isCompleted).toBe(false)
    expect(game.score).toBe(0)
    expect(game.hintsUsed).toBe(0)
    expect(game.errorsCount).toBe(0)
    expect(game.maxHints).toBe(10)
    expect(game.hintCost).toBe(3)
    expect(game.startTime).toBeGreaterThan(0)
    expect(game.endTime).toBeUndefined()
  })

  it('prevents editing original cells', () => {
    const game = createNewGame(Rank.Beginner)
    
    // Pronađi originalnu ćeliju
    let originalRow = -1
    let originalCol = -1
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (game.originalGrid[r]?.[c] !== null) {
          originalRow = r
          originalCol = c
          break
        }
      }
      if (originalRow !== -1) break
    }
    
    expect(originalRow).toBeGreaterThanOrEqual(0)
    expect(originalCol).toBeGreaterThanOrEqual(0)
    
    const newGame = setCellValue(game, originalRow, originalCol, 5)
    expect(newGame).toBe(game) // State se ne menja
  })

  it('allows editing empty cells', () => {
    const game = createNewGame(Rank.Beginner)
    
    // Pronađi praznu ćeliju
    let emptyRow = -1
    let emptyCol = -1
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (game.currentGrid[r]?.[c] === null) {
          emptyRow = r
          emptyCol = c
          break
        }
      }
      if (emptyRow !== -1) break
    }
    
    expect(emptyRow).toBeGreaterThanOrEqual(0)
    expect(emptyCol).toBeGreaterThanOrEqual(0)
    
    const newGame = setCellValue(game, emptyRow, emptyCol, 5)
    expect(newGame).not.toBe(game) // State se menja
    expect(newGame.currentGrid[emptyRow]?.[emptyCol]).toBe(5)
  })

  it('gives hint correctly', () => {
    const game = createNewGame(Rank.Beginner)
    
    // Pronađi praznu ćeliju
    let emptyRow = -1
    let emptyCol = -1
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (game.currentGrid[r]?.[c] === null) {
          emptyRow = r
          emptyCol = c
          break
        }
      }
      if (emptyRow !== -1) break
    }
    
    const hintResult = getHint(game, emptyRow, emptyCol)
    expect(hintResult.success).toBe(true)
    expect(hintResult.value).toBeDefined()
    expect(hintResult.newState).toBeDefined()
    expect(hintResult.newState?.hintsUsed).toBe(1)
    expect(hintResult.newState?.hintCost).toBe(4) // Sledeći hint košta više
  })

  it('prevents hint for original cells', () => {
    const game = createNewGame(Rank.Beginner)
    
    // Pronađi originalnu ćeliju
    let originalRow = -1
    let originalCol = -1
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (game.originalGrid[r]?.[c] !== null) {
          originalRow = r
          originalCol = c
          break
        }
      }
      if (originalRow !== -1) break
    }
    
    const hintResult = getHint(game, originalRow, originalCol)
    expect(hintResult.success).toBe(false)
  })

  it('tracks time correctly', async () => {
    const game = createNewGame(Rank.Beginner)
    const time1 = getCurrentTime(game)
    
    // Sačekaj malo
    await new Promise(resolve => setTimeout(resolve, 50))
    const time2 = getCurrentTime(game)
    expect(time2).toBeGreaterThanOrEqual(time1)
  })

  it('identifies original cells correctly', () => {
    const game = createNewGame(Rank.Beginner)
    
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const isOriginal = isOriginalCell(game, r, c)
        const hasOriginalValue = game.originalGrid[r]?.[c] !== null
        expect(isOriginal).toBe(hasOriginalValue)
      }
    }
  })

  it('returns available digits', () => {
    const game = createNewGame(Rank.Beginner)
    const availableDigits = getAvailableDigits(game)
    
    expect(availableDigits).toHaveLength(9)
    expect(availableDigits.every(d => d.digit >= 1 && d.digit <= 9)).toBe(true)
    expect(availableDigits.every(d => typeof d.isComplete === 'boolean')).toBe(true)
  })
})
