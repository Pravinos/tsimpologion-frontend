import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import colors from '../../styles/colors';

interface SearchBarProps {
  searchText: string;
  setSearchText: (text: string) => void;
  onFilterPress: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchText, setSearchText, onFilterPress }) => {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Feather name="search" size={20} color={colors.darkGray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for food places..."
          placeholderTextColor={colors.darkGray}
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={onFilterPress}
      >
        <Feather name="filter" size={20} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  searchBar: {
    flex: 1,
    height: 46,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: colors.darkGray,
    fontSize: 14,
    height: 46,
  },
  filterButton: {
    width: 46,
    height: 46,
    backgroundColor: colors.white,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
});

export default SearchBar;
