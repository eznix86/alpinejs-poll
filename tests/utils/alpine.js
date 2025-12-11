import { mock } from 'bun:test';

// Simple Alpine mock that captures directives
export function createAlpine() {
    const directives = {};
    return {
        directive: (name, fn) => { directives[name] = fn; },
        $: (name) => directives[name],
    };
}

// Simple element factory
export function el() {
    return document.createElement('div');
}

// Create Alpine utilities with evaluate and cleanup
export function createUtils(fn) {
    let cleanupFn = null;
    return {
        evaluate: (expr) => {
            // Handle x-visible: "(fn)(true)" or "(fn)(false)"
            const match = expr.match(/\((.+)\)\((true|false)\)/);
            if (match) {
                fn(match[2] === 'true');
            } else {
                fn();
            }
        },
        cleanup: (cb) => { cleanupFn = cb; },
        runCleanup: () => cleanupFn?.(),
    };
}
