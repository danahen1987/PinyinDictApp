import Tts from 'react-native-tts';

class TTSService {
  constructor() {
    this.isInitialized = false;
    this.isSpeaking = false;
    this.init();
  }

  // Initialize TTS with Chinese language support
  async init() {
    if (this.isInitialized) return;

    try {
      // Wait for TTS to be ready
      await Tts.getInitStatus();
      
      // Set default language to Chinese (Simplified)
      await Tts.setDefaultLanguage('zh-CN');
      
      // Set speech rate (0.1 to 0.9 for slower, 1.0+ for faster)
      await Tts.setDefaultRate(0.4); // Much slower for better pronunciation and learning
      
      // Set pitch (0.5 to 2.0)
      await Tts.setDefaultPitch(1.0);
      
      // Add event listeners
      Tts.addEventListener('tts-start', this.onTtsStart.bind(this));
      Tts.addEventListener('tts-finish', this.onTtsFinish.bind(this));
      Tts.addEventListener('tts-cancel', this.onTtsCancel.bind(this));
      Tts.addEventListener('tts-error', this.onTtsError.bind(this));

      this.isInitialized = true;
      console.log('✅ TTS Service initialized successfully');
    } catch (error) {
      console.error('❌ TTS Service initialization failed:', error);
      // Try fallback initialization
      this.fallbackInit();
    }
  }

  // Fallback initialization for Android compatibility
  fallbackInit() {
    try {
      console.log('🔄 Attempting fallback TTS initialization...');
      
      // Set basic defaults without async/await
      Tts.setDefaultLanguage('zh-CN');
      Tts.setDefaultRate(0.4);
      Tts.setDefaultPitch(1.0);
      
      // Add event listeners
      Tts.addEventListener('tts-start', this.onTtsStart.bind(this));
      Tts.addEventListener('tts-finish', this.onTtsFinish.bind(this));
      Tts.addEventListener('tts-cancel', this.onTtsCancel.bind(this));
      Tts.addEventListener('tts-error', this.onTtsError.bind(this));

      this.isInitialized = true;
      console.log('✅ TTS Service fallback initialization successful');
    } catch (error) {
      console.error('❌ TTS Service fallback initialization failed:', error);
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
      console.warn('⚠️ TTS is not ready yet, attempting fallback initialization...');
      this.fallbackInit();
      if (!this.isInitialized) {
        console.warn('⚠️ TTS still not ready, skipping speech');
        return;
      }
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

      console.log('🔊 Speaking:', text, 'with options:', speakOptions);
      Tts.speak(text, speakOptions);
    } catch (error) {
      console.error('❌ TTS speak error:', error);
      // Try fallback speak without options
      try {
        console.log('🔄 Attempting fallback speak...');
        Tts.speak(text);
      } catch (fallbackError) {
        console.error('❌ TTS fallback speak error:', fallbackError);
      }
    }
  }

  // Speak individual character
  speakCharacter(character) {
    if (!character) return;
    
    console.log('🔊 Speaking character:', character);
    
    // For individual characters, use much slower rate for clarity
    this.speak(character, {
      rate: 0.3,
      pitch: 1.0
    });
  }

  // Speak sentence
  speakSentence(sentence) {
    if (!sentence) return;
    
    console.log('🔊 Speaking sentence:', sentence);
    
    // For sentences, use much slower rate for better learning and comprehension
    this.speak(sentence, {
      rate: 0.25, // Much slower for sentences
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
