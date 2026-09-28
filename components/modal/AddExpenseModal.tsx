import React, { useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { ThemedText } from '../ThemedText';
import { appContext } from '@/store/context';
import { AppDialog, AppDatePicker, AppTextInput } from '@/components/ui';
import { screenGamma } from '@/components/ui/screenGamma';
import type { ExpenseItem } from '@/store/types';
import { parseCommaAmounts, toDayKey } from '@/store/expenseGrouping';
import {
    activePeriodMonthYear,
    defaultDayKeyForPeriod,
    isCurrentPeriodMonth,
    parseDateInputForPeriod,
    periodMonthBounds,
} from '@/store/periodDates';

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
    // Period-aware dates: default to today when today is in the active period
    // month, else to the 1st of the period month (keeps entries + the
    // day-by-day breakdown inside the selected period).
    const period = activePeriodMonthYear(ctx.store);
    const periodDefaultKey = defaultDayKeyForPeriod(period.month, period.year);
    const periodBounds = periodMonthBounds(period.month, period.year);
    const periodIsCurrent = isCurrentPeriodMonth(period.month, period.year);
    const [amountText, setAmountText] = useState<string>('');
    const [label, setLabel] = useState<string>('');
    const [dateText, setDateText] = useState<string>(periodDefaultKey);

    // Prefill on open (transition closed→open) during render — the React-endorsed
    // alternative to setState-in-effect. The editing target never changes while open.
    const [wasVisible, setWasVisible] = useState(false);
    if (isVisible !== wasVisible) {
        setWasVisible(isVisible);
        if (isVisible) {
            if (initial) {
                setAmountText(String(initial.amount));
                setLabel(initial.label);
                setDateText(toDayKey(initial.date));
            } else {
                setAmountText('');
                setLabel('');
                setDateText(defaultDayKeyForPeriod(period.month, period.year));
            }
        }
    }

    const closeAndReset = () => {
        setAmountText('');
        setLabel('');
        setDateText(defaultDayKeyForPeriod(period.month, period.year));
        onClose();
    };

    const onSubmit = () => {
        if (label.trim() === '') return;
        const date = parseDateInputForPeriod(dateText, period.month, period.year);
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
            saveButtonColor={screenGamma.expenses.cta}
        >
            <View style={styles.inputContainer}>
                <AppTextInput
                    label={isEditing ? 'Amount' : 'Amount (comma-separated for several)'}
                    keyboardType="numeric"
                    value={amountText}
                    onChangeText={setAmountText}
                    testID="expense-amount-input"
                    right={<PaperTextInput.Icon icon="currency-usd" />}
                />
            </View>
            <View style={styles.inputContainer}>
                <AppTextInput
                    label="Label"
                    value={label}
                    onChangeText={setLabel}
                    testID="expense-label-input"
                    right={<PaperTextInput.Icon icon="tag" />}
                />
            </View>
            <View style={styles.inputContainer}>
                <AppDatePicker
                    label={periodIsCurrent ? 'Date (today by default)' : 'Date (1st of period month by default)'}
                    value={dateText}
                    onChange={setDateText}
                    testID="expense-date-input"
                    startDate={periodBounds.start}
                    endDate={periodIsCurrent ? undefined : periodBounds.end}
                />
            </View>
            {!isEditing && (
                <View>
                    <ThemedText style={styles.hint}>You can enter several values in a row, separated by comma.</ThemedText>
                </View>
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
