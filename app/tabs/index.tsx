import { Image, StyleSheet, Platform } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from 'react-native';
import { useContext, useState } from 'react';
import { appContext } from '@/store/context';

export default function IncomeScreen() {

  const ctx = useContext(appContext);
  const [tutorialPassed, setTutorialPassed] = useState<boolean>(ctx.store.incomeTutorialPassed);

  const getStartedHandler = () => {
    //todo: add redirect to "add income form"
    //todo: remove unecessary "tutorial passed view after redirect is in place"
    ctx.mutators.passIncomeTutorial();
    setTutorialPassed(true);

  }
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ dark: '#0E863D', light: '#18C521' }}
      headerImage={
        <Image
          source={require('@/assets/images/income-back.jpeg')}
          style={styles.reactLogo}
        />
      }>
      {
        tutorialPassed ? (
          <ThemedView>
            <ThemedText>
              Tutorial passed
            </ThemedText>
          </ThemedView>
        ) : (
          <>
            <ThemedView style={styles.titleContainer}>
              <ThemedText type="title">Income Sources</ThemedText>
              <HelloWave />
            </ThemedView>
            <ThemedView>
              <ThemedText>Your monthly income sources</ThemedText>
              <ThemedText>There you may  set the whole budget</ThemedText>
              <ThemedText>by adding different incomes</ThemedText>
              <ThemedText>(salary, cashback, present, etc.)</ThemedText>
            </ThemedView>
            <ThemedView>
              <Button
                title='Get started!'
                onPress={getStartedHandler}
              />
            </ThemedView>
          </>
        )
      }

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 200,
    width: '100%',
    bottom: 0,
    left: 0,
    position: 'absolute',
    objectFit: 'cover',
  },
});
