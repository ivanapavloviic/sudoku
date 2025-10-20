<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Rank, type MaybeDigit, type Digit } from './features/sudoku/types'
import { createNewGame, setCellValue, getHint, getCurrentTime, getGameResult, isOriginalCell, getAvailableDigits } from './features/sudoku/gameState'
import { undo as undoAction, redo as redoAction } from './features/sudoku/gameState'
import { loadLeaderboard, saveLeaderboard, addToLeaderboard, isLeaderboardWorthy } from './features/sudoku/scoring'
import { isValidPlacement, isBoxCompleted } from './features/sudoku/validate'
import type { GameState } from './features/sudoku/gameState'
import type { Leaderboard } from './features/sudoku/scoring'
import SudokuBoard from './components/SudokuBoard.vue'
import DifficultySelector from './components/DifficultySelector.vue'
import GameInfo from './components/GameInfo.vue'
import AvailableDigits from './components/AvailableDigits.vue'
import LeaderboardComponent from './components/Leaderboard.vue'

// Game state
const gameState = ref<GameState | null>(null)
const selectedCell = ref<{ row: number; col: number } | null>(null)
const selectedDigit = ref<number | null>(null)
const conflicts = ref<Array<{ row: number; col: number }>>([])
const hints = ref<Array<{ row: number; col: number }>>([])
const completedBoxes = ref<Array<{ row: number; col: number }>>([])
const leaderboard = ref<Leaderboard>(loadLeaderboard())
const showLeaderboard = ref(false)
const showDifficultySelector = ref(false)
const gameCompleted = ref(false)
const isPaused = ref(false)

// Timer
let timerInterval: number | null = null
const nowTick = ref(0)
const pauseStartedAt = ref<number | null>(null)
const pausedMsAccumulated = ref(0)

const currentTime = computed(() => {
  // establish dependency so this recomputes every second
  void nowTick.value
  if (!gameState.value) return 0
  const baseSeconds = getCurrentTime(gameState.value)
  const pausedMs = pausedMsAccumulated.value + (pauseStartedAt.value ? (Date.now() - pauseStartedAt.value) : 0)
  const subtractSeconds = Math.floor(pausedMs / 1000)
  const effective = baseSeconds - subtractSeconds
  return effective > 0 ? effective : 0
})

const availableDigits = computed(() => {
  if (!gameState.value) return []
  return getAvailableDigits(gameState.value)
})

const canUseHint = computed(() => {
  if (!gameState.value || !selectedCell.value) return false
  
  // Check if hints are available
  if (gameState.value.hintsUsed >= gameState.value.maxHints) return false
  
  // Check if cell is original (can't hint original cells)
  if (isOriginalCell(gameState.value, selectedCell.value.row, selectedCell.value.col)) return false
  
  // Check if cell is already filled
  if (gameState.value.currentGrid[selectedCell.value.row]?.[selectedCell.value.col] !== null) return false
  
  // Check if has enough score for hint cost
  if (gameState.value.score < gameState.value.hintCost) return false
  
  return true
})

const hintTooltip = computed(() => {
  if (!gameState.value || !selectedCell.value) return 'Select a cell to use hint'
  if (gameState.value.hintsUsed >= gameState.value.maxHints) return 'No hints remaining'
  if (isOriginalCell(gameState.value, selectedCell.value.row, selectedCell.value.col)) return 'Cannot hint original cells'
  if (gameState.value.currentGrid[selectedCell.value.row]?.[selectedCell.value.col] !== null) return 'Cell is already filled'
  if (gameState.value.score < gameState.value.hintCost) return `Need ${gameState.value.hintCost} points for hint`
  return `Use hint (costs ${gameState.value.hintCost} points)`
})

//

const startNewGame = (rank: string) => {
  gameState.value = createNewGame(rank as Rank)
  selectedCell.value = null
  selectedDigit.value = null
  conflicts.value = []
  hints.value = []
  completedBoxes.value = []
  gameCompleted.value = false
  showLeaderboard.value = false
  showDifficultySelector.value = false
  isPaused.value = false
  pauseStartedAt.value = null
  pausedMsAccumulated.value = 0
  nowTick.value = 0
  startTimer()
}

const selectCell = (row: number, col: number) => {
  if (isPaused.value) return
  selectedCell.value = { row, col }
  conflicts.value = []
  hints.value = []
  
  // Clear conflicts after a short delay
  setTimeout(() => {
    conflicts.value = []
  }, 1000)
}

const handleCellInput = (row: number, col: number, value: number | null) => {
  if (!gameState.value || isPaused.value) return
  
  const newState = setCellValue(gameState.value, row, col, value as MaybeDigit)
  gameState.value = newState
  
  // Check for conflicts
  if (value !== null) {
    const cellConflicts = []
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (gameState.value.currentGrid[r]?.[c] === value) {
          // Check if this creates a conflict
          const tempGrid = gameState.value.currentGrid.map(row => [...row])
          tempGrid[r]![c] = null
          if (!isValidPlacement(tempGrid, r, c, value)) {
            cellConflicts.push({ row: r, col: c })
          }
        }
      }
    }
    conflicts.value = cellConflicts
  }
  
  // Check for completed 3x3 boxes
  checkCompletedBoxes()
  
  // Check if game is completed
  if (newState.isCompleted) {
    gameCompleted.value = true
    stopTimer()
    handleGameCompletion()
  }
}

const checkCompletedBoxes = () => {
  if (!gameState.value) return
  
  const newCompletedBoxes = []
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      if (isBoxCompleted(gameState.value.currentGrid, boxRow, boxCol)) {
        newCompletedBoxes.push({ row: boxRow, col: boxCol })
      }
    }
  }
  
  // Check if any new boxes were completed
  const newlyCompleted = newCompletedBoxes.filter(box => 
    !completedBoxes.value.some(existing => 
      existing.row === box.row && existing.col === box.col
    )
  )
  
  if (newlyCompleted.length > 0) {
    completedBoxes.value = newCompletedBoxes
    // Trigger animation for newly completed boxes
    setTimeout(() => {
      // Animation will be handled by CSS
    }, 100)
  }
}

const useHint = () => {
  if (!gameState.value || !selectedCell.value || !canUseHint.value || isPaused.value) return
  
  const hintResult = getHint(gameState.value, selectedCell.value.row, selectedCell.value.col)
  if (hintResult.success && hintResult.newState) {
    gameState.value = hintResult.newState
    
    // Add hint visual feedback
    if (selectedCell.value) {
      hints.value = [{ row: selectedCell.value.row, col: selectedCell.value.col }]
      setTimeout(() => {
        hints.value = []
      }, 2000)
    }
    
    // Check for completed 3x3 boxes after hint
    checkCompletedBoxes()
    
    // Check if game is completed
    if (hintResult.newState.isCompleted) {
      gameCompleted.value = true
      stopTimer()
      handleGameCompletion()
    }
  }
}

const selectDigit = (digit: number) => {
  if (isPaused.value) return
  selectedDigit.value = digit
}

const getDifficultyName = (rank: string): string => {
  const names: Record<string, string> = {
    [Rank.Beginner]: 'Easy',
    [Rank.Intermediate]: 'Medium', 
    [Rank.Hard]: 'Hard',
    [Rank.Expert]: 'Expert',
  }
  return names[rank] || 'Unknown'
}

const handleGameCompletion = () => {
  if (!gameState.value) return
  
  const result = getGameResult(gameState.value)
  
  // Check if result is worthy of leaderboard
  if (isLeaderboardWorthy(leaderboard.value, result)) {
    leaderboard.value = addToLeaderboard(leaderboard.value, result)
    saveLeaderboard(leaderboard.value)
  }
  
  showLeaderboard.value = true
}

const startTimer = () => {
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    // advance a reactive tick to trigger time recomputation
    nowTick.value++
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const pauseGame = () => {
  if (!gameState.value) return
  if (isPaused.value) return
  isPaused.value = true
  stopTimer()
  pauseStartedAt.value = Date.now()
}

const resetGame = () => {
  stopTimer()
  gameState.value = null
  selectedCell.value = null
  selectedDigit.value = null
  conflicts.value = []
  hints.value = []
  gameCompleted.value = false
  showLeaderboard.value = false
  showDifficultySelector.value = true // Show difficulty selector when starting new game
  nowTick.value = 0
  isPaused.value = false
  pauseStartedAt.value = null
  pausedMsAccumulated.value = 0
}

const togglePause = () => {
  if (!gameState.value) return
  isPaused.value = !isPaused.value
  if (isPaused.value) {
    stopTimer()
    pauseStartedAt.value = Date.now()
  } else {
    if (pauseStartedAt.value) {
      pausedMsAccumulated.value += Date.now() - pauseStartedAt.value
      pauseStartedAt.value = null
    }
    startTimer()
  }
}

const undo = () => {
  if (!gameState.value || isPaused.value) return
  gameState.value = undoAction(gameState.value)
}

const redo = () => {
  if (!gameState.value || isPaused.value) return
  gameState.value = redoAction(gameState.value)
}

onMounted(() => {
  // Initialize with beginner difficulty
  startNewGame(Rank.Beginner)
  const handleVisibility = () => {
    if (document.hidden) {
      pauseGame()
    }
  }
  document.addEventListener('visibilitychange', handleVisibility)
  ;(window as any).__sudokuVisibilityHandler = handleVisibility
})

onUnmounted(() => {
  stopTimer()
  const handler = (window as any).__sudokuVisibilityHandler
  if (handler) {
    document.removeEventListener('visibilitychange', handler)
    ;(window as any).__sudokuVisibilityHandler = undefined
  }
})
</script>

<template>
  <div class="app min-h-screen bg-background dark:bg-slate-900 text-slate-800 dark:text-slate-100 selection:bg-black selection:text-white">
    <header class="app-header text-center max-w-5xl mx-auto py-2 md:py-3">
      <h1 class="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">Sudoku Game</h1>
    </header>

    <main class="app-main w-full max-w-none mx-auto px-2 md:px-4">
      <!-- Difficulty Selection -->
      <div v-if="!gameState" class="game-setup">
        <DifficultySelector 
          :selected-rank="Rank.Beginner"
          @difficulty-selected="startNewGame"
        />
        <div class="setup-actions">
          <button class="control-btn change-difficulty" @click="showDifficultySelector = true">
            🔄 Change Level
          </button>
        </div>
      </div>

      <!-- Game Interface -->
      <div v-else class="game-interface w-full bg-surface/90 dark:bg-slate-900/70 backdrop-blur rounded-3xl shadow-lg ring-1 ring-black/5 p-2 md:p-4">
        <!-- Score/Time Box - Full width at top -->
        <div class="w-full mb-4">
          <GameInfo
            :score="gameState.score"
            :time-elapsed="currentTime"
            :hints-used="gameState.hintsUsed"
            :max-hints="gameState.maxHints"
            :errors-count="gameState.errorsCount"
            :hint-cost="gameState.hintCost"
            :can-use-hint="canUseHint"
            :is-paused="isPaused"
            @use-hint="useHint"
            @toggle-pause="togglePause"
          />
        </div>

        <!-- Main Game Layout - 2/3 Sudoku, 1/3 Controls -->
        <div class="game-layout flex flex-row gap-4 min-h-[calc(100vh-16rem)]">
          <!-- Left Panel - Sudoku (2/3) -->
          <div class="flex flex-col items-center justify-center w-2/3">
            <!-- Level + Controls row -->
            <div class="w-full grid grid-cols-1 sm:grid-cols-3 items-center gap-2 mb-4">
              <div class="flex justify-center sm:justify-start">
                <div class="level-label px-3 py-1 rounded-full bg-primary-700 text-white shadow-sm text-xs sm:text-sm">
                  <span class="level-text font-medium">Level: {{ getDifficultyName(gameState.rank) }}</span>
                </div>
              </div>
              <div class="flex justify-center">
                <button
                  class="hint-btn inline-flex items-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white transition shadow-sm active:scale-[.98]"
                  :class="canUseHint ? 'bg-primary-700 hover:bg-primary-800' : 'bg-slate-300 cursor-not-allowed'"
                  :disabled="!canUseHint"
                  @click="useHint"
                  :title="hintTooltip"
                >
                  <span class="hint-icon text-sm sm:text-lg">💡</span>
                  <span class="hint-text hidden sm:inline">Hint</span>
                  <span class="hint-cost bg-white/20 rounded px-1 sm:px-2 py-0.5 text-xs">-{{ gameState.hintCost }}</span>
                </button>
              </div>
              <div class="flex items-center justify-center sm:justify-end gap-1 sm:gap-2">
                <button
                  class="inline-flex items-center justify-center rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-white bg-slate-700 hover:bg-slate-800 transition shadow-sm active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  @click="undo"
                  :disabled="!gameState || gameState.undoStack.length === 0"
                  title="Undo"
                >
                  <span class="hidden sm:inline">⎌ Undo</span>
                  <span class="sm:hidden">⎌</span>
                </button>
                <button
                  class="inline-flex items-center justify-center rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-white bg-slate-700 hover:bg-slate-800 transition shadow-sm active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  @click="redo"
                  :disabled="!gameState || gameState.redoStack.length === 0"
                  title="Redo"
                >
                  <span class="hidden sm:inline">↻ Redo</span>
                  <span class="sm:hidden">↻</span>
                </button>
              </div>
            </div>
            
            <!-- Board Area -->
            <div class="board-wrapper w-full flex flex-col items-center gap-2" :class="{ 'is-paused': isPaused }">
              <!-- Responsive square area -->
              <div class="board-size relative w-full max-w-[min(90vw,90vh)] sm:max-w-[min(80vw,80vh)] md:max-w-[min(70vw,70vh)] lg:max-w-[min(60vw,60vh)] aspect-square">
                <div class="board-content w-full h-full" :class="{ paused: isPaused }">
                  <SudokuBoard 
                    :grid="gameState.currentGrid"
                    :original-grid="gameState.originalGrid"
                    :selected-cell="selectedCell"
                    :conflicts="conflicts"
                    :hints="hints"
                    :completed-boxes="completedBoxes"
                    @cell-click="selectCell"
                    @cell-input="handleCellInput"
                  />
                </div>
                <div v-if="isPaused" class="paused-overlay absolute inset-0 flex items-center justify-center">
                  <div class="paused-content text-center text-white">
                    <div class="paused-title text-xl sm:text-2xl md:text-3xl font-extrabold tracking-widest uppercase">Paused</div>
                    <div class="paused-sub mt-1 sm:mt-2 opacity-90 text-xs sm:text-sm">Press Resume to continue</div>
                  </div>
                </div>
              </div>
              
              <!-- Available Digits -->
              <AvailableDigits
                :digits="availableDigits"
                :selected-digit="selectedDigit as Digit | null"
                @digit-selected="selectDigit"
              />
            </div>
          </div>

          <!-- Right Panel - Game Controls (1/3) -->
          <div class="w-1/3 flex-shrink-0">
            <div class="space-y-4 h-full flex flex-col justify-start">
              <button class="control-btn change-difficulty w-full inline-flex items-center justify-center rounded-lg px-4 py-4 text-base font-medium text-white bg-primary-700 hover:bg-primary-800 transition shadow-sm active:scale-[.98]" @click="showDifficultySelector = true">
                🔄 Change Level
              </button>
              <button class="control-btn leaderboard w-full inline-flex items-center justify-center rounded-lg px-4 py-4 text-base font-medium text-white bg-amber-500 hover:bg-amber-600 transition shadow-sm active:scale-[.98]" @click="showLeaderboard = true">
                🏆 Leaderboard
              </button>
            </div>
          </div>
        </div>
      </div>

      
    </main>

    <!-- Difficulty Selector Modal -->
    <div v-if="showDifficultySelector" class="difficulty-modal">
      <div class="modal-content text-slate-900">
        <h2 class="text-primary-700">🎯 Change Difficulty Level</h2>
        <p class="text-slate-700">Select a new difficulty level for your Sudoku game:</p>
        <div class="difficulty-options">
          <button 
            class="difficulty-btn beginner" 
            @click="startNewGame(Rank.Beginner)"
          >
            <span class="difficulty-name text-slate-900">Easy</span>
            <span class="difficulty-desc text-slate-600">36-40 cells visible</span>
          </button>
          <button 
            class="difficulty-btn intermediate" 
            @click="startNewGame(Rank.Intermediate)"
          >
            <span class="difficulty-name text-slate-900">Medium</span>
            <span class="difficulty-desc text-slate-600">32-36 cells visible</span>
          </button>
          <button 
            class="difficulty-btn hard" 
            @click="startNewGame(Rank.Hard)"
          >
            <span class="difficulty-name text-slate-900">Hard</span>
            <span class="difficulty-desc text-slate-600">28-32 cells visible</span>
          </button>
          <button 
            class="difficulty-btn expert" 
            @click="startNewGame(Rank.Expert)"
          >
            <span class="difficulty-name text-slate-900">Expert</span>
            <span class="difficulty-desc text-slate-600">24-28 cells visible</span>
          </button>
        </div>
        <div class="modal-actions">
          <button class="control-btn" @click="showDifficultySelector = false">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Leaderboard Modal -->
    <div v-if="showLeaderboard" class="difficulty-modal">
      <div class="modal-content">
        <LeaderboardComponent
          :leaderboard="leaderboard"
        />
        <div class="modal-actions mt-6">
          <button class="control-btn" @click="showLeaderboard = false">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Game Completion Modal -->
    <div v-if="gameCompleted && gameState" class="completion-modal">
      <div class="modal-content">
        <h2>🎉 Congratulations!</h2>
        <p>You completed the {{ gameState.rank }} Sudoku puzzle!</p>
        <div class="final-stats">
          <div class="stat">
            <span class="stat-label">Final Score:</span>
            <span class="stat-value">{{ gameState.score.toLocaleString() }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Time:</span>
            <span class="stat-value">{{ Math.floor(currentTime / 60) }}:{{ (currentTime % 60).toString().padStart(2, '0') }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Hints Used:</span>
            <span class="stat-value">{{ gameState.hintsUsed }}</span>
          </div>
        </div>
        <div class="modal-actions">
          <button class="control-btn" @click="showLeaderboard = true">
            View Leaderboard
          </button>
          <button class="control-btn change-difficulty" @click="showDifficultySelector = true">
            🔄 Change Level
          </button>
          <button class="control-btn new-game" @click="resetGame">
            Play Again
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.app-header {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}

.app-header h1 {
  font-size: 2.5rem;
  margin: 0 0 10px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.app-header p {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.app-main {
  width: 100%;
  max-width: none;
  margin: 0 auto;
}

.game-setup {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.setup-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.game-interface {
  background: white;
  border-radius: 16px;
  padding: 20px; /* tighter to give more space to board */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}


.left-panel, .right-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.center-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
}

.board-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}


.board-content.paused {
  filter: grayscale(1) brightness(0.8);
  pointer-events: none;
}

.paused-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
  border-radius: 12px;
}

.paused-content {
  text-align: center;
  color: white;
}

.paused-title {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.paused-sub {
  margin-top: 6px;
  opacity: 0.9;
}

.level-label {
  background: #4a90e2;
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 1.1rem;
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);
}

.level-text {
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.game-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.control-btn {
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.control-btn:hover {
  background: #357abd;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.control-btn.new-game {
  background: #4CAF50;
}

.control-btn.new-game:hover {
  background: #45a049;
}

.control-btn.leaderboard {
  background: #FF9800;
}

.control-btn.leaderboard:hover {
  background: #f57c00;
}

.control-btn.change-difficulty {
  background: #9C27B0;
}

.control-btn.change-difficulty:hover {
  background: #7B1FA2;
}

.leaderboard-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.leaderboard-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.difficulty-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.completion-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-content h2 {
  color: #4CAF50;
  margin: 0 0 20px 0;
  font-size: 2rem;
}

.final-stats {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 30px 0;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-weight: 500;
  color: #666;
}

.stat-value {
  font-weight: bold;
  color: #333;
  font-size: 1.1rem;
}

.difficulty-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin: 30px 0;
}

.difficulty-btn {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.difficulty-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.difficulty-btn.beginner {
  border-color: #4CAF50;
}

.difficulty-btn.beginner:hover {
  background: #4CAF50;
  color: white;
}

.difficulty-btn.intermediate {
  border-color: #FF9800;
}

.difficulty-btn.intermediate:hover {
  background: #FF9800;
  color: white;
}

.difficulty-btn.hard {
  border-color: #F44336;
}

.difficulty-btn.hard:hover {
  background: #F44336;
  color: white;
}

.difficulty-btn.expert {
  border-color: #9C27B0;
}

.difficulty-btn.expert:hover {
  background: #9C27B0;
  color: white;
}

.difficulty-name {
  font-size: 1.2rem;
  font-weight: bold;
}

.difficulty-desc {
  font-size: 0.9rem;
  opacity: 0.7;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

/* Responsive design */
@media (max-width: 1024px) {
  .left-panel, .right-panel {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

@media (max-width: 600px) {
  .app {
    padding: 10px;
  }
  
  .app-header h1 {
    font-size: 2rem;
  }
  
  .game-interface {
    padding: 20px;
  }
  
  .modal-content {
    padding: 30px 20px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>