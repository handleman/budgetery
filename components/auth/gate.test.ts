import { isE2EBypass, resolveGate } from './gate';

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
