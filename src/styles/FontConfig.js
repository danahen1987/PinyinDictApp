import { Platform } from 'react-native';

// Simple font configuration for Chinese characters
export const FontConfig = {
  // System fonts that support Chinese characters (most compatible)
  chineseSystem: {
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'PingFang SC',
    fontWeight: 'normal',
    fontStyle: 'normal',
  },
  
  // Alternative system fonts for Chinese
  chineseSerif: {
    fontFamily: Platform.OS === 'android' ? 'serif' : 'Times New Roman',
    fontWeight: 'normal',
    fontStyle: 'normal',
  },
  
  // Monospace font for Chinese
  chineseMono: {
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Menlo',
    fontWeight: 'normal',
    fontStyle: 'normal',
  },
};
