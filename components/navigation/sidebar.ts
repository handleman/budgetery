/** Wide-layout breakpoint for the web sidebar (redesign P5). */
export const SIDEBAR_BREAKPOINT = 1024;

/** Sidebar replaces the bottom tab bar on wide web screens only. */
export function shouldShowSidebar(platformOS: string, width: number): boolean {
    return platformOS === 'web' && width >= SIDEBAR_BREAKPOINT;
}
