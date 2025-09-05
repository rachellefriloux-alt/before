/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 *
 * Initial Setup Panel Component - React/TypeScript Version
 * Converted from Vue.js to React Native compatible TSX
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { getAuth, createUserWithEmailAndPassword, User } from 'firebase/auth';
import { getFirestore, setDoc, doc } from 'firebase/firestore';
import { FirebaseApp } from 'firebase/app';

interface InitialSetupPanelProps {
  firebaseApp: FirebaseApp;
  theme?: 'light' | 'dark';
  onSetupComplete?: (user: User) => void;
}

interface AnalyticsEvent {
  event: string;
  data: any;
  timestamp: number;
}

const InitialSetupPanel: React.FC<InitialSetupPanelProps> = ({
  firebaseApp,
  theme = 'light',
  onSetupComplete
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [persona, setPersona] = useState('');
  const [userTheme, setUserTheme] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsEvent[]>([]);

  // Submit setup form
  const submitSetup = async () => {
    setError('');
    setIsLoading(true);

    // Validation
    if (!email.trim()) {
      setError('Email is required.');
      logAnalytics('error', { error: 'Email is required.' });
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      setError('Password is required.');
      logAnalytics('error', { error: 'Password is required.' });
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      logAnalytics('error', { error: 'Password too short.' });
      setIsLoading(false);
      return;
    }

    if (!name.trim()) {
      setError('Name is required.');
      logAnalytics('error', { error: 'Name is required.' });
      setIsLoading(false);
      return;
    }

    if (!persona.trim()) {
      setError('Persona is required.');
      logAnalytics('error', { error: 'Persona is required.' });
      setIsLoading(false);
      return;
    }

    if (!userTheme.trim()) {
      setError('Theme preference is required.');
      logAnalytics('error', { error: 'Theme is required.' });
      setIsLoading(false);
      return;
    }

    if (!consent) {
      setError('You must agree to the terms and conditions.');
      logAnalytics('error', { error: 'Consent required.' });
      setIsLoading(false);
      return;
    }

    try {
      const auth = getAuth(firebaseApp);
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);

      const db = getFirestore(firebaseApp);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: name.trim(),
        persona: persona.trim(),
        theme: userTheme.trim(),
        consent: consent,
        email: email.trim(),
        onboardingComplete: true,
        onboardingTimestamp: Date.now()
      });

      logAnalytics('setup_complete', { user: userCredential.user.uid });

      // Show success message
      Alert.alert(
        'Setup Complete!',
        'Welcome to Sallie AI! Your account has been created successfully.',
        [{ text: 'Continue', onPress: () => onSetupComplete?.(userCredential.user) }]
      );

    } catch (e: any) {
      let errorMessage = 'An error occurred during setup.';

      if (e.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered.';
      } else if (e.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (e.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak.';
      } else if (e.message) {
        errorMessage = e.message;
      }

      setError(errorMessage);
      logAnalytics('error', { error: errorMessage, code: e.code });
    } finally {
      setIsLoading(false);
    }
  };

  // Log analytics event
  const logAnalytics = (event: string, data: any) => {
    const analyticsEvent: AnalyticsEvent = {
      event,
      data,
      timestamp: Date.now()
    };

    setAnalytics(prev => [...prev, analyticsEvent]);
  };

  // Toggle consent checkbox
  const toggleConsent = () => {
    setConsent(prev => !prev);
  };

  return (
    <ScrollView
      style={[styles.container, theme === 'dark' && styles.containerDark]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      accessibilityLabel="Initial App Setup"
    >
      <Text style={[styles.title, theme === 'dark' && styles.titleDark]}>
        Initial App Setup
      </Text>

      <Text style={[styles.subtitle, theme === 'dark' && styles.subtitleDark]}>
        Let's get you set up with Sallie AI. Please provide the following information.
      </Text>

      <View style={styles.form}>
        {/* Email Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, theme === 'dark' && styles.labelDark]}>
            Email *
          </Text>
          <TextInput
            style={[styles.input, theme === 'dark' && styles.inputDark]}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Email"
            editable={!isLoading}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, theme === 'dark' && styles.labelDark]}>
            Password *
          </Text>
          <TextInput
            style={[styles.input, theme === 'dark' && styles.inputDark]}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password (min 6 characters)"
            placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
            secureTextEntry
            accessibilityLabel="Password"
            editable={!isLoading}
          />
        </View>

        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, theme === 'dark' && styles.labelDark]}>
            Name *
          </Text>
          <TextInput
            style={[styles.input, theme === 'dark' && styles.inputDark]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
            accessibilityLabel="Name"
            editable={!isLoading}
          />
        </View>

        {/* Persona Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, theme === 'dark' && styles.labelDark]}>
            Persona *
          </Text>
          <TextInput
            style={[styles.input, theme === 'dark' && styles.inputDark]}
            value={persona}
            onChangeText={setPersona}
            placeholder="Describe your preferred persona/interaction style"
            placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
            multiline
            numberOfLines={3}
            accessibilityLabel="Persona"
            editable={!isLoading}
          />
        </View>

        {/* Theme Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, theme === 'dark' && styles.labelDark]}>
            Preferred Theme *
          </Text>
          <TextInput
            style={[styles.input, theme === 'dark' && styles.inputDark]}
            value={userTheme}
            onChangeText={setUserTheme}
            placeholder="e.g., light, dark, auto"
            placeholderTextColor={theme === 'dark' ? '#999' : '#666'}
            accessibilityLabel="Preferred Theme"
            editable={!isLoading}
          />
        </View>

        {/* Consent Checkbox */}
        <TouchableOpacity
          style={styles.consentContainer}
          onPress={toggleConsent}
          disabled={isLoading}
          accessibilityLabel="Consent checkbox"
          accessibilityHint="Toggle agreement to terms and conditions"
        >
          <View style={[styles.checkbox, consent && styles.checkboxChecked]}>
            {consent && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={[styles.consentText, theme === 'dark' && styles.consentTextDark]}>
            I agree to the terms and conditions *
          </Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!email.trim() || !password.trim() || !name.trim() || !persona.trim() || !userTheme.trim() || !consent || isLoading) && styles.submitButtonDisabled
          ]}
          onPress={submitSetup}
          disabled={!email.trim() || !password.trim() || !name.trim() || !persona.trim() || !userTheme.trim() || !consent || isLoading}
          accessibilityLabel="Complete Setup"
          accessibilityHint="Submit the setup form"
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Setting up...' : 'Complete Setup'}
          </Text>
        </TouchableOpacity>

        {/* Error Message */}
        {error ? (
          <Text
            style={styles.errorText}
            accessibilityLiveRegion="assertive"
          >
            {error}
          </Text>
        ) : null}
      </View>

      {/* Debug info for analytics (can be removed in production) */}
      {__DEV__ && analytics.length > 0 && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>Analytics Events: {analytics.length}</Text>
          <Text style={styles.debugText}>
            Last event: {analytics[analytics.length - 1]?.event}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f3f3',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 8,
  },
  titleDark: {
    color: '#e2e8f0',
  },
  subtitle: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  subtitleDark: {
    color: '#a0aec0',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 8,
  },
  labelDark: {
    color: '#e2e8f0',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#2d3748',
  },
  inputDark: {
    borderColor: '#4a5568',
    backgroundColor: '#2d3748',
    color: '#e2e8f0',
  },
  consentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#667eea',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#667eea',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  consentText: {
    fontSize: 16,
    color: '#2d3748',
    flex: 1,
    lineHeight: 22,
  },
  consentTextDark: {
    color: '#e2e8f0',
  },
  submitButton: {
    backgroundColor: '#48bb78',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#a0aec0',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: '#e53e3e',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    padding: 12,
    backgroundColor: '#fed7d7',
    borderRadius: 4,
  },
  debugContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#edf2f7',
    borderRadius: 4,
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4a5568',
  },
  debugText: {
    fontSize: 10,
    color: '#718096',
  },
});

export default InitialSetupPanel;
