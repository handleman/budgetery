import * as React from 'react';
import { Switch as PaperSwitch } from 'react-native-paper';

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  testID?: string;
  disabled?: boolean;
};

/** Adapter: Paper Switch. Replaces stock RN `Switch`. */
export function AppSwitch({ value, onValueChange, testID, disabled }: Props) {
  return <PaperSwitch value={value} onValueChange={onValueChange} testID={testID} disabled={disabled} />;
}
