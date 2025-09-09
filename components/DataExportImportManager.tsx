/*
 * Sallie AI Data Export/Import Manager
 * Comprehensive data management for export and import functionality
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    Dimensions,
    Share,
    Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { useTheme } from './ThemeSystem';
import { getFontStyle } from './FontManager';
import { usePressAnimation } from './AnimationSystem';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export interface ExportData {
    version: string;
    exportDate: string;
    userProfile?: any;
    conversations?: any[];
    settings?: any;
    preferences?: any;
    statistics?: any;
    metadata: {
        platform: string;
        appVersion: string;
        exportType: 'full' | 'conversations' | 'settings' | 'profile';
    };
}

interface DataExportImportManagerProps {
    onDataImported?: (data: ExportData) => void;
    onDataExported?: (data: ExportData) => void;
    style?: any;
}

const DataExportImportManager: React.FC<DataExportImportManagerProps> = ({
    onDataImported,
    onDataExported,
    style,
}) => {
    const { theme } = useTheme();
    const [exporting, setExporting] = useState(false);
    const [importing, setImporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [importProgress, setImportProgress] = useState(0);
    const [lastExportDate, setLastExportDate] = useState<string | null>(null);
    const [dataSize, setDataSize] = useState(0);

    useEffect(() => {
        loadMetadata();
        calculateDataSize();
    }, []);

    const loadMetadata = async () => {
        try {
            const exportDate = await AsyncStorage.getItem('last_export_date');
            if (exportDate) {
                setLastExportDate(exportDate);
            }
        } catch (error) {
            console.error('Failed to load metadata:', error);
        }
    };

    const calculateDataSize = async () => {
        try {
            // Calculate approximate data size
            const keys = await AsyncStorage.getAllKeys();
            let totalSize = 0;

            for (const key of keys) {
                const value = await AsyncStorage.getItem(key);
                if (value) {
                    totalSize += value.length * 2; // Rough estimate: 2 bytes per character
                }
            }

            setDataSize(Math.round(totalSize / 1024)); // Convert to KB
        } catch (error) {
            console.error('Failed to calculate data size:', error);
        }
    };

    const collectData = async (exportType: 'full' | 'conversations' | 'settings' | 'profile'): Promise<ExportData> => {
        const baseData: ExportData = {
            version: '1.0.0',
            exportDate: new Date().toISOString(),
            metadata: {
                platform: Platform.OS,
                appVersion: '1.0.0',
                exportType,
            },
        };

        try {
            if (exportType === 'full' || exportType === 'profile') {
                const userProfile = await AsyncStorage.getItem('user_profile');
                if (userProfile) {
                    baseData.userProfile = JSON.parse(userProfile);
                }
            }

            if (exportType === 'full' || exportType === 'conversations') {
                const conversations = await AsyncStorage.getItem('conversations');
                if (conversations) {
                    baseData.conversations = JSON.parse(conversations);
                }
            }

            if (exportType === 'full' || exportType === 'settings') {
                const settings = await AsyncStorage.getItem('app_settings');
                const preferences = await AsyncStorage.getItem('user_preferences');
                const statistics = await AsyncStorage.getItem('user_statistics');

                if (settings) baseData.settings = JSON.parse(settings);
                if (preferences) baseData.preferences = JSON.parse(preferences);
                if (statistics) baseData.statistics = JSON.parse(statistics);
            }

            return baseData;
        } catch (error) {
            console.error('Failed to collect data:', error);
            throw error;
        }
    };

    const exportData = async (exportType: 'full' | 'conversations' | 'settings' | 'profile') => {
        try {
            setExporting(true);
            setExportProgress(0);

            // Collect data
            setExportProgress(25);
            const data = await collectData(exportType);
            setExportProgress(50);

            // Convert to JSON
            const jsonString = JSON.stringify(data, null, 2);
            setExportProgress(75);

            // Create file
            const fileName = `sallie_data_${exportType}_${new Date().toISOString().split('T')[0]}.json`;
            const fileUri = FileSystem.documentDirectory + fileName;

            await FileSystem.writeAsStringAsync(fileUri, jsonString);
            setExportProgress(90);

            // Share file
            await Share.share({
                title: 'Sallie AI Data Export',
                message: `Sallie AI data exported on ${new Date().toLocaleDateString()}`,
                url: fileUri,
            });

            // Update metadata
            const exportDate = new Date().toISOString();
            await AsyncStorage.setItem('last_export_date', exportDate);
            setLastExportDate(exportDate);
            setExportProgress(100);

            onDataExported?.(data);
            Alert.alert('Success', 'Data exported successfully!');

        } catch (error) {
            console.error('Export failed:', error);
            Alert.alert('Export Failed', 'Failed to export data. Please try again.');
        } finally {
            setExporting(false);
            setExportProgress(0);
        }
    };

    const importData = async () => {
        try {
            setImporting(true);
            setImportProgress(0);

            // For now, show import instructions
            // In a full implementation, this would use a document picker
            Alert.alert(
                'Import Data',
                'To import data, please ensure you have the exported JSON file ready. Full import functionality requires additional setup.',
                [{ text: 'OK' }]
            );
            return;
            setImportProgress(25);

            // For now, we'll simulate importing with sample data
            // In a full implementation, this would read from the selected file
            const mockImportData: ExportData = {
                version: '1.0.0',
                exportDate: new Date().toISOString(),
                metadata: {
                    platform: Platform.OS,
                    appVersion: '1.0.0',
                    exportType: 'full',
                },
                userProfile: { name: 'Imported User', email: 'imported@example.com' },
                conversations: [],
                settings: {},
            };

            setImportProgress(50);

            // Parse data (using mock data for now)
            const importData: ExportData = mockImportData;
            setImportProgress(75);

            // Validate data structure
            if (!importData.version || !importData.metadata) {
                throw new Error('Invalid data format');
            }

            // Import data based on type
            await importDataByType(importData);
            setImportProgress(90);

            // Update metadata
            await AsyncStorage.setItem('last_import_date', new Date().toISOString());
            setImportProgress(100);

            onDataImported?.(importData);
            Alert.alert('Success', 'Data imported successfully!');

        } catch (error) {
            console.error('Import failed:', error);
            Alert.alert('Import Failed', 'Failed to import data. Please check the file format and try again.');
        } finally {
            setImporting(false);
            setImportProgress(0);
        }
    };

    const importDataByType = async (data: ExportData) => {
        const { exportType } = data.metadata;

        if (exportType === 'full' || exportType === 'profile') {
            if (data.userProfile) {
                await AsyncStorage.setItem('user_profile', JSON.stringify(data.userProfile));
            }
        }

        if (exportType === 'full' || exportType === 'conversations') {
            if (data.conversations) {
                await AsyncStorage.setItem('conversations', JSON.stringify(data.conversations));
            }
        }

        if (exportType === 'full' || exportType === 'settings') {
            if (data.settings) {
                await AsyncStorage.setItem('app_settings', JSON.stringify(data.settings));
            }
            if (data.preferences) {
                await AsyncStorage.setItem('user_preferences', JSON.stringify(data.preferences));
            }
            if (data.statistics) {
                await AsyncStorage.setItem('user_statistics', JSON.stringify(data.statistics));
            }
        }
    };

    const clearAllData = async () => {
        Alert.alert(
            'Clear All Data',
            'This will permanently delete all your data. This action cannot be undone. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear Everything',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const keys = await AsyncStorage.getAllKeys();
                            await AsyncStorage.multiRemove(keys);
                            setDataSize(0);
                            setLastExportDate(null);
                            Alert.alert('Success', 'All data cleared successfully');
                        } catch (error) {
                            console.error('Failed to clear data:', error);
                            Alert.alert('Error', 'Failed to clear data');
                        }
                    },
                },
            ]
        );
    };

    const createBackup = async () => {
        await exportData('full');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString() + ' ' +
            new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <ScrollView
            style={[styles.container, style]}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* Data Overview */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <MaterialIcons name="analytics" size={24} color={theme.colors.primary} />
                    <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                        Data Overview
                    </Text>
                </View>

                <View style={[styles.overviewCard, { backgroundColor: theme.colors.surface }]}>
                    <View style={styles.overviewItem}>
                        <Text style={[styles.overviewLabel, { color: theme.colors.text.secondary }]}>
                            Total Data Size
                        </Text>
                        <Text style={[styles.overviewValue, { color: theme.colors.primary }]}>
                            {dataSize} KB
                        </Text>
                    </View>

                    <View style={styles.overviewItem}>
                        <Text style={[styles.overviewLabel, { color: theme.colors.text.secondary }]}>
                            Last Export
                        </Text>
                        <Text style={[styles.overviewValue, { color: theme.colors.text.primary }]}>
                            {lastExportDate ? formatDate(lastExportDate) : 'Never'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Export Options */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Feather name="upload" size={24} color={theme.colors.primary} />
                    <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                        Export Data
                    </Text>
                </View>

                <Text style={[styles.sectionDescription, { color: theme.colors.text.secondary }]}>
                    Export your data for backup or transfer to another device.
                </Text>

                <View style={styles.actionGrid}>
                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
                        onPress={() => exportData('full')}
                        disabled={exporting}
                    >
                        <MaterialIcons name="backup" size={32} color={theme.colors.primary} />
                        <Text style={[styles.actionTitle, { color: theme.colors.text.primary }]}>
                            Full Backup
                        </Text>
                        <Text style={[styles.actionDescription, { color: theme.colors.text.secondary }]}>
                            Export all data
                        </Text>
                        {exporting && (
                            <View style={styles.progressContainer}>
                                <ActivityIndicator size="small" color={theme.colors.primary} />
                                <Text style={[styles.progressText, { color: theme.colors.primary }]}>
                                    {exportProgress}%
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
                        onPress={() => exportData('conversations')}
                        disabled={exporting}
                    >
                        <Ionicons name="chatbubble" size={32} color={theme.colors.primary} />
                        <Text style={[styles.actionTitle, { color: theme.colors.text.primary }]}>
                            Conversations
                        </Text>
                        <Text style={[styles.actionDescription, { color: theme.colors.text.secondary }]}>
                            Chat history only
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
                        onPress={() => exportData('settings')}
                        disabled={exporting}
                    >
                        <Feather name="settings" size={32} color={theme.colors.primary} />
                        <Text style={[styles.actionTitle, { color: theme.colors.text.primary }]}>
                            Settings
                        </Text>
                        <Text style={[styles.actionDescription, { color: theme.colors.text.secondary }]}>
                            Preferences & config
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
                        onPress={() => exportData('profile')}
                        disabled={exporting}
                    >
                        <MaterialIcons name="person" size={32} color={theme.colors.primary} />
                        <Text style={[styles.actionTitle, { color: theme.colors.text.primary }]}>
                            Profile
                        </Text>
                        <Text style={[styles.actionDescription, { color: theme.colors.text.secondary }]}>
                            User information
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Import Options */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Feather name="download" size={24} color={theme.colors.primary} />
                    <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                        Import Data
                    </Text>
                </View>

                <Text style={[styles.sectionDescription, { color: theme.colors.text.secondary }]}>
                    Import previously exported data to restore your information.
                </Text>

                <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
                    onPress={importData}
                    disabled={importing}
                >
                    {importing ? (
                        <View style={styles.buttonContent}>
                            <ActivityIndicator size="small" color={theme.colors.onPrimary} />
                            <Text style={[styles.primaryButtonText, { color: theme.colors.onPrimary }]}>
                                Importing... {importProgress}%
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.buttonContent}>
                            <Feather name="download" size={20} color={theme.colors.onPrimary} />
                            <Text style={[styles.primaryButtonText, { color: theme.colors.onPrimary }]}>
                                Import Data
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <MaterialIcons name="bolt" size={24} color={theme.colors.primary} />
                    <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                        Quick Actions
                    </Text>
                </View>

                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={[styles.quickActionButton, { backgroundColor: theme.colors.secondary }]}
                        onPress={createBackup}
                        disabled={exporting}
                    >
                        <MaterialIcons name="backup" size={20} color={theme.colors.onSecondary} />
                        <Text style={[styles.quickActionText, { color: theme.colors.onSecondary }]}>
                            Quick Backup
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.quickActionButton, { backgroundColor: theme.colors.error }]}
                        onPress={clearAllData}
                    >
                        <MaterialIcons name="delete-forever" size={20} color={theme.colors.onError} />
                        <Text style={[styles.quickActionText, { color: theme.colors.onError }]}>
                            Clear All Data
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Data Privacy Notice */}
            <View style={[styles.section, styles.privacySection]}>
                <View style={styles.sectionHeader}>
                    <MaterialIcons name="privacy-tip" size={24} color={theme.colors.primary} />
                    <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                        Privacy & Security
                    </Text>
                </View>

                <Text style={[styles.privacyText, { color: theme.colors.text.secondary }]}>
                    Your data is stored locally on your device. Exported files contain your personal information and should be handled securely. We recommend encrypting sensitive exports before sharing.
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    scrollContent: {
        padding: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    sectionDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 20,
        color: '#666',
    },
    overviewCard: {
        borderRadius: 12,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    overviewItem: {
        flex: 1,
        alignItems: 'center',
    },
    overviewLabel: {
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    overviewValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    actionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    actionCard: {
        flex: 1,
        minWidth: (width - 40 - 24) / 2,
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 8,
        marginBottom: 4,
        textAlign: 'center',
    },
    actionDescription: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 16,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    progressText: {
        fontSize: 12,
        marginLeft: 8,
    },
    primaryButton: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    quickActions: {
        flexDirection: 'row',
        gap: 12,
    },
    quickActionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
    },
    quickActionText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    privacySection: {
        marginBottom: 20,
    },
    privacyText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#666',
    },
});

export default DataExportImportManager;
