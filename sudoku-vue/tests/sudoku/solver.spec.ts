import { describe, it, expect } from 'vitest'
import { Grid, cloneGrid } from '../../src/features/sudoku/types'
import { solve, hasUniqueSolution } from '../../src/features/sudoku/solver'
import { isSolved } from '../../src/features/sudoku/validate'

const SAMPLE: Grid = [
  [5, 3, null, null, 7, null, null, null, null],
  [6, null, null, 1, 9, 5, null, null, null],
  [null, 9, 8, null, null, null, null, 6, null],
  [8, null, null, null, 6, null, null, null, 3],
  [4, null, null, 8, null, 3, null, null, 1],
  [7, null, null, null, 2, null, null, null, 6],
  [null, 6, null, null, null, null, 2, 8, null],
  [null, null, null, 4, 1, 9, null, null, 5],
  [null, null, null, null, 8, null, null, 7, 9],
]

describe('solver', () => {
  it('solve mutates grid into solved state', () => {
    const g = cloneGrid(SAMPLE)
    const ok = solve(g)
    expect(ok).toBe(true)
    expect(isSolved(g)).toBe(true)
  })

  it('hasUniqueSolution detects unique', () => {
    const g = cloneGrid(SAMPLE)
    expect(hasUniqueSolution(g)).toBe(true)
  })
})