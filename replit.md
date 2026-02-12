# Scan & Score

## Overview
A mobile food scanning app built with Expo (React Native). Point your camera at a food label, get instant AI-powered ingredient analysis with red/yellow/green flags, a health score out of 100, and cleaner alternative suggestions.

## Architecture
- **Frontend**: Expo Router with file-based routing, 3 tabs (Scan, History, Preferences)
- **Backend**: Express server on port 5000 with `/api/analyze` endpoint
- **AI**: OpenAI GPT-5-mini via Replit AI Integrations for vision-based food label analysis
- **Storage**: AsyncStorage for local scan history and user preferences (no database)
- **Font**: DM Sans (Google Fonts)

## Key Files
- `app/(tabs)/index.tsx` - Main scan screen (camera/gallery capture + results)
- `app/(tabs)/history.tsx` - Past scans list
- `app/(tabs)/preferences.tsx` - Ingredient avoidance toggles
- `components/ScanResultView.tsx` - Full scan result display
- `components/ScoreCircle.tsx` - Animated score ring
- `components/IngredientTag.tsx` - Red/yellow/green ingredient pills with tap-to-explain
- `components/AlternativeCard.tsx` - Swap suggestion cards
- `components/BreakdownBar.tsx` - Score breakdown visualization
- `lib/types.ts` - TypeScript types
- `lib/storage.ts` - AsyncStorage helpers
- `server/routes.ts` - API endpoint for AI analysis

## Recent Changes
- 2026-02-12: Initial build of Scan & Score MVP

## User Preferences
- None recorded yet
