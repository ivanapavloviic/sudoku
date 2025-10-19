<template>
  <div class="leaderboard">
    <h3>🏆 Leaderboard</h3>
    
    <div class="difficulty-tabs">
      <button
        v-for="(rank, key) in Rank"
        :key="key"
        class="tab-btn"
        :class="{ active: selectedDifficulty === rank }"
        @click="selectDifficulty(rank)"
      >
        {{ getDifficultyName(rank) }}
      </button>
    </div>
    
    <div class="leaderboard-content">
      <div v-if="currentEntries.length === 0" class="no-entries">
        <p>No records yet. Be the first to complete a {{ selectedDifficulty }} game!</p>
      </div>
      
      <div v-else class="entries-list">
        <div
          v-for="(entry, index) in currentEntries"
          :key="entry.id"
          class="leaderboard-entry"
          :class="`rank-${index + 1}`"
        >
          <div class="rank-badge">
            <span v-if="index === 0">🥇</span>
            <span v-else-if="index === 1">🥈</span>
            <span v-else-if="index === 2">🥉</span>
            <span v-else>{{ index + 1 }}</span>
          </div>
          
          <div class="entry-info">
            <div class="entry-score">{{ formatScore(entry.score) }}</div>
            <div class="entry-details">
              <span class="entry-time">{{ formatTime(entry.timeElapsed) }}</span>
              <span class="entry-hints">{{ entry.hintsUsed }} hints</span>
              <span class="entry-errors">{{ entry.errorsCount }} errors</span>
            </div>
            <div class="entry-date">{{ formatDate(entry.date) }}</div>
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
.leaderboard {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 0 auto;
}

.leaderboard h3 {
  text-align: center;
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.5rem;
}

.difficulty-tabs {
  display: flex;
  gap: 5px;
  margin-bottom: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 4px;
}

.tab-btn {
  flex: 1;
  background: transparent;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  font-weight: 500;
  color: #666;
}

.tab-btn.active {
  background: white;
  color: #4a90e2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tab-btn:hover {
  color: #4a90e2;
}

.no-entries {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.entries-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.leaderboard-entry {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-radius: 8px;
  background: #f9f9f9;
  transition: all 0.2s ease;
}

.leaderboard-entry:hover {
  background: #f0f8ff;
  transform: translateY(-1px);
}

.leaderboard-entry.rank-1 {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: white;
}

.leaderboard-entry.rank-2 {
  background: linear-gradient(135deg, #C0C0C0, #A0A0A0);
  color: white;
}

.leaderboard-entry.rank-3 {
  background: linear-gradient(135deg, #CD7F32, #B8860B);
  color: white;
}

.rank-badge {
  font-size: 1.5rem;
  min-width: 30px;
  text-align: center;
}

.entry-info {
  flex: 1;
}

.entry-score {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.entry-details {
  display: flex;
  gap: 15px;
  font-size: 0.8rem;
  opacity: 0.8;
  margin-bottom: 3px;
}

.entry-date {
  font-size: 0.7rem;
  opacity: 0.6;
}

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
