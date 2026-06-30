// src/hooks/useCachedFetch.js
import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { cacheService } from '../services/cacheService';

export const useCachedFetch = (url, options = {}) => {
    const {
        ttl = 5 * 60 * 1000, // 5 minutes default
        enabled = true,
        onSuccess = null,
        onError = null,
        dependencies = [],
        cacheKey = null,
    } = options;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCached, setIsCached] = useState(false);

    // Generate cache key
    const getCacheKey = useCallback(() => {
        if (cacheKey) return cacheKey;
        return `fetch_${url}_${JSON.stringify(dependencies)}`;
    }, [url, cacheKey, dependencies]);

    const fetchData = useCallback(async (skipCache = false) => {
        const key = getCacheKey();
        
        // Check cache first
        if (!skipCache) {
            const cachedData = cacheService.get(key);
            if (cachedData) {
                console.log(`📦 Using cached data for: ${url}`);
                setData(cachedData);
                setIsCached(true);
                setLoading(false);
                if (onSuccess) onSuccess(cachedData, true);
                return cachedData;
            }
        }

        // Fetch from API using the api service
        try {
            setLoading(true);
            setError(null);
            setIsCached(false);
            
            console.log(`🌐 Fetching: ${url}`);
            
            // Use the api service which already has the token and base URL configured
            const response = await api.get(url);
            
            // The api service returns data in response.data
            const result = response.data;
            
            // Cache the result
            cacheService.set(key, result, ttl);
            
            setData(result);
            setLoading(false);
            
            if (onSuccess) onSuccess(result, false);
            
            return result;
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message || 'Failed to fetch data');
            setLoading(false);
            if (onError) onError(err);
            return null;
        }
    }, [url, ttl, onSuccess, onError, getCacheKey]);

    // Invalidate cache for this key
    const invalidateCache = useCallback(() => {
        const key = getCacheKey();
        cacheService.delete(key);
        setIsCached(false);
        console.log(`📦 Cache invalidated: ${key}`);
    }, [getCacheKey]);

    // Force refresh (bypass cache)
    const refresh = useCallback(async () => {
        return fetchData(true);
    }, [fetchData]);

    // Initial fetch
    useEffect(() => {
        if (enabled) {
            fetchData();
        }
    }, [enabled, fetchData, ...dependencies]);

    return {
        data,
        loading,
        error,
        isCached,
        refresh,
        invalidateCache,
        refetch: fetchData,
    };
};