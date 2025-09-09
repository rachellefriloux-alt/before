/*
 * Sallie AI Data Management Screen
 * Data export/import and backup management screen
 */

import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useThemeStore } from '../store/theme';
import DataExportImportManager from '../../components/DataExportImportManager';

export default function DataManagementScreen() {
    const { currentTheme } = useThemeStore();

    const handleDataExported = (data: any) => {
        console.log('Data exported:', data);
        // Here you could track export events or update UI state
    };

    const handleDataImported = (data: any) => {
        console.log('Data imported:', data);
        // Here you could refresh app state or show success message
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
            <StatusBar
                style={currentTheme.name.includes('light') ? 'dark' : 'light'}
                backgroundColor={currentTheme.colors.background}
            />

            <DataExportImportManager
                onDataExported={handleDataExported}
                onDataImported={handleDataImported}
                style={styles.dataManager}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    dataManager: {
        flex: 1,
    },
});
