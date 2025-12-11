export default function AlpinePoll(Alpine) {
    function parseInterval(modifiers) {
        const value = modifiers.find(m => /^[0-9]+(ms|s|m|h)$/.test(m));
        if (!value) return 60000;

        const num = parseInt(value);
        const unit = value.replace(/[0-9]/g, '');

        return { ms: num, s: num * 1000, m: num * 60000, h: num * 3600000 }[unit];
    }

    function onVisibilityChange(handler) {
        const update = (isVisible) => handler(isVisible);
        const handleVisibility = () => update(!document.hidden);
        const onFocus = () => update(true);
        const onBlur = () => update(false);
        const onShow = () => update(true);
        const onHide = () => update(false);

        document.addEventListener('visibilitychange', handleVisibility);
        window.addEventListener('focus', onFocus);
        window.addEventListener('blur', onBlur);
        window.addEventListener('pageshow', onShow);
        window.addEventListener('pagehide', onHide);

        update(!document.hidden);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener('focus', onFocus);
            window.removeEventListener('blur', onBlur);
            window.removeEventListener('pageshow', onShow);
            window.removeEventListener('pagehide', onHide);
        };
    }

    Alpine.directive('poll', (el, { modifiers, expression }, { evaluate, cleanup }) => {
        const intervalMs = parseInterval(modifiers);
        const requireVisible = modifiers.includes('visible') || modifiers.includes('focus');

        let timer = null;
        let visible = true;

        function execute() {
            evaluate(expression);
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

        let cleanupVisibility = null;
        if (requireVisible) {
            cleanupVisibility = onVisibilityChange(isVisible => {
                visible = isVisible;
                if (visible) start(true);
                else stop();
            });
        } else {
            start(true);
        }

        cleanup(() => {
            stop();
            if (cleanupVisibility) cleanupVisibility();
        });
    });

    Alpine.directive('visible', (el, { expression }, { evaluate, cleanup }) => {
        const cleanupVisibility = onVisibilityChange(isVisible => {
            evaluate(`(${expression})(${isVisible})`);
        });

        cleanup(() => {
            cleanupVisibility();
        });
    });
}
