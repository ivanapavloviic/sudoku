<template>
  <div class="difficulty-selector">
    <h3>Choose Difficulty</h3>
    <div class="difficulty-options">
      <button
        v-for="(rank, key) in Rank"
        :key="key"
        class="difficulty-btn"
        :class="{ active: selectedRank === rank }"
        @click="selectDifficulty(rank)"
      >
        <div class="difficulty-name">{{ getDifficultyName(rank) }}</div>
        <div class="difficulty-range">{{ getDifficultyRange(rank) }}</div>
        <div class="difficulty-description">{{ getDifficultyDescription(rank) }}</div>
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
.difficulty-selector {
  text-align: center;
  padding: 20px;
}

.difficulty-selector h3 {
  margin-bottom: 20px;
  color: #333;
  font-size: 1.5rem;
}

.difficulty-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  max-width: 800px;
  margin: 0 auto;
}

.difficulty-btn {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.difficulty-btn:hover {
  border-color: #4a90e2;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.difficulty-btn.active {
  border-color: #4a90e2;
  background-color: #f0f8ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

.difficulty-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.difficulty-range {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
}

.difficulty-description {
  font-size: 0.8rem;
  color: #888;
  font-style: italic;
}

/* Responsive design */
@media (max-width: 600px) {
  .difficulty-options {
    grid-template-columns: 1fr;
  }
  
  .difficulty-btn {
    padding: 15px;
  }
}
</style>
