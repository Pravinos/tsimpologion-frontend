import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../styles/colors';
import { BusinessHoursFormat } from '../../hooks/useBusinessHours';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';

interface BusinessHoursProps {
  hours: BusinessHoursFormat[];
  isOpen: boolean;
  showStatus?: boolean;
}

const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Helper to get the current day as a string (e.g., "Monday")
const getCurrentDay = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  // In JS, Sunday is 0. We want Monday to be the start of the week for display.
  const dayIndex = new Date().getDay();
  return days[dayIndex];
};

const BusinessHours: React.FC<BusinessHoursProps> = ({ hours, isOpen, showStatus = true }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const today = getCurrentDay();

  // Animation for open/closed status
  const scale = useSharedValue(1);
  const colorValue = useSharedValue(isOpen ? 1 : 0);

  React.useEffect(() => {
    scale.value = withSpring(1.12, { damping: 6, stiffness: 180 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 6, stiffness: 180 });
    }, 180);
    colorValue.value = withTiming(isOpen ? 1 : 0, { duration: 350 });
    // eslint-disable-next-line
  }, [isOpen]);

  // Animation for expand/collapse (dynamic height)
  const expandValue = useSharedValue(0);
  React.useEffect(() => {
    expandValue.value = isExpanded ? withTiming(1, { duration: 320 }) : withTiming(0, { duration: 220 });
  }, [isExpanded]);
  const expandStyle = useAnimatedStyle(() => {
    return {
      opacity: expandValue.value,
      height: contentHeight * expandValue.value,
      overflow: 'hidden',
      pointerEvents: expandValue.value === 0 ? 'none' : 'auto',
      // Only add marginTop/paddingTop when expanded
      marginTop: expandValue.value > 0.01 ? 15 : 0,
      paddingTop: expandValue.value > 0.01 ? 10 : 0,
    };
  });

  // Find today's hours from the `hours` prop
  const todayHoursData = hours.find(h => h.day === today);
  const todayHours = todayHoursData ? todayHoursData.hours : 'Closed';

  // Animated style for open/closed status
  const statusAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    color: colorValue.value === 1 ? colors.success : colors.error,
  }));

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={() => setIsExpanded(!isExpanded)} activeOpacity={0.8}>
        <View style={styles.todayInfo}>
          {showStatus && (
            <Animated.Text style={[styles.todayText, statusAnimatedStyle]}>
              {isOpen ? 'Open' : 'Closed'}
            </Animated.Text>
          )}
          <Text style={[styles.hoursText, !showStatus && { marginLeft: 0 }]}>
            {(showStatus ? ' · ' : '')}{today}: {todayHours}
          </Text>
        </View>
        <MaterialCommunityIcons 
          name={isExpanded ? 'chevron-up' : 'chevron-down'} 
          size={24} 
          color={colors.darkGray} 
        />
      </TouchableOpacity>

      {/* Measure content height only once, when rendered, and keep hidden from view */}
      <View
        style={{ position: 'absolute', opacity: 0, left: 0, right: 0, zIndex: -1, pointerEvents: 'none' }}
        pointerEvents="none"
        onLayout={e => setContentHeight(e.nativeEvent.layout.height)}
      >
        <View style={styles.expandedContent}>
          {hours.map(({ day, hours: timeRange }) => (
            <View key={day} style={styles.dayRow}>
              <Text style={[styles.dayText, day === today && { fontWeight: 'bold' }]}>{day}</Text>
              <Text style={[styles.hoursText, { marginLeft: 0 }, day === today && { fontWeight: 'bold' }]}>{timeRange}</Text>
            </View>
          ))}
        </View>
      </View>

      <Animated.View style={[styles.expandedContent, expandStyle]}>
        {hours.map(({ day, hours: timeRange }) => (
          <View key={day} style={styles.dayRow}>
            <Text style={[styles.dayText, day === today && { fontWeight: 'bold' }]}>{day}</Text>
            <Text style={[styles.hoursText, { marginLeft: 0 }, day === today && { fontWeight: 'bold' }]}>{timeRange}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  todayText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  hoursText: {
    fontSize: 16,
    color: colors.darkGray,
    marginLeft: 5,
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  dayText: {
    fontSize: 16,
    color: colors.darkGray,
    fontWeight: '500',
  },
});

export default BusinessHours;
