import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { EnhancedButton } from '../components/EnhancedButton';
import { EnhancedCard } from '../components/EnhancedCard';
import { EnhancedInput } from '../components/EnhancedInput';

export interface PersonalityTrait {
    id: string;
    name: string;
    description: string;
    currentLevel: number; // 0-100
    targetLevel: number;
    adaptability: number; // How easily this trait can be modified
    lastUpdated: Date;
}

export interface ABTest {
    id: string;
    name: string;
    description: string;
    variants: ABTestVariant[];
    status: 'running' | 'completed' | 'paused';
    startDate: Date;
    endDate?: Date;
    winner?: string;
    metrics: TestMetrics;
}

export interface ABTestVariant {
    id: string;
    name: string;
    description: string;
    personalityAdjustments: Record<string, number>; // traitId -> adjustment
    userCount: number;
    engagementScore: number;
    satisfactionScore: number;
}

export interface TestMetrics {
    totalUsers: number;
    averageEngagement: number;
    averageSatisfaction: number;
    completionRate: number;
    retentionRate: number;
}

export interface LearningPattern {
    id: string;
    pattern: string;
    frequency: number;
    effectiveness: number;
    lastObserved: Date;
    confidence: number;
}

export interface AdaptationSuggestion {
    id: string;
    type: 'personality' | 'behavior' | 'communication';
    trait: string;
    currentValue: number;
    suggestedValue: number;
    reason: string;
    confidence: number;
    expectedImpact: number;
    implementationDifficulty: 'easy' | 'medium' | 'hard';
}

interface SelfImprovementEngineProps {
    currentPersonality?: Record<string, number>;
    userEngagementData?: any;
    onPersonalityUpdate?: (updates: Record<string, number>) => void;
    onAdaptationApplied?: (adaptation: AdaptationSuggestion) => void;
}

export const SelfImprovementEngine: React.FC<SelfImprovementEngineProps> = ({
    currentPersonality = {},
    userEngagementData,
    onPersonalityUpdate,
    onAdaptationApplied
}) => {
    const [personalityTraits, setPersonalityTraits] = useState<PersonalityTrait[]>([]);
    const [abTests, setAbTests] = useState<ABTest[]>([]);
    const [learningPatterns, setLearningPatterns] = useState<LearningPattern[]>([]);
    const [adaptationSuggestions, setAdaptationSuggestions] = useState<AdaptationSuggestion[]>([]);
    const [showCreateTest, setShowCreateTest] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        loadSelfImprovementData();
        initializeDefaultTraits();
    }, []);

    useEffect(() => {
        if (personalityTraits.length > 0 && userEngagementData) {
            analyzeAndGenerateSuggestions();
        }
    }, [personalityTraits, userEngagementData]);

    const loadSelfImprovementData = async () => {
        try {
            const [storedTraits, storedTests, storedPatterns] = await Promise.all([
                AsyncStorage.getItem('personality_traits'),
                AsyncStorage.getItem('ab_tests'),
                AsyncStorage.getItem('learning_patterns')
            ]);

            if (storedTraits) {
                const parsedTraits = JSON.parse(storedTraits).map((t: any) => ({
                    ...t,
                    lastUpdated: new Date(t.lastUpdated)
                }));
                setPersonalityTraits(parsedTraits);
            }

            if (storedTests) {
                const parsedTests = JSON.parse(storedTests).map((t: any) => ({
                    ...t,
                    startDate: new Date(t.startDate),
                    endDate: t.endDate ? new Date(t.endDate) : undefined
                }));
                setAbTests(parsedTests);
            }

            if (storedPatterns) {
                const parsedPatterns = JSON.parse(storedPatterns).map((p: any) => ({
                    ...p,
                    lastObserved: new Date(p.lastObserved)
                }));
                setLearningPatterns(parsedPatterns);
            }
        } catch (error) {
            console.error('Error loading self-improvement data:', error);
        }
    };

    const saveSelfImprovementData = async () => {
        try {
            await Promise.all([
                AsyncStorage.setItem('personality_traits', JSON.stringify(personalityTraits)),
                AsyncStorage.setItem('ab_tests', JSON.stringify(abTests)),
                AsyncStorage.setItem('learning_patterns', JSON.stringify(learningPatterns))
            ]);
        } catch (error) {
            console.error('Error saving self-improvement data:', error);
        }
    };

    const initializeDefaultTraits = () => {
        const defaultTraits: PersonalityTrait[] = [
            {
                id: 'empathy',
                name: 'Empathy',
                description: 'Ability to understand and share others\' feelings',
                currentLevel: 75,
                targetLevel: 80,
                adaptability: 0.7,
                lastUpdated: new Date()
            },
            {
                id: 'assertiveness',
                name: 'Assertiveness',
                description: 'Confidence in expressing opinions and needs',
                currentLevel: 60,
                targetLevel: 70,
                adaptability: 0.6,
                lastUpdated: new Date()
            },
            {
                id: 'patience',
                name: 'Patience',
                description: 'Ability to remain calm and composed',
                currentLevel: 70,
                targetLevel: 75,
                adaptability: 0.5,
                lastUpdated: new Date()
            },
            {
                id: 'adaptability',
                name: 'Adaptability',
                description: 'Flexibility in responding to change',
                currentLevel: 65,
                targetLevel: 80,
                adaptability: 0.8,
                lastUpdated: new Date()
            },
            {
                id: 'humor',
                name: 'Sense of Humor',
                description: 'Ability to use humor appropriately',
                currentLevel: 55,
                targetLevel: 65,
                adaptability: 0.6,
                lastUpdated: new Date()
            },
            {
                id: 'optimism',
                name: 'Optimism',
                description: 'Positive outlook and hopefulness',
                currentLevel: 70,
                targetLevel: 75,
                adaptability: 0.7,
                lastUpdated: new Date()
            }
        ];

        // Only set defaults if no traits exist
        if (personalityTraits.length === 0) {
            setPersonalityTraits(defaultTraits);
            saveSelfImprovementData();
        }
    };

    const analyzeAndGenerateSuggestions = async () => {
        setIsAnalyzing(true);

        try {
            // Simulate analysis delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            const suggestions: AdaptationSuggestion[] = [];

            // Analyze each personality trait
            personalityTraits.forEach(trait => {
                const gap = trait.targetLevel - trait.currentLevel;
                const adaptabilityFactor = trait.adaptability;

                if (Math.abs(gap) > 10) {
                    const direction = gap > 0 ? 'increase' : 'decrease';
                    const confidence = Math.min(Math.abs(gap) / 20, 0.9) * adaptabilityFactor;

                    suggestions.push({
                        id: `trait_${trait.id}`,
                        type: 'personality',
                        trait: trait.name,
                        currentValue: trait.currentLevel,
                        suggestedValue: trait.targetLevel,
                        reason: `Analysis shows opportunity to ${direction} ${trait.name.toLowerCase()} for better user experience`,
                        confidence: confidence,
                        expectedImpact: Math.abs(gap) * adaptabilityFactor,
                        implementationDifficulty: adaptabilityFactor > 0.7 ? 'easy' : adaptabilityFactor > 0.5 ? 'medium' : 'hard'
                    });
                }
            });

            // Add learning pattern-based suggestions
            if (learningPatterns.length > 0) {
                const topPattern = learningPatterns.sort((a, b) => b.effectiveness - a.effectiveness)[0];
                if (topPattern.effectiveness > 0.7) {
                    suggestions.push({
                        id: 'pattern_adaptation',
                        type: 'behavior',
                        trait: 'Learning Style',
                        currentValue: 50,
                        suggestedValue: 70,
                        reason: `Strong pattern detected: ${topPattern.pattern}. Adapting to reinforce effective learning methods.`,
                        confidence: topPattern.confidence,
                        expectedImpact: topPattern.effectiveness * 0.8,
                        implementationDifficulty: 'medium'
                    });
                }
            }

            // Sort by expected impact and confidence
            suggestions.sort((a, b) => (b.expectedImpact * b.confidence) - (a.expectedImpact * a.confidence));

            setAdaptationSuggestions(suggestions);
        } catch (error) {
            console.error('Error analyzing data:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const applyAdaptation = (suggestion: AdaptationSuggestion) => {
        if (suggestion.type === 'personality') {
            // Update personality trait
            const updatedTraits = personalityTraits.map(trait => {
                if (trait.name === suggestion.trait) {
                    const newLevel = suggestion.suggestedValue;
                    return {
                        ...trait,
                        currentLevel: newLevel,
                        lastUpdated: new Date()
                    };
                }
                return trait;
            });

            setPersonalityTraits(updatedTraits);

            // Notify parent component
            const personalityUpdates: Record<string, number> = {};
            updatedTraits.forEach(trait => {
                personalityUpdates[trait.id] = trait.currentLevel;
            });

            onPersonalityUpdate?.(personalityUpdates);
        }

        // Remove applied suggestion
        setAdaptationSuggestions(prev => prev.filter(s => s.id !== suggestion.id));

        onAdaptationApplied?.(suggestion);

        Alert.alert('Adaptation Applied', `Successfully applied ${suggestion.trait} adaptation.`);
    };

    const createABTest = (testData: Omit<ABTest, 'id' | 'status' | 'startDate' | 'metrics'>) => {
        const newTest: ABTest = {
            ...testData,
            id: Date.now().toString(),
            status: 'running',
            startDate: new Date(),
            metrics: {
                totalUsers: 0,
                averageEngagement: 0,
                averageSatisfaction: 0,
                completionRate: 0,
                retentionRate: 0
            }
        };

        const updatedTests = [...abTests, newTest];
        setAbTests(updatedTests);
        saveSelfImprovementData();
        setShowCreateTest(false);
    };

    const updateTraitTarget = (traitId: string, newTarget: number) => {
        const updatedTraits = personalityTraits.map(trait => {
            if (trait.id === traitId) {
                return {
                    ...trait,
                    targetLevel: Math.max(0, Math.min(100, newTarget)),
                    lastUpdated: new Date()
                };
            }
            return trait;
        });

        setPersonalityTraits(updatedTraits);
        saveSelfImprovementData();
    };

    const recordLearningPattern = (pattern: string, effectiveness: number) => {
        const existingPattern = learningPatterns.find(p => p.pattern === pattern);

        if (existingPattern) {
            const updatedPatterns = learningPatterns.map(p => {
                if (p.pattern === pattern) {
                    return {
                        ...p,
                        frequency: p.frequency + 1,
                        effectiveness: (p.effectiveness + effectiveness) / 2,
                        lastObserved: new Date(),
                        confidence: Math.min(p.confidence + 0.1, 1.0)
                    };
                }
                return p;
            });
            setLearningPatterns(updatedPatterns);
        } else {
            const newPattern: LearningPattern = {
                id: Date.now().toString(),
                pattern,
                frequency: 1,
                effectiveness,
                lastObserved: new Date(),
                confidence: 0.5
            };
            setLearningPatterns([...learningPatterns, newPattern]);
        }

        saveSelfImprovementData();
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <ThemedText style={styles.title}>Self-Improvement Engine</ThemedText>

                {/* Current Personality Overview */}
                <EnhancedCard style={styles.overviewCard}>
                    <ThemedText style={styles.sectionTitle}>Personality Profile</ThemedText>
                    {personalityTraits.map(trait => (
                        <View key={trait.id} style={styles.traitItem}>
                            <View style={styles.traitHeader}>
                                <ThemedText style={styles.traitName}>{trait.name}</ThemedText>
                                <ThemedText style={styles.traitValue}>
                                    {trait.currentLevel}/{trait.targetLevel}
                                </ThemedText>
                            </View>
                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        { width: `${(trait.currentLevel / 100) * 100}%` }
                                    ]}
                                />
                                <View
                                    style={[
                                        styles.targetIndicator,
                                        { left: `${trait.targetLevel}%` }
                                    ]}
                                />
                            </View>
                            <ThemedText style={styles.traitDescription}>{trait.description}</ThemedText>
                        </View>
                    ))}
                </EnhancedCard>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <EnhancedButton
                        label="Analyze & Suggest"
                        onPress={analyzeAndGenerateSuggestions}
                        style={styles.actionButton}
                        disabled={isAnalyzing}
                    />
                    <EnhancedButton
                        label="View Suggestions"
                        onPress={() => setShowSuggestions(!showSuggestions)}
                        style={styles.actionButton}
                    />
                    <EnhancedButton
                        label="Create A/B Test"
                        onPress={() => setShowCreateTest(true)}
                        style={styles.actionButton}
                    />
                </View>

                {/* Analysis Status */}
                {isAnalyzing && (
                    <EnhancedCard style={styles.analysisCard}>
                        <ThemedText style={styles.analysisText}>
                            🔄 Analyzing user data and generating personalized improvement suggestions...
                        </ThemedText>
                    </EnhancedCard>
                )}

                {/* Adaptation Suggestions */}
                {showSuggestions && adaptationSuggestions.length > 0 && (
                    <View style={styles.suggestionsSection}>
                        <ThemedText style={styles.sectionTitle}>Improvement Suggestions</ThemedText>
                        {adaptationSuggestions.map(suggestion => (
                            <EnhancedCard key={suggestion.id} style={styles.suggestionCard}>
                                <View style={styles.suggestionHeader}>
                                    <ThemedText style={styles.suggestionTitle}>
                                        {suggestion.trait} Adaptation
                                    </ThemedText>
                                    <View style={styles.suggestionMeta}>
                                        <ThemedText style={[
                                            styles.difficultyBadge,
                                            suggestion.implementationDifficulty === 'easy' && styles.easyBadge,
                                            suggestion.implementationDifficulty === 'medium' && styles.mediumBadge,
                                            suggestion.implementationDifficulty === 'hard' && styles.hardBadge
                                        ]}>
                                            {suggestion.implementationDifficulty}
                                        </ThemedText>
                                        <ThemedText style={styles.confidenceText}>
                                            {Math.round(suggestion.confidence * 100)}% confidence
                                        </ThemedText>
                                    </View>
                                </View>

                                <ThemedText style={styles.suggestionReason}>{suggestion.reason}</ThemedText>

                                <View style={styles.suggestionDetails}>
                                    <ThemedText style={styles.detailText}>
                                        Current: {suggestion.currentValue} → Suggested: {suggestion.suggestedValue}
                                    </ThemedText>
                                    <ThemedText style={styles.detailText}>
                                        Expected Impact: {suggestion.expectedImpact.toFixed(1)}/10
                                    </ThemedText>
                                </View>

                                <View style={styles.suggestionActions}>
                                    <EnhancedButton
                                        label="Apply Adaptation"
                                        onPress={() => applyAdaptation(suggestion)}
                                        style={styles.applyButton}
                                    />
                                    <EnhancedButton
                                        label="Dismiss"
                                        onPress={() => {
                                            setAdaptationSuggestions(prev =>
                                                prev.filter(s => s.id !== suggestion.id)
                                            );
                                        }}
                                        style={styles.dismissButton}
                                    />
                                </View>
                            </EnhancedCard>
                        ))}
                    </View>
                )}

                {/* A/B Tests */}
                {abTests.length > 0 && (
                    <View style={styles.testsSection}>
                        <ThemedText style={styles.sectionTitle}>A/B Tests</ThemedText>
                        {abTests.map(test => (
                            <EnhancedCard key={test.id} style={styles.testCard}>
                                <View style={styles.testHeader}>
                                    <ThemedText style={styles.testTitle}>{test.name}</ThemedText>
                                    <ThemedText style={[
                                        styles.testStatus,
                                        test.status === 'running' && styles.runningStatus,
                                        test.status === 'completed' && styles.completedStatus,
                                        test.status === 'paused' && styles.pausedStatus
                                    ]}>
                                        {test.status}
                                    </ThemedText>
                                </View>
                                <ThemedText style={styles.testDescription}>{test.description}</ThemedText>

                                <View style={styles.testMetrics}>
                                    <ThemedText style={styles.metricText}>
                                        Users: {test.metrics.totalUsers}
                                    </ThemedText>
                                    <ThemedText style={styles.metricText}>
                                        Engagement: {test.metrics.averageEngagement.toFixed(1)}/10
                                    </ThemedText>
                                    <ThemedText style={styles.metricText}>
                                        Satisfaction: {test.metrics.averageSatisfaction.toFixed(1)}/10
                                    </ThemedText>
                                </View>

                                {test.winner && (
                                    <ThemedText style={styles.winnerText}>
                                        🏆 Winner: {test.winner}
                                    </ThemedText>
                                )}
                            </EnhancedCard>
                        ))}
                    </View>
                )}

                {/* Learning Patterns */}
                {learningPatterns.length > 0 && (
                    <EnhancedCard style={styles.patternsCard}>
                        <ThemedText style={styles.sectionTitle}>Learning Patterns</ThemedText>
                        {learningPatterns.slice(0, 5).map(pattern => (
                            <View key={pattern.id} style={styles.patternItem}>
                                <ThemedText style={styles.patternText}>{pattern.pattern}</ThemedText>
                                <View style={styles.patternStats}>
                                    <ThemedText style={styles.patternStat}>
                                        Frequency: {pattern.frequency}
                                    </ThemedText>
                                    <ThemedText style={styles.patternStat}>
                                        Effectiveness: {Math.round(pattern.effectiveness * 100)}%
                                    </ThemedText>
                                    <ThemedText style={styles.patternStat}>
                                        Confidence: {Math.round(pattern.confidence * 100)}%
                                    </ThemedText>
                                </View>
                            </View>
                        ))}
                    </EnhancedCard>
                )}

                {/* Create A/B Test Modal */}
                {showCreateTest && (
                    <ABTestForm
                        onSubmit={createABTest}
                        onCancel={() => setShowCreateTest(false)}
                        personalityTraits={personalityTraits}
                    />
                )}
            </ScrollView>
        </ThemedView>
    );
};

// A/B Test Creation Form Component
const ABTestForm: React.FC<{
    onSubmit: (test: Omit<ABTest, 'id' | 'status' | 'startDate' | 'metrics'>) => void;
    onCancel: () => void;
    personalityTraits: PersonalityTrait[];
}> = ({ onSubmit, onCancel, personalityTraits }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [variants, setVariants] = useState<ABTestVariant[]>([
        {
            id: 'variant_a',
            name: 'Control',
            description: 'Current personality settings',
            personalityAdjustments: {},
            userCount: 0,
            engagementScore: 0,
            satisfactionScore: 0
        },
        {
            id: 'variant_b',
            name: 'Experimental',
            description: 'Modified personality settings',
            personalityAdjustments: {},
            userCount: 0,
            engagementScore: 0,
            satisfactionScore: 0
        }
    ]);

    const handleSubmit = () => {
        if (!name || !description) {
            Alert.alert('Error', 'Please fill in name and description');
            return;
        }

        onSubmit({
            name,
            description,
            variants,
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });
    };

    const updateVariantAdjustment = (variantId: string, traitId: string, adjustment: number) => {
        setVariants(prevVariants =>
            prevVariants.map(variant => {
                if (variant.id === variantId) {
                    return {
                        ...variant,
                        personalityAdjustments: {
                            ...variant.personalityAdjustments,
                            [traitId]: adjustment
                        }
                    };
                }
                return variant;
            })
        );
    };

    return (
        <EnhancedCard style={styles.formModal}>
            <ThemedText style={styles.formTitle}>Create A/B Test</ThemedText>

            <EnhancedInput
                placeholder="Test Name"
                value={name}
                onChangeText={setName}
                style={styles.inputField}
            />

            <EnhancedInput
                placeholder="Test Description"
                value={description}
                onChangeText={setDescription}
                style={styles.inputField}
            />

            <ThemedText style={styles.formSubtitle}>Test Variants</ThemedText>
            {variants.map(variant => (
                <View key={variant.id} style={styles.variantSection}>
                    <ThemedText style={styles.variantTitle}>{variant.name}</ThemedText>
                    <ThemedText style={styles.variantDescription}>{variant.description}</ThemedText>

                    <ThemedText style={styles.adjustmentsTitle}>Personality Adjustments:</ThemedText>
                    {personalityTraits.map(trait => (
                        <View key={trait.id} style={styles.adjustmentRow}>
                            <ThemedText style={styles.traitLabel}>{trait.name}:</ThemedText>
                            <View style={styles.adjustmentControls}>
                                <EnhancedButton
                                    label="-"
                                    onPress={() => updateVariantAdjustment(
                                        variant.id,
                                        trait.id,
                                        (variant.personalityAdjustments[trait.id] || 0) - 5
                                    )}
                                    style={styles.adjustmentButton}
                                />
                                <ThemedText style={styles.adjustmentValue}>
                                    {variant.personalityAdjustments[trait.id] || 0}
                                </ThemedText>
                                <EnhancedButton
                                    label="+"
                                    onPress={() => updateVariantAdjustment(
                                        variant.id,
                                        trait.id,
                                        (variant.personalityAdjustments[trait.id] || 0) + 5
                                    )}
                                    style={styles.adjustmentButton}
                                />
                            </View>
                        </View>
                    ))}
                </View>
            ))}

            <View style={styles.formActions}>
                <EnhancedButton label="Cancel" onPress={onCancel} style={styles.cancelButton} />
                <EnhancedButton label="Create Test" onPress={handleSubmit} style={styles.submitButton} />
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
    overviewCard: {
        marginBottom: 16,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    traitItem: {
        marginBottom: 16,
    },
    traitHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    traitName: {
        fontSize: 16,
        fontWeight: '600',
    },
    traitValue: {
        fontSize: 14,
        color: '#007AFF',
    },
    progressBar: {
        height: 8,
        backgroundColor: '#E9ECEF',
        borderRadius: 4,
        marginBottom: 8,
        position: 'relative',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#007AFF',
        borderRadius: 4,
    },
    targetIndicator: {
        position: 'absolute',
        top: -2,
        width: 4,
        height: 12,
        backgroundColor: '#28A745',
        borderRadius: 2,
    },
    traitDescription: {
        fontSize: 12,
        color: '#666',
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
    analysisCard: {
        marginBottom: 16,
        padding: 16,
        alignItems: 'center',
    },
    analysisText: {
        fontSize: 16,
        color: '#007AFF',
    },
    suggestionsSection: {
        marginBottom: 20,
    },
    suggestionCard: {
        marginBottom: 12,
        padding: 16,
    },
    suggestionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    suggestionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    suggestionMeta: {
        alignItems: 'flex-end',
    },
    difficultyBadge: {
        fontSize: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 4,
    },
    easyBadge: {
        backgroundColor: '#D4EDDA',
        color: '#155724',
    },
    mediumBadge: {
        backgroundColor: '#FFF3CD',
        color: '#856404',
    },
    hardBadge: {
        backgroundColor: '#F8D7DA',
        color: '#721C24',
    },
    confidenceText: {
        fontSize: 12,
        color: '#666',
    },
    suggestionReason: {
        fontSize: 14,
        marginBottom: 8,
        lineHeight: 20,
    },
    suggestionDetails: {
        marginBottom: 12,
    },
    detailText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    suggestionActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    applyButton: {
        flex: 1,
        marginRight: 8,
    },
    dismissButton: {
        flex: 1,
        marginLeft: 8,
    },
    testsSection: {
        marginBottom: 20,
    },
    testCard: {
        marginBottom: 12,
        padding: 16,
    },
    testHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    testTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    testStatus: {
        fontSize: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    runningStatus: {
        backgroundColor: '#D1ECF1',
        color: '#0C5460',
    },
    completedStatus: {
        backgroundColor: '#D4EDDA',
        color: '#155724',
    },
    pausedStatus: {
        backgroundColor: '#FFF3CD',
        color: '#856404',
    },
    testDescription: {
        fontSize: 14,
        marginBottom: 8,
    },
    testMetrics: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metricText: {
        fontSize: 12,
        color: '#666',
    },
    winnerText: {
        fontSize: 14,
        color: '#28A745',
        fontWeight: 'bold',
        marginTop: 8,
    },
    patternsCard: {
        marginBottom: 16,
        padding: 16,
    },
    patternItem: {
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    patternText: {
        fontSize: 14,
        marginBottom: 4,
    },
    patternStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    patternStat: {
        fontSize: 12,
        color: '#666',
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
    formSubtitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        marginTop: 12,
    },
    inputField: {
        marginBottom: 12,
    },
    variantSection: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#F8F9FA',
        borderRadius: 8,
    },
    variantTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    variantDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    adjustmentsTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    adjustmentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    traitLabel: {
        fontSize: 14,
        flex: 1,
    },
    adjustmentControls: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-end',
    },
    adjustmentButton: {
        width: 30,
        height: 30,
        marginHorizontal: 4,
    },
    adjustmentValue: {
        fontSize: 14,
        fontWeight: 'bold',
        minWidth: 40,
        textAlign: 'center',
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
});

export default SelfImprovementEngine;
