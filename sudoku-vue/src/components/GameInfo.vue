<template>
  <div class="game-info">
    <div class="info-section">
      <div class="info-item">
        <div class="info-label">Score</div>
        <div class="info-value score">{{ score }}</div>
      </div>
      
      <div class="info-item">
        <div class="info-label">Time</div>
        <div class="info-value time">{{ formatTime(timeElapsed) }}</div>
      </div>
      
      <div class="info-item">
        <div class="info-label">Hints Used</div>
        <div class="info-value hints">{{ hintsUsed }}/{{ maxHints }}</div>
      </div>
      
      <div class="info-item">
        <div class="info-label">Errors</div>
        <div class="info-value errors">{{ errorsCount }}</div>
      </div>
    </div>
    
    <div class="hint-section">
      <button 
        class="hint-btn"
        :class="{ 'disabled': !canUseHint }"
        :disabled="!canUseHint"
        @click="useHint"
        :title="hintTooltip"
      >
        <span class="hint-icon">💡</span>
        <span class="hint-text">Hint</span>
        <span class="hint-cost">-{{ hintCost }}</span>
      </button>
    </div>
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
}

interface Emits {
  (e: 'use-hint'): void
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
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.info-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.info-item {
  text-align: center;
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

.hint-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border: none;
  border-radius: 25px;
  padding: 12px 20px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.hint-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.hint-btn:disabled,
.hint-btn.disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.hint-btn.disabled .hint-cost {
  color: #ff4444;
}

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
