import * as React from 'react';
import { List, useTheme } from 'react-native-paper';
import type { StyleProp, ViewStyle } from 'react-native';

type Props = {
  title: string;
  description?: string;
  expanded: boolean;
  onPress: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Adapter: controlled Paper expandable section. The accordion paints no
 * background of its own (Paper hardcodes `theme.colors.background` on an
 * inner wrapper) — it inherits the parent surface, which keeps tinted
 * containers (e.g. warned expense day cards) seamless.
 */
export function AppAccordion({ title, description, expanded, onPress, children, style, testID }: Props) {
  const baseTheme = useTheme();
  const theme = React.useMemo(
    () => ({
      ...baseTheme,
      colors: { ...baseTheme.colors, background: 'transparent' },
    }),
    [baseTheme],
  );
  return (
    <List.Accordion
      title={title}
      description={description}
      expanded={expanded}
      onPress={onPress}
      style={[{ backgroundColor: 'transparent' }, style]}
      testID={testID}
      theme={theme}
    >
      {children}
    </List.Accordion>
  );
}
