# Budgetery

A budget tracking application built entirely free on a home computer using open source tools.

## Made With

- **opencode** - AI coding assistant for streamlined development
- **Qwen Model (locally)** - Open-source LLM running locally for code generation and reasoning
- **Expo/React Native** - Cross-platform mobile framework
- **TypeScript** - Type-safe JavaScript
- **Jest** - Testing framework

## Goal

This project demonstrates how to build modern applications completely free on a usual home computer, specifically targeting current entry-level hardware like:

- Mac mini (M1/M2/M3)
- Entry-level MacBooks  
- Standard laptops with 8GB+ RAM

Everything runs locally without needing expensive cloud subscriptions or internet data charges.

## Local-first Development Philosophy

- All AI processing happens on your machine via local LLMs
- No recurring subscription costs for development tools
- Full control over your data and dependencies
- Works offline after initial setup

## Getting Started

```bash
npm install
npx expo start
```

Then run one of:
- `npm run ios` - iOS simulator  
- `npm run android` - Android emulator
- `npm run web` - Web development server

## Testing

```bash
npm test
```

## Architecture

See [AGENTS.md](./AGENTS.md) for detailed notes on:

- State management with reducers in `store/`
- File-based routing via `expo-router`  
- Tab navigation structure
- Component organization

## Why Build Locally?

1. **Zero development costs** - No cloud APIs needed
2. **Data privacy** - Your code and data never leaves your machine
3. **Internet independence** - Develop offline once setup is complete
4. **Customizable AI** - Tune Qwen model locally for your use case
5. **Open source stack** - Full transparency and control

## License

MIT
