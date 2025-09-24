import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { CommonStyles, StrokePracticeStyles } from '../styles/AppStyles';

const StrokePractice = ({ visible, character, onClose }) => {
  const [currentStroke, setCurrentStroke] = useState(0);
  const [showStrokeOrder, setShowStrokeOrder] = useState(false);

  // Sample stroke data - in a real app, this would come from a stroke database
  const getStrokeData = (char) => {
    const strokeData = {
      '了': {
        strokes: [
          { path: 'M50,50 L50,100 L100,100', description: 'Horizontal line' },
          { path: 'M75,50 L75,100', description: 'Vertical line' },
        ],
        totalStrokes: 2,
      },
      '上': {
        strokes: [
          { path: 'M50,30 L50,80', description: 'Vertical line' },
          { path: 'M30,50 L70,50', description: 'Horizontal line' },
          { path: 'M50,80 L50,120', description: 'Long vertical line' },
        ],
        totalStrokes: 3,
      },
      '大': {
        strokes: [
          { path: 'M50,30 L50,100', description: 'Vertical line' },
          { path: 'M30,65 L70,65', description: 'Horizontal line' },
          { path: 'M30,100 L70,100', description: 'Bottom horizontal line' },
        ],
        totalStrokes: 3,
      },
      '中': {
        strokes: [
          { path: 'M50,30 L50,100', description: 'Vertical line' },
          { path: 'M30,50 L70,50', description: 'Top horizontal line' },
          { path: 'M30,80 L70,80', description: 'Bottom horizontal line' },
          { path: 'M50,100 L50,120', description: 'Bottom vertical line' },
        ],
        totalStrokes: 4,
      },
      '下': {
        strokes: [
          { path: 'M50,30 L50,80', description: 'Vertical line' },
          { path: 'M30,50 L70,50', description: 'Horizontal line' },
          { path: 'M50,100 L50,120', description: 'Bottom vertical line' },
        ],
        totalStrokes: 3,
      },
    };

    return strokeData[char] || {
      strokes: [
        { path: 'M50,50 L50,100', description: 'Sample stroke' },
      ],
      totalStrokes: 1,
    };
  };

  const strokeData = character ? getStrokeData(character) : null;

  useEffect(() => {
    if (visible) {
      setCurrentStroke(0);
      setShowStrokeOrder(false);
    }
  }, [visible, character]);

  const handleNextStroke = () => {
    if (strokeData && currentStroke < strokeData.totalStrokes - 1) {
      setCurrentStroke(currentStroke + 1);
    }
  };

  const handlePreviousStroke = () => {
    if (currentStroke > 0) {
      setCurrentStroke(currentStroke - 1);
    }
  };

  const handleShowAllStrokes = () => {
    setShowStrokeOrder(!showStrokeOrder);
  };

  const handleReset = () => {
    setCurrentStroke(0);
    setShowStrokeOrder(false);
  };

  if (!visible || !character || !strokeData) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={CommonStyles.modalOverlay}>
        <View style={CommonStyles.modalContent}>
          {/* Header */}
          <View style={CommonStyles.header}>
            <Text style={CommonStyles.headerTitle}>Stroke Practice: {character}</Text>
            <TouchableOpacity style={CommonStyles.closeButton} onPress={onClose}>
              <Text style={CommonStyles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Character Display */}
          <View style={StrokePracticeStyles.characterContainer}>
            <Text style={StrokePracticeStyles.characterText}>{character}</Text>
          </View>

          {/* Stroke Practice Area */}
          <View style={StrokePracticeStyles.strokeContainer}>
            <View style={StrokePracticeStyles.strokeArea}>
              {/* This would be replaced with actual SVG stroke rendering */}
              <Text style={StrokePracticeStyles.strokeText}>
                Stroke {currentStroke + 1} of {strokeData.totalStrokes}
              </Text>
              <Text style={StrokePracticeStyles.strokeDescription}>
                {strokeData.strokes[currentStroke]?.description || 'Practice this stroke'}
              </Text>
              
              {/* Visual stroke representation */}
              <View style={StrokePracticeStyles.strokeVisual}>
                <Text style={StrokePracticeStyles.strokeVisualText}>
                  {showStrokeOrder ? 'All Strokes' : `Stroke ${currentStroke + 1}`}
                </Text>
              </View>
            </View>
          </View>

          {/* Controls */}
          <View style={StrokePracticeStyles.controlsContainer}>
            <TouchableOpacity
              style={[StrokePracticeStyles.controlButton, currentStroke === 0 && CommonStyles.disabledButton]}
              onPress={handlePreviousStroke}
              disabled={currentStroke === 0}
            >
              <Text style={StrokePracticeStyles.controlButtonText}>Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity style={StrokePracticeStyles.controlButton} onPress={handleShowAllStrokes}>
              <Text style={StrokePracticeStyles.controlButtonText}>
                {showStrokeOrder ? 'Hide All' : 'Show All'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[StrokePracticeStyles.controlButton, currentStroke >= strokeData.totalStrokes - 1 && CommonStyles.disabledButton]}
              onPress={handleNextStroke}
              disabled={currentStroke >= strokeData.totalStrokes - 1}
            >
              <Text style={StrokePracticeStyles.controlButtonText}>Next</Text>
            </TouchableOpacity>
          </View>

          {/* Progress Indicator */}
          <View style={CommonStyles.progressContainer}>
            <Text style={CommonStyles.progressText}>
              Progress: {currentStroke + 1}/{strokeData.totalStrokes}
            </Text>
            <View style={CommonStyles.progressBar}>
              <View 
                style={[
                  CommonStyles.progressFill, 
                  { width: `${((currentStroke + 1) / strokeData.totalStrokes) * 100}%` }
                ]} 
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={CommonStyles.actionContainer}>
            <TouchableOpacity style={CommonStyles.actionButton} onPress={handleReset}>
              <Text style={CommonStyles.actionButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={CommonStyles.actionButton} onPress={onClose}>
              <Text style={CommonStyles.actionButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default StrokePractice;
