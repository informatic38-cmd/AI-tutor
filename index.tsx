import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  ImageBackground,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, Bot, User, BookOpen, Brain, Clock, CheckCircle, Play, FileText, Award, Sparkles, Zap } from 'lucide-react-native';
import { useTutorStore } from '@/store/tutorStore';
import { quizzes, type Quiz } from '@/data/quizzes';
import { materials } from '@/data/materials';
import { useTheme } from '@/store/themeStore';
import { kidsTheme, type Theme } from '@/constants/colors';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  task?: any;
};

export default function ChatScreen() {
  const { theme } = useTheme();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const mascotUrl = 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/ie6vpsh6kov4he3f6tnrs';
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { messages, addMessage, addTaskMessage, markTaskCompleted, isTaskCompleted } = useTutorStore();
  const insets = useSafeAreaInsets();

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Вы полезный ИИ-репетитор. Предоставляйте ясные, образовательные объяснения академических вопросов на русском языке. Делайте ответы краткими, но информативными. Сосредоточьтесь на том, чтобы помочь студентам понять концепции, а не просто давать ответы. Когда уместно, предлагайте связанные тесты или материалы для изучения. Если пользователь спрашивает о конкретной теме, вы можете предложить соответствующие задания.',
            },
            {
              role: 'user',
              content: userMessage.text,
            },
          ],
        }),
      });

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.completion,
        isUser: false,
        timestamp: new Date(),
      };

      addMessage(aiMessage);

      suggestRelatedTasks(userMessage.text);
    } catch (error) {
      console.error('Error sending message:', error);
      console.log('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const suggestRelatedTasks = (userText: string) => {
    const lowerText = userText.toLowerCase();
    
    if (lowerText.includes('алгебра') || lowerText.includes('уравнение') || lowerText.includes('математика')) {
      const quiz = quizzes.find(q => q.category === 'Mathematics');
      if (quiz) {
        setTimeout(() => {
          addTaskMessage(
            'Хотите проверить свои знания по алгебре? Я подготовил для вас тест!',
            {
              id: quiz.id,
              type: 'quiz',
              title: quiz.title,
              description: quiz.description,
              category: quiz.category,
              difficulty: quiz.difficulty,
              estimatedTime: `${quiz.timeLimit} мин`,
              data: quiz,
            }
          );
        }, 1000);
      }
    }
    
    if (lowerText.includes('физика') || lowerText.includes('сила') || lowerText.includes('движение')) {
      const quiz = quizzes.find(q => q.category === 'Physics');
      const material = materials.find(m => m.category === 'Physics');
      if (quiz) {
        setTimeout(() => {
          addTaskMessage(
            'Предлагаю изучить материал по физике и пройти тест!',
            {
              id: quiz.id,
              type: 'quiz',
              title: quiz.title,
              description: quiz.description,
              category: quiz.category,
              difficulty: quiz.difficulty,
              estimatedTime: `${quiz.timeLimit} мин`,
              data: quiz,
            }
          );
        }, 1000);
      }
      if (material) {
        setTimeout(() => {
          addTaskMessage(
            'Также рекомендую посмотреть этот материал по законам движения:',
            {
              id: material.id,
              type: 'material',
              title: material.title,
              description: material.description,
              category: material.category,
              difficulty: material.difficulty,
              estimatedTime: material.duration || '15 мин',
              data: material,
            }
          );
        }, 2000);
      }
    }
    
    if (lowerText.includes('химия') || lowerText.includes('атом') || lowerText.includes('элемент')) {
      const quiz = quizzes.find(q => q.category === 'Chemistry');
      if (quiz) {
        setTimeout(() => {
          addTaskMessage(
            'Проверьте свои знания по строению атома!',
            {
              id: quiz.id,
              type: 'quiz',
              title: quiz.title,
              description: quiz.description,
              category: quiz.category,
              difficulty: quiz.difficulty,
              estimatedTime: `${quiz.timeLimit} мин`,
              data: quiz,
            }
          );
        }, 1000);
      }
    }
    
    if (lowerText.includes('биология') || lowerText.includes('клетка') || lowerText.includes('организм')) {
      const quiz = quizzes.find(q => q.category === 'Biology');
      const material = materials.find(m => m.category === 'Biology');
      if (material) {
        setTimeout(() => {
          addTaskMessage(
            'Рекомендую изучить материал по клеточной биологии:',
            {
              id: material.id,
              type: 'material',
              title: material.title,
              description: material.description,
              category: material.category,
              difficulty: material.difficulty,
              estimatedTime: material.duration || '15 мин',
              data: material,
            }
          );
        }, 1000);
      }
      if (quiz) {
        setTimeout(() => {
          addTaskMessage(
            'А затем проверьте знания тестом по строению клетки!',
            {
              id: quiz.id,
              type: 'quiz',
              title: quiz.title,
              description: quiz.description,
              category: quiz.category,
              difficulty: quiz.difficulty,
              estimatedTime: `${quiz.timeLimit} мин`,
              data: quiz,
            }
          );
        }, 2000);
      }
    }
  };

  const handleTaskAction = (task: any) => {
    if (!task?.id || !task?.title) {
      console.error('Invalid task data');
      return;
    }
    
    if (task.type === 'quiz') {
      console.log('Starting quiz:', task.title);
      markTaskCompleted(task.id);
      
      setTimeout(() => {
        const completionMessage = {
          id: Date.now().toString(),
          text: `Отлично! Вы завершили тест "${task.title}". Продолжайте изучать новые темы!`,
          isUser: false,
          timestamp: new Date(),
        };
        addMessage(completionMessage);
      }, 500);
    } else if (task.type === 'material') {
      console.log('Opening material:', task.title);
      markTaskCompleted(task.id);
      
      setTimeout(() => {
        const completionMessage = {
          id: Date.now().toString(),
          text: `Материал "${task.title}" изучен! Теперь вы можете применить полученные знания на практике.`,
          isUser: false,
          timestamp: new Date(),
        };
        addMessage(completionMessage);
      }, 500);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return kidsTheme.success;
      case 'Intermediate': return kidsTheme.warning;
      case 'Advanced': return kidsTheme.danger;
      default: return kidsTheme.muted;
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'quiz': return Brain;
      case 'material': return BookOpen;
      case 'exercise': return FileText;
      case 'assignment': return Award;
      default: return BookOpen;
    }
  };

  const renderVisualContent = (quiz: Quiz) => {
    if (!quiz) return null;
    
    const firstQuestion = quiz.questions?.[0];
    const visualContent = firstQuestion?.visualContent;
    
    if (!visualContent && !quiz.visualFormula && !quiz.icon) return null;
    
    return (
      <View style={styles.visualContentContainer}>
        {quiz.icon && (
          <View style={styles.iconBadge}>
            <Text style={styles.iconText}>{quiz.icon}</Text>
          </View>
        )}
        
        {quiz.visualFormula && (
          <View style={styles.formulaContainer}>
            <Text style={styles.formulaText}>{quiz.visualFormula}</Text>
          </View>
        )}
        
        {visualContent?.type === 'formula' && visualContent.steps && (
          <View style={styles.stepsContainer}>
            {visualContent.steps.map((step, index) => (
              <View key={`step-${index}`} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        )}
        
        {visualContent?.type === 'periodic_element' && (
          <View style={styles.periodicElement}>
            <Text style={styles.elementNumber}>{visualContent.number}</Text>
            <Text style={styles.elementSymbol}>{visualContent.element}</Text>
            <Text style={styles.elementName}>{visualContent.name}</Text>
          </View>
        )}
      </View>
    );
  };

  const TaskCard = React.memo(({ task }: { task: any }) => {
    const Icon = getTaskIcon(task.type);
    const isCompleted = isTaskCompleted(task.id);
    const quiz = task.type === 'quiz' ? quizzes.find(q => q.id === task.id) : null;
    const scaleAnim = useRef(new Animated.Value(0)).current;
    
    React.useEffect(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }, [scaleAnim]);
    
    return (
      <Animated.View 
        style={[
          styles.taskCard,
          {
            transform: [{ scale: scaleAnim }],
            opacity: scaleAnim,
          }
        ]}
      >
        <View style={styles.taskGradient} />
        
        <View style={styles.taskHeader}>
          <View style={[styles.taskIconContainer, { backgroundColor: getDifficultyColor(task.difficulty) + '15' }]}>
            <Icon size={24} color={getDifficultyColor(task.difficulty)} />
          </View>
          <View style={styles.taskInfo}>
            <View style={styles.taskTitleRow}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Sparkles size={16} color={kidsTheme.accentDark} style={styles.sparkleIcon} />
            </View>
            <Text style={styles.taskDescription}>{task.description}</Text>
          </View>
        </View>
        
        {task.data?.image && (
          <View style={styles.taskImageContainer}>
            <Image source={{ uri: task.data.image }} style={styles.taskImage} />
            <View style={styles.imageOverlay}>
              <Zap size={20} color={kidsTheme.surface} />
            </View>
          </View>
        )}
        
        {quiz && renderVisualContent(quiz)}
        
        <View style={styles.taskMeta}>
          <View style={[styles.taskMetaItem, styles.categoryBadge]}>
            <Text style={styles.taskCategory}>{task.category}</Text>
          </View>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(task.difficulty) + '20' }]}>
            <Text style={[styles.difficultyText, { color: getDifficultyColor(task.difficulty) }]}>
              {task.difficulty === 'Beginner' ? 'Начальный' : 
               task.difficulty === 'Intermediate' ? 'Средний' : 'Продвинутый'}
            </Text>
          </View>
          {task.estimatedTime && (
            <View style={styles.taskMetaItem}>
              <Clock size={14} color={kidsTheme.muted} />
              <Text style={styles.taskTime}>{task.estimatedTime}</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity
          style={[styles.taskButton, isCompleted && styles.taskButtonCompleted]}
          onPress={() => handleTaskAction(task)}
          disabled={isCompleted}
          activeOpacity={0.8}
        >
          {isCompleted ? (
            <>
              <CheckCircle size={18} color={kidsTheme.success} />
              <Text style={[styles.taskButtonText, styles.taskButtonTextCompleted]}>Завершено</Text>
            </>
          ) : (
            <>
              <Play size={18} color={kidsTheme.surface} />
              <Text style={styles.taskButtonText}>
                {task.type === 'quiz' ? 'Начать тест' : 'Изучить материал'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  });
  (TaskCard as any).displayName = 'TaskCard';

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} testID="main-screen">
      <ImageBackground
        source={{ uri: mascotUrl }}
        resizeMode="cover"
        style={styles.wallpaper}
        imageStyle={styles.wallpaperImage}
        accessibilityRole="image"
        accessibilityLabel="Фоновый персонаж"
      >
        <View style={styles.wallpaperOverlay} />
      </ImageBackground>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Image
            source={{ uri: mascotUrl }}
            style={styles.headerLogo}
            accessibilityLabel="Логотип приложения"
            testID="app-logo"
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>ИИ Репетитор</Text>
            <Text style={styles.headerSubtitle}>Задавайте любые вопросы по учёбе</Text>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && (
          <View style={styles.emptyState}>
            <Image source={{ uri: mascotUrl }} style={styles.emptyMascot} accessibilityLabel="Персонаж-репетитор" />
            <Text style={styles.emptyTitle}>Добро пожаловать в ИИ Репетитор!</Text>
            <Text style={styles.emptySubtitle}>
              Задавайте вопросы по математике, естественным наукам, языкам или любым учебным темам. Я предложу подходящие материалы и тесты!
            </Text>
            <View style={styles.suggestionsContainer}>
              <TouchableOpacity 
                style={styles.suggestionButton}
                onPress={() => setMessage('Расскажи про алгебру')}
              >
                <Text style={styles.suggestionText}>Алгебра</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.suggestionButton, styles.suggestionButtonGreen]}
                onPress={() => setMessage('Объясни законы физики')}
              >
                <Text style={styles.suggestionText}>Физика</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.suggestionButton, styles.suggestionButtonPurple]}
                onPress={() => setMessage('Что такое клетка в биологии?')}
              >
                <Text style={styles.suggestionText}>Биология</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.suggestionButton, styles.suggestionButtonYellow]}
                onPress={() => setMessage('Покажи мне задания по химии')}
              >
                <Text style={styles.suggestionText}>Химия</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {messages.map((msg) => (
          <View key={msg.id}>
            <View
              style={[
                styles.messageContainer,
                msg.isUser ? styles.userMessage : styles.aiMessage,
              ]}
            >
              <View style={styles.messageHeader}>
                {msg.isUser ? (
                  <User size={16} color={kidsTheme.primaryDark} />
                ) : (
                  <Image source={{ uri: mascotUrl }} style={styles.aiAvatar} accessibilityLabel="Аватар ИИ" />
                )}
                <Text style={styles.messageSender}>
                  {msg.isUser ? 'Вы' : 'ИИ Репетитор'}
                </Text>
              </View>
              <Text style={[styles.messageText, msg.isUser && styles.userMessageText]}>{msg.text}</Text>
            </View>
            {msg.task && (
              <View style={styles.taskContainer}>
                <TaskCard task={msg.task} />
              </View>
            )}
          </View>
        ))}

        {isLoading && (
          <View style={[styles.messageContainer, styles.aiMessage]}>
            <View style={styles.messageHeader}>
              <Image source={{ uri: mascotUrl }} style={styles.aiAvatar} accessibilityLabel="Аватар ИИ" />
              <Text style={styles.messageSender}>ИИ Репетитор</Text>
            </View>
            <Text style={styles.loadingText}>Думаю...</Text>
          </View>
        )}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Задайте вопрос..."
            placeholderTextColor={kidsTheme.muted}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!message.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!message.trim() || isLoading}
          >
            <Send size={20} color={(!message.trim() || isLoading) ? kidsTheme.muted : kidsTheme.surface} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  wallpaper: {
    ...StyleSheet.absoluteFillObject,
  },
  wallpaperImage: {
    opacity: 0.1,
    transform: [{ scale: 1.2 }],
  },
  wallpaperOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.bg,
    opacity: 0.85,
  },
  header: {
    backgroundColor: theme.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: theme.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.muted,
    marginTop: 4,
  },
  headerLogo: {
    width: 44,
    height: 44,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyMascot: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.surface,
    borderWidth: 2,
    borderColor: theme.border,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.muted,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  suggestionButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
  },
  suggestionButtonGreen: {
    backgroundColor: theme.secondary,
  },
  suggestionButtonPurple: {
    backgroundColor: theme.purple,
  },
  suggestionButtonYellow: {
    backgroundColor: theme.accentDark,
  },
  suggestionText: {
    color: theme.surface,
    fontSize: 14,
    fontWeight: '700',
  },
  messageContainer: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: theme.primary,
  },
  userMessageText: {
    color: theme.surface,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: theme.surface,
    borderWidth: 2,
    borderColor: theme.border,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
    color: theme.muted,
  },
  aiAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: theme.text,
  },
  loadingText: {
    fontSize: 16,
    color: theme.muted,
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: theme.surface,
    borderTopWidth: 2,
    borderTopColor: kidsTheme.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: theme.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: theme.surfaceAlt,
    color: theme.text,
  },
  sendButton: {
    backgroundColor: theme.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: theme.border,
  },
  taskContainer: {
    marginTop: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
    maxWidth: '90%',
  },
  taskCard: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  taskGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: theme.blueLight,
    opacity: 0.6,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  taskIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sparkleIcon: {
    marginLeft: 6,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: theme.muted,
    lineHeight: 20,
    marginTop: 4,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 16,
    marginTop: 12,
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: theme.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskCategory: {
    fontSize: 12,
    color: theme.text,
    fontWeight: '700',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
    marginBottom: 4,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '700',
  },
  taskTime: {
    fontSize: 12,
    color: theme.muted,
    marginLeft: 4,
  },
  taskImageContainer: {
    position: 'relative',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  taskImage: {
    width: '100%',
    height: 160,
    borderRadius: 16,
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
    padding: 8,
  },
  visualContentContainer: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: theme.surfaceAlt,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.border,
  },
  iconBadge: {
    alignSelf: 'center',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 48,
  },
  formulaContainer: {
    backgroundColor: theme.surface,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: theme.border,
  },
  formulaText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  stepsContainer: {
    marginTop: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: theme.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: theme.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  periodicElement: {
    alignSelf: 'center',
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: theme.blue,
    alignItems: 'center',
    minWidth: 100,
  },
  elementNumber: {
    fontSize: 14,
    color: theme.muted,
    marginBottom: 4,
  },
  elementSymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
  },
  elementName: {
    fontSize: 14,
    color: theme.text,
  },
  taskButton: {
    backgroundColor: theme.blue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    shadowColor: theme.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  taskButtonCompleted: {
    backgroundColor: theme.secondaryLight,
    borderWidth: 2,
    borderColor: theme.success,
  },
  taskButtonText: {
    color: theme.surface,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  taskButtonTextCompleted: {
    color: kidsTheme.success,
  },
});
