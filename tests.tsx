import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Brain, Clock, Trophy, CheckCircle, XCircle, RotateCcw } from 'lucide-react-native';
import { quizzes } from '@/data/quizzes';
import { useTutorStore } from '@/store/tutorStore';
import { kidsTheme } from '@/constants/colors';

type Quiz = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questions: Question[];
  timeLimit: number;
};

type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

const getDifficultyInRussian = (difficulty: string) => {
  const difficultyMap: { [key: string]: string } = {
    'Beginner': 'Начальный',
    'Intermediate': 'Средний',
    'Advanced': 'Продвинутый'
  };
  return difficultyMap[difficulty] || difficulty;
};

export default function TestsScreen() {
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const { addTestResult } = useTutorStore();
  const insets = useSafeAreaInsets();

  const startQuiz = (quiz: Quiz) => {
    if (!quiz || !quiz.id || quiz.questions.length === 0) return;
    setSelectedQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswers(new Array(quiz.questions.length).fill(-1));
    setShowResults(false);
    setTimeRemaining(quiz.timeLimit * 60);
  };

  const selectAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < selectedQuiz!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const finishQuiz = () => {
    const correctAnswers = selectedAnswers.filter(
      (answer, index) => answer === selectedQuiz!.questions[index].correctAnswer
    ).length;
    
    const score = Math.round((correctAnswers / selectedQuiz!.questions.length) * 100);
    
    addTestResult({
      quizId: selectedQuiz!.id,
      quizTitle: selectedQuiz!.title,
      score,
      totalQuestions: selectedQuiz!.questions.length,
      correctAnswers,
      completedAt: new Date(),
    });
    
    setShowResults(true);
  };

  const resetQuiz = () => {
    setSelectedQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setTimeRemaining(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showResults && selectedQuiz) {
    const correctAnswers = selectedAnswers.filter(
      (answer, index) => answer === selectedQuiz.questions[index].correctAnswer
    ).length;
    const score = Math.round((correctAnswers / selectedQuiz.questions.length) * 100);

    return (
      <View style={styles.container}>
        <View style={styles.resultsContainer}>
          <Trophy size={64} color={kidsTheme.accentDark} />
          <Text style={styles.resultsTitle}>Тест завершён!</Text>
          <Text style={styles.resultsScore}>{score}%</Text>
          <Text style={styles.resultsText}>
            Вы правильно ответили на {correctAnswers} из {selectedQuiz.questions.length} вопросов
          </Text>

          <ScrollView style={styles.reviewContainer}>
            {selectedQuiz.questions.map((question) => {
              const questionIndex = selectedQuiz.questions.indexOf(question);
              const isCorrect = selectedAnswers[questionIndex] === question.correctAnswer;
              return (
                <View key={question.id} style={styles.reviewQuestion}>
                  <View style={styles.reviewHeader}>
                    {isCorrect ? (
                      <CheckCircle size={20} color={kidsTheme.success} />
                    ) : (
                      <XCircle size={20} color={kidsTheme.danger} />
                    )}
                    <Text style={styles.reviewQuestionNumber}>Вопрос {selectedQuiz.questions.indexOf(question) + 1}</Text>
                  </View>
                  <Text style={styles.reviewQuestionText}>{question.question}</Text>
                  <Text style={styles.reviewAnswer}>
                    Ваш ответ: {question.options[selectedAnswers[selectedQuiz.questions.indexOf(question)]] || 'Не отвечено'}
                  </Text>
                  <Text style={styles.reviewCorrectAnswer}>
                    Правильный ответ: {question.options[question.correctAnswer]}
                  </Text>
                  <Text style={styles.reviewExplanation}>{question.explanation}</Text>
                </View>
              );
            })}
          </ScrollView>

          <TouchableOpacity style={styles.resetButton} onPress={resetQuiz}>
            <RotateCcw size={20} color={kidsTheme.surface} />
            <Text style={styles.resetButtonText}>Пройти другой тест</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (selectedQuiz && !showResults) {
    const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100;

    return (
      <View style={styles.container}>
        <View style={styles.quizHeaderInner}>
          <View style={styles.quizProgress}>
            <Text style={styles.progressText}>
              {currentQuestionIndex + 1} of {selectedQuiz.questions.length}
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>
          <View style={styles.timerContainer}>
            <Clock size={16} color={kidsTheme.muted} />
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
          </View>
        </View>

        <ScrollView style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedAnswers[currentQuestionIndex] === index && styles.optionButtonSelected,
                ]}
                onPress={() => selectAnswer(index)}
              >
                <View style={[
                  styles.optionCircle,
                  selectedAnswers[currentQuestionIndex] === index && styles.optionCircleSelected,
                ]}>
                  <Text style={[
                    styles.optionLetter,
                    selectedAnswers[currentQuestionIndex] === index && styles.optionLetterSelected,
                  ]}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text style={[
                  styles.optionText,
                  selectedAnswers[currentQuestionIndex] === index && styles.optionTextSelected,
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
            onPress={previousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <Text style={[
              styles.navButtonText,
              currentQuestionIndex === 0 && styles.navButtonTextDisabled,
            ]}>
              Назад
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              styles.nextButton,
              selectedAnswers[currentQuestionIndex] === -1 && styles.navButtonDisabled,
            ]}
            onPress={nextQuestion}
            disabled={selectedAnswers[currentQuestionIndex] === -1}
          >
            <Text style={[
              styles.navButtonText,
              styles.nextButtonText,
              selectedAnswers[currentQuestionIndex] === -1 && styles.navButtonTextDisabled,
            ]}>
              {currentQuestionIndex === selectedQuiz.questions.length - 1 ? 'Завершить' : 'Далее'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.logoWrap}>
            <View style={styles.logoBg} />
            <Image
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/ubtx59hpn211f5nqi0i24' }}
              style={styles.headerLogo}
              accessibilityLabel="Логотип приложения"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Практические тесты</Text>
            <Text style={styles.headerSubtitle}>Проверьте свои знания</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.quizzesContainer}
        contentContainerStyle={styles.quizzesContent}
        showsVerticalScrollIndicator={false}
      >
        {quizzes.map((quiz) => (
          <TouchableOpacity
            key={quiz.id}
            style={styles.quizCard}
            onPress={() => {
              if (!quiz || !quiz.id || quiz.questions.length === 0) return;
              startQuiz(quiz);
            }}
          >
            <View style={styles.quizHeaderTop}>
              <Brain size={24} color={kidsTheme.primaryDark} />
              <View style={[styles.difficultyBadge, styles[`difficulty${quiz.difficulty}`]]}>
                <Text style={[styles.difficultyText, styles[`difficulty${quiz.difficulty}Text`]]}>
                  {getDifficultyInRussian(quiz.difficulty)}
                </Text>
              </View>
            </View>
            
            <Text style={styles.quizTitle}>{quiz.title}</Text>
            <Text style={styles.quizDescription}>{quiz.description}</Text>
            
            <View style={styles.quizMeta}>
              <Text style={styles.quizMetaText}>
                {quiz.questions.length} вопросов
              </Text>
              <Text style={styles.quizMetaText}>
                {quiz.timeLimit} минут
              </Text>
              <Text style={styles.quizMetaText}>
                {quiz.category}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: kidsTheme.bg,
  },
  header: {
    backgroundColor: kidsTheme.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: kidsTheme.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoWrap: {
    marginRight: 12,
  },
  logoBg: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#11182710',
  },
  headerLogo: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: kidsTheme.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: kidsTheme.muted,
    marginTop: 4,
  },
  quizzesContainer: {
    flex: 1,
  },
  quizzesContent: {
    padding: 20,
  },
  quizCard: {
    backgroundColor: kidsTheme.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: kidsTheme.border,
  },
  quizHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: kidsTheme.text,
    marginBottom: 8,
  },
  quizDescription: {
    fontSize: 14,
    color: kidsTheme.muted,
    lineHeight: 20,
    marginBottom: 16,
  },
  quizMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  quizMetaText: {
    fontSize: 12,
    color: kidsTheme.muted,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyBeginner: {
    backgroundColor: kidsTheme.secondaryLight,
  },
  difficultyIntermediate: {
    backgroundColor: kidsTheme.accentLight,
  },
  difficultyAdvanced: {
    backgroundColor: '#FFE4E6',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '700',
  },
  difficultyBeginnerText: {
    color: kidsTheme.success,
  },
  difficultyIntermediateText: {
    color: kidsTheme.warning,
  },
  difficultyAdvancedText: {
    color: kidsTheme.danger,
  },
  quizHeaderInner: {
    backgroundColor: kidsTheme.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: kidsTheme.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quizProgress: {
    flex: 1,
    marginRight: 16,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: kidsTheme.text,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: kidsTheme.border,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: kidsTheme.primary,
    borderRadius: 2,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    fontWeight: '700',
    color: kidsTheme.muted,
    marginLeft: 4,
  },
  questionContainer: {
    flex: 1,
    padding: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    color: kidsTheme.text,
    lineHeight: 26,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: kidsTheme.border,
    backgroundColor: kidsTheme.surface,
  },
  optionButtonSelected: {
    borderColor: kidsTheme.primary,
    backgroundColor: kidsTheme.primaryLight,
  },
  optionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: kidsTheme.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionCircleSelected: {
    backgroundColor: kidsTheme.primary,
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: 'bold',
    color: kidsTheme.muted,
  },
  optionLetterSelected: {
    color: kidsTheme.surface,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: kidsTheme.text,
    lineHeight: 22,
  },
  optionTextSelected: {
    color: kidsTheme.primary,
    fontWeight: '700',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: kidsTheme.surface,
    borderTopWidth: 2,
    borderTopColor: kidsTheme.border,
  },
  navButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: kidsTheme.border,
    backgroundColor: kidsTheme.surface,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  nextButton: {
    backgroundColor: kidsTheme.primary,
    borderColor: kidsTheme.primary,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: kidsTheme.muted,
  },
  navButtonTextDisabled: {
    color: '#94a3b8',
  },
  nextButtonText: {
    color: kidsTheme.surface,
  },
  resultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: kidsTheme.text,
    marginTop: 16,
    marginBottom: 8,
  },
  resultsScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: kidsTheme.primary,
    marginBottom: 8,
  },
  resultsText: {
    fontSize: 16,
    color: kidsTheme.muted,
    textAlign: 'center',
    marginBottom: 24,
  },
  reviewContainer: {
    flex: 1,
    width: '100%',
    marginBottom: 20,
  },
  reviewQuestion: {
    backgroundColor: kidsTheme.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: kidsTheme.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewQuestionNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: kidsTheme.muted,
    marginLeft: 8,
  },
  reviewQuestionText: {
    fontSize: 16,
    fontWeight: '700',
    color: kidsTheme.text,
    marginBottom: 8,
  },
  reviewAnswer: {
    fontSize: 14,
    color: kidsTheme.muted,
    marginBottom: 4,
  },
  reviewCorrectAnswer: {
    fontSize: 14,
    color: kidsTheme.success,
    fontWeight: '700',
    marginBottom: 8,
  },
  reviewExplanation: {
    fontSize: 14,
    color: kidsTheme.muted,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: kidsTheme.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: kidsTheme.surface,
    marginLeft: 8,
  },
});
