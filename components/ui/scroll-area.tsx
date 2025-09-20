import React from 'react';
import { ScrollView, ScrollViewProps, View, StyleSheet } from 'react-native';

export interface ScrollAreaProps extends ScrollViewProps {
  children: React.ReactNode;
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({ 
  children, 
  style,
  ...props 
}) => {
  return (
    <View style={[styles.container, style]}>
      <ScrollView
        {...props}
        showsVerticalScrollIndicator={true}
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {children}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});