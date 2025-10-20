<template>
  <div class="game-info bg-linen-200/90 dark:bg-rose-taupe-800/70 backdrop-blur rounded-2xl shadow-elevation-2 ring-1 ring-rose-taupe-300/20">
    <div class="info-section grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
      <div class="info-item">
        <div class="info-label text-xs text-rose-taupe-600">Score</div>
        <div class="info-value score text-lg font-semibold font-bold" style="color: #cc8b86;">{{ score }}</div>
      </div>
      
      <div class="info-item">
        <div class="info-label text-xs text-rose-taupe-600">Time</div>
        <div class="time-row flex items-center justify-center gap-1.5">
          <div class="info-value time text-lg font-semibold font-bold" style="color: #d1be9c;">{{ formatTime(timeElapsed) }}</div>
          <button class="pause-btn inline-flex items-center justify-center px-0.5 py-0 text-sm transition active:scale-[.98]"
            :class="isPaused ? 'text-dun-600 hover:text-dun-700' : 'text-rose-taupe-600 hover:text-rose-taupe-700'"
            @click="togglePause"
            :aria-label="isPaused ? 'Resume' : 'Pause'">
            <span v-if="isPaused" class="leading-none">▶</span>
            <span v-else class="leading-none">⏸</span>
          </button>
        </div>
      </div>
      
      <div class="info-item">
        <div class="info-label text-xs text-rose-taupe-600">Hints Used</div>
        <div class="info-value hints text-lg font-semibold font-bold" style="color: #7d4f50;">{{ hintsUsed }}/{{ maxHints }}</div>
      </div>
      
      <div class="info-item">
        <div class="info-label text-xs text-rose-taupe-600">Errors</div>
        <div class="info-value errors text-lg font-semibold font-bold" style="color: #aa998f;">{{ errorsCount }}</div>
      </div>
    </div>
    
    <!-- hint moved to center header -->
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  score: number
  timeElapsed: number
  hintsUsed: number
  maxHints: number
  errorsCount: number
  hintCost: number
  canUseHint: boolean
  isPaused: boolean
}

interface Emits {
  (e: 'use-hint'): void
  (e: 'toggle-pause'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const useHint = () => {
  if (props.canUseHint) {
    emit('use-hint')
  }
}

const togglePause = () => {
  emit('toggle-pause')
}

const hintTooltip = computed(() => {
  if (!props.canUseHint) {
    if (props.hintsUsed >= props.maxHints) {
      return 'No hints remaining (10/10 used)'
    }
    if (props.score < props.hintCost) {
      return `Not enough score (need ${props.hintCost}, have ${props.score})`
    }
    return 'No hints available'
  }
  return `Use hint (costs ${props.hintCost} points)`
})
</script>

<style scoped>
.game-info {
  background: white;
  border-radius: 12px;
  padding: 2px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 5px;
}
.info-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
  margin-bottom: 5px;
}

.info-item {
  text-align: center;
}

.time-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.info-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
  font-weight: 500;
}

.info-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.info-value.score {
  color: #4CAF50;
}

.info-value.time {
  color: #2196F3;
}

.info-value.hints {
  color: #FF9800;
}

.info-value.errors {
  color: #F44336;
}


.hint-section {
  display: flex;
  justify-content: center;
}

.hint-btn { border: none; }

.hint-btn.disabled .hint-cost {
  color: #ff4444;
}

.pause-btn { border: none; }

.hint-icon {
  font-size: 1.2rem;
}

.hint-text {
  font-size: 1rem;
}

.hint-cost {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 0.8rem;
}

/* Responsive design */
@media (max-width: 600px) {
  .info-section {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .info-value {
    font-size: 1.2rem;
  }
  
  .hint-btn {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
}
</style>
