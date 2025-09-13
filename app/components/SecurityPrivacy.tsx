import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Switch,
    Alert,
    TextInput,
    Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../store/theme';
import { EnhancedButton } from './EnhancedButton';
import { EnhancedCard } from './EnhancedCard';

interface SecuritySetting {
    id: string;
    name: string;
    description: string;
    category: 'authentication' | 'encryption' | 'privacy' | 'compliance';
    enabled: boolean;
    level: 'basic' | 'standard' | 'advanced';
    lastUpdated?: Date;
}

interface PrivacyControl {
    id: string;
    name: string;
    description: string;
    dataType: 'personal' | 'usage' | 'location' | 'media' | 'communication';
    sharingEnabled: boolean;
    retentionPeriod: number; // days
    consentRequired: boolean;
}

interface SecurityAudit {
    id: string;
    timestamp: Date;
    event: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    details: string;
    resolved: boolean;
}

interface EncryptionKey {
    id: string;
    name: string;
    algorithm: string;
    keySize: number;
    created: Date;
    expires?: Date;
    status: 'active' | 'expired' | 'revoked';
}

export function SecurityPrivacy() {
    const { currentTheme } = useThemeStore();
    const isDark = currentTheme.name.toLowerCase().includes('dark');

    const [securitySettings, setSecuritySettings] = useState<SecuritySetting[]>([]);
    const [privacyControls, setPrivacyControls] = useState<PrivacyControl[]>([]);
    const [securityAudits, setSecurityAudits] = useState<SecurityAudit[]>([]);
    const [encryptionKeys, setEncryptionKeys] = useState<EncryptionKey[]>([]);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showBiometricModal, setShowBiometricModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [biometricEnabled, setBiometricEnabled] = useState(false);

    useEffect(() => {
        initializeSecuritySettings();
        initializePrivacyControls();
        initializeSecurityAudits();
        initializeEncryptionKeys();
    }, []);

    const initializeSecuritySettings = () => {
        const mockSettings: SecuritySetting[] = [
            {
                id: '1',
                name: 'Two-Factor Authentication',
                description: 'Add an extra layer of security with 2FA',
                category: 'authentication',
                enabled: true,
                level: 'standard',
                lastUpdated: new Date(),
            },
            {
                id: '2',
                name: 'Biometric Authentication',
                description: 'Use fingerprint or face recognition',
                category: 'authentication',
                enabled: false,
                level: 'advanced',
                lastUpdated: new Date(Date.now() - 86400000),
            },
            {
                id: '3',
                name: 'End-to-End Encryption',
                description: 'Encrypt all data in transit and at rest',
                category: 'encryption',
                enabled: true,
                level: 'advanced',
                lastUpdated: new Date(),
            },
            {
                id: '4',
                name: 'Automatic Logout',
                description: 'Automatically log out after period of inactivity',
                category: 'authentication',
                enabled: true,
                level: 'standard',
                lastUpdated: new Date(),
            },
            {
                id: '5',
                name: 'Data Anonymization',
                description: 'Automatically anonymize sensitive data',
                category: 'privacy',
                enabled: false,
                level: 'advanced',
                lastUpdated: new Date(Date.now() - 172800000),
            },
            {
                id: '6',
                name: 'GDPR Compliance',
                description: 'Ensure compliance with GDPR regulations',
                category: 'compliance',
                enabled: true,
                level: 'standard',
                lastUpdated: new Date(),
            },
            {
                id: '7',
                name: 'CCPA Compliance',
                description: 'Ensure compliance with CCPA regulations',
                category: 'compliance',
                enabled: true,
                level: 'standard',
                lastUpdated: new Date(),
            },
            {
                id: '8',
                name: 'Security Monitoring',
                description: 'Continuous monitoring for security threats',
                category: 'authentication',
                enabled: true,
                level: 'advanced',
                lastUpdated: new Date(),
            },
        ];
        setSecuritySettings(mockSettings);
    };

    const initializePrivacyControls = () => {
        const mockControls: PrivacyControl[] = [
            {
                id: '1',
                name: 'Personal Information',
                description: 'Name, email, phone number, and other personal details',
                dataType: 'personal',
                sharingEnabled: false,
                retentionPeriod: 2555, // 7 years
                consentRequired: true,
            },
            {
                id: '2',
                name: 'Usage Analytics',
                description: 'App usage patterns and behavior data',
                dataType: 'usage',
                sharingEnabled: true,
                retentionPeriod: 365, // 1 year
                consentRequired: false,
            },
            {
                id: '3',
                name: 'Location Data',
                description: 'GPS location and location-based services',
                dataType: 'location',
                sharingEnabled: false,
                retentionPeriod: 90, // 90 days
                consentRequired: true,
            },
            {
                id: '4',
                name: 'Media Content',
                description: 'Photos, videos, and other media files',
                dataType: 'media',
                sharingEnabled: false,
                retentionPeriod: 365, // 1 year
                consentRequired: true,
            },
            {
                id: '5',
                name: 'Communication Data',
                description: 'Messages, calls, and communication logs',
                dataType: 'communication',
                sharingEnabled: false,
                retentionPeriod: 180, // 6 months
                consentRequired: true,
            },
        ];
        setPrivacyControls(mockControls);
    };

    const initializeSecurityAudits = () => {
        const mockAudits: SecurityAudit[] = [
            {
                id: '1',
                timestamp: new Date(Date.now() - 3600000),
                event: 'Failed login attempt',
                severity: 'medium',
                details: 'Multiple failed login attempts from IP 192.168.1.100',
                resolved: true,
            },
            {
                id: '2',
                timestamp: new Date(Date.now() - 7200000),
                event: 'Password changed',
                severity: 'low',
                details: 'User password successfully updated',
                resolved: true,
            },
            {
                id: '3',
                timestamp: new Date(Date.now() - 10800000),
                event: 'Suspicious activity detected',
                severity: 'high',
                details: 'Unusual data access pattern detected',
                resolved: false,
            },
            {
                id: '4',
                timestamp: new Date(Date.now() - 14400000),
                event: 'New device login',
                severity: 'low',
                details: 'New device logged in from Chrome browser',
                resolved: true,
            },
            {
                id: '5',
                timestamp: new Date(Date.now() - 18000000),
                event: 'Security scan completed',
                severity: 'low',
                details: 'Automated security scan found no vulnerabilities',
                resolved: true,
            },
        ];
        setSecurityAudits(mockAudits);
    };

    const initializeEncryptionKeys = () => {
        const mockKeys: EncryptionKey[] = [
            {
                id: '1',
                name: 'Primary Data Key',
                algorithm: 'AES-256-GCM',
                keySize: 256,
                created: new Date(Date.now() - 2592000000), // 30 days ago
                expires: new Date(Date.now() + 15552000000), // 180 days from now
                status: 'active',
            },
            {
                id: '2',
                name: 'Communication Key',
                algorithm: 'RSA-4096',
                keySize: 4096,
                created: new Date(Date.now() - 5184000000), // 60 days ago
                expires: new Date(Date.now() + 31104000000), // 360 days from now
                status: 'active',
            },
            {
                id: '3',
                name: 'Backup Key',
                algorithm: 'AES-256-GCM',
                keySize: 256,
                created: new Date(Date.now() - 7776000000), // 90 days ago
                status: 'expired',
            },
        ];
        setEncryptionKeys(mockKeys);
    };

    const toggleSecuritySetting = (settingId: string) => {
        setSecuritySettings(prev =>
            prev.map(setting =>
                setting.id === settingId
                    ? { ...setting, enabled: !setting.enabled, lastUpdated: new Date() }
                    : setting
            )
        );
    };

    const togglePrivacyControl = (controlId: string) => {
        setPrivacyControls(prev =>
            prev.map(control =>
                control.id === controlId
                    ? { ...control, sharingEnabled: !control.sharingEnabled }
                    : control
            )
        );
    };

    const changePassword = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all password fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters long');
            return;
        }

        // Simulate password change
        Alert.alert('Success', 'Password changed successfully');
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const toggleBiometric = () => {
        setBiometricEnabled(!biometricEnabled);
        setSecuritySettings(prev =>
            prev.map(setting =>
                setting.id === '2'
                    ? { ...setting, enabled: !biometricEnabled, lastUpdated: new Date() }
                    : setting
            )
        );
        Alert.alert('Success', `Biometric authentication ${!biometricEnabled ? 'enabled' : 'disabled'}`);
    };

    const generateNewKey = () => {
        const newKey: EncryptionKey = {
            id: Date.now().toString(),
            name: 'New Encryption Key',
            algorithm: 'AES-256-GCM',
            keySize: 256,
            created: new Date(),
            expires: new Date(Date.now() + 15552000000), // 180 days
            status: 'active',
        };

        setEncryptionKeys(prev => [newKey, ...prev]);
        Alert.alert('Success', 'New encryption key generated');
    };

    const revokeKey = (keyId: string) => {
        Alert.alert(
            'Confirm Revocation',
            'Are you sure you want to revoke this encryption key? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Revoke',
                    style: 'destructive',
                    onPress: () => {
                        setEncryptionKeys(prev =>
                            prev.map(key =>
                                key.id === keyId
                                    ? { ...key, status: 'revoked' }
                                    : key
                            )
                        );
                        Alert.alert('Success', 'Encryption key revoked');
                    },
                },
            ]
        );
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'low': return '#10B981';
            case 'medium': return '#F59E0B';
            case 'high': return '#EF4444';
            case 'critical': return '#7C2D12';
            default: return '#6B7280';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'authentication': return '#3B82F6';
            case 'encryption': return '#8B5CF6';
            case 'privacy': return '#10B981';
            case 'compliance': return '#F59E0B';
            default: return '#6B7280';
        }
    };

    const renderSecuritySettings = () => (
        <View style={styles.settingsContainer}>
            <Text style={styles.sectionTitle}>Security Settings</Text>
            {securitySettings.map(setting => (
                <EnhancedCard key={setting.id} variant="glass" style={styles.settingCard}>
                    <View style={styles.settingHeader}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingName}>{setting.name}</Text>
                            <Text style={styles.settingDescription}>{setting.description}</Text>
                            <View style={styles.settingMeta}>
                                <View style={[
                                    styles.categoryBadge,
                                    { backgroundColor: getCategoryColor(setting.category) }
                                ]}>
                                    <Text style={styles.categoryText}>{setting.category}</Text>
                                </View>
                                <Text style={styles.levelText}>{setting.level}</Text>
                            </View>
                        </View>
                        <Switch
                            value={setting.enabled}
                            onValueChange={() => toggleSecuritySetting(setting.id)}
                            trackColor={{ false: '#767577', true: '#FFD700' }}
                            thumbColor={setting.enabled ? '#fff' : '#f4f3f4'}
                        />
                    </View>
                    {setting.lastUpdated && (
                        <Text style={styles.lastUpdated}>
                            Last updated: {setting.lastUpdated.toLocaleString()}
                        </Text>
                    )}
                </EnhancedCard>
            ))}

            {/* Password Change */}
            <EnhancedCard variant="glass" style={styles.actionCard}>
                <Text style={styles.actionTitle}>Change Password</Text>
                <Text style={styles.actionDescription}>
                    Update your password to maintain account security
                </Text>
                <EnhancedButton
                    title="Change Password"
                    variant="primary"
                    onPress={() => setShowPasswordModal(true)}
                    style={styles.actionButton}
                />
            </EnhancedCard>

            {/* Biometric Setup */}
            <EnhancedCard variant="glass" style={styles.actionCard}>
                <Text style={styles.actionTitle}>Biometric Authentication</Text>
                <Text style={styles.actionDescription}>
                    Enable fingerprint or face recognition for quick access
                </Text>
                <EnhancedButton
                    title={`${biometricEnabled ? 'Disable' : 'Enable'} Biometric`}
                    variant="outline"
                    onPress={() => setShowBiometricModal(true)}
                    style={styles.actionButton}
                />
            </EnhancedCard>
        </View>
    );

    const renderPrivacyControls = () => (
        <View style={styles.privacyContainer}>
            <Text style={styles.sectionTitle}>Privacy Controls</Text>
            {privacyControls.map(control => (
                <EnhancedCard key={control.id} variant="glass" style={styles.privacyCard}>
                    <View style={styles.privacyHeader}>
                        <View style={styles.privacyInfo}>
                            <Text style={styles.privacyName}>{control.name}</Text>
                            <Text style={styles.privacyDescription}>{control.description}</Text>
                            <View style={styles.privacyMeta}>
                                <Text style={styles.dataTypeText}>{control.dataType}</Text>
                                <Text style={styles.retentionText}>
                                    {control.retentionPeriod} days retention
                                </Text>
                            </View>
                        </View>
                        <View style={styles.privacyControls}>
                            <Text style={styles.consentText}>
                                {control.consentRequired ? 'Consent Required' : 'No Consent Needed'}
                            </Text>
                            <Switch
                                value={control.sharingEnabled}
                                onValueChange={() => togglePrivacyControl(control.id)}
                                trackColor={{ false: '#767577', true: '#FFD700' }}
                                thumbColor={control.sharingEnabled ? '#fff' : '#f4f3f4'}
                            />
                        </View>
                    </View>
                </EnhancedCard>
            ))}
        </View>
    );

    const renderSecurityAudits = () => (
        <View style={styles.auditsContainer}>
            <Text style={styles.sectionTitle}>Security Audit Log</Text>
            <ScrollView style={styles.auditsList}>
                {securityAudits.map(audit => (
                    <EnhancedCard key={audit.id} variant="glass" style={styles.auditCard}>
                        <View style={styles.auditHeader}>
                            <Text style={styles.auditEvent}>{audit.event}</Text>
                            <View style={[
                                styles.severityBadge,
                                { backgroundColor: getSeverityColor(audit.severity) }
                            ]}>
                                <Text style={styles.severityText}>{audit.severity}</Text>
                            </View>
                        </View>
                        <Text style={styles.auditDetails}>{audit.details}</Text>
                        <View style={styles.auditFooter}>
                            <Text style={styles.auditTimestamp}>
                                {audit.timestamp.toLocaleString()}
                            </Text>
                            <Text style={[
                                styles.auditStatus,
                                { color: audit.resolved ? '#10B981' : '#EF4444' }
                            ]}>
                                {audit.resolved ? 'Resolved' : 'Open'}
                            </Text>
                        </View>
                    </EnhancedCard>
                ))}
            </ScrollView>
        </View>
    );

    const renderEncryptionKeys = () => (
        <View style={styles.keysContainer}>
            <Text style={styles.sectionTitle}>Encryption Keys</Text>

            <EnhancedButton
                title="Generate New Key"
                variant="primary"
                onPress={generateNewKey}
                style={styles.generateKeyButton}
            />

            {encryptionKeys.map(key => (
                <EnhancedCard key={key.id} variant="glass" style={styles.keyCard}>
                    <View style={styles.keyHeader}>
                        <View style={styles.keyInfo}>
                            <Text style={styles.keyName}>{key.name}</Text>
                            <Text style={styles.keyAlgorithm}>
                                {key.algorithm} ({key.keySize} bits)
                            </Text>
                            <Text style={styles.keyCreated}>
                                Created: {key.created.toLocaleDateString()}
                            </Text>
                        </View>
                        <View style={styles.keyStatus}>
                            <View style={[
                                styles.statusBadge,
                                {
                                    backgroundColor: key.status === 'active' ? '#10B981' :
                                        key.status === 'expired' ? '#EF4444' : '#6B7280'
                                }
                            ]}>
                                <Text style={styles.statusText}>{key.status}</Text>
                            </View>
                            {key.expires && (
                                <Text style={styles.keyExpires}>
                                    Expires: {key.expires.toLocaleDateString()}
                                </Text>
                            )}
                        </View>
                    </View>
                    {key.status === 'active' && (
                        <EnhancedButton
                            title="Revoke Key"
                            variant="outline"
                            onPress={() => revokeKey(key.id)}
                            style={styles.revokeButton}
                        />
                    )}
                </EnhancedCard>
            ))}
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Security & Privacy</Text>

            {/* Security Settings */}
            {renderSecuritySettings()}

            {/* Privacy Controls */}
            {renderPrivacyControls()}

            {/* Security Audits */}
            {renderSecurityAudits()}

            {/* Encryption Keys */}
            {renderEncryptionKeys()}

            {/* Password Change Modal */}
            <Modal
                visible={showPasswordModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowPasswordModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Change Password</Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Current Password"
                            placeholderTextColor="#888"
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            secureTextEntry
                        />

                        <TextInput
                            style={styles.modalInput}
                            placeholder="New Password"
                            placeholderTextColor="#888"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                        />

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Confirm New Password"
                            placeholderTextColor="#888"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                        />

                        <View style={styles.modalButtons}>
                            <EnhancedButton
                                title="Cancel"
                                variant="outline"
                                onPress={() => setShowPasswordModal(false)}
                                style={styles.modalButton}
                            />
                            <EnhancedButton
                                title="Change Password"
                                variant="primary"
                                onPress={changePassword}
                                style={styles.modalButton}
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Biometric Modal */}
            <Modal
                visible={showBiometricModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowBiometricModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Biometric Authentication</Text>
                        <Text style={styles.modalDescription}>
                            Enable biometric authentication for enhanced security and convenience.
                        </Text>

                        <View style={styles.modalButtons}>
                            <EnhancedButton
                                title="Cancel"
                                variant="outline"
                                onPress={() => setShowBiometricModal(false)}
                                style={styles.modalButton}
                            />
                            <EnhancedButton
                                title={biometricEnabled ? 'Disable' : 'Enable'}
                                variant="primary"
                                onPress={toggleBiometric}
                                style={styles.modalButton}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
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
    settingsContainer: {
        marginBottom: 24,
    },
    settingCard: {
        padding: 16,
        marginBottom: 8,
    },
    settingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    settingInfo: {
        flex: 1,
    },
    settingName: {
        fontSize: 16,
        color: '#f5f5f5',
        fontWeight: 'bold',
        marginBottom: 4,
        fontFamily: 'SpaceMono',
    },
    settingDescription: {
        fontSize: 14,
        color: '#ccc',
        marginBottom: 8,
        fontFamily: 'SpaceMono',
    },
    settingMeta: {
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
    levelText: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    lastUpdated: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    actionCard: {
        padding: 16,
        marginBottom: 8,
    },
    actionTitle: {
        fontSize: 16,
        color: '#f5f5f5',
        fontWeight: 'bold',
        marginBottom: 4,
        fontFamily: 'SpaceMono',
    },
    actionDescription: {
        fontSize: 14,
        color: '#ccc',
        marginBottom: 12,
        fontFamily: 'SpaceMono',
    },
    actionButton: {
        alignSelf: 'flex-start',
    },
    privacyContainer: {
        marginBottom: 24,
    },
    privacyCard: {
        padding: 16,
        marginBottom: 8,
    },
    privacyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    privacyInfo: {
        flex: 1,
    },
    privacyName: {
        fontSize: 16,
        color: '#f5f5f5',
        fontWeight: 'bold',
        marginBottom: 4,
        fontFamily: 'SpaceMono',
    },
    privacyDescription: {
        fontSize: 14,
        color: '#ccc',
        marginBottom: 8,
        fontFamily: 'SpaceMono',
    },
    privacyMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    dataTypeText: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    retentionText: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    privacyControls: {
        alignItems: 'flex-end',
    },
    consentText: {
        fontSize: 12,
        color: '#FFD700',
        marginBottom: 8,
        fontFamily: 'SpaceMono',
    },
    auditsContainer: {
        marginBottom: 24,
    },
    auditsList: {
        maxHeight: 300,
    },
    auditCard: {
        padding: 12,
        marginBottom: 8,
    },
    auditHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    auditEvent: {
        fontSize: 14,
        color: '#f5f5f5',
        fontWeight: 'bold',
        flex: 1,
        fontFamily: 'SpaceMono',
    },
    severityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    severityText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontFamily: 'SpaceMono',
    },
    auditDetails: {
        fontSize: 12,
        color: '#ccc',
        marginBottom: 8,
        fontFamily: 'SpaceMono',
    },
    auditFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    auditTimestamp: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    auditStatus: {
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'SpaceMono',
    },
    keysContainer: {
        marginBottom: 24,
    },
    generateKeyButton: {
        marginBottom: 16,
    },
    keyCard: {
        padding: 16,
        marginBottom: 8,
    },
    keyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    keyInfo: {
        flex: 1,
    },
    keyName: {
        fontSize: 16,
        color: '#f5f5f5',
        fontWeight: 'bold',
        marginBottom: 4,
        fontFamily: 'SpaceMono',
    },
    keyAlgorithm: {
        fontSize: 14,
        color: '#ccc',
        marginBottom: 4,
        fontFamily: 'SpaceMono',
    },
    keyCreated: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    keyStatus: {
        alignItems: 'flex-end',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 4,
    },
    statusText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontFamily: 'SpaceMono',
    },
    keyExpires: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    revokeButton: {
        alignSelf: 'flex-start',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        padding: 24,
        width: '90%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        color: '#f5f5f5',
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
        fontFamily: 'SpaceMono',
    },
    modalDescription: {
        fontSize: 14,
        color: '#ccc',
        marginBottom: 24,
        textAlign: 'center',
        fontFamily: 'SpaceMono',
    },
    modalInput: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: 12,
        color: '#f5f5f5',
        fontSize: 16,
        marginBottom: 12,
        fontFamily: 'SpaceMono',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    modalButton: {
        flex: 1,
    },
});
