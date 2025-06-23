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
    marginBottom: 12,
  },
  optionButton: {
    backgroundColor: colors.white, 
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1, 
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  optionButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  optionButtonText: {
    color: colors.darkGray,
    fontWeight: '600',
    fontSize: 14,
  },
  optionButtonTextSelected: {
    color: colors.white,
  },
});

export default ListTypeSelector;
