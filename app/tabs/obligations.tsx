import { StyleSheet, Image, View } from 'react-native';
import { useContext, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'expo-router';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { appContext } from '@/store/context';
import { visibleObligations } from '@/store/reducer';
import { ThemedView } from '@/components/ThemedView';
import { ObligationItem } from '@/store/types';
import AddObligationModal from '@/components/modal/AddObligationModal';
import { AppCard, AppCardTitle, AppDivider, AppEmptyState, AppFAB, AppListRow, StickyTotalsBar } from '@/components/ui';

export default function ObligationScreen() {
  const ctx = useContext(appContext);
  const router = useRouter();
  const { obligationsTutorialPassed, incomeTutorialPassed, expensesTutorialPassed, totalObligations, remainingBudget, daylyBudget, remains, totalBudget } = ctx.store;
  // Tutorial flag is derived from the store directly — no mirror state.
  const tutorialPassed = obligationsTutorialPassed;
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<ObligationItem | null>(null);

  const obligations = useMemo(() => visibleObligations(ctx.store), [ctx.store]);

  const getStartedHandler = () => {
    ctx.mutators.passObligationsTutorial();
    setModalVisible(true);
  }

  const addMoreHandler = () => {
    setEditingIndex(null);
    setEditingItem(null);
    setModalVisible(true);
  }
  const editHandler = (visibleIndex: number) => {
    setEditingIndex(visibleIndex);
    setEditingItem(obligations[visibleIndex] ?? null);
    setModalVisible(true);
  };
  const closeModal = () => {
    setModalVisible(false);
    setEditingIndex(null);
    setEditingItem(null);
  };


  useEffect(() => {
    if (incomeTutorialPassed && obligationsTutorialPassed && expensesTutorialPassed) {
      router.replace('/tabs/expenses');
    }
  }, [incomeTutorialPassed, obligationsTutorialPassed, expensesTutorialPassed, router]);

  const obligationSubtitle = (obligation: ObligationItem): string | undefined => {
    if (!obligation.isPercentage) return undefined;
    const resolved = Math.round(totalBudget * (obligation.amount / 100) * 100) / 100;
    return `${obligation.amount}% of total income = ${resolved}`;
  };

  return (
    <ThemedView style={styles.screen}>
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
                  obligations.map((obligation, index) => (
                    <ThemedView key={`${obligation.date.getTime()}-${index}`}>
                      <AppListRow
                        title={`${obligation.label} — ${obligation.amount}${obligation.isPercentage ? '%' : ''}${obligation.isRecurring ? ' ↻' : ''}`}
                        description={obligationSubtitle(obligation)}
                        testID={`obligations-row-${index}`}
                        onPress={() => editHandler(index)}
                      />
                      <AppDivider />
                    </ThemedView>
                  ))
                }
              </AppCard>
              <AppFAB onPress={addMoreHandler} label="Add obligation" testID="obligations-fab" />
              <View style={styles.footerSpacer} />
            </ThemedView>
          ) : (
            <AppEmptyState
              title="Obligatory payments"
              description="Your monthly obligatory payments — rent, loan interest or subscriptions"
              actionLabel="Get started!"
              onAction={getStartedHandler}
              testID="obligations-empty"
            />
          )
        }
      </ParallaxScrollView>
      {tutorialPassed && (
        <StickyTotalsBar
          testID="obligations-totals-bar"
          items={[
            { label: 'Total obligations', value: totalObligations, testID: 'obligations-totals-bar-total' },
            { label: 'Remaining', value: remainingBudget, testID: 'obligations-totals-bar-remaining' },
            { label: 'Daily', value: Math.round(daylyBudget * 100) / 100, testID: 'obligations-totals-bar-daily' },
            { label: 'Remains', value: remains, testID: 'obligations-totals-bar-remains' },
          ]}
        />
      )}
      <AddObligationModal isVisible={isModalVisible} onClose={closeModal} editingIndex={editingIndex} initial={editingItem} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
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
  footerSpacer: {
    height: 8,
  },
});
