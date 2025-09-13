import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../store/theme';
import { EnhancedButton } from './EnhancedButton';
import { EnhancedCard } from './EnhancedCard';

interface ContentItem {
    id: string;
    title: string;
    description: string;
    type: 'article' | 'video' | 'audio' | 'image' | 'interactive';
    category: string;
    tags: string[];
    rating: number;
    views: number;
    createdAt: Date;
    author: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: number; // in minutes
    prerequisites?: string[];
    recommendation?: Recommendation;
}

interface UserPreference {
    id: string;
    category: string;
    weight: number; // 0-1 scale
    lastInteraction: Date;
}

interface Recommendation {
    id: string;
    contentId: string;
    score: number;
    reason: string;
    type: 'personalized' | 'trending' | 'similar' | 'new';
}

export function ContentPersonalization() {
    const { currentTheme } = useThemeStore();
    const isDark = currentTheme.name.toLowerCase().includes('dark');

    const [contentItems, setContentItems] = useState<ContentItem[]>([]);
    const [userPreferences, setUserPreferences] = useState<UserPreference[]>([]);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'views' | 'recent'>('relevance');
    const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);

    const categories = ['all', 'tutorials', 'guides', 'news', 'entertainment', 'educational'];
    const contentTypes = ['article', 'video', 'audio', 'image', 'interactive'];

    useEffect(() => {
        initializeContent();
        initializeUserPreferences();
        generateRecommendations();
    }, []);

    const initializeContent = () => {
        const mockContent: ContentItem[] = [
            {
                id: '1',
                title: 'Getting Started with AI Companions',
                description: 'A comprehensive guide to building meaningful relationships with AI assistants',
                type: 'article',
                category: 'tutorials',
                tags: ['AI', 'companions', 'relationships', 'guide'],
                rating: 4.8,
                views: 1250,
                createdAt: new Date('2024-01-15'),
                author: 'Sallie Team',
                difficulty: 'beginner',
                estimatedTime: 15,
            },
            {
                id: '2',
                title: 'Advanced Conversation Techniques',
                description: 'Master the art of engaging conversations with AI personalities',
                type: 'video',
                category: 'tutorials',
                tags: ['conversation', 'techniques', 'advanced', 'communication'],
                rating: 4.9,
                views: 890,
                createdAt: new Date('2024-01-20'),
                author: 'Dr. AI Psychology',
                difficulty: 'intermediate',
                estimatedTime: 25,
            },
            {
                id: '3',
                title: 'The Future of Human-AI Collaboration',
                description: 'Exploring upcoming trends and innovations in AI companionship',
                type: 'article',
                category: 'news',
                tags: ['future', 'trends', 'innovation', 'collaboration'],
                rating: 4.6,
                views: 2100,
                createdAt: new Date('2024-01-25'),
                author: 'Tech Analyst',
                difficulty: 'intermediate',
                estimatedTime: 20,
            },
            {
                id: '4',
                title: 'Mindfulness Meditation with AI',
                description: 'Guided meditation sessions enhanced by AI personalization',
                type: 'audio',
                category: 'educational',
                tags: ['meditation', 'mindfulness', 'wellness', 'personalization'],
                rating: 4.7,
                views: 750,
                createdAt: new Date('2024-01-18'),
                author: 'Wellness AI',
                difficulty: 'beginner',
                estimatedTime: 30,
            },
            {
                id: '5',
                title: 'Interactive AI Personality Quiz',
                description: 'Discover your ideal AI companion personality type',
                type: 'interactive',
                category: 'entertainment',
                tags: ['quiz', 'personality', 'interactive', 'fun'],
                rating: 4.5,
                views: 3200,
                createdAt: new Date('2024-01-22'),
                author: 'Personality Lab',
                difficulty: 'beginner',
                estimatedTime: 10,
            },
            {
                id: '6',
                title: 'Building Custom AI Workflows',
                description: 'Create personalized automation workflows with AI assistance',
                type: 'video',
                category: 'guides',
                tags: ['workflows', 'automation', 'customization', 'productivity'],
                rating: 4.4,
                views: 650,
                createdAt: new Date('2024-01-28'),
                author: 'Workflow Expert',
                difficulty: 'advanced',
                estimatedTime: 35,
                prerequisites: ['Basic AI knowledge', 'Workflow concepts'],
            },
        ];
        setContentItems(mockContent);
    };

    const initializeUserPreferences = () => {
        const mockPreferences: UserPreference[] = [
            {
                id: '1',
                category: 'tutorials',
                weight: 0.8,
                lastInteraction: new Date('2024-01-30'),
            },
            {
                id: '2',
                category: 'educational',
                weight: 0.6,
                lastInteraction: new Date('2024-01-28'),
            },
            {
                id: '3',
                category: 'entertainment',
                weight: 0.4,
                lastInteraction: new Date('2024-01-25'),
            },
            {
                id: '4',
                category: 'news',
                weight: 0.3,
                lastInteraction: new Date('2024-01-20'),
            },
        ];
        setUserPreferences(mockPreferences);
    };

    const generateRecommendations = async () => {
        setIsGeneratingRecommendations(true);

        // Simulate AI recommendation generation
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockRecommendations: Recommendation[] = [
            {
                id: '1',
                contentId: '2',
                score: 0.95,
                reason: 'Based on your interest in tutorials and conversation techniques',
                type: 'personalized',
            },
            {
                id: '2',
                contentId: '6',
                score: 0.88,
                reason: 'Advanced content matching your skill level',
                type: 'personalized',
            },
            {
                id: '3',
                contentId: '3',
                score: 0.82,
                reason: 'Trending in your preferred categories',
                type: 'trending',
            },
            {
                id: '4',
                contentId: '4',
                score: 0.75,
                reason: 'Similar to content you\'ve enjoyed',
                type: 'similar',
            },
            {
                id: '5',
                contentId: '5',
                score: 0.70,
                reason: 'New interactive content available',
                type: 'new',
            },
        ];

        setRecommendations(mockRecommendations);
        setIsGeneratingRecommendations(false);
    };

    const updateUserPreference = (category: string, interaction: boolean = true) => {
        setUserPreferences(prev =>
            prev.map(pref => {
                if (pref.category === category) {
                    const newWeight = interaction
                        ? Math.min(1, pref.weight + 0.1)
                        : Math.max(0, pref.weight - 0.05);
                    return {
                        ...pref,
                        weight: newWeight,
                        lastInteraction: new Date(),
                    };
                }
                return pref;
            })
        );
    };

    const filteredContent = useMemo(() => {
        let filtered = contentItems;

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(item => item.category === selectedCategory);
        }

        // Sort content
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'rating':
                    return b.rating - a.rating;
                case 'views':
                    return b.views - a.views;
                case 'recent':
                    return b.createdAt.getTime() - a.createdAt.getTime();
                case 'relevance':
                default:
                    // Simple relevance based on user preferences
                    const aPref = userPreferences.find(p => p.category === a.category)?.weight || 0;
                    const bPref = userPreferences.find(p => p.category === b.category)?.weight || 0;
                    return bPref - aPref;
            }
        });

        return filtered;
    }, [contentItems, searchQuery, selectedCategory, sortBy, userPreferences]);

    const getRecommendedContent = (): ContentItem[] => {
        const result: ContentItem[] = [];
        recommendations.forEach(rec => {
            const content = contentItems.find(item => item.id === rec.contentId);
            if (content) {
                result.push({ ...content, recommendation: rec });
            }
        });
        return result;
    };

    const renderContentItem = ({ item }: { item: ContentItem }) => (
        <EnhancedCard
            variant="glass"
            style={styles.contentCard}
            onPress={() => {
                updateUserPreference(item.category);
                Alert.alert('Content Selected', `Opening: ${item.title}`);
            }}
        >
            <View style={styles.contentHeader}>
                <View style={styles.contentInfo}>
                    <Text style={styles.contentTitle}>{item.title}</Text>
                    <Text style={styles.contentDescription}>{item.description}</Text>
                </View>
                <View style={styles.contentMeta}>
                    <Text style={styles.contentType}>{item.type}</Text>
                    <Text style={styles.contentRating}>⭐ {item.rating}</Text>
                </View>
            </View>

            <View style={styles.contentDetails}>
                <View style={styles.contentStats}>
                    <Text style={styles.contentViews}>{item.views} views</Text>
                    <Text style={styles.contentTime}>{item.estimatedTime} min</Text>
                </View>
                <View style={styles.contentTags}>
                    {item.tags.slice(0, 3).map(tag => (
                        <Text key={tag} style={styles.contentTag}>{tag}</Text>
                    ))}
                </View>
            </View>

            <Text style={styles.contentAuthor}>By {item.author}</Text>
        </EnhancedCard>
    );

    const renderFilters = () => (
        <View style={styles.filtersContainer}>
            <TextInput
                style={styles.searchInput}
                placeholder="Search content..."
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
                {categories.map(category => (
                    <TouchableOpacity
                        key={category}
                        style={[
                            styles.categoryButton,
                            selectedCategory === category && styles.categoryButtonActive,
                        ]}
                        onPress={() => setSelectedCategory(category)}
                    >
                        <Text style={[
                            styles.categoryText,
                            selectedCategory === category && styles.categoryTextActive,
                        ]}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.sortContainer}>
                <Text style={styles.sortLabel}>Sort by:</Text>
                {(['relevance', 'rating', 'views', 'recent'] as const).map(sort => (
                    <TouchableOpacity
                        key={sort}
                        style={[
                            styles.sortButton,
                            sortBy === sort && styles.sortButtonActive,
                        ]}
                        onPress={() => setSortBy(sort)}
                    >
                        <Text style={[
                            styles.sortText,
                            sortBy === sort && styles.sortTextActive,
                        ]}>
                            {sort.charAt(0).toUpperCase() + sort.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderRecommendations = () => (
        <View style={styles.recommendationsContainer}>
            <View style={styles.recommendationsHeader}>
                <Text style={styles.sectionTitle}>Recommended for You</Text>
                <EnhancedButton
                    title="Refresh"
                    variant="outline"
                    onPress={generateRecommendations}
                    disabled={isGeneratingRecommendations}
                    style={styles.refreshButton}
                />
            </View>

            {isGeneratingRecommendations ? (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Generating recommendations...</Text>
                </View>
            ) : (
                <FlatList
                    data={getRecommendedContent()}
                    renderItem={renderContentItem}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.recommendationsList}
                />
            )}
        </View>
    );

    const renderUserPreferences = () => (
        <View style={styles.preferencesContainer}>
            <Text style={styles.sectionTitle}>Your Preferences</Text>
            {userPreferences.map(pref => (
                <EnhancedCard key={pref.id} variant="glass" style={styles.preferenceCard}>
                    <View style={styles.preferenceHeader}>
                        <Text style={styles.preferenceCategory}>
                            {pref.category.charAt(0).toUpperCase() + pref.category.slice(1)}
                        </Text>
                        <View style={styles.preferenceWeight}>
                            <View style={styles.weightBar}>
                                <View
                                    style={[
                                        styles.weightFill,
                                        { width: `${pref.weight * 100}%` },
                                    ]}
                                />
                            </View>
                            <Text style={styles.weightText}>{Math.round(pref.weight * 100)}%</Text>
                        </View>
                    </View>
                    <Text style={styles.preferenceLastInteraction}>
                        Last interaction: {pref.lastInteraction.toLocaleDateString()}
                    </Text>
                </EnhancedCard>
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Content & Personalization</Text>

            {/* Filters */}
            {renderFilters()}

            {/* Recommendations */}
            {renderRecommendations()}

            {/* User Preferences */}
            {renderUserPreferences()}

            {/* Content List */}
            <View style={styles.contentContainer}>
                <Text style={styles.sectionTitle}>
                    Content ({filteredContent.length} items)
                </Text>
                <FlatList
                    data={filteredContent}
                    renderItem={renderContentItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.contentList}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f5f5f5',
        marginBottom: 16,
        fontFamily: 'SpaceMono',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f5f5f5',
        marginBottom: 16,
        fontFamily: 'SpaceMono',
    },
    filtersContainer: {
        marginBottom: 24,
    },
    searchInput: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: 12,
        color: '#f5f5f5',
        fontSize: 16,
        marginBottom: 12,
        fontFamily: 'SpaceMono',
    },
    categoryFilter: {
        marginBottom: 12,
    },
    categoryButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    categoryButtonActive: {
        backgroundColor: '#FFD700',
    },
    categoryText: {
        color: '#888',
        fontSize: 14,
        fontFamily: 'SpaceMono',
    },
    categoryTextActive: {
        color: '#000',
        fontWeight: 'bold',
    },
    sortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    sortLabel: {
        color: '#f5f5f5',
        fontSize: 14,
        marginRight: 8,
        fontFamily: 'SpaceMono',
    },
    sortButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 4,
    },
    sortButtonActive: {
        backgroundColor: '#FFD700',
    },
    sortText: {
        color: '#888',
        fontSize: 12,
        fontFamily: 'SpaceMono',
    },
    sortTextActive: {
        color: '#000',
        fontWeight: 'bold',
    },
    recommendationsContainer: {
        marginBottom: 24,
    },
    recommendationsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    refreshButton: {
        minWidth: 80,
    },
    loadingContainer: {
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    recommendationsList: {
        paddingVertical: 8,
    },
    preferencesContainer: {
        marginBottom: 24,
    },
    preferenceCard: {
        padding: 16,
        marginBottom: 8,
    },
    preferenceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    preferenceCategory: {
        fontSize: 16,
        color: '#f5f5f5',
        fontWeight: 'bold',
        fontFamily: 'SpaceMono',
    },
    preferenceWeight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    weightBar: {
        width: 60,
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 3,
        marginRight: 8,
    },
    weightFill: {
        height: '100%',
        backgroundColor: '#FFD700',
        borderRadius: 3,
    },
    weightText: {
        color: '#f5f5f5',
        fontSize: 12,
        fontFamily: 'SpaceMono',
    },
    preferenceLastInteraction: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    contentContainer: {
        flex: 1,
    },
    contentList: {
        paddingBottom: 20,
    },
    contentCard: {
        padding: 16,
        marginBottom: 8,
    },
    contentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    contentInfo: {
        flex: 1,
    },
    contentTitle: {
        fontSize: 16,
        color: '#f5f5f5',
        fontWeight: 'bold',
        marginBottom: 4,
        fontFamily: 'SpaceMono',
    },
    contentDescription: {
        fontSize: 14,
        color: '#ccc',
        fontFamily: 'SpaceMono',
    },
    contentMeta: {
        alignItems: 'flex-end',
    },
    contentType: {
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
        fontFamily: 'SpaceMono',
    },
    contentRating: {
        fontSize: 14,
        color: '#FFD700',
        fontFamily: 'SpaceMono',
    },
    contentDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    contentStats: {
        flexDirection: 'row',
        gap: 12,
    },
    contentViews: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    contentTime: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    contentTags: {
        flexDirection: 'row',
        gap: 4,
    },
    contentTag: {
        backgroundColor: 'rgba(255,215,0,0.2)',
        color: '#FFD700',
        fontSize: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        fontFamily: 'SpaceMono',
    },
    contentAuthor: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
});
