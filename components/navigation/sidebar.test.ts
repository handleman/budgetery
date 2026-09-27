import { shouldShowSidebar } from './sidebar';

describe('shouldShowSidebar', () => {
    it.each([
        ['web', 1280, true],
        ['web', 1024, true],
        ['web', 1023, false],
        ['web', 390, false],
        ['ios', 1280, false],
        ['android', 1280, false],
    ])('platform %p width %p → %p', (platform, width, expected) => {
        expect(shouldShowSidebar(platform as string, width as number)).toBe(expected);
    });
});
