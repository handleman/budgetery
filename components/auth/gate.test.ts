import { isAuthDisabled, isE2EBypass, resolveGate } from './gate';

describe('resolveGate', () => {
    it('holds splash while token restore is in flight', () => {
        expect(
            resolveGate({ connected: false, bypassed: false, restored: false, segment: undefined }),
        ).toBe('waiting');
    });

    it('sends unauthenticated users to /login from any route', () => {
        for (const segment of [undefined, 'index', 'tabs', 'config']) {
            expect(
                resolveGate({ connected: false, bypassed: false, restored: true, segment }),
            ).toBe('to-login');
        }
    });

    it('lets unauthenticated users stay on /login', () => {
        expect(
            resolveGate({ connected: false, bypassed: false, restored: true, segment: 'login' }),
        ).toBe('allow');
    });

    it('sends authenticated users away from /login', () => {
        expect(
            resolveGate({ connected: true, bypassed: false, restored: true, segment: 'login' }),
        ).toBe('to-home');
    });

    it('lets authenticated users anywhere else', () => {
        expect(
            resolveGate({ connected: true, bypassed: false, restored: true, segment: 'tabs' }),
        ).toBe('allow');
    });

    it('bypass allows everything even before restore', () => {
        expect(
            resolveGate({ connected: false, bypassed: true, restored: false, segment: undefined }),
        ).toBe('allow');
    });
});

describe('isE2EBypass', () => {
    it('is false outside a browser (Jest/Node)', () => {
        expect(isE2EBypass()).toBe(false);
    });
});

describe('isAuthDisabled', () => {
    const KEY = 'EXPO_PUBLIC_LOCAL_AUTH_OFF';
    const prev = process.env[KEY];

    afterEach(() => {
        if (prev === undefined) delete process.env[KEY];
        else process.env[KEY] = prev;
    });

    it('is true when the build-time switch is set', () => {
        process.env[KEY] = '1';
        expect(isAuthDisabled()).toBe(true);
    });

    it('is false by default (secure default, no DOM in Node)', () => {
        delete process.env[KEY];
        expect(isAuthDisabled()).toBe(false);
    });
});
