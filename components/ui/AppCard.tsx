import * as React from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Card } from 'react-native-paper';

type CardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function AppCard({ children, style, testID }: CardProps) {
  return (
    <Card style={[styles.card, style]} testID={testID}>
      <Card.Content style={styles.content}>{children}</Card.Content>
    </Card>
  );
}

export function AppCardTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return <Card.Title title={title} subtitle={subtitle} />;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginVertical: 6,
  },
  content: {
    padding: 16,
  },
});
