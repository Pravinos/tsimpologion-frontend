import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
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

const ListTypeSelector: React.FC<ListTypeSelectorProps> = ({ 
  options, 
  selectedValue, 
  onSelect 
}) => {
  return (
    <View style={styles.container}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt.value}
          style={[
            styles.optionButton,
            selectedValue === opt.value && styles.optionButtonSelected
          ]}
          onPress={() => onSelect(opt.value)}
        >
          <Text style={[
            styles.optionButtonText, 
            selectedValue === opt.value && styles.optionButtonTextSelected
          ]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  optionButton: {
    backgroundColor: colors.white, 
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1, 
    borderColor: colors.mediumGray, // Changed from colors.primary
  },
  optionButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.mediumGray, // Changed from colors.primary
    borderWidth: 1, 
  },
  optionButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  optionButtonTextSelected: {
    color: colors.white,
  },
});

export default ListTypeSelector;
