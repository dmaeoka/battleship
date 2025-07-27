# Battleship Game - Magnolia Technical Assignment

A React-based implementation of the classic Battleship game where a single player battles against computer-placed ships on a 10x10 grid.

## 🎮 Game Overview

This is a one-sided Battleship game where:

- Player attacks computer ships on a 10x10 grid
- Ships are randomly placed by the computer
- Player enters coordinates (e.g., "A5") to target squares
- Game ends when all ships are destroyed

### Ship Configuration

- **1x Battleship** (5 squares)
- **2x Destroyers** (4 squares)

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd battleship-game
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## 🎯 How to Play

1. **Start Game**: Click "Start New Game" to initialize the board with randomly placed ships
2. **Target**: Enter coordinates in the format "A5" (column letter + row number)
    - Columns: A-J
    - Rows: 1-10
3. **Attack**: Press Enter or click "Fire!" to attack the target
4. **Results**:
    - **Miss**: Grey square - no ship at that location
    - **Hit**: Red square - you hit a ship
    - **Sunk**: Message displays ship type when completely destroyed
5. **Win**: Game ends when all ships are sunk

## 🏗️ Architecture & Technology Stack

### Frontend Stack

- **React 18** - Component-based UI framework
- **TypeScript** - Type safety and better development experience
- **Vite** - Fast build tool and development server
- **Material-UI (MUI)** - Component library for consistent UI
- **CSS Modules** - Scoped styling

### Project Structure

```
src/
├── components/          # React components
│   ├── GameBoard/      # Main game board component
│   ├── InputPanel/     # Coordinate input interface
│   └── MessageSnackbar/ # Game notifications
├── hooks/              # Custom React hooks
│   └── useGameState.ts # Game state management
├── gameLogic/          # Core game logic
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── constants/          # Game configuration constants
```

### Key Features

- **Clean Architecture**: Separation of concerns with dedicated layers for UI, state management, and game logic
- **Custom Hooks**: Reusable state logic with `useGameState`, `useInputHandler`, and `useAttackHandler`
- **Type Safety**: Comprehensive TypeScript types for all game entities
- **Responsive Design**: Works on desktop and mobile devices
- **Code Splitting**: Optimized bundle splitting for better performance
- **Smart Computer AI**: Basic targeting algorithm for more realistic gameplay

## 🧪 Quality Features

### Code Quality

- **TypeScript**: Full type coverage for runtime safety
- **ESLint**: Code linting with React and TypeScript rules
- **Prettier**: Consistent code formatting
- **Custom Hooks**: Reusable and testable state logic
- **Pure Functions**: Immutable state updates and functional programming principles

### User Experience

- **Input Validation**: Real-time coordinate format validation
- **Visual Feedback**: Clear hit/miss/sunk indicators
- **Responsive Messages**: Contextual feedback for all game actions
- **Accessibility**: Semantic HTML and keyboard navigation support
- **Loading States**: Smooth transitions between game states

### Performance

- **Code Splitting**: Lazy loading of components
- **Optimized Rendering**: Minimal re-renders with proper dependency arrays
- **Bundle Optimization**: Tree shaking and minification

## 🧩 Game Logic Implementation

### Ship Placement Algorithm

- Random position generation with collision detection
- Validates ship boundaries within the 10x10 grid
- Ensures ships don't overlap
- Supports both horizontal and vertical orientations

### Attack System

- Coordinate validation and conversion
- Hit detection with ship tracking
- State management for board updates
- Win condition checking

### Smart Computer Targeting (Future Enhancement)

- Basic random targeting currently implemented
- Placeholder for more advanced AI strategies

## 🚀 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues

## 🔧 Configuration

### Vite Configuration

- Code splitting configuration for optimal bundle sizes
- Development server setup
- Build optimizations

### Game Configuration

All game settings are centralized in `src/constants/index.ts`:

- Grid size (10x10)
- Ship configurations
- Attack delay timing
- Coordinate validation patterns

## 🎯 Future Enhancements

Given more time, I would focus on these improvements:

### Gameplay Features

- **Two-Player Mode**: Allow human vs human gameplay
- **Difficulty Levels**: Multiple AI strategies (easy, medium, hard)
- **Ship Placement**: Allow manual ship placement by player
- **Game Statistics**: Track wins, accuracy, average game time
- **Sound Effects**: Audio feedback for hits, misses, and sinking ships
- **Animations**: Smooth transitions for attacks and ship sinking

### Technical Improvements

- **Unit Testing**: Comprehensive test suite with Jest and React Testing Library
- **E2E Testing**: Cypress or Playwright for full user journey testing
- **State Management**: Redux Toolkit for more complex state scenarios
- **PWA Features**: Offline capability and mobile app-like experience
- **Multiplayer**: WebSocket integration for real-time multiplayer
- **Database**: Persistent game statistics and leaderboards

### UI/UX Enhancements

- **Themes**: Dark/light mode toggle
- **Mobile Optimization**: Better touch controls and responsive design
- **Accessibility**: WCAG compliance improvements
- **Internationalization**: Multi-language support
- **Tutorial**: Interactive onboarding for new players

### Performance & Monitoring

- **Error Tracking**: Sentry integration for production monitoring
- **Analytics**: User behavior tracking and game metrics
- **Performance Monitoring**: Web Vitals tracking
- **Caching**: Service worker for offline functionality

## 🤖 AI Usage Declaration

This project was developed with assistance from Claude AI for:

- Code structure and architecture decisions
- TypeScript type definitions
- React hooks optimization
- Build configuration setup
- Documentation creation

All core game logic, component design, and architectural decisions were human-driven, with AI providing implementation suggestions and code review.

## 📝 Development Notes

### Time Management

- **Initial Setup**: 1 hour (project scaffolding, dependencies)
- **Core Game Logic**: 2.5 hours (ship placement, attack system, win conditions)
- **UI Components**: 2 hours (game board, input panel, styling)
- **State Management**: 1 hour (custom hooks, state optimization)
- **Testing & Polish**: 30 minutes (manual testing, bug fixes, documentation)

### Key Design Decisions

1. **Custom Hooks**: Chose custom hooks over Redux for simpler state management
2. **TypeScript**: Prioritized type safety for better maintainability
3. **Material-UI**: Selected for rapid development and consistent design
4. **Functional Components**: Used modern React patterns throughout
5. **Immutable Updates**: Ensured predictable state changes

## 🐛 Known Issues

- Game board responsiveness could be improved on very small screens
- No persistence of game state between browser sessions
- Limited accessibility features for screen readers

## 📄 License

This project is created for the Magnolia Technical Assignment.

---

**Total Development Time**: ~6 hours  
**Primary Focus**: Clean, maintainable code with good user experience  
**Testing**: Manual testing completed, automated tests would be next priority
