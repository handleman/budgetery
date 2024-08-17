import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';

const AddIncomeModal: React.FC<{ isVisible: boolean; onClose: () => void }> = ({ isVisible, onClose }) => {
    const [amount, setAmount] = useState<number | undefined>(undefined);
    const [label, setLabel] = useState<string>('');

    const onSubmit = () => {
        // todo: connect to app state
        onClose();
    }
    return (
        <Modal isVisible={isVisible}>
            <ThemedView style={styles.container}>
                <ThemedView style={styles.inputContainer}>
                    <ThemedText style={styles.label}>Amount</ThemedText>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={amount?.toString()}
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
                    title='Cancel'
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
