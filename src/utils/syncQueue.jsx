import { updateDoc } from 'firebase/firestore';

/**
 * Firestore write coalescer.
 *
 * The app writes on every keystroke while logging sets. One updateDoc per
 * keystroke is wasteful and flaky on gym wifi, so updates are merged into a
 * single pending object and flushed after a short debounce, on tab hide, and
 * on page unload. Failed flushes are re-queued and retried automatically.
 */

const FLUSH_DELAY_MS = 1200;
const RETRY_DELAY_MS = 5000;

let pendingUpdates = {};
let targetRef = null;
let flushTimer = null;
const listeners = new Set();

const pendingCount = () => Object.keys(pendingUpdates).length;

const notify = () => {
    const count = pendingCount();
    listeners.forEach(fn => {
        try { fn(count); } catch (e) { /* listener errors must not break sync */ }
    });
};

/** Subscribe to pending-write count changes. Returns an unsubscribe fn. */
export const onSyncStatusChange = (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
};

const scheduleFlush = (delay = FLUSH_DELAY_MS) => {
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(() => { flushSyncQueue(); }, delay);
};

/**
 * Queue field updates against a document reference.
 * Dot-notation keys (e.g. `logs.1-Mon-Bench-1`) merge safely; a top-level
 * field write (e.g. `logs`) supersedes any queued writes beneath it.
 */
export const queueUpdate = (docRef, updates) => {
    if (!docRef || !updates) return;
    targetRef = docRef;

    const next = { ...pendingUpdates };
    Object.entries(updates).forEach(([key, value]) => {
        if (!key.includes('.')) {
            // Whole-field replacement wins over queued nested writes.
            Object.keys(next).forEach(existing => {
                if (existing.startsWith(`${key}.`)) delete next[existing];
            });
        }
        next[key] = value;
    });
    pendingUpdates = next;
    notify();
    scheduleFlush();
};

/** Immediately flush any queued writes. Safe to call with an empty queue. */
export const flushSyncQueue = async () => {
    if (flushTimer) {
        clearTimeout(flushTimer);
        flushTimer = null;
    }
    if (!targetRef || pendingCount() === 0) return;

    const updates = pendingUpdates;
    pendingUpdates = {};
    notify();

    try {
        await updateDoc(targetRef, updates);
    } catch (error) {
        // Offline or transient failure: re-queue and retry in the background.
        // Firestore's persistent local cache also keeps these writes durable.
        pendingUpdates = { ...updates, ...pendingUpdates };
        notify();
        scheduleFlush(RETRY_DELAY_MS);
        console.warn('Sync flush failed; queued for retry.', error);
    }
};

/** True when there are writes waiting to be sent. */
export const hasPendingWrites = () => pendingCount() > 0;

if (typeof window !== 'undefined') {
    window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') flushSyncQueue();
    });
    window.addEventListener('pagehide', () => { flushSyncQueue(); });
    window.addEventListener('online', () => { flushSyncQueue(); });
}
