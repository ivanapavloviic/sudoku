import { describe, it, expect } from 'vitest'
import { Rank } from '../../src/features/sudoku/types'
import {
  generateSolvedGrid,
  generatePuzzle,
  generatePuzzleWithVisibleCount,
  isValidPuzzle,
  countFilledCells,
} from '../../src/features/sudoku/generator'
import { isSolved } from '../../src/features/sudoku/validate'

describe('generator', () => {
  it('generates valid solved grid', () => {
    const grid = generateSolvedGrid()
    expect(isSolved(grid)).toBe(true)
  })

  it('generates puzzle with correct visible count', () => {
    const visibleCount = 30
    const puzzle = generatePuzzleWithVisibleCount(visibleCount)
    const filledCount = countFilledCells(puzzle)
    expect(filledCount).toBe(visibleCount)
  })

  it('generates puzzle within rank ranges', () => {
    const puzzle = generatePuzzle(Rank.Beginner)
    const filledCount = countFilledCells(puzzle)
    expect(filledCount).toBeGreaterThanOrEqual(36)
    expect(filledCount).toBeLessThanOrEqual(40)
  })

  it('generates valid puzzle for all ranks', () => {
    const ranks = [Rank.Beginner, Rank.Intermediate, Rank.Hard, Rank.Expert]
    
    for (const rank of ranks) {
      const puzzle = generatePuzzle(rank)
      expect(isValidPuzzle(puzzle)).toBe(true)
    }
  })

  it('countFilledCells works correctly', () => {
    const puzzle = generatePuzzleWithVisibleCount(25)
    const count = countFilledCells(puzzle)
    expect(count).toBe(25)
  })

  it('generates different puzzles on multiple calls', () => {
    const puzzle1 = generatePuzzle(Rank.Beginner)
    const puzzle2 = generatePuzzle(Rank.Beginner)
    
    // Verovatnoća da su identični je vrlo mala, ali proverimo da nisu
    let isIdentical = true
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (puzzle1[r]?.[c] !== puzzle2[r]?.[c]) {
          isIdentical = false
          break
        }
      }
      if (!isIdentical) break
    }
    
    expect(isIdentical).toBe(false)
  })
})

