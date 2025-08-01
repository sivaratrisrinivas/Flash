# Flash

*A blazing-fast, real-time autocomplete SDK for Upstash Redis.*

## Overview

Flash makes it trivial to add scalable, instant search suggestions/autocomplete to any Upstash Redis database. Powered by modern TypeScript and Upstash’s globally distributed Redis, Flash is built for serverless, web, bot, and API projects that demand speed and simplicity.

## Why Flash?

- **Instant, Ranked Suggestions:** Uses Redis sorted sets for live, prefix-based search suggestions—ranked by score (e.g., popularity).
- **Plug-and-Play Simplicity:** No server ops, no stateful headaches—just install, configure your Redis URL and token, and go.
- **Battle-Tested Error Handling:** Gracefully handles all edge cases: empty prefix, missing/invalid data, zero/negative scores, and more.
- **Developer First:** Strongly typed, well-tested, and documented.

## Features

- **Add Suggestions:** Incrementally add (or boost the score of) any item—suggest what your users search for most.
- **Get Suggestions:** Fetch a list of suggestions matching a prefix (with customizable result limits).
- **Works Locally or Serverless:** Easily mock/test locally—no actual Redis needed for tests.
- **Reset for Testing:** Start from a clean in-memory store for each test run.

## Installation

**Prerequisites:**
- [Bun](https://bun.sh/) (or Node.js)
- Upstash Redis account (free tier supported)

**Install:**

```bash
bun add @upstash/redis
```

## Usage Example

1. **Configure:**  
   In your `.env` or directly in your code, set your Upstash Redis credentials.

2. **Sample code (`index.ts` or your entrypoint):**

```typescript
import { Autocomplete } from "flash-upstash-autocomplete";
import { Redis } from "@upstash/redis";

const client = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});
const ac = new Autocomplete(client);

await ac.addSuggestion("apple", 1);
await ac.addSuggestion("banana", 2);

const results = await ac.getSuggestions("ap");
console.log(results); // [ { item: "apple", score: 1 } ]
```

## Running the Tests

Run comprehensive tests—including edge cases, limits, invalid input, and more—no actual Redis required:

```bash
bun test
```

### Tests include:
- Adding, incrementing, and ranking suggestions
- Empty/no-match scenarios
- Zero/negative scores and input validation
- Respects result limits
- Works with a fast in-memory store/mocking

## Building the Package

Compile distributable outputs (JS & types) to `dist/`:

```bash
bun run build
```

## Contributing & Next Steps

- PRs, issues, and questions are always welcome!
- Example extensions: case-insensitive search, fuzzy matching, or richer scoring.
