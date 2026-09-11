import { Image, StyleSheet, View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';
import { useContext, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { appContext } from '@/store/context';
import { visibleIncome } from '@/store/reducer';
import { projectIncome, IncomeProjection } from '@/store/projections';
import { IncomeProjections } from '@/components/income/IncomeProjections';
import AddIncomeModal from '@/components/modal/AddIncomeModal';
import { IncomeItem } from '@/store/types';
import { AppCard, AppCardTitle, AppDivider, AppEmptyState, AppFAB, AppListRow, StickyTotalsBar, screenGamma } from '@/components/ui';

export default function IncomeScreen() {

  const ctx = useContext(appContext);
  const { incomeTutorialPassed, obligationsTutorialPassed, expensesTutorialPassed, totalBudget, remainingBudget, daylyBudget, remains } = ctx.store;
  const router = useRouter();
  // Tutorial flag is derived from the store directly — no mirror state.
  const tutorialPassed = incomeTutorialPassed;
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<IncomeItem | null>(null);

  const incomes = useMemo(() => visibleIncome(ctx.store), [ctx.store]);
  const projections = useMemo(() => projectIncome(ctx.store), [ctx.store]);

  const addProjectionHandler = (projection: IncomeProjection) => {
    const now = new Date();
    const day = Math.min(projection.modalDay, 28);
    ctx.mutators.addIncomeItem({ date: new Date(now.getFullYear(), now.getMonth(), day), amount: projection.avgAmount, label: projection.label });
  };


  const getStartedHandler = () => {
    ctx.mutators.passIncomeTutorial();
    setModalVisible(true);

  }
  const addMoreHandler = () => {
    setEditingIndex(null);
    setEditingItem(null);
    setModalVisible(true);
  }
  const editHandler = (visibleIndex: number) => {
    setEditingIndex(visibleIndex);
    setEditingItem(incomes[visibleIndex] ?? null);
    setModalVisible(true);
  };
  const closeModal = () => {
    setModalVisible(false);
    setEditingIndex(null);
    setEditingItem(null);
  };


  // After all tutorials passed, expenses is the default tab.
  useEffect(() => {
    if (incomeTutorialPassed && obligationsTutorialPassed && expensesTutorialPassed) {
      router.replace('/tabs/expenses');
    }
  }, [incomeTutorialPassed, obligationsTutorialPassed, expensesTutorialPassed, router]);

  return (
    <ThemedView style={styles.screen}>
      <ParallaxScrollView
        headerBackgroundColor={{ dark: screenGamma.income.headerDark, light: screenGamma.income.header }}
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
                {incomes.map((income, index) => (
                  <ThemedView key={`${income.date.getTime()}-${index}`}>
                    <AppListRow
                      title={`${income.label} — ${income.amount}`}
                      description={income.date.toLocaleDateString()}
                      testID={`income-row-${index}`}
                      onPress={() => editHandler(index)}
                    />
                    <AppDivider />
                  </ThemedView>
                ))}
              </AppCard>
              <AppDivider />
              <IncomeProjections projections={projections} onAdd={addProjectionHandler} />
              <AppFAB onPress={addMoreHandler} label="Add income" testID="income-fab" backgroundColor={screenGamma.income.cta} color={screenGamma.income.onCta} />
              <View style={styles.footerSpacer} />
            </ThemedView>
          ) : (
            <AppEmptyState
              title="Income Sources"
              description="Your monthly income sources — set the whole budget by adding different incomes (salary, cashback, present, etc.)"
              actionLabel="Get started!"
              onAction={getStartedHandler}
              adornment={<HelloWave />}
              testID="income-empty"
              buttonColor={screenGamma.income.cta}
              textColor={screenGamma.income.onCta}
            />
          )
        }

      </ParallaxScrollView>
      {tutorialPassed && (
        <StickyTotalsBar
          testID="income-totals-bar"
          items={[
            { label: 'Total', value: totalBudget, testID: 'income-totals-bar-total' },
            { label: 'Remaining', value: remainingBudget, testID: 'income-totals-bar-remaining' },
            { label: 'Daily', value: Math.round(daylyBudget * 100) / 100, testID: 'income-totals-bar-daily' },
            { label: 'Remains', value: remains, testID: 'income-totals-bar-remains' },
          ]}
        />
      )}
      <AddIncomeModal isVisible={isModalVisible} onClose={closeModal} editingIndex={editingIndex} initial={editingItem} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
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
  footerSpacer: {
    height: 8,
  },
});
