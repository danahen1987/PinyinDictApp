import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { QuizModeStyles } from '../styles/AppStyles';

const QuizModePage = ({ currentUser, databaseHelper, onBack }) => {
  const [activeTab, setActiveTab] = useState('translation');
  const [viewedCharacters, setViewedCharacters] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [balloonColors, setBalloonColors] = useState(['🔵', '🔵', '🔵', '🔵']);
  const [optionPositions, setOptionPositions] = useState([
    { x: 50, y: 50 },
    { x: 200, y: 50 },
    { x: 50, y: 200 },
    { x: 200, y: 200 }
  ]);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [selectedQuizLength, setSelectedQuizLength] = useState(null);

  useEffect(() => {
    loadViewedCharacters();
  }, [currentUser, databaseHelper]);


  const loadViewedCharacters = async () => {
    if (!databaseHelper || !currentUser || currentUser === 'Guest') {
      return;
    }

    try {
      const user = await databaseHelper.getUserByUsername(currentUser);
      if (user) {
        const viewedChars = await databaseHelper.getViewedCharacters(user.id);
        if (viewedChars && viewedChars.length > 0) {
          // Get character details for viewed characters
          const characterDetails = [];
          for (const viewedChar of viewedChars) {
            const character = await databaseHelper.getCharacter(viewedChar.character_id);
            if (character) {
              characterDetails.push(character);
            }
          }
          setViewedCharacters(characterDetails);
        }
      }
    } catch (error) {
      console.error('Error loading viewed characters for quiz:', error);
    }
  };

  const startQuizWithLength = (quizLength) => {
    if (viewedCharacters.length === 0) {
      Alert.alert(
        'No Characters to Quiz',
        'You need to view some characters first before taking a quiz. Go to Cards Practice to learn some characters!',
        [{ text: 'OK' }]
      );
      return;
    }

    // Calculate actual quiz length based on available characters
    const actualQuizLength = Math.min(quizLength, viewedCharacters.length);
    
    // Shuffle the viewed characters for random question order
    const shuffled = [...viewedCharacters].sort(() => 0.5 - Math.random()).slice(0, actualQuizLength);
    setShuffledQuestions(shuffled);
    
    setQuizStarted(true);
    setQuestionIndex(0);
    setQuizComplete(false);
    setSelectedQuizLength(quizLength);
    generateQuestion(0, shuffled);
  };

  const generateQuestion = (index, questionsArray = shuffledQuestions) => {
    if (index >= questionsArray.length) {
      setQuizComplete(true);
      return;
    }

    // Generate force-directed organic positions
    const generateForceDirectedPositions = (itemCount, containerWidth = 350, containerHeight = 300) => {
      const positions = [];
      const minDistance = 80; // Minimum distance between items
      const itemSize = 100; // Size of each item
      
      for (let i = 0; i < itemCount; i++) {
        let attempts = 0;
        let position;
        let valid = false;
        
        do {
          position = {
            x: Math.random() * (containerWidth - itemSize),
            y: Math.random() * (containerHeight - itemSize)
          };
          
          // Check if position is far enough from existing positions
          valid = positions.every(p => {
            const distance = Math.sqrt(
              Math.pow(p.x - position.x, 2) + Math.pow(p.y - position.y, 2)
            );
            return distance >= minDistance;
          });
          
          attempts++;
        } while (!valid && attempts < 50);
        
        positions.push(position);
      }
      
      return positions;
    };
    
    const organicPositions = generateForceDirectedPositions(4);
    setOptionPositions(organicPositions);

    const character = questionsArray[index];
    
    if (activeTab === 'translation') {
      generateTranslationQuestion(character);
    } else if (activeTab === 'sentence') {
      generateSentenceQuestion(character);
    }
  };

  const generateTranslationQuestion = async (character) => {
    try {
      // Get 3 random wrong answers from other viewed characters
      const wrongAnswers = viewedCharacters
        .filter(char => char.id !== character.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(char => char.englishTranslation);

      // Create options array
      const options = [character.englishTranslation, ...wrongAnswers].sort(() => 0.5 - Math.random());
      const correctIndex = options.indexOf(character.englishTranslation);

      setCurrentQuestion({
        type: 'translation',
        character: character.character,
        pinyin: character.pinyin,
        options: options,
        correctAnswer: correctIndex,
        explanation: `${character.character} (${character.pinyin}) means "${character.englishTranslation}"`
      });
    } catch (error) {
      console.error('Error generating translation question:', error);
    }
  };

  const generateSentenceQuestion = async (character) => {
    try {
      // Get sentence for this character
      const sentence = await databaseHelper.getSentenceByCharacterId(character.id);
      
      if (!sentence) {
        // If no sentence, skip this character
        generateQuestion(questionIndex + 1);
        return;
      }

      // Get 3 random wrong characters from viewed characters
      const wrongCharacters = viewedCharacters
        .filter(char => char.id !== character.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      // Create sentence with blank
      const sentenceWithBlank = sentence.sentence.replace(character.character, '___');
      
      // Create options array
      const options = [character.character, ...wrongCharacters.map(char => char.character)]
        .sort(() => 0.5 - Math.random());
      const correctIndex = options.indexOf(character.character);

      setCurrentQuestion({
        type: 'sentence',
        sentence: sentenceWithBlank,
        pinyin: sentence.sentencePinyin,
        translation: sentence.sentenceEnglishTranslation,
        options: options,
        correctAnswer: correctIndex,
        explanation: `The correct answer is ${character.character} (${character.pinyin}).${sentence.sentenceEnglishTranslation && sentence.sentenceEnglishTranslation.trim() ? ` The sentence means: "${sentence.sentenceEnglishTranslation}"` : ''}`
      });
    } catch (error) {
      console.error('Error generating sentence question:', error);
    }
  };

  const selectAnswer = (index) => {
    if (showResult) return;
    
    setSelectedAnswer(index);
    const correct = index === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    
    // Track correct answers for scoring
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
    }
    
    // Update balloon colors based on answer
    const newColors = ['🔵', '🔵', '🔵', '🔵']; // Reset to blue balloons
    if (correct) {
      newColors[index] = '🟢'; // Green balloon for correct answer
    } else {
      newColors[index] = '🔴'; // Red balloon for wrong answer
      newColors[currentQuestion.correctAnswer] = '🟢'; // Green balloon for correct answer
    }
    setBalloonColors(newColors);
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setIsCorrect(false);
    setBalloonColors(['🔵', '🔵', '🔵', '🔵']); // Reset to blue circles
    
    const nextIndex = questionIndex + 1;
    setQuestionIndex(nextIndex);
    generateQuestion(nextIndex);
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuizComplete(false);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setIsCorrect(false);
    setCurrentQuestion(null);
    setBalloonColors(['🔵', '🔵', '🔵', '🔵']); // Reset to blue circles
    setShuffledQuestions([]); // Clear shuffled questions
    setCorrectAnswers(0); // Reset score
    setSelectedQuizLength(null); // Reset selected quiz length
  };

  const renderTabButton = (tabId, title) => (
    <TouchableOpacity
      style={[
        QuizModeStyles.tabButton,
        activeTab === tabId && QuizModeStyles.activeTabButton
      ]}
      onPress={() => {
        setActiveTab(tabId);
        resetQuiz();
      }}
    >
      <Text style={[
        QuizModeStyles.tabButtonText,
        activeTab === tabId && QuizModeStyles.activeTabButtonText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderQuizStart = () => {
    const quizLengthOptions = [
      { length: 5, label: '5 Questions' },
      { length: 10, label: '10 Questions' },
      { length: 15, label: '15 Questions' },
      { length: 25, label: '25 Questions' }
    ];

    return (
      <View style={QuizModeStyles.quizStartContainer}>
        <Text style={QuizModeStyles.quizTitle}>
          {activeTab === 'translation' ? 'Translation Quiz' : 'Sentence Completion Quiz'}
        </Text>
        <Text style={QuizModeStyles.quizDescription}>
          {activeTab === 'translation' 
            ? 'Test your knowledge of character meanings'
            : 'Complete sentences with the correct characters'
          }
        </Text>
        <Text style={QuizModeStyles.characterCount}>
          {viewedCharacters.length} characters available for quiz
        </Text>
        
        <View style={QuizModeStyles.quizLengthContainer}>
          {quizLengthOptions.map((option) => {
            const isSelected = selectedQuizLength === option.length;
            const isDisabled = viewedCharacters.length < option.length;
            
            return (
              <TouchableOpacity
                key={option.length}
                style={[
                  QuizModeStyles.quizLengthButton,
                  isSelected && !isDisabled && QuizModeStyles.selectedQuizLengthButton,
                  isDisabled && QuizModeStyles.disabledQuizLengthButton
                ]}
                onPress={() => !isDisabled && startQuizWithLength(option.length)}
                disabled={isDisabled}
                activeOpacity={isDisabled ? 1 : 0.7}
              >
                <Text style={[
                  QuizModeStyles.quizLengthButtonText,
                  isSelected && !isDisabled && QuizModeStyles.selectedQuizLengthButtonText,
                  isDisabled && QuizModeStyles.disabledQuizLengthButtonText
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderQuestion = () => (
    <View style={QuizModeStyles.questionContainer}>
      <View style={QuizModeStyles.progressContainer}>
        <Text style={QuizModeStyles.progressText}>
          Question {questionIndex + 1} of {shuffledQuestions.length}
        </Text>
        <View style={QuizModeStyles.progressBar}>
          <View style={[
            QuizModeStyles.progressFill,
            { width: `${((questionIndex + 1) / shuffledQuestions.length) * 100}%` }
          ]} />
        </View>
      </View>

      <View style={QuizModeStyles.questionContent}>
        {activeTab === 'translation' ? (
          <>
            <View style={QuizModeStyles.characterContainer}>
              <Text style={QuizModeStyles.characterDisplay}>{currentQuestion.character}</Text>
            </View>
            <Text style={QuizModeStyles.pinyinDisplay}>{currentQuestion.pinyin}</Text>
          </>
        ) : (
          <>
            <View style={QuizModeStyles.sentenceContainer}>
              {currentQuestion.sentence.split('___').map((part, index) => (
                <React.Fragment key={index}>
                  <Text style={QuizModeStyles.sentenceDisplay}>{part}</Text>
                  {index < currentQuestion.sentence.split('___').length - 1 && (
                    <Text style={QuizModeStyles.blankSpace}>___</Text>
                  )}
                </React.Fragment>
              ))}
            </View>
            <Text style={[
              QuizModeStyles.explanationText,
              { opacity: showResult ? 1 : 0 }
            ]}>
              {currentQuestion.explanation}
            </Text>
          </>
        )}

        <View style={activeTab === 'translation' ? QuizModeStyles.translationOptionsContainer : QuizModeStyles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            if (activeTab === 'translation') {
              // Translation Quiz: Regular option buttons in horizontal layout
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    QuizModeStyles.translationOptionButton,
                    selectedAnswer === index && QuizModeStyles.selectedTranslationOption,
                    showResult && index === currentQuestion.correctAnswer && QuizModeStyles.correctTranslationOption,
                    showResult && selectedAnswer === index && !isCorrect && QuizModeStyles.incorrectTranslationOption
                  ]}
                  onPress={() => selectAnswer(index)}
                >
                  <Text style={[
                    QuizModeStyles.translationOptionText,
                    selectedAnswer === index && QuizModeStyles.selectedTranslationOptionText,
                    showResult && index === currentQuestion.correctAnswer && QuizModeStyles.correctTranslationOptionText,
                    showResult && selectedAnswer === index && !isCorrect && QuizModeStyles.incorrectTranslationOptionText
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            } else {
              // Sentence Quiz: Colored circles with force-directed organic positioning
              const position = optionPositions[index];
              const left = position.x;
              const top = position.y;
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    activeTab === 'translation' ? QuizModeStyles.translationOptionButton : QuizModeStyles.optionButton,
                    { left, top },
                    selectedAnswer === index && QuizModeStyles.selectedOption,
                    showResult && index === currentQuestion.correctAnswer && QuizModeStyles.correctOption,
                    showResult && selectedAnswer === index && !isCorrect && QuizModeStyles.incorrectOption
                  ]}
                  onPress={() => selectAnswer(index)}
                >
                  {activeTab === 'sentence' && (
                    <Text style={QuizModeStyles.balloonEmoji}>{balloonColors[index]}</Text>
                  )}
                  <Text style={[
                    QuizModeStyles.optionText,
                    selectedAnswer === index && QuizModeStyles.selectedOptionText,
                    showResult && index === currentQuestion.correctAnswer && QuizModeStyles.correctOptionText,
                    showResult && selectedAnswer === index && !isCorrect && QuizModeStyles.incorrectOptionText
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            }
          })}
        </View>
      </View>
      
      {showResult && (
        <TouchableOpacity
          style={QuizModeStyles.nextQuestionButton}
          onPress={nextQuestion}
          activeOpacity={0.7}
        >
          <Text style={QuizModeStyles.nextQuestionArrow}>
            {questionIndex + 1 >= shuffledQuestions.length ? '✓' : '›'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderQuizComplete = () => {
    const totalQuestions = shuffledQuestions.length;
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    return (
      <View style={QuizModeStyles.completeContainer}>
        <Text style={QuizModeStyles.completeTitle}>🎉 Quiz Complete!</Text>
        <Text style={QuizModeStyles.scoreText}>Your Score: {score}/100</Text>
        <Text style={QuizModeStyles.scoreDetails}>
          {correctAnswers} out of {totalQuestions} questions correct
        </Text>
        <Text style={QuizModeStyles.completeText}>
          You've completed the {activeTab === 'translation' ? 'Translation' : 'Sentence Completion'} quiz!
        </Text>
        <Text style={QuizModeStyles.completeSubtext}>
          Great job reviewing your viewed characters!
        </Text>
        <TouchableOpacity style={QuizModeStyles.restartButton} onPress={resetQuiz}>
          <Text style={QuizModeStyles.restartButtonText}>Take Another Quiz</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={QuizModeStyles.container}>
      <View style={QuizModeStyles.header}>
        <TouchableOpacity style={QuizModeStyles.backButton} onPress={onBack}>
          <Text style={QuizModeStyles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={QuizModeStyles.headerTitle}>Quiz Mode</Text>
      </View>

      <View style={QuizModeStyles.tabContainer}>
        {renderTabButton('translation', 'Translation Quiz')}
        {renderTabButton('sentence', 'Sentence Quiz')}
      </View>

      <ScrollView style={QuizModeStyles.content}>
        {!quizStarted && !quizComplete && renderQuizStart()}
        {quizStarted && !quizComplete && currentQuestion && renderQuestion()}
        {quizComplete && renderQuizComplete()}
      </ScrollView>
    </View>
  );
};

export default QuizModePage;
