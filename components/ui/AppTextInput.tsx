import * as React from 'react';
import { TextInput as PaperTextInput, type TextInputProps as PaperProps } from 'react-native-paper';

type Props = Pick<
  PaperProps,
  'label' | 'value' | 'onChangeText' | 'keyboardType' | 'testID' | 'disabled' | 'multiline'
>;

/** Adapter: outlined Paper input with app defaults. */
export function AppTextInput(props: Props) {
  return <PaperTextInput mode="outlined" dense {...props} />;
}
