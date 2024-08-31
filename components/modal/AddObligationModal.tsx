import React, { useContext, useState } from 'react';
import { TextInput, Button, StyleSheet, Switch } from 'react-native';
import Modal from 'react-native-modal';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { appContext } from '@/store/context';

const AddIncomeModal: React.FC<{ isVisible: boolean; onClose: () => void }> = ({ isVisible, onClose }) => {
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
        <Modal isVisible={isVisible}>
            <ThemedView style={styles.container}>
                <ThemedView>
                    <ThemedText>You may choose between exact amount or relative percentage</ThemedText>
                    <ThemedText>(relative to total income)</ThemedText>
                </ThemedView>
                <ThemedView style={styles.inputContainer}>
                    <Switch
                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                        thumbColor={isPercentage ? '#f5dd4b' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleSwitch}
                        value={isPercentage}
                    />
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
