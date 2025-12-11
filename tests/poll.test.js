/// <reference lib="dom" />
import { describe, test, expect, beforeEach, afterEach, mock, jest } from 'bun:test';
import AlpinePoll from '../src/index.js';
import { createAlpine, el, createUtils } from './utils/alpine.js';

describe('x-poll', () => {
    let Alpine, clock;

    beforeEach(() => {
        clock = jest.useFakeTimers();
        Alpine = createAlpine();
        AlpinePoll(Alpine);
        Object.defineProperty(document, 'hidden', { configurable: true, writable: true, value: false });
    });

    afterEach(() => clock.useRealTimers());

    test('executes immediately on init', () => {
        const fn = mock();
        const utils = createUtils(fn);
        Alpine.$('poll')(el(), { modifiers: ['1s'], expression: 'fn()' }, utils);

        expect(fn).toHaveBeenCalledTimes(1);
    });

    test('executes immediately then at each interval', () => {
        const fn = mock();
        const utils = createUtils(fn);
        Alpine.$('poll')(el(), { modifiers: ['1s'], expression: 'fn()' }, utils);

        expect(fn).toHaveBeenCalledTimes(1);
        clock.advanceTimersByTime(1000);
        expect(fn).toHaveBeenCalledTimes(2);
        clock.advanceTimersByTime(2000);
        expect(fn).toHaveBeenCalledTimes(4);
    });

    test('parses time units: ms, s, m, h', () => {
        const intervals = [];
        const original = globalThis.setInterval;
        globalThis.setInterval = mock((_, ms) => { intervals.push(ms); return original(() => {}, ms); });

        [['500ms', 500], ['2s', 2000], ['1m', 60000], ['1h', 3600000]].forEach(([mod]) => {
            Alpine.$('poll')(el(), { modifiers: [mod], expression: '' }, createUtils(mock()));
        });

        globalThis.setInterval = original;
        expect(intervals).toEqual([500, 2000, 60000, 3600000]);
    });

    test('defaults to 60s', () => {
        let interval;
        const original = globalThis.setInterval;
        globalThis.setInterval = mock((_, ms) => { interval = ms; return original(() => {}, ms); });

        Alpine.$('poll')(el(), { modifiers: [], expression: '' }, createUtils(mock()));

        globalThis.setInterval = original;
        expect(interval).toBe(60000);
    });

    test('cleanup stops polling', () => {
        const fn = mock();
        const utils = createUtils(fn);
        Alpine.$('poll')(el(), { modifiers: ['1s'], expression: 'fn()' }, utils);

        expect(fn).toHaveBeenCalledTimes(1);
        clock.advanceTimersByTime(1000);
        expect(fn).toHaveBeenCalledTimes(2);

        utils.runCleanup();
        clock.advanceTimersByTime(3000);
        expect(fn).toHaveBeenCalledTimes(2);
    });
});

describe('x-poll.visible', () => {
    let Alpine, clock;

    beforeEach(() => {
        clock = jest.useFakeTimers();
        Alpine = createAlpine();
        AlpinePoll(Alpine);
        Object.defineProperty(document, 'hidden', { configurable: true, writable: true, value: false });
    });

    afterEach(() => clock.useRealTimers());

    test('executes immediately on init when visible', () => {
        const fn = mock();
        Alpine.$('poll')(el(), { modifiers: ['1s', 'visible'], expression: 'fn()' }, createUtils(fn));

        expect(fn).toHaveBeenCalledTimes(1);
    });

    test('stops when hidden', () => {
        const fn = mock();
        Alpine.$('poll')(el(), { modifiers: ['1s', 'visible'], expression: 'fn()' }, createUtils(fn));

        expect(fn).toHaveBeenCalledTimes(1);
        clock.advanceTimersByTime(1000);
        expect(fn).toHaveBeenCalledTimes(2);

        document.hidden = true;
        document.dispatchEvent(new Event('visibilitychange'));

        clock.advanceTimersByTime(3000);
        expect(fn).toHaveBeenCalledTimes(2);
    });

    test('executes immediately when visibility restored', () => {
        const fn = mock();
        Alpine.$('poll')(el(), { modifiers: ['1s', 'visible'], expression: 'fn()' }, createUtils(fn));

        expect(fn).toHaveBeenCalledTimes(1);

        document.hidden = true;
        document.dispatchEvent(new Event('visibilitychange'));
        clock.advanceTimersByTime(2000);
        expect(fn).toHaveBeenCalledTimes(1);

        document.hidden = false;
        document.dispatchEvent(new Event('visibilitychange'));
        expect(fn).toHaveBeenCalledTimes(2);

        clock.advanceTimersByTime(1000);
        expect(fn).toHaveBeenCalledTimes(3);
    });

    test('executes immediately on focus after blur', () => {
        const fn = mock();
        Alpine.$('poll')(el(), { modifiers: ['1s', 'visible'], expression: 'fn()' }, createUtils(fn));

        expect(fn).toHaveBeenCalledTimes(1);

        window.dispatchEvent(new Event('blur'));
        clock.advanceTimersByTime(2000);
        expect(fn).toHaveBeenCalledTimes(1);

        window.dispatchEvent(new Event('focus'));
        expect(fn).toHaveBeenCalledTimes(2);

        clock.advanceTimersByTime(1000);
        expect(fn).toHaveBeenCalledTimes(3);
    });

    test('executes immediately on pageshow after pagehide', () => {
        const fn = mock();
        Alpine.$('poll')(el(), { modifiers: ['1s', 'visible'], expression: 'fn()' }, createUtils(fn));

        expect(fn).toHaveBeenCalledTimes(1);

        window.dispatchEvent(new Event('pagehide'));
        clock.advanceTimersByTime(2000);
        expect(fn).toHaveBeenCalledTimes(1);

        window.dispatchEvent(new Event('pageshow'));
        expect(fn).toHaveBeenCalledTimes(2);

        clock.advanceTimersByTime(1000);
        expect(fn).toHaveBeenCalledTimes(3);
    });
});

describe('x-visible', () => {
    let Alpine;

    beforeEach(() => {
        Alpine = createAlpine();
        AlpinePoll(Alpine);
        Object.defineProperty(document, 'hidden', { configurable: true, writable: true, value: false });
    });

    test('calls handler immediately with initial state', () => {
        const fn = mock();
        Alpine.$('visible')(el(), { expression: 'fn' }, createUtils(fn));
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith(true);
    });

    test('calls handler immediately on visibility changes', () => {
        const fn = mock();
        Alpine.$('visible')(el(), { expression: 'fn' }, createUtils(fn));
        fn.mockClear();

        window.dispatchEvent(new Event('blur'));
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenLastCalledWith(false);

        window.dispatchEvent(new Event('focus'));
        expect(fn).toHaveBeenCalledTimes(2);
        expect(fn).toHaveBeenLastCalledWith(true);
    });

    test('cleanup removes listeners', () => {
        const fn = mock();
        const utils = createUtils(fn);
        Alpine.$('visible')(el(), { expression: 'fn' }, utils);
        fn.mockClear();

        utils.runCleanup();

        window.dispatchEvent(new Event('blur'));
        window.dispatchEvent(new Event('focus'));
        expect(fn).not.toHaveBeenCalled();
    });
});
