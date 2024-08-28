import React, { useContext, useState } from 'react';
import { TextInput, Button, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { appContext } from '@/store/context';

const AddIncomeModal: React.FC<{ isVisible: boolean; onClose: () => void }> = ({ isVisible, onClose }) => {
    const ctx = useContext(appContext);
    const [amount, setAmount] = useState<number>(0);
    const [label, setLabel] = useState<string>('');
    const onSubmit = () => {
        const currentDate = new Date();
        const incomeItem = { date: currentDate, amount, label } //todo: add isPercentage
        // todo: call mututator for obligations
        // ctx.mutators.addIncomeItem(incomeItem);
        onClose();
    }
    return (
        <Modal isVisible={isVisible}>
            <ThemedView style={styles.container}>
                <ThemedView>
                    <ThemedText>You may choose between exact amount or relative percentage</ThemedText>
                    <ThemedText>(relative to total income)</ThemedText>
                </ThemedView>
                <ThemedView style={styles.inputContainer}>
                    {/* todo: radiobutton */}
                    <ThemedText style={styles.label}>Amount/Percentage</ThemedText>

                </ThemedView>
                <ThemedView style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={amount > 0 ? amount?.toString() : ''}
                        onChangeText={(text) => setAmount(Number(text))}
                    />
                </ThemedView>
                <ThemedView style={styles.inputContainer}>
                    <ThemedText style={styles.label}>Label</ThemedText>
                    <TextInput
                        style={styles.input}
                        value={label}
                        onChangeText={setLabel}
                    />
                </ThemedView>
            </ThemedView>
            <ThemedView>
                <Button
                    title='Back'
                    onPress={onClose}
                />
                <Button
                    title='Save'
                    onPress={onSubmit}
                />
            </ThemedView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        borderRadius: 4,
    },
});

export default AddIncomeModal;
