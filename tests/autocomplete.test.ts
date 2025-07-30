import { describe, it, expect, beforeEach } from "bun:test";
import { Autocomplete } from "../index";

// MockRedis class with all best-practice fixes for warnings and edge cases
class MockRedis {
  store: Record<string, Record<string, number>> = {};

  async zincrby(key: string, value: number, member: string): Promise<void> {
    if (!this.store[key]) this.store[key] = {};
    this.store[key][member] = (this.store[key][member] ?? 0) + value;
  }

  async zscore(key: string, member: string): Promise<number> {
    if (this.store[key] && this.store[key][member] !== undefined) {
      return this.store[key][member];
    }
    return 0;
  }

  async zrange(
    key: string,
    start: number,
    stop: number,
    opts: { rev?: boolean; withScores?: boolean } = {}
  ) {
    const items = Object.entries(this.store[key] || {});
    let arr = items.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    if (opts.rev) arr = arr.reverse();
    const flat: string[] = [];
    for (const [item, score] of arr.slice(start, stop + 1)) {
      flat.push(item, String(score));
    }
    return flat;
  }
  async del(key: string) {
    delete this.store[key];
  }
}

describe("Autocomplete SDK", () => {
  let ac: Autocomplete;
  let redis: MockRedis;
  const key = "autocomplete:suggestions";

  beforeEach(async () => {
    redis = new MockRedis();
    ac = new Autocomplete(redis as any);
    await redis.del(key);
  });

  it("adds and increments scores", async () => {
    await ac.addSuggestion("apple", 1);
    await ac.addSuggestion("banana", 2);
    expect(await redis.zscore(key, "apple")).toBe(1);
    expect(await redis.zscore(key, "banana")).toBe(2);
    await ac.addSuggestion("apple", 1);
    expect(await redis.zscore(key, "apple")).toBe(2);
  });

  it("returns suggestions by prefix", async () => {
    await ac.addSuggestion("apple", 3);
    await ac.addSuggestion("apricot", 2);
    await ac.addSuggestion("banana", 5);
    const ap = await ac.getSuggestions("ap", { limit: 5 });
    expect(ap.length).toBe(2);
    expect(ap.map(s => s.item)).toEqual(expect.arrayContaining(["apple", "apricot"]));
    const b = await ac.getSuggestions("b");
    expect(b.length).toBe(1);
    expect(b[0]?.item).toBe("banana");
  });

  it("respects the limit option", async () => {
    await ac.addSuggestion("alpha", 1);
    await ac.addSuggestion("alpine", 2);
    await ac.addSuggestion("alps", 3);
    const limited = await ac.getSuggestions("al", { limit: 2 });
    expect(limited.length).toBe(2);
  });

  it("handles empty prefix (returns all up to limit)", async () => {
    await ac.addSuggestion("cat", 2);
    await ac.addSuggestion("dog", 1);
    const all = await ac.getSuggestions("", { limit: 5 });
    expect(all.length).toBe(2);
    expect(all.map(s => s.item)).toEqual(expect.arrayContaining(["cat", "dog"]));
  });

  it("handles prefix with no matches", async () => {
    await ac.addSuggestion("cat", 1);
    const matches = await ac.getSuggestions("zebra");
    expect(matches.length).toBe(0);
  });

  it("does not throw if requesting score for non-existent item", async () => {
    const score = await redis.zscore(key, "nosuchitem");
    expect(score).toBe(0); // Should safely fallback
  });

  it("throws if suggestion is undefined/null or not a string", async () => {
    // @ts-expect-error
    await expect(ac.addSuggestion(undefined, 1)).rejects.toThrow();
    // @ts-expect-error
    await expect(ac.addSuggestion(null, 1)).rejects.toThrow();
    // @ts-expect-error
    await expect(ac.addSuggestion(123 as any, 1)).rejects.toThrow();
    // @ts-expect-error
    await expect(ac.addSuggestion("", 1)).rejects.toThrow();
  });

  it("returns empty array if suggestion list is empty", async () => {
    const res = await ac.getSuggestions("foo");
    expect(res).toEqual([]);
  });

  it("respects zero and negative score increments", async () => {
    await ac.addSuggestion("zero", 0);
    await ac.addSuggestion("minus", -5);
    const minusScore = await redis.zscore(key, "minus");
    expect(minusScore).toBe(-5);
    const zeroScore = await redis.zscore(key, "zero");
    expect(zeroScore).toBe(0);
  });

  it("returns empty array if limit is less than 1", async () => {
    await ac.addSuggestion("foo", 5);
    const res = await ac.getSuggestions("f", { limit: 0 });
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBe(0);
  });
});
