/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: GodModeManagementScreen - Advanced God-Mode feature management interface.
 * Got it, love.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Dimensions
} from 'react-native';
import { godModeManager, GodModeFeature } from '../../../core/GodModeManager';

const { width } = Dimensions.get('window');

interface GodModeManagementScreenProps {
  onClose?: () => void;
  onFeatureToggle?: (featureId: string, enabled: boolean) => void;
}

const GodModeManagementScreen: React.FC<GodModeManagementScreenProps> = ({
  onClose,
  onFeatureToggle
}) => {
  const [godModeState, setGodModeState] = useState(godModeManager.getState());
  const [availableFeatures, setAvailableFeatures] = useState<GodModeFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadGodModeData();
  }, []);

  const loadGodModeData = () => {
    setGodModeState(godModeManager.getState());
    setAvailableFeatures(godModeManager.getAvailableFeatures());
  };

  const handleFeatureToggle = async (feature: GodModeFeature) => {
    if (!godModeState.isActive) {
      Alert.alert('God-Mode Inactive', 'Activate God-Mode first to manage features.');
      return;
    }

    try {
      setIsLoading(true);
      let success = false;

      if (feature.isEnabled) {
        success = godModeManager.disableFeature(feature.id);
      } else {
        success = godModeManager.enableFeature(feature.id);
      }

      if (success) {
        loadGodModeData(); // Refresh data
        onFeatureToggle?.(feature.id, !feature.isEnabled);

        Alert.alert(
          'Feature Updated',
          `${feature.name} has been ${feature.isEnabled ? 'disabled' : 'enabled'}.`
        );
      } else {
        Alert.alert('Error', 'Failed to update feature status.');
      }
    } catch (error) {
      console.error('Error toggling feature:', error);
      Alert.alert('Error', 'Failed to update feature.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateGodMode = async () => {
    Alert.alert(
      'Deactivate God-Mode',
      'Are you sure you want to deactivate God-Mode? All advanced features will be disabled.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const success = await godModeManager.deactivateGodMode('default_user', 'User deactivation');

              if (success) {
                loadGodModeData();
                Alert.alert('God-Mode Deactivated', 'All advanced features have been disabled.');
                onClose?.();
              } else {
                Alert.alert('Error', 'Failed to deactivate God-Mode.');
              }
            } catch (error) {
              console.error('Error deactivating God-Mode:', error);
              Alert.alert('Error', 'Failed to deactivate God-Mode.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleSystemAction = async (action: string) => {
    if (!godModeState.isActive) {
      Alert.alert('God-Mode Inactive', 'Activate God-Mode to perform system actions.');
      return;
    }

    try {
      setIsLoading(true);
      const success = await godModeManager.performSystemAction(action);

      if (success) {
        Alert.alert('System Action Completed', `Successfully performed ${action.replace('_', ' ')}.`);
      } else {
        Alert.alert('System Action Failed', `Failed to perform ${action.replace('_', ' ')}.`);
      }
    } catch (error) {
      console.error('Error performing system action:', error);
      Alert.alert('Error', 'Failed to perform system action.');
    } finally {
      setIsLoading(false);
    }
  };

  const getFeatureIcon = (category: string) => {
    switch (category) {
      case 'ai': return '🤖';
      case 'system': return '⚙️';
      case 'device': return '📱';
      case 'security': return '🔒';
      default: return '✨';
    }
  };

  const formatDuration = (activatedAt: Date | null) => {
    if (!activatedAt) return 'Not active';

    const now = new Date();
    const diff = now.getTime() - activatedAt.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>God-Mode Management</Text>
        <Text style={styles.subtitle}>Advanced system control center</Text>
      </View>

      {/* Status Overview */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={[styles.statusText, godModeState.isActive && styles.statusActive]}>
            Status: {godModeState.isActive ? 'ACTIVE' : 'INACTIVE'}
          </Text>
          {godModeState.isActive && (
            <Text style={styles.durationText}>
              Active for: {formatDuration(godModeState.activatedAt)}
            </Text>
          )}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{godModeState.features.filter(f => f.isEnabled).length}</Text>
            <Text style={styles.statLabel}>Features Enabled</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{availableFeatures.length}</Text>
            <Text style={styles.statLabel}>Total Features</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{godModeState.restrictions.length}</Text>
            <Text style={styles.statLabel}>Restrictions</Text>
          </View>
        </View>
      </View>

      {/* Feature Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Feature Management</Text>
        {availableFeatures.map((feature) => (
          <View key={feature.id} style={styles.featureCard}>
            <View style={styles.featureHeader}>
              <View style={styles.featureInfo}>
                <Text style={styles.featureIcon}>{getFeatureIcon(feature.category)}</Text>
                <View style={styles.featureText}>
                  <Text style={styles.featureName}>{feature.name}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
              <Switch
                value={feature.isEnabled}
                onValueChange={() => handleFeatureToggle(feature)}
                disabled={isLoading || !godModeState.isActive}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={feature.isEnabled ? '#007AFF' : '#f4f3f4'}
              />
            </View>

            {feature.requiresPermission && (
              <View style={styles.permissionBadge}>
                <Text style={styles.permissionText}>Requires Permission</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* System Actions */}
      {godModeState.isActive && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSystemAction('deep_analysis')}
              disabled={isLoading}
            >
              <Text style={styles.actionIcon}>🔍</Text>
              <Text style={styles.actionText}>Deep Analysis</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSystemAction('system_optimization')}
              disabled={isLoading}
            >
              <Text style={styles.actionIcon}>⚡</Text>
              <Text style={styles.actionText}>Optimize</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSystemAction('emergency_override')}
              disabled={isLoading}
            >
              <Text style={styles.actionIcon}>🚨</Text>
              <Text style={styles.actionText}>Emergency</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Control Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Controls</Text>
        <View style={styles.controlButtons}>
          <TouchableOpacity
            style={[styles.controlButton, styles.deactivateButton]}
            onPress={handleDeactivateGodMode}
            disabled={isLoading || !godModeState.isActive}
          >
            <Text style={styles.controlButtonText}>Deactivate God-Mode</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.closeButton]}
            onPress={onClose}
          >
            <Text style={styles.controlButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statusCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  statusActive: {
    color: '#FF3B30',
  },
  durationText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  featureCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureText: {
    flex: 1,
  },
  featureName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  permissionBadge: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  permissionText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '500',
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    width: (width - 80) / 3,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  actionText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  controlButtons: {
    gap: 10,
  },
  controlButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  deactivateButton: {
    backgroundColor: '#FF3B30',
  },
  closeButton: {
    backgroundColor: '#8E8E93',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GodModeManagementScreen;
