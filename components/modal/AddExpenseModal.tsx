import React, { useContext, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '../ThemedView';
import { appContext } from '@/store/context';
import { AppDialog, AppTextInput } from '@/components/ui';

const AddExpenseModal: React.FC<{ isVisible: boolean; onClose: () => void }> = ({ isVisible, onClose }) => {
    const ctx = useContext(appContext);
    const [amount, setAmount] = useState<number>(0);
    const [label, setLabel] = useState<string>('');
    const onSubmit = () => {
        const currentDate = new Date();
        const expenseItem = { date: currentDate, amount, label }
        ctx.mutators.addExpenseItem(expenseItem);
        onClose();
    }
    return (
        <AppDialog
            visible={isVisible}
            onDismiss={onClose}
            title="Add expense"
            testID="add-expense-dialog"
            actions={[
                { label: 'Back', onPress: onClose },
                { label: 'Save', onPress: onSubmit },
            ]}
        >
            <ThemedView style={styles.inputContainer}>
                <AppTextInput
                    label="Amount"
                    keyboardType="numeric"
                    value={amount > 0 ? amount?.toString() : ''}
                    onChangeText={(text) => setAmount(Number(text))}
                    testID="expense-amount-input"
                />
            </ThemedView>
            <ThemedView style={styles.inputContainer}>
                <AppTextInput
                    label="Label"
                    value={label}
                    onChangeText={setLabel}
                    testID="expense-label-input"
                />
            </ThemedView>
        </AppDialog>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        marginBottom: 16,
    },
});

export default AddExpenseModal;
