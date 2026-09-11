import * as React from 'react';
import { Button as PaperButton } from 'react-native-paper';

type Props = {
  title: string;
  onPress: () => void;
  mode?: 'contained' | 'outlined' | 'text';
  disabled?: boolean;
  testID?: string;
  /** Button fill (screen gamma). Defaults to theme primary. */
  buttonColor?: string;
  /** Label color. Defaults to theme-appropriate on-color. */
  textColor?: string;
};

/** Adapter: stock RN `Button title=` API over Paper Button. */
export function AppButton({ title, onPress, mode = 'contained', disabled, testID, buttonColor, textColor }: Props) {
  return (
    <PaperButton mode={mode} onPress={onPress} disabled={disabled} testID={testID} buttonColor={buttonColor} textColor={textColor}>
      {title}
    </PaperButton>
  );
}
