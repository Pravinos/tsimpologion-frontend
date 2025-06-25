import React, { useRef, useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, FlatList, Text, Pressable, Keyboard } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import colors from '../../styles/colors';

interface SearchBarProps {
  searchText: string;
  setSearchText: (text: string) => void;
  onFilterPress: () => void;
  foodSpotNames: string[]; // New: list of food spot names
  categories: string[]; // New: list of categories
  onSuggestionPress?: (suggestion: string, type: 'name' | 'category' | 'recent') => void; // New: callback for suggestion
}

const MAX_RECENT = 5;

const highlightMatch = (text: string, match: string) => {
  if (!match) return <Text>{text}</Text>;
  const idx = text.toLowerCase().indexOf(match.toLowerCase());
  if (idx === -1) return <Text>{text}</Text>; // FIX: return must be on the same line
  return (
    <Text>
      {text.substring(0, idx)}
      <Text style={{ backgroundColor: colors.primary, color: colors.white }}>{text.substring(idx, idx + match.length)}</Text>
      {text.substring(idx + match.length)}
    </Text>
  );
};

const SearchBar: React.FC<SearchBarProps> = ({ searchText, setSearchText, onFilterPress, foodSpotNames, categories, onSuggestionPress }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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

  // Suggestions logic
  const lowerSearch = searchText.trim().toLowerCase();
  const nameSuggestions = lowerSearch
    ? foodSpotNames.filter(n => n.toLowerCase().includes(lowerSearch))
    : [];
  // Remove category suggestions
  // const categorySuggestions = lowerSearch
  //   ? categories.filter(c => c.toLowerCase().includes(lowerSearch))
  //   : [];
  const showSuggestionsBox = isFocused && lowerSearch.length > 0;
  const showRecent = false; // Disable recent when no letter is typed

  const handleSuggestionPress = (suggestion: string, type: 'name' | 'category' | 'recent') => {
    setSearchText(suggestion);
    setShowSuggestions(false);
    Keyboard.dismiss();
    if (onSuggestionPress) onSuggestionPress(suggestion, type);
    // Add to recent searches
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s !== suggestion);
      return [suggestion, ...filtered].slice(0, MAX_RECENT);
    });
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };
  const handleInputBlur = () => {
    setIsFocused(false);
    setTimeout(() => setShowSuggestions(false), 150); // Delay to allow press
  };

  return (
    <View style={{ zIndex: 10 }}>
      <View style={styles.searchContainer}>
        <Animated.View style={[styles.searchBar, animatedStyle]}>
          <Feather name="search" size={20} color={colors.darkGray} />
          <TextInput
            style={[styles.searchInput, { fontSize: 13 }]}
            placeholder="What are you hungry for today?"
            placeholderTextColor={colors.darkGray}
            value={searchText}
            onChangeText={text => {
              setSearchText(text);
              setShowSuggestions(true);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            returnKeyType="search"
            onSubmitEditing={() => {
              if (searchText.trim()) handleSuggestionPress(searchText.trim(), 'recent');
            }}
          />
          {!!searchText && (
            <TouchableOpacity onPress={() => setSearchText('')} style={{ marginRight: 6 }}>
              <Feather name="x" size={18} color={colors.darkGray} />
            </TouchableOpacity>
          )}
        </Animated.View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={onFilterPress}
        >
          <Feather name="filter" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
      {showSuggestionsBox && (
        <View style={styles.suggestionsContainer}>
          {nameSuggestions.length > 0 && (
            <View style={styles.suggestionSection}>
              {nameSuggestions.map((n, i) => (
                <Pressable key={n + i} style={styles.suggestionItem} onPress={() => handleSuggestionPress(n, 'name')}>
                  <Feather name="map-pin" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                  {highlightMatch(n, searchText)}
                </Pressable>
              ))}
            </View>
          )}
          {/* Remove category suggestions UI */}
          {nameSuggestions.length === 0 && !!searchText && (
            <Text style={styles.noSuggestions}>No suggestions found</Text>
          )}
        </View>
      )}
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
  suggestionsContainer: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 62,
    backgroundColor: colors.white,
    borderRadius: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 100,
    paddingVertical: 6,
    paddingHorizontal: 8,
    minWidth: 200,
    maxHeight: 220,
  },
  suggestionSection: {
    marginBottom: 6,
  },
  suggestionHeader: {
    fontSize: 12,
    color: colors.mediumGray,
    marginBottom: 2,
    marginLeft: 2,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 6,
  },
  noSuggestions: {
    color: colors.mediumGray,
    fontSize: 13,
    textAlign: 'center',
    padding: 10,
  },
});

export default SearchBar;
