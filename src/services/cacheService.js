// src/services/cacheService.js
class CacheService {
    constructor() {
        this.cache = new Map();
        this.defaultTTL = 5 * 60 * 1000; // 5 minutes default
    }

    /**
     * Set a value in cache
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttl - Time to live in milliseconds
     */
    set(key, value, ttl = this.defaultTTL) {
        const expiry = Date.now() + ttl;
        this.cache.set(key, { value, expiry });

        // Auto-cleanup when cache gets too large
        if (this.cache.size > 100) {
            this.cleanup();
        }
    }

    /**
     * Get a value from cache
     * @param {string} key - Cache key
     * @returns {any|null} - Cached value or null if expired/not found
     */
    get(key) {
        const item = this.cache.get(key);
        
        if (!item) {
            return null;
        }

        // Check if expired
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    /**
     * Check if a key exists in cache and is valid
     */
    has(key) {
        const item = this.cache.get(key);
        if (!item) return false;
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }

    /**
     * Delete a specific cache entry
     */
    delete(key) {
        this.cache.delete(key);
    }

    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Clean up expired entries
     */
    cleanup() {
        const now = Date.now();
        let deleted = 0;
        
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiry) {
                this.cache.delete(key);
                deleted++;
            }
        }
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const now = Date.now();
        let active = 0;
        let expired = 0;
        
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiry) {
                expired++;
            } else {
                active++;
            }
        }
        
        return {
            total: this.cache.size,
            active,
            expired,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Create a singleton instance
export const cacheService = new CacheService();

// React hook for using cache
export const useCache = () => {
    return cacheService;
};