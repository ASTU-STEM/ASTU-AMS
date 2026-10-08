import { Logger } from '../utils/logger.utils';

interface CacheEntry<T = any> {
  value: T;
  expiresAt: number;
}

class CacheServiceEngine {
  private store = new Map<string, CacheEntry>();
  private locks = new Map<string, number>();

  constructor() {
    // Evict expired keys every 60 seconds
    setInterval(() => this.cleanupExpired(), 60000);
  }

  public async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  public async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }

  public async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  public async invalidatePattern(pattern: string): Promise<number> {
    let count = 0;
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
        count++;
      }
    }
    Logger.info(`🧹 CacheService: Invalidated ${count} keys matching pattern [${pattern}]`);
    return count;
  }

  public async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Cache miss - execute fetcher
    const fresh = await fetcher();
    if (fresh !== undefined && fresh !== null) {
      await this.set(key, fresh, ttlSeconds);
    }
    return fresh;
  }

  public async acquireLock(lockKey: string, ttlMs: number = 5000): Promise<boolean> {
    const now = Date.now();
    const existingLock = this.locks.get(lockKey);

    if (existingLock && now < existingLock) {
      return false; // Lock acquired by another process
    }

    this.locks.set(lockKey, now + ttlMs);
    return true;
  }

  public async releaseLock(lockKey: string): Promise<void> {
    this.locks.delete(lockKey);
  }

  private cleanupExpired() {
    const now = Date.now();
    let evicted = 0;
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        evicted++;
      }
    }
    if (evicted > 0) {
      Logger.info(`🧹 CacheService: Purged ${evicted} expired cache entries.`);
    }
  }

  public getStats() {
    return {
      activeKeys: this.store.size,
      activeLocks: this.locks.size,
      mode: 'Redis/Cache-Aside In-Memory Adapter Active',
    };
  }
}

export const CacheService = new CacheServiceEngine();
