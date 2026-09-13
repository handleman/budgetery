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
  return <Card.Title title={title} subtitle={subtitle} style={styles.title} />;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginVertical: 4,
  },
  title: {
    paddingHorizontal: 8,
    paddingVertical: 0,
    minHeight: 0,
  },
  content: {
    paddingHorizontal: 8,
    paddingTop: 0,
    paddingBottom: 8,
  },
});
