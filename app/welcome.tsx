import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { appContext } from "@/store/context";
import { useContext, useState } from "react";
import { Button, StyleSheet, useColorScheme } from 'react-native';

export default function WelcomeScreen() {
    const ctx = useContext(appContext);
    const [tutorialPassed, setTutorialPassed] = useState<boolean>(ctx.store.welcomeTutorialPassed);


    const getStartedHandler = () => {
        ctx.mutators.passWelcomeTutorial();
        setTutorialPassed(true);
    }
    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.content}>
                {tutorialPassed ? (
                    <ThemedView>
                        <ThemedText>
                            Tutorial passed
                        </ThemedText>
                    </ThemedView>
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
});

