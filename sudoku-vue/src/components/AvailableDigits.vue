<template>
  <div class="available-digits bg-linen-200/90 dark:bg-rose-taupe-800/70 backdrop-blur rounded-2xl shadow-elevation-2 ring-1 ring-rose-taupe-300/20 p-3 w-full max-w-md">
    <h4 class="text-center text-rose-taupe-700 dark:text-linen-200 font-medium mb-3">Available Digits</h4>
    <div class="digits-grid flex flex-nowrap justify-center gap-2">
      <button
        v-for="digit in digits"
        :key="digit.digit"
        class="digit-btn w-12 h-12 md:w-14 md:h-14 rounded-xl border-2 flex items-center justify-center font-semibold transition active:scale-[.98]"
        :class="{ 
          complete: digit.isComplete,
          selected: selectedDigit === digit.digit
        }"
        @click="selectDigit(digit.digit)"
        :disabled="digit.isComplete"
      >
        <span class="digit-number">{{ digit.digit }}</span>
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

.digit-btn { border-color: #d1be9c; background: #f9eae1; color: #7d4f50; font-size: 1.2rem; }

.digit-btn:hover:not(:disabled) { border-color: #aa998f; background-color: #f5dccd; }

.digit-btn.selected { border-color: #cc8b86; background-color: #cc8b86; color: #f9eae1; }

.digit-btn.complete { background-color: #f5dccd; color: #aa998f; cursor: not-allowed; border-color: #d1be9c; }

.digit-btn.complete .digit-number {
  opacity: 0.5;
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
