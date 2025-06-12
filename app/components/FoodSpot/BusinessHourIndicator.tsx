import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../styles/colors';

interface BusinessHourIndicatorProps {
  isOpen: boolean;
}

const BusinessHourIndicator: React.FC<BusinessHourIndicatorProps> = ({ isOpen }) => {
  return (
    <View style={styles.container}>
      <View 
        style={[
          styles.indicator, 
          isOpen ? styles.indicatorOpen : styles.indicatorClosed
        ]} 
      />
      <Text 
        style={[
          styles.text, 
          isOpen ? styles.textOpen : styles.textClosed
        ]}
      >
        {isOpen ? 'Open now' : 'Closed'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6
  },
  indicatorOpen: {
    backgroundColor: '#2ecc40'
  },
  indicatorClosed: {
    backgroundColor: '#e74c3c'
  },
  text: {
    fontWeight: 'bold'
  },
  textOpen: {
    color: '#2ecc40'
  },
  textClosed: {
    color: '#e74c3c'
  }
});

export default BusinessHourIndicator;
