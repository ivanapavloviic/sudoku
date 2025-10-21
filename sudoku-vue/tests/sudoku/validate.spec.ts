import { describe, it, expect } from 'vitest'
import { emptyGrid } from '../../src/features/sudoku/types'
import { isValidPlacement, conflictsFor, availableDigitsForCell, isSolved } from '../../src/features/sudoku/validate'

describe('validate', () => {
  it('isValidPlacement works on empty grid', () => {
    const g = emptyGrid()
    expect(isValidPlacement(g, 0, 0, 5)).toBe(true)
  })

  it('detects row/col/box conflicts', () => {
    const g = emptyGrid()
    g[0][1] = 5
    g[1][0] = 5
    g[1][1] = 5
    const c1 = conflictsFor(g, 0, 0, 5)
    expect(c1.row).toBe(true)
    const c2 = conflictsFor(g, 0, 2, 5)
    expect(c2.row).toBe(true)
    const c3 = conflictsFor(g, 2, 0, 5)
    expect(c3.col).toBe(true)
    const c4 = conflictsFor(g, 2, 2, 5)
    expect(c4.box).toBe(true)
  })

  it('availableDigitsForCell returns candidates', () => {
    const g = emptyGrid()
    g[0][1] = 1
    g[1][0] = 2
    g[1][1] = 3
    const cand = availableDigitsForCell(g, 0, 0)
    expect(cand).not.toContain(1)
    expect(cand).not.toContain(2)
    expect(cand).not.toContain(3)
    expect(cand.length).toBeGreaterThan(0)
  })

  it('isSolved false if any null or conflict', () => {
    const g = emptyGrid()
    expect(isSolved(g)).toBe(false)
    g[0][0] = 5
    g[0][1] = 5 // conflict
    expect(isSolved(g)).toBe(false)
  })
})