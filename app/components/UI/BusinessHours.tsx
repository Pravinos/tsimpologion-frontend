import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../styles/colors';
import { BusinessHoursFormat } from '../../hooks/useBusinessHours';

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
  const today = getCurrentDay();

  // Find today's hours from the `hours` prop
  const todayHoursData = hours.find(h => h.day === today);
  const todayHours = todayHoursData ? todayHoursData.hours : 'Closed';

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={() => setIsExpanded(!isExpanded)} activeOpacity={0.8}>
        <View style={styles.todayInfo}>
          {showStatus && (
            <Text style={[styles.todayText, { color: isOpen ? colors.success : colors.error }]}>
              {isOpen ? 'Open' : 'Closed'}
            </Text>
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

      {isExpanded && (
        <View style={styles.expandedContent}>
          {hours.map(({ day, hours: timeRange }) => (
            <View key={day} style={styles.dayRow}>
              <Text style={[styles.dayText, day === today && { fontWeight: 'bold' }]}>{day}</Text>
              <Text style={[styles.hoursText, { marginLeft: 0 }, day === today && { fontWeight: 'bold' }]}>{timeRange}</Text>
            </View>
          ))}
        </View>
      )}
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
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: 10,
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
