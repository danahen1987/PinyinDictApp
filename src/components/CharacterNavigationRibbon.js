import React, { useRef, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { CharacterNavigationRibbonStyles } from '../styles/AppStyles';

const { width: screenWidth } = Dimensions.get('window');

const CharacterNavigationRibbon = ({ 
  characters, 
  currentPosition, 
  onCharacterSelect, 
  currentCharacter,
  viewedCharacters = new Set()
}) => {
  const scrollViewRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const isScrollingRef = useRef(false);
  const characterRefs = useRef([]);

  // Measure-based auto-scroll function to center character in the ribbon
  const autoScrollToCharacter = useCallback((characterIndex, animated = true) => {
    if (!scrollViewRef.current) return;
    
    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Set scrolling flag
    isScrollingRef.current = true;
    
    // Debounce the scroll action
    scrollTimeoutRef.current = setTimeout(() => {
      // Check if we have the character ref
      if (!characterRefs.current[characterIndex]) {
        // Fallback to simple calculation
        const itemWidth = 54;
        const offset = 20; // Further increased offset to shift character more to the right for perfect centering
        const scrollToX = characterIndex * itemWidth + offset;
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            x: Math.max(0, scrollToX),
            animated: animated,
          });
        }
        setTimeout(() => {
          isScrollingRef.current = false;
        }, animated ? 300 : 0);
        return;
      }
      
      // Use measureLayout to get the exact position of the character
      characterRefs.current[characterIndex].measureLayout(
        scrollViewRef.current,
        (x, y, width, height) => {
          // Calculate the scroll position to center the character
          const characterCenter = x + (width / 2);
          const screenCenter = screenWidth / 2;
          const offset = 20; // Further increased offset to shift character more to the right for perfect centering
          const scrollToX = characterCenter - screenCenter + offset;
          
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
              x: Math.max(0, scrollToX),
              animated: animated,
            });
          }
          
          // Reset scrolling flag after animation
          setTimeout(() => {
            isScrollingRef.current = false;
          }, animated ? 300 : 0);
        },
        (error) => {
          // Fallback to simple calculation
          const itemWidth = 54;
          const offset = 20; // Further increased offset to shift character more to the right for perfect centering
          const scrollToX = characterIndex * itemWidth + offset;
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({
              x: Math.max(0, scrollToX),
              animated: animated,
            });
          }
          setTimeout(() => {
            isScrollingRef.current = false;
          }, animated ? 300 : 0);
        }
      );
    }, 100); // Increased debounce to 100ms
  }, []);

  // Auto-scroll to current character when position changes
  useEffect(() => {
    if (characters.length > 0) {
      const characterIndex = currentPosition - 1;
      autoScrollToCharacter(characterIndex, true);
    }
  }, [currentPosition, characters.length, autoScrollToCharacter]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Helper function to get dynamic character text style based on character length
  const getCharacterTextStyle = (character, isCurrent = false, isViewed = false) => {
    const baseStyle = CharacterNavigationRibbonStyles.characterText;
    const characterLength = character ? character.length : 1;

    // Adjust font size based on character length
    let fontSize = 18;
    if (characterLength > 1) {
      fontSize = Math.max(12, 18 - (characterLength - 1) * 3);
    }

    // For current character, make it slightly larger but still respect length limits
    if (isCurrent) {
      fontSize = Math.min(fontSize + 2, 24); // Add 2px but cap at 24px
    }

    // Don't include color if it's viewed - let viewedCharacterText handle the color
    const style = {
      fontSize: fontSize,
      fontWeight: baseStyle.fontWeight,
    };

    // Only include color if it's not viewed
    if (!isViewed) {
      style.color = baseStyle.color;
    }

    return style;
  };

  const handleCharacterPress = useCallback((index) => {
    // Prevent multiple rapid taps while scrolling
    if (isScrollingRef.current) {
      return;
    }

    const character = characters[index];
    if (character && onCharacterSelect) {
      // Set scrolling flag to prevent multiple rapid taps
      isScrollingRef.current = true;

      // Immediately call the loadCharacter function - no delay
      onCharacterSelect(character.id, index + 1);

      // Auto-scroll to the selected character's location
      autoScrollToCharacter(index, true);
    }
  }, [characters, onCharacterSelect, autoScrollToCharacter]);


  if (!characters || characters.length === 0) {
    return null;
  }

  return (
    <View style={CharacterNavigationRibbonStyles.container}>
      {/* Debug info */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={CharacterNavigationRibbonStyles.scrollContent}
        style={CharacterNavigationRibbonStyles.scrollView}
        decelerationRate={0.98}
        scrollEventThrottle={1}
        bounces={false}
        pagingEnabled={false}
        removeClippedSubviews={false}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={true}
        directionalLockEnabled={true}
      >
        {characters.map((character, index) => {
          const isCurrent = index + 1 === currentPosition;
          const isViewed = viewedCharacters.has(character.id);
          
          // Determine the style based on priority: current > viewed > default
          const isCurrentlySelected = isCurrent;
          const isViewedButNotCurrent = isViewed && !isCurrent;
          
          return (
            <TouchableOpacity
              key={`${character.id}-${index}`} // Unique key using both ID and index
              ref={(el) => {
                characterRefs.current[index] = el;
                if (index === 0) {
                }
              }}
              style={[
                CharacterNavigationRibbonStyles.characterItem,
                isCurrentlySelected && CharacterNavigationRibbonStyles.currentCharacterItem,
                isViewedButNotCurrent && CharacterNavigationRibbonStyles.viewedCharacterItem
              ]}
              onPress={() => handleCharacterPress(index)}
              activeOpacity={0.7}
              delayPressIn={0}
            >
                     <Text
                       style={[
                         getCharacterTextStyle(character.character, isCurrent, isViewedButNotCurrent),
                         isCurrentlySelected && CharacterNavigationRibbonStyles.currentCharacterText,
                         isViewedButNotCurrent && CharacterNavigationRibbonStyles.viewedCharacterText
                       ]}
                     >
                       {character.character}
                     </Text>
              <Text
                style={[
                  CharacterNavigationRibbonStyles.positionText,
                  isCurrentlySelected && CharacterNavigationRibbonStyles.currentPositionText
                ]}
              >
                {index + 1}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};


export default CharacterNavigationRibbon;
