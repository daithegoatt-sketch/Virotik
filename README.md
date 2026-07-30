# ViroTik Studio

Arabic-first creator tools for short-form video content. The app is intentionally lightweight and uses no paid APIs.

## Included tools

- Content idea generator
- Hook generator
- Caption and hashtag generator
- Engagement-rate calculator
- Sponsored-post rate estimator (KWD)
- Local weekly content planner

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:3000`. Health check: `GET /health`.

## Railway

Railway detects the Node project automatically and runs `npm start`. The server binds to `0.0.0.0` and uses Railway's `PORT` environment variable.
