import * as React from 'react';
import { Checkbox } from 'react-native-paper';

type Props = {
  checked: boolean;
  onPress?: () => void;
  testID?: string;
};

/** Adapter: Paper Checkbox without direct Paper imports in screens. */
export function AppCheckbox({ checked, onPress, testID }: Props) {
  return <Checkbox status={checked ? 'checked' : 'unchecked'} onPress={onPress} testID={testID} />;
}
