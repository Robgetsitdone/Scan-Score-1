# Scan & Score

## Overview
A mobile food scanning app built with Expo (React Native). Point your camera at a food label, get instant AI-powered ingredient analysis with red/yellow/green flags, a health score out of 100, and cleaner alternative suggestions.

## Architecture
- **Frontend**: Expo Router with file-based routing, 3 tabs (Scan, History, Preferences)
- **Backend**: Express server on port 5000 with `/api/analyze` and `/api/analyze-barcode` endpoints
- **AI**: OpenAI GPT-4o-mini via Replit AI Integrations for vision-based and text-based food label analysis
- **Storage**: AsyncStorage for local scan history, favorites, and user preferences (no database)
- **External API**: Open Food Facts API for barcode product lookups
- **Font**: DM Sans (Google Fonts)

## Key Files
- `app/(tabs)/index.tsx` - Main scan screen (camera/gallery/barcode capture + results)
- `app/(tabs)/history.tsx` - Past scans list with favorites filter and weekly score tracker
- `app/(tabs)/preferences.tsx` - Ingredient avoidance toggles
- `components/ScanResultView.tsx` - Full scan result display with share and favorite buttons
- `components/ScoreCircle.tsx` - Animated score ring
- `components/IngredientTag.tsx` - Red/yellow/green ingredient pills with tap-to-explain
- `components/AlternativeCard.tsx` - Swap suggestion cards
- `components/BreakdownBar.tsx` - Score breakdown visualization
- `components/HistoryItem.tsx` - History list item with score badge and favorite indicator
- `lib/types.ts` - TypeScript types (ScanResult, WeeklyStats, etc.)
- `lib/storage.ts` - AsyncStorage helpers (history, favorites, weekly stats, preferences)
- `server/routes.ts` - API endpoints for AI analysis (image + barcode)

## Features
- **Photo Scan**: Take a photo or pick from gallery, auto-converts HEIC to JPEG
- **Barcode Scan**: Scan product barcodes for instant lookup via Open Food Facts
- **AI Analysis**: GPT-4o-mini scores ingredients 0-100 with penalty/bonus formula
- **Ingredient Flags**: Red (avoid), yellow (caution), green (positive) with explanations
- **Alternatives**: Up to 3 cleaner product suggestions per scan
- **Share**: Native share sheet with text summary of scan results
- **Favorites**: Heart icon to save favorite scans, filter in History tab
- **Weekly Tracker**: Average score, scan count, and bar chart trend visualization
- **Preferences**: 8 ingredient avoidance toggles that affect scoring

## Recent Changes
- 2026-02-13: Added barcode scanning via expo-camera + Open Food Facts API
- 2026-02-13: Added share functionality (native share sheet with scan summary)
- 2026-02-13: Added favorites system (heart icon, AsyncStorage, filter in History)
- 2026-02-13: Added weekly score tracker (avg score, trend badge, bar chart)
- 2026-02-13: Fixed image analysis: switched to GPT-4o-mini, added HEIC-to-JPEG conversion
- 2026-02-13: Fixed body parser limit (25MB) for image uploads
- 2026-02-12: Initial build of Scan & Score MVP

## User Preferences
- No database — use AsyncStorage only for local persistence
