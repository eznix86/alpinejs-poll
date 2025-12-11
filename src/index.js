export default function AlpinePoll(Alpine) {

    //
    // Parse modifiers like "15s", "500ms", "2m", "1h"
    //
    function parseInterval(modifiers) {
        const value = modifiers.find(m => /^[0-9]+(ms|s|m|h)$/.test(m));
        if (!value) return 60000; // default: 1 min

        const num = parseInt(value);
        const unit = value.replace(/[0-9]/g, '');

        return {
            ms: num,
            s: num * 1000,
            m: num * 60000,
            h: num * 3600000,
        }[unit];
    }

    //
    // Unified visibility tracker for:
    // - document.hidden
    // - pagehide / pageshow (iOS PWA)
    // - focus / blur
    //
    function onVisibilityChange(handler) {
        const update = (isVisible) => handler(isVisible);

        const handleVisibility = () => update(!document.hidden);
        const onFocus = () => update(true);
        const onBlur = () => update(false);

        const onShow = (event) => {
            // pageshow persisted = coming from BFCache
            if (event.persisted) update(true);
            else update(true);
        };

        const onHide = () => update(false);

        document.addEventListener("visibilitychange", handleVisibility);
        window.addEventListener("focus", onFocus);
        window.addEventListener("blur", onBlur);
        window.addEventListener("pageshow", onShow);
        window.addEventListener("pagehide", onHide);

        // Initial state
        update(!document.hidden);

        // Cleanup function
        return () => {
            document.removeEventListener("visibilitychange", handleVisibility);
            window.removeEventListener("focus", onFocus);
            window.removeEventListener("blur", onBlur);
            window.removeEventListener("pageshow", onShow);
            window.removeEventListener("pagehide", onHide);
        };
    }

    //
    // x-poll Directive
    //
    Alpine.directive("poll", (el, { modifiers, expression }, { evaluateLater }) => {

        const runExpression = evaluateLater(expression);
        const intervalMs = parseInterval(modifiers);
        const requireVisible = modifiers.includes("visible") || modifiers.includes("focus");

        let timer = null;
        let visible = true;

        function execute() {
            runExpression(fn => fn());
        }

        function start(immediate = false) {
            stop();
            if (immediate) execute();
            timer = setInterval(execute, intervalMs);
        }

        function stop() {
            if (timer) clearInterval(timer);
            timer = null;
        }

        // Visibility tracking
        let cleanupVisibility = null;
        if (requireVisible) {
            cleanupVisibility = onVisibilityChange(isVisible => {
                visible = isVisible;
                if (visible) start(true); // execute immediately on visibility restored
                else stop();
            });
        } else {
            start(true); // execute immediately on init
        }

        el._x_cleanup(() => {
            stop();
            if (cleanupVisibility) cleanupVisibility();
        });
    });

    //
    // x-visible — notifies when page visibility changes
    //
    Alpine.directive("visible", (el, { expression }, { evaluateLater }) => {
        const run = evaluateLater(expression);

        const cleanupVisibility = onVisibilityChange(isVisible => {
            run(fn => fn(isVisible));
        });

        el._x_cleanup(() => {
            cleanupVisibility();
        });
    });
}
