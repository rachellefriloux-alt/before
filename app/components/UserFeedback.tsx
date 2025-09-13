import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../store/theme';
import { EnhancedButton } from './EnhancedButton';
import { EnhancedCard } from './EnhancedCard';

interface FeedbackItem {
    id: string;
    type: 'rating' | 'review' | 'bug' | 'feature';
    title: string;
    description: string;
    rating?: number;
    category?: string;
    timestamp: Date;
    status: 'pending' | 'reviewed' | 'resolved';
}

interface RatingData {
    overall: number;
    features: number;
    performance: number;
    design: number;
}

const feedbackCategories = [
    'General',
    'Features',
    'Performance',
    'Design',
    'Bug Report',
    'Feature Request',
];

export function UserFeedback() {
    const { currentTheme } = useThemeStore();
    const isDark = currentTheme.name.toLowerCase().includes('dark');

    const [activeTab, setActiveTab] = useState<'rate' | 'review' | 'report'>('rate');
    const [rating, setRating] = useState<RatingData>({
        overall: 0,
        features: 0,
        performance: 0,
        design: 0,
    });
    const [reviewTitle, setReviewTitle] = useState('');
    const [reviewText, setReviewText] = useState('');
    const [reviewCategory, setReviewCategory] = useState('General');
    const [bugTitle, setBugTitle] = useState('');
    const [bugDescription, setBugDescription] = useState('');
    const [bugSteps, setBugSteps] = useState('');
    const [featureTitle, setFeatureTitle] = useState('');
    const [featureDescription, setFeatureDescription] = useState('');
    const [feedbackHistory, setFeedbackHistory] = useState<FeedbackItem[]>([]);

    const renderStars = (currentRating: number, onRate: (rating: number) => void, size: number = 24) => {
        return (
            <View style={styles.starContainer}>
                {[1, 2, 3, 4, 5].map(star => (
                    <TouchableOpacity
                        key={star}
                        onPress={() => onRate(star)}
                        style={styles.starButton}
                    >
                        <Text
                            style={[
                                styles.star,
                                { fontSize: size },
                                currentRating >= star && styles.starFilled,
                            ]}
                        >
                            ★
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const submitRating = () => {
        if (rating.overall === 0) {
            Alert.alert('Rating Required', 'Please provide an overall rating');
            return;
        }

        const newFeedback: FeedbackItem = {
            id: Date.now().toString(),
            type: 'rating',
            title: `Rating: ${rating.overall}/5 stars`,
            description: `Overall: ${rating.overall}, Features: ${rating.features}, Performance: ${rating.performance}, Design: ${rating.design}`,
            rating: rating.overall,
            timestamp: new Date(),
            status: 'pending',
        };

        setFeedbackHistory(prev => [newFeedback, ...prev]);
        setRating({ overall: 0, features: 0, performance: 0, design: 0 });

        Alert.alert('Thank You!', 'Your rating has been submitted successfully');
    };

    const submitReview = () => {
        if (!reviewTitle.trim() || !reviewText.trim()) {
            Alert.alert('Incomplete Review', 'Please fill in both title and description');
            return;
        }

        const newFeedback: FeedbackItem = {
            id: Date.now().toString(),
            type: 'review',
            title: reviewTitle,
            description: reviewText,
            category: reviewCategory,
            timestamp: new Date(),
            status: 'pending',
        };

        setFeedbackHistory(prev => [newFeedback, ...prev]);
        setReviewTitle('');
        setReviewText('');
        setReviewCategory('General');

        Alert.alert('Thank You!', 'Your review has been submitted successfully');
    };

    const submitBugReport = () => {
        if (!bugTitle.trim() || !bugDescription.trim()) {
            Alert.alert('Incomplete Bug Report', 'Please fill in title and description');
            return;
        }

        const newFeedback: FeedbackItem = {
            id: Date.now().toString(),
            type: 'bug',
            title: bugTitle,
            description: `${bugDescription}\n\nSteps to reproduce:\n${bugSteps}`,
            category: 'Bug Report',
            timestamp: new Date(),
            status: 'pending',
        };

        setFeedbackHistory(prev => [newFeedback, ...prev]);
        setBugTitle('');
        setBugDescription('');
        setBugSteps('');

        Alert.alert('Bug Report Submitted', 'Thank you for helping us improve!');
    };

    const submitFeatureRequest = () => {
        if (!featureTitle.trim() || !featureDescription.trim()) {
            Alert.alert('Incomplete Feature Request', 'Please fill in title and description');
            return;
        }

        const newFeedback: FeedbackItem = {
            id: Date.now().toString(),
            type: 'feature',
            title: featureTitle,
            description: featureDescription,
            category: 'Feature Request',
            timestamp: new Date(),
            status: 'pending',
        };

        setFeedbackHistory(prev => [newFeedback, ...prev]);
        setFeatureTitle('');
        setFeatureDescription('');

        Alert.alert('Feature Request Submitted', 'Thank you for your suggestion!');
    };

    const renderRatingTab = () => (
        <ScrollView style={styles.contentContainer}>
            <EnhancedCard variant="glass" style={styles.ratingCard}>
                <Text style={styles.sectionTitle}>Rate Your Experience</Text>

                <View style={styles.ratingSection}>
                    <Text style={styles.ratingLabel}>Overall Experience</Text>
                    {renderStars(rating.overall, (value) => setRating(prev => ({ ...prev, overall: value })))}
                </View>

                <View style={styles.ratingSection}>
                    <Text style={styles.ratingLabel}>Features</Text>
                    {renderStars(rating.features, (value) => setRating(prev => ({ ...prev, features: value })), 20)}
                </View>

                <View style={styles.ratingSection}>
                    <Text style={styles.ratingLabel}>Performance</Text>
                    {renderStars(rating.performance, (value) => setRating(prev => ({ ...prev, performance: value })), 20)}
                </View>

                <View style={styles.ratingSection}>
                    <Text style={styles.ratingLabel}>Design</Text>
                    {renderStars(rating.design, (value) => setRating(prev => ({ ...prev, design: value })), 20)}
                </View>

                <EnhancedButton
                    title="Submit Rating"
                    variant="primary"
                    onPress={submitRating}
                    style={styles.submitButton}
                />
            </EnhancedCard>
        </ScrollView>
    );

    const renderReviewTab = () => (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardContainer}
        >
            <ScrollView style={styles.contentContainer}>
                <EnhancedCard variant="glass" style={styles.reviewCard}>
                    <Text style={styles.sectionTitle}>Write a Review</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Review Title"
                        placeholderTextColor="#888"
                        value={reviewTitle}
                        onChangeText={setReviewTitle}
                    />

                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Tell us about your experience..."
                        placeholderTextColor="#888"
                        value={reviewText}
                        onChangeText={setReviewText}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                    />

                    <Text style={styles.label}>Category</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
                        {feedbackCategories.map(category => (
                            <TouchableOpacity
                                key={category}
                                style={[
                                    styles.categoryButton,
                                    reviewCategory === category && styles.categoryButtonActive,
                                ]}
                                onPress={() => setReviewCategory(category)}
                            >
                                <Text style={[
                                    styles.categoryText,
                                    reviewCategory === category && styles.categoryTextActive,
                                ]}>
                                    {category}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <EnhancedButton
                        title="Submit Review"
                        variant="primary"
                        onPress={submitReview}
                        style={styles.submitButton}
                    />
                </EnhancedCard>
            </ScrollView>
        </KeyboardAvoidingView>
    );

    const renderReportTab = () => (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardContainer}
        >
            <ScrollView style={styles.contentContainer}>
                <EnhancedCard variant="glass" style={styles.reportCard}>
                    <Text style={styles.sectionTitle}>Bug Report</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Bug Title"
                        placeholderTextColor="#888"
                        value={bugTitle}
                        onChangeText={setBugTitle}
                    />

                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe the bug..."
                        placeholderTextColor="#888"
                        value={bugDescription}
                        onChangeText={setBugDescription}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />

                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Steps to reproduce (optional)..."
                        placeholderTextColor="#888"
                        value={bugSteps}
                        onChangeText={setBugSteps}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />

                    <EnhancedButton
                        title="Submit Bug Report"
                        variant="primary"
                        onPress={submitBugReport}
                        style={styles.submitButton}
                    />
                </EnhancedCard>

                <EnhancedCard variant="glass" style={styles.reportCard}>
                    <Text style={styles.sectionTitle}>Feature Request</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Feature Title"
                        placeholderTextColor="#888"
                        value={featureTitle}
                        onChangeText={setFeatureTitle}
                    />

                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe the feature you'd like to see..."
                        placeholderTextColor="#888"
                        value={featureDescription}
                        onChangeText={setFeatureDescription}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />

                    <EnhancedButton
                        title="Submit Feature Request"
                        variant="primary"
                        onPress={submitFeatureRequest}
                        style={styles.submitButton}
                    />
                </EnhancedCard>
            </ScrollView>
        </KeyboardAvoidingView>
    );

    const renderHistory = () => (
        <ScrollView style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Your Feedback History</Text>
            {feedbackHistory.length === 0 ? (
                <Text style={styles.emptyText}>No feedback submitted yet</Text>
            ) : (
                feedbackHistory.map(item => (
                    <EnhancedCard key={item.id} variant="glass" style={styles.historyCard}>
                        <View style={styles.historyHeader}>
                            <Text style={styles.historyTitle}>{item.title}</Text>
                            <Text style={[
                                styles.historyStatus,
                                {
                                    color: item.status === 'resolved' ? '#10B981' :
                                        item.status === 'reviewed' ? '#F59E0B' : '#888'
                                }
                            ]}>
                                {item.status}
                            </Text>
                        </View>
                        <Text style={styles.historyDescription}>{item.description}</Text>
                        <Text style={styles.historyTimestamp}>
                            {item.timestamp.toLocaleDateString()}
                        </Text>
                    </EnhancedCard>
                ))
            )}
        </ScrollView>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Feedback</Text>

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'rate' && styles.activeTab]}
                    onPress={() => setActiveTab('rate')}
                >
                    <Text style={[styles.tabText, activeTab === 'rate' && styles.activeTabText]}>
                        Rate
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'review' && styles.activeTab]}
                    onPress={() => setActiveTab('review')}
                >
                    <Text style={[styles.tabText, activeTab === 'review' && styles.activeTabText]}>
                        Review
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'report' && styles.activeTab]}
                    onPress={() => setActiveTab('report')}
                >
                    <Text style={[styles.tabText, activeTab === 'report' && styles.activeTabText]}>
                        Report
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            {activeTab === 'rate' && renderRatingTab()}
            {activeTab === 'review' && renderReviewTab()}
            {activeTab === 'report' && renderReportTab()}

            {/* Feedback History */}
            {renderHistory()}
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
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 6,
    },
    activeTab: {
        backgroundColor: '#FFD700',
    },
    tabText: {
        fontSize: 16,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    activeTabText: {
        color: '#000',
        fontWeight: 'bold',
    },
    contentContainer: {
        flex: 1,
        marginBottom: 16,
    },
    keyboardContainer: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f5f5f5',
        marginBottom: 16,
        fontFamily: 'SpaceMono',
    },
    ratingCard: {
        padding: 16,
    },
    ratingSection: {
        marginBottom: 20,
    },
    ratingLabel: {
        fontSize: 16,
        color: '#f5f5f5',
        marginBottom: 8,
        fontFamily: 'SpaceMono',
    },
    starContainer: {
        flexDirection: 'row',
    },
    starButton: {
        padding: 2,
    },
    star: {
        color: '#888',
    },
    starFilled: {
        color: '#FFD700',
    },
    reviewCard: {
        padding: 16,
    },
    reportCard: {
        padding: 16,
        marginBottom: 16,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
        padding: 12,
        color: '#f5f5f5',
        fontSize: 16,
        marginBottom: 12,
        fontFamily: 'SpaceMono',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    label: {
        fontSize: 16,
        color: '#f5f5f5',
        marginBottom: 8,
        fontFamily: 'SpaceMono',
    },
    categoryContainer: {
        marginBottom: 16,
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
    submitButton: {
        marginTop: 8,
    },
    historyCard: {
        padding: 16,
        marginBottom: 8,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    historyTitle: {
        fontSize: 16,
        color: '#f5f5f5',
        fontWeight: 'bold',
        flex: 1,
        fontFamily: 'SpaceMono',
    },
    historyStatus: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontFamily: 'SpaceMono',
    },
    historyDescription: {
        fontSize: 14,
        color: '#ccc',
        marginBottom: 8,
        fontFamily: 'SpaceMono',
    },
    historyTimestamp: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginTop: 32,
        fontFamily: 'SpaceMono',
    },
});
