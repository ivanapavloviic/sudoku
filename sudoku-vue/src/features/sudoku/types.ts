// src/features/sudoku/types.ts

export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
export type MaybeDigit = Digit | null

export interface Coord {
  r: number
  c: number
}

// 9x9 grid
export type Grid = MaybeDigit[][]

export const Rank = {
  Beginner: 'beginner',
  Intermediate: 'intermediate',
  Hard: 'hard',
  Expert: 'expert',
} as const

export type Rank = typeof Rank[keyof typeof Rank]

export const RANK_VISIBLE_RANGES: Record<Rank, { min: number; max: number }> = {
  [Rank.Beginner]: { min: 36, max: 40 },
  [Rank.Intermediate]: { min: 32, max: 36 },
  [Rank.Hard]: { min: 28, max: 32 },
  [Rank.Expert]: { min: 24, max: 28 },
}

// Helper constants
export const BOX_SIZE = 3
export const GRID_SIZE = 9

export function cloneGrid(g: Grid): Grid {
  return g.map((row) => row.slice())
}

export function emptyGrid(): Grid {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => null as MaybeDigit),
  )
}

export function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE
}

export function boxTopLeft(r: number, c: number): Coord {
  return {
    r: Math.floor(r / BOX_SIZE) * BOX_SIZE,
    c: Math.floor(c / BOX_SIZE) * BOX_SIZE,
  }
}