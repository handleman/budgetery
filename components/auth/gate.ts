/**
 * Login-gate decision (pure logic — unit-tested, no rendering).
 *
 * The gate is a soft lock: it stops casual viewers, not devtools readers
 * (local data is plaintext until the encrypted-store milestone lands).
 * See docs/design/WEB_HOSTING_AND_LOGIN_DESIGN.md §5.2.
 */

export type GateVerdict = 'allow' | 'to-login' | 'to-home' | 'waiting';

type GateInput = {
    connected: boolean;
    bypassed: boolean;
    restored: boolean;
    /** First route segment, e.g. 'login' on /login. */
    segment: string | undefined;
};

export function resolveGate({ connected, bypassed, restored, segment }: GateInput): GateVerdict {
    // E2E seam (Playwright sets the flag; production browsers never do).
    if (bypassed) return 'allow';
    // Token restore still in flight — hold splash, don't flash the login screen.
    if (!restored) return 'waiting';
    if (!connected && segment !== 'login') return 'to-login';
    if (connected && segment === 'login') return 'to-home';
    return 'allow';
}

/** E2E bypass flag. Web-only; SecureStore/native builds have no localStorage. */
export function isE2EBypass(): boolean {
    try {
        return (
            typeof window !== 'undefined' &&
            typeof window.localStorage !== 'undefined' &&
            window.localStorage.getItem('budgetery.e2e.auth') === '1'
        );
    } catch {
        return false;
    }
}
