/**
 * ServiceNow Performance Analytics Webhook Integration Client for SynkNode
 */

// Helper to generate UUIDs
function generateUUID(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    // Fallback uuid generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Session & Visit management
const sessionId = (() => {
    const KEY = 'synknode_session_id';
    let id = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(KEY) : null;
    if (!id) {
        id = generateUUID();
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(KEY, id);
        }
    }
    return id;
})();

const visitId = generateUUID(); // Unique per page load/mount

// Queue management for offline mode
interface QueueEntry {
    payload: any;
    timestamp: number;
}

const queue: QueueEntry[] = [];
let isFlushing = false;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retrieve environment variables
const getSnConfig = () => {
    const url = (import.meta.env.VITE_SN_INSTANCE_URL || '').replace(/\/$/, '');
    const username = import.meta.env.VITE_SN_USERNAME;
    const password = import.meta.env.VITE_SN_PASSWORD;
    const scope = import.meta.env.VITE_SN_SCOPE || 'x_2064375_synknode';
    return { url, username, password, scope };
};

// Send event to ServiceNow with retry logic
async function sendToServiceNowWithRetry(payload: any): Promise<boolean> {
    const { url, username, password, scope } = getSnConfig();
    
    if (!url || !username || !password) {
        return false;
    }

    const endpoint = `${url}/api/${scope}/synknode_analytics/events`;
    
    // Generate Basic Auth token safely in browser or node
    const token = btoa(`${username}:${password}`);
        
    const authHeader = `Basic ${token}`;
    
    const maxRetries = 3;
    const backoffs = [1000, 2000, 4000]; // 1s, 2s, 4s

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authHeader,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.status === 201 || response.status === 200) {
                return true;
            } else {
                    if (response.status >= 500) {
                    console.warn(`ServiceNow telemetry unavailable (${response.status}); event will be skipped.`);
                }
                return false;
            }
        } catch (error) {
            // Browser CORS/network failures cannot succeed by retrying the same
            // client-side request. Keep telemetry best-effort and let uploads
            // continue without filling the console or queue with duplicates.
            if (error instanceof TypeError) {
                console.warn('ServiceNow telemetry unavailable; skipping this event.');
                return false;
            }
            console.error(`ServiceNow event transmission failed (attempt ${attempt + 1}/${maxRetries + 1}):`, error);
        }

        if (attempt < maxRetries) {
            const ms = backoffs[attempt];
            await delay(ms);
        }
    }
    return false;
}

// Flush queue
async function flushQueue() {
    if (isFlushing) return;
    if (queue.length === 0) return;

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return;
    }

    isFlushing = true;

    while (queue.length > 0) {
        const entry = queue[0];
        const success = await sendToServiceNowWithRetry(entry.payload);
        if (success) {
            queue.shift(); // Remove on successful post
        } else {
            queue.shift();
            break; // Drop failed telemetry; never block later events or transfers
        }
    }
    isFlushing = false;
}

// Register offline listener to auto-flush when back online
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        void flushQueue();
    });
}

// Helper to queue or send
function dispatchEvent(payload: any) {
    const { url, username, password } = getSnConfig();
    // Telemetry must never create an in-memory retry loop when disabled or
    // misconfigured. Uploads and transfers remain independent of analytics.
    if (!url || !username || !password) return;

    queue.push({ payload, timestamp: Date.now() });
    if (typeof navigator === 'undefined' || navigator.onLine) {
        void flushQueue();
    }
}

// Get standard metadata block
function getMetadata() {
    const isDev = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    return {
        app: 'SynkNode',
        version: '1.0.0',
        environment: isDev ? 'development' : 'production'
    };
}

// Get standard page data block
function getPageData() {
    return {
        url: typeof window !== 'undefined' ? window.location.href : '',
        referrer: typeof document !== 'undefined' ? document.referrer : ''
    };
}

// 1. sendTransferEvent (called after successful transfer)
export function sendTransferEvent(payload: {
    sender_id: string;
    receiver_id: string;
    file: {
        name: string;
        type: string;
        size_bytes: number;
        extension: string;
    };
    transfer: {
        duration_ms: number;
        bytes_transferred: number;
    };
}) {
    const eventPayload = {
        event_type: 'file_transfer',
        timestamp: new Date().toISOString(),
        session_id: sessionId,
        sender_id: payload.sender_id,
        receiver_id: payload.receiver_id,
        file: payload.file,
        transfer: {
            duration_ms: payload.transfer.duration_ms,
            status: 'completed' as const,
            bytes_transferred: payload.transfer.bytes_transferred
        },
        page: {
            ...getPageData(),
            visit_id: visitId
        },
        meta: getMetadata()
    };
    dispatchEvent(eventPayload);
}

// 2. sendVisitEvent (called on app mount)
export function sendVisitEvent() {
    const eventPayload = {
        event_type: 'page_visit',
        timestamp: new Date().toISOString(),
        visit_id: visitId,
        session_id: sessionId,
        page: getPageData(),
        meta: getMetadata()
    };
    dispatchEvent(eventPayload);
}

// 3. sendFailedTransferEvent (called on transfer fail / cancel)
export function sendFailedTransferEvent(
    payload: {
        sender_id: string;
        receiver_id: string;
        file: {
            name: string;
            type: string;
            size_bytes: number;
            extension: string;
        };
        transfer: {
            duration_ms: number;
            bytes_transferred: number;
            status: 'failed' | 'cancelled';
        };
    },
    error?: any
) {
    const eventPayload = {
        event_type: 'file_transfer',
        timestamp: new Date().toISOString(),
        session_id: sessionId,
        sender_id: payload.sender_id,
        receiver_id: payload.receiver_id,
        file: payload.file,
        transfer: {
            duration_ms: payload.transfer.duration_ms,
            status: payload.transfer.status,
            bytes_transferred: payload.transfer.bytes_transferred
        },
        page: {
            ...getPageData(),
            visit_id: visitId
        },
        meta: {
            ...getMetadata(),
            error: error ? String(error.message || error) : undefined
        }
    };
    dispatchEvent(eventPayload);
}
