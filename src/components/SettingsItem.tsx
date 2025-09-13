import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Modal,
  FlatList,
} from 'react-native';

interface Option {
  label: string;
  value: string;
}

interface SettingsItemProps {
  title: string;
  subtitle?: string;
  type: 'switch' | 'button' | 'selector' | 'info';
  value?: any;
  onValueChange?: (value: any) => void;
  onPress?: () => void;
  options?: Option[];
  disabled?: boolean;
  destructive?: boolean;
}

export default function SettingsItem({
  title,
  subtitle,
  type,
  value,
  onValueChange,
  onPress,
  options,
  disabled = false,
  destructive = false,
}: SettingsItemProps) {
  const [showSelector, setShowSelector] = useState(false);

  const handleSelectorPress = () => {
    if (type === 'selector' && options) {
      setShowSelector(true);
    } else if (onPress) {
      onPress();
    }
  };

  const handleOptionSelect = (optionValue: string) => {
    if (onValueChange) {
      onValueChange(optionValue);
    }
    setShowSelector(false);
  };

  const renderContent = () => {
    switch (type) {
      case 'switch':
        return (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#2a2a2a', true: '#0f3460' }}
            thumbColor={value ? '#4ECDC4' : '#a0a0a0'}
            disabled={disabled}
          />
        );
      
      case 'button':
      case 'selector':
        return (
          <View style={styles.buttonContent}>
            {type === 'selector' && value && (
              <Text style={styles.selectedValue}>{value}</Text>
            )}
            <Text style={styles.arrow}>→</Text>
          </View>
        );
      
      case 'info':
        return null;
      
      default:
        return null;
    }
  };

  const isInteractive = type === 'button' || type === 'selector';

  return (
    <>
      <TouchableOpacity
        style={[
          styles.container,
          disabled && styles.disabled,
        ]}
        onPress={isInteractive ? handleSelectorPress : undefined}
        disabled={disabled || type === 'info'}
        activeOpacity={isInteractive ? 0.6 : 1}
      >
        <View style={styles.textContainer}>
          <Text style={[
            styles.title,
            destructive && styles.destructiveTitle,
            disabled && styles.disabledText,
          ]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[
              styles.subtitle,
              disabled && styles.disabledText,
            ]}>
              {subtitle}
            </Text>
          )}
        </View>
        
        <View style={styles.rightContainer}>
          {renderContent()}
        </View>
      </TouchableOpacity>

      {/* Selector Modal */}
      {type === 'selector' && options && (
        <Modal
          visible={showSelector}
          transparent
          animationType="slide"
          onRequestClose={() => setShowSelector(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select {title}</Text>
                <TouchableOpacity onPress={() => setShowSelector(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      value === item.value && styles.selectedOption,
                    ]}
                    onPress={() => handleOptionSelect(item.value)}
                  >
                    <Text style={[
                      styles.optionText,
                      value === item.value && styles.selectedOptionText,
                    ]}>
                      {item.label}
                    </Text>
                    {value === item.value && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1a1a2e',
  },
  textContainer: {
    flex: 1,
    marginRight: 15,
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  destructiveTitle: {
    color: '#FF6B6B',
  },
  subtitle: {
    color: '#a0a0a0',
    fontSize: 14,
  },
  rightContainer: {
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedValue: {
    color: '#4ECDC4',
    fontSize: 14,
    marginRight: 8,
    textTransform: 'capitalize',
  },
  arrow: {
    color: '#a0a0a0',
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#666666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    margin: 20,
    maxHeight: '60%',
    width: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalClose: {
    fontSize: 18,
    color: '#a0a0a0',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1a1a2e',
  },
  selectedOption: {
    backgroundColor: '#0f3460',
  },
  optionText: {
    color: '#ffffff',
    fontSize: 16,
  },
  selectedOptionText: {
    color: '#4ECDC4',
    fontWeight: 'bold',
  },
  checkmark: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
