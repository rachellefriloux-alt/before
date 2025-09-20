
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { SallieThemes } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { EnhancedButton } from './EnhancedButton';

interface QRCodeGeneratorProps {
  onQRCodeGenerated?: (data: string) => void;
}

export function QRCodeGenerator({ onQRCodeGenerated }: QRCodeGeneratorProps) {
  const colorScheme = useColorScheme();
  const colors = SallieThemes.glassAesthetic.colors;
  const [inputText, setInputText] = useState('');
  const [qrCodeData, setQRCodeData] = useState('');

  const generateQRCode = () => {
    if (!inputText.trim()) {
      Alert.alert('Error', 'Please enter some text to generate QR code');
      return;
    }

    // For now, we'll create a data URL that represents the QR code
    // You can integrate with react-native-qrcode-sv here once it's working
    const qrData = `QR:${inputText}`;
    setQRCodeData(qrData);
    onQRCodeGenerated?.(qrData);
  };

  const clearQRCode = () => {
    setInputText('');
    setQRCodeData('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        QR Code Generator ✨
      </Text>
      
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        value={inputText}
        onChangeText={setInputText}
        placeholder="Enter text to generate QR code..."
        placeholderTextColor={colors.textSecondary}
        multiline
        maxLength={500}
      />

      <View style={styles.buttonContainer}>
        <EnhancedButton
          title="Generate QR Code"
          onPress={generateQRCode}
          variant="primary"
          disabled={!inputText.trim()}
        />
        
        {qrCodeData && (
          <EnhancedButton
            title="Clear"
            onPress={clearQRCode}
            variant="secondary"
          />
        )}
      </View>

      {qrCodeData && (
        <View style={[styles.qrContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.qrPlaceholder, { color: colors.textSecondary }]}>
            🔲 QR Code would appear here
          </Text>
          <Text style={[styles.qrData, { color: colors.text }]}>
            Data: {inputText}
          </Text>
          <Text style={[styles.helpText, { color: colors.textSecondary }]}>
            QR code generation will be enabled once react-native-qrcode-sv is properly integrated
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    margin: 10,
    borderWidth: 1,
    borderColor: 'rgba(94, 234, 212, 0.3)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  qrContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(94, 234, 212, 0.2)',
  },
  qrPlaceholder: {
    fontSize: 48,
    marginBottom: 12,
  },
  qrData: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
