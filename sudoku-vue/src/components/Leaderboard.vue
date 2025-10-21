<template>
  <div class="leaderboard bg-linen-200/90 dark:bg-rose-taupe-800/70 backdrop-blur rounded-2xl shadow-elevation-2 ring-1 ring-rose-taupe-300/20 p-6 w-full max-w-lg mx-auto">
    <h3 class="text-center text-2xl font-semibold text-rose-taupe-800 dark:text-linen-100 mb-5">🏆 Leaderboard</h3>
    
    <div class="difficulty-tabs flex gap-2 mb-5 bg-rose-taupe-100 dark:bg-rose-taupe-700 rounded-xl p-1">
      <button
        v-for="(rank, key) in Rank"
        :key="key"
        class="tab-btn flex-1 rounded-lg px-3 py-2 text-sm font-medium transition"
        :class="getTabButtonClasses(rank, selectedDifficulty === rank)"
        @click="selectDifficulty(rank)"
      >
        {{ getDifficultyName(rank) }}
      </button>
    </div>
    
    <div class="leaderboard-content">
      <div v-if="currentEntries.length === 0" class="no-entries text-center py-10">
        <p class="text-rose-taupe-800 text-lg font-medium">No records yet. Be the first to complete a {{ selectedDifficulty }} game!</p>
      </div>
      
      <div v-else class="entries-list flex flex-col gap-3">
        <div
          v-for="(entry, index) in currentEntries"
          :key="entry.id"
          class="leaderboard-entry flex items-center gap-4 p-4 rounded-xl transition hover:-translate-y-0.5"
          :class="getRankClasses(index + 1)"
        >
          <div class="rank-badge text-xl min-w-[30px] text-center">
            <span v-if="index === 0">🥇</span>
            <span v-else-if="index === 1">🥈</span>
            <span v-else-if="index === 2">🥉</span>
            <span v-else>{{ index + 1 }}</span>
          </div>
          
          <div class="entry-info flex-1">
            <div class="entry-name text-lg font-medium text-rose-taupe-700">{{ entry.playerName || 'Anonymous' }}</div>
            <div class="entry-score text-xl font-semibold text-rose-taupe-800">{{ formatScore(entry.score) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Rank } from '../features/sudoku/types'
import type { Leaderboard } from '../features/sudoku/scoring'
import { formatScore } from '../features/sudoku/scoring'

interface Props {
  leaderboard: Leaderboard
}

interface Emits {
  (e: 'difficulty-changed', difficulty: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedDifficulty = ref<string>(Rank.Beginner)

const currentEntries = computed(() => {
  return props.leaderboard[selectedDifficulty.value as keyof Leaderboard] || []
})

const selectDifficulty = (difficulty: string) => {
  selectedDifficulty.value = difficulty
  emit('difficulty-changed', difficulty)
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


const getTabButtonClasses = (_rank: string, isActive: boolean): string => {
  if (isActive) {
    return 'bg-linen-200 text-rose-taupe-800 shadow-sm'
  } else {
    return 'bg-transparent text-rose-taupe-600 hover:bg-linen-100 hover:text-rose-taupe-800'
  }
}

const getRankClasses = (rank: number): string => {
  if (rank === 1) {
    return 'bg-gradient-to-r from-linen-200 to-dun-200 hover:from-linen-300 hover:to-dun-300'
  } else if (rank === 2) {
    return 'bg-gradient-to-r from-dun-100 to-cinereous-100 hover:from-dun-200 hover:to-cinereous-200'
  } else if (rank === 3) {
    return 'bg-gradient-to-r from-cinereous-100 to-old-rose-100 hover:from-cinereous-200 hover:to-old-rose-200'
  } else {
    return 'bg-linen-100 hover:bg-linen-200'
  }
}
</script>

<style scoped>
/* Responsive design */
@media (max-width: 600px) {
  .leaderboard {
    padding: 15px;
  }
  
  .difficulty-tabs {
    flex-direction: column;
  }
  
  .tab-btn {
    text-align: center;
  }
  
  .entry-details {
    flex-direction: column;
    gap: 5px;
  }
}
</style>
