import React from 'react';
import { Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, MaterialIconStyles } from '../styles/AppStyles';

const MaterialIcon = ({ 
  name, 
  size = 24, 
  color = Colors.primary, 
  style, 
  onPress,
  ...props 
}) => {
  // Fallback to emoji icons if vector icons don't work
  const getEmojiIcon = (iconName) => {
    const iconMap = {
      'visibility': '👁️',
      'visibility-off': '🙈',
      'person': '👤',
      'email': '📧',
      'lock': '🔒',
      'home': '🏠',
      'menu': '☰',
      'close': '✕',
      'check': '✓',
      'arrow-back': '←',
      'arrow-forward': '→',
    };
    return iconMap[iconName] || '?';
  };

  try {
    return (
      <Icon
        name={name}
        size={size}
        color={color}
        style={style}
        {...props}
      />
    );
  } catch (error) {
    // Fallback to emoji if vector icon fails
    return (
      <Text style={[MaterialIconStyles.emojiIcon, { fontSize: size, color }, style]}>
        {getEmojiIcon(name)}
      </Text>
    );
  }
};

export default MaterialIcon;