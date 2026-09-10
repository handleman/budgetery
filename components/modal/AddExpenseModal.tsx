import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { appContext } from '@/store/context';
import { AppDialog, AppTextInput } from '@/components/ui';
import type { ExpenseItem } from '@/store/types';
import { parseCommaAmounts, parseDateInput, toDayKey } from '@/store/expenseGrouping';

type Props = {
    isVisible: boolean;
    onClose: () => void;
    /** Visible-list index of the item being edited; null/undefined = add mode. */
    editingIndex?: number | null;
    initial?: ExpenseItem | null;
};

const AddExpenseModal: React.FC<Props> = ({ isVisible, onClose, editingIndex = null, initial = null }) => {
    const ctx = useContext(appContext);
    const isEditing = editingIndex !== null && editingIndex !== undefined && initial !== null;
    const [amountText, setAmountText] = useState<string>('');
    const [label, setLabel] = useState<string>('');
    const [dateText, setDateText] = useState<string>(toDayKey(new Date()));

    useEffect(() => {
        if (isVisible) {
            if (initial) {
                setAmountText(String(initial.amount));
                setLabel(initial.label);
                setDateText(toDayKey(initial.date));
            } else {
                setAmountText('');
                setLabel('');
                setDateText(toDayKey(new Date()));
            }
        }
    }, [isVisible, editingIndex]);

    const closeAndReset = () => {
        setAmountText('');
        setLabel('');
        setDateText(toDayKey(new Date()));
        onClose();
    };

    const onSubmit = () => {
        if (label.trim() === '') return;
        const date = parseDateInput(dateText);
        if (isEditing && editingIndex !== null && editingIndex !== undefined) {
            const amount = Number(amountText);
            if (!Number.isFinite(amount) || amount === 0) return;
            ctx.mutators.updateExpenseItem(editingIndex, { date, amount, label: label.trim() });
        } else {
            const amounts = parseCommaAmounts(amountText);
            if (amounts.length === 0) return;
            const items = amounts.map((amount) => ({ date, amount, label: label.trim() }));
            ctx.mutators.addExpenseItems(items);
        }
        closeAndReset();
    };

    const onDelete = () => {
        if (isEditing && editingIndex !== null && editingIndex !== undefined) {
            ctx.mutators.removeExpenseItem(editingIndex);
        }
        closeAndReset();
    };

    const actions = isEditing
        ? [
            { label: 'Back', onPress: closeAndReset },
            { label: 'Delete', onPress: onDelete },
            { label: 'Save', onPress: onSubmit },
        ]
        : [
            { label: 'Back', onPress: closeAndReset },
            { label: 'Save', onPress: onSubmit },
        ];

    return (
        <AppDialog
            visible={isVisible}
            onDismiss={closeAndReset}
            title={isEditing ? 'Edit expense' : 'Add expense'}
            testID="add-expense-dialog"
            actions={actions}
        >
            <ThemedView style={styles.inputContainer}>
                <AppTextInput
                    label={isEditing ? 'Amount' : 'Amount (comma-separated for several)'}
                    keyboardType="numeric"
                    value={amountText}
                    onChangeText={setAmountText}
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
            <ThemedView style={styles.inputContainer}>
                <AppTextInput
                    label="Date (YYYY-MM-DD, today by default)"
                    value={dateText}
                    onChangeText={setDateText}
                    testID="expense-date-input"
                />
            </ThemedView>
            {!isEditing && (
                <ThemedView>
                    <ThemedText style={styles.hint}>You can enter several values in a row, separated by comma.</ThemedText>
                </ThemedView>
            )}
        </AppDialog>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        marginBottom: 16,
    },
    hint: {
        fontSize: 12,
        opacity: 0.7,
    },
});

export default AddExpenseModal;
