import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  action: () => void;
  color: string;
}

export default function QuickActions() {
  const navigation = useNavigation();

  const quickActions: QuickAction[] = [
    {
      id: 'call',
      title: 'Call',
      icon: '📞',
      action: () => console.log('Call action'),
      color: '#4ECDC4',
    },
    {
      id: 'message',
      title: 'Message',
      icon: '💬',
      action: () => console.log('Message action'),
      color: '#45B7D1',
    },
    {
      id: 'camera',
      title: 'Camera',
      icon: '📷',
      action: () => console.log('Camera action'),
      color: '#FF6B6B',
    },
    {
      id: 'maps',
      title: 'Maps',
      icon: '🗺️',
      action: () => console.log('Maps action'),
      color: '#96CEB4',
    },
    {
      id: 'music',
      title: 'Music',
      icon: '🎵',
      action: () => console.log('Music action'),
      color: '#FFEAA7',
    },
    {
      id: 'sallie',
      title: 'Sallie',
      icon: '🤖',
      action: () => navigation.navigate('SalliePanel' as never),
      color: '#DDA0DD',
    },
    {
      id: 'memories',
      title: 'Memories',
      icon: '🧠',
      action: () => navigation.navigate('Memories' as never),
      color: '#98D8C8',
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: '⚙️',
      action: () => navigation.navigate('Settings' as never),
      color: '#F7DC6F',
    },
  ];

  const handleActionPress = (action: QuickAction) => {
    action.action();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.actionButton, { backgroundColor: action.color }]}
            onPress={() => handleActionPress(action)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>{action.icon}</Text>
            <Text style={styles.actionTitle}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  actionButton: {
    width: 80,
    height: 80,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  actionTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
