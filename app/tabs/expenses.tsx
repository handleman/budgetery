import { Platform, ScrollView, StyleSheet, useColorScheme, useWindowDimensions, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useContext, useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { appContext } from '@/store/context';
import { visibleExpenses } from '@/store/reducer';
import { groupExpensesByDay } from '@/store/expenseGrouping';
import { computeOverlapWarnings } from '@/store/expensesOverlap';
import { ExpenseItem } from '@/store/types';
import AddExpenseModal from '@/components/modal/AddExpenseModal';
import { ExpenseDayCard } from '@/components/expenses/ExpenseDayCard';
import { DayBreakdownTable } from '@/components/expenses/DayBreakdownTable';
import { shouldShowSidebar } from '@/components/navigation/sidebar';
import { AppEmptyState, AppFAB, AppBackButton, AppDivider, StickyTotalsBar, SideTotalsCard, SummaryHero, canvasColors, screenGamma } from '@/components/ui';

export default function ExpensesScreen() {
  const ctx = useContext(appContext);
  const router = useRouter();
  const { expensesTutorialPassed, remains, totalExpenses, daylyBudget, periods, currentPeriodId, currentPeriod } = ctx.store;
  // Tutorial flag is derived from the store directly — no mirror state.
  const tutorialPassed = expensesTutorialPassed;
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

  // Period-scoped visible items; grouping + warnings derive from these.
  const expenses = useMemo(() => visibleExpenses(ctx.store), [ctx.store]);
  const groups = useMemo(() => groupExpensesByDay(expenses), [expenses]);
  const warnings = useMemo(() => computeOverlapWarnings(groups, daylyBudget), [groups, daylyBudget]);
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const wide = shouldShowSidebar(Platform.OS, width);
  const scrollRef = useRef<ScrollView>(null);

  // Month/year for the day-by-day breakdown (fall back to today on legacy data).
  const today = new Date();
  const activePeriod = periods.find((p) => p.id === currentPeriodId);
  const rawMonth = activePeriod?.month ?? currentPeriod.month;
  const rawYear = activePeriod?.year ?? today.getFullYear();
  const tableMonth = rawMonth >= 1 && rawMonth <= 12 ? rawMonth : today.getMonth() + 1;
  const tableYear = rawYear > 0 ? rawYear : today.getFullYear();

  const getStartedHandler = () => {
    ctx.mutators.passExpensesTutorial();
    setModalVisible(true);
  }

  const addMoreHandler = () => {
    setEditingIndex(null);
    setEditingItem(null);
    setModalVisible(true);
  }
  const editHandler = (visibleIndex: number) => {
    setEditingIndex(visibleIndex);
    setEditingItem(expenses[visibleIndex] ?? null);
    setModalVisible(true);
  };
  const closeModal = () => {
    setModalVisible(false);
    setEditingIndex(null);
    setEditingItem(null);
  };

  const toggleDay = (dayKey: string) => {
    setExpandedDays((prev) => ({ ...prev, [dayKey]: !(prev[dayKey] ?? true) }));
  };

  const totalsItems = [
    { label: 'Total expenses', value: totalExpenses, testID: 'expenses-totals-bar-total' },
    { label: 'Daily', value: Math.round(daylyBudget * 100) / 100, testID: 'expenses-totals-bar-daily' },
    { label: 'Remains', value: remains, testID: 'expenses-totals-bar-remains' },
  ];

  const body = tutorialPassed ? (
    <ThemedView style={styles.listBlock}>
      <SummaryHero
        title="Total Expenses:"
        value={totalExpenses}
        gamma="expenses"
        onAddPress={() => wide ? addMoreHandler() : scrollRef.current?.scrollToEnd({ animated: true })}
        testID="expenses-hero"
        addTestID="expenses-hero-add"
      />
      {groups.map((group) => {
        const warning = warnings.get(group.dayKey);
        return (
          <ExpenseDayCard
            key={group.dayKey}
            group={group}
            warned={warning?.warned ?? false}
            overrunFrom={warning?.overrunFrom}
            expanded={expandedDays[group.dayKey] ?? true}
            onToggle={() => toggleDay(group.dayKey)}
            onEditItem={editHandler}
          />
        );
      })}
      <AppDivider />
      <DayBreakdownTable groups={groups} daylyBudget={daylyBudget} month={tableMonth} year={tableYear} />
      <AppDivider />
      {!wide && (
        <View style={styles.fabRow}>
          <AppFAB onPress={addMoreHandler} testID="expenses-fab" backgroundColor={screenGamma.expenses.cta} color={screenGamma.expenses.onCta} />
        </View>
      )}
      <View style={styles.footerSpacer} />
    </ThemedView>
  ) : (
    <AppEmptyState
      title="Daily expenses"
      description="You can enter several values in a row, separated by comma — your casual daily expenses"
      actionLabel="Add one!"
      onAction={getStartedHandler}
      testID="expenses-empty"
      buttonColor={screenGamma.expenses.cta}
      textColor={screenGamma.expenses.onCta}
    />
  );

  return (
    <ThemedView style={[styles.screen, { backgroundColor: colorScheme === 'dark' ? canvasColors.dark : canvasColors.light }]}>
      {!wide && <AppBackButton onPress={() => router.replace('/')} testID="expenses-back-button" />}
      {wide ? (
        <View style={styles.wideRow}>
          <ScrollView
            ref={scrollRef}
            style={styles.wideScroll}
            contentContainerStyle={[styles.content, styles.contentWide]}
          >
            <ThemedText type="title">Expenses</ThemedText>
            {body}
          </ScrollView>
          {tutorialPassed && <SideTotalsCard items={totalsItems} testID="expenses-totals-bar" />}
        </View>
      ) : (
        <>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.content}
          >
            <ThemedText type="title" style={styles.wordmark}>Budgetery</ThemedText>
            {body}
          </ScrollView>
          {tutorialPassed && (
            <StickyTotalsBar testID="expenses-totals-bar" items={totalsItems} />
          )}
        </>
      )}
      <AddExpenseModal isVisible={isModalVisible} onClose={closeModal} editingIndex={editingIndex} initial={editingItem} />
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
  contentWide: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
  },
  wideRow: {
    flex: 1,
    flexDirection: 'row',
  },
  wideScroll: {
    flex: 1,
  },
  wordmark: {
    // Clears the absolute-positioned back button (top-left).
    paddingLeft: 48,
  },
  listBlock: {
    gap: 16,
    backgroundColor: 'transparent',
  },
  fabRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  footerSpacer: {
    height: 8,
  },
});
