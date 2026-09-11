import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TutorialProgress } from "@/components/tutorial/TutorialProgress";
import { AppButton, AppCard, AppCardTitle, AppListRow, AppMenuSelect, AppTextInput } from "@/components/ui";
import { appContext } from "@/store/context";
import { useContext, useState } from "react";
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
const monthNames = [
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 },
];

export default function WelcomeScreen() {
    const ctx = useContext(appContext);
    const { welcomeTutorialPassed, incomeTutorialPassed, obligationsTutorialPassed, expensesTutorialPassed, periods, currentPeriodId, currentPeriod } = ctx.store;
    const [tutorialPassed, setTutorialPassed] = useState<boolean>(welcomeTutorialPassed);
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [selectedPeriodName, setSelectedPeriodName] = useState<string>('');
    const router = useRouter();


    const getStartedHandler = () => {
        ctx.mutators.passWelcomeTutorial();
        setTutorialPassed(true);
    }

    const isPeriodValid = selectedMonth !== null && selectedPeriodName.trim() !== '';
    const hasPeriod = periods.length > 0 || currentPeriod.name !== '';
    const savePeriodHandler = () => {
        if (!isPeriodValid || selectedMonth === null) return;
        // startNewMonth creates the PeriodRecord (per-period isolation),
        // re-shows tab tutorials and scopes all calculations to the month.
        ctx.mutators.startNewMonth({ name: selectedPeriodName.trim(), month: selectedMonth });
        if (!incomeTutorialPassed) {
            router.replace('/tabs');
        } else {
            router.replace('/tabs/expenses');
        }
    }

    const selectPeriodHandler = (id: string) => {
        ctx.mutators.selectPeriod(id);
        router.replace('/tabs/expenses');
    }

    const selectMonthHandler = (value: number) => {
        // AppMenuSelect always passes a numeric option value on every platform.
        setSelectedMonth(value);
        const monthName = monthNames.find(item => item.value === value)?.label || '';
        setSelectedPeriodName(monthName);
    }
    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.content}>
                {tutorialPassed ? (
                    <>
                        <TutorialProgress
                            flags={{
                                welcome: tutorialPassed,
                                income: incomeTutorialPassed,
                                obligations: obligationsTutorialPassed,
                                expenses: expensesTutorialPassed,
                            }}
                        />
                        {periods.length > 0 && (
                            <AppCard testID="month-list">
                                <AppCardTitle title="Tracked months" subtitle={`${periods.length} months`} />
                                {periods.map((period, index) => (
                                    <AppListRow
                                        key={period.id}
                                        title={`${period.name} ${period.year}`}
                                        description={period.id === currentPeriodId ? 'Current month' : undefined}
                                        onPress={() => selectPeriodHandler(period.id)}
                                        testID={`month-row-${index}`}
                                    />
                                ))}
                            </AppCard>
                        )}
                        <ThemedView>
                            <ThemedText type="title">
                                {hasPeriod ? 'Start tracking a new month' : 'Please select the Month'}
                            </ThemedText>
                            {!hasPeriod && <ThemedText>that you want to start tracking</ThemedText>}
                            <ThemedText>Your budget is the sum of all income you enter.</ThemedText>
                            <AppMenuSelect
                                placeholder="Select a month"
                                value={selectedMonth}
                                options={monthNames}
                                onSelect={selectMonthHandler}
                                testID="month-picker"
                            />
                        </ThemedView>
                        <ThemedView>
                            <ThemedText type="title">Set the Label</ThemedText>
                            <ThemedText>(selected month name is by default)</ThemedText>
                            <AppTextInput
                                label="Period label"
                                value={selectedPeriodName}
                                onChangeText={setSelectedPeriodName}
                                testID="period-label-input"
                            />
                        </ThemedView>
                        <ThemedView>
                            <AppButton
                                title={hasPeriod ? 'Start new month!' : 'Apply!'}
                                onPress={savePeriodHandler}
                                disabled={!isPeriodValid}
                                testID={hasPeriod ? 'start-new-month-button' : 'welcome-apply'}
                            />
                        </ThemedView>

                    </>
                ) : (
                    <>
                        <ThemedText type="title">You don't have any data yet</ThemedText>
                        <ThemedView>
                            <AppButton
                                title='Get started!'
                                onPress={getStartedHandler}
                                testID="welcome-get-started"
                            />
                        </ThemedView>
                    </>
                )}
            </ThemedView>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 32,
        gap: 16,
        overflow: 'hidden',
    },
});
