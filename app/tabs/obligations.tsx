import { Platform, ScrollView, StyleSheet, useColorScheme, useWindowDimensions, View } from 'react-native';
import { useContext, useRef, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { appContext } from '@/store/context';
import { visibleObligations } from '@/store/reducer';
import { ObligationItem } from '@/store/types';
import AddObligationModal from '@/components/modal/AddObligationModal';
import { shouldShowSidebar } from '@/components/navigation/sidebar';
import { AppCard, AppDivider, AppEmptyState, AppFAB, AppBackButton, AppChip, AppListRow, StickyTotalsBar, SideTotalsCard, SummaryHero, canvasColors, glyphForLabel, screenGamma } from '@/components/ui';

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
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const wide = shouldShowSidebar(Platform.OS, width);
  const scrollRef = useRef<ScrollView>(null);

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

  const totalsItems = [
    { label: 'Total obligations', value: totalObligations, testID: 'obligations-totals-bar-total' },
    { label: 'Remaining', value: remainingBudget, testID: 'obligations-totals-bar-remaining' },
    { label: 'Daily', value: Math.round(daylyBudget * 100) / 100, testID: 'obligations-totals-bar-daily' },
    { label: 'Remains', value: remains, testID: 'obligations-totals-bar-remains' },
  ];

  const body = tutorialPassed ? (
    <ThemedView style={styles.listBlock}>
      <SummaryHero
        title="Total Obligations:"
        value={totalObligations}
        gamma="obligations"
        onAddPress={() => wide ? addMoreHandler() : scrollRef.current?.scrollToEnd({ animated: true })}
        testID="obligations-hero"
        addTestID="obligations-hero-add"
      />
      <AppCard testID="obligations-list-card">
        {
          obligations.map((obligation, index) => (
            <ThemedView key={`${obligation.date.getTime()}-${index}`}>
              <AppListRow
                title={`${obligation.label} — ${obligation.amount}${obligation.isPercentage ? '%' : ''}`}
                description={obligationSubtitle(obligation)}
                testID={`obligations-row-${index}`}
                onPress={() => editHandler(index)}
                glyph={glyphForLabel(obligation.label)}
                showPencil
                right={
                  obligation.isPercentage ? (
                    <AppChip label={`${obligation.amount}%`} testID={`obligations-row-${index}-chip`} />
                  ) : undefined
                }
              />
              <AppDivider />
            </ThemedView>
          ))
        }
      </AppCard>
      {!wide && (
        <View style={styles.fabRow}>
          <AppFAB onPress={addMoreHandler} testID="obligations-fab" backgroundColor={screenGamma.obligations.cta} color={screenGamma.obligations.onCta} />
        </View>
      )}
      <View style={styles.footerSpacer} />
    </ThemedView>
  ) : (
    <AppEmptyState
      title="Obligatory payments"
      description="Your monthly obligatory payments — rent, loan interest or subscriptions"
      actionLabel="Get started!"
      onAction={getStartedHandler}
      testID="obligations-empty"
      buttonColor={screenGamma.obligations.cta}
      textColor={screenGamma.obligations.onCta}
    />
  );

  return (
    <ThemedView style={[styles.screen, { backgroundColor: colorScheme === 'dark' ? canvasColors.dark : canvasColors.light }]}>
      {!wide && <AppBackButton onPress={() => router.replace('/')} testID="obligations-back-button" />}
      {wide ? (
        <View style={styles.wideRow}>
          <ScrollView
            ref={scrollRef}
            style={styles.wideScroll}
            contentContainerStyle={[styles.content, styles.contentWide]}
          >
            <ThemedText type="title">Obligations</ThemedText>
            {body}
          </ScrollView>
          {tutorialPassed && <SideTotalsCard items={totalsItems} testID="obligations-totals-bar" />}
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
            <StickyTotalsBar testID="obligations-totals-bar" items={totalsItems} />
          )}
        </>
      )}
      <AddObligationModal isVisible={isModalVisible} onClose={closeModal} editingIndex={editingIndex} initial={editingItem} />
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
