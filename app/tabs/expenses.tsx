import { Image, StyleSheet, View } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';
import { useContext, useEffect, useMemo, useState } from 'react';
import { appContext } from '@/store/context';
import { visibleExpenses } from '@/store/reducer';
import { groupExpensesByDay } from '@/store/expenseGrouping';
import { computeOverlapWarnings } from '@/store/expensesOverlap';
import { ExpenseItem } from '@/store/types';
import AddExpenseModal from '@/components/modal/AddExpenseModal';
import { ExpenseDayCard } from '@/components/expenses/ExpenseDayCard';
import Hr from '@/components/Hr';
import { AppEmptyState, AppFAB, StickyTotalsBar } from '@/components/ui';

export default function ExpensesScreen() {
  const ctx = useContext(appContext);
  const { expensesTutorialPassed, remains, totalExpenses, daylyBudget } = ctx.store;
  const [tutorialPassed, setTutorialPassed] = useState<boolean>(expensesTutorialPassed);
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

  // Period-scoped visible items; grouping + warnings derive from these.
  const expenses = useMemo(() => visibleExpenses(ctx.store), [ctx.store]);
  const groups = useMemo(() => groupExpensesByDay(expenses), [expenses]);
  const warnings = useMemo(() => computeOverlapWarnings(groups, daylyBudget), [groups, daylyBudget]);

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


  useEffect(() => {
    if (tutorialPassed !== expensesTutorialPassed) {
      setTutorialPassed(expensesTutorialPassed);
    }

  }, [expensesTutorialPassed]);

  return (
    <ThemedView style={styles.screen}>
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
              <Hr />
              <AppFAB onPress={addMoreHandler} label="Add expense" testID="expenses-fab" />
              <View style={styles.footerSpacer} />
            </ThemedView>
          ) : (
            <AppEmptyState
              title="Daily expenses"
              description="You can enter several values in a row, separated by comma — your casual daily expenses"
              actionLabel="Add one!"
              onAction={getStartedHandler}
              testID="expenses-empty"
            />
          )
        }
      </ParallaxScrollView>
      {tutorialPassed && (
        <StickyTotalsBar
          testID="expenses-totals-bar"
          items={[
            { label: 'Total expenses', value: totalExpenses, testID: 'expenses-totals-bar-total' },
            { label: 'Remains', value: remains, testID: 'expenses-totals-bar-remains' },
          ]}
        />
      )}
      <AddExpenseModal isVisible={isModalVisible} onClose={closeModal} editingIndex={editingIndex} initial={editingItem} />
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
  footerSpacer: {
    height: 8,
  },
});
