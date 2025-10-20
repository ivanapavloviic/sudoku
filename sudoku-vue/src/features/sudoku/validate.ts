// src/features/sudoku/validate.ts
import type { Digit, Grid, MaybeDigit } from './types'
import { GRID_SIZE, BOX_SIZE, boxTopLeft } from './types'

export function rowHas(grid: Grid, r: number, value: Digit): boolean {
  for (let c = 0; c < GRID_SIZE; c++) {
    if (grid[r]?.[c] === value) return true
  }
  return false
}

export function colHas(grid: Grid, c: number, value: Digit): boolean {
  for (let r = 0; r < GRID_SIZE; r++) {
    if (grid[r]?.[c] === value) return true
  }
  return false
}

export function boxHas(grid: Grid, r: number, c: number, value: Digit): boolean {
  const { r: r0, c: c0 } = boxTopLeft(r, c)
  for (let i = 0; i < BOX_SIZE; i++) {
    for (let j = 0; j < BOX_SIZE; j++) {
      if (grid[r0 + i]?.[c0 + j] === value) return true
    }
  }
  return false
}

export function isValidPlacement(grid: Grid, r: number, c: number, value: Digit): boolean {
  // Value must not already exist in row/column/box
  return !rowHas(grid, r, value) && !colHas(grid, c, value) && !boxHas(grid, r, c, value)
}

export function conflictsFor(
  grid: Grid,
  r: number,
  c: number,
  value: Digit,
): { row: boolean; col: boolean; box: boolean } {
  return {
    row: rowHas(grid, r, value),
    col: colHas(grid, c, value),
    box: boxHas(grid, r, c, value),
  }
}

export function availableDigitsForCell(grid: Grid, r: number, c: number): Digit[] {
  if (grid[r]?.[c] !== null) return []
  const result: Digit[] = []
  for (let d = 1 as Digit; d <= 9; d = (d + 1) as Digit) {
    if (isValidPlacement(grid, r, c, d)) result.push(d)
  }
  return result
}

export function isSolved(grid: Grid): boolean {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const v = grid[r]?.[c]
      if (v === null) return false
      // Temporarily remove and check validity (to avoid false positive)
      grid[r]![c] = null
      const ok = isValidPlacement(grid, r, c, v as Digit)
      grid[r]![c] = v as MaybeDigit
      if (!ok) return false
    }
  }
  return true
}

export function isBoxCompleted(grid: Grid, boxRow: number, boxCol: number): boolean {
  const { r: r0, c: c0 } = boxTopLeft(boxRow * BOX_SIZE, boxCol * BOX_SIZE)
  
  // Check if all cells in the box are filled
  for (let i = 0; i < BOX_SIZE; i++) {
    for (let j = 0; j < BOX_SIZE; j++) {
      if (grid[r0 + i]?.[c0 + j] === null) {
        return false
      }
    }
  }
  
  // Check if all digits 1-9 are present in the box
  const digits = new Set<Digit>()
  for (let i = 0; i < BOX_SIZE; i++) {
    for (let j = 0; j < BOX_SIZE; j++) {
      const value = grid[r0 + i]?.[c0 + j] as Digit
      if (value) {
        digits.add(value)
      }
    }
  }
  
  return digits.size === 9
}