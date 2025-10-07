import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Modal,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, BookOpen, Play, Clock, Star, X, FileText } from 'lucide-react-native';
import { materials, Material } from '@/data/materials';
import { WebView } from 'react-native-webview';
import { kidsTheme } from '@/constants/colors';

const categories = ['Все', 'Математика', 'Физика', 'Химия', 'Биология', 'Языки', 'История', 'Программирование', 'География', 'Астрономия'];

export default function LibraryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const getCategoryInEnglish = (russianCategory: string) => {
    const categoryMap: { [key: string]: string } = {
      'Все': 'All',
      'Математика': 'Mathematics',
      'Физика': 'Physics',
      'Химия': 'Chemistry',
      'Биология': 'Biology',
      'Языки': 'Languages',
      'История': 'History',
      'Программирование': 'Computer Science',
      'География': 'Geography',
      'Астрономия': 'Astronomy',
      'Литература': 'Literature'
    };
    return categoryMap[russianCategory] || russianCategory;
  };

  const getDifficultyInRussian = (difficulty: string) => {
    const difficultyMap: { [key: string]: string } = {
      'Beginner': 'Начальный',
      'Intermediate': 'Средний',
      'Advanced': 'Продвинутый'
    };
    return difficultyMap[difficulty] || difficulty;
  };

  const handleCategorySelect = (category: string) => {
    if (!category || category.length > 50) return;
    const sanitized = category.trim();
    if (!sanitized) return;
    setSelectedCategory(sanitized);
  };

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Все' || getCategoryInEnglish(selectedCategory) === material.category;
    return matchesSearch && matchesCategory;
  });

  const handleMaterialPress = (material: Material) => {
    setSelectedMaterial(material);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedMaterial(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play size={14} color={kidsTheme.muted} />;
      case 'interactive':
        return <FileText size={14} color={kidsTheme.muted} />;
      default:
        return <BookOpen size={14} color={kidsTheme.muted} />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'video':
        return 'Видео';
      case 'interactive':
        return 'Интерактив';
      default:
        return 'Статья';
    }
  };

  const renderMaterial = (material: Material) => (
    <TouchableOpacity 
      key={material.id} 
      style={styles.materialCard}
      onPress={() => handleMaterialPress(material)}
    >
      <View style={styles.materialImageContainer}>
        <Image source={{ uri: material.image }} style={styles.materialImage} />
        {material.type === 'video' && (
          <View style={styles.playOverlay}>
            <Play size={32} color={kidsTheme.surface} fill={kidsTheme.surface} />
          </View>
        )}
      </View>
      <View style={styles.materialContent}>
        <View style={styles.materialHeader}>
          <Text style={styles.materialTitle}>{material.title}</Text>
          <View style={styles.ratingContainer}>
            <Star size={14} color={kidsTheme.accentDark} fill={kidsTheme.accentDark} />
            <Text style={styles.rating}>{material.rating}</Text>
          </View>
        </View>
        
        <Text style={styles.materialDescription} numberOfLines={2}>
          {material.description}
        </Text>
        
        <View style={styles.materialFooter}>
          <View style={styles.materialMeta}>
            {getTypeIcon(material.type)}
            <Text style={styles.materialType}>
              {getTypeText(material.type)}
            </Text>
            {material.duration && (
              <>
                <Clock size={14} color={kidsTheme.muted} />
                <Text style={styles.materialDuration}>{material.duration}</Text>
              </>
            )}
          </View>
          <View style={[styles.difficultyBadge, styles[`difficulty${material.difficulty}`]]}>
            <Text style={[styles.difficultyText, styles[`difficulty${material.difficulty}Text`]]}>
              {getDifficultyInRussian(material.difficulty)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Image
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/ubtx59hpn211f5nqi0i24' }}
            style={styles.headerLogo}
            accessibilityLabel="Логотип приложения"
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Библиотека обучения</Text>
            <Text style={styles.headerSubtitle}>Откройте для себя учебные материалы</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={kidsTheme.muted} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Поиск материалов..."
            placeholderTextColor={kidsTheme.muted}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive,
            ]}
            onPress={() => handleCategorySelect(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.materialsContainer}
        contentContainerStyle={styles.materialsContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.resultsText}>
          Найдено материалов: {filteredMaterials.length}
        </Text>
        
        {filteredMaterials.map(renderMaterial)}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <X size={24} color={kidsTheme.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle} numberOfLines={2}>
              {selectedMaterial?.title}
            </Text>
          </View>

          {selectedMaterial?.type === 'video' && selectedMaterial.videoUrl ? (
            Platform.OS === 'web' ? (
              <View style={styles.webVideoContainer}>
                <iframe
                  src={selectedMaterial.videoUrl}
                  style={styles.webIframe}
                  allowFullScreen
                />
              </View>
            ) : (
              <WebView
                source={{ uri: selectedMaterial.videoUrl }}
                style={styles.videoPlayer}
                allowsFullscreenVideo
                javaScriptEnabled
                domStorageEnabled
                startInLoadingState
                mediaPlaybackRequiresUserAction={false}
              />
            )
          ) : (
            <ScrollView style={styles.contentContainer}>
              <Image 
                source={{ uri: selectedMaterial?.image }} 
                style={styles.contentImage}
              />
              <View style={styles.contentBody}>
                <Text style={styles.contentDescription}>
                  {selectedMaterial?.description}
                </Text>
                {selectedMaterial?.content && (
                  <Text style={styles.contentText}>
                    {selectedMaterial.content}
                  </Text>
                )}
                <View style={styles.contentMeta}>
                  <View style={styles.metaRow}>
                    {getTypeIcon(selectedMaterial?.type || 'article')}
                    <Text style={styles.metaText}>
                      {getTypeText(selectedMaterial?.type || 'article')}
                    </Text>
                  </View>
                  {selectedMaterial?.duration && (
                    <View style={styles.metaRow}>
                      <Clock size={16} color={kidsTheme.muted} />
                      <Text style={styles.metaText}>{selectedMaterial.duration}</Text>
                    </View>
                  )}
                  <View style={styles.metaRow}>
                    <Star size={16} color={kidsTheme.accentDark} fill={kidsTheme.accentDark} />
                    <Text style={styles.metaText}>{selectedMaterial?.rating}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
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
  headerLogo: {
    width: 44,
    height: 44,
    marginRight: 12,
    borderRadius: 8,
  },
  searchContainer: {
    backgroundColor: kidsTheme.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: kidsTheme.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: kidsTheme.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: kidsTheme.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: kidsTheme.text,
  },
  categoriesContainer: {
    backgroundColor: kidsTheme.surface,
    borderBottomWidth: 2,
    borderBottomColor: kidsTheme.border,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: kidsTheme.accentLight,
    marginRight: 12,
  },
  categoryButtonActive: {
    backgroundColor: kidsTheme.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '700',
    color: kidsTheme.text,
  },
  categoryTextActive: {
    color: kidsTheme.surface,
  },
  materialsContainer: {
    flex: 1,
  },
  materialsContent: {
    padding: 20,
  },
  resultsText: {
    fontSize: 14,
    color: kidsTheme.muted,
    marginBottom: 16,
  },
  materialCard: {
    backgroundColor: kidsTheme.surface,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: kidsTheme.border,
  },
  materialImageContainer: {
    position: 'relative',
  },
  materialImage: {
    width: '100%',
    height: 160,
    backgroundColor: kidsTheme.surfaceAlt,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  materialContent: {
    padding: 16,
  },
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  materialTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: kidsTheme.text,
    flex: 1,
    marginRight: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '700',
    color: kidsTheme.muted,
    marginLeft: 4,
  },
  materialDescription: {
    fontSize: 14,
    color: kidsTheme.muted,
    lineHeight: 20,
    marginBottom: 12,
  },
  materialFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  materialMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  materialType: {
    fontSize: 12,
    color: kidsTheme.muted,
    marginLeft: 4,
    marginRight: 8,
  },
  materialDuration: {
    fontSize: 12,
    color: kidsTheme.muted,
    marginLeft: 4,
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
  modalContainer: {
    flex: 1,
    backgroundColor: kidsTheme.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: kidsTheme.border,
  },
  closeButton: {
    padding: 8,
    marginRight: 12,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: kidsTheme.text,
  },
  videoPlayer: {
    flex: 1,
  },
  webVideoContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  contentContainer: {
    flex: 1,
  },
  contentImage: {
    width: '100%',
    height: 200,
    backgroundColor: kidsTheme.surfaceAlt,
  },
  contentBody: {
    padding: 20,
  },
  contentDescription: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 16,
  },
  contentText: {
    fontSize: 14,
    color: kidsTheme.muted,
    lineHeight: 22,
    marginBottom: 20,
  },
  contentMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: kidsTheme.border,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: kidsTheme.muted,
  },
  webIframe: {
    width: '100%' as any,
    height: 400,
    border: 'none' as any,
  },
});
