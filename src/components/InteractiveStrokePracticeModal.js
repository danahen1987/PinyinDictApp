import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { InteractiveStrokePracticeModalStyles } from '../styles/AppStyles';
import { getStrokeData, extractChineseCharacters } from '../data/strokeData';
import SimpleDrawingGrid from './SimpleDrawingGrid';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const InteractiveStrokePracticeModal = ({ visible, onClose, character }) => {
  // Always use drawing mode - guide mode removed
  const currentMode = 'drawing';
  const [strokeData, setStrokeData] = useState(null);
  const [availableCharacters, setAvailableCharacters] = useState([]);
  const [selectedChar, setSelectedChar] = useState(null);
  const [showGuide, setShowGuide] = useState(true);
  const [completedStrokes, setCompletedStrokes] = useState(0);
  const [overallAccuracy, setOverallAccuracy] = useState(0);

  // Extract individual characters from the input
  useEffect(() => {
    if (character) {
      const characters = extractChineseCharacters(character);
      setAvailableCharacters(characters);
      
      // If there are multiple characters, show the first one by default
      if (characters.length > 0) {
        const firstChar = characters[0];
        setSelectedChar(firstChar);
        const data = getStrokeData(firstChar);
        setStrokeData(data);
        setCompletedStrokes(0);
        setOverallAccuracy(0);
      }
    }
  }, [character]);

  // Handle character selection from multi-character entries
  const handleCharacterSelect = (selectedCharacter) => {
    setSelectedChar(selectedCharacter);
    const data = getStrokeData(selectedCharacter);
    setStrokeData(data);
    setCompletedStrokes(0);
    setOverallAccuracy(0);
  };

  // Handle stroke completion
  const handleStrokeComplete = (strokeIndex, accuracy) => {
    setCompletedStrokes(strokeIndex + 1);
  };

  // Handle all strokes completion
  const handleAllStrokesComplete = (accuracies) => {
    const averageAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
    setOverallAccuracy(Math.round(averageAccuracy));
    
    Alert.alert(
      '🎉 Practice Complete!',
      `Excellent work! You completed all strokes with ${Math.round(averageAccuracy)}% average accuracy.`,
      [
        { text: 'Practice Again', onPress: () => setCompletedStrokes(0) },
        { text: 'Close', onPress: onClose }
      ]
    );
  };

  // Character selector removed - direct to canvas

  // Mode selector removed - always use drawing mode

  // Instructions removed - direct to canvas

  if (!visible || !character) {
    return null;
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={InteractiveStrokePracticeModalStyles.centeredView}>
        <View style={InteractiveStrokePracticeModalStyles.modalView}>
          {/* Header */}
          <View style={InteractiveStrokePracticeModalStyles.header}>
            <Text style={InteractiveStrokePracticeModalStyles.modalTitle}>Interactive Stroke Practice</Text>
            <TouchableOpacity style={InteractiveStrokePracticeModalStyles.closeButton} onPress={onClose}>
              <Text style={InteractiveStrokePracticeModalStyles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* All text content removed - direct to canvas */}

        {/* Simple Drawing Grid */}
        {selectedChar && (
          <SimpleDrawingGrid
            character={selectedChar}
            strokeData={strokeData}
            onStrokeComplete={handleStrokeComplete}
            onAllStrokesComplete={handleAllStrokesComplete}
            showGuide={true}
            mode="drawing"
          />
        )}
        

          {/* Progress and Stats removed - not working properly */}

          {/* No stroke data message */}
          {!strokeData && availableCharacters.length > 0 && (
            <View style={InteractiveStrokePracticeModalStyles.noDataContainer}>
              <Text style={InteractiveStrokePracticeModalStyles.noDataText}>
                No stroke data available for this character
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};


export default InteractiveStrokePracticeModal;
