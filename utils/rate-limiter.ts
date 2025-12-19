// ===================================
// FILE: src/utils/rate-limiter.ts
// ===================================

export interface RateLimitState {
  count: number;
  windowStart: number;
}

export class RateLimiter {
  // Config: Max 2 jobs per 60 seconds
  static readonly LIMIT = 2;
  static readonly WINDOW_MS = 60 * 1000; 

  static async check(
    userId: string, 
    state: any
  ): Promise<{ allowed: boolean; remaining?: number }> {
    
    const key = `rate-limit:${userId}`;
    const now = Date.now();

    // 1. Get current usage from State
    const current = (await state.get('rate-limits', key)) as RateLimitState | null;

    // 2. If no record, or window has expired -> Reset
    if (!current || (now - current.windowStart > this.WINDOW_MS)) {
      await state.set('rate-limits', key, {
        count: 1,
        windowStart: now
      });
      return { allowed: true, remaining: this.LIMIT - 1 };
    }

    // 3. If within window, check limit
    if (current.count >= this.LIMIT) {
      return { allowed: false, remaining: 0 };
    }

    // 4. Increment count
    await state.set('rate-limits', key, {
      ...current,
      count: current.count + 1
    });

    return { allowed: true, remaining: this.LIMIT - (current.count + 1) };
  }
}