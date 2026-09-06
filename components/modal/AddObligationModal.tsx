import React, { useContext, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { appContext } from '@/store/context';
import { AppDialog, AppSwitch, AppTextInput } from '@/components/ui';

const AddObligationModal: React.FC<{ isVisible: boolean; onClose: () => void }> = ({ isVisible, onClose }) => {
    const ctx = useContext(appContext);
    const [amount, setAmount] = useState<number>(0);
    const [label, setLabel] = useState<string>('');
    const [isPercentage, setIsPercentage] = useState<boolean>(false);
    const onSubmit = () => {
        const currentDate = new Date();
        const obligationItem = { date: currentDate, amount, label, isPercentage }
        ctx.mutators.addObligationItem(obligationItem);
        onClose();
    }
    const toggleSwitch = () => {
        setIsPercentage((old) => {
            return !old;
        });
    }
    return (
        <AppDialog
            visible={isVisible}
            onDismiss={onClose}
            title="Add obligation"
            testID="add-obligation-dialog"
            actions={[
                { label: 'Back', onPress: onClose },
                { label: 'Save', onPress: onSubmit },
            ]}
        >
            <ThemedView>
                <ThemedText>You may choose between exact amount or relative percentage</ThemedText>
                <ThemedText>(relative to total income)</ThemedText>
            </ThemedView>
            <ThemedView style={styles.inputContainer}>
                <AppSwitch
                    onValueChange={toggleSwitch}
                    value={isPercentage}
                    testID="obligation-percentage-switch"
                />
                <ThemedText style={styles.label}>Amount/Percentage</ThemedText>

            </ThemedView>
            <ThemedView style={styles.inputContainer}>
                <AppTextInput
                    label="Amount"
                    keyboardType="numeric"
                    value={amount > 0 ? amount?.toString() : ''}
                    onChangeText={(text) => setAmount(Number(text))}
                    testID="obligation-amount-input"
                />
            </ThemedView>
            <ThemedView style={styles.inputContainer}>
                <AppTextInput
                    label="Label"
                    value={label}
                    onChangeText={setLabel}
                    testID="obligation-label-input"
                />
            </ThemedView>
        </AppDialog>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
    },
});

export default AddObligationModal;
