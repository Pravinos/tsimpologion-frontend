import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../styles/colors';
import ModernButton from './ModernButton';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedPriceRange: string;
  setSelectedPriceRange: (range: string) => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (dir: 'asc' | 'desc') => void;
  priceSortDirection: 'asc' | 'desc' | '';
  setPriceSortDirection: (dir: 'asc' | 'desc' | '') => void;
  categories: string[];
  sortOptions: Array<{ label: string; value: string }>;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  selectedCategory,
  setSelectedCategory,
  selectedPriceRange,
  setSelectedPriceRange,
  sortDirection,
  setSortDirection,
  priceSortDirection,
  setPriceSortDirection,
  categories = [],
  sortOptions = [],
}) => {
  const priceRangeOptions = [
    { label: 'All', value: '' },
    { label: '€', value: '€' },
    { label: '€€', value: '€€' },
    { label: '€€€', value: '€€€' },
  ];

  const priceSortOptions = [
    { label: 'None', value: '' },
    { label: 'Cheapest First', value: 'asc' },
    { label: 'Most Expensive First', value: 'desc' },
  ];

  const [isMounted, setIsMounted] = useState(visible);
  const overlayOpacity = useSharedValue(0);
  const modalTranslateY = useSharedValue(60);
  const modalOpacity = useSharedValue(0);

  // Show modal when visible becomes true
  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      overlayOpacity.value = withTiming(1, { duration: 250 });
      modalTranslateY.value = withTiming(0, { duration: 300 });
      modalOpacity.value = withTiming(1, { duration: 300 });
    } else if (isMounted) {
      // Animate out, then unmount
      overlayOpacity.value = withTiming(0, { duration: 250 });
      modalTranslateY.value = withTiming(60, { duration: 300 });
      modalOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
        if (finished) runOnJS(setIsMounted)(false);
      });
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    overlayOpacity.value = withTiming(0, { duration: 250 });
    modalTranslateY.value = withTiming(60, { duration: 300 });
    modalOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(setIsMounted)(false);
        runOnJS(onClose)();
      }
    });
  }, [onClose]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));
  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: modalTranslateY.value }],
    opacity: modalOpacity.value,
  }));

  if (!isMounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.modalOverlay, overlayStyle]}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <Animated.View style={[styles.modalContent, modalStyle]}>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <MaterialCommunityIcons name="close" size={24} color={colors.darkGray} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Filter & Sort</Text>
              {categories.length > 0 && (
                <View style={styles.filterSection}>
                  <Text style={styles.modalLabel}>Category</Text>
                  <View style={styles.buttonListRow}>
                    <TouchableOpacity
                      style={[styles.optionButton, selectedCategory === '' && styles.optionButtonSelected]}
                      onPress={() => setSelectedCategory('')}
                    >
                      <Text style={[styles.optionButtonText, selectedCategory === '' && styles.optionButtonTextSelected]}>All</Text>
                    </TouchableOpacity>{categories.filter(cat => cat && cat.trim()).map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.optionButton, selectedCategory === cat && styles.optionButtonSelected]}
                        onPress={() => setSelectedCategory(cat)}
                      >
                        <Text style={[styles.optionButtonText, selectedCategory === cat && styles.optionButtonTextSelected]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
              <View style={styles.filterSection}>
                <View style={styles.labelInfoRow}>
                  <Text style={styles.modalLabel}>Price Range</Text>
                  <MaterialCommunityIcons name="information-outline" size={18} color={colors.mediumGray} style={styles.infoIcon} />
                </View>
                <View style={styles.infoBubble}>
                  <Text style={styles.infoText}>
                    Curious about the € signs? € means a typical meal is 5–10€ per person, €€ is 10–20€, €€€ is 20–50€, and €€€€ is 50€ or more. Choose what fits your budget!
                  </Text>
                </View>
                <View style={styles.buttonListRow}>
                  {priceRangeOptions.filter(opt => opt && opt.label).map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.optionButton, selectedPriceRange === opt.value && styles.optionButtonSelected]}
                      onPress={() => setSelectedPriceRange(opt.value)}
                    >
                      <Text style={[styles.optionButtonText, selectedPriceRange === opt.value && styles.optionButtonTextSelected]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.filterSection}><Text style={styles.modalLabel}>Sort by Rating</Text>
                <View style={styles.buttonListRow}>
                  {sortOptions.filter(opt => opt && opt.label && opt.value !== undefined).map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.optionButton, sortDirection === opt.value && styles.optionButtonSelected]}
                      onPress={() => setSortDirection(opt.value as 'asc' | 'desc')}
                    >
                      <Text style={[styles.optionButtonText, sortDirection === opt.value && styles.optionButtonTextSelected]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.filterSection}>
                <Text style={styles.modalLabel}>Sort by Price</Text><View style={styles.buttonListRow}>
                  {priceSortOptions.filter(opt => opt && opt.label && opt.value !== undefined).map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.optionButton, priceSortDirection === opt.value && styles.optionButtonSelected]}
                      onPress={() => setPriceSortDirection(opt.value as 'asc' | 'desc' | '')}
                    >
                      <Text style={[styles.optionButtonText, priceSortDirection === opt.value && styles.optionButtonTextSelected]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.modalButtons}>
                <ModernButton
                  title="Apply"
                  onPress={onClose}
                  style={{ flex: 1, marginRight: 6 }}
                />
                <ModernButton
                  title="Clear"
                  onPress={() => {
                    setSelectedCategory('');
                    setSelectedPriceRange('');
                    setSortDirection('desc');
                    setPriceSortDirection('');
                    onClose();
                  }}
                  variant="secondary"
                  style={{ flex: 1, marginLeft: 6 }}
                />
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 380,
    backgroundColor: colors.backgroundWarm,
    borderRadius: 16,
    padding: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: colors.black,
    marginTop: 8,
  },
  filterSection: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.black,
  },
  buttonListRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
  },
  optionButton: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: colors.primary,
  },
  optionButtonText: {
    color: colors.primary,
    fontWeight: '600', 
    fontSize: 14,
  },
  optionButtonTextSelected: {
    color: colors.white, 
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    gap: 10,
    marginHorizontal: -6,
  },
  modalButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  clearButton: {
    backgroundColor: colors.warmAccent1,
    shadowColor: colors.mediumGray,
  },
  modalButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: -4,
  },
  infoText: {
    color: colors.darkGray,
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
  },
  labelInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    gap: 6,
  },
  infoIcon: {
    marginLeft: 3,
    marginTop: -10,
  },
  infoBubble: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginBottom: 14,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
});

export default FilterModal;