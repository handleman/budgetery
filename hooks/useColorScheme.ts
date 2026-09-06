import { useColorScheme as useRNColorScheme } from 'react-native';

// Newer RN color schemes include 'unspecified' (and null/undefined);
// coerce to the 'light' | 'dark' contract the app themes on.
export function useColorScheme(): 'light' | 'dark' {
  return useRNColorScheme() === 'dark' ? 'dark' : 'light';
}
