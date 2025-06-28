// src/utils/searchUtils.js
// Performance-optimized search and filtering utilities

/**
 * Debounce function to limit API calls and improve performance
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately on first call
 */
export function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

/**
 * Throttle function to limit execution frequency
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 */
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Enhanced search function with fuzzy matching and relevance scoring
 * @param {Array} items - Array of items to search
 * @param {string} query - Search query
 * @param {Array} searchFields - Fields to search in
 * @returns {Array} Sorted array of matching items with scores
 */
export function enhancedSearch(items, query, searchFields = ['name', 'description', 'categories']) {
    if (!query || query.trim().length === 0) {
        return items.map(item => ({ ...item, _searchScore: 0 }));
    }

    const normalizedQuery = query.toLowerCase().trim();
    const queryWords = normalizedQuery.split(/\s+/);
    
    const scoredItems = items.map(item => {
        let totalScore = 0;
        let matchCount = 0;
        
        searchFields.forEach(field => {
            const fieldValue = getNestedValue(item, field);
            if (!fieldValue) return;
            
            const normalizedValue = Array.isArray(fieldValue) 
                ? fieldValue.join(' ').toLowerCase()
                : fieldValue.toString().toLowerCase();
            
            // Exact match bonus
            if (normalizedValue.includes(normalizedQuery)) {
                totalScore += 100;
                matchCount++;
            }
            
            // Word-by-word matching
            queryWords.forEach(word => {
                if (normalizedValue.includes(word)) {
                    totalScore += 50;
                    matchCount++;
                }
                
                // Fuzzy matching for typos
                if (fuzzyMatch(normalizedValue, word)) {
                    totalScore += 25;
                    matchCount++;
                }
            });
            
            // Field-specific bonuses
            if (field === 'name' && normalizedValue.includes(normalizedQuery)) {
                totalScore += 50; // Name matches are more important
            }
        });
        
        return {
            ...item,
            _searchScore: matchCount > 0 ? totalScore : 0,
            _matchCount: matchCount
        };
    });
    
    return scoredItems
        .filter(item => item._searchScore > 0)
        .sort((a, b) => {
            // Premium trainers first, then by search score
            if (a.premium_status === 'active' && b.premium_status !== 'active') return -1;
            if (b.premium_status === 'active' && a.premium_status !== 'active') return 1;
            return b._searchScore - a._searchScore;
        });
}

/**
 * Simple fuzzy matching for typo tolerance
 * @param {string} text - Text to search in
 * @param {string} pattern - Pattern to match
 * @returns {boolean} Whether pattern fuzzy matches text
 */
function fuzzyMatch(text, pattern) {
    if (pattern.length < 3) return false; // Skip fuzzy for short words
    
    const threshold = Math.floor(pattern.length * 0.8); // 80% similarity
    let matches = 0;
    
    for (let i = 0; i < pattern.length; i++) {
        if (text.includes(pattern[i])) {
            matches++;
        }
    }
    
    return matches >= threshold;
}

/**
 * Get nested object value by dot notation
 * @param {Object} obj - Object to search in
 * @param {string} path - Dot notation path
 * @returns {any} Value at path or null
 */
function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : null;
    }, obj);
}

/**
 * Filter items by multiple criteria
 * @param {Array} items - Items to filter
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered items
 */
export function applyFilters(items, filters) {
    return items.filter(item => {
        // Category filter
        if (filters.category && filters.category !== '') {
            const categories = item.categories || [];
            if (!categories.includes(filters.category)) {
                return false;
            }
        }
        
        // Suburb filter
        if (filters.suburb && filters.suburb !== '') {
            const itemSuburb = (item.suburb || item.location || '').toLowerCase();
            if (itemSuburb !== filters.suburb.toLowerCase()) {
                return false;
            }
        }
        
        // Rating filter
        if (filters.minRating && filters.minRating > 0) {
            const rating = item.avg_rating || item.average_rating || item.rating || 0;
            if (rating < filters.minRating) {
                return false;
            }
        }
        
        // Premium filter
        if (filters.premiumOnly) {
            if (item.premium_status !== 'active') {
                return false;
            }
        }
        
        return true;
    });
}

/**
 * Sort items by specified criteria
 * @param {Array} items - Items to sort
 * @param {string} sortBy - Sort criteria
 * @param {string} direction - Sort direction ('asc' or 'desc')
 * @returns {Array} Sorted items
 */
export function sortItems(items, sortBy = 'featured', direction = 'asc') {
    const sortedItems = [...items];
    
    sortedItems.sort((a, b) => {
        // Always prioritize premium trainers first
        if (a.premium_status === 'active' && b.premium_status !== 'active') return -1;
        if (b.premium_status === 'active' && a.premium_status !== 'active') return 1;
        
        let comparison = 0;
        
        switch (sortBy) {
            case 'name':
                comparison = (a.name || '').localeCompare(b.name || '');
                break;
                
            case 'suburb':
            case 'location':
                const aLocation = a.suburb || a.location || '';
                const bLocation = b.suburb || b.location || '';
                comparison = aLocation.localeCompare(bLocation);
                break;
                
            case 'rating':
                const aRating = a.avg_rating || a.average_rating || a.rating || 0;
                const bRating = b.avg_rating || b.average_rating || b.rating || 0;
                comparison = bRating - aRating; // Higher ratings first
                break;
                
            case 'reviews':
                const aReviews = a.review_count || 0;
                const bReviews = b.review_count || 0;
                comparison = bReviews - aReviews; // More reviews first
                break;
                
            case 'featured':
            default:
                // For featured, maintain current order (premium already sorted)
                comparison = (a.name || '').localeCompare(b.name || '');
                break;
        }
        
        return direction === 'desc' ? -comparison : comparison;
    });
    
    return sortedItems;
}

/**
 * Paginate items
 * @param {Array} items - Items to paginate
 * @param {number} page - Current page (1-based)
 * @param {number} perPage - Items per page
 * @returns {Object} Pagination result
 */
export function paginateItems(items, page = 1, perPage = 12) {
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / perPage);
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = Math.min(startIndex + perPage, totalItems);
    
    return {
        items: items.slice(startIndex, endIndex),
        pagination: {
            currentPage,
            totalPages,
            totalItems,
            perPage,
            hasNextPage: currentPage < totalPages,
            hasPrevPage: currentPage > 1,
            startIndex: startIndex + 1,
            endIndex
        }
    };
}

/**
 * Generate URL with search parameters
 * @param {Object} params - Search parameters
 * @returns {string} URL with parameters
 */
export function generateSearchURL(params) {
    const url = new URL(window.location);
    
    // Clear existing search params
    url.search = '';
    
    // Add new params
    Object.entries(params).forEach(([key, value]) => {
        if (value && value !== '') {
            url.searchParams.set(key, value);
        }
    });
    
    return url.toString();
}

/**
 * Parse URL search parameters
 * @returns {Object} Parsed parameters
 */
export function parseSearchURL() {
    const params = new URLSearchParams(window.location.search);
    
    return {
        query: params.get('q') || '',
        category: params.get('category') || '',
        suburb: params.get('suburb') || '',
        sort: params.get('sort') || 'featured',
        page: parseInt(params.get('page')) || 1,
        minRating: parseFloat(params.get('rating')) || 0,
        premiumOnly: params.get('premium') === 'true'
    };
}

/**
 * Update browser history without page reload
 * @param {Object} params - Parameters to update
 */
export function updateSearchHistory(params) {
    const url = generateSearchURL(params);
    window.history.replaceState({}, '', url);
}

/**
 * Highlight search terms in text
 * @param {string} text - Text to highlight
 * @param {string} query - Search query
 * @returns {string} HTML with highlighted terms
 */
export function highlightSearchTerms(text, query) {
    if (!query || !text) return text;
    
    const words = query.toLowerCase().split(/\s+/);
    let highlightedText = text;
    
    words.forEach(word => {
        if (word.length > 2) { // Only highlight words longer than 2 characters
            const regex = new RegExp(`(${escapeRegExp(word)})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
        }
    });
    
    return highlightedText;
}

/**
 * Escape special regex characters
 * @param {string} string - String to escape
 * @returns {string} Escaped string
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Performance monitoring utilities
 */
export const performance = {
    /**
     * Measure function execution time
     * @param {Function} fn - Function to measure
     * @param {string} label - Label for measurement
     * @returns {any} Function result
     */
    measure(fn, label = 'operation') {
        const start = Date.now();
        const result = fn();
        const end = Date.now();
        console.log(`${label} took ${end - start}ms`);
        return result;
    },
    
    /**
     * Create a performance timer
     * @param {string} label - Timer label
     * @returns {Function} Stop function
     */
    timer(label = 'timer') {
        const start = Date.now();
        return () => {
            const end = Date.now();
            console.log(`${label}: ${end - start}ms`);
            return end - start;
        };
    }
};