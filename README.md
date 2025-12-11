# FitHood 🏋️

A personal fitness tracking Progressive Web App (PWA) for tracking calories, macros, weight, and workouts.

## Features

- **📊 Dashboard** - Overview of your fitness metrics with beautiful charts
- **🍎 Food Tracking** - Import food data via CSV, track calories and macros
- **💪 Workout Tracking** - Log exercises, sets, reps, and weights
- **⚖️ Weight Tracking** - Monitor your weight progress over time
- **📱 PWA Support** - Install on mobile for app-like experience
- **📤 CSV Import** - Easy data import from spreadsheets

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Beautiful responsive charts
- **IndexedDB (idb)** - Client-side data persistence
- **PapaParse** - CSV parsing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### Deploy to Vercel

```bash
# Install Vercel CLI (if not already)
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

## CSV Format

### Food CSV

```csv
date,name,calories,protein,carbs,fat
2024-01-15,Chicken Breast,165,31,0,3.6
2024-01-15,Brown Rice,216,5,45,1.8
```

**Supported columns:** date, name/food, calories/cals, protein, carbs, fat, fiber, sugar, meal/mealtype

### Workout CSV

```csv
date,exercise,category,sets,reps,weight
2024-01-15,Bench Press,strength,4,10,60
2024-01-15,Running,cardio,1,,30
```

**Supported columns:** date, exercise/name, category/type, sets, reps, weight, duration, distance, caloriesburned, notes

## Data Storage

All data is stored locally in your browser using IndexedDB. Your fitness data never leaves your device unless you export it.

## License

MIT

