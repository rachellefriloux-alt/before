/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Component for selecting a time range.
 * Got it, love.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextStyle
} from 'react-native';
import { useColorScheme } from 'react-native';
import { formatTime } from '../utils/dateTimeUtils';
import { BlurView } from 'expo-blur';

interface TimeRangePickerProps {
  startHour: number;
  endHour: number;
  onChange: (startHour: number, endHour: number) => void;
  labelStyle?: TextStyle;
}

export default function TimeRangePicker({
  startHour,
  endHour,
  onChange,
  labelStyle
}: TimeRangePickerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  
  // Generate hours for picker
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Handle time selection
  const handleStartHourChange = (hour: number) => {
    onChange(hour, endHour);
    setShowStartPicker(false);
  };
  
  const handleEndHourChange = (hour: number) => {
    onChange(startHour, hour);
    setShowEndPicker(false);
  };
  
  return (
    <View style={styles.container}>
      {/* Start Time */}
      <View style={styles.timeSection}>
        <Text style={[styles.label, labelStyle]}>Start Time</Text>
        <TouchableOpacity
          style={[
            styles.timeButton,
            isDark ? styles.timeButtonDark : styles.timeButtonLight
          ]}
          onPress={() => setShowStartPicker(true)}
        >
          <Text style={[
            styles.timeText,
            isDark ? styles.textDark : styles.textLight
          ]}>
            {formatTime(startHour, 0)}
          </Text>
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.toText, labelStyle]}>to</Text>
      
      {/* End Time */}
      <View style={styles.timeSection}>
        <Text style={[styles.label, labelStyle]}>End Time</Text>
        <TouchableOpacity
          style={[
            styles.timeButton,
            isDark ? styles.timeButtonDark : styles.timeButtonLight
          ]}
          onPress={() => setShowEndPicker(true)}
        >
          <Text style={[
            styles.timeText,
            isDark ? styles.textDark : styles.textLight
          ]}>
            {formatTime(endHour, 0)}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Start Time Picker Modal */}
      <Modal
        visible={showStartPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStartPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStartPicker(false)}
        >
          <BlurView
            intensity={isDark ? 40 : 60}
            tint={isDark ? 'dark' : 'light'}
            style={[
              styles.pickerContainer,
              isDark ? styles.pickerContainerDark : styles.pickerContainerLight
            ]}
          >
            <Text style={[
              styles.pickerTitle,
              isDark ? styles.textDark : styles.textLight
            ]}>
              Select Start Time
            </Text>
            
            <ScrollView style={styles.hoursList}>
              {hours.map((hour) => (
                <TouchableOpacity
                  key={hour}
                  style={[
                    styles.hourItem,
                    hour === startHour && (
                      isDark ? styles.selectedHourDark : styles.selectedHourLight
                    )
                  ]}
                  onPress={() => handleStartHourChange(hour)}
                >
                  <Text style={[
                    styles.hourText,
                    isDark ? styles.textDark : styles.textLight,
                    hour === startHour && styles.selectedHourText
                  ]}>
                    {formatTime(hour, 0)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={[
                styles.cancelButton,
                isDark ? styles.cancelButtonDark : styles.cancelButtonLight
              ]}
              onPress={() => setShowStartPicker(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </BlurView>
        </TouchableOpacity>
      </Modal>
      
      {/* End Time Picker Modal */}
      <Modal
        visible={showEndPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEndPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowEndPicker(false)}
        >
          <BlurView
            intensity={isDark ? 40 : 60}
            tint={isDark ? 'dark' : 'light'}
            style={[
              styles.pickerContainer,
              isDark ? styles.pickerContainerDark : styles.pickerContainerLight
            ]}
          >
            <Text style={[
              styles.pickerTitle,
              isDark ? styles.textDark : styles.textLight
            ]}>
              Select End Time
            </Text>
            
            <ScrollView style={styles.hoursList}>
              {hours.map((hour) => (
                <TouchableOpacity
                  key={hour}
                  style={[
                    styles.hourItem,
                    hour === endHour && (
                      isDark ? styles.selectedHourDark : styles.selectedHourLight
                    )
                  ]}
                  onPress={() => handleEndHourChange(hour)}
                >
                  <Text style={[
                    styles.hourText,
                    isDark ? styles.textDark : styles.textLight,
                    hour === endHour && styles.selectedHourText
                  ]}>
                    {formatTime(hour, 0)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={[
                styles.cancelButton,
                isDark ? styles.cancelButtonDark : styles.cancelButtonLight
              ]}
              onPress={() => setShowEndPicker(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </BlurView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  timeSection: {
    flex: 2,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  timeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeButtonLight: {
    backgroundColor: '#f0f0f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  timeButtonDark: {
    backgroundColor: '#2c2c2e',
    borderWidth: 1,
    borderColor: '#3c3c3e',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  toText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    width: '80%',
    maxHeight: '70%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden',
  },
  pickerContainerLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  pickerContainerDark: {
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  hoursList: {
    width: '100%',
    maxHeight: 300,
  },
  hourItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
    width: '100%',
  },
  selectedHourLight: {
    backgroundColor: '#e0e0ff',
  },
  selectedHourDark: {
    backgroundColor: '#3a3a5c',
  },
  hourText: {
    fontSize: 16,
    textAlign: 'center',
  },
  selectedHourText: {
    fontWeight: '600',
    color: '#5e72e4',
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  cancelButtonLight: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonDark: {
    backgroundColor: '#2c2c2e',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5e72e4',
  },
  textLight: {
    color: '#333',
  },
  textDark: {
    color: '#f1f1f1',
  },
});
