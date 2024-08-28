import { Image, StyleSheet, Platform } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from 'react-native';
import { useContext, useState, useEffect } from 'react';
import { appContext } from '@/store/context';
import AddIncomeModal from '@/components/modal/AddIncomeModal';
import { IncomeItem } from '@/store/types';

export default function IncomeScreen() {

  const ctx = useContext(appContext);
  const [tutorialPassed, setTutorialPassed] = useState<boolean>(ctx.store.incomeTutorialPassed);
  const [isModalVisible, setModalVisible] = useState<boolean>(false);

  const [incomes, setIncomes] = useState<IncomeItem[]>([]);


  const getStartedHandler = () => {
    ctx.mutators.passIncomeTutorial();
    setModalVisible(true);

  }
  const addMoreHandler = () => {
    setModalVisible(true);
  }
  const closeModal = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    const { incomeItems, incomeTutorialPassed } = ctx.store;
    setIncomes(incomeItems);
    if (tutorialPassed !== incomeTutorialPassed) {
      setTutorialPassed(incomeTutorialPassed);
    }

  }, [ctx.store.incomeItems, ctx.store.incomeTutorialPassed]);

  return (
    <>
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
              {/* todo:  style the list of income sources */}
              {incomes.map(income => (
                <ThemedView key={income.date.getMilliseconds()}>
                  <ThemedText>{income.date.toISOString()}</ThemedText>
                  <ThemedText>{income.amount}</ThemedText>
                  <ThemedText>{income.label}</ThemedText>
                </ThemedView>
              ))}
              <Button
                title='Add more!'
                onPress={addMoreHandler}
              />
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
      <AddIncomeModal isVisible={isModalVisible} onClose={closeModal} />
    </>
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
