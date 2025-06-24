import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../styles/colors';

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
  categories = [], // Add default empty array
  sortOptions = [], // Add default empty array
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

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <MaterialCommunityIcons name="close" size={24} color={colors.darkGray} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Filter & Sort</Text>
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
              <View style={styles.filterSection}>
                <Text style={styles.modalLabel}>Price Range</Text><View style={styles.buttonListRow}>
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
                <TouchableOpacity style={styles.modalButton} onPress={onClose}>
                  <Text style={styles.modalButtonText}>Apply</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.clearButton]}
                  onPress={() => {
                    setSelectedCategory('');
                    setSelectedPriceRange('');
                    setSortDirection('desc');
                    setPriceSortDirection('');
                    onClose();
                  }}
                >
                  <Text style={styles.modalButtonText}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
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
    backgroundColor: colors.lightGray, // match priceContainer
    paddingHorizontal: 12, // match priceContainer (6*2 for more touch area)
    paddingVertical: 4, // match priceContainer (2*2 for more touch area)
    borderRadius: 12, // more pill-like, similar to priceContainer
    minWidth: 40,
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 0, // remove border for pill look
    // Remove shadow for a flat look, or keep if you want elevation
  },
  optionButtonSelected: {
    backgroundColor: colors.primary, // match selected priceRange color
  },
  optionButtonText: {
    color: colors.primary, // match priceRange text color
    fontWeight: '600', // match priceRange fontWeight
    fontSize: 14,
  },
  optionButtonTextSelected: {
    color: colors.white, // white text on primary background
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
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
});

export default FilterModal;