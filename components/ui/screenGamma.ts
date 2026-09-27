/**
 * Per-screen color gamma (S2 + redesign P0). Compact CTA/surface tones plus
 * gradient stops for the SummaryHero cards; everything else follows the
 * default Paper theme. CTA surfaces use the darker `cta` tone so white
 * text keeps contrast in both color schemes.
 */
export const screenGamma = {
  income: {
    header: '#18C521',
    headerDark: '#0E863D',
    cta: '#0E863D',
    onCta: '#FFFFFF',
    gradient: ['#1FA32E', '#7ED957'] as const,
    gradientDark: ['#0E863D', '#1FA84F'] as const,
  },
  obligations: {
    header: '#F43F38',
    headerDark: '#F43F38',
    cta: '#C62828',
    onCta: '#FFFFFF',
    gradient: ['#D93A3A', '#FF8A70'] as const,
    gradientDark: ['#96262B', '#D94F4F'] as const,
  },
  expenses: {
    header: '#6F888C',
    headerDark: '#6F888C',
    cta: '#455A5E',
    onCta: '#FFFFFF',
    gradient: ['#677B87', '#A9B8C2'] as const,
    gradientDark: ['#3E4C54', '#6F888C'] as const,
  },
} as const;

/** Flat app canvas behind cards (redesign mockups: light lavender). */
export const canvasColors = {
  light: '#F4F2FA',
  dark: '#141218',
} as const;

export type ScreenGammaName = keyof typeof screenGamma;
