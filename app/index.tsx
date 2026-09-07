import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppButton, AppMenuSelect, AppTextInput } from "@/components/ui";
import { appContext } from "@/store/context";
import { useContext, useState } from "react";
import { StyleSheet, useColorScheme } from 'react-native';
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

//todo: set Apply button inactive without filled data

export default function WelcomeScreen() {
    const ctx = useContext(appContext);
    const [tutorialPassed, setTutorialPassed] = useState<boolean>(ctx.store.welcomeTutorialPassed);
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [selectedPeriodName, setSelectedPeriodName] = useState<string>('');
    const router = useRouter();


    const getStartedHandler = () => {
        ctx.mutators.passWelcomeTutorial();
        setTutorialPassed(true);
    }

    const isPeriodValid = selectedMonth !== null && selectedPeriodName.trim() !== '';
    const savePeriodHandler = () => {
        if (!isPeriodValid || selectedMonth === null) return;
        // Save synchronously before navigating (derived budget model: totals
        // come from income sum; the period only scopes calculations).
        ctx.mutators.setCurrentPeriod({ name: selectedPeriodName.trim(), month: selectedMonth });
        router.navigate('/tabs')
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
                        <ThemedView>
                            <ThemedText type="title">Please select the Month</ThemedText>
                            <ThemedText>that you want to start tracking</ThemedText>
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
                                title='Apply!'
                                onPress={savePeriodHandler}
                                disabled={!isPeriodValid}
                                testID="welcome-apply"
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

