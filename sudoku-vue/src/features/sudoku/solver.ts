// src/features/sudoku/solver.ts
import type { Digit, Grid, MaybeDigit } from './types'
import { GRID_SIZE } from './types'
import { isValidPlacement } from './validate'

/**
 * Pronađi sledeću praznu ćeliju (row-major). Vraća [r,c] ili null.
 */
function findEmpty(grid: Grid): [number, number] | null {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r]?.[c] === null) return [r, c]
    }
  }
  return null
}

/**
 * Klasični backtracking solver. Mutira grid.
 * Vraća true ako je rešivo i popunjeno, inače false.
 */
export function solve(grid: Grid): boolean {
  const empty = findEmpty(grid)
  if (!empty) return true
  const [r, c] = empty

  // Nasumičan redosled 1..9 poboljšava raznovrsnost
  const digits: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9] as Digit[]
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = digits[i]!
    digits[i] = digits[j]!
    digits[j] = temp
  }

  for (const d of digits) {
    if (isValidPlacement(grid, r, c, d)) {
      grid[r]![c] = d as MaybeDigit
      if (solve(grid)) return true
      grid[r]![c] = null
    }
  }
  return false
}

/**
 * Broji rešenja do max 2 (za detekciju jedinstvenog rešenja).
 * Ne randomizuje, ide deterministički 1..9.
 */
export function hasUniqueSolution(grid: Grid): boolean {
  let count = 0

  function backtrack(): boolean {
    if (count > 1) return true // early exit
    const empty = findEmpty(grid)
    if (!empty) {
      count++
      return false
    }
    const [r, c] = empty
    for (let d = 1 as Digit; d <= 9; d = (d + 1) as Digit) {
      if (isValidPlacement(grid, r, c, d)) {
        grid[r]![c] = d as MaybeDigit
        backtrack()
        grid[r]![c] = null
        if (count > 1) return true
      }
    }
    return false
  }

  backtrack()
  return count === 1
}