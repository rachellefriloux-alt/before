import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { useNavigation } from '@react-navigation/native';
import { usePersonaStore } from '../../store/persona';
import { useMemoryStore } from '../../store/memory';
import { useDeviceStore } from '../../store/device';

interface LogEntry {
    id: string;
    timestamp: number;
    level: 'info' | 'warning' | 'error' | 'debug';
    message: string;
    data?: any;
}

export default function DebugConsoleScreen() {
    // Dynamic import for navigation to avoid CommonJS/ESM conflicts
    const [navigation, setNavigation] = useState<any>(null);

    useEffect(() => {
        const loadNavigation = async () => {
            try {
                const { useNavigation: navHook } = await import('@react-navigation/native');
                setNavigation(navHook());
            } catch (error) {
                console.warn('Failed to load navigation:', error);
            }
        };
        loadNavigation();
    }, []);

    const persona = usePersonaStore();
    const memory = useMemoryStore();
    const device = useDeviceStore();

    const [logs, setLogs] = useState<LogEntry[]>([
        {
            id: '1',
            timestamp: Date.now() - 5000,
            level: 'info',
            message: 'Sallie Sovereign Debug Console initialized',
        },
        {
            id: '2',
            timestamp: Date.now() - 3000,
            level: 'debug',
            message: 'Persona store loaded',
            data: { emotion: persona.emotion, personality: persona.personality },
        },
        {
            id: '3',
            timestamp: Date.now() - 1000,
            level: 'info',
            message: 'Memory system operational',
            data: {
                shortTerm: memory.shortTerm.length,
                episodic: memory.episodic.length,
                semantic: memory.semantic.length,
                emotional: memory.emotional.length,
            },
        },
    ]);

    const [command, setCommand] = useState('');
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        scrollToBottom();
    }, [logs]);

    const scrollToBottom = () => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const addLog = (level: LogEntry['level'], message: string, data?: any) => {
        const newLog: LogEntry = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            level,
            message,
            data,
        };
        setLogs(prev => [...prev, newLog]);
    };

    const executeCommand = (cmd: string) => {
        const trimmedCmd = cmd.trim();
        if (!trimmedCmd) return;

        // Add command to history
        setCommandHistory(prev => [...prev, trimmedCmd]);
        setHistoryIndex(-1);

        // Log the command
        addLog('debug', `> ${trimmedCmd}`);

        // Parse and execute command
        const [action, ...args] = trimmedCmd.split(' ');

        try {
            switch (action.toLowerCase()) {
                case 'help':
                    showHelp();
                    break;

                case 'clear':
                    clearLogs();
                    break;

                case 'status':
                    showStatus();
                    break;

                case 'emotion':
                    handleEmotionCommand(args);
                    break;

                case 'memory':
                    handleMemoryCommand(args);
                    break;

                case 'device':
                    handleDeviceCommand(args);
                    break;

                case 'export':
                    exportData(args[0]);
                    break;

                case 'simulate':
                    simulateCommand(args);
                    break;

                case 'test':
                    runTests();
                    break;

                default:
                    addLog('error', `Unknown command: ${action}. Type 'help' for available commands.`);
            }
        } catch (error) {
            addLog('error', `Command error: ${error}`);
        }

        setCommand('');
    };

    const showHelp = () => {
        const helpText = `
Available Commands:
• help - Show this help message
• clear - Clear console logs
• status - Show system status
• emotion [set] [emotion] - View or set emotional state
• memory [type] - View memory statistics
• device [info] - View device information
• export [type] - Export data (logs, memory, persona)
• simulate [action] - Simulate system events
• test - Run system diagnostics
    `;
        addLog('info', helpText.trim());
    };

    const clearLogs = () => {
        setLogs([]);
        addLog('info', 'Console cleared');
    };

    const showStatus = () => {
        const status = {
            persona: {
                emotion: persona.emotion,
                intensity: persona.intensity,
                personality: persona.personality,
                emotionHistory: persona.emotionHistory.length,
            },
            memory: {
                shortTerm: memory.shortTerm.length,
                episodic: memory.episodic.length,
                semantic: memory.semantic.length,
                emotional: memory.emotional.length,
            },
            device: {
                isLauncher: device.isLauncher,
                platform: device.platform,
                permissions: Object.values(device.permissions).filter(Boolean).length,
            },
        };

        addLog('info', 'System Status:', status);
    };

    const handleEmotionCommand = (args: string[]) => {
        if (args.length === 0) {
            addLog('info', `Current emotion: ${persona.emotion} (intensity: ${persona.intensity})`);
            return;
        }

        if (args[0] === 'set' && args[1]) {
            persona.setEmotion(args[1], parseFloat(args[2]) || 0.5, 'debug_console');
            addLog('info', `Emotion set to: ${args[1]}`);
        } else {
            addLog('error', 'Usage: emotion [set] [emotion] [intensity]');
        }
    };

    const handleMemoryCommand = (args: string[]) => {
        if (args.length === 0) {
            const stats = {
                shortTerm: memory.shortTerm.length,
                episodic: memory.episodic.length,
                semantic: memory.semantic.length,
                emotional: memory.emotional.length,
            };
            addLog('info', 'Memory Statistics:', stats);
            return;
        }

        const type = args[0];
        const memories = memory.getMemoriesByType(type as any);
        addLog('info', `${type} memories (${memories.length}):`, memories.slice(0, 5));
    };

    const handleDeviceCommand = (args: string[]) => {
        if (args[0] === 'info') {
            const info = {
                isLauncher: device.isLauncher,
                platform: device.platform,
                version: device.version,
                permissions: device.permissions,
                settings: device.settings,
            };
            addLog('info', 'Device Information:', info);
        } else {
            addLog('info', `Device: ${device.platform} | Launcher: ${device.isLauncher}`);
        }
    };

    const exportData = (type: string) => {
        const data = {
            logs: type === 'logs' ? logs : undefined,
            memory: type === 'memory' ? { memory: memory } : undefined,
            persona: type === 'persona' ? { persona: persona } : undefined,
            all: type === 'all' ? { logs, memory, persona, device } : undefined,
        };

        addLog('info', `Export ${type} data:`, data[type as keyof typeof data]);
    };

    const simulateCommand = (args: string[]) => {
        const action = args[0];

        switch (action) {
            case 'interaction':
                memory.addShortTerm({
                    type: 'episodic',
                    content: 'Simulated user interaction from debug console',
                    tags: ['simulation', 'debug'],
                    importance: 0.5,
                    emotion: 'neutral',
                    confidence: 1.0,
                    source: 'debug_console',
                    sha256: `sim_${Date.now()}`,
                });
                addLog('info', 'Simulated user interaction');
                break;

            case 'emotion':
                const emotions = ['happy', 'sad', 'excited', 'calm', 'thoughtful'];
                const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
                persona.setEmotion(randomEmotion, Math.random(), 'simulation');
                addLog('info', `Simulated emotion change: ${randomEmotion}`);
                break;

            default:
                addLog('error', `Unknown simulation: ${action}`);
        }
    };

    const runTests = () => {
        addLog('info', 'Running system diagnostics...');

        // Test persona system
        const originalEmotion = persona.emotion;
        persona.setEmotion('test', 1.0, 'diagnostic');
        const testResult1 = persona.emotion === 'test';
        persona.setEmotion(originalEmotion, persona.intensity, 'diagnostic_restore');

        // Test memory system
        const initialCount = memory.shortTerm.length;
        memory.addShortTerm({
            type: 'semantic',
            content: 'Test memory entry',
            tags: ['test'],
            importance: 0.1,
            emotion: 'neutral',
            confidence: 1.0,
            source: 'diagnostic',
            sha256: 'test_entry',
        });
        const testResult2 = memory.shortTerm.length === initialCount + 1;

        // Test device system
        const testResult3 = typeof device.isLauncher === 'boolean';

        const results = {
            persona: testResult1 ? 'PASS' : 'FAIL',
            memory: testResult2 ? 'PASS' : 'FAIL',
            device: testResult3 ? 'PASS' : 'FAIL',
        };

        addLog('info', 'Diagnostic Results:', results);

        const allPassed = Object.values(results).every(result => result === 'PASS');
        addLog(allPassed ? 'info' : 'warning', `Overall Status: ${allPassed ? 'HEALTHY' : 'ISSUES DETECTED'}`);
    };

    const getLogColor = (level: LogEntry['level']) => {
        switch (level) {
            case 'error': return '#FF6B6B';
            case 'warning': return '#FFD93D';
            case 'info': return '#4ECDC4';
            case 'debug': return '#a0a0a0';
            default: return '#ffffff';
        }
    };

    const formatLogData = (data: any) => {
        if (!data) return '';
        return JSON.stringify(data, null, 2);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Debug Console</Text>
                <TouchableOpacity onPress={() => clearLogs()} style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
            </View>

            {/* Console Output */}
            <ScrollView
                ref={scrollViewRef}
                style={styles.console}
                contentContainerStyle={styles.consoleContent}
                showsVerticalScrollIndicator={false}
            >
                {logs.map((log) => (
                    <View key={log.id} style={styles.logEntry}>
                        <Text style={styles.logTimestamp}>
                            {new Date(log.timestamp).toLocaleTimeString()}
                        </Text>
                        <Text style={[styles.logLevel, { color: getLogColor(log.level) }]}>
                            [{log.level.toUpperCase()}]
                        </Text>
                        <Text style={styles.logMessage}>{log.message}</Text>
                        {log.data && (
                            <Text style={styles.logData}>{formatLogData(log.data)}</Text>
                        )}
                    </View>
                ))}
            </ScrollView>

            {/* Command Input */}
            <View style={styles.inputContainer}>
                <Text style={styles.prompt}>$</Text>
                <TextInput
                    style={styles.commandInput}
                    value={command}
                    onChangeText={setCommand}
                    onSubmitEditing={() => executeCommand(command)}
                    placeholder="Enter command... (type 'help' for commands)"
                    placeholderTextColor="#a0a0a0"
                    autoCorrect={false}
                    autoCapitalize="none"
                />
                <TouchableOpacity
                    style={styles.executeButton}
                    onPress={() => executeCommand(command)}
                >
                    <Text style={styles.executeButtonText}>Run</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#333333',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButtonText: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    title: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    clearButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: '#333333',
        borderRadius: 15,
    },
    clearButtonText: {
        color: '#FF6B6B',
        fontSize: 14,
        fontWeight: 'bold',
    },
    console: {
        flex: 1,
        backgroundColor: '#000000',
    },
    consoleContent: {
        padding: 15,
    },
    logEntry: {
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#333333',
    },
    logTimestamp: {
        color: '#666666',
        fontSize: 10,
        fontFamily: 'monospace',
    },
    logLevel: {
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'monospace',
        marginVertical: 2,
    },
    logMessage: {
        color: '#ffffff',
        fontSize: 14,
        fontFamily: 'monospace',
        lineHeight: 18,
    },
    logData: {
        color: '#a0a0a0',
        fontSize: 12,
        fontFamily: 'monospace',
        marginTop: 5,
        marginLeft: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#1a1a1a',
        borderTopWidth: 1,
        borderTopColor: '#333333',
    },
    prompt: {
        color: '#4ECDC4',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'monospace',
        marginRight: 10,
    },
    commandInput: {
        flex: 1,
        color: '#ffffff',
        fontSize: 14,
        fontFamily: 'monospace',
        paddingVertical: 8,
    },
    executeButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: '#4ECDC4',
        borderRadius: 15,
        marginLeft: 10,
    },
    executeButtonText: {
        color: '#000000',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
