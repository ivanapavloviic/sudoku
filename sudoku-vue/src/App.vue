<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Rank, type MaybeDigit, type Digit } from './features/sudoku/types'
import { createNewGame, setCellValue, getHint, getCurrentTime, getGameResult, isOriginalCell, getAvailableDigits } from './features/sudoku/gameState'
import { loadLeaderboard, saveLeaderboard, addToLeaderboard, isLeaderboardWorthy } from './features/sudoku/scoring'
import { isValidPlacement } from './features/sudoku/validate'
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
const leaderboard = ref<Leaderboard>(loadLeaderboard())
const showLeaderboard = ref(false)
const gameCompleted = ref(false)

// Timer
let timerInterval: number | null = null

const currentTime = computed(() => {
  if (!gameState.value) return 0
  return getCurrentTime(gameState.value)
})

const availableDigits = computed(() => {
  if (!gameState.value) return []
  return getAvailableDigits(gameState.value)
})

const canUseHint = computed(() => {
  if (!gameState.value || !selectedCell.value) return false
  return gameState.value.hintsUsed < gameState.value.maxHints &&
         !isOriginalCell(gameState.value, selectedCell.value.row, selectedCell.value.col) &&
         gameState.value.currentGrid[selectedCell.value.row]?.[selectedCell.value.col] === null
})

const startNewGame = (rank: string) => {
  gameState.value = createNewGame(rank as Rank)
  selectedCell.value = null
  selectedDigit.value = null
  conflicts.value = []
  hints.value = []
  gameCompleted.value = false
  showLeaderboard.value = false
  startTimer()
}

const selectCell = (row: number, col: number) => {
  selectedCell.value = { row, col }
  conflicts.value = []
  hints.value = []
  
  // Clear conflicts after a short delay
  setTimeout(() => {
    conflicts.value = []
  }, 1000)
}

const handleCellInput = (row: number, col: number, value: number | null) => {
  if (!gameState.value) return
  
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
  
  // Check if game is completed
  if (newState.isCompleted) {
    gameCompleted.value = true
    stopTimer()
    handleGameCompletion()
  }
}

const useHint = () => {
  if (!gameState.value || !selectedCell.value || !canUseHint.value) return
  
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
    
    // Check if game is completed
    if (hintResult.newState.isCompleted) {
      gameCompleted.value = true
      stopTimer()
      handleGameCompletion()
    }
  }
}

const selectDigit = (digit: number) => {
  selectedDigit.value = digit
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
    // Timer updates are handled by the computed property
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
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
}

onMounted(() => {
  // Initialize with beginner difficulty
  startNewGame(Rank.Beginner)
})

onUnmounted(() => {
  stopTimer()
})
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>🧩 Sudoku Game</h1>
      <p>Challenge your mind with the classic number puzzle</p>
    </header>

    <main class="app-main">
      <!-- Difficulty Selection -->
      <div v-if="!gameState" class="game-setup">
        <DifficultySelector 
          :selected-rank="Rank.Beginner"
          @difficulty-selected="startNewGame"
        />
      </div>

      <!-- Game Interface -->
      <div v-else-if="!showLeaderboard" class="game-interface">
        <div class="game-layout">
          <!-- Left Panel -->
          <div class="left-panel">
            <GameInfo
              :score="gameState.score"
              :time-elapsed="currentTime"
              :hints-used="gameState.hintsUsed"
              :max-hints="gameState.maxHints"
              :errors-count="gameState.errorsCount"
              :hint-cost="gameState.hintCost"
              :can-use-hint="canUseHint"
              @use-hint="useHint"
            />
          </div>

          <!-- Center Panel -->
          <div class="center-panel">
            <SudokuBoard
              :grid="gameState.currentGrid"
              :original-grid="gameState.originalGrid"
              :selected-cell="selectedCell"
              :conflicts="conflicts"
              :hints="hints"
              @cell-click="selectCell"
              @cell-input="handleCellInput"
            />
            
            <!-- Available Digits below the board -->
            <AvailableDigits
              :digits="availableDigits"
              :selected-digit="selectedDigit as Digit | null"
              @digit-selected="selectDigit"
            />
          </div>

          <!-- Right Panel -->
          <div class="right-panel">
            <div class="game-controls">
              <button class="control-btn new-game" @click="resetGame">
                🆕 New Game
              </button>
              <button class="control-btn leaderboard" @click="showLeaderboard = true">
                🏆 Leaderboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Leaderboard -->
      <div v-else class="leaderboard-view">
        <LeaderboardComponent
          :leaderboard="leaderboard"
          @difficulty-changed="(rank: string) => startNewGame(rank)"
        />
        <div class="leaderboard-actions">
          <button class="control-btn" @click="showLeaderboard = false">
            ← Back to Game
          </button>
          <button class="control-btn new-game" @click="resetGame">
            🆕 New Game
          </button>
        </div>
      </div>
    </main>

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
  max-width: 1200px;
  margin: 0 auto;
}

.game-setup {
  display: flex;
  justify-content: center;
}

.game-interface {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.game-layout {
  display: grid;
  grid-template-columns: 250px 1fr 200px;
  gap: 30px;
  align-items: start;
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

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

/* Responsive design */
@media (max-width: 1024px) {
  .game-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
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