import * as React from 'react';
import { List } from 'react-native-paper';

type Props = {
  title: string;
  description?: string;
  testID?: string;
  onPress?: () => void;
};

/** Adapter: budget list row. Replaces raw `map()` + ThemedView rows. */
export function AppListRow({ title, description, testID, onPress }: Props) {
  return <List.Item title={title} description={description} testID={testID} onPress={onPress} />;
}
