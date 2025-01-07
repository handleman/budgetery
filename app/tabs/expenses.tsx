import { Image, StyleSheet, Platform, Button } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useContext, useEffect, useState } from 'react';
import { appContext } from '@/store/context';
import { ExpenseItem } from '@/store/types';
import AddExpenseModal from '@/components/modal/AddExpenseModal';
import Hr from '@/components/Hr';

export default function ExpensesScreen() {
  const ctx = useContext(appContext);
  const { expenseItems, expensesTutorialPassed, remains, totalExpenses } = ctx.store;
  const [tutorialPassed, setTutorialPassed] = useState<boolean>(expensesTutorialPassed);
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [remainsValue, setRemainsValue] = useState<number>(remains);
  const [totalExpensesValue, setTotalExpensesValue] = useState<number>(totalExpenses);

  const getStartedHandler = () => {
    ctx.mutators.passExpensesTutorial();
    setModalVisible(true);
  }

  const addMoreHandler = () => {
    setModalVisible(true);
  }
  const closeModal = () => {
    setModalVisible(false);
  };


  useEffect(() => {
    setExpenses(expenseItems);
    if (tutorialPassed !== expensesTutorialPassed) {
      setTutorialPassed(expensesTutorialPassed);
    }

  }, [expenseItems, expensesTutorialPassed]);

  useEffect(() => {
    setRemainsValue(remains);
  }, [remains]);

  useEffect(() => {
    setTotalExpensesValue(totalExpenses);
  }, [totalExpenses]);

  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#6F888C', dark: '#6F888C' }}
        headerImage={
          <Image
            source={require('@/assets/images/expenses-back.jpeg')}
            style={styles.reactLogo}
          />
        }>
        {
          tutorialPassed ? (
            <ThemedView>
              {/* todo:  style the list of obligation sources */}
              {
                expenses.map(expense => (
                  <ThemedView key={expense.date.getMilliseconds()}>
                    <ThemedText>{expense.date.toISOString()}</ThemedText>
                    <ThemedText>{expense.amount}</ThemedText>
                    <ThemedText>{expense.label}</ThemedText>
                  </ThemedView>
                ))
              }
              <Hr />
              <ThemedView>
                <ThemedText>
                  Remains: {remainsValue}
                </ThemedText>
              </ThemedView>
              <ThemedView>
                <ThemedText>
                  Total expenses {totalExpensesValue}
                </ThemedText>
              </ThemedView>
              <Button
                title='Add more!'
                onPress={addMoreHandler}
              />
            </ThemedView>
          ) : (
            <>
                <ThemedView style={styles.titleContainer}>
                  <ThemedText type="title">Daily expenses</ThemedText>
                </ThemedView>
              <ThemedView>
                <ThemedText>You can enter several values in a row, separated by comma</ThemedText>
                <ThemedText>your casual daily expenses</ThemedText>
              </ThemedView>
              <ThemedView>
                <Button
                  title='Add one!'
                  onPress={getStartedHandler}
                />
              </ThemedView>
            </>
          )
        }
      </ParallaxScrollView>
      <AddExpenseModal isVisible={isModalVisible} onClose={closeModal} />
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
  },
});
