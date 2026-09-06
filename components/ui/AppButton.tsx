import * as React from 'react';
import { Button as PaperButton } from 'react-native-paper';

type Props = {
  title: string;
  onPress: () => void;
  mode?: 'contained' | 'outlined' | 'text';
  disabled?: boolean;
  testID?: string;
};

/** Adapter: stock RN `Button title=` API over Paper Button. */
export function AppButton({ title, onPress, mode = 'contained', disabled, testID }: Props) {
  return (
    <PaperButton mode={mode} onPress={onPress} disabled={disabled} testID={testID}>
      {title}
    </PaperButton>
  );
}
