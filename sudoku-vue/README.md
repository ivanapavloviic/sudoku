# Sudoku Game — Vue 3 + TypeScript + Vite

A fully interactive Sudoku game built with **Vue 3**, **TypeScript**, and **Vite**, implementing all classical Sudoku rules, random puzzle generation, scoring, hints, and a persistent leaderboard.

Every game is unique, validated in real time, and structured following clean architecture principles.

---

## Features

- Classical Sudoku rules (9×9 grid with digits 1–9 appearing once per row, column, and box)
- Four difficulty levels:
  - Beginner (36–40 visible cells)
  - Intermediate (32–36 visible cells)
  - Hard (28–32 visible cells)
  - Expert (24–28 visible cells)
- Pre-filled cells are locked (non-editable)
- Immediate validation of user input with visual error highlighting
- Randomly generated puzzles ensuring unique games each time
- Hint system (up to 10 hints per game)
- Available digits panel that grays out completed numbers
- Timer tracking the duration of each game
- Persistent Leaderboard (Top 3 scores per rank) stored in `localStorage`

---

## Scoring System

### Part 1 – Base Points

| Action | Effect |
|--------|---------|
| Correct cell | +5 points |
| Error input | −1 point |
| First hint | −3 points |
| Each next hint | −1 additional point from previous hint (−3, −4, −5, …) |

### Part 2 – Time Bonus
Final Score = (Part 1) + (500 − TimeElapsedInSeconds)

Only successfully completed games are eligible for the leaderboard.

---

## Installation

```bash
cd sudoku-vue
npm install
npm run dev

The app runs locally at: http://localhost:5173/
App is deployed to: https://ivanapavloviic.github.io/sudoku/

