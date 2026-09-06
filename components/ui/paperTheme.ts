import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';
import { Colors } from '@/constants/Colors';

/**
 * Brand-seeded MD3 themes. Single place where Colors.ts maps into Paper.
 * Screens must import UI via `components/ui` adapters, never Paper directly,
 * so a future Gluestack/Tamagui swap touches only this folder.
 */
export function getPaperTheme(scheme: 'light' | 'dark'): MD3Theme {
  const base = scheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
  const brand = Colors[scheme];
  return {
    ...base,
    roundness: 12,
    colors: {
      ...base.colors,
      primary: brand.tint,
      background: brand.background,
      surface: brand.background,
      onSurface: brand.text,
      onBackground: brand.text,
    },
  };
}
