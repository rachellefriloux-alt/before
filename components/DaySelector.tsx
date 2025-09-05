/*
 * Salle 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Component for selecting days of the week.
 * Got it, love.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle
} from 'react-native';
import { useColorScheme } from 'react-native';

interface DaySelectorProps {
  selectedDays: boolean[];
  onChange: (selectedDays: boolean[]) => void;
  style?: ViewStyle;
  dayStyle?: ViewStyle;
  selectedDayStyle?: ViewStyle;
  dayTextStyle?: TextStyle;
  selectedDayTextStyle?: TextStyle;
}

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const fullDayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function DaySelector({
  selectedDays,
  onChange,
  style,
  dayStyle,
  selectedDayStyle,
  dayTextStyle,
  selectedDayTextStyle
}: DaySelectorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const toggleDay = (index: number) => {
    const updatedDays = [...selectedDays];
    updatedDays[index] = !updatedDays[index];
    onChange(updatedDays);
  };
  
  return (
    <View style={[styles.container, style]}>
      {dayLabels.map((day, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.dayButton,
            dayStyle,
            selectedDays[index] && [styles.selectedDay, selectedDayStyle],
            isDark && styles.dayButtonDark,
            selectedDays[index] && isDark && styles.selectedDayDark,
          ]}
          onPress={() => toggleDay(index)}
          accessibilityLabel={`${fullDayLabels[index]} ${selectedDays[index] ? 'selected' : 'not selected'}`}
        >
          <Text
            style={[
              styles.dayText,
              dayTextStyle,
              selectedDays[index] && [styles.selectedDayText, selectedDayTextStyle],
              isDark && styles.dayTextDark,
              selectedDays[index] && isDark && styles.selectedDayTextDark,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dayButtonDark: {
    backgroundColor: '#2c2c2e',
    borderColor: '#3c3c3e',
  },
  selectedDay: {
    backgroundColor: '#5e72e4',
    borderColor: '#5e72e4',
  },
  selectedDayDark: {
    backgroundColor: '#5e72e4',
    borderColor: '#7d8ff4',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  dayTextDark: {
    color: '#f1f1f1',
  },
  selectedDayText: {
    color: '#ffffff',
  },
  selectedDayTextDark: {
    color: '#ffffff',
  },
});
