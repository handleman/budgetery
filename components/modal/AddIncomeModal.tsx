import React, { useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { appContext } from '@/store/context';
import { AppDialog, AppTextInput } from '@/components/ui';
import { screenGamma } from '@/components/ui/screenGamma';
import type { IncomeItem } from '@/store/types';
import { toDayKey } from '@/store/expenseGrouping';
import {
    activePeriodMonthYear,
    defaultDayKeyForPeriod,
    isCurrentPeriodMonth,
    parseDateInputForPeriod,
} from '@/store/periodDates';

type Props = {
    isVisible: boolean;
    onClose: () => void;
    editingIndex?: number | null;
    initial?: IncomeItem | null;
};

const AddIncomeModal: React.FC<Props> = ({ isVisible, onClose, editingIndex = null, initial = null }) => {
    const ctx = useContext(appContext);
    const isEditing = editingIndex !== null && editingIndex !== undefined && initial !== null;
    // Period-aware dates: default to today when today is in the active period
    // month, else to the 1st of the period month.
    const period = activePeriodMonthYear(ctx.store);
    const periodIsCurrent = isCurrentPeriodMonth(period.month, period.year);
    const [amountText, setAmountText] = useState<string>('');
    const [label, setLabel] = useState<string>('');
    const [dateText, setDateText] = useState<string>(defaultDayKeyForPeriod(period.month, period.year));

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
        const amount = Number(amountText);
        if (!Number.isFinite(amount) || amount === 0 || label.trim() === '') return;
        const date = parseDateInputForPeriod(dateText, period.month, period.year);
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
            saveButtonColor={screenGamma.income.cta}
        >
            <View style={styles.inputContainer}>
                <AppTextInput
                    label="Amount"
                    keyboardType="numeric"
                    value={amountText}
                    onChangeText={setAmountText}
                    testID="income-amount-input"
                    right={<PaperTextInput.Icon icon="currency-usd" />}
                />
            </View>
            <View style={styles.inputContainer}>
                <AppTextInput
                    label="Label"
                    value={label}
                    onChangeText={setLabel}
                    testID="income-label-input"
                    right={<PaperTextInput.Icon icon="tag" />}
                />
            </View>
            <View style={styles.inputContainer}>
                <AppTextInput
                    label={periodIsCurrent ? 'Date (YYYY-MM-DD, today by default)' : 'Date (YYYY-MM-DD, 1st of period month by default)'}
                    value={dateText}
                    onChangeText={setDateText}
                    testID="income-date-input"
                    right={<PaperTextInput.Icon icon="calendar" />}
                />
            </View>
        </AppDialog>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        marginBottom: 16,
    },
});

export default AddIncomeModal;
