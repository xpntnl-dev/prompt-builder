/**
 * Simple in-memory cache with time-based invalidation
 * Suitable for server-side caching of external API responses
 */

interface CacheEntry<T> {
	data: T;
	timestamp: number;
}

class Cache {
	private store = new Map<string, CacheEntry<unknown>>();

	/**
	 * Get cached data if it exists and hasn't expired
	 * @param key - Cache key
	 * @param maxAgeMs - Maximum age in milliseconds (default: 15 minutes)
	 * @returns Cached data or null if expired/missing
	 */
	get<T>(key: string, maxAgeMs: number = 15 * 60 * 1000): T | null {
		const entry = this.store.get(key) as CacheEntry<T> | undefined;

		if (!entry) {
			return null;
		}

		const age = Date.now() - entry.timestamp;
		if (age > maxAgeMs) {
			// Cache expired, remove it
			this.store.delete(key);
			return null;
		}

		return entry.data;
	}

	/**
	 * Set cache data with current timestamp
	 * @param key - Cache key
	 * @param data - Data to cache
	 */
	set<T>(key: string, data: T): void {
		this.store.set(key, {
			data,
			timestamp: Date.now()
		});
	}

	/**
	 * Clear specific cache entry
	 * @param key - Cache key to clear
	 */
	clear(key: string): void {
		this.store.delete(key);
	}

	/**
	 * Clear all cache entries
	 */
	clearAll(): void {
		this.store.clear();
	}

	/**
	 * Get cache statistics
	 */
	getStats() {
		return {
			size: this.store.size,
			keys: Array.from(this.store.keys())
		};
	}
}

// Export singleton instance
export const cache = new Cache();
