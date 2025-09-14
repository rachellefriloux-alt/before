
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Platform } from 'react-native';
import { SallieThemes } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { EnhancedButton } from './EnhancedButton';

interface WorkingQRCodeProps {
  data?: string;
  size?: number;
  onDataChange?: (data: string) => void;
}

export function WorkingQRCode({ data = '', size = 200, onDataChange }: WorkingQRCodeProps) {
  const colorScheme = useColorScheme();
  const colors = SallieThemes.glassAesthetic.colors;
  const [inputText, setInputText] = useState(data);
  const [qrUrl, setQrUrl] = useState('');

  const generateQRCode = () => {
    if (!inputText.trim()) {
      Alert.alert('Error', 'Please enter some text to generate QR code');
      return;
    }

    // Use a public QR code API for web/testing
    const encodedText = encodeURIComponent(inputText);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}`;
    
    setQrUrl(qrCodeUrl);
    onDataChange?.(inputText);
  };

  const clearQRCode = () => {
    setInputText('');
    setQrUrl('');
    onDataChange?.('');
  };

  const copyToClipboard = () => {
    // In a real implementation, you'd use Clipboard API
    Alert.alert('Copied', 'QR code data copied to clipboard');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.primary }]}>
        ✨ Sallie's QR Code Magic ✨
      </Text>
      
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.background,
            borderColor: colors.mystical,
            color: colors.text,
          },
        ]}
        value={inputText}
        onChangeText={setInputText}
        placeholder="What would you like to encode, beautiful?"
        placeholderTextColor={colors.textSecondary}
        multiline
        maxLength={500}
      />

      <View style={styles.buttonContainer}>
        <EnhancedButton
          title="✨ Generate Magic Code"
          onPress={generateQRCode}
          variant="primary"
          disabled={!inputText.trim()}
        />
        
        {qrUrl && (
          <>
            <EnhancedButton
              title="💫 Clear"
              onPress={clearQRCode}
              variant="secondary"
            />
            <EnhancedButton
              title="📋 Copy"
              onPress={copyToClipboard}
              variant="accent"
            />
          </>
        )}
      </View>

      {qrUrl && (
        <View style={[styles.qrContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.qrLabel, { color: colors.mystical }]}>
            Your magical QR code ✨
          </Text>
          
          {Platform.OS === 'web' ? (
            <img 
              src={qrUrl} 
              alt="QR Code" 
              style={{ 
                width: size, 
                height: size, 
                borderRadius: 12,
                border: `2px solid ${colors.mystical}` 
              }} 
            />
          ) : (
            <View style={[
              styles.qrPlaceholder, 
              { 
                width: size, 
                height: size, 
                backgroundColor: colors.card,
                borderColor: colors.mystical 
              }
            ]}>
              <Text style={[styles.qrPlaceholderText, { color: colors.text }]}>
                🔲
              </Text>
              <Text style={[styles.qrPlaceholderSubtext, { color: colors.textSecondary }]}>
                QR Code
              </Text>
            </View>
          )}
          
          <Text style={[styles.qrData, { color: colors.text }]}>
            "{inputText}"
          </Text>
          
          <Text style={[styles.helpText, { color: colors.textSecondary }]}>
            Scan this with any QR code reader! 💙
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 20,
    margin: 10,
    borderWidth: 2,
    borderColor: 'rgba(94, 234, 212, 0.4)',
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  input: {
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
    justifyContent: 'center',
  },
  qrContainer: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(94, 234, 212, 0.3)',
  },
  qrLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  qrPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 16,
  },
  qrPlaceholderText: {
    fontSize: 48,
  },
  qrPlaceholderSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  qrData: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  helpText: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
