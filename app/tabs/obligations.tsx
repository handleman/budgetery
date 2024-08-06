import { StyleSheet, Image, Platform } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#F43F38', dark: '#F43F38' }}
      headerImage={
        <Image
          source={require('@/assets/images/obligations-back.jpeg')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Obligations</ThemedText>
      </ThemedView>
      <ThemedText>This app includes example code to help you get started.</ThemedText>

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  reactLogo: {
    height: 200,
    width: '100%',
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
