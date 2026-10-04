import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { screenGamma, type ScreenGammaName } from './screenGamma';

type Props = {
  title: string;
  value: string | number;
  gamma: ScreenGammaName;
  /** Hero "+" action (mobile: scrolls the list; web: opens the modal). */
  onAddPress: () => void;
  testID?: string;
  addTestID?: string;
};

/**
 * SummaryHero — gradient summary card with an embedded white "+" button.
 * The "+" opens the add modal directly. On narrow screens the in-flow FAB
 * takes over as the add affordance once this hero scrolls out of view.
 */
export function SummaryHero({ title, value, gamma, onAddPress, testID, addTestID }: Props) {
  const theme = useTheme();
  const stops = theme.dark ? screenGamma[gamma].gradientDark : screenGamma[gamma].gradient;
  return (
    <View testID={testID} style={styles.wrapper}>
      <LinearGradient
        colors={[stops[0], stops[1]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.card}
      >
        <View style={styles.texts}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
        <IconButton
          icon="plus"
          size={32}
          iconColor={stops[0]}
          containerColor="#FFFFFF"
          onPress={onAddPress}
          testID={addTestID}
          style={styles.addButton}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 20,
    padding: 20,
    minHeight: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  texts: {
    gap: 4,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: 'bold',
    lineHeight: 44,
  },
  addButton: {
    borderRadius: 16,
    margin: 0,
  },
});
