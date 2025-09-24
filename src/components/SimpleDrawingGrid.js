import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Dimensions,
  PanResponder,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { SimpleDrawingGridStyles } from '../styles/AppStyles';
import { WebView } from 'react-native-webview';
import { FreeDrawingStyles } from '../styles/AppStyles';
import { strokeData as importedStrokeData } from '../data/strokeData';

const { width: screenWidth } = Dimensions.get('window');

const SimpleDrawingGrid = ({ 
  character, 
  strokeData, 
  onStrokeComplete, 
  onAllStrokesComplete,
  showGuide = true,
  mode = 'guided' // 'guided' or 'free'
}) => {
  const [currentStroke, setCurrentStroke] = useState(0);
  const [userPaths, setUserPaths] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [strokeAccuracy, setStrokeAccuracy] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatedStrokes, setAnimatedStrokes] = useState([]);
  const [webViewLoaded, setWebViewLoaded] = useState(false);
  
  // Free drawing states
  const [freeDrawingPaths, setFreeDrawingPaths] = useState([]);
  const [currentFreePath, setCurrentFreePath] = useState([]);
  const currentFreePathRef = useRef([]);
  
  const gridSize = 300;
  const cellSize = gridSize / 9; // 9x9 grid
  const animationRef = useRef(null);

  // Create smooth connected line segments between points
  const createLineSegments = (points) => {
    if (!points || points.length < 2) return [];
    
    const segments = [];
    const strokeWidth = FreeDrawingStyles.strokeWidth;
    
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];
      
      // Calculate distance and angle
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      
      // Create a line segment that connects the two points
      // Position the line to start exactly at the start point
      segments.push({
        key: `segment-${i}`,
        left: start.x,
        top: start.y - strokeWidth / 2,
        width: length,
        height: strokeWidth,
        transform: [{ rotate: `${angle}deg` }],
        transformOrigin: '0 50%',
      });
    }
    
    return segments;
  };

  // Create a smooth path using overlapping circles for better connection
  const createSmoothPath = (points) => {
    if (!points || points.length < 2) return [];
    
    const pathElements = [];
    const strokeWidth = FreeDrawingStyles.strokeWidth;
    const radius = strokeWidth / 2;
    
    // Create circles at each point for smooth connection
    points.forEach((point, index) => {
      pathElements.push({
        key: `circle-${index}`,
        left: point.x - radius,
        top: point.y - radius,
        width: strokeWidth,
        height: strokeWidth,
        borderRadius: radius,
      });
    });
    
    // Create connecting lines between points
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];
      
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      
      pathElements.push({
        key: `line-${i}`,
        left: start.x,
        top: start.y - radius,
        width: length,
        height: strokeWidth,
        transform: [{ rotate: `${angle}deg` }],
        transformOrigin: '0 50%',
      });
    }
    
    return pathElements;
  };

  // Generate comprehensive stroke patterns for Chinese characters
  const generateStrokePattern = (strokeIndex, totalStrokes) => {
    if (!character) return [];
    
    // Comprehensive stroke patterns for common Chinese characters
    const patterns = {
      // Basic strokes
      '一': [[1, 4.5], [8, 4.5]], // Horizontal line
      '丨': [[4.5, 1], [4.5, 8]], // Vertical line
      '丿': [[4.5, 1], [1, 8]], // Left diagonal
      '丶': [[4.5, 1], [4.5, 3]], // Dot
      '乀': [[1, 4.5], [8, 4.5]], // Right horizontal
      '乚': [[4.5, 1], [4.5, 6], [1, 8]], // Hook
      '亅': [[4.5, 1], [4.5, 6], [8, 8]], // Right hook
      
      // Common characters with multiple strokes
      '人': [
        [[4.5, 1], [2, 6]], // Left stroke
        [[4.5, 1], [7, 6]]  // Right stroke
      ],
      '大': [
        [[4.5, 1], [4.5, 6]], // Vertical
        [[2, 4], [7, 4]], // Horizontal
        [[4.5, 6], [2, 8]], // Left diagonal
        [[4.5, 6], [7, 8]]  // Right diagonal
      ],
      '小': [
        [[4.5, 1], [4.5, 4]], // Vertical
        [[2, 6], [4.5, 4]], // Left diagonal
        [[7, 6], [4.5, 4]]  // Right diagonal
      ],
      '中': [
        [[4.5, 1], [4.5, 8]], // Vertical
        [[1, 4.5], [8, 4.5]], // Horizontal
        [[1, 1], [8, 1]], // Top horizontal
        [[1, 8], [8, 8]]  // Bottom horizontal
      ],
      '国': [
        [[1, 1], [8, 1]], // Top
        [[8, 1], [8, 8]], // Right
        [[8, 8], [1, 8]], // Bottom
        [[1, 8], [1, 1]], // Left
        [[4.5, 1], [4.5, 8]], // Vertical
        [[1, 4.5], [8, 4.5]]  // Horizontal
      ],
      '学': [
        [[4.5, 1], [4.5, 3]], // Top vertical
        [[2, 3], [7, 3]], // Top horizontal
        [[4.5, 3], [4.5, 6]], // Main vertical
        [[2, 6], [7, 6]], // Middle horizontal
        [[4.5, 6], [4.5, 8]], // Bottom vertical
        [[1, 8], [8, 8]]  // Bottom horizontal
      ],
      '生': [
        [[4.5, 1], [4.5, 8]], // Vertical
        [[1, 3], [8, 3]], // Top horizontal
        [[1, 5], [8, 5]], // Middle horizontal
        [[1, 7], [8, 7]]  // Bottom horizontal
      ],
      '了': [
        [[4.5, 1], [4.5, 6]], // Vertical
        [[4.5, 6], [2, 8]]  // Hook
      ],
      '不': [
        [[4.5, 1], [4.5, 8]], // Vertical
        [[1, 3], [8, 3]], // Top horizontal
        [[2, 5], [7, 5]], // Middle horizontal
        [[4.5, 5], [4.5, 8]]  // Bottom vertical
      ],
      '有': [
        [[1, 1], [8, 1]], // Top horizontal
        [[4.5, 1], [4.5, 8]], // Vertical
        [[1, 4], [8, 4]], // Middle horizontal
        [[1, 6], [8, 6]]  // Bottom horizontal
      ]
    };

    // Default pattern for unknown characters
    const defaultPatterns = [
      [[1, 4.5], [8, 4.5]], // Horizontal
      [[4.5, 1], [4.5, 8]], // Vertical
      [[1, 1], [8, 8]], // Diagonal
      [[8, 1], [1, 8]], // Reverse diagonal
    ];

    const charPatterns = patterns[character] || defaultPatterns;
    return charPatterns[strokeIndex % charPatterns.length] || defaultPatterns[0];
  };

  // Convert screen coordinates to grid coordinates
  const screenToGrid = (x, y) => {
    return {
      x: (x / gridSize) * 9,
      y: (y / gridSize) * 9
    };
  };

  // Convert grid coordinates to screen coordinates
  const gridToScreen = (gridX, gridY) => {
    return {
      x: (gridX / 9) * gridSize,
      y: (gridY / 9) * gridSize
    };
  };

  // Calculate stroke accuracy (simplified)
  const calculateAccuracy = (userPath, targetPath) => {
    if (userPath.length < 2 || targetPath.length < 2) return 0;
    
    // Simple accuracy calculation based on path similarity
    const userLength = userPath.length;
    const targetLength = targetPath.length;
    const lengthDiff = Math.abs(userLength - targetLength);
    const accuracy = Math.max(0, 100 - (lengthDiff / Math.max(userLength, targetLength)) * 100);
    return Math.round(accuracy);
  };

  // Use ref to track current mode to avoid closure issues
  const modeRef = useRef(mode);
  modeRef.current = mode;

  // Reset webViewLoaded when mode or character changes
  useEffect(() => {
    setWebViewLoaded(false);
  }, [mode, character]);

  // Simple PanResponder for free drawing only
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        return true;
      },
      onStartShouldSetPanResponderCapture: () => {
        return true;
      },
      onMoveShouldSetPanResponder: () => {
        return true;
      },
      onMoveShouldSetPanResponderCapture: () => {
        return true;
      },
      onShouldBlockNativeResponder: () => {
        return true; // Block native responder to ensure we handle all touches
      },
      onPanResponderGrant: (evt) => {
        if (modeRef.current !== 'free' && modeRef.current !== 'drawing') {
          return;
        }
        
        // Get coordinates with fallback
        let x = evt.nativeEvent.locationX;
        let y = evt.nativeEvent.locationY;
        
        // If locationX/Y are invalid, try pageX/Y and subtract offset
        if (x === undefined || y === undefined || x < 0 || y < 0) {
          x = evt.nativeEvent.pageX - evt.nativeEvent.target.offsetLeft;
          y = evt.nativeEvent.pageY - evt.nativeEvent.target.offsetTop;
        }
        
        // Final validation - reject if still invalid
        if (x === undefined || y === undefined || isNaN(x) || isNaN(y)) {
          return;
        }
        
        // Clamp coordinates to canvas bounds
        const clampedX = Math.max(0, Math.min(300, x));
        const clampedY = Math.max(0, Math.min(300, y));
        
        // Cosmetic fix: Block rendering in the top-left corner (common WebView interference area)
        if (clampedX < 10 && clampedY < 10) {
          return;
        }
        
        // Start a new stroke - always create a fresh path
        const newPath = [{ x: clampedX, y: clampedY }];
        currentFreePathRef.current = newPath;
        setCurrentFreePath(newPath);
      },
      onPanResponderMove: (evt) => {
        if (modeRef.current !== 'free' && modeRef.current !== 'drawing') {
          return;
        }
        
        // Get coordinates with fallback
        let x = evt.nativeEvent.locationX;
        let y = evt.nativeEvent.locationY;
        
        // If locationX/Y are invalid, try pageX/Y and subtract offset
        if (x === undefined || y === undefined || x < 0 || y < 0) {
          x = evt.nativeEvent.pageX - evt.nativeEvent.target.offsetLeft;
          y = evt.nativeEvent.pageY - evt.nativeEvent.target.offsetTop;
        }
        
        // Final validation - reject if still invalid
        if (x === undefined || y === undefined || isNaN(x) || isNaN(y)) {
          return;
        }
        
        // Clamp coordinates to canvas bounds
        const clampedX = Math.max(0, Math.min(300, x));
        const clampedY = Math.max(0, Math.min(300, y));
        
        // Cosmetic fix: Block rendering in the top-left corner (common WebView interference area)
        if (clampedX < 10 && clampedY < 10) {
          return;
        }
        
        // Filter out extreme coordinate jumps (likely touch event errors)
        // Only apply jump detection within the same stroke, not between strokes
        const currentPath = currentFreePathRef.current;
        if (currentPath.length > 0) {
          const lastPoint = currentPath[currentPath.length - 1];
          const distance = Math.sqrt(
            Math.pow(clampedX - lastPoint.x, 2) + Math.pow(clampedY - lastPoint.y, 2)
          );
          
          // If the distance is too large (more than 30 pixels), skip this point
          // This only applies within the same stroke, not between different strokes
          if (distance > 30) {
            return;
          }
        }
        
        const newPath = [...currentFreePathRef.current, { x: clampedX, y: clampedY }];
        currentFreePathRef.current = newPath;
        setCurrentFreePath(newPath);
      },
      onPanResponderRelease: () => {
        if (modeRef.current !== 'free' && modeRef.current !== 'drawing') {
          return;
        }
        
        // Get the current path data before clearing it
        const pathToSave = [...currentFreePathRef.current];
        
        // Save any path with at least 1 point (even single taps)
        if (pathToSave.length > 0) {
          setFreeDrawingPaths(prev => [...prev, pathToSave]);
        }
        
        // Clear the current path
        currentFreePathRef.current = [];
        setCurrentFreePath([]);
      },
      onPanResponderTerminate: () => {
        // Handle case where touch is terminated unexpectedly
        if (modeRef.current !== 'free' && modeRef.current !== 'drawing') {
          return;
        }
        
        // Get the current path data before clearing it
        const pathToSave = [...currentFreePathRef.current];
        
        // Save any path with at least 1 point (even single taps)
        if (pathToSave.length > 0) {
          setFreeDrawingPaths(prev => [...prev, pathToSave]);
        }
        
        // Clear the current path
        currentFreePathRef.current = [];
        setCurrentFreePath([]);
      },
    })
  ).current;

  // Animate stroke order
  const animateStrokeOrder = () => {
    if (!strokeData || isAnimating) return;
    
    
    setIsAnimating(true);
    setAnimatedStrokes([]);
    setAnimationProgress(0);
    
    let strokeIndex = 0;
    const animateNextStroke = () => {
      if (strokeIndex < strokeData.strokeCount) {
        const strokePattern = generateStrokePattern(strokeIndex, strokeData.strokeCount);
        setAnimatedStrokes(prev => {
          const newStrokes = [...prev, strokePattern];
          return newStrokes;
        });
        strokeIndex++;
        
        if (strokeIndex < strokeData.strokeCount) {
          setTimeout(animateNextStroke, 1000); // 1 second between strokes
        } else {
          setTimeout(() => {
            setIsAnimating(false);
          }, 1000);
        }
      }
    };
    
    animateNextStroke();
  };

  // Clear all drawings
  const clearDrawing = () => {
    setUserPaths([]);
    setCurrentPath([]);
    setCurrentStroke(0);
    setStrokeAccuracy([]);
    setShowFeedback(false);
    setAnimatedStrokes([]);
    setIsAnimating(false);
    
    // Clear free drawing
    setFreeDrawingPaths([]);
    setCurrentFreePath([]);
  };

  // Reset to specific stroke
  const resetToStroke = (strokeIndex) => {
    setCurrentStroke(strokeIndex);
    setUserPaths(userPaths.slice(0, strokeIndex));
    setStrokeAccuracy(strokeAccuracy.slice(0, strokeIndex));
  };

  // Undo last drawing stroke
  const undoLastStroke = () => {
    if (freeDrawingPaths.length > 0) {
      setFreeDrawingPaths(prev => prev.slice(0, -1));
    }
  };

  // Render background watermark for drawing mode
  const renderBackgroundWatermark = () => {
    if (mode === 'drawing' && character) {
      return (
        <WebView
          source={{ html: generateHanziWriterPracticeHTML(character) }}
          style={{ 
            width: 300, 
            height: 300,
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 0,
            backgroundColor: 'transparent'
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          scalesPageToFit={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          bounces={false}
          scrollEnabled={false}
          mixedContentMode="compatibility"
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          pointerEvents="none"
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('Background WebView error: ', nativeEvent);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('Background WebView HTTP error: ', nativeEvent);
          }}
        />
      );
    }
    return null;
  };

  // Generate Hanzi Writer Practice HTML (duplicated from Guide tab)
  const generateHanziWriterPracticeHTML = (char) => {
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
              background-color: white;
              font-family: Arial, sans-serif;
            }
            #character-target {
              width: 300px;
              height: 300px;
            }
            .loading {
              text-align: center;
              color: #666;
              font-size: 16px;
            }
          </style>
        </head>
        <body>
          <div id="character-target">
            <div class="loading"></div>
          </div>
          
          <script>
            // Simple fallback if Hanzi Writer fails to load
            function showFallback() {
              document.getElementById('character-target').innerHTML = 
                '<div style="text-align: center; font-size: 120px; color: #2c3e50; line-height: 300px;">${char}</div>';
            }
            
            // Try to load Hanzi Writer
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hanzi-writer@2.0.0/dist/hanzi-writer.min.js';
            script.onload = function() {
              try {
                const writer = HanziWriter.create('character-target', '${char}', {
                  width: 300,
                  height: 300,
                  padding: 20,
                  showOutline: true,
                  strokeAnimationSpeed: 0.8, // Slower animation speed
                  delayBetweenStrokes: 800, // Longer delay between strokes
                  strokeColor: '#3498db', // Blue color
                  outlineColor: '#bdc3c7',
                  drawingColor: '#e74c3c',
                  drawingWidth: 4,
                  showCharacter: true
                });
                
                // Function to start continuous animation
                function startContinuousAnimation() {
                  writer.animateCharacter({
                    onComplete: function() {
                      // Wait a bit before restarting
                      setTimeout(() => {
                        // Reset and restart animation
                        writer.hideCharacter();
                        writer.showOutline();
                        setTimeout(() => {
                          startContinuousAnimation();
                        }, 1000); // 1 second pause between loops
                      }, 2000); // 2 seconds pause after completion
                    }
                  });
                }
                
                // Auto-start continuous animation
                setTimeout(() => {
                  startContinuousAnimation();
                }, 500);
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

  // Generate Hanzi Writer HTML
  const generateHanziWriterHTML = (char) => {
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
              background-color: white;
              font-family: Arial, sans-serif;
            }
            #character-target {
              width: 300px;
              height: 300px;
            }
            .loading {
              text-align: center;
              color: #666;
              font-size: 16px;
            }
          </style>
        </head>
        <body>
          <div id="character-target">
            <div class="loading"></div>
          </div>
          
          <script>
            // Simple fallback if Hanzi Writer fails to load
            function showFallback() {
              document.getElementById('character-target').innerHTML = 
                '<div style="text-align: center; font-size: 120px; color: #2c3e50; line-height: 300px;">${char}</div>';
            }
            
            // Try to load Hanzi Writer
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hanzi-writer@2.0.0/dist/hanzi-writer.min.js';
            script.onload = function() {
              try {
                const writer = HanziWriter.create('character-target', '${char}', {
                  width: 300,
                  height: 300,
                  padding: 20,
                  showOutline: true,
                  strokeAnimationSpeed: 0.8, // Slower animation speed
                  delayBetweenStrokes: 800, // Longer delay between strokes
                  strokeColor: '#2c3e50',
                  outlineColor: '#bdc3c7',
                  drawingColor: '#e74c3c',
                  drawingWidth: 4,
                  showCharacter: true
                });
                
                // Function to start continuous animation
                function startContinuousAnimation() {
                  writer.animateCharacter({
                    onComplete: function() {
                      // Wait a bit before restarting
                      setTimeout(() => {
                        // Reset and restart animation
                        writer.hideCharacter();
                        writer.showOutline();
                        setTimeout(() => {
                          startContinuousAnimation();
                        }, 1000); // 1 second pause between loops
                      }, 2000); // 2 seconds pause after completion
                    }
                  });
                }
                
                // Auto-start continuous animation
                setTimeout(() => {
                  startContinuousAnimation();
                }, 500);
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

  // Render grid lines
  const renderGrid = () => {
    const lines = [];
    for (let i = 0; i <= 9; i++) {
      const pos = (i / 9) * gridSize;
      lines.push(
        <View
          key={`v-${i}`}
          style={[
            SimpleDrawingGridStyles.gridLine,
            {
              left: pos,
              top: 0,
              height: gridSize,
              width: 1,
            }
          ]}
        />
      );
      lines.push(
        <View
          key={`h-${i}`}
          style={[
            SimpleDrawingGridStyles.gridLine,
            {
              left: 0,
              top: pos,
              width: gridSize,
              height: 1,
            }
          ]}
        />
      );
    }
    return lines;
  };

  // Render guide stroke (watermark style for tracing)
  const renderGuideStroke = () => {
    if (!showGuide || currentStroke >= (strokeData?.strokeCount || 1)) return null;
    
    const targetPath = generateStrokePattern(currentStroke, strokeData?.strokeCount || 1);
    
    if (!targetPath || targetPath.length < 2) return null;
    
    // Create a simple line using a View with border
    const start = gridToScreen(targetPath[0][0], targetPath[0][1]);
    const end = gridToScreen(targetPath[1][0], targetPath[1][1]);
    
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);
    const left = Math.min(start.x, end.x);
    const top = Math.min(start.y, end.y);
    
    return (
      <View
        key={`guide-stroke-${currentStroke}`}
        style={{
          position: 'absolute',
          left: left,
          top: top,
          width: Math.max(width, 4),
          height: Math.max(height, 4),
          backgroundColor: '#3498db',
          opacity: 0.6,
          borderRadius: 2,
        }}
      />
    );
  };

  // Render animated strokes (for guide mode)
  const renderAnimatedStrokes = () => {
    if (!isAnimating || animatedStrokes.length === 0) return null;
    
    return animatedStrokes.map((stroke, strokeIndex) => {
      if (!stroke || stroke.length < 2) return null;
      
      const start = gridToScreen(stroke[0][0], stroke[0][1]);
      const end = gridToScreen(stroke[1][0], stroke[1][1]);
      
      const width = Math.abs(end.x - start.x);
      const height = Math.abs(end.y - start.y);
      const left = Math.min(start.x, end.x);
      const top = Math.min(start.y, end.y);
      
      return (
        <View
          key={`animated-stroke-${strokeIndex}`}
          style={{
            position: 'absolute',
            left: left,
            top: top,
            width: Math.max(width, 5),
            height: Math.max(height, 5),
            backgroundColor: '#e74c3c',
            opacity: 0.8,
            borderRadius: 3,
          }}
        />
      );
    });
  };

  // Render user paths
  const renderUserPaths = () => {
    return userPaths.map((path, pathIndex) => {
      if (!path || path.length < 2) return null;
      
      // Create a simple line for the entire path
      const start = gridToScreen(path[0].x, path[0].y);
      const end = gridToScreen(path[path.length - 1].x, path[path.length - 1].y);
      
      const width = Math.abs(end.x - start.x);
      const height = Math.abs(end.y - start.y);
      const left = Math.min(start.x, end.x);
      const top = Math.min(start.y, end.y);
      
      return (
        <View
          key={`user-path-${pathIndex}`}
          style={{
            position: 'absolute',
            left: left,
            top: top,
            width: Math.max(width, 3),
            height: Math.max(height, 3),
            backgroundColor: strokeAccuracy[pathIndex] >= 50 ? "#27ae60" : "#e74c3c",
            opacity: 0.8,
            borderRadius: 2,
          }}
        />
      );
    });
  };

  // Render current path being drawn
  const renderCurrentPath = () => {
    if (mode === 'free' || mode === 'drawing') {
      // Render current drawing path as smooth connected lines
      if (!currentFreePath || currentFreePath.length < 2) {
        return null;
      }
      
      const pathElements = createSmoothPath(currentFreePath);
      return pathElements.map((element) => (
        <View
          key={element.key}
          style={{
            position: 'absolute',
            left: element.left,
            top: element.top,
            width: element.width,
            height: element.height,
            backgroundColor: '#f39c12',
            borderRadius: element.borderRadius || element.height / 2,
            transform: element.transform,
            transformOrigin: element.transformOrigin,
          }}
        />
      ));
    } else {
      // Render current guided path
      if (currentPath.length < 2) return null;
      
      const start = gridToScreen(currentPath[0].x, currentPath[0].y);
      const end = gridToScreen(currentPath[currentPath.length - 1].x, currentPath[currentPath.length - 1].y);
      
      const width = Math.abs(end.x - start.x);
      const height = Math.abs(end.y - start.y);
      const left = Math.min(start.x, end.x);
      const top = Math.min(start.y, end.y);
      
      return (
        <View
          key="current-path"
          style={{
            position: 'absolute',
            left: left,
            top: top,
            width: Math.max(width, 3),
            height: Math.max(height, 3),
            backgroundColor: '#f39c12',
            opacity: 0.9,
            borderRadius: 2,
          }}
        />
      );
    }
  };

  // Render free drawing paths
  const renderFreeDrawingPaths = () => {
    if (mode !== 'free' && mode !== 'drawing') {
      return null;
    }
    
    if (freeDrawingPaths.length === 0) {
      return null;
    }
    
    // Render each path as smooth connected lines
    const allElements = [];
    freeDrawingPaths.forEach((path, pathIndex) => {
      if (!path || !Array.isArray(path) || path.length < 2) {
        return;
      }
      
      const pathElements = createSmoothPath(path);
      pathElements.forEach((element, elementIndex) => {
        allElements.push(
          <View
            key={`free-path-${pathIndex}-element-${elementIndex}`}
            style={{
              position: 'absolute',
              left: element.left,
              top: element.top,
              width: element.width,
              height: element.height,
              backgroundColor: FreeDrawingStyles.strokeColor,
              borderRadius: element.borderRadius || element.height / 2,
              transform: element.transform,
              transformOrigin: element.transformOrigin,
            }}
          />
        );
      });
    });
    
    return allElements;
  };


  return (
    <View style={SimpleDrawingGridStyles.container}>
        {/* Drawing Area */}
        <View style={SimpleDrawingGridStyles.drawingContainer}>
          {mode === 'guide' ? (
            /* Hanzi Writer Animation for Guide Mode */
            <View style={FreeDrawingStyles.drawingCanvas}>
              <WebView
                source={{ html: generateHanziWriterHTML(character) }}
                style={{ flex: 1 }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={false}
                scalesPageToFit={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                bounces={false}
                scrollEnabled={false}
                mixedContentMode="compatibility"
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.warn('WebView error: ', nativeEvent);
                }}
                onHttpError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.warn('WebView HTTP error: ', nativeEvent);
                }}
                onLoadEnd={() => {
                  setWebViewLoaded(true);
                }}
              />
              {/* Fallback text display - only show if WebView hasn't loaded */}
              {!webViewLoaded && (
                <View style={SimpleDrawingGridStyles.fallbackContainer}>
                  <Text style={SimpleDrawingGridStyles.fallbackText}>Guide Mode: {character}</Text>
                  <Text style={SimpleDrawingGridStyles.fallbackSubtext}>Loading stroke order animation...</Text>
                </View>
              )}
            </View>
          ) : mode === 'practice' ? (
            /* Hanzi Writer Practice Mode */
            <View style={FreeDrawingStyles.drawingCanvas}>
              <WebView
                source={{ html: generateHanziWriterPracticeHTML(character) }}
                style={{ flex: 1 }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={false}
                scalesPageToFit={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                bounces={false}
                scrollEnabled={false}
                mixedContentMode="compatibility"
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.warn('WebView error: ', nativeEvent);
                }}
                onHttpError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.warn('WebView HTTP error: ', nativeEvent);
                }}
                onLoadEnd={() => {
                  setWebViewLoaded(true);
                }}
              />
              {/* Fallback text display - only show if WebView hasn't loaded */}
              {!webViewLoaded && (
                <View style={SimpleDrawingGridStyles.fallbackContainer}>
                  <Text style={SimpleDrawingGridStyles.fallbackText}>Practice Mode: {character}</Text>
                  <Text style={SimpleDrawingGridStyles.fallbackSubtext}>Loading interactive practice...</Text>
                </View>
              )}
            </View>
          ) : (
            /* Regular Drawing Canvas for Free and Draw Modes */
            <View style={FreeDrawingStyles.drawingCanvas} {...panResponder.panHandlers}>
              {/* Background watermark for drawing mode */}
              {renderBackgroundWatermark()}
              
              {/* Render smooth lines - above the background animation */}
              <View style={{ position: 'absolute', top: 0, left: 0, width: 300, height: 300, zIndex: 10 }}>
                {(mode === 'free' || mode === 'drawing') && renderFreeDrawingPaths()}
                {(mode === 'free' || mode === 'drawing') && renderCurrentPath()}
              </View>
            </View>
          )}
        </View>

      {/* Controls */}
      <View style={SimpleDrawingGridStyles.controls}>
        <TouchableOpacity style={SimpleDrawingGridStyles.controlButton} onPress={clearDrawing}>
          <Text style={SimpleDrawingGridStyles.controlButtonText}>Clear All</Text>
        </TouchableOpacity>
        
        {/* Undo button - works for all modes */}
        <TouchableOpacity
          style={[SimpleDrawingGridStyles.controlButton, (mode === 'free' || mode === 'drawing') ? 
            (freeDrawingPaths.length === 0 ? SimpleDrawingGridStyles.disabledButton : {}) : 
            (currentStroke === 0 ? SimpleDrawingGridStyles.disabledButton : {})]}
          onPress={() => {
            if (mode === 'free' || mode === 'drawing') {
              undoLastStroke();
            } else {
              resetToStroke(Math.max(0, currentStroke - 1));
            }
          }}
          disabled={(mode === 'free' || mode === 'drawing') ? 
            freeDrawingPaths.length === 0 : 
            currentStroke === 0}
        >
          <Text style={SimpleDrawingGridStyles.controlButtonText}>Undo Stroke</Text>
        </TouchableOpacity>

        {mode !== 'free' && mode !== 'drawing' && (
          <TouchableOpacity
            style={[SimpleDrawingGridStyles.controlButton, SimpleDrawingGridStyles.animateButton]}
            onPress={animateStrokeOrder}
            disabled={isAnimating}
          >
            <Text style={SimpleDrawingGridStyles.controlButtonText}>
              {isAnimating ? 'Animating...' : 'Animate'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Feedback */}
      {showFeedback && (
        <View style={SimpleDrawingGridStyles.feedbackContainer}>
          <Text style={[
            SimpleDrawingGridStyles.feedbackText,
            { color: strokeAccuracy[currentStroke] >= 50 ? '#27ae60' : '#e74c3c' }
          ]}>
            {strokeAccuracy[currentStroke] >= 50 ? '✓ Good!' : 'Try again!'}
          </Text>
          <Text style={SimpleDrawingGridStyles.accuracyText}>
            Accuracy: {strokeAccuracy[currentStroke]}%
          </Text>
        </View>
      )}

      {/* Progress dots removed - not working properly */}
    </View>
  );
};


export default SimpleDrawingGrid;
