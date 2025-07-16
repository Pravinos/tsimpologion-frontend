import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import colors from '../../styles/colors';

interface ListOption {
  label: string;
  value: string;
}

interface ListTypeSelectorProps {
  options: ListOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

const AnimatedPill: React.FC<{
  label: string;
  selected: boolean;
  onPress: () => void;
  optionCount?: number;
}> = ({ label, selected, onPress, optionCount = 3 }) => {
  const scale = useSharedValue(selected ? 1.08 : 1);

  useEffect(() => {
    scale.value = withTiming(selected ? 1.08 : 1, { duration: 180 });
  }, [selected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: selected ? colors.primary : colors.white,
  }));

  // Add appropriate emoji for each option
  const getDisplayLabel = (label: string) => {
    switch (label) {
      case 'Trending':
        return '🔥 Trending';
      case 'All Spots':
        return '🍽️ All Spots';
      case 'Favourites':
        return '❤️ Favourites';
      case 'My Spots':
        return '👤 My Spots';
      default:
        return label;
    }
  };

  const displayLabel = getDisplayLabel(label);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.touchableContainer}
    >
      <Animated.View
        style={[
          styles.optionButton,
          selected ? styles.optionButtonSelected : styles.optionButtonUnselected,
          animatedStyle,
        ]}
      >
        <Text style={[
          styles.optionButtonText,
          selected && styles.optionButtonTextSelected
        ]}>
          {displayLabel}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const ListTypeSelector: React.FC<ListTypeSelectorProps> = ({ 
  options, 
  selectedValue, 
  onSelect 
}) => {
  // Calculate the flex value based on number of options
  // This ensures the buttons scale appropriately whether there are 3 or 4 options
  const optionCount = options.length;
  
  return (
    <View style={styles.container}>
      {options.map(opt => (
        <AnimatedPill
          key={opt.value}
          label={opt.label}
          selected={selectedValue === opt.value}
          onPress={() => onSelect(opt.value)}
          optionCount={optionCount}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 2,
  },
  touchableContainer: {
    flex: 1,
    marginHorizontal: 6,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  optionButtonSelected: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  optionButtonUnselected: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  optionButtonText: {
    color: colors.darkGray,
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
  },
  optionButtonTextSelected: {
    color: colors.white,
  },
});

export default ListTypeSelector;
