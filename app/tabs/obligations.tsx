import { StyleSheet, Image, Platform, Button } from 'react-native';
import { useContext, useState, useEffect } from 'react';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { appContext } from '@/store/context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ObligationItem } from '@/store/types';
import AddObligationModal from '@/components/modal/AddObligationModal';

export default function ObligationScreen() {
  const ctx = useContext(appContext);
  const [tutorialPassed, setTutorialPassed] = useState<boolean>(ctx.store.obligationsTutorialPassed);
  const [isModalVisible, setModalVisible] = useState<boolean>(false);

  const [obligations, setObligations] = useState<ObligationItem[]>([]);

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
  const { obligationItems, obligationsTutorialPassed } = ctx.store;

  useEffect(() => {
    setObligations(obligationItems);
    if (tutorialPassed !== obligationsTutorialPassed) {
      setTutorialPassed(obligationsTutorialPassed);
    }

  }, [obligationItems, obligationsTutorialPassed]);

  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#F43F38', dark: '#F43F38' }}
        headerImage={
          <Image
            source={require('@/assets/images/obligations-back.jpeg')}
            style={styles.reactLogo}
          />
        }>
        {
          tutorialPassed ? (
            <ThemedView>
              {/* todo:  style the list of obligation sources */}
              {
                obligations.map(obligation => (
                  <ThemedView key={obligation.date.getMilliseconds()}>
                    <ThemedText>{obligation.date.toISOString()}</ThemedText>
                    <ThemedText>{obligation.amount}</ThemedText>
                    <ThemedText>{obligation.label}</ThemedText>
                    <ThemedText>{obligation.isPercentage}</ThemedText>
                  </ThemedView>
                ))
              }
              <Button
                title='Add more!'
                onPress={addMoreHandler}
              />
            </ThemedView>
          ) : (
            <>
                <ThemedView style={styles.titleContainer}>
                  <ThemedText type="title">Obligatory payments</ThemedText>
                  <ThemedText>Your monthly Obligatory payments</ThemedText>
                  <ThemedText>It could be your rent, loan interest or even some subscriptions</ThemedText>
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
      <AddObligationModal isVisible={isModalVisible} onClose={closeModal} />
    </>
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
    resizeMode: 'cover',
  },
});
