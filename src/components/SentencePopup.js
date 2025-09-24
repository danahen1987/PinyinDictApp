import React from 'react';
import { View, Text, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { SentencePopupStyles } from '../styles/AppStyles';
import ttsService from '../services/TTSService';

const { width, height } = Dimensions.get('window');

const SentencePopup = ({ visible, onClose, sentence }) => {
  if (!sentence) return null;

  // Handle sentence sound pronunciation
  const handleSentenceSound = () => {
    if (sentence && sentence.sentence) {
      ttsService.speakSentence(sentence.sentence);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={SentencePopupStyles.centeredView}>
        <View style={SentencePopupStyles.modalView}>
          {/* Close Button positioned in top right corner */}
          <TouchableOpacity style={SentencePopupStyles.closeButtonTopRight} onPress={onClose}>
            <Text style={SentencePopupStyles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          {/* Content */}
          <View style={SentencePopupStyles.content}>
            {/* Chinese Sentence */}
            <View style={SentencePopupStyles.sentenceSection}>
              <Text style={SentencePopupStyles.sentenceText}>{sentence.sentence}</Text>
            </View>

            {/* Pinyin */}
            <View style={SentencePopupStyles.sentenceSection}>
              <Text style={SentencePopupStyles.sentencePinyin}>{sentence.sentencePinyin}</Text>
            </View>

            {/* English Translation */}
            <View style={SentencePopupStyles.sentenceSection}>
              <Text style={SentencePopupStyles.sentenceTranslation}>{sentence.sentenceEnglishTranslation}</Text>
            </View>

            {/* Hebrew Translation */}
            <View style={SentencePopupStyles.sentenceSection}>
              <Text style={SentencePopupStyles.sentenceTranslation}>{sentence.sentenceHebrewTranslation}</Text>
            </View>
          </View>

          {/* Sound Button - Full width line button */}
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
            onPress={handleSentenceSound}
            activeOpacity={0.7}
          >
            <Text style={{
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 'bold',
            }}>Play Sound</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};


export default SentencePopup;