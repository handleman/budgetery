import * as React from 'react';
import { Chip as PaperChip } from 'react-native-paper';

type Props = {
  label: string;
  testID?: string;
  icon?: string;
};

/** Adapter: compact Paper marker chip (replaces %, ↻, ⚠ text markers). */
export function AppChip({ label, testID, icon }: Props) {
  return (
    <PaperChip mode="flat" compact icon={icon} testID={testID}>
      {label}
    </PaperChip>
  );
}
