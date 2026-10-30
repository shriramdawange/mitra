# Mitra Flutter App

Mitra is a personal growth, productivity, and planning app with iOS-inspired UI.

## Features
- Daily goals + tracking
- Calendar events
- Reminders
- Todo lists
- Daily stats
- Learning list
- PDF/Wishlist store
- Personal development logs
- Opportunity tracking + update fetch

## Run
1. Install Flutter SDK.
2. From this folder:
   - `flutter pub get`
   - `flutter run --dart-define=MITRA_API_BASE_URL=http://10.0.2.2:3000`

For iOS simulator, use:
- `MITRA_API_BASE_URL=http://127.0.0.1:3000`

## Backend API
This app consumes Next.js endpoints under `/api/mitra/*`.
