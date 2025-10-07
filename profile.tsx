import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { User, Trophy, BookOpen, Brain, TrendingUp, Calendar } from 'lucide-react-native';
import { useTutorStore } from '@/store/tutorStore';
import { kidsTheme } from '@/constants/colors';

export default function ProfileScreen() {
  const { testResults, messages } = useTutorStore();
  const insets = useSafeAreaInsets();

  const totalTests = testResults.length;
  const averageScore = totalTests > 0 
    ? Math.round(testResults.reduce((sum, result) => sum + result.score, 0) / totalTests)
    : 0;
  const totalQuestions = messages.length;
  const recentActivity = testResults.slice(-3).reverse();

  const getScoreColor = (score: number) => {
    if (score >= 80) return kidsTheme.success;
    if (score >= 60) return kidsTheme.warning;
    return kidsTheme.danger;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ваш прогресс</Text>
        <Text style={styles.headerSubtitle}>Отслеживайте свой путь обучения</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <User size={32} color={kidsTheme.primaryDark} />
          </View>
          <Text style={styles.profileName}>Энтузиаст обучения</Text>
          <Text style={styles.profileSubtitle}>Продолжайте в том же духе!</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Trophy size={24} color={kidsTheme.accentDark} />
            <Text style={styles.statNumber}>{averageScore}%</Text>
            <Text style={styles.statLabel}>Средний балл</Text>
          </View>
          
          <View style={styles.statCard}>
            <Brain size={24} color={kidsTheme.purple} />
            <Text style={styles.statNumber}>{totalTests}</Text>
            <Text style={styles.statLabel}>Тестов пройдено</Text>
          </View>
          
          <View style={styles.statCard}>
            <BookOpen size={24} color={kidsTheme.success} />
            <Text style={styles.statNumber}>{totalQuestions}</Text>
            <Text style={styles.statLabel}>Вопросов задано</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color={kidsTheme.primaryDark} />
            <Text style={styles.sectionTitle}>Недавняя активность</Text>
          </View>
          
          {recentActivity.length > 0 ? (
            <View style={styles.activityContainer}>
              {recentActivity.map((result, index) => (
                <View key={`${result.quizId}-${index}`} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Brain size={16} color={kidsTheme.muted} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{result.quizTitle}</Text>
                    <Text style={styles.activityDate}>
                      {formatDate(result.completedAt)}
                    </Text>
                  </View>
                  <View style={[styles.scoreContainer, { backgroundColor: getScoreColor(result.score) + '20' }]}>
                    <Text style={[styles.scoreText, { color: getScoreColor(result.score) }]}>
                      {result.score}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Brain size={32} color="#94a3b8" />
              <Text style={styles.emptyTitle}>Тесты ещё не пройдены</Text>
              <Text style={styles.emptySubtitle}>
                Пройдите первый тест, чтобы увидеть свой прогресс здесь
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={kidsTheme.primaryDark} />
            <Text style={styles.sectionTitle}>Серия обучения</Text>
          </View>
          
          <View style={styles.streakContainer}>
            <View style={styles.streakCard}>
              <Text style={styles.streakNumber}>7</Text>
              <Text style={styles.streakLabel}>Дней</Text>
            </View>
            <View style={styles.streakInfo}>
              <Text style={styles.streakTitle}>Отличная работа!</Text>
              <Text style={styles.streakDescription}>
                Вы учитесь последовательно. Продолжайте в том же духе, чтобы сохранить серию!
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Достижения</Text>
          
          <View style={styles.achievementsContainer}>
            <View style={[styles.achievementCard, totalTests >= 1 && styles.achievementUnlocked]}>
              <Trophy size={20} color={totalTests >= 1 ? kidsTheme.accentDark : "#94a3b8"} />
              <Text style={[styles.achievementTitle, totalTests >= 1 && styles.achievementTitleUnlocked]}>
                Первые шаги
              </Text>
              <Text style={styles.achievementDescription}>Пройдите свой первый тест</Text>
            </View>
            
            <View style={[styles.achievementCard, totalTests >= 5 && styles.achievementUnlocked]}>
              <Brain size={20} color={totalTests >= 5 ? kidsTheme.purple : "#94a3b8"} />
              <Text style={[styles.achievementTitle, totalTests >= 5 && styles.achievementTitleUnlocked]}>
                Мастер тестов
              </Text>
              <Text style={styles.achievementDescription}>Пройдите 5 тестов</Text>
            </View>
            
            <View style={[styles.achievementCard, averageScore >= 80 && styles.achievementUnlocked]}>
              <TrendingUp size={20} color={averageScore >= 80 ? kidsTheme.success : "#94a3b8"} />
              <Text style={[styles.achievementTitle, averageScore >= 80 && styles.achievementTitleUnlocked]}>
                Отличник
              </Text>
              <Text style={styles.achievementDescription}>Поддерживайте средний балл 80%</Text>
            </View>
          </View>
        </View>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    backgroundColor: kidsTheme.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: kidsTheme.border,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: kidsTheme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: kidsTheme.text,
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: 14,
    color: kidsTheme.muted,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: kidsTheme.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: kidsTheme.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: kidsTheme.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: kidsTheme.muted,
    textAlign: 'center',
  },
  section: {
    backgroundColor: kidsTheme.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: kidsTheme.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: kidsTheme.text,
    marginLeft: 8,
  },
  activityContainer: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: kidsTheme.surfaceAlt,
    borderRadius: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: kidsTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: kidsTheme.text,
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    color: kidsTheme.muted,
  },
  scoreContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: kidsTheme.muted,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakCard: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: kidsTheme.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: kidsTheme.primaryDark,
  },
  streakLabel: {
    fontSize: 12,
    color: kidsTheme.muted,
    marginTop: 2,
  },
  streakInfo: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: kidsTheme.text,
    marginBottom: 4,
  },
  streakDescription: {
    fontSize: 14,
    color: kidsTheme.muted,
    lineHeight: 20,
  },
  achievementsContainer: {
    gap: 12,
    marginTop: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: kidsTheme.surfaceAlt,
    borderRadius: 12,
    opacity: 0.6,
  },
  achievementUnlocked: {
    backgroundColor: kidsTheme.surface,
    borderWidth: 2,
    borderColor: kidsTheme.border,
    opacity: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: kidsTheme.muted,
    marginLeft: 12,
    marginBottom: 2,
  },
  achievementTitleUnlocked: {
    color: kidsTheme.text,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 12,
  },
});
