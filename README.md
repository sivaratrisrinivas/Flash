
# Flash: Real-Time Autocomplete for Upstash Redis

Flash is a simple tool built with TypeScript that adds a "search suggestions" feature to Upstash Redis. It uses a special list in Redis that keeps items sorted by score (like popularity) to give you fast, relevant suggestions as you type.

This project demonstrates how to build helpful, developer-friendly tools for modern, serverless applications and distributed data.

---

## Why This Project?

I created Flash to show how developers can extend Upstash—they make powerful databases (like Redis) truly easy to use without server headaches. I've faced slow and complicated search/autocomplete in my own projects, and wanted to make it fast and simple by combining TypeScript and Upstash.

- **What does it solve?** Autocomplete is a common need (for search bars, product pickers, chat, etc.), but it’s often slow or hard to scale. Flash uses Upstash Redis’ sorted sets to give instant, ranked suggestions, proving that real-time search can be easy and global.
- **Who is it for?** Developers building web apps, serverless APIs, or bots—anyone who wants plug-and-play autocomplete powered by Redis with zero infrastructure hassle.
- **What does this demo prove?** That you can bundle modern TypeScript, efficient Redis logic, and a serverless approach into a drop-in autocomplete SDK—with professional-level testing, packaging, and documentation.

---

## Features

- **Add Suggestions:** Incrementally add items (like product names) to a Redis sorted set; their "score" (popularity) can be increased any time.
- **Get Suggestions:** Query by prefix (e.g., `"ap"`), and get a ranked list back fast.
- **Reset for Testing:** Each run may start with clean test data for consistent, predictable results.
- **Robust Error Handling:** Multiple edge cases are tested—invalid input, missing data, empty state, negative/zero scores, etc.

---

## Setup and Usage

### Prerequisites

- [Bun](https://bun.sh/) (or Node.js)
- Upstash account (free tier is fine)

### Install

```
bun add @upstash/redis
```

### Example Usage

1. In `index.ts`, enter your Upstash Redis URL and Token.
2. Run:

   ```
   bun index.ts
   ```

3. You’ll see:
   - Data is cleared/reset
   - Fruits are added
   - Scores are shown
   - Suggestions for "ap" and "b" printed

Example output:

```
Reset autocomplete suggestions key
Added/Updated apple with increment 1
...
apple score: 1
banana score: 2
apricot score: 1
Suggestions for "ap": [ { item: "apple", score: 1 }, { item: "apricot", score: 1 } ]
Suggestions for "b": [ { item: "banana", score: 2 } ]
```

---

## Building as a Package

To build the distributable JavaScript and TypeScript outputs in `dist/`, run:

```
bun run build
```

The build output is [ignored in git](./.gitignore).

---

## Running the Tests

To ensure everything works—including edge cases and errors—run:

```
bun test
```

### What is tested?

- Adding, updating, and ranking suggestions
- Querying with normal and empty prefixes
- Handling of zero or negative scores
- Input mistakes (null/undefined), missing data, and empty states
- Respecting limits (including zero or missing limits)
- No actual Redis server is needed—the tests use a fast mock

---

## Next Steps

- Build a live demo app/front-end
- Experiment with advanced features (batch additions, case-insensitivity, fuzzy match)

---

**Have fun using and learning from Flash! Contributions, questions, and improvements are always welcome.**
```

**How to use it:**  
Copy the above into your project’s `README.md` (replacing the old content), then commit and push as you normally do.

This version is:
- Clear and free of jargon
- Explains the “why” very simply
- Covers installation, usage, building, and especially **testing (including edge cases and errors)**
- Friendly to real developers who might read/try your code

