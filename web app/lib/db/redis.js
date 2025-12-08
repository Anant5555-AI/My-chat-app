/**
 * Mock Redis for local development without a real Redis server.
 * Uses an in-memory Map.
 */
class MockRedis {
  constructor() {
    this.store = new Map();
  }

  async set(key, value, mode, duration) {
    this.store.set(key, value);
    if (mode === "EX" && duration) {
      setTimeout(() => {
        this.store.delete(key);
      }, duration * 1000);
    }
    return "OK";
  }

  async get(key) {
    return this.store.get(key) || null;
  }

  async del(key) {
    this.store.delete(key);
    return 1;
  }
}

// Global instance to persist across HMR/reloads in dev
global.mockRedisInstance = global.mockRedisInstance || new MockRedis();

export function getRedis() {
  return global.mockRedisInstance;
}


