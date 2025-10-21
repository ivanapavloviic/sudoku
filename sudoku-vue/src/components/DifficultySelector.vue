<template>
  <div class="difficulty-selector text-center p-5">
    <h3 class="text-2xl font-semibold text-rose-taupe-800 dark:text-linen-100 mb-6">Choose Difficulty</h3>
    <div class="difficulty-options grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
      <button
        v-for="(rank, key) in Rank"
        :key="key"
        class="difficulty-btn backdrop-blur border-2 rounded-2xl p-6 cursor-pointer transition shadow-elevation-2 ring-1 flex flex-col items-center gap-1 min-h-[120px] justify-center active:scale-[.99]"
        :class="getLevelButtonClasses(rank, selectedRank === rank)"
        @click="selectDifficulty(rank)"
      >
        <div class="difficulty-name text-lg font-semibold" :class="getLevelTextClasses(rank)">{{ getDifficultyName(rank) }}</div>
        <div class="difficulty-range text-sm" :class="getLevelSubTextClasses(rank)">{{ getDifficultyRange(rank) }}</div>
        <div class="difficulty-description text-xs italic" :class="getLevelSubTextClasses(rank)">{{ getDifficultyDescription(rank) }}</div>
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

const getLevelButtonClasses = (rank: string, isActive: boolean): string => {
  if (isActive) {
    const activeColors: Record<string, string> = {
      [Rank.Beginner]: 'bg-linen-300/90 border-linen-400 ring-linen-400/30 shadow-linen-400/20',
      [Rank.Intermediate]: 'bg-dun-300/90 border-dun-400 ring-dun-400/30 shadow-dun-400/20',
      [Rank.Hard]: 'bg-old-rose-300/90 border-old-rose-400 ring-old-rose-400/30 shadow-old-rose-400/20',
      [Rank.Expert]: 'bg-rose-taupe-600/90 border-rose-taupe-700 ring-rose-taupe-400/30 shadow-rose-taupe-400/20',
    }
    return activeColors[rank] || 'bg-cinereous-300/90 border-cinereous-400 ring-cinereous-400/30 shadow-cinereous-400/20'
  } else {
    const inactiveColors: Record<string, string> = {
      [Rank.Beginner]: 'bg-linen-200/70 border-linen-300 hover:bg-linen-300/80 hover:border-linen-400',
      [Rank.Intermediate]: 'bg-dun-200/70 border-dun-300 hover:bg-dun-300/80 hover:border-dun-400',
      [Rank.Hard]: 'bg-old-rose-200/70 border-old-rose-300 hover:bg-old-rose-300/80 hover:border-old-rose-400',
      [Rank.Expert]: 'bg-rose-taupe-500/70 border-rose-taupe-600 hover:bg-rose-taupe-600/80 hover:border-rose-taupe-700',
    }
    return inactiveColors[rank] || 'bg-cinereous-200/70 border-cinereous-300 hover:bg-cinereous-300/80 hover:border-cinereous-400'
  }
}

const getLevelTextClasses = (rank: string): string => {
  const textColors: Record<string, string> = {
    [Rank.Beginner]: 'text-rose-taupe-800',
    [Rank.Intermediate]: 'text-rose-taupe-800',
    [Rank.Hard]: 'text-linen-100',
    [Rank.Expert]: 'text-linen-100',
  }
  return textColors[rank] || 'text-rose-taupe-800'
}

const getLevelSubTextClasses = (rank: string): string => {
  const subTextColors: Record<string, string> = {
    [Rank.Beginner]: 'text-rose-taupe-600',
    [Rank.Intermediate]: 'text-rose-taupe-600',
    [Rank.Hard]: 'text-linen-200',
    [Rank.Expert]: 'text-linen-200',
  }
  return subTextColors[rank] || 'text-rose-taupe-600'
}
</script>

<style scoped>
.difficulty-btn:hover { border-color: #aa998f; background-color: rgba(249,234,225,.7); }

.difficulty-btn.active { border-color: #cc8b86; background-color: rgba(249,234,225,.8); box-shadow: 0 4px 12px rgba(125, 79, 80, 0.2); }

/* Responsive design */
@media (max-width: 768px) {
  .difficulty-btn { padding: 15px; min-height: 100px; }
}
</style>
