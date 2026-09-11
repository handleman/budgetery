/**
 * Per-screen color gamma (S2). Derived from each screen's header illustration;
 * everything else follows the default Paper theme. CTA surfaces use the
 * darker `cta` tone so white text keeps contrast in both color schemes.
 */
export const screenGamma = {
  income: {
    header: '#18C521',
    headerDark: '#0E863D',
    cta: '#0E863D',
    onCta: '#FFFFFF',
  },
  obligations: {
    header: '#F43F38',
    headerDark: '#F43F38',
    cta: '#C62828',
    onCta: '#FFFFFF',
  },
  expenses: {
    header: '#6F888C',
    headerDark: '#6F888C',
    cta: '#455A5E',
    onCta: '#FFFFFF',
  },
} as const;

export type ScreenGammaName = keyof typeof screenGamma;
