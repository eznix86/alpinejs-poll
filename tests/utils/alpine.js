import { mock } from 'bun:test';

// Simple Alpine mock that captures directives
export function createAlpine() {
    const directives = {};
    return {
        directive: (name, fn) => { directives[name] = fn; },
        $: (name) => directives[name],
    };
};

// Simple element with Alpine cleanup
export function el() {
    const element = document.createElement('div');
    element._x_cleanup = mock((fn) => { element._cleanup = fn; });
    return element;
}

// Simple evaluateLater mock
export const evalLater = (fn) => () => (cb) => cb(fn);
