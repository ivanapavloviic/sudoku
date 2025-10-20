<template>
  <div class="available-digits bg-surface/90 dark:bg-slate-900/70 backdrop-blur rounded-2xl shadow ring-1 ring-black/5 p-5 w-full max-w-md">
    <h4 class="text-center text-slate-700 dark:text-slate-200 font-medium mb-4">Available Digits</h4>
    <div class="digits-grid flex flex-wrap justify-center gap-2">
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
.available-digits {}

.available-digits h4 {}

.digits-grid {}

.digit-btn { border-color: #e5e7eb; background: white; color: #0f172a; font-size: 1.2rem; }

.digit-btn:hover:not(:disabled) { border-color: #94a3b8; background-color: #f8fafc; }

.digit-btn.selected { border-color: #3b82f6; background-color: #3b82f6; color: white; }

.digit-btn.complete { background-color: #f1f5f9; color: #94a3b8; cursor: not-allowed; border-color: #e2e8f0; }

.digit-btn.complete .digit-number {
  opacity: 0.5;
}

/* removed tick status */

/* Responsive design */
@media (max-width: 600px) {
  .digit-btn {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
}
</style>
