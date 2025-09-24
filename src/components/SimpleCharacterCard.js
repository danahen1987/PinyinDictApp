import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { DatabaseInitializer } from '../database/DatabaseInitializer';
import { CommonStyles, CharacterCardStyles, SimpleCharacterCardStyles } from '../styles/AppStyles';
import SentencePopup from './SentencePopup';
import CharacterNavigationRibbon from './CharacterNavigationRibbon';
import InteractiveStrokePracticeModal from './InteractiveStrokePracticeModal';
import { extractChineseCharacters } from '../data/strokeData';
import ttsService from '../services/TTSService'; // TTS service import

const SimpleCharacterCard = ({ currentUser, onBackToLanding, databaseHelper }) => {
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [currentSentence, setCurrentSentence] = useState(null);
  const [currentCharacterId, setCurrentCharacterId] = useState(1);
  const [currentPosition, setCurrentPosition] = useState(1); // Track position in the list (1-based)
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [databaseInitializer, setDatabaseInitializer] = useState(null);
  const [allCharacters, setAllCharacters] = useState([]);
  const [error, setError] = useState(null);
  const [showSentencePopup, setShowSentencePopup] = useState(false);
  const [showStrokePractice, setShowStrokePractice] = useState(false);
  const [selectedCharacterForStroke, setSelectedCharacterForStroke] = useState(null);
  const [allCharactersData, setAllCharactersData] = useState(new Map());
  const [viewedCharacters, setViewedCharacters] = useState(new Set());
  const [currentUserData, setCurrentUserData] = useState(null); // Cache current user data
  const [userViewedCount, setUserViewedCount] = useState(0); // Track user's viewed character count

  // Helper function to get dynamic character text style based on character length
  const getCharacterTextStyle = (character) => {
    const baseStyle = CharacterCardStyles.characterText;
    const characterLength = character ? character.length : 1;

    // For individual characters, use a larger size for better visibility
    let fontSize = 100; // Larger base size for individual character display
    if (characterLength > 1) {
      fontSize = Math.max(70, 100 - (characterLength - 1) * 15);
    }

    return {
      ...baseStyle,
      fontSize: fontSize,
      lineHeight: fontSize + 15,
      // Ensure centering is maintained
      textAlign: 'center',
      alignSelf: 'center',
    };
  };

  // Generate static Hanzi Writer HTML for main character display
  const generateStaticHanziWriterHTML = (char, characterCount = 1) => {
    // Dynamic size calculation based on character count
    let size, fontSize;
    if (characterCount === 1) {
      size = 200; // Full size for single character
      fontSize = 120;
    } else if (characterCount === 2) {
      size = 120; // Larger size for 2 characters (60% larger than 3+)
      fontSize = 70; // Larger font size for 2 characters (56% larger than 3+)
    } else {
      size = 75; // Compact size for 3+ characters
      fontSize = 45;
    }
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              background-color: transparent;
              font-family: Arial, sans-serif;
            }
            #character-target {
              width: ${size}px;
              height: ${size}px;
            }
          </style>
        </head>
        <body>
          <div id="character-target">
          </div>
          
          <script>
            // Fallback function
            function showFallback() {
              document.getElementById('character-target').innerHTML = 
                '<div style="text-align: center; font-size: ${fontSize}px; color: #2c3e50; line-height: ${size}px; font-weight: bold;">${char}</div>';
            }
            
            // Try to load Hanzi Writer
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hanzi-writer@2.0.0/dist/hanzi-writer.min.js';
            script.onload = function() {
              try {
                const writer = HanziWriter.create('character-target', '${char}', {
                  width: ${size},
                  height: ${size},
                  padding: 5,
                  showOutline: false,
                  showCharacter: true,
                  strokeColor: '#2c3e50',
                  strokeWidth: ${characterCount === 1 ? 3 : characterCount === 2 ? 2.5 : 2}
                });
                
                // Show the character immediately (no animation)
                writer.showCharacter();
              } catch (error) {
                console.error('Hanzi Writer error:', error);
                showFallback();
              }
            };
            script.onerror = function() {
              console.error('Failed to load Hanzi Writer');
              showFallback();
            };
            document.head.appendChild(script);
          </script>
        </body>
      </html>
    `;
  };

  // Clear user cache when user changes
  useEffect(() => {
    if (currentUser && currentUser !== 'Guest') {
      setCurrentUserData(null);
      setViewedCharacters(new Set());
      setUserViewedCount(0);
      // Reload viewed characters for the new user
      if (databaseHelper) {
        loadViewedCharacters();
      }
    } else {
      setCurrentUserData(null);
      setViewedCharacters(new Set());
      setUserViewedCount(0);
    }
  }, [currentUser, databaseInitializer]);

  // Separate useEffect to handle database initialization
  useEffect(() => {
    if (databaseHelper && !databaseInitializer) {
      initializeApp();
    }
  }, [databaseHelper]);

  // Retry loading last viewed character when character data becomes available
  useEffect(() => {
    if (allCharacters.length > 0 && allCharactersData.size > 0 && currentUserData && currentUser !== 'Guest') {
      loadViewedCharacters(); // This will call loadLastViewedCharacter
    }
  }, [allCharacters.length, allCharactersData.size]);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use the passed databaseHelper instead of creating a new one
      if (!databaseHelper) {
        throw new Error('Database helper not available');
      }
      
      // Create a mock database initializer for compatibility
      const mockDbInit = {
        getDatabaseHelper: () => databaseHelper
      };
      setDatabaseInitializer(mockDbInit);

      // Load all characters and cache all their data
      const dbHelper = mockDbInit.getDatabaseHelper();
      const characters = await dbHelper.getAllCharacters();
      
      if (characters.length > 0) {
        setAllCharacters(characters);
        
        // Load ALL character data at once for instant navigation
        const characterDataMap = new Map();
        
        // Load all characters and sentences in parallel
        const loadPromises = characters.map(async (char) => {
          try {
            const [character, sentence] = await Promise.all([
              dbHelper.getCharacter(char.id),
              dbHelper.getSentenceByCharacterId(char.id)
            ]);
            
            if (character) {
              characterDataMap.set(char.id, { character, sentence });
            }
          } catch (error) {
            console.error(`Error loading character ${char.id}:`, error);
          }
        });
        
        await Promise.all(loadPromises);
        setAllCharactersData(characterDataMap);
        
        // Load the first character by default - last viewed will be loaded after user data is available
        let characterToLoad = characters[0];
        let positionToLoad = 1;
        
        if (characterToLoad && characterToLoad.id) {
          const charData = characterDataMap.get(characterToLoad.id);
          
          if (charData) {
            setCurrentCharacter(charData.character);
            setCurrentSentence(charData.sentence);
            setCurrentCharacterId(characterToLoad.id);
            setCurrentPosition(positionToLoad);
            setShowDiscovery(false);
            
            // Don't track as viewed since it's already viewed
          } else {
            setError('Character not found');
          }
        } else {
          setError('Invalid character data');
        }
        
        // Load viewed characters for the current user
        if (currentUser && currentUser !== 'Guest') {
          // Test user registration first
          const dbHelper = databaseHelper;
          await dbHelper.testUserRegistration(currentUser);
          
          await loadViewedCharacters();
        }
      } else {
        setError('No character data available');
      }
      
    } catch (error) {
      console.error('Error in SimpleCharacterCard initialization:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };


  // Load viewed characters for the current user
  const loadViewedCharacters = async () => {
    if (!databaseHelper || !currentUser || currentUser === 'Guest') {
      return;
    }

    try {
      const dbHelper = databaseHelper;
      
      // Get user data and cache it
      const userData = await dbHelper.getUserByUsername(currentUser);
      
      if (userData) {
        setCurrentUserData(userData); // Cache the user data
        
        // Get viewed characters using the cached user ID
        const viewedChars = await dbHelper.getViewedCharacters(userData.id);
        
        // Calculate actual viewed count from the viewed characters
        const actualViewedCount = viewedChars ? viewedChars.length : 0;
        setUserViewedCount(actualViewedCount);
        
        const viewedSet = new Set(viewedChars.map(char => char.character_id));
        
        setViewedCharacters(viewedSet);
        
        // Load the last viewed character now that user data is available
        await loadLastViewedCharacter(userData, viewedChars);
      }
    } catch (error) {
      console.error('Error loading viewed characters:', error);
    }
  };

  const loadLastViewedCharacter = async (userData, viewedChars) => {
    if (!userData || !viewedChars || viewedChars.length === 0) {
      return;
    }
    
    if (!allCharacters.length || !allCharactersData.size) {
      return;
    }

    try {
      // Sort by last_accessed to get the most recent
      const sortedViewed = viewedChars.sort((a, b) => 
        new Date(b.last_accessed) - new Date(a.last_accessed)
      );
      
      const lastViewed = sortedViewed[0];
      
      if (lastViewed && lastViewed.character_id) {
        const lastViewedId = lastViewed.character_id;
        
        // Find the character in the characters array to get its position
        const lastViewedIndex = allCharacters.findIndex(char => char && char.id === lastViewedId);
        
        if (lastViewedIndex !== -1) {
          const characterToLoad = allCharacters[lastViewedIndex];
          const positionToLoad = lastViewedIndex + 1; // Convert to 1-based position
          
          // Load the character data
          const charData = allCharactersData.get(characterToLoad.id);
          
          if (charData) {
            setCurrentCharacter(charData.character);
            setCurrentSentence(charData.sentence);
            setCurrentCharacterId(characterToLoad.id);
            setCurrentPosition(positionToLoad);
            setShowDiscovery(false);
          }
        }
      }
    } catch (error) {
      console.error('Error loading last viewed character:', error);
    }
  };

  // Track character as viewed
  const trackCharacterView = async (characterId) => {
    if (!databaseHelper || !currentUser || currentUser === 'Guest') {
      return;
    }

    try {
      const dbHelper = databaseHelper;
      
      // Use cached user data if available, otherwise fetch it
      let user = currentUserData;
      if (!user) {
        user = await dbHelper.getUserByUsername(currentUser);
        if (user) {
          setCurrentUserData(user); // Cache it for future use
        }
      }
      
      if (user && user.id) {
        const wasNewView = await dbHelper.markCharacterAsViewed(user.id, characterId);
        
        // Update local state
        setViewedCharacters(prev => new Set(prev.add(characterId)));
        
        // Update user's viewed count if this was a new view
        if (wasNewView) {
          // Get the actual viewed characters count
          const viewedChars = await dbHelper.getViewedCharacters(user.id);
          const actualCount = viewedChars ? viewedChars.length : 0;
          setUserViewedCount(actualCount);
        }
      }
    } catch (error) {
      console.error('Error tracking character view:', error);
    }
  };

  const loadCharacter = (characterId, position) => {
    // All data is already cached, so this is instant!
    const characterData = allCharactersData.get(characterId);
    
    if (characterData) {
      setCurrentCharacter(characterData.character);
      setCurrentSentence(characterData.sentence);
      setCurrentCharacterId(characterId);
      setCurrentPosition(position);
      setShowDiscovery(false);
      setError(null);
      
      // Track character as viewed if user is logged in
      if (currentUser && currentUser !== 'Guest') {
        trackCharacterView(characterId);
      }
    } else {
      // Fallback: try to find character in allCharacters array
      const characterFromArray = allCharacters.find(char => char.id === characterId);
      if (characterFromArray) {
        setCurrentCharacter(characterFromArray.character);
        setCurrentSentence(characterFromArray.sentence);
        setCurrentCharacterId(characterId);
        setCurrentPosition(position);
        setShowDiscovery(false);
        setError(null);
        
        // Track character as viewed if user is logged in
        if (currentUser && currentUser !== 'Guest') {
          trackCharacterView(characterId);
        }
      } else {
        setError('Character not found in cache or array');
      }
    }
  };

  const handleNext = useCallback(() => {
    const nextIndex = currentPosition; // currentPosition is 1-based, so nextIndex is the array index
    if (nextIndex < allCharacters.length) {
      const nextCharacter = allCharacters[nextIndex];
      loadCharacter(nextCharacter.id, currentPosition + 1);
    }
  }, [currentPosition, allCharacters]);

  const handlePrevious = useCallback(() => {
    const prevIndex = currentPosition - 2; // currentPosition is 1-based, so prevIndex is currentPosition - 2
    if (prevIndex >= 0) {
      const prevCharacter = allCharacters[prevIndex];
      loadCharacter(prevCharacter.id, currentPosition - 1);
    }
  }, [currentPosition, allCharacters]);

  const toggleDiscovery = useCallback(() => {
    setShowDiscovery(!showDiscovery);
  }, [showDiscovery]);

  const handleBackToLanding = useCallback(() => {
    if (onBackToLanding) {
      onBackToLanding();
    }
  }, [onBackToLanding]);

  // Handle individual character click for stroke practice
  const handleCharacterClick = useCallback((character) => {
    setSelectedCharacterForStroke(character);
    setShowStrokePractice(true);
  }, []);

  // Handle character sound pronunciation
  const handleCharacterSound = useCallback(() => {
    if (currentCharacter && currentCharacter.character) {
      // Use setTimeout to prevent blocking the UI
      setTimeout(() => {
        ttsService.speakCharacter(currentCharacter.character);
      }, 0);
    }
  }, [currentCharacter]);

  if (isLoading) {
    return (
      <View style={CommonStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={CommonStyles.loadingText}>Loading Chinese Characters...</Text>
        {error && (
          <Text style={SimpleCharacterCardStyles.errorText}>Error: {error}</Text>
        )}
      </View>
    );
  }

  if (error) {
    return (
      <View style={CommonStyles.errorContainer}>
        <Text style={CommonStyles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={SimpleCharacterCardStyles.retryButton} onPress={async () => {
          if (databaseHelper) {
            await databaseHelper.clearDatabase();
          }
          await initializeApp();
        }}>
          <Text style={SimpleCharacterCardStyles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={SimpleCharacterCardStyles.backButton} onPress={handleBackToLanding}>
          <Text style={SimpleCharacterCardStyles.backButtonText}>Back to Landing</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentCharacter) {
    return (
      <View style={CommonStyles.errorContainer}>
        <Text style={CommonStyles.errorText}>No character data available</Text>
        <Text style={SimpleCharacterCardStyles.debugText}>Characters in database: {allCharacters.length}</Text>
        <Text style={SimpleCharacterCardStyles.debugText}>Current Position: {currentPosition} (ID: {currentCharacterId})</Text>
        <Text style={SimpleCharacterCardStyles.debugText}>Error: {error || 'None'}</Text>
        <TouchableOpacity style={SimpleCharacterCardStyles.retryButton} onPress={async () => {
          if (databaseHelper) {
            await databaseHelper.clearDatabase();
          }
          await initializeApp();
        }}>
          <Text style={SimpleCharacterCardStyles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={SimpleCharacterCardStyles.backButton} onPress={handleBackToLanding}>
          <Text style={SimpleCharacterCardStyles.backButtonText}>Back to Landing</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[SimpleCharacterCardStyles.retryButton, { backgroundColor: '#e74c3c', marginTop: 10 }]} onPress={async () => {
          if (databaseHelper) {
            await databaseHelper.clearDatabase();
          }
          await initializeApp();
        }}>
          <Text style={SimpleCharacterCardStyles.retryButtonText}>Force Reset DB</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={CommonStyles.container}>
      {/* Header with Back Button */}
      <View style={SimpleCharacterCardStyles.header}>
        <TouchableOpacity style={SimpleCharacterCardStyles.backButton} onPress={handleBackToLanding}>
          <Text style={SimpleCharacterCardStyles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={SimpleCharacterCardStyles.headerTitleContainer}>
          <Text style={SimpleCharacterCardStyles.title}>Character Practice</Text>
          {currentUser && currentUser !== 'Guest' && (
            <Text style={SimpleCharacterCardStyles.userIndicator}>
              User: {currentUser} | Viewed: {userViewedCount}
            </Text>
          )}
        </View>
        <Text style={SimpleCharacterCardStyles.characterCounter}>
          {currentPosition} / {allCharacters.length}
        </Text>
      </View>

      {/* Character Navigation Ribbon - Top */}
      <CharacterNavigationRibbon
        characters={allCharacters}
        currentPosition={currentPosition}
        onCharacterSelect={loadCharacter}
        currentCharacter={currentCharacter}
        viewedCharacters={viewedCharacters}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>

            {/* Main Character Display */}
            <View style={SimpleCharacterCardStyles.characterContainer}>
              {/* Star indicator for viewed character */}
              {currentUser && currentUser !== 'Guest' && viewedCharacters.has(currentCharacterId) && (
                <View style={SimpleCharacterCardStyles.viewedStar}>
                  <Text style={SimpleCharacterCardStyles.starText}>★</Text>
                </View>
              )}
              {currentCharacter && (() => {
                // Extract all Chinese characters including duplicates (up to 6 max)
                const extractAllChineseCharacters = (text) => {
                  if (!text) return [];
                  const chineseRegex = /[一-鿿]/g;
                  const matches = text.match(chineseRegex);
                  return matches ? matches.slice(0, 6) : []; // Limit to 6 characters max
                };
                
                const characters = extractAllChineseCharacters(currentCharacter.character);
                const characterCount = characters.length;
                
                
                if (characterCount === 1) {
                  // Single character - full size
                  const isViewed = viewedCharacters.has(currentCharacterId);
                  return (
                    <TouchableOpacity
                      style={[
                        SimpleCharacterCardStyles.individualCharacter,
                        {
                          maxHeight: 200,
                          minHeight: 200,
                          width: 200,
                        }
                      ]}
                      onPress={() => handleCharacterClick(characters[0])}
                      activeOpacity={0.7}
                    >
                      <WebView
                        source={{ html: generateStaticHanziWriterHTML(characters[0], characterCount) }}
                        style={[SimpleCharacterCardStyles.hanziWriterContainer, { 
                          width: 200,
                          height: 200
                        }]}
                        scrollEnabled={false}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        onError={() => {
                          // WebView error, falling back to text
                        }}
                      />
                    </TouchableOpacity>
                  );
                } else {
                  // Multiple characters - dynamic sizing based on count
                  const containerSize = characterCount === 2 ? 120 : 75;
                  
                  if (characterCount === 2) {
                    // Two characters - display side by side with larger size
                    return (
                      <View style={SimpleCharacterCardStyles.characterRow}>
                        {characters.map((char, index) => {
                          const isViewed = viewedCharacters.has(currentCharacterId);
                          return (
                            <TouchableOpacity
                              key={index}
                              style={[
                                SimpleCharacterCardStyles.individualCharacter,
                                {
                                  maxHeight: containerSize,
                                  minHeight: containerSize,
                                  width: containerSize,
                                }
                              ]}
                              onPress={() => handleCharacterClick(char)}
                              activeOpacity={0.7}
                            >
                              <WebView
                                source={{ html: generateStaticHanziWriterHTML(char, characterCount) }}
                                style={[SimpleCharacterCardStyles.hanziWriterContainer, { 
                                  width: containerSize,
                                  height: containerSize
                                }]}
                                scrollEnabled={false}
                                showsVerticalScrollIndicator={false}
                                showsHorizontalScrollIndicator={false}
                                onError={() => {
                                  // WebView error, fallback handled by parent component
                                }}
                              />
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    );
                  } else {
                    // Three or more characters - 3x2 grid (up to 6 characters)
                    const maxCharacters = Math.min(characters.length, 6); // Limit to 6 characters max
                    const firstRow = characters.slice(0, 3);
                    const secondRow = characters.slice(3, 6);
                    
                    
                    return (
                      <View style={SimpleCharacterCardStyles.characterGrid}>
                        {/* First Row - up to 3 characters */}
                        <View style={SimpleCharacterCardStyles.characterRow}>
                          {firstRow.map((char, index) => {
                            const isViewed = viewedCharacters.has(currentCharacterId);
                            return (
                              <TouchableOpacity
                                key={`first-${index}`}
                                style={[
                                  SimpleCharacterCardStyles.individualCharacter,
                                  {
                                    maxHeight: containerSize,
                                    minHeight: containerSize,
                                    width: containerSize,
                                  }
                                ]}
                                onPress={() => handleCharacterClick(char)}
                                activeOpacity={0.7}
                              >
                                <WebView
                                  source={{ html: generateStaticHanziWriterHTML(char, characterCount) }}
                                  style={[SimpleCharacterCardStyles.hanziWriterContainer, { 
                                    width: containerSize,
                                    height: containerSize
                                  }]}
                                  scrollEnabled={false}
                                  showsVerticalScrollIndicator={false}
                                  showsHorizontalScrollIndicator={false}
                                  onError={() => {
                                    // WebView error, falling back to text
                                  }}
                                />
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      
                        {/* Second Row - characters 4-6 (if needed) */}
                        {secondRow.length > 0 && (
                          <View style={SimpleCharacterCardStyles.characterRow}>
                            {secondRow.map((char, index) => {
                              const isViewed = viewedCharacters.has(currentCharacterId);
                              return (
                                <TouchableOpacity
                                  key={`second-${index}`}
                                  style={[
                                    SimpleCharacterCardStyles.individualCharacter,
                                    {
                                      maxHeight: containerSize,
                                      minHeight: containerSize,
                                      width: containerSize,
                                    }
                                  ]}
                                  onPress={() => handleCharacterClick(char)}
                                  activeOpacity={0.7}
                                >
                                  <WebView
                                    source={{ html: generateStaticHanziWriterHTML(char, characterCount) }}
                                    style={[SimpleCharacterCardStyles.hanziWriterContainer, { 
                                      width: containerSize,
                                      height: containerSize
                                    }]}
                                    scrollEnabled={false}
                                    showsVerticalScrollIndicator={false}
                                    showsHorizontalScrollIndicator={false}
                                    onError={() => {
                                      // WebView error, falling back to text
                                    }}
                                  />
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        )}
                      </View>
                    );
                  }
                }
              })()}
        
        {/* Sound Button - Full width line button at bottom */}
        {currentCharacter && (
          <TouchableOpacity
            style={{
              backgroundColor: '#3498db',
              paddingVertical: 8,
              paddingHorizontal: 20,
              borderRadius: 8,
              marginTop: 15,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => handleCharacterSound()}
            activeOpacity={0.7}
          >
            <Text style={{
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 'bold',
            }}>Play Sound</Text>
          </TouchableOpacity>
        )}
      </View>


      {/* Stroke Practice Hint */}
      <Text style={SimpleCharacterCardStyles.strokePracticeHint}>Tap any character to practice strokes</Text>


      {/* Discovery Field */}
      <TouchableOpacity style={SimpleCharacterCardStyles.discoveryField} onPress={toggleDiscovery}>
        {showDiscovery ? (
          <View style={SimpleCharacterCardStyles.discoveryContent}>
            <Text style={SimpleCharacterCardStyles.pinyinText}>{currentCharacter.pinyin}</Text>
            <Text style={SimpleCharacterCardStyles.translationText}>{currentCharacter.englishTranslation}</Text>
            <Text style={SimpleCharacterCardStyles.translationText}>{currentCharacter.hebrewTranslation}</Text>
          </View>
        ) : (
          <Text style={SimpleCharacterCardStyles.discoveryButtonText}>Tap to reveal</Text>
        )}
      </TouchableOpacity>

      {/* Sentence Button */}
      <TouchableOpacity 
        style={{
          backgroundColor: '#3498db',
          paddingHorizontal: 40,
          paddingVertical: 15,
          borderRadius: 25,
          alignSelf: 'center',
          margin: 15,
        }}
        onPress={() => setShowSentencePopup(true)}
      >
        <Text style={{
          color: '#ffffff',
          fontSize: 20,
          fontWeight: 'bold',
        }}>...</Text>
      </TouchableOpacity>

      {/* Navigation Buttons - Circular arrows on sides */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          left: 20,
          bottom: '33%',
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: currentPosition <= 1 ? '#bdc3c7' : '#3498db',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
        onPress={handlePrevious}
        disabled={currentPosition <= 1}
        activeOpacity={0.7}
      >
        <Text style={{
          color: '#ffffff',
          fontSize: 28,
          fontWeight: '900',
        }}>‹</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={{
          position: 'absolute',
          right: 20,
          bottom: '33%',
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: currentPosition >= allCharacters.length ? '#bdc3c7' : '#3498db',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
        onPress={handleNext}
        disabled={currentPosition >= allCharacters.length}
        activeOpacity={0.7}
      >
        <Text style={{
          color: '#ffffff',
          fontSize: 28,
          fontWeight: '900',
        }}>›</Text>
      </TouchableOpacity>

      </ScrollView>

      {/* Sentence Popup */}
      <SentencePopup
        visible={showSentencePopup}
        onClose={() => setShowSentencePopup(false)}
        sentence={currentSentence}
      />

      {/* Interactive Stroke Practice Modal */}
      <InteractiveStrokePracticeModal
        visible={showStrokePractice}
        onClose={() => {
          setShowStrokePractice(false);
          setSelectedCharacterForStroke(null);
        }}
        character={selectedCharacterForStroke}
      />
    </View>
  );
};


export default SimpleCharacterCard;
