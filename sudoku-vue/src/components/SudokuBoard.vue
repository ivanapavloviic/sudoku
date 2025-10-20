<template>
  <div class="sudoku-board w-full h-full flex items-center justify-center p-2 md:p-4">
    <div class="grid-container grid grid-cols-9 gap-px bg-slate-300 rounded-2xl overflow-hidden shadow-lg ring-1 ring-black/10 w-full h-full">
      <div 
        v-for="(row, rowIndex) in grid" 
        :key="`row-${rowIndex}`"
        class="grid-row contents"
        :class="{ 'completed-row': isRowCompleted(rowIndex) }"
      >
        <div
          v-for="(cell, colIndex) in row"
          :key="`cell-${rowIndex}-${colIndex}`"
          class="grid-cell w-full aspect-square bg-white flex items-center justify-center text-[clamp(28px,7.2vmin,88px)] md:text-[clamp(28px,6.5vmin,80px)] font-semibold text-slate-800 cursor-pointer transition-colors duration-150 select-none"
          :class="getCellClasses(rowIndex, colIndex)"
          @click="selectCell(rowIndex, colIndex)"
          @keydown="handleKeydown($event, rowIndex, colIndex)"
          tabindex="0"
        >
          <span v-if="cell !== null" class="cell-value">{{ cell }}</span>
          <span v-else class="cell-placeholder">&nbsp;</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Grid, Digit, MaybeDigit } from '../features/sudoku/types'

interface Props {
  grid: Grid
  originalGrid: Grid
  selectedCell: { row: number; col: number } | null
  conflicts: Array<{ row: number; col: number }>
  hints: Array<{ row: number; col: number }>
  completedBoxes: Array<{ row: number; col: number }>
}

interface Emits {
  (e: 'cell-click', row: number, col: number): void
  (e: 'cell-input', row: number, col: number, value: MaybeDigit): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isRowCompleted = (rowIndex: number): boolean => {
  const row = props.grid[rowIndex]
  if (!row) return false
  return row.every(cell => cell !== null)
}

const isCellInCompletedBox = (row: number, col: number): boolean => {
  const boxRow = Math.floor(row / 3)
  const boxCol = Math.floor(col / 3)
  
  return props.completedBoxes.some(box => 
    box.row === boxRow && box.col === boxCol
  )
}

// Removed unused functions

const getCellClasses = (rowIndex: number, colIndex: number): string[] => {
  const classes: string[] = []
  
  // Selected cell
  if (props.selectedCell?.row === rowIndex && props.selectedCell?.col === colIndex) {
    classes.push('selected')
  }
  
  // Original cell (cannot be edited)
  if (props.originalGrid[rowIndex]?.[colIndex] !== null) {
    classes.push('original')
  }
  
  // Conflicting cell (red)
  if (props.conflicts.some(conflict => conflict.row === rowIndex && conflict.col === colIndex)) {
    classes.push('conflict')
  }
  
  // Hint cell (blue)
  if (props.hints.some(hint => hint.row === rowIndex && hint.col === colIndex)) {
    classes.push('hint')
  }
  
  // Completed box cell
  if (isCellInCompletedBox(rowIndex, colIndex)) {
    classes.push('completed-box')
  }
  
  // Box boundaries
  if (rowIndex % 3 === 0) classes.push('box-top')
  if (rowIndex % 3 === 2) classes.push('box-bottom')
  if (colIndex % 3 === 0) classes.push('box-left')
  if (colIndex % 3 === 2) classes.push('box-right')
  
  return classes
}

const selectCell = (row: number, col: number) => {
  emit('cell-click', row, col)
}

const handleKeydown = (event: KeyboardEvent, row: number, col: number) => {
  // Don't allow editing original cells
  if (props.originalGrid[row]?.[col] !== null) {
    return
  }
  
  let value: MaybeDigit = null
  
  if (event.key >= '1' && event.key <= '9') {
    value = parseInt(event.key) as Digit
  } else if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') {
    value = null
  } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || 
             event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    // Handle arrow key navigation
    event.preventDefault()
    return
  } else {
    return
  }
  
  event.preventDefault()
  emit('cell-input', row, col, value)
}
</script>

<style scoped>
.sudoku-board {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));
  gap: 1px; /* fallback separators between cells */
}

.grid-row {
  display: contents;
  transition: all 0.3s ease;
}

.grid-row.completed-row {
  animation: rowComplete 0.6s ease-in-out;
}

.grid-cell { border: 1px solid #e5e7eb; }

.grid-cell:hover {
  background-color: #f0f8ff;
  color: #333;
}

.grid-cell.selected {
  background-color: #4a90e2;
  color: #333;
}

.grid-cell.original {
  background-color: #f8fafc;
  color: #333;
  font-weight: 900;
}

.grid-cell.conflict {
  background-color: #ff4444;
  color: #333;
  animation: conflictPulse 0.5s ease-in-out;
  border: 2px solid #cc0000;
}

.grid-cell.hint {
  background-color: #4a90e2;
  color: #333;
  animation: hintGlow 0.8s ease-in-out;
  border: 2px solid #357abd;
}

.grid-cell.box-top { border-top: 3px solid #0f172a; }
.grid-cell.box-bottom { border-bottom: 3px solid #0f172a; }
.grid-cell.box-left { border-left: 3px solid #0f172a; }
.grid-cell.box-right { border-right: 3px solid #0f172a; }

.grid-cell.completed-box {
  background: linear-gradient(135deg, #e8f5e8, #d4edda);
  opacity: 0.7;
  animation: boxComplete 1.5s ease-in-out;
  border: 2px solid #28a745;
  box-shadow: 0 0 10px rgba(40, 167, 69, 0.3);
}

.grid-cell.completed-box .cell-value {
  color: #155724;
  font-weight: bold;
}

.cell-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.cell-placeholder {
  color: transparent;
}

@keyframes rowComplete {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); background-color: #4CAF50; }
  100% { transform: scale(1); }
}

@keyframes conflictPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes hintGlow {
  0% { 
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(74, 144, 226, 0.7);
  }
  50% { 
    transform: scale(1.05);
    box-shadow: 0 0 10px 5px rgba(74, 144, 226, 0.4);
  }
  100% { 
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(74, 144, 226, 0.7);
  }
}

@keyframes boxComplete {
  0% { 
    transform: scale(1);
    background: linear-gradient(135deg, #e8f5e8, #d4edda);
    box-shadow: 0 0 5px rgba(40, 167, 69, 0.3);
  }
  50% { 
    transform: scale(1.05);
    background: linear-gradient(135deg, #d4edda, #c3e6cb);
    box-shadow: 0 0 20px rgba(40, 167, 69, 0.6);
  }
  100% { 
    transform: scale(1);
    background: linear-gradient(135deg, #e8f5e8, #d4edda);
    box-shadow: 0 0 10px rgba(40, 167, 69, 0.3);
  }
}

/* Responsive design */
@media (max-width: 600px) {
  .grid-cell {
    width: 35px;
    height: 35px;
    font-size: 1.2rem;
  }
  
  .cell-value {
    font-size: 1.2rem;
  }
}
</style>
