import { useEffect } from 'react';

/**
 * Holds a screen wake lock while the calling component is mounted, so a
 * phone left untouched during the opponent's turn does not dim and lock
 * the board away. A game can go minutes without a tap, which is well
 * inside every mobile auto-lock timeout.
 *
 * No-op where the API is missing (iOS Safari before 16.4, any insecure
 * context), and silent when a request is refused: the lock is a comfort,
 * never something the game depends on.
 */
export function useWakeLock(enabled = true) {
    useEffect(() => {
        if (!enabled || !('wakeLock' in navigator)) return;

        let sentinel: WakeLockSentinel | undefined;
        let done = false;

        const acquire = async () => {
            // A hidden page cannot hold a lock, and requesting one there
            // just rejects
            if (done || sentinel || document.visibilityState !== 'visible') {
                return;
            }

            try {
                const lock = await navigator.wakeLock.request('screen');

                // The effect can be torn down while the request is in
                // flight, which would otherwise leak the lock
                if (done) {
                    void lock.release();
                    return;
                }

                sentinel = lock;
                lock.addEventListener('release', () => {
                    if (sentinel === lock) sentinel = undefined;
                });
            } catch {
                // Refused for reasons out of our hands, low battery being
                // the common one. Not worth interrupting the player over.
            }
        };

        // The browser drops the lock whenever the page is hidden, so it has
        // to be taken again every time the player comes back
        const onVisibilityChange = () => void acquire();

        void acquire();
        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            done = true;
            document.removeEventListener(
                'visibilitychange',
                onVisibilityChange,
            );
            void sentinel?.release();
            sentinel = undefined;
        };
    }, [enabled]);
}
