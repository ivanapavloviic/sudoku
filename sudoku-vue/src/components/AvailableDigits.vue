<template>
  <div class="available-digits">
    <h4>Available Digits</h4>
    <div class="digits-grid">
      <button
        v-for="digit in digits"
        :key="digit.digit"
        class="digit-btn"
        :class="{ 
          complete: digit.isComplete,
          selected: selectedDigit === digit.digit
        }"
        @click="selectDigit(digit.digit)"
        :disabled="digit.isComplete"
      >
        <span class="digit-number">{{ digit.digit }}</span>
        <span class="digit-status" v-if="digit.isComplete">✓</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Digit } from '../features/sudoku/types'

interface DigitInfo {
  digit: Digit
  isComplete: boolean
}

interface Props {
  digits: DigitInfo[]
  selectedDigit: Digit | null
}

interface Emits {
  (e: 'digit-selected', digit: Digit): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const selectDigit = (digit: Digit) => {
  emit('digit-selected', digit)
}
</script>

<style scoped>
.available-digits {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.available-digits h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.1rem;
  text-align: center;
}

.digits-grid {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.digit-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #333;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.digit-btn:hover:not(:disabled) {
  border-color: #4a90e2;
  background-color: #f0f8ff;
  transform: translateY(-1px);
}

.digit-btn.selected {
  border-color: #4a90e2;
  background-color: #4a90e2;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(74, 144, 226, 0.3);
}

.digit-btn.complete {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  border-color: #ddd;
}

.digit-btn.complete .digit-number {
  opacity: 0.5;
}

.digit-status {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 0.8rem;
  color: #4CAF50;
  font-weight: bold;
}

/* Responsive design */
@media (max-width: 600px) {
  .digit-btn {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
}
</style>
