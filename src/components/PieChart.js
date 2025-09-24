import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

const PieChart = ({ percentage, size = 60, strokeWidth = 6 }) => {
  const radius = (size - strokeWidth) / 2;
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Calculate the angle for the percentage (0% = 0°, 100% = 360°)
  const angle = (percentage / 100) * 360;
  
  // Convert angle to radians
  const angleRad = (angle * Math.PI) / 180;
  
  // Calculate the end point of the arc
  const endX = centerX + radius * Math.sin(angleRad);
  const endY = centerY - radius * Math.cos(angleRad);
  
  // Create the path for the pie slice
  const createPieSlice = () => {
    if (percentage === 0) {
      return '';
    }
    
    if (percentage === 100) {
      // Full circle
      return `M ${centerX} ${centerY} m -${radius} 0 a ${radius} ${radius} 0 1 1 ${radius * 2} 0 a ${radius} ${radius} 0 1 1 -${radius * 2} 0 Z`;
    }
    
    // Partial pie slice
    const largeArcFlag = angle > 180 ? 1 : 0;
    return `M ${centerX} ${centerY} L ${centerX} ${centerY - radius} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
  };

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* Background circle */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius}
          stroke="#ffffff"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress pie slice */}
        <Path
          d={createPieSlice()}
          fill="#3498db"
          stroke="none"
        />
      </Svg>
      {/* Percentage text */}
      <Text style={{
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2c3e50',
        textAlign: 'center',
      }}>
        {percentage}%
      </Text>
    </View>
  );
};

export default PieChart;
