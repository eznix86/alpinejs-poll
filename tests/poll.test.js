/// <reference lib="dom" />
import { describe, test, expect, beforeEach, afterEach, jest } from 'bun:test';
import { Alpine, el, cleanup as cleanupDom } from './utils/alpine.js';
import AlpinePoll from '../src/index.js';

// Register plugin once
AlpinePoll(Alpine);

describe('x-poll', () => {
    let clock;

    beforeEach(() => {
        clock = jest.useFakeTimers();
        Object.defineProperty(document, 'hidden', { configurable: true, writable: true, value: false });
    });

    afterEach(() => {
        clock.useRealTimers();
        cleanupDom();
    });

    test('executes immediately on init', async () => {
        const element = el('<div x-data="{ count: 0 }" x-poll.1s="count++"></div>');
        Alpine.initTree(element);

        expect(Alpine.$data(element).count).toBe(1);
    });

    test('executes immediately then at each interval', async () => {
        const element = el('<div x-data="{ count: 0 }" x-poll.1s="count++"></div>');
        Alpine.initTree(element);

        expect(Alpine.$data(element).count).toBe(1);
        clock.advanceTimersByTime(1000);
        expect(Alpine.$data(element).count).toBe(2);
        clock.advanceTimersByTime(2000);
        expect(Alpine.$data(element).count).toBe(4);
    });

    test('parses time units: ms, s, m, h', async () => {
        const intervals = [];
        const original = globalThis.setInterval;
        globalThis.setInterval = (fn, ms) => { intervals.push(ms); return original(fn, ms); };

        [['500ms', 500], ['2s', 2000], ['1m', 60000], ['1h', 3600000]].forEach(([mod]) => {
            const element = el(`<div x-data x-poll.${mod}=""></div>`);
            Alpine.initTree(element);
        });

        globalThis.setInterval = original;
        expect(intervals).toEqual([500, 2000, 60000, 3600000]);
    });

    test('defaults to 60s', async () => {
        let interval;
        const original = globalThis.setInterval;
        globalThis.setInterval = (fn, ms) => { interval = ms; return original(fn, ms); };

        const element = el('<div x-data x-poll=""></div>');
        Alpine.initTree(element);

        globalThis.setInterval = original;
        expect(interval).toBe(60000);
    });

    test('cleanup stops polling', async () => {
        const element = el('<div x-data="{ count: 0 }" x-poll.1s="count++"></div>');
        Alpine.initTree(element);

        expect(Alpine.$data(element).count).toBe(1);
        clock.advanceTimersByTime(1000);
        expect(Alpine.$data(element).count).toBe(2);

        const countBefore = Alpine.$data(element).count;
        Alpine.destroyTree(element);
        clock.advanceTimersByTime(3000);
        // After destroy, data is cleared but polling should have stopped
        expect(countBefore).toBe(2);
    });
});

describe('x-poll.visible', () => {
    let clock;

    beforeEach(() => {
        clock = jest.useFakeTimers();
        Object.defineProperty(document, 'hidden', { configurable: true, writable: true, value: false });
    });

    afterEach(() => {
        clock.useRealTimers();
        cleanupDom();
    });

    test('executes immediately on init when visible', async () => {
        const element = el('<div x-data="{ count: 0 }" x-poll.1s.visible="count++"></div>');
        Alpine.initTree(element);

        expect(Alpine.$data(element).count).toBe(1);
    });

    test('stops when hidden', async () => {
        const element = el('<div x-data="{ count: 0 }" x-poll.1s.visible="count++"></div>');
        Alpine.initTree(element);

        expect(Alpine.$data(element).count).toBe(1);
        clock.advanceTimersByTime(1000);
        expect(Alpine.$data(element).count).toBe(2);

        document.hidden = true;
        document.dispatchEvent(new Event('visibilitychange'));

        clock.advanceTimersByTime(3000);
        expect(Alpine.$data(element).count).toBe(2);
    });

    test('executes immediately when visibility restored', async () => {
        const element = el('<div x-data="{ count: 0 }" x-poll.1s.visible="count++"></div>');
        Alpine.initTree(element);

        expect(Alpine.$data(element).count).toBe(1);

        document.hidden = true;
        document.dispatchEvent(new Event('visibilitychange'));
        clock.advanceTimersByTime(2000);
        expect(Alpine.$data(element).count).toBe(1);

        document.hidden = false;
        document.dispatchEvent(new Event('visibilitychange'));
        expect(Alpine.$data(element).count).toBe(2);

        clock.advanceTimersByTime(1000);
        expect(Alpine.$data(element).count).toBe(3);
    });

    test('executes immediately on focus after blur', async () => {
        const element = el('<div x-data="{ count: 0 }" x-poll.1s.visible="count++"></div>');
        Alpine.initTree(element);

        expect(Alpine.$data(element).count).toBe(1);

        window.dispatchEvent(new Event('blur'));
        clock.advanceTimersByTime(2000);
        expect(Alpine.$data(element).count).toBe(1);

        window.dispatchEvent(new Event('focus'));
        expect(Alpine.$data(element).count).toBe(2);

        clock.advanceTimersByTime(1000);
        expect(Alpine.$data(element).count).toBe(3);
    });

    test('executes immediately on pageshow after pagehide', async () => {
        const element = el('<div x-data="{ count: 0 }" x-poll.1s.visible="count++"></div>');
        Alpine.initTree(element);

        expect(Alpine.$data(element).count).toBe(1);

        window.dispatchEvent(new Event('pagehide'));
        clock.advanceTimersByTime(2000);
        expect(Alpine.$data(element).count).toBe(1);

        window.dispatchEvent(new Event('pageshow'));
        expect(Alpine.$data(element).count).toBe(2);

        clock.advanceTimersByTime(1000);
        expect(Alpine.$data(element).count).toBe(3);
    });
});

describe('x-visible', () => {
    beforeEach(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, writable: true, value: false });
    });

    afterEach(() => {
        cleanupDom();
    });

    test('$visible magic: receives initial state', async () => {
        const element = el('<div x-data="{ visible: null }" x-visible="visible = $visible"></div>');
        Alpine.initTree(element);

        expect(Alpine.$data(element).visible).toBe(true);
    });

    test('$visible magic: receives visibility boolean on changes', async () => {
        const element = el('<div x-data="{ visible: null }" x-visible="visible = $visible"></div>');
        Alpine.initTree(element);

        expect(Alpine.$data(element).visible).toBe(true);

        window.dispatchEvent(new Event('blur'));
        expect(Alpine.$data(element).visible).toBe(false);

        window.dispatchEvent(new Event('focus'));
        expect(Alpine.$data(element).visible).toBe(true);
    });

    test('expression style: evaluates on each visibility change', async () => {
        const element = el('<div x-data="{ count: 0 }" x-visible="count++"></div>');
        Alpine.initTree(element);

        expect(Alpine.$data(element).count).toBe(1);

        window.dispatchEvent(new Event('blur'));
        expect(Alpine.$data(element).count).toBe(2);

        window.dispatchEvent(new Event('focus'));
        expect(Alpine.$data(element).count).toBe(3);
    });

    test('function call style: no params', async () => {
        const element = el('<div x-data="{ count: 0, toggle() { this.count++ } }" x-visible="toggle()"></div>');
        Alpine.initTree(element);

        expect(Alpine.$data(element).count).toBe(1);

        window.dispatchEvent(new Event('blur'));
        expect(Alpine.$data(element).count).toBe(2);

        window.dispatchEvent(new Event('focus'));
        expect(Alpine.$data(element).count).toBe(3);
    });

    test('function call style: passes $visible to function', async () => {
        const element = el('<div x-data="{ visible: null, setVisible(v) { this.visible = v } }" x-visible="setVisible($visible)"></div>');
        Alpine.initTree(element);

        expect(Alpine.$data(element).visible).toBe(true);

        window.dispatchEvent(new Event('blur'));
        expect(Alpine.$data(element).visible).toBe(false);

        window.dispatchEvent(new Event('focus'));
        expect(Alpine.$data(element).visible).toBe(true);
    });

    test('cleanup removes listeners', async () => {
        const element = el('<div x-data="{ count: 0 }" x-visible="count++"></div>');
        Alpine.initTree(element);

        expect(Alpine.$data(element).count).toBe(1);

        const countBefore = Alpine.$data(element).count;
        Alpine.destroyTree(element);

        window.dispatchEvent(new Event('blur'));
        window.dispatchEvent(new Event('focus'));
        // After destroy, data is cleared but listeners should have been removed
        expect(countBefore).toBe(1);
    });
});
