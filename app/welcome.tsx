import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { appContext } from "@/store/context";
import { useContext, useState } from "react";
import { Button, StyleSheet, TextInput, useColorScheme } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

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

//todo: connect to currentPeriod state
export default function WelcomeScreen() {
    const ctx = useContext(appContext);
    const [tutorialPassed, setTutorialPassed] = useState<boolean>(ctx.store.welcomeTutorialPassed);
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [selectedPeriodName, setSelectedPeriodName] = useState<string>('');


    const getStartedHandler = () => {
        ctx.mutators.passWelcomeTutorial();
        setTutorialPassed(true);
    }
    const selectMonthHandler = (value: number) => {
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
                            <RNPickerSelect
                                onValueChange={selectMonthHandler}
                                items={monthNames}
                                placeholder={{ label: 'Select a month', value: null }}
                            />
                        </ThemedView>
                        <ThemedView>
                            <ThemedText type="title">Set the Label</ThemedText>
                            <ThemedText>(selected month name is by default)</ThemedText>
                            <TextInput
                                style={styles.input}
                                value={selectedPeriodName}
                                onChangeText={setSelectedPeriodName}
                            />
                        </ThemedView>

                    </>
                ) : (
                    <>
                        <ThemedText type="title">You don't have any data yet</ThemedText>
                        <ThemedView>
                            <Button
                                title='Get started!'
                                onPress={getStartedHandler}
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
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        width: '80%',
        paddingHorizontal: 10,
    },
});

