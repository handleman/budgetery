import * as React from 'react';
import { StyleSheet } from 'react-native';
import { List } from 'react-native-paper';

type Props = {
  title: string;
  description?: string;
  testID?: string;
  onPress?: () => void;
  /** Right-side accessory (e.g. marker chip). */
  right?: React.ReactNode;
};

/** Adapter: dense budget list row. Compact padding so collapsed lists read dense. */
export function AppListRow({ title, description, testID, onPress, right }: Props) {
  return (
    <List.Item
      title={title}
      description={description}
      testID={testID}
      onPress={onPress}
      right={right ? () => <>{right}</> : undefined}
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
