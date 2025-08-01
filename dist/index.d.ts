import { Redis } from '@upstash/redis';
interface Suggestion {
    item: string;
    score: number;
}
interface SuggestOptions {
    limit?: number;
}
export declare class Autocomplete {
    private redis;
    constructor(redisClient: Redis);
    addSuggestion(item: string, scoreIncrement?: number): Promise<void>;
    getSuggestions(prefix: string, options?: SuggestOptions): Promise<Suggestion[]>;
}
export {};
