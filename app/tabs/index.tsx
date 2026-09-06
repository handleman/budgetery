import { Image, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/HelloWave';import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useContext, useState, useEffect } from 'react';
import { appContext } from '@/store/context';
import AddIncomeModal from '@/components/modal/AddIncomeModal';
import { IncomeItem } from '@/store/types';
import Hr from '@/components/Hr';
import { AppButton, AppCard, AppCardTitle, AppDivider, AppEmptyState, AppFAB, AppListRow } from '@/components/ui';

export default function IncomeScreen() {

  const ctx = useContext(appContext);
  const { incomeItems, incomeTutorialPassed, totalBudget, remainingBudget, daylyBudget } = ctx.store;
  const [tutorialPassed, setTutorialPassed] = useState<boolean>(incomeTutorialPassed);
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(totalBudget);
  const [remainingBudgetValue, setRemainingBudgetValue] = useState<number>(remainingBudget);
  const [daylyBudgetValue, setDaylyBudgetValue] = useState<number>(daylyBudget);

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
    setIncomes(incomeItems);
    if (tutorialPassed !== incomeTutorialPassed) {
      setTutorialPassed(incomeTutorialPassed);
    }

  }, [incomeItems, incomeTutorialPassed]);

  useEffect(() => {
    setTotal(totalBudget);
  }, [totalBudget]);

  useEffect(() => {
    setRemainingBudgetValue(remainingBudget);
  }, [remainingBudget]);

  useEffect(() => {
    setDaylyBudgetValue(daylyBudgetValue);
  }, [daylyBudgetValue]);

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
              <AppCard testID="income-list-card">
                <AppCardTitle title="Income sources" subtitle={`${incomes.length} items`} />
                {incomes.map(income => (
                  <ThemedView key={income.date.getMilliseconds()}>
                    <AppListRow
                      title={`${income.label} — ${income.amount}`}
                      description={income.date.toISOString()}
                    />
                    <AppDivider />
                  </ThemedView>
                ))}
              </AppCard>
              <Hr />
              <AppCard testID="income-totals-card">
                <ThemedView>
                  <ThemedText>
                    Totatl amount: {total}
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
              <AppFAB onPress={addMoreHandler} label="Add income" testID="income-fab" />
            </ThemedView>
          ) : (
            <AppEmptyState
              title="Income Sources"
              description="Your monthly income sources — set the whole budget by adding different incomes (salary, cashback, present, etc.)"
              actionLabel="Get started!"
              onAction={getStartedHandler}
              adornment={<HelloWave />}
            />
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
  reactLogo: {
    height: 200,
    width: '100%',
    bottom: 0,
    left: 0,
    position: 'absolute',
    resizeMode: 'cover',
  },
});
