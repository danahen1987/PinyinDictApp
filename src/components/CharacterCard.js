import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { TTSService } from '../services/TTSService';
import { DatabaseInitializer } from '../database/DatabaseInitializer';
import { ProgressService } from '../services/ProgressService';
import { AuthService } from '../services/AuthService';
import { ErrorUtils } from '../utils/ErrorUtils';
import { FormatUtils } from '../utils/FormatUtils';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/AppConstants';
import StrokePractice from './StrokePractice';
import SentencePopup from './SentencePopup';
import TopNavigationRibbon from './TopNavigationRibbon';
import { Colors, CommonStyles, CharacterCardStyles } from '../styles/AppStyles';

const CharacterCard = ({ currentUser, onBackToLanding }) => {
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [currentSentence, setCurrentSentence] = useState(null);
  const [currentCharacterId, setCurrentCharacterId] = useState(1);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [showStrokePractice, setShowStrokePractice] = useState(false);
  const [showSentencePopup, setShowSentencePopup] = useState(false);
  const [ttsReady, setTtsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [databaseInitializer, setDatabaseInitializer] = useState(null);
  const [ttsService, setTtsService] = useState(null);
  const [progressService, setProgressService] = useState(null);
  const [allCharacters, setAllCharacters] = useState([]);
  const [completedCharacters, setCompletedCharacters] = useState([]);

  useEffect(() => {
    initializeApp();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      
      // Initialize database
      const dbInit = new DatabaseInitializer();
      setDatabaseInitializer(dbInit);
      
      const dbReady = await dbInit.initializeDatabase();
      if (!dbReady) {
        Alert.alert('Error', ERROR_MESSAGES.databaseInit);
        return;
      }

      // Initialize services
      const auth = new AuthService();
      const progress = new ProgressService(dbInit.getDatabaseHelper(), auth);
      setProgressService(progress);

      // Initialize TTS
      const tts = new TTSService({
        onTTSReady: () => {
          setTtsReady(true);
        },
        onTTSError: (error) => {
          const errorMsg = ErrorUtils.createUserFriendlyMessage(error);
          Alert.alert('TTS Error', errorMsg);
        },
        onSpeechStart: () => {
        },
        onSpeechDone: () => {
        },
      });
      setTtsService(tts);

      // Load all characters and user progress
      await loadAllCharacters();
      if (currentUser) {
        await loadUserProgress();
      }
      
      // Load first character
      await loadCharacter(1);
      
    } catch (error) {
      const errorMsg = ErrorUtils.createUserFriendlyMessage(error);
      Alert.alert('Error', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllCharacters = async () => {
    if (!databaseInitializer) return;

    try {
      const dbHelper = databaseInitializer.getDatabaseHelper();
      const characters = await dbHelper.getAllCharacters();
      const formattedCharacters = FormatUtils.formatCharacterList(characters);
      setAllCharacters(formattedCharacters);
    } catch (error) {
    }
  };

  const loadUserProgress = async () => {
    if (!progressService || !currentUser) return;

    try {
      const completed = await progressService.getCompletedCharacters();
      setCompletedCharacters(completed);
    } catch (error) {
    }
  };

  const loadCharacter = async (characterId) => {
    if (!databaseInitializer) return;

    try {
      const dbHelper = databaseInitializer.getDatabaseHelper();
      const character = await dbHelper.getCharacter(characterId);
      const sentence = await dbHelper.getSentenceByCharacterId(characterId);

      if (character) {
        const formattedCharacter = FormatUtils.formatCharacter(character);
        const formattedSentence = FormatUtils.formatSentence(sentence);
        
        setCurrentCharacter(formattedCharacter);
        setCurrentSentence(formattedSentence);
        setCurrentCharacterId(characterId);
        setShowDiscovery(false);
        
        // Update user progress (mark as accessed)
        if (progressService) {
          await progressService.updateProgress(characterId, false);
        }
      } else {
        Alert.alert('Error', ERROR_MESSAGES.characterLoad);
      }
    } catch (error) {
      const errorMsg = ErrorUtils.createUserFriendlyMessage(error);
      Alert.alert('Error', errorMsg);
    }
  };

  const handleSoundPress = async () => {
    if (!ttsService || !ttsReady || !currentCharacter) {
      Alert.alert('TTS Not Ready', 'Text-to-speech is not ready yet');
      return;
    }

    await ttsService.speakCharacter(currentCharacter.character);
  };

  const handleSentencePress = () => {
    if (!currentSentence) {
      Alert.alert('No Sentence', 'No sentence available for this character');
      return;
    }
    setShowSentencePopup(true);
  };

  const handleNext = () => {
    loadCharacter(currentCharacterId + 1);
  };

  const handlePrevious = () => {
    if (currentCharacterId > 1) {
      loadCharacter(currentCharacterId - 1);
    }
  };

  const toggleDiscovery = () => {
    setShowDiscovery(!showDiscovery);
  };

  const markCharacterCompleted = async () => {
    if (!progressService) return;

    try {
      const result = await progressService.markCharacterCompleted(currentCharacterId);
      
      if (result.success) {
        // Update local state
        if (!completedCharacters.includes(currentCharacterId)) {
          setCompletedCharacters([...completedCharacters, currentCharacterId]);
        }
        
        Alert.alert('Success', SUCCESS_MESSAGES.characterCompleted);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      const errorMsg = ErrorUtils.createUserFriendlyMessage(error);
      Alert.alert('Error', errorMsg);
    }
  };

  const handleCharacterSelect = (characterId) => {
    loadCharacter(characterId);
  };

  const handleBackToLanding = () => {
    if (onBackToLanding) {
      onBackToLanding();
    }
  };

  if (isLoading) {
    return (
      <View style={CommonStyles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={CommonStyles.loadingText}>Initializing Chinese Learning App...</Text>
      </View>
    );
  }

  if (!currentCharacter) {
    return (
      <View style={CommonStyles.errorContainer}>
        <Text style={CommonStyles.errorText}>No character data available</Text>
      </View>
    );
  }

  return (
    <View style={CommonStyles.container}>
      {/* Top Navigation Ribbon */}
      {allCharacters.length > 0 && (
        <TopNavigationRibbon
          characters={allCharacters}
          currentCharacterId={currentCharacterId}
          onCharacterSelect={handleCharacterSelect}
          completedCharacters={completedCharacters}
        />
      )}

      {/* Header with Back Button and Progress */}
      <View style={CommonStyles.header}>
        <TouchableOpacity style={CharacterCardStyles.backButton} onPress={handleBackToLanding}>
          <Text style={CharacterCardStyles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={CharacterCardStyles.progressIndicator}>
          <Text style={CharacterCardStyles.progressText}>
            {completedCharacters.includes(currentCharacterId) ? '★' : '☆'}
          </Text>
        </View>
        {currentUser && (
          <TouchableOpacity style={CharacterCardStyles.completeButton} onPress={markCharacterCompleted}>
            <Text style={CharacterCardStyles.completeButtonText}>Mark Complete</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Character Display */}
      <TouchableOpacity 
        style={CharacterCardStyles.characterContainer} 
        onPress={() => setShowStrokePractice(true)}
      >
        <Text style={CharacterCardStyles.characterText}>{currentCharacter.character}</Text>
        <Text style={CharacterCardStyles.strokeHintText}>Tap for stroke practice</Text>
      </TouchableOpacity>

      {/* Sound Button */}
      <TouchableOpacity
        style={[CharacterCardStyles.soundButton, !ttsReady && CommonStyles.disabledButton]}
        onPress={handleSoundPress}
        disabled={!ttsReady}
      >
        <Text style={CharacterCardStyles.soundButtonText}>🔊</Text>
      </TouchableOpacity>

      {/* Discovery Field */}
      <TouchableOpacity style={CommonStyles.discoveryField} onPress={toggleDiscovery}>
        {showDiscovery ? (
          <View style={CommonStyles.discoveryContent}>
            <Text style={CommonStyles.pinyinText}>{currentCharacter.pinyin}</Text>
            <Text style={CommonStyles.translationText}>{currentCharacter.englishTranslation}</Text>
            <Text style={CommonStyles.translationText}>{currentCharacter.hebrewTranslation}</Text>
          </View>
        ) : (
          <Text style={CommonStyles.discoveryButtonText}>?</Text>
        )}
      </TouchableOpacity>

      {/* Sentence Button */}
      {currentSentence && (
        <TouchableOpacity
          style={CharacterCardStyles.sentenceButton}
          onPress={handleSentencePress}
        >
          <Text style={CharacterCardStyles.sentenceButtonText}>Sentence</Text>
        </TouchableOpacity>
      )}

      {/* Navigation Buttons */}
      <View style={CommonStyles.navigationContainer}>
        <TouchableOpacity
          style={[CommonStyles.navButton, currentCharacterId <= 1 && CommonStyles.disabledButton]}
          onPress={handlePrevious}
          disabled={currentCharacterId <= 1}
        >
          <Text style={CommonStyles.navButtonText}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity style={CommonStyles.navButton} onPress={handleNext}>
          <Text style={CommonStyles.navButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* Stroke Practice Modal */}
      <StrokePractice
        visible={showStrokePractice}
        character={currentCharacter?.character}
        onClose={() => setShowStrokePractice(false)}
      />

      {/* Sentence Popup Modal */}
      <SentencePopup
        visible={showSentencePopup}
        sentence={currentSentence}
        onClose={() => setShowSentencePopup(false)}
        ttsService={ttsService}
        ttsReady={ttsReady}
      />
    </View>
  );
};

export default CharacterCard;
