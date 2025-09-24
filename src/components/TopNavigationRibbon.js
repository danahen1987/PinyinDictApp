import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { TopNavigationStyles } from '../styles/AppStyles';

const TopNavigationRibbon = ({ 
  characters, 
  currentCharacterId, 
  onCharacterSelect, 
  completedCharacters = [] 
}) => {
  const scrollViewRef = React.useRef(null);

  // Scroll to current character when it changes
  React.useEffect(() => {
    if (scrollViewRef.current && characters.length > 0) {
      const currentIndex = characters.findIndex(char => char.id === currentCharacterId);
      if (currentIndex >= 0) {
        const scrollPosition = Math.max(0, (currentIndex - 2) * 60); // Center the current character
        scrollViewRef.current.scrollTo({
          x: scrollPosition,
          animated: true,
        });
      }
    }
  }, [currentCharacterId, characters]);

  const isCompleted = (characterId) => {
    return completedCharacters.includes(characterId);
  };

  const isCurrent = (characterId) => {
    return characterId === currentCharacterId;
  };

  const getCharacterStyle = (character) => {
    const completed = isCompleted(character.id);
    const current = isCurrent(character.id);
    
    if (current) {
      return [TopNavigationStyles.characterItem, TopNavigationStyles.currentCharacter];
    } else if (completed) {
      return [TopNavigationStyles.characterItem, TopNavigationStyles.completedCharacter];
    } else {
      return TopNavigationStyles.characterItem;
    }
  };

  const getCharacterTextStyle = (character) => {
    const completed = isCompleted(character.id);
    const current = isCurrent(character.id);
    
    if (current) {
      return [TopNavigationStyles.characterText, TopNavigationStyles.currentCharacterText];
    } else if (completed) {
      return [TopNavigationStyles.characterText, TopNavigationStyles.completedCharacterText];
    } else {
      return TopNavigationStyles.characterText;
    }
  };

  if (!characters || characters.length === 0) {
    return null;
  }

  return (
    <View style={TopNavigationStyles.container}>
      <View style={TopNavigationStyles.header}>
        <Text style={TopNavigationStyles.title}>Characters</Text>
        <View style={TopNavigationStyles.progressInfo}>
          <Text style={TopNavigationStyles.progressText}>
            {completedCharacters.length}/{characters.length} completed
          </Text>
        </View>
      </View>
      
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={TopNavigationStyles.scrollView}
        contentContainerStyle={TopNavigationStyles.scrollContent}
      >
        {characters.map((character, index) => (
          <TouchableOpacity
            key={character.id}
            style={getCharacterStyle(character)}
            onPress={() => onCharacterSelect(character.id)}
          >
            <Text style={getCharacterTextStyle(character)}>
              {character.character}
            </Text>
            {isCompleted(character.id) && (
              <View style={TopNavigationStyles.completedIndicator}>
                <Text style={TopNavigationStyles.completedStar}>★</Text>
              </View>
            )}
            {isCurrent(character.id) && (
              <View style={TopNavigationStyles.currentIndicator}>
                <Text style={TopNavigationStyles.currentDot}>●</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={TopNavigationStyles.legend}>
        <View style={TopNavigationStyles.legendItem}>
          <View style={[TopNavigationStyles.legendColor, TopNavigationStyles.currentLegend]} />
          <Text style={TopNavigationStyles.legendText}>Current</Text>
        </View>
        <View style={TopNavigationStyles.legendItem}>
          <View style={[TopNavigationStyles.legendColor, TopNavigationStyles.completedLegend]} />
          <Text style={TopNavigationStyles.legendText}>Completed</Text>
        </View>
        <View style={TopNavigationStyles.legendItem}>
          <View style={[TopNavigationStyles.legendColor, TopNavigationStyles.pendingLegend]} />
          <Text style={TopNavigationStyles.legendText}>Pending</Text>
        </View>
      </View>
    </View>
  );
};

export default TopNavigationRibbon;
