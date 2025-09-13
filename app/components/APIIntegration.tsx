import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    Switch,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../store/theme';
import { EnhancedButton } from './EnhancedButton';
import { EnhancedCard } from './EnhancedCard';

interface APIConnection {
    id: string;
    name: string;
    description: string;
    category: 'social' | 'cloud' | 'ai' | 'communication' | 'productivity';
    status: 'connected' | 'disconnected' | 'error' | 'connecting';
    lastSync?: Date;
    syncFrequency: 'realtime' | 'hourly' | 'daily' | 'manual';
    apiKey?: string;
    endpoint: string;
    enabled: boolean;
}

interface SyncOperation {
    id: string;
    connectionId: string;
    operation: 'sync' | 'fetch' | 'push' | 'update';
    status: 'pending' | 'running' | 'completed' | 'failed';
    startTime: Date;
    endTime?: Date;
    dataTransferred: number;
    errorMessage?: string;
}

interface WebhookEndpoint {
    id: string;
    url: string;
    events: string[];
    enabled: boolean;
    lastTriggered?: Date;
}

export function APIIntegration() {
    const { currentTheme } = useThemeStore();
    const isDark = currentTheme.name.toLowerCase().includes('dark');

    const [connections, setConnections] = useState<APIConnection[]>([]);
    const [syncOperations, setSyncOperations] = useState<SyncOperation[]>([]);
    const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
    const [isTestingConnection, setIsTestingConnection] = useState(false);
    const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [webhookUrl, setWebhookUrl] = useState('');

    const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        initializeConnections();
        initializeWebhooks();
        startSyncScheduler();
        return () => {
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
            }
        };
    }, []);

    const initializeConnections = () => {
        const mockConnections: APIConnection[] = [
            {
                id: '1',
                name: 'OpenAI API',
                description: 'Advanced AI language model integration',
                category: 'ai',
                status: 'disconnected',
                syncFrequency: 'realtime',
                endpoint: 'https://api.openai.com/v1',
                enabled: false,
            },
            {
                id: '2',
                name: 'Google Drive',
                description: 'Cloud storage and file synchronization',
                category: 'cloud',
                status: 'connected',
                lastSync: new Date(),
                syncFrequency: 'hourly',
                endpoint: 'https://www.googleapis.com/drive/v3',
                enabled: true,
            },
            {
                id: '3',
                name: 'Slack Integration',
                description: 'Team communication and notifications',
                category: 'communication',
                status: 'connected',
                lastSync: new Date(Date.now() - 300000), // 5 minutes ago
                syncFrequency: 'realtime',
                endpoint: 'https://slack.com/api',
                enabled: true,
            },
            {
                id: '4',
                name: 'GitHub API',
                description: 'Code repository and project management',
                category: 'productivity',
                status: 'error',
                syncFrequency: 'daily',
                endpoint: 'https://api.github.com',
                enabled: true,
            },
            {
                id: '5',
                name: 'Twitter API',
                description: 'Social media integration and monitoring',
                category: 'social',
                status: 'disconnected',
                syncFrequency: 'hourly',
                endpoint: 'https://api.twitter.com/2',
                enabled: false,
            },
            {
                id: '6',
                name: 'Weather API',
                description: 'Real-time weather data and forecasts',
                category: 'productivity',
                status: 'connected',
                lastSync: new Date(),
                syncFrequency: 'hourly',
                endpoint: 'https://api.openweathermap.org/data/2.5',
                enabled: true,
            },
        ];
        setConnections(mockConnections);
    };

    const initializeWebhooks = () => {
        const mockWebhooks: WebhookEndpoint[] = [
            {
                id: '1',
                url: 'https://sallie.ai/webhooks/slack-events',
                events: ['message', 'user_joined', 'channel_created'],
                enabled: true,
                lastTriggered: new Date(Date.now() - 180000), // 3 minutes ago
            },
            {
                id: '2',
                url: 'https://sallie.ai/webhooks/github-events',
                events: ['push', 'pull_request', 'issue'],
                enabled: true,
                lastTriggered: new Date(Date.now() - 3600000), // 1 hour ago
            },
            {
                id: '3',
                url: 'https://sallie.ai/webhooks/user-activity',
                events: ['login', 'logout', 'profile_update'],
                enabled: false,
            },
        ];
        setWebhooks(mockWebhooks);
    };

    const startSyncScheduler = () => {
        // Simulate periodic sync operations
        syncIntervalRef.current = setInterval(() => {
            const enabledConnections = connections.filter(conn => conn.enabled);
            enabledConnections.forEach(connection => {
                if (shouldSync(connection)) {
                    performSync(connection.id);
                }
            });
        }, 30000); // Check every 30 seconds
    };

    const shouldSync = (connection: APIConnection): boolean => {
        if (!connection.lastSync) return true;

        const now = new Date();
        const timeSinceLastSync = now.getTime() - connection.lastSync.getTime();

        switch (connection.syncFrequency) {
            case 'realtime':
                return timeSinceLastSync > 60000; // 1 minute
            case 'hourly':
                return timeSinceLastSync > 3600000; // 1 hour
            case 'daily':
                return timeSinceLastSync > 86400000; // 24 hours
            case 'manual':
                return false;
            default:
                return false;
        }
    };

    const performSync = async (connectionId: string) => {
        const operation: SyncOperation = {
            id: Date.now().toString(),
            connectionId,
            operation: 'sync',
            status: 'running',
            startTime: new Date(),
            dataTransferred: 0,
        };

        setSyncOperations(prev => [operation, ...prev]);

        try {
            // Simulate sync operation
            await new Promise(resolve => setTimeout(resolve, 2000));

            const dataSize = Math.floor(Math.random() * 1000) + 100;
            const success = Math.random() > 0.1; // 90% success rate

            if (success) {
                // Update connection last sync time
                setConnections(prev =>
                    prev.map(conn =>
                        conn.id === connectionId
                            ? { ...conn, lastSync: new Date(), status: 'connected' }
                            : conn
                    )
                );

                // Update operation as completed
                setSyncOperations(prev =>
                    prev.map(op =>
                        op.id === operation.id
                            ? {
                                ...op,
                                status: 'completed',
                                endTime: new Date(),
                                dataTransferred: dataSize,
                            }
                            : op
                    )
                );
            } else {
                throw new Error('Sync failed');
            }
        } catch (error) {
            setConnections(prev =>
                prev.map(conn =>
                    conn.id === connectionId
                        ? { ...conn, status: 'error' }
                        : conn
                )
            );

            setSyncOperations(prev =>
                prev.map(op =>
                    op.id === operation.id
                        ? {
                            ...op,
                            status: 'failed',
                            endTime: new Date(),
                            errorMessage: 'Connection timeout',
                        }
                        : op
                )
            );
        }
    };

    const testConnection = async (connectionId: string) => {
        setIsTestingConnection(true);
        setSelectedConnection(connectionId);

        try {
            // Simulate connection test
            await new Promise(resolve => setTimeout(resolve, 1500));

            const success = Math.random() > 0.2; // 80% success rate

            if (success) {
                Alert.alert('Connection Test', 'Connection successful!');
                setConnections(prev =>
                    prev.map(conn =>
                        conn.id === connectionId
                            ? { ...conn, status: 'connected' }
                            : conn
                    )
                );
            } else {
                Alert.alert('Connection Test', 'Connection failed. Please check your API key and try again.');
                setConnections(prev =>
                    prev.map(conn =>
                        conn.id === connectionId
                            ? { ...conn, status: 'error' }
                            : conn
                    )
                );
            }
        } catch (error) {
            Alert.alert('Error', 'Connection test failed');
        } finally {
            setIsTestingConnection(false);
            setSelectedConnection(null);
        }
    };

    const toggleConnection = (connectionId: string) => {
        setConnections(prev =>
            prev.map(conn =>
                conn.id === connectionId
                    ? { ...conn, enabled: !conn.enabled }
                    : conn
            )
        );
    };

    const saveApiKey = (connectionId: string) => {
        if (!apiKeyInput.trim()) {
            Alert.alert('Error', 'Please enter an API key');
            return;
        }

        setConnections(prev =>
            prev.map(conn =>
                conn.id === connectionId
                    ? { ...conn, apiKey: apiKeyInput }
                    : conn
            )
        );

        setApiKeyInput('');
        Alert.alert('Success', 'API key saved successfully');
    };

    const addWebhook = () => {
        if (!webhookUrl.trim()) {
            Alert.alert('Error', 'Please enter a webhook URL');
            return;
        }

        const newWebhook: WebhookEndpoint = {
            id: Date.now().toString(),
            url: webhookUrl,
            events: ['message', 'update'],
            enabled: true,
        };

        setWebhooks(prev => [...prev, newWebhook]);
        setWebhookUrl('');
        Alert.alert('Success', 'Webhook added successfully');
    };

    const toggleWebhook = (webhookId: string) => {
        setWebhooks(prev =>
            prev.map(webhook =>
                webhook.id === webhookId
                    ? { ...webhook, enabled: !webhook.enabled }
                    : webhook
            )
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'connected': return '#10B981';
            case 'connecting': return '#F59E0B';
            case 'disconnected': return '#6B7280';
            case 'error': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'ai': return '#8B5CF6';
            case 'cloud': return '#3B82F6';
            case 'communication': return '#10B981';
            case 'social': return '#F59E0B';
            case 'productivity': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const renderConnections = () => (
        <View style={styles.connectionsContainer}>
            <Text style={styles.sectionTitle}>API Connections</Text>
            {connections.map(connection => (
                <EnhancedCard key={connection.id} variant="glass" style={styles.connectionCard}>
                    <View style={styles.connectionHeader}>
                        <View style={styles.connectionInfo}>
                            <Text style={styles.connectionName}>{connection.name}</Text>
                            <Text style={styles.connectionDescription}>{connection.description}</Text>
                            <View style={styles.connectionMeta}>
                                <View style={[
                                    styles.categoryBadge,
                                    { backgroundColor: getCategoryColor(connection.category) }
                                ]}>
                                    <Text style={styles.categoryText}>{connection.category}</Text>
                                </View>
                                <Text style={styles.syncFrequency}>{connection.syncFrequency}</Text>
                            </View>
                        </View>
                        <View style={styles.connectionControls}>
                            <View style={[
                                styles.statusIndicator,
                                { backgroundColor: getStatusColor(connection.status) }
                            ]} />
                            <Switch
                                value={connection.enabled}
                                onValueChange={() => toggleConnection(connection.id)}
                                trackColor={{ false: '#767577', true: '#FFD700' }}
                                thumbColor={connection.enabled ? '#fff' : '#f4f3f4'}
                            />
                        </View>
                    </View>

                    {connection.lastSync && (
                        <Text style={styles.lastSync}>
                            Last sync: {connection.lastSync.toLocaleString()}
                        </Text>
                    )}

                    <View style={styles.connectionActions}>
                        <EnhancedButton
                            title="Test Connection"
                            variant="outline"
                            onPress={() => testConnection(connection.id)}
                            disabled={isTestingConnection && selectedConnection === connection.id}
                            style={styles.actionButton}
                        />
                        <EnhancedButton
                            title="Configure"
                            variant="outline"
                            onPress={() => {
                                setSelectedConnection(connection.id);
                                setApiKeyInput(connection.apiKey || '');
                            }}
                            style={styles.actionButton}
                        />
                        <EnhancedButton
                            title="Sync Now"
                            variant="primary"
                            onPress={() => performSync(connection.id)}
                            disabled={!connection.enabled}
                            style={styles.actionButton}
                        />
                    </View>

                    {selectedConnection === connection.id && (
                        <View style={styles.apiKeyContainer}>
                            <TextInput
                                style={styles.apiKeyInput}
                                placeholder="Enter API Key"
                                placeholderTextColor="#888"
                                value={apiKeyInput}
                                onChangeText={setApiKeyInput}
                                secureTextEntry
                            />
                            <EnhancedButton
                                title="Save Key"
                                variant="primary"
                                onPress={() => saveApiKey(connection.id)}
                                style={styles.saveKeyButton}
                            />
                        </View>
                    )}
                </EnhancedCard>
            ))}
        </View>
    );

    const renderSyncOperations = () => (
        <View style={styles.operationsContainer}>
            <Text style={styles.sectionTitle}>Recent Sync Operations</Text>
            <ScrollView style={styles.operationsList}>
                {syncOperations.slice(0, 10).map(operation => {
                    const connection = connections.find(c => c.id === operation.connectionId);
                    return (
                        <EnhancedCard key={operation.id} variant="glass" style={styles.operationCard}>
                            <View style={styles.operationHeader}>
                                <Text style={styles.operationConnection}>
                                    {connection?.name || 'Unknown'}
                                </Text>
                                <Text style={styles.operationType}>{operation.operation}</Text>
                                <View style={[
                                    styles.operationStatus,
                                    { backgroundColor: getStatusColor(operation.status) }
                                ]}>
                                    <Text style={styles.operationStatusText}>{operation.status}</Text>
                                </View>
                            </View>
                            <View style={styles.operationDetails}>
                                <Text style={styles.operationTime}>
                                    {operation.startTime.toLocaleTimeString()}
                                </Text>
                                <Text style={styles.operationData}>
                                    {operation.dataTransferred} KB transferred
                                </Text>
                            </View>
                            {operation.errorMessage && (
                                <Text style={styles.operationError}>{operation.errorMessage}</Text>
                            )}
                        </EnhancedCard>
                    );
                })}
            </ScrollView>
        </View>
    );

    const renderWebhooks = () => (
        <View style={styles.webhooksContainer}>
            <Text style={styles.sectionTitle}>Webhook Endpoints</Text>

            <View style={styles.addWebhookContainer}>
                <TextInput
                    style={styles.webhookInput}
                    placeholder="Enter webhook URL"
                    placeholderTextColor="#888"
                    value={webhookUrl}
                    onChangeText={setWebhookUrl}
                />
                <EnhancedButton
                    title="Add Webhook"
                    variant="primary"
                    onPress={addWebhook}
                    style={styles.addWebhookButton}
                />
            </View>

            {webhooks.map(webhook => (
                <EnhancedCard key={webhook.id} variant="glass" style={styles.webhookCard}>
                    <View style={styles.webhookHeader}>
                        <Text style={styles.webhookUrl}>{webhook.url}</Text>
                        <Switch
                            value={webhook.enabled}
                            onValueChange={() => toggleWebhook(webhook.id)}
                            trackColor={{ false: '#767577', true: '#FFD700' }}
                            thumbColor={webhook.enabled ? '#fff' : '#f4f3f4'}
                        />
                    </View>
                    <View style={styles.webhookEvents}>
                        <Text style={styles.eventsLabel}>Events:</Text>
                        <Text style={styles.eventsText}>{webhook.events.join(', ')}</Text>
                    </View>
                    {webhook.lastTriggered && (
                        <Text style={styles.webhookLastTriggered}>
                            Last triggered: {webhook.lastTriggered.toLocaleString()}
                        </Text>
                    )}
                </EnhancedCard>
            ))}
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>API Integration</Text>

            {/* Connections */}
            {renderConnections()}

            {/* Sync Operations */}
            {renderSyncOperations()}

            {/* Webhooks */}
            {renderWebhooks()}

            {/* System Status */}
            <EnhancedCard variant="glass" style={styles.statusCard}>
                <Text style={styles.statusTitle}>Integration Status</Text>
                <View style={styles.statusGrid}>
                    <View style={styles.statusItem}>
                        <Text style={styles.statusLabel}>Active Connections</Text>
                        <Text style={styles.statusValue}>
                            {connections.filter(c => c.enabled && c.status === 'connected').length}
                        </Text>
                    </View>
                    <View style={styles.statusItem}>
                        <Text style={styles.statusLabel}>Pending Syncs</Text>
                        <Text style={styles.statusValue}>
                            {syncOperations.filter(op => op.status === 'pending' || op.status === 'running').length}
                        </Text>
                    </View>
                    <View style={styles.statusItem}>
                        <Text style={styles.statusLabel}>Active Webhooks</Text>
                        <Text style={styles.statusValue}>
                            {webhooks.filter(w => w.enabled).length}
                        </Text>
                    </View>
                    <View style={styles.statusItem}>
                        <Text style={styles.statusLabel}>Failed Operations</Text>
                        <Text style={styles.statusValue}>
                            {syncOperations.filter(op => op.status === 'failed').length}
                        </Text>
                    </View>
                </View>
            </EnhancedCard>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f5f5f5',
        marginBottom: 16,
        fontFamily: 'SpaceMono',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f5f5f5',
        marginBottom: 16,
        fontFamily: 'SpaceMono',
    },
    connectionsContainer: {
        marginBottom: 24,
    },
    connectionCard: {
        padding: 16,
        marginBottom: 8,
    },
    connectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    connectionInfo: {
        flex: 1,
    },
    connectionName: {
        fontSize: 16,
        color: '#f5f5f5',
        fontWeight: 'bold',
        marginBottom: 4,
        fontFamily: 'SpaceMono',
    },
    connectionDescription: {
        fontSize: 14,
        color: '#ccc',
        marginBottom: 8,
        fontFamily: 'SpaceMono',
    },
    connectionMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    categoryBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontFamily: 'SpaceMono',
    },
    syncFrequency: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    connectionControls: {
        alignItems: 'center',
        gap: 8,
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    lastSync: {
        fontSize: 12,
        color: '#888',
        marginBottom: 12,
        fontFamily: 'SpaceMono',
    },
    connectionActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        flex: 1,
    },
    apiKeyContainer: {
        marginTop: 12,
        gap: 8,
    },
    apiKeyInput: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: 12,
        color: '#f5f5f5',
        fontSize: 16,
        fontFamily: 'SpaceMono',
    },
    saveKeyButton: {
        marginTop: 8,
    },
    operationsContainer: {
        marginBottom: 24,
    },
    operationsList: {
        maxHeight: 300,
    },
    operationCard: {
        padding: 12,
        marginBottom: 8,
    },
    operationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    operationConnection: {
        fontSize: 14,
        color: '#f5f5f5',
        fontWeight: 'bold',
        flex: 1,
        fontFamily: 'SpaceMono',
    },
    operationType: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    operationStatus: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    operationStatusText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontFamily: 'SpaceMono',
    },
    operationDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    operationTime: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    operationData: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    operationError: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
        fontFamily: 'SpaceMono',
    },
    webhooksContainer: {
        marginBottom: 24,
    },
    addWebhookContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    webhookInput: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: 12,
        color: '#f5f5f5',
        fontSize: 16,
        fontFamily: 'SpaceMono',
    },
    addWebhookButton: {
        minWidth: 120,
    },
    webhookCard: {
        padding: 16,
        marginBottom: 8,
    },
    webhookHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    webhookUrl: {
        fontSize: 14,
        color: '#f5f5f5',
        flex: 1,
        fontFamily: 'SpaceMono',
    },
    webhookEvents: {
        marginBottom: 8,
    },
    eventsLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
        fontFamily: 'SpaceMono',
    },
    eventsText: {
        fontSize: 14,
        color: '#ccc',
        fontFamily: 'SpaceMono',
    },
    webhookLastTriggered: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    statusCard: {
        padding: 16,
        marginBottom: 16,
    },
    statusTitle: {
        fontSize: 18,
        color: '#f5f5f5',
        fontWeight: 'bold',
        marginBottom: 16,
        fontFamily: 'SpaceMono',
    },
    statusGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    statusItem: {
        flex: 1,
        minWidth: 80,
        alignItems: 'center',
    },
    statusLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
        fontFamily: 'SpaceMono',
    },
    statusValue: {
        fontSize: 24,
        color: '#FFD700',
        fontWeight: 'bold',
        fontFamily: 'SpaceMono',
    },
});
