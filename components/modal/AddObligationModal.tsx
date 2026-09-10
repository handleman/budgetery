import React, { useContext, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { appContext } from '@/store/context';
import { AppDialog, AppSwitch, AppTextInput } from '@/components/ui';
import type { ObligationItem } from '@/store/types';
import { parseDateInput, toDayKey } from '@/store/expenseGrouping';

type Props = {
    isVisible: boolean;
    onClose: () => void;
    editingIndex?: number | null;
    initial?: ObligationItem | null;
};

const AddObligationModal: React.FC<Props> = ({ isVisible, onClose, editingIndex = null, initial = null }) => {
    const ctx = useContext(appContext);
    const isEditing = editingIndex !== null && editingIndex !== undefined && initial !== null;
    const [amountText, setAmountText] = useState<string>('');
    const [label, setLabel] = useState<string>('');
    const [isPercentage, setIsPercentage] = useState<boolean>(false);
    const [isRecurring, setIsRecurring] = useState<boolean>(false);
    const [dateText, setDateText] = useState<string>(toDayKey(new Date()));

    // Prefill on open (transition closed→open) during render — the React-endorsed
    // alternative to setState-in-effect. The editing target never changes while open.
    const [wasVisible, setWasVisible] = useState(false);
    if (isVisible !== wasVisible) {
        setWasVisible(isVisible);
        if (isVisible) {
            if (initial) {
                setAmountText(String(initial.amount));
                setLabel(initial.label);
                setIsPercentage(initial.isPercentage);
                setIsRecurring(initial.isRecurring === true);
                setDateText(toDayKey(initial.date));
            } else {
                setAmountText('');
                setLabel('');
                setIsPercentage(false);
                setIsRecurring(false);
                setDateText(toDayKey(new Date()));
            }
        }
    }

    const closeAndReset = () => {
        setAmountText('');
        setLabel('');
        setIsPercentage(false);
        setIsRecurring(false);
        setDateText(toDayKey(new Date()));
        onClose();
    };

    const onSubmit = () => {
        const amount = Number(amountText);
        if (!Number.isFinite(amount) || amount === 0 || label.trim() === '') return;
        const date = parseDateInput(dateText);
        const obligationItem = { date, amount, label: label.trim(), isPercentage, isRecurring };
        if (isEditing && editingIndex !== null && editingIndex !== undefined) {
            ctx.mutators.updateObligationItem(editingIndex, obligationItem);
        } else {
            ctx.mutators.addObligationItem(obligationItem);
        }
        closeAndReset();
    };

    const onDelete = () => {
        if (isEditing && editingIndex !== null && editingIndex !== undefined) {
            ctx.mutators.removeObligationItem(editingIndex);
        }
        closeAndReset();
    };

    const toggleSwitch = () => {
        setIsPercentage((old) => {
            return !old;
        });
    }
    const toggleRecurring = () => {
        setIsRecurring((old) => !old);
    }
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
            title={isEditing ? 'Edit obligation' : 'Add obligation'}
            testID="add-obligation-dialog"
            actions={actions}
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
                <AppSwitch
                    onValueChange={toggleRecurring}
                    value={isRecurring}
                    testID="obligation-recurring-switch"
                />
                <ThemedText style={styles.label}>Recurring monthly (carried into new months)</ThemedText>
            </ThemedView>
            <ThemedView style={styles.inputContainer}>
                <AppTextInput
                    label="Amount"
                    keyboardType="numeric"
                    value={amountText}
                    onChangeText={setAmountText}
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
            <ThemedView style={styles.inputContainer}>
                <AppTextInput
                    label="Date (YYYY-MM-DD, today by default)"
                    value={dateText}
                    onChangeText={setDateText}
                    testID="obligation-date-input"
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
