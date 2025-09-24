import Tts from 'react-native-tts';

class TTSService {
  constructor() {
    this.isInitialized = false;
    this.isSpeaking = false;
    this.init();
  }

  // Initialize TTS with Chinese language support
  init() {
    if (this.isInitialized) return;

    try {
      // Set default language to Chinese (Simplified)
      Tts.setDefaultLanguage('zh-CN');
      
      // Set speech rate (0.1 to 0.9 for slower, 1.0+ for faster)
      Tts.setDefaultRate(0.4); // Much slower for better pronunciation and learning
      
      // Set pitch (0.5 to 2.0)
      Tts.setDefaultPitch(1.0);
      
      // Add event listeners
      Tts.addEventListener('tts-start', this.onTtsStart.bind(this));
      Tts.addEventListener('tts-finish', this.onTtsFinish.bind(this));
      Tts.addEventListener('tts-cancel', this.onTtsCancel.bind(this));
      Tts.addEventListener('tts-error', this.onTtsError.bind(this));

      this.isInitialized = true;
    } catch (error) {
      console.error('❌ TTS Service initialization failed:', error);
    }
  }

  // Event handlers
  onTtsStart = (event) => {
    this.isSpeaking = true;
  };

  onTtsFinish = (event) => {
    this.isSpeaking = false;
  };

  onTtsCancel = (event) => {
    this.isSpeaking = false;
  };

  onTtsError = (event) => {
    this.isSpeaking = false;
    console.error('❌ TTS error:', event);
  };

  // Speak Chinese text
  speak(text, options = {}) {
    if (!text || typeof text !== 'string') {
      console.warn('⚠️ Invalid text provided to TTS');
      return;
    }

    // Check if TTS is ready before speaking
    if (!this.isInitialized) {
      console.warn('⚠️ TTS is not ready yet, skipping speech');
      return;
    }

    // Stop any current speech
    this.stop();

    try {
      const speakOptions = {
        language: options.language || 'zh-CN',
        rate: options.rate || 0.6,
        pitch: options.pitch || 1.0,
        ...options
      };

      Tts.speak(text, speakOptions);
    } catch (error) {
      console.error('❌ TTS speak error:', error);
    }
  }

  // Speak individual character
  speakCharacter(character) {
    if (!character) return;
    
    // Check if TTS is ready before speaking
    if (!this.isInitialized) {
      console.warn('⚠️ TTS is not ready yet, skipping speech');
      return;
    }
    
    // For individual characters, use much slower rate for clarity
    this.speak(character, {
      rate: 0.3,
      pitch: 1.0
    });
  }

  // Speak sentence
  speakSentence(sentence) {
    if (!sentence) return;
    
    // Check if TTS is ready before speaking
    if (!this.isInitialized) {
      console.warn('⚠️ TTS is not ready yet, skipping speech');
      return;
    }
    
    // For sentences, use slower rate for better learning
    this.speak(sentence, {
      rate: 0.4,
      pitch: 1.0
    });
  }

  // Stop current speech
  stop() {
    try {
      Tts.stop();
      this.isSpeaking = false;
    } catch (error) {
      console.error('❌ TTS stop error:', error);
    }
  }

  // Check if currently speaking
  getIsSpeaking() {
    return this.isSpeaking;
  }

  // Check if TTS is ready
  isReady() {
    return this.isInitialized;
  }

  // Get available voices (for debugging)
  async getVoices() {
    try {
      const voices = await Tts.voices();
      return voices;
    } catch (error) {
      console.error('❌ Error getting voices:', error);
      return [];
    }
  }

  // Set specific voice (if available)
  setVoice(voiceId) {
    try {
      Tts.setDefaultVoice(voiceId);
    } catch (error) {
      console.error('❌ Error setting voice:', error);
    }
  }

  // Cleanup
  destroy() {
    try {
      Tts.removeEventListener('tts-start', this.onTtsStart);
      Tts.removeEventListener('tts-finish', this.onTtsFinish);
      Tts.removeEventListener('tts-cancel', this.onTtsCancel);
      Tts.removeEventListener('tts-error', this.onTtsError);
      this.stop();
      this.isInitialized = false;
    } catch (error) {
      console.error('❌ TTS cleanup error:', error);
    }
  }
}

// Create singleton instance
const ttsService = new TTSService();

export default ttsService;
