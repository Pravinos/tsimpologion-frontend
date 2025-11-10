import React, { useRef, useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import colors from '../../styles/colors';

interface SearchBarProps {
  searchText: string;
  setSearchText: (text: string) => void;
  onFilterPress: () => void;
  suggestions?: string[];
  onSelectSuggestion?: (suggestion: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchText, setSearchText, onFilterPress, suggestions = [], onSelectSuggestion }) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
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
      <View style={{ flex: 1 }}>
        <Animated.View style={[styles.searchBar, animatedStyle]}>
          <Feather name="search" size={20} color={colors.darkGray} />
          <TextInput
            ref={inputRef}
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
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchText('');
                setTimeout(() => {
                  inputRef.current?.focus();
                  setIsFocused(true);
                }, 10);
              }}
              style={styles.clearButton}
              accessibilityLabel="Clear search"
            >
              <Feather name="x" size={18} color={colors.mediumGray} />
            </TouchableOpacity>
          )}
        </Animated.View>
        {isFocused && searchText.length > 0 && suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {suggestions.map((suggestion, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.suggestionItem}
                onPress={() => {
                  onSelectSuggestion?.(suggestion);
                  setIsFocused(false);
                }}
              >
                <Feather name="map-pin" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    marginBottom: 14,
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
  suggestionsContainer: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 10,
    paddingVertical: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.black,
  },
  clearButton: {
    marginLeft: 4,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchBar;
