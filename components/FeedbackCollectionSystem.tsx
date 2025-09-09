import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { EnhancedButton } from '../components/EnhancedButton';
import { EnhancedCard } from '../components/EnhancedCard';
import { EnhancedInput } from '../components/EnhancedInput';

export interface UserFeedback {
    id: string;
    type: FeedbackType;
    category: FeedbackCategory;
    rating: number; // 1-5
    title: string;
    description: string;
    suggestions?: string;
    context?: string; // What were they doing when they gave feedback?
    timestamp: Date;
    status: 'pending' | 'reviewed' | 'implemented' | 'declined';
    priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface FeatureRequest {
    id: string;
    title: string;
    description: string;
    category: FeatureCategory;
    priority: 'low' | 'medium' | 'high';
    votes: number;
    status: 'proposed' | 'planned' | 'in_development' | 'completed' | 'declined';
    submittedBy: string; // Could be anonymous or user identifier
    submittedAt: Date;
    estimatedEffort?: 'small' | 'medium' | 'large';
    tags: string[];
}

export interface UsageAnalytics {
    feature: string;
    usageCount: number;
    lastUsed: Date;
    averageSessionTime: number;
    userSatisfaction?: number;
    commonIssues?: string[];
}

export type FeedbackType =
    | 'bug_report'
    | 'feature_request'
    | 'improvement_suggestion'
    | 'general_feedback'
    | 'usability_issue'
    | 'performance_issue';

export type FeedbackCategory =
    | 'voice_features'
    | 'conversation'
    | 'personalization'
    | 'ui_ux'
    | 'performance'
    | 'privacy_security'
    | 'integrations'
    | 'other';

export type FeatureCategory =
    | 'ai_conversation'
    | 'voice_audio'
    | 'personal_assistant'
    | 'health_fitness'
    | 'finance'
    | 'creativity'
    | 'social'
    | 'productivity'
    | 'entertainment'
    | 'other';

interface FeedbackCollectionSystemProps {
    onFeedbackSubmitted?: (feedback: UserFeedback) => void;
    onFeatureRequested?: (request: FeatureRequest) => void;
    currentContext?: string; // What the user is currently doing
}

export const FeedbackCollectionSystem: React.FC<FeedbackCollectionSystemProps> = ({
    onFeedbackSubmitted,
    onFeatureRequested,
    currentContext
}) => {
    const [feedback, setFeedback] = useState<UserFeedback[]>([]);
    const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([]);
    const [usageAnalytics, setUsageAnalytics] = useState<UsageAnalytics[]>([]);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [showFeatureRequestForm, setShowFeatureRequestForm] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [activeTab, setActiveTab] = useState<'feedback' | 'requests' | 'analytics'>('feedback');

    useEffect(() => {
        loadFeedbackData();
        loadUsageAnalytics();
    }, []);

    const loadFeedbackData = async () => {
        try {
            const [storedFeedback, storedRequests] = await Promise.all([
                AsyncStorage.getItem('user_feedback'),
                AsyncStorage.getItem('feature_requests')
            ]);

            if (storedFeedback) {
                const parsedFeedback = JSON.parse(storedFeedback).map((f: any) => ({
                    ...f,
                    timestamp: new Date(f.timestamp)
                }));
                setFeedback(parsedFeedback);
            }

            if (storedRequests) {
                const parsedRequests = JSON.parse(storedRequests).map((r: any) => ({
                    ...r,
                    submittedAt: new Date(r.submittedAt)
                }));
                setFeatureRequests(parsedRequests);
            }
        } catch (error) {
            console.error('Error loading feedback data:', error);
        }
    };

    const saveFeedbackData = async () => {
        try {
            await Promise.all([
                AsyncStorage.setItem('user_feedback', JSON.stringify(feedback)),
                AsyncStorage.setItem('feature_requests', JSON.stringify(featureRequests))
            ]);
        } catch (error) {
            console.error('Error saving feedback data:', error);
        }
    };

    const loadUsageAnalytics = async () => {
        try {
            const stored = await AsyncStorage.getItem('usage_analytics');
            if (stored) {
                const parsedAnalytics = JSON.parse(stored).map((a: any) => ({
                    ...a,
                    lastUsed: new Date(a.lastUsed)
                }));
                setUsageAnalytics(parsedAnalytics);
            } else {
                // Initialize with default analytics
                const defaultAnalytics: UsageAnalytics[] = [
                    { feature: 'voice_assistant', usageCount: 0, lastUsed: new Date(), averageSessionTime: 0 },
                    { feature: 'conversation', usageCount: 0, lastUsed: new Date(), averageSessionTime: 0 },
                    { feature: 'goal_tracking', usageCount: 0, lastUsed: new Date(), averageSessionTime: 0 },
                    { feature: 'creative_assistant', usageCount: 0, lastUsed: new Date(), averageSessionTime: 0 },
                    { feature: 'financial_advisor', usageCount: 0, lastUsed: new Date(), averageSessionTime: 0 }
                ];
                setUsageAnalytics(defaultAnalytics);
                await AsyncStorage.setItem('usage_analytics', JSON.stringify(defaultAnalytics));
            }
        } catch (error) {
            console.error('Error loading usage analytics:', error);
        }
    };

    const submitFeedback = (feedbackData: Omit<UserFeedback, 'id' | 'timestamp' | 'status'>) => {
        const newFeedback: UserFeedback = {
            ...feedbackData,
            id: Date.now().toString(),
            timestamp: new Date(),
            status: 'pending',
            context: currentContext
        };

        const updatedFeedback = [...feedback, newFeedback];
        setFeedback(updatedFeedback);
        saveFeedbackData();
        setShowFeedbackForm(false);
        onFeedbackSubmitted?.(newFeedback);

        Alert.alert('Thank You!', 'Your feedback has been submitted and will be reviewed.');
    };

    const submitFeatureRequest = (requestData: Omit<FeatureRequest, 'id' | 'submittedAt' | 'votes' | 'status'>) => {
        const newRequest: FeatureRequest = {
            ...requestData,
            id: Date.now().toString(),
            submittedAt: new Date(),
            votes: 1,
            status: 'proposed',
            submittedBy: 'anonymous' // In a real app, this would be the user ID
        };

        const updatedRequests = [...featureRequests, newRequest];
        setFeatureRequests(updatedRequests);
        saveFeedbackData();
        setShowFeatureRequestForm(false);
        onFeatureRequested?.(newRequest);

        Alert.alert('Feature Request Submitted!', 'Thank you for your suggestion. It will be considered for future development.');
    };

    const updateFeedbackStatus = (feedbackId: string, status: UserFeedback['status']) => {
        const updatedFeedback = feedback.map(f =>
            f.id === feedbackId ? { ...f, status } : f
        );
        setFeedback(updatedFeedback);
        saveFeedbackData();
    };

    const voteForFeature = (requestId: string) => {
        const updatedRequests = featureRequests.map(r =>
            r.id === requestId ? { ...r, votes: r.votes + 1 } : r
        );
        setFeatureRequests(updatedRequests);
        saveFeedbackData();
    };

    const getFeedbackStats = () => {
        const total = feedback.length;
        const pending = feedback.filter(f => f.status === 'pending').length;
        const reviewed = feedback.filter(f => f.status === 'reviewed').length;
        const implemented = feedback.filter(f => f.status === 'implemented').length;
        const averageRating = feedback.length > 0
            ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
            : 0;

        return { total, pending, reviewed, implemented, averageRating };
    };

    const getTopIssues = () => {
        const issues = feedback
            .filter(f => f.type === 'bug_report' || f.type === 'usability_issue')
            .reduce((acc, f) => {
                const key = f.category;
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

        return Object.entries(issues)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);
    };

    const generateImprovementSuggestions = () => {
        const suggestions = [];
        const stats = getFeedbackStats();
        const topIssues = getTopIssues();

        if (stats.averageRating < 3) {
            suggestions.push('Overall user satisfaction is low. Consider major UX improvements.');
        }

        if (stats.pending > 10) {
            suggestions.push('High volume of pending feedback. Consider increasing review frequency.');
        }

        if (topIssues.length > 0) {
            suggestions.push(`Focus on improving: ${topIssues.map(([category]) => category).join(', ')}`);
        }

        const lowUsageFeatures = usageAnalytics.filter(a => a.usageCount < 5);
        if (lowUsageFeatures.length > 0) {
            suggestions.push(`Consider improving or promoting: ${lowUsageFeatures.map(a => a.feature).join(', ')}`);
        }

        return suggestions;
    };

    const stats = getFeedbackStats();
    const improvementSuggestions = generateImprovementSuggestions();

    return (
        <ThemedView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <ThemedText style={styles.title}>Feedback & Improvement System</ThemedText>

                {/* Tab Navigation */}
                <View style={styles.tabContainer}>
                    {(['feedback', 'requests', 'analytics'] as const).map(tab => (
                        <EnhancedButton
                            key={tab}
                            label={tab.charAt(0).toUpperCase() + tab.slice(1)}
                            onPress={() => setActiveTab(tab)}
                            style={[
                                styles.tabButton,
                                activeTab === tab && styles.activeTabButton
                            ]}
                        />
                    ))}
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <EnhancedButton
                        label="Give Feedback"
                        onPress={() => setShowFeedbackForm(true)}
                        style={styles.actionButton}
                    />
                    <EnhancedButton
                        label="Request Feature"
                        onPress={() => setShowFeatureRequestForm(true)}
                        style={styles.actionButton}
                    />
                    <EnhancedButton
                        label="View Analytics"
                        onPress={() => setShowAnalytics(!showAnalytics)}
                        style={styles.actionButton}
                    />
                </View>

                {/* Feedback Tab */}
                {activeTab === 'feedback' && (
                    <View style={styles.tabContent}>
                        <EnhancedCard style={styles.statsCard}>
                            <ThemedText style={styles.sectionTitle}>Feedback Statistics</ThemedText>
                            <View style={styles.statsGrid}>
                                <View style={styles.statItem}>
                                    <ThemedText style={styles.statValue}>{stats.total}</ThemedText>
                                    <ThemedText style={styles.statLabel}>Total Feedback</ThemedText>
                                </View>
                                <View style={styles.statItem}>
                                    <ThemedText style={styles.statValue}>{stats.pending}</ThemedText>
                                    <ThemedText style={styles.statLabel}>Pending</ThemedText>
                                </View>
                                <View style={styles.statItem}>
                                    <ThemedText style={styles.statValue}>{stats.implemented}</ThemedText>
                                    <ThemedText style={styles.statLabel}>Implemented</ThemedText>
                                </View>
                                <View style={styles.statItem}>
                                    <ThemedText style={[styles.statValue, styles.ratingValue]}>
                                        {stats.averageRating.toFixed(1)}⭐
                                    </ThemedText>
                                    <ThemedText style={styles.statLabel}>Avg Rating</ThemedText>
                                </View>
                            </View>
                        </EnhancedCard>

                        <View style={styles.feedbackList}>
                            <ThemedText style={styles.sectionTitle}>Recent Feedback</ThemedText>
                            {feedback.slice(-5).reverse().map(item => (
                                <EnhancedCard key={item.id} style={styles.feedbackCard}>
                                    <View style={styles.feedbackHeader}>
                                        <ThemedText style={styles.feedbackTitle}>{item.title}</ThemedText>
                                        <View style={styles.feedbackMeta}>
                                            <ThemedText style={styles.feedbackRating}>⭐{item.rating}</ThemedText>
                                            <ThemedText style={[
                                                styles.feedbackStatus,
                                                item.status === 'pending' && styles.pendingStatus,
                                                item.status === 'reviewed' && styles.reviewedStatus,
                                                item.status === 'implemented' && styles.implementedStatus
                                            ]}>
                                                {item.status}
                                            </ThemedText>
                                        </View>
                                    </View>
                                    <ThemedText style={styles.feedbackDescription}>{item.description}</ThemedText>
                                    <View style={styles.feedbackFooter}>
                                        <ThemedText style={styles.feedbackCategory}>{item.category}</ThemedText>
                                        <ThemedText style={styles.feedbackDate}>
                                            {item.timestamp.toLocaleDateString()}
                                        </ThemedText>
                                    </View>
                                </EnhancedCard>
                            ))}
                        </View>
                    </View>
                )}

                {/* Feature Requests Tab */}
                {activeTab === 'requests' && (
                    <View style={styles.tabContent}>
                        <View style={styles.requestsList}>
                            <ThemedText style={styles.sectionTitle}>Feature Requests</ThemedText>
                            {featureRequests.map(request => (
                                <EnhancedCard key={request.id} style={styles.requestCard}>
                                    <View style={styles.requestHeader}>
                                        <ThemedText style={styles.requestTitle}>{request.title}</ThemedText>
                                        <View style={styles.requestMeta}>
                                            <ThemedText style={styles.requestVotes}>👍 {request.votes}</ThemedText>
                                            <ThemedText style={[
                                                styles.requestStatus,
                                                request.status === 'proposed' && styles.proposedStatus,
                                                request.status === 'planned' && styles.plannedStatus,
                                                request.status === 'completed' && styles.completedStatus
                                            ]}>
                                                {request.status.replace('_', ' ')}
                                            </ThemedText>
                                        </View>
                                    </View>
                                    <ThemedText style={styles.requestDescription}>{request.description}</ThemedText>
                                    <View style={styles.requestFooter}>
                                        <ThemedText style={styles.requestCategory}>{request.category}</ThemedText>
                                        <EnhancedButton
                                            label="Vote"
                                            onPress={() => voteForFeature(request.id)}
                                            style={styles.voteButton}
                                        />
                                    </View>
                                </EnhancedCard>
                            ))}
                        </View>
                    </View>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <View style={styles.tabContent}>
                        <EnhancedCard style={styles.analyticsCard}>
                            <ThemedText style={styles.sectionTitle}>Usage Analytics</ThemedText>
                            {usageAnalytics.map(analytic => (
                                <View key={analytic.feature} style={styles.analyticItem}>
                                    <View style={styles.analyticHeader}>
                                        <ThemedText style={styles.analyticFeature}>
                                            {analytic.feature.replace('_', ' ')}
                                        </ThemedText>
                                        <ThemedText style={styles.analyticCount}>
                                            {analytic.usageCount} uses
                                        </ThemedText>
                                    </View>
                                    <ThemedText style={styles.analyticLastUsed}>
                                        Last used: {analytic.lastUsed.toLocaleDateString()}
                                    </ThemedText>
                                    {analytic.averageSessionTime > 0 && (
                                        <ThemedText style={styles.analyticTime}>
                                            Avg session: {Math.round(analytic.averageSessionTime)}min
                                        </ThemedText>
                                    )}
                                </View>
                            ))}
                        </EnhancedCard>

                        <EnhancedCard style={styles.suggestionsCard}>
                            <ThemedText style={styles.sectionTitle}>Improvement Suggestions</ThemedText>
                            {improvementSuggestions.map((suggestion, index) => (
                                <ThemedText key={index} style={styles.suggestion}>
                                    • {suggestion}
                                </ThemedText>
                            ))}
                        </EnhancedCard>
                    </View>
                )}

                {/* Feedback Form Modal */}
                {showFeedbackForm && (
                    <FeedbackForm
                        onSubmit={submitFeedback}
                        onCancel={() => setShowFeedbackForm(false)}
                        currentContext={currentContext}
                    />
                )}

                {/* Feature Request Form Modal */}
                {showFeatureRequestForm && (
                    <FeatureRequestForm
                        onSubmit={submitFeatureRequest}
                        onCancel={() => setShowFeatureRequestForm(false)}
                    />
                )}
            </ScrollView>
        </ThemedView>
    );
};

// Feedback Form Component
const FeedbackForm: React.FC<{
    onSubmit: (feedback: Omit<UserFeedback, 'id' | 'timestamp' | 'status'>) => void;
    onCancel: () => void;
    currentContext?: string;
}> = ({ onSubmit, onCancel, currentContext }) => {
    const [type, setType] = useState<FeedbackType>('general_feedback');
    const [category, setCategory] = useState<FeedbackCategory>('other');
    const [rating, setRating] = useState(5);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [suggestions, setSuggestions] = useState('');

    const handleSubmit = () => {
        if (!title || !description) {
            Alert.alert('Error', 'Please fill in title and description');
            return;
        }

        onSubmit({
            type,
            category,
            rating,
            title,
            description,
            suggestions: suggestions || undefined,
            priority: rating <= 2 ? 'high' : rating <= 4 ? 'medium' : 'low'
        });
    };

    return (
        <EnhancedCard style={styles.formModal}>
            <ThemedText style={styles.formTitle}>Share Your Feedback</ThemedText>

            <View style={styles.formField}>
                <ThemedText style={styles.fieldLabel}>Type of Feedback</ThemedText>
                <ScrollView horizontal style={styles.typeSelector}>
                    {(['bug_report', 'feature_request', 'improvement_suggestion', 'general_feedback', 'usability_issue', 'performance_issue'] as FeedbackType[]).map(t => (
                        <EnhancedButton
                            key={t}
                            label={t.replace('_', ' ')}
                            onPress={() => setType(t)}
                            style={[
                                styles.typeButton,
                                type === t && styles.selectedTypeButton
                            ]}
                        />
                    ))}
                </ScrollView>
            </View>

            <View style={styles.formField}>
                <ThemedText style={styles.fieldLabel}>Category</ThemedText>
                <ScrollView horizontal style={styles.categorySelector}>
                    {(['voice_features', 'conversation', 'personalization', 'ui_ux', 'performance', 'privacy_security', 'integrations', 'other'] as FeedbackCategory[]).map(c => (
                        <EnhancedButton
                            key={c}
                            label={c.replace('_', ' ')}
                            onPress={() => setCategory(c)}
                            style={[
                                styles.categoryButton,
                                category === c && styles.selectedCategoryButton
                            ]}
                        />
                    ))}
                </ScrollView>
            </View>

            <View style={styles.formField}>
                <ThemedText style={styles.fieldLabel}>Rating (1-5)</ThemedText>
                <View style={styles.ratingSelector}>
                    {[1, 2, 3, 4, 5].map(r => (
                        <EnhancedButton
                            key={r}
                            label={`${r}⭐`}
                            onPress={() => setRating(r)}
                            style={[
                                styles.ratingButton,
                                rating === r && styles.selectedRatingButton
                            ]}
                        />
                    ))}
                </View>
            </View>

            <EnhancedInput
                placeholder="Brief title for your feedback"
                value={title}
                onChangeText={setTitle}
                style={styles.inputField}
            />

            <TextInput
                placeholder="Detailed description of your feedback"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                style={[styles.textAreaField, { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12 }]}
            />

            <TextInput
                placeholder="Any suggestions for improvement? (optional)"
                value={suggestions}
                onChangeText={setSuggestions}
                multiline
                numberOfLines={2}
                style={[styles.textAreaField, { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12 }]}
            />

            {currentContext && (
                <ThemedText style={styles.contextText}>
                    Context: {currentContext}
                </ThemedText>
            )}

            <View style={styles.formActions}>
                <EnhancedButton label="Cancel" onPress={onCancel} style={styles.cancelButton} />
                <EnhancedButton label="Submit" onPress={handleSubmit} style={styles.submitButton} />
            </View>
        </EnhancedCard>
    );
};

// Feature Request Form Component
const FeatureRequestForm: React.FC<{
    onSubmit: (request: Omit<FeatureRequest, 'id' | 'submittedAt' | 'votes' | 'status'>) => void;
    onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<FeatureCategory>('other');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [estimatedEffort, setEstimatedEffort] = useState<'small' | 'medium' | 'large'>('medium');

    const handleSubmit = () => {
        if (!title || !description) {
            Alert.alert('Error', 'Please fill in title and description');
            return;
        }

        onSubmit({
            title,
            description,
            category,
            priority,
            estimatedEffort,
            submittedBy: 'anonymous',
            tags: []
        });
    };

    return (
        <EnhancedCard style={styles.formModal}>
            <ThemedText style={styles.formTitle}>Request a New Feature</ThemedText>

            <EnhancedInput
                placeholder="Feature title"
                value={title}
                onChangeText={setTitle}
                style={styles.inputField}
            />

            <TextInput
                placeholder="Detailed description of the feature"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                style={[styles.textAreaField, { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12 }]}
            />

            <View style={styles.formField}>
                <ThemedText style={styles.fieldLabel}>Category</ThemedText>
                <ScrollView horizontal style={styles.categorySelector}>
                    {(['ai_conversation', 'voice_audio', 'personal_assistant', 'health_fitness', 'finance', 'creativity', 'social', 'productivity', 'entertainment', 'other'] as FeatureCategory[]).map(c => (
                        <EnhancedButton
                            key={c}
                            label={c.replace('_', ' ')}
                            onPress={() => setCategory(c)}
                            style={[
                                styles.categoryButton,
                                category === c && styles.selectedCategoryButton
                            ]}
                        />
                    ))}
                </ScrollView>
            </View>

            <View style={styles.formField}>
                <ThemedText style={styles.fieldLabel}>Priority</ThemedText>
                <View style={styles.prioritySelector}>
                    {(['low', 'medium', 'high'] as const).map(p => (
                        <EnhancedButton
                            key={p}
                            label={p}
                            onPress={() => setPriority(p)}
                            style={[
                                styles.priorityButton,
                                priority === p && styles.selectedPriorityButton
                            ]}
                        />
                    ))}
                </View>
            </View>

            <View style={styles.formField}>
                <ThemedText style={styles.fieldLabel}>Estimated Effort</ThemedText>
                <View style={styles.effortSelector}>
                    {(['small', 'medium', 'large'] as const).map(e => (
                        <EnhancedButton
                            key={e}
                            label={e}
                            onPress={() => setEstimatedEffort(e)}
                            style={[
                                styles.effortButton,
                                estimatedEffort === e && styles.selectedEffortButton
                            ]}
                        />
                    ))}
                </View>
            </View>

            <View style={styles.formActions}>
                <EnhancedButton label="Cancel" onPress={onCancel} style={styles.cancelButton} />
                <EnhancedButton label="Submit Request" onPress={handleSubmit} style={styles.submitButton} />
            </View>
        </EnhancedCard>
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
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    tabButton: {
        flex: 1,
        marginRight: 8,
    },
    activeTabButton: {
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
    tabContent: {
        flex: 1,
    },
    statsCard: {
        marginBottom: 16,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    statItem: {
        width: '50%',
        alignItems: 'center',
        marginBottom: 16,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    ratingValue: {
        color: '#FFD700',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    feedbackList: {
        marginBottom: 20,
    },
    feedbackCard: {
        marginBottom: 12,
        padding: 16,
    },
    feedbackHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    feedbackTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    feedbackMeta: {
        alignItems: 'flex-end',
    },
    feedbackRating: {
        fontSize: 14,
        color: '#FFD700',
    },
    feedbackStatus: {
        fontSize: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 4,
    },
    pendingStatus: {
        backgroundColor: '#FFF3CD',
        color: '#856404',
    },
    reviewedStatus: {
        backgroundColor: '#D1ECF1',
        color: '#0C5460',
    },
    implementedStatus: {
        backgroundColor: '#D4EDDA',
        color: '#155724',
    },
    feedbackDescription: {
        fontSize: 14,
        marginBottom: 8,
        lineHeight: 20,
    },
    feedbackFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    feedbackCategory: {
        fontSize: 12,
        color: '#666',
    },
    feedbackDate: {
        fontSize: 12,
        color: '#666',
    },
    requestsList: {
        marginBottom: 20,
    },
    requestCard: {
        marginBottom: 12,
        padding: 16,
    },
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    requestTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    requestMeta: {
        alignItems: 'flex-end',
    },
    requestVotes: {
        fontSize: 14,
        color: '#28A745',
    },
    requestStatus: {
        fontSize: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 4,
    },
    proposedStatus: {
        backgroundColor: '#E9ECEF',
        color: '#6C757D',
    },
    plannedStatus: {
        backgroundColor: '#FFF3CD',
        color: '#856404',
    },
    completedStatus: {
        backgroundColor: '#D4EDDA',
        color: '#155724',
    },
    requestDescription: {
        fontSize: 14,
        marginBottom: 8,
        lineHeight: 20,
    },
    requestFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    requestCategory: {
        fontSize: 12,
        color: '#666',
    },
    voteButton: {
        alignSelf: 'flex-end',
    },
    analyticsCard: {
        marginBottom: 16,
        padding: 16,
    },
    analyticItem: {
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    analyticHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    analyticFeature: {
        fontSize: 16,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    analyticCount: {
        fontSize: 14,
        color: '#007AFF',
    },
    analyticLastUsed: {
        fontSize: 12,
        color: '#666',
    },
    analyticTime: {
        fontSize: 12,
        color: '#666',
    },
    suggestionsCard: {
        padding: 16,
    },
    suggestion: {
        fontSize: 14,
        marginBottom: 8,
        lineHeight: 20,
    },
    formModal: {
        position: 'absolute',
        top: 50,
        left: 16,
        right: 16,
        maxHeight: 600,
        zIndex: 1000,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    formField: {
        marginBottom: 12,
    },
    fieldLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    typeSelector: {
        marginBottom: 8,
    },
    typeButton: {
        marginRight: 8,
        minWidth: 100,
    },
    selectedTypeButton: {
        backgroundColor: '#007AFF',
    },
    categorySelector: {
        marginBottom: 8,
    },
    categoryButton: {
        marginRight: 8,
        minWidth: 80,
    },
    selectedCategoryButton: {
        backgroundColor: '#007AFF',
    },
    ratingSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    ratingButton: {
        flex: 1,
        marginRight: 4,
    },
    selectedRatingButton: {
        backgroundColor: '#007AFF',
    },
    inputField: {
        marginBottom: 12,
    },
    textAreaField: {
        marginBottom: 12,
        minHeight: 80,
    },
    contextText: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        marginBottom: 12,
    },
    formActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    cancelButton: {
        flex: 1,
        marginRight: 8,
    },
    submitButton: {
        flex: 1,
        marginLeft: 8,
    },
    prioritySelector: {
        flexDirection: 'row',
    },
    priorityButton: {
        flex: 1,
        marginRight: 8,
    },
    selectedPriorityButton: {
        backgroundColor: '#007AFF',
    },
    effortSelector: {
        flexDirection: 'row',
    },
    effortButton: {
        flex: 1,
        marginRight: 8,
    },
    selectedEffortButton: {
        backgroundColor: '#007AFF',
    },
});

export default FeedbackCollectionSystem;
