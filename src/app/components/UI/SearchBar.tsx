import React, { useRef, useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import colors from '../../styles/colors';

interface SearchBarProps {
  searchText: string;
  setSearchText: (text: string) => void;
  onFilterPress: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchText, setSearchText, onFilterPress }) => {
  const [isFocused, setIsFocused] = useState(false);
  const scale = useSharedValue(1);
  const shadow = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withTiming(isFocused ? 1.03 : 1, { duration: 180 });
    shadow.value = withTiming(isFocused ? 4 : 1, { duration: 180 });
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    elevation: shadow.value,
    shadowRadius: shadow.value,
    shadowOpacity: isFocused ? 0.13 : 0.05,
  }));

  return (
    <View style={styles.searchContainer}>
      <Animated.View style={[styles.searchBar, animatedStyle]}>
        <Feather name="search" size={20} color={colors.darkGray} />
        <TextInput
          style={[styles.searchInput, { fontSize: 13 }]}
          placeholder="What are you hungry for today?"
          placeholderTextColor={colors.darkGray}
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </Animated.View>
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
