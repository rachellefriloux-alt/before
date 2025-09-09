import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { EnhancedButton } from '../components/EnhancedButton';
import { EnhancedCard } from '../components/EnhancedCard';

export interface UserPreferences {
    id: string;
    genres: string[];
    mood: string[];
    activity: string[];
    timeOfDay: string;
    duration: 'short' | 'medium' | 'long';
    contentType: ContentType[];
    rating: number;
    updatedAt: Date;
}

export interface EntertainmentItem {
    id: string;
    title: string;
    type: ContentType;
    genre: string[];
    description: string;
    duration: number; // minutes
    rating: number;
    mood: string[];
    activity: string[];
    platform: string[];
    url?: string;
    imageUrl?: string;
    tags: string[];
}

export type ContentType =
    | 'movie'
    | 'tv_show'
    | 'book'
    | 'podcast'
    | 'music'
    | 'game'
    | 'article'
    | 'video'
    | 'audiobook';

export type MoodType =
    | 'happy'
    | 'sad'
    | 'excited'
    | 'relaxed'
    | 'adventurous'
    | 'thoughtful'
    | 'energetic'
    | 'calm';

export type ActivityType =
    | 'alone'
    | 'with_friends'
    | 'with_family'
    | 'commute'
    | 'workout'
    | 'bedtime'
    | 'party'
    | 'learning';

interface EntertainmentRecommenderProps {
    currentMood?: MoodType;
    currentActivity?: ActivityType;
    timeOfDay?: string;
    onRecommendationSelect?: (item: EntertainmentItem) => void;
}

export const EntertainmentRecommender: React.FC<EntertainmentRecommenderProps> = ({
    currentMood,
    currentActivity,
    timeOfDay,
    onRecommendationSelect
}) => {
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [recommendations, setRecommendations] = useState<EntertainmentItem[]>([]);
    const [currentMoodState, setCurrentMoodState] = useState<MoodType | undefined>(currentMood);
    const [currentActivityState, setCurrentActivityState] = useState<ActivityType | undefined>(currentActivity);
    const [showPreferences, setShowPreferences] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadUserPreferences();
        loadEntertainmentDatabase();
    }, []);

    useEffect(() => {
        if (preferences) {
            generateRecommendations();
        }
    }, [preferences, currentMoodState, currentActivityState]);

    const loadUserPreferences = async () => {
        try {
            const stored = await AsyncStorage.getItem('entertainment_preferences');
            if (stored) {
                const parsedPrefs = JSON.parse(stored);
                parsedPrefs.updatedAt = new Date(parsedPrefs.updatedAt);
                setPreferences(parsedPrefs);
            } else {
                // Create default preferences
                const defaultPrefs: UserPreferences = {
                    id: 'user_prefs',
                    genres: ['drama', 'comedy', 'documentary'],
                    mood: ['relaxed', 'happy'],
                    activity: ['alone', 'commute'],
                    timeOfDay: 'evening',
                    duration: 'medium',
                    contentType: ['movie', 'tv_show', 'book'],
                    rating: 7,
                    updatedAt: new Date()
                };
                setPreferences(defaultPrefs);
                await AsyncStorage.setItem('entertainment_preferences', JSON.stringify(defaultPrefs));
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
    };

    const loadEntertainmentDatabase = async () => {
        // In a real app, this would load from a database or API
        // For now, we'll create a sample database
        const sampleItems: EntertainmentItem[] = [
            {
                id: '1',
                title: 'The Shawshank Redemption',
                type: 'movie',
                genre: ['drama', 'crime'],
                description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
                duration: 142,
                rating: 9.3,
                mood: ['thoughtful', 'sad'],
                activity: ['alone', 'with_friends'],
                platform: ['netflix', 'amazon'],
                tags: ['classic', 'inspiring', 'prison']
            },
            {
                id: '2',
                title: 'Serial Podcast',
                type: 'podcast',
                genre: ['true_crime', 'investigative'],
                description: 'A podcast that investigates a different story from the news, told week by week.',
                duration: 45,
                rating: 8.7,
                mood: ['curious', 'thoughtful'],
                activity: ['commute', 'alone'],
                platform: ['spotify', 'apple_podcasts'],
                tags: ['investigative', 'true_crime', 'storytelling']
            },
            {
                id: '3',
                title: 'The Great Gatsby',
                type: 'book',
                genre: ['classic', 'literary_fiction'],
                description: 'A classic American novel set in the Jazz Age on Long Island.',
                duration: 180,
                rating: 8.0,
                mood: ['thoughtful', 'relaxed'],
                activity: ['alone', 'bedtime'],
                platform: ['kindle', 'physical_book'],
                tags: ['classic', 'american_literature', 'jazz_age']
            },
            {
                id: '4',
                title: 'Ted Lasso',
                type: 'tv_show',
                genre: ['comedy', 'sports'],
                description: 'An American football coach is hired to manage a British soccer team.',
                duration: 30,
                rating: 8.8,
                mood: ['happy', 'relaxed'],
                activity: ['with_friends', 'family'],
                platform: ['apple_tv', 'netflix'],
                tags: ['feel_good', 'sports', 'comedy']
            },
            {
                id: '5',
                title: 'Chillhop Radio',
                type: 'music',
                genre: ['lofi', 'hip_hop'],
                description: 'A 24/7 stream of chill beats to relax and study to.',
                duration: 0, // streaming
                rating: 8.5,
                mood: ['relaxed', 'calm'],
                activity: ['commute', 'workout', 'study'],
                platform: ['spotify', 'youtube'],
                tags: ['lofi', 'beats', 'relaxing']
            }
        ];

        // Store in AsyncStorage for persistence
        await AsyncStorage.setItem('entertainment_database', JSON.stringify(sampleItems));
    };

    const generateRecommendations = async () => {
        if (!preferences) return;

        setIsLoading(true);
        try {
            const database = await AsyncStorage.getItem('entertainment_database');
            if (!database) return;

            const allItems: EntertainmentItem[] = JSON.parse(database);
            let filteredItems = [...allItems];

            // Filter by user preferences
            if (preferences.genres.length > 0) {
                filteredItems = filteredItems.filter(item =>
                    item.genre.some(genre => preferences.genres.includes(genre))
                );
            }

            // Filter by mood
            const moodToCheck = currentMoodState || preferences.mood[0];
            if (moodToCheck) {
                filteredItems = filteredItems.filter(item =>
                    item.mood.includes(moodToCheck)
                );
            }

            // Filter by activity
            const activityToCheck = currentActivityState || preferences.activity[0];
            if (activityToCheck) {
                filteredItems = filteredItems.filter(item =>
                    item.activity.includes(activityToCheck)
                );
            }

            // Filter by content type
            filteredItems = filteredItems.filter(item =>
                preferences.contentType.includes(item.type)
            );

            // Filter by rating
            filteredItems = filteredItems.filter(item =>
                item.rating >= preferences.rating
            );

            // Sort by relevance (simple scoring system)
            filteredItems.sort((a, b) => {
                let scoreA = 0;
                let scoreB = 0;

                // Higher rating gets higher score
                scoreA += a.rating * 10;
                scoreB += b.rating * 10;

                // Preferred genres get bonus
                const genreOverlapA = a.genre.filter(g => preferences.genres.includes(g)).length;
                const genreOverlapB = b.genre.filter(g => preferences.genres.includes(g)).length;
                scoreA += genreOverlapA * 5;
                scoreB += genreOverlapB * 5;

                return scoreB - scoreA;
            });

            // Take top 10 recommendations
            setRecommendations(filteredItems.slice(0, 10));
        } catch (error) {
            console.error('Error generating recommendations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updatePreferences = async (newPrefs: Partial<UserPreferences>) => {
        if (!preferences) return;

        const updatedPrefs = {
            ...preferences,
            ...newPrefs,
            updatedAt: new Date()
        };

        setPreferences(updatedPrefs);
        await AsyncStorage.setItem('entertainment_preferences', JSON.stringify(updatedPrefs));
    };

    const handleMoodChange = (mood: MoodType) => {
        setCurrentMoodState(mood);
    };

    const handleActivityChange = (activity: ActivityType) => {
        setCurrentActivityState(activity);
    };

    const getMoodEmoji = (mood: MoodType) => {
        const emojis = {
            happy: '😊',
            sad: '😢',
            excited: '🤩',
            relaxed: '😌',
            adventurous: '🗺️',
            thoughtful: '🤔',
            energetic: '⚡',
            calm: '🧘'
        };
        return emojis[mood] || '😊';
    };

    const getActivityEmoji = (activity: ActivityType) => {
        const emojis = {
            alone: '👤',
            with_friends: '👥',
            with_family: '👨‍👩‍👧‍👦',
            commute: '🚗',
            workout: '💪',
            bedtime: '😴',
            party: '🎉',
            learning: '📚'
        };
        return emojis[activity] || '👤';
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <ThemedText style={styles.title}>Entertainment Recommender</ThemedText>

                {/* Current Context */}
                <EnhancedCard style={styles.contextCard}>
                    <ThemedText style={styles.sectionTitle}>Current Context</ThemedText>
                    <View style={styles.contextRow}>
                        <ThemedText style={styles.contextLabel}>Mood:</ThemedText>
                        <View style={styles.moodSelector}>
                            {(['happy', 'sad', 'excited', 'relaxed', 'adventurous', 'thoughtful', 'energetic', 'calm'] as MoodType[]).map(mood => (
                                <EnhancedButton
                                    key={mood}
                                    label={`${getMoodEmoji(mood)} ${mood}`}
                                    onPress={() => handleMoodChange(mood)}
                                    style={[
                                        styles.contextButton,
                                        currentMoodState === mood && styles.selectedContextButton
                                    ]}
                                />
                            ))}
                        </View>
                    </View>

                    <View style={styles.contextRow}>
                        <ThemedText style={styles.contextLabel}>Activity:</ThemedText>
                        <View style={styles.activitySelector}>
                            {(['alone', 'with_friends', 'with_family', 'commute', 'workout', 'bedtime', 'party', 'learning'] as ActivityType[]).map(activity => (
                                <EnhancedButton
                                    key={activity}
                                    label={`${getActivityEmoji(activity)} ${activity.replace('_', ' ')}`}
                                    onPress={() => handleActivityChange(activity)}
                                    style={[
                                        styles.contextButton,
                                        currentActivityState === activity && styles.selectedContextButton
                                    ]}
                                />
                            ))}
                        </View>
                    </View>
                </EnhancedCard>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <EnhancedButton
                        label="Update Preferences"
                        onPress={() => setShowPreferences(true)}
                        style={styles.actionButton}
                    />
                    <EnhancedButton
                        label="Refresh Recommendations"
                        onPress={generateRecommendations}
                        style={styles.actionButton}
                    />
                </View>

                {/* Recommendations */}
                <View style={styles.recommendations}>
                    <ThemedText style={styles.sectionTitle}>
                        {isLoading ? 'Finding perfect matches...' : `Recommendations (${recommendations.length})`}
                    </ThemedText>

                    {recommendations.map(item => (
                        <EnhancedCard key={item.id} style={styles.recommendationCard}>
                            <View style={styles.recommendationHeader}>
                                <ThemedText style={styles.recommendationTitle}>{item.title}</ThemedText>
                                <View style={styles.recommendationMeta}>
                                    <ThemedText style={styles.recommendationType}>{item.type}</ThemedText>
                                    <ThemedText style={styles.recommendationRating}>⭐ {item.rating}</ThemedText>
                                </View>
                            </View>

                            <ThemedText style={styles.recommendationDescription}>
                                {item.description}
                            </ThemedText>

                            <View style={styles.recommendationDetails}>
                                <ThemedText style={styles.detailText}>
                                    Duration: {item.duration > 0 ? `${item.duration}min` : 'Streaming'}
                                </ThemedText>
                                <ThemedText style={styles.detailText}>
                                    Genres: {item.genre.join(', ')}
                                </ThemedText>
                                <ThemedText style={styles.detailText}>
                                    Platforms: {item.platform.join(', ')}
                                </ThemedText>
                            </View>

                            <View style={styles.recommendationTags}>
                                {item.tags.slice(0, 3).map(tag => (
                                    <ThemedText key={tag} style={styles.tag}>
                                        #{tag}
                                    </ThemedText>
                                ))}
                            </View>

                            <EnhancedButton
                                label="Select This"
                                onPress={() => onRecommendationSelect?.(item)}
                                style={styles.selectButton}
                            />
                        </EnhancedCard>
                    ))}

                    {recommendations.length === 0 && !isLoading && (
                        <EnhancedCard style={styles.emptyCard}>
                            <ThemedText style={styles.emptyText}>
                                No recommendations found. Try adjusting your preferences or current context.
                            </ThemedText>
                        </EnhancedCard>
                    )}
                </View>

                {/* Preferences Modal */}
                {showPreferences && preferences && (
                    <EnhancedCard style={styles.preferencesModal}>
                        <ThemedText style={styles.modalTitle}>Your Preferences</ThemedText>

                        <View style={styles.preferenceSection}>
                            <ThemedText style={styles.preferenceLabel}>Favorite Genres:</ThemedText>
                            <View style={styles.genreSelector}>
                                {['drama', 'comedy', 'action', 'documentary', 'horror', 'romance', 'sci-fi', 'thriller'].map(genre => (
                                    <EnhancedButton
                                        key={genre}
                                        label={genre}
                                        onPress={() => {
                                            const newGenres = preferences.genres.includes(genre)
                                                ? preferences.genres.filter(g => g !== genre)
                                                : [...preferences.genres, genre];
                                            updatePreferences({ genres: newGenres });
                                        }}
                                        style={[
                                            styles.genreButton,
                                            preferences.genres.includes(genre) && styles.selectedGenreButton
                                        ]}
                                    />
                                ))}
                            </View>
                        </View>

                        <View style={styles.preferenceSection}>
                            <ThemedText style={styles.preferenceLabel}>Preferred Duration:</ThemedText>
                            <View style={styles.durationSelector}>
                                {(['short', 'medium', 'long'] as const).map(duration => (
                                    <EnhancedButton
                                        key={duration}
                                        label={duration}
                                        onPress={() => updatePreferences({ duration })}
                                        style={[
                                            styles.durationButton,
                                            preferences.duration === duration && styles.selectedDurationButton
                                        ]}
                                    />
                                ))}
                            </View>
                        </View>

                        <EnhancedButton
                            label="Save Preferences"
                            onPress={() => setShowPreferences(false)}
                            style={styles.saveButton}
                        />
                    </EnhancedCard>
                )}
            </ScrollView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    scrollView: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    contextCard: {
        marginBottom: 16,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    contextRow: {
        marginBottom: 12,
    },
    contextLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    moodSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    activitySelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    contextButton: {
        marginRight: 8,
        marginBottom: 8,
        minWidth: 80,
    },
    selectedContextButton: {
        backgroundColor: '#007AFF',
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 5,
    },
    recommendations: {
        marginBottom: 20,
    },
    recommendationCard: {
        marginBottom: 12,
        padding: 16,
    },
    recommendationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    recommendationTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 12,
    },
    recommendationMeta: {
        alignItems: 'flex-end',
    },
    recommendationType: {
        fontSize: 12,
        color: '#666',
        textTransform: 'capitalize',
    },
    recommendationRating: {
        fontSize: 14,
        color: '#FFD700',
        fontWeight: 'bold',
    },
    recommendationDescription: {
        fontSize: 14,
        marginBottom: 12,
        lineHeight: 20,
    },
    recommendationDetails: {
        marginBottom: 12,
    },
    detailText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    recommendationTags: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    tag: {
        fontSize: 12,
        color: '#007AFF',
        marginRight: 8,
    },
    selectButton: {
        alignSelf: 'flex-start',
    },
    emptyCard: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    preferencesModal: {
        position: 'absolute',
        top: 50,
        left: 16,
        right: 16,
        maxHeight: 500,
        zIndex: 1000,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    preferenceSection: {
        marginBottom: 16,
    },
    preferenceLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    genreSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    genreButton: {
        marginRight: 8,
        marginBottom: 8,
        minWidth: 80,
    },
    selectedGenreButton: {
        backgroundColor: '#007AFF',
    },
    durationSelector: {
        flexDirection: 'row',
    },
    durationButton: {
        flex: 1,
        marginRight: 8,
    },
    selectedDurationButton: {
        backgroundColor: '#007AFF',
    },
    saveButton: {
        marginTop: 16,
    },
});

export default EntertainmentRecommender;
