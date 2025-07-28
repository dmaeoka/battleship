# Battleship Challenge – Magnolia Technical Assignment

This is a single-player version of the classic **Battleship** game, developed as part of the Magnolia Frontend Technical Assignment. The player enters coordinate-based attacks (e.g., "A5") to sink randomly placed ships on a 10x10 board.

---

## Features

- 10x10 game grid with labeled rows and columns (A–J, 1–10)
- Random placement of ships:
    - 1 Battleship (5 cells)
    - 2 Destroyers (4 cells each)
- Input validation (e.g., "A5", "J10")
- Clear feedback:
    - **Hit**
    - **Miss**
    - **Sunk**
    - **Game Over**
- Snackbar messages and animations
- Responsive UI built with **React**, **TypeScript**, and **MUI**
- Fully tested with **Jest** and **React Testing Library**

---

## Tech Stack

- **React + TypeScript**
- **Material UI (MUI)**
- **Vite** (bundler)
- **Jest** for testing
- **CSS Animations + Motion One** for effects

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/dmaeoka/battleship.git
cd battleship
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

### 4. Run tests

```bash
npm test
```

---

## Coordinate Format

Enter coordinates in the form:

- `A1`, `B5`, `J10`, etc.
- Must be a letter A–J followed by a number 1–10
- Invalid input will trigger an error message
- It will highlight the target cell

---

## Tests Included

Unit and integration tests cover:

- Game logic (`doesShipCollide`, `generateRandomShip`)
- UI component rendering
- User interactions
- Form submission and feedback

Run them with:

```bash
npm test
```

---

## Project Structure

```
public/
src/
├── components/          # Game UI components (Board, Input, Cell)
  ├── __tests__/       # Test files for battleship and components
├── constants/           # Game constants
├── hooks/               # Custom React hooks for game state
├── logic/               # Core game mechanics and logic
  ├──__tests__/        # Test files gameLogic and generateRandomShip
├── styles/              # Custom CSS animations
├── theme/               # MUI theme
├── types/               # Type definitions
├── utils/               # Helper functions (e.g., coordinate parser)
  ├──__tests__/        # Test files for utils.ts
├── main.tsx             # HTML entry point
├── index.html           # HTML entry point
```

---

## If I Had More Time

Given additional time, I would:

- Add more animations
- Improve **mobile responsiveness**
- Add **keyboard support** for faster input
- Add a **restart button**
- Store **move history** and statistics
- Include **accessibility improvements**

---

## Notes

This project was developed under the constraints of the assignment with a focus on code clarity, modularity, and quality. All core requirements have been implemented, and the UI is built to be extendable.
