<template>
  <div class="leaderboard bg-surface/90 dark:bg-slate-900/70 backdrop-blur rounded-2xl shadow ring-1 ring-black/5 p-6 w-full max-w-lg mx-auto">
    <h3 class="text-center text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-5">🏆 Leaderboard</h3>
    
    <div class="difficulty-tabs flex gap-2 mb-5 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
      <button
        v-for="(rank, key) in Rank"
        :key="key"
        class="tab-btn flex-1 rounded-lg px-3 py-2 text-sm font-medium transition"
        :class="{ active: selectedDifficulty === rank }"
        @click="selectDifficulty(rank)"
      >
        {{ getDifficultyName(rank) }}
      </button>
    </div>
    
    <div class="leaderboard-content">
      <div v-if="currentEntries.length === 0" class="no-entries text-center py-10 text-slate-600">
        <p>No records yet. Be the first to complete a {{ selectedDifficulty }} game!</p>
      </div>
      
      <div v-else class="entries-list flex flex-col gap-3">
        <div
          v-for="(entry, index) in currentEntries"
          :key="entry.id"
          class="leaderboard-entry flex items-center gap-4 p-4 rounded-xl bg-slate-50 transition hover:-translate-y-0.5 hover:bg-slate-100"
          :class="`rank-${index + 1}`"
        >
          <div class="rank-badge text-xl min-w-[30px] text-center">
            <span v-if="index === 0">🥇</span>
            <span v-else-if="index === 1">🥈</span>
            <span v-else-if="index === 2">🥉</span>
            <span v-else>{{ index + 1 }}</span>
          </div>
          
          <div class="entry-info flex-1">
            <div class="entry-score text-xl font-semibold text-slate-800">{{ formatScore(entry.score) }}</div>
            <div class="entry-details flex gap-4 text-xs text-slate-600 opacity-90 mb-1">
              <span class="entry-time">{{ formatTime(entry.timeElapsed) }}</span>
              <span class="entry-hints">{{ entry.hintsUsed }} hints</span>
              <span class="entry-errors">{{ entry.errorsCount }} errors</span>
            </div>
            <div class="entry-date text-[0.7rem] text-slate-500">{{ formatDate(entry.date) }}</div>
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
import { formatTime, formatScore } from '../features/sudoku/scoring'

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

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<style scoped>
.leaderboard {}

.leaderboard h3 {}

.difficulty-tabs {}

.tab-btn { border: none; color: #64748b; }

.tab-btn.active { background: white; color: #0f172a; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

.tab-btn:hover { color: #0f172a; }

.no-entries {}

.entries-list {}

.leaderboard-entry {}

.leaderboard-entry:hover {}

.leaderboard-entry.rank-1 {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #333;
}

.leaderboard-entry.rank-2 {
  background: linear-gradient(135deg, #C0C0C0, #A0A0A0);
  color: #333;
}

.leaderboard-entry.rank-3 {
  background: linear-gradient(135deg, #CD7F32, #B8860B);
  color: #333;
}

.rank-badge {}

.entry-info {}

.entry-score {}

.entry-details {}

.entry-date {}

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
