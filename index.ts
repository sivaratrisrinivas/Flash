import { Redis } from '@upstash/redis';

interface Suggestion {
  item: string;
  score: number;
}

interface SuggestOptions {
  limit?: number;
}

export class Autocomplete {
  private redis: Redis;

  constructor(redisClient: Redis) {
    this.redis = redisClient;
  }

  async addSuggestion(item: string, scoreIncrement: number = 1): Promise<void> {
    const key = 'autocomplete:suggestions'; // ZSET key
    await this.redis.zincrby(key, scoreIncrement, item);
    console.log(`Added/Updated ${item} with increment ${scoreIncrement}`);
  }

  async getSuggestions(prefix: string, options: SuggestOptions = {}): Promise<Suggestion[]> {
    const { limit = 5 } = options;
    const key = 'autocomplete:suggestions';
    
    // Fetch top 100 items by score descending (adjust 100 if needed for larger sets)
    const rangeResults = await this.redis.zrange(key, 0, 99, {
      rev: true, // Reverse for descending score order
      withScores: true // Include scores in the response
    });
    
    // rangeResults is flat: [item1, score1, item2, score2, ...]
    const suggestions: Suggestion[] = [];
    for (let i = 0; i < rangeResults.length; i += 2) {
      const item = rangeResults[i] as string;
      const score = Number(rangeResults[i + 1]);
      
      if (item.startsWith(prefix)) {
        suggestions.push({ item, score });
      }
      
      if (suggestions.length >= limit) break; // Stop early once we hit the limit
    }
    
    return suggestions;
  }
}

// Usage example (for testing multiple fruits and queries)
(async () => {
  const client = new Redis({ url: 'https://better-frog-5017.upstash.io', token: 'AROZAAIjcDE3ZDc2ZTk3ZGNlNTY0MzhjOWFjMjdmZDIyM2JmZTE3ZXAxMA' });
  const ac = new Autocomplete(client);

  const key = 'autocomplete:suggestions';

  // Reset the key before adding (clears previous data)
  await client.del(key);
  console.log('Reset autocomplete suggestions key');

  // Add multiple fruits
  await ac.addSuggestion('apple', 1); // Score: 1
  await ac.addSuggestion('banana', 1); // Score: 1
  await ac.addSuggestion('banana', 1); // Increment to 2
  await ac.addSuggestion('apricot', 1); // Score: 1

  // Check and log scores for multiple fruits
  const fruits = ['apple', 'banana', 'apricot'];
  for (const fruit of fruits) {
    const score = await client.zscore(key, fruit);
    console.log(`${fruit} score: ${score}`);
  }

  // Test suggestions for "ap"
  const apSuggestions = await ac.getSuggestions('ap', { limit: 2 });
  console.log('Suggestions for "ap":', apSuggestions);

  // Test suggestions for "b"
  const bSuggestions = await ac.getSuggestions('b', { limit: 1 });
  console.log('Suggestions for "b":', bSuggestions);
})();
