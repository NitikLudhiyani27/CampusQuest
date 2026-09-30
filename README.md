Understood. Keep the README minimal and make the actual game state machine the source of truth.

# CampusQuest

CampusQuest is a campus-based territory control game where two factions compete to capture and defend physical locations across campus.

Players solve riddles to unlock territories, receive resonators, physically deploy them, and work together to control territory.

## Core Gameplay

```text
RIDDLE
  ↓
RESONATOR
  ↓
DEPLOY
  ↓
3 / 3 RESONATORS
  ↓
CONTROLLED
  ↓
ATTACK / DEFEND
```

A territory requires **3 active resonators from 3 players** to become controlled.

### Territory States

```text
NEUTRAL / RECLAIMABLE
        │
        ▼
     CONTROLLED
        │
        ├── ATTACK
        │     ↓
        │   DESTROY
        │     ↓
        │  RECLAIMABLE
        │
        └── DEFENSE
              ↓
         LOCK TERRITORY
```

A controlled territory belongs to a faction. Opposing players can attack its resonators. Defenders can lock the territory when the required owners confirm their control.

## Tech Stack

- React + Vite
- JavaScript
- Firebase Authentication
- MapLibre GL
- PWA
- Geolocation / device orientation

## Setup

```bash
npm install
npm run dev
```

Create `.env`:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_STORAGE_BUCKET=
```

Do not commit `.env`.

## Project Status

CampusQuest is currently in development.

Current focus:

- Authentication
- Mobile-first UI
- Campus map
- Territory state machine
- Riddle → Resonator → Deployment flow
- Faction control
- Attack / defense mechanics

## Factions

Two factions compete for control:

**RED** vs **BLUE**

The objective is simple: **capture, control, defend, and reclaim territory across the campus.**