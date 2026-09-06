import { StyleSheet, Image } from 'react-native';
import { useContext, useState, useEffect } from 'react';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { appContext } from '@/store/context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ObligationItem } from '@/store/types';
import AddObligationModal from '@/components/modal/AddObligationModal';
import { AppButton, AppCard, AppCardTitle, AppDivider, AppEmptyState, AppFAB, AppListRow } from '@/components/ui';

export default function ObligationScreen() {
  const ctx = useContext(appContext);
  const { obligationItems, obligationsTutorialPassed, totalObligations, remainingBudget, daylyBudget } = ctx.store;
  const [tutorialPassed, setTutorialPassed] = useState<boolean>(obligationsTutorialPassed);
  const [isModalVisible, setModalVisible] = useState<boolean>(false);

  const [obligations, setObligations] = useState<ObligationItem[]>([]);
  const [totalObligationsValue, setTotalObligationsValue] = useState<number>(0);
  const [remainingBudgetValue, setRemainingBudgetValue] = useState<number>(remainingBudget);
  const [daylyBudgetValue, setDaylyBudgetValue] = useState<number>(daylyBudget);

  const getStartedHandler = () => {
    ctx.mutators.passObligationsTutorial();
    setModalVisible(true);
  }

  const addMoreHandler = () => {
    setModalVisible(true);
  }
  const closeModal = () => {
    setModalVisible(false);
  };


  useEffect(() => {
    setObligations(obligationItems);

    if (tutorialPassed !== obligationsTutorialPassed) {
      setTutorialPassed(obligationsTutorialPassed);
    }

  }, [obligationItems, obligationsTutorialPassed]);

  useEffect(() => {
    setTotalObligationsValue(totalObligations);
  }, [totalObligations]);

  useEffect(() => {
    setRemainingBudgetValue(remainingBudget);
  }, [remainingBudget]);

  useEffect(() => {
    setDaylyBudgetValue(daylyBudgetValue);
  }, [daylyBudgetValue]);

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
              <AppCard testID="obligations-list-card">
                <AppCardTitle title="Obligations" subtitle={`${obligations.length} items`} />
                {
                  obligations.map(obligation => (
                    <ThemedView key={obligation.date.getMilliseconds()}>
                      <AppListRow
                        title={`${obligation.label} — ${obligation.amount}${obligation.isPercentage ? '%' : ''}`}
                        description={obligation.date.toISOString()}
                      />
                      <AppDivider />
                    </ThemedView>
                  ))
                }
              </AppCard>
              <AppCard testID="obligations-totals-card">
                <ThemedView>
                  <ThemedText>
                    Total amount: {totalObligationsValue}
                  </ThemedText>
                </ThemedView>
                <ThemedView>
                  <ThemedText>
                    Remaining budget: {remainingBudgetValue}
                  </ThemedText>
                </ThemedView>
                <ThemedView>
                  <ThemedText>
                    Daily budget: {daylyBudgetValue}
                  </ThemedText>
                </ThemedView>
              </AppCard>
              <AppButton
                title='Add more!'
                onPress={addMoreHandler}
              />
              <AppFAB onPress={addMoreHandler} label="Add obligation" testID="obligations-fab" />
            </ThemedView>
          ) : (
            <AppEmptyState
              title="Obligatory payments"
              description="Your monthly obligatory payments — rent, loan interest or subscriptions"
              actionLabel="Get started!"
              onAction={getStartedHandler}
            />
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
