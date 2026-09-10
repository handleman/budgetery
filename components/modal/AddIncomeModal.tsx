import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '../ThemedView';
import { appContext } from '@/store/context';
import { AppDialog, AppTextInput } from '@/components/ui';
import type { IncomeItem } from '@/store/types';
import { parseDateInput, toDayKey } from '@/store/expenseGrouping';

type Props = {
    isVisible: boolean;
    onClose: () => void;
    editingIndex?: number | null;
    initial?: IncomeItem | null;
};

const AddIncomeModal: React.FC<Props> = ({ isVisible, onClose, editingIndex = null, initial = null }) => {
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
        const amount = Number(amountText);
        if (!Number.isFinite(amount) || amount === 0 || label.trim() === '') return;
        const date = parseDateInput(dateText);
        const incomeItem = { date, amount, label: label.trim() };
        if (isEditing && editingIndex !== null && editingIndex !== undefined) {
            ctx.mutators.updateIncomeItem(editingIndex, incomeItem);
        } else {
            ctx.mutators.addIncomeItem(incomeItem);
        }
        closeAndReset();
    };

    const onDelete = () => {
        if (isEditing && editingIndex !== null && editingIndex !== undefined) {
            ctx.mutators.removeIncomeItem(editingIndex);
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
            title={isEditing ? 'Edit income' : 'Add income'}
            testID="add-income-dialog"
            actions={actions}
        >
            <ThemedView style={styles.inputContainer}>
                <AppTextInput
                    label="Amount"
                    keyboardType="numeric"
                    value={amountText}
                    onChangeText={setAmountText}
                    testID="income-amount-input"
                />
            </ThemedView>
            <ThemedView style={styles.inputContainer}>
                <AppTextInput
                    label="Label"
                    value={label}
                    onChangeText={setLabel}
                    testID="income-label-input"
                />
            </ThemedView>
            <ThemedView style={styles.inputContainer}>
                <AppTextInput
                    label="Date (YYYY-MM-DD, today by default)"
                    value={dateText}
                    onChangeText={setDateText}
                    testID="income-date-input"
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

export default AddIncomeModal;
