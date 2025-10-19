// src/features/sudoku/generator.ts
import type { Grid, Digit, Rank } from './types'
import { emptyGrid, cloneGrid, RANK_VISIBLE_RANGES } from './types'
import { solve, hasUniqueSolution } from './solver'

/**
 * Generates a completely solved Sudoku grid
 */
export function generateSolvedGrid(): Grid {
  const grid = emptyGrid()
  solve(grid)
  return grid
}

/**
 * Removes cells from grid while maintaining unique solution
 */
function removeCellsWhileMaintainingUniqueSolution(
  grid: Grid,
  targetVisibleCount: number
): Grid {
  const workingGrid = cloneGrid(grid)
  const totalCells = 81
  const cellsToRemove = totalCells - targetVisibleCount
  
  // Create list of all positions (except already empty ones)
  const positions: Array<{ r: number; c: number }> = []
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (workingGrid[r]?.[c] !== null) {
        positions.push({ r, c })
      }
    }
  }
  
  // Randomly shuffle positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = positions[i]!
    positions[i] = positions[j]!
    positions[j] = temp
  }
  
  let removedCount = 0
  for (const { r, c } of positions) {
    if (removedCount >= cellsToRemove) break
    
    // Temporarily remove cell
    const originalValue = workingGrid[r]?.[c]
    workingGrid[r]![c] = null
    
    // Check if still has unique solution
    if (hasUniqueSolution(cloneGrid(workingGrid))) {
      removedCount++
    } else {
      // Restore value if no unique solution
      workingGrid[r]![c] = originalValue
    }
  }
  
  return workingGrid
}

/**
 * Generates Sudoku puzzle for given difficulty
 */
export function generatePuzzle(rank: Rank): Grid {
  // Generate completely solved grid
  const solvedGrid = generateSolvedGrid()
  
  // Determine number of visible cells based on difficulty
  const { min, max } = RANK_VISIBLE_RANGES[rank]
  const visibleCount = Math.floor(Math.random() * (max - min + 1)) + min
  
  // Remove cells while maintaining unique solution
  return removeCellsWhileMaintainingUniqueSolution(solvedGrid, visibleCount)
}

/**
 * Generates random puzzle with specified number of visible cells
 */
export function generatePuzzleWithVisibleCount(visibleCount: number): Grid {
  const solvedGrid = generateSolvedGrid()
  return removeCellsWhileMaintainingUniqueSolution(solvedGrid, visibleCount)
}

/**
 * Checks if puzzle is valid (has unique solution)
 */
export function isValidPuzzle(grid: Grid): boolean {
  return hasUniqueSolution(cloneGrid(grid))
}

/**
 * Counts how many cells are filled in grid
 */
export function countFilledCells(grid: Grid): number {
  let count = 0
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r]?.[c] !== null) count++
    }
  }
  return count
}

/**
 * Generates random number between min and max (inclusive)
 */
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

