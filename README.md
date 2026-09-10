# Binaire FreznelAI Assessment

This repository contains the Model Selection Utility built for the Binaire assessment. It is a React application that provides searching, filtering, and sorting capabilities for a list of models fetched from the provided API.

## Features

- Model search by name and family with debounce and throttle handling.
- Filtering by pipeline tags, architecture tags, and safetensor ranges.
- Sorting by safetensor file count or model name.
- Offline support using IndexedDB to cache models and metadata.
- Authentication using Firebase Email/Password login.
- Built without async/await syntax, relying purely on Promise chains.
- Safe parsing of large JSON payloads using ReadableStream chunking.

## Tech Stack

- React 18
- TypeScript
- Vite
- Adobe React Spectrum (UI components)
- Firebase (Authentication)
- framer-motion (Animations)
- idb (IndexedDB caching)

## Project Structure

The codebase is organized following Object-Oriented Programming principles:

- src/models/: Contains the core business logic classes (ModelItem, ModelSearchEngine, ModelFilterEngine, ModelSortEngine, ModelCache, NetworkMonitor).
- src/services/: Contains singleton service classes for external communication (ApiService, AuthService, BackgroundFetcher).
- src/hooks/: Custom React hooks linking the UI to the underlying classes.
- src/components/: React UI components divided by functional domain.

## Setup Instructions

1. Install the dependencies:
   npm install

2. Start the development server:
   npm run dev

3. Build for production:
   npm run build

Note: The development server is configured to run on localhost:4000 to avoid port conflicts.
