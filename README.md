# Recipe Book

An Angular recipe application with support for recipe browsing, favorites, PDF export, QR code sharing, and server-side rendering.

## Features

- Browse a list of recipes with details and ingredients
- Mark recipes as favorites
- Share recipe cards using QR codes
- Export recipes or cards as PDF documents
- Search history and recently viewed recipe tracking
- Responsive UI built with Angular Material
- Server-side rendering support for faster initial loading

## Tech stack

- Angular 19
- Angular Material
- Angular Universal (SSR)
- Express.js
- html2canvas and jsPDF for PDF export
- qrcode for QR code generation

## Getting started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

Open your browser to `http://localhost:4200/`.

## Development

To run a live development build with file watching:

```bash
npm run watch
```

## Server-Side Rendering

Build the SSR application and start the server:

```bash
npm run build
npm run serve:ssr:recipe-book
```

Then open `http://localhost:4200/`.

## Build

Create a production build:

```bash
npm run build
```

The compiled output is stored in the `dist/` directory.

## Tests

Run unit tests with Karma:

```bash
npm test
```

## Project structure

- `src/app/core/` – services, models, and shared application logic
- `src/app/features/` – feature components for recipes, favorites, and dashboard
- `src/app/shared/` – shared reusable UI components such as dialogs and skeleton loaders
- `src/public/` – static assets and SSR entry points

## Notes

This repository uses Angular CLI conventions and is configured for both client-side and server-side rendering. Adjust component templates, services, and routes as needed for further recipe app functionality.
