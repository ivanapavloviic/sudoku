<template>
  <div class="difficulty-selector text-center p-5">
    <h3 class="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6">Choose Difficulty</h3>
    <div class="difficulty-options grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
      <button
        v-for="(rank, key) in Rank"
        :key="key"
        class="difficulty-btn bg-surface/90 dark:bg-slate-900/70 backdrop-blur border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-6 cursor-pointer transition shadow ring-1 ring-black/5 flex flex-col items-center gap-1 min-h-[120px] justify-center active:scale-[.99]"
        :class="{ active: selectedRank === rank }"
        @click="selectDifficulty(rank)"
      >
        <div class="difficulty-name text-lg font-semibold text-slate-900 dark:text-slate-100">{{ getDifficultyName(rank) }}</div>
        <div class="difficulty-range text-sm text-slate-600 dark:text-slate-300">{{ getDifficultyRange(rank) }}</div>
        <div class="difficulty-description text-xs text-slate-500 italic">{{ getDifficultyDescription(rank) }}</div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Rank, RANK_VISIBLE_RANGES } from '../features/sudoku/types'

interface Props {
  selectedRank: string
}

interface Emits {
  (e: 'difficulty-selected', rank: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const selectDifficulty = (rank: string) => {
  emit('difficulty-selected', rank)
}

const getDifficultyName = (rank: string): string => {
  const names: Record<string, string> = {
    [Rank.Beginner]: 'Beginner',
    [Rank.Intermediate]: 'Intermediate', 
    [Rank.Hard]: 'Hard',
    [Rank.Expert]: 'Expert'
  }
  return names[rank] || rank
}

const getDifficultyRange = (rank: string): string => {
  const range = RANK_VISIBLE_RANGES[rank as keyof typeof RANK_VISIBLE_RANGES]
  return `${range.min}-${range.max} cells`
}

const getDifficultyDescription = (rank: string): string => {
  const descriptions: Record<string, string> = {
    [Rank.Beginner]: 'Perfect for newcomers',
    [Rank.Intermediate]: 'Good challenge',
    [Rank.Hard]: 'For experienced players',
    [Rank.Expert]: 'Ultimate test'
  }
  return descriptions[rank] || ''
}
</script>

<style scoped>
.difficulty-selector {}

.difficulty-selector h3 {}

.difficulty-options {}

.difficulty-btn {}

.difficulty-btn:hover { border-color: #94a3b8; background-color: rgba(248,250,252,.7); }

.difficulty-btn.active { border-color: #3b82f6; background-color: rgba(241,245,249,.8); box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2); }

.difficulty-name {}

.difficulty-range {}

.difficulty-description {}

/* Responsive design */
@media (max-width: 768px) {
  .difficulty-btn { padding: 15px; min-height: 100px; }
}
</style>
