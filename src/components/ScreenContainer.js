import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

export const ScreenContainer = ({ children }) => {
    const { theme } = useTheme();
    const safeTheme = theme || { background: '#0A0A0A' };

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: safeTheme.background }]}
            edges={['top', 'left', 'right']}
        >
            {children}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
