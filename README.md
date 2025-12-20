# RideOn

#RideOn Backend = https://github.com/akilaManu-MaHiTo/rideon-server

Ride Smart, Ride Safe. RideOn.

RideOn is a smart mobility app designed to enhance safety and convenience for riders. It helps users navigate efficiently while providing real-time tracking and security alerts. If a rider deviates from their intended path or faces potential danger, the admin can instantly view their route and status — ensuring maximum safety and accountability.

## Key Features

🚗 Smart Navigation: Real-time route tracking with accurate directions.

🛡️ Safety Alerts: Admin gets notified if a user goes off-route or faces a risk.

📍 Live Location Tracking: Monitor rides and locations seamlessly.

👤 Admin Dashboard: Centralized control to manage users and trips.

📊 Ride History: Keep track of past rides and performance insights.

## Novelty

RideOn introduces a unique safety mechanism — if the user takes a wrong path or deviates from their route, the admin is immediately notified with live location updates, enhancing both security and transparency.

## Tech Stack

Frontend: React Native

Backend: Node.js, Express.js

Database: MongoDB Atlas

Hosting: Render / Vercel (adjust if needed)

Version Control: Git & GitHub

## Table of contents

- [About](#about)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment variables](#environment-variables)
  - [Development](#development)
  - [Production build](#production-build)
- [Project structure](#project-structure)
- [Scripts](#scripts)
- [Testing](#testing)
- [Linting & formatting](#linting--formatting)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgements](#acknowledgements)

## About

RideOn is a TypeScript-based application for connecting riders and drivers, providing booking, realtime updates, and trip management. Replace this paragraph with a quick summary of RideOn's purpose and high-level goals.

## Features

- User authentication (signup/login) — replace if different
- Search for rides and drivers
- Request and accept rides
- Real-time trip status updates (WebSockets / real-time)
- Payment integration (placeholder)
- Admin dashboard (placeholder)

## Tech stack

Primary languages:
- TypeScript (primary)
- CSS
- JavaScript

Common technologies to mention (edit to match repo):
- Frameworks: React Native
- Backend: Express
- Database: MongoDB

## Getting started

### Prerequisites

- Node.js >= 16 (or the version used by the project)
- npm or yarn or pnpm
- (Optional) Docker & Docker Compose if repository includes containers

### Installation

Clone the repo:

```bash
git clone https://github.com/SupunLiyanage88/RideOn.git
cd RideOn
```

Install dependencies (choose one):

```bash
npm install
# or
yarn
# or
pnpm install
```

### Environment variables

Create a .env file from the example (if present):

```bash
cp .env.example .env
```

Example environment variables (customize for your app):

```

# Backend URL
EXPO_PUBLIC_API_BASE_URL=""

# Weather API(Optional)
EXPO_PUBLIC_WEATHER_API_KEY=

# Google Map
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=
```

### Development

Run the development server (example):

```bash
npx expo start
```


Start (after build):

```bash
npm start
```

If the project is a monorepo or contains separate frontend/backend, run the relevant commands in each package.

## Project structure

Below is an example structure — update to reflect the repository:

```
/
├─ src/
│  ├─ client/            # frontend (ReactNative)
│  ├─ server/            # backend (Express) This is in another Repo
│  ├─ shared/            # shared types/utilities
│  └─ index.ts
├─ scripts/
├─ tests/
├─ .env.example
├─ package.json
└─ tsconfig.json
```

## Scripts

Common scripts (make sure these match package.json):

- npm run dev — start development server
- npm run build — build for production
- npm run start — start production server
- npm run test — run tests
- npm run lint — run linter
- npm run format — format code


## Contributing

Thanks for considering contributing! A suggested CONTRIBUTING.md should include:

- How to open issues and PRs
- Branching strategy
- Commit message conventions (Conventional Commits)
- How to run tests locally
- Coding standards

Basic workflow:

1. Fork the repository
2. Create a descriptive branch: git checkout -b feat/awesome-feature
3. Make changes, run tests and linters
4. Open a pull request with a clear summary of changes

## License

This project is licensed under the MIT License — see the LICENSE file for details.

## Contact

Project maintained by @SupunLiyanage88 (update with preferred contact/email).

## Acknowledgements

- Thank any libraries, tools, or contributors
- Add links to templates and references used

---
