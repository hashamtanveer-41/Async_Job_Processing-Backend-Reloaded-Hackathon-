export interface RateLimitState {
  count: number;
  windowStart: number;
}

export class RateLimiter {
  static readonly LIMIT = 2;
  static readonly WINDOW_MS = 60 * 1000; 

  static async check(
    userId: string, 
    state: any
  ): Promise<{ allowed: boolean; remaining?: number }> {
    const key = `rate-limit:${userId}`;
    const now = Date.now();
    const current = (await state.get('rate-limits', key)) as RateLimitState | null;
    if (!current || (now - current.windowStart > this.WINDOW_MS)) {
      await state.set('rate-limits', key, {
        count: 1,
        windowStart: now
      });
      return { allowed: true, remaining: this.LIMIT - 1 };
    }
    if (current.count >= this.LIMIT) {
      return { allowed: false, remaining: 0 };
    }
    await state.set('rate-limits', key, {
      ...current,
      count: current.count + 1
    });
    return { allowed: true, remaining: this.LIMIT - (current.count + 1) };
  }
}