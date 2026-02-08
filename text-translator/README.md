# Text Translator

A simple text translator UI built with React + Vite + Tailwind CSS. It translates English input into a selected target language using the Google Translate API on RapidAPI.

Live demo: https://rudrani-dv.github.io/text-translator/

## Features

- English → selected language translation
- Copy translated output
- Clear input/output
- Friendly error states for missing API key / wrong endpoint

## Tech stack

- React
- Vite
- Tailwind CSS
- ESLint

## Getting started

### Prerequisites

- Node.js 18+ (recommended)

### Install

```bash
npm install
```

### Configure environment variables

Create a `.env` file in the project root:

```bash
VITE_RAPIDAPI_KEY=your_rapidapi_key_here
VITE_RAPIDAPI_URL=https://google-translate1.p.rapidapi.com/language/translate/v2
VITE_RAPIDAPI_HOST=google-translate1.p.rapidapi.com
```

Only `VITE_RAPIDAPI_KEY` is required. If you omit `VITE_RAPIDAPI_URL` and `VITE_RAPIDAPI_HOST`, the app falls back to the defaults above.

Do not commit your `.env` file (it contains secrets).

### Run locally

```bash
npm run dev
```

## Scripts

```bash
npm run dev       # start dev server
npm run build     # production build
npm run preview   # preview production build locally
npm run lint      # lint the codebase
```

## Deploy (GitHub Pages)

This project is configured for GitHub Pages with:

- `base: '/text-translator/'` in `vite.config.js`
- `homepage` in `package.json`

Install `gh-pages` (the deploy script depends on it):

```bash
npm i -D gh-pages
```

Then build and deploy:

```bash
npm run build
npm run deploy
```

If you fork/rename the repo, update the `base` path and `homepage` URL to match your repository name.
