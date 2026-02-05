/**
 * Utility functions
 * 
 * Add helper functions here as needed.
 * Keep this file minimal initially - only add utilities when you actually need them.
 */

/**
 * Sleep for a specified number of milliseconds
 */
export const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Check if value is defined (not null or undefined)
 */
export const isDefined = <T>(value: T | null | undefined): value is T => {
    return value !== null && value !== undefined;
};

/**
 * Parse integer safely with fallback
 */
export const parseIntSafe = (value: string | undefined, fallback: number): number => {
    if (!value) return fallback;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? fallback : parsed;
};

/**
 * Parse boolean from string
 */
export const parseBool = (value: string | undefined, fallback: boolean = false): boolean => {
    if (!value) return fallback;
    return value.toLowerCase() === 'true' || value === '1';
};
