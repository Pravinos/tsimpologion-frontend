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
          style={[styles.searchInput, { fontSize: 13 }]}
          placeholder="What are you hungry for today?"
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
    marginBottom: 16,
    marginTop: 4,
  },
  searchBar: {
    flex: 1,
    height: 50,
    backgroundColor: colors.lightGray,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginRight: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: colors.black,
    fontSize: 15,
    height: 50,
  },
  filterButton: {
    width: 50,
    height: 50,
    backgroundColor: colors.white,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
});

export default SearchBar;
