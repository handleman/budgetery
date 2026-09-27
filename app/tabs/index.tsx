import { ScrollView, StyleSheet, useColorScheme, View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useContext, useRef, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { appContext } from '@/store/context';
import { visibleIncome } from '@/store/reducer';
import AddIncomeModal from '@/components/modal/AddIncomeModal';
import { IncomeItem } from '@/store/types';
import { AppCard, AppCardTitle, AppDivider, AppEmptyState, AppFAB, AppBackButton, AppListRow, StickyTotalsBar, SummaryHero, canvasColors, glyphForLabel, screenGamma } from '@/components/ui';

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
  const colorScheme = useColorScheme();
  const scrollRef = useRef<ScrollView>(null);


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
    <ThemedView style={[styles.screen, { backgroundColor: colorScheme === 'dark' ? canvasColors.dark : canvasColors.light }]}>
      <AppBackButton onPress={() => router.replace('/')} testID="income-back-button" />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
      >
        <ThemedText type="title" style={styles.wordmark}>Budgetery</ThemedText>
        {
          tutorialPassed ? (
            <ThemedView style={styles.listBlock}>
              <SummaryHero
                title="Total Income:"
                value={totalBudget}
                gamma="income"
                onAddPress={() => scrollRef.current?.scrollToEnd({ animated: true })}
                testID="income-hero"
                addTestID="income-hero-add"
              />
              <AppCard testID="income-list-card">
                <AppCardTitle title="Income sources" subtitle={`${incomes.length} items`} />
                {incomes.map((income, index) => (
                  <ThemedView key={`${income.date.getTime()}-${index}`}>
                    <AppListRow
                      title={`${income.label} — ${income.amount}`}
                      description={income.date.toLocaleDateString()}
                      testID={`income-row-${index}`}
                      onPress={() => editHandler(index)}
                      glyph={glyphForLabel(income.label)}
                      showPencil
                    />
                    <AppDivider />
                  </ThemedView>
                ))}
              </AppCard>
              <AppDivider />
              <View style={styles.fabRow}>
                <AppFAB onPress={addMoreHandler} testID="income-fab" backgroundColor={screenGamma.income.cta} color={screenGamma.income.onCta} />
              </View>
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

      </ScrollView>
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
  content: {
    padding: 32,
    gap: 16,
  },
  wordmark: {
    // Clears the absolute-positioned back button (top-left).
    paddingLeft: 48,
  },
  fabRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  listBlock: {
    gap: 16,
    backgroundColor: 'transparent',
  },
  footerSpacer: {
    height: 8,
  },
});
