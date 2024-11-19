import React from 'react';
import { View, StyleSheet } from 'react-native';

const Hr = () => {
    return <View style={styles.line} />;
};

const styles = StyleSheet.create({
    line: {
        borderBottomColor: '#000',
        borderBottomWidth: 1,
        marginVertical: 10,
    },
});

export default Hr;
