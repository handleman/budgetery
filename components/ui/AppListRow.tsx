import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { List } from 'react-native-paper';

type Props = {
  title: string;
  description?: string;
  testID?: string;
  onPress?: () => void;
  /** Right-side accessory (e.g. marker chip). */
  right?: React.ReactNode;
  /** Leading MaterialCommunityIcons glyph; auto-testID `${testID}-icon`. */
  glyph?: string;
  /** Trailing pencil affordance (decorative — row onPress stays the handler). */
  showPencil?: boolean;
};

/**
 * Adapter: dense budget list row. Compact padding so collapsed lists read dense.
 * Glyph + pencil follow the redesign mockups; both are display-only.
 */
export function AppListRow({ title, description, testID, onPress, right, glyph, showPencil }: Props) {
  return (
    <List.Item
      title={title}
      description={description}
      testID={testID}
      onPress={onPress}
      left={
        glyph
          ? () => (
              <View testID={testID ? `${testID}-icon` : undefined}>
                <List.Icon icon={glyph} />
              </View>
            )
          : undefined
      }
      right={
        showPencil || right
          ? () => (
              <>
                {showPencil ? <List.Icon icon="pencil" /> : null}
                {right}
              </>
            )
          : undefined
      }
      style={styles.row}
      contentStyle={styles.content}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  content: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
});
