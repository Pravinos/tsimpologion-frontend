import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import colors from '../../styles/colors';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (dir: 'asc' | 'desc') => void;
  categories: string[];
  sortOptions: Array<{ label: string; value: string }>;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  selectedCategory,
  setSelectedCategory,
  sortDirection,
  setSortDirection,
  categories,
  sortOptions
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent={true}
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Filter & Sort</Text>
        <Text style={styles.modalLabel}>Category</Text>
        <View style={styles.buttonListRow}>
          <TouchableOpacity
            style={[styles.optionButton, selectedCategory === '' && styles.optionButtonSelected]}
            onPress={() => setSelectedCategory('')}
          >
            <Text style={[styles.optionButtonText, selectedCategory === '' && styles.optionButtonTextSelected]}>All</Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.optionButton, selectedCategory === cat && styles.optionButtonSelected]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.optionButtonText, selectedCategory === cat && styles.optionButtonTextSelected]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.modalLabel}>Sort by Rating</Text>
        <View style={styles.buttonListRow}>
          {sortOptions.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.optionButton, sortDirection === opt.value && styles.optionButtonSelected]}
              onPress={() => setSortDirection(opt.value as 'asc' | 'desc')}
            >
              <Text style={[styles.optionButtonText, sortDirection === opt.value && styles.optionButtonTextSelected]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={onClose}
          >
            <Text style={styles.modalButtonText}>Apply</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: colors.error }]}
            onPress={() => { setSelectedCategory(''); setSortDirection('desc'); onClose(); }}
          >
            <Text style={styles.modalButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 350,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalLabel: {
    alignSelf: 'flex-start',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
    color: colors.primary,
  },
  buttonListRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 12,
    width: '100%',
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    marginRight: 8,
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: colors.primary,
  },
  optionButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  optionButtonTextSelected: {
    color: colors.white,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FilterModal;
