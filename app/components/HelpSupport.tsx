import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Linking,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../store/theme';
import { EnhancedButton } from './EnhancedButton';
import { EnhancedCard } from './EnhancedCard';

interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category: string;
}

interface TutorialItem {
    id: string;
    title: string;
    description: string;
    duration: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    steps: string[];
}

interface ContactOption {
    id: string;
    title: string;
    description: string;
    icon: string;
    action: () => void;
}

const faqData: FAQItem[] = [
    {
        id: '1',
        question: 'How do I get started with Sallie AI?',
        answer: 'Welcome to Sallie AI! Start by completing the onboarding process, which will guide you through setting up your profile and preferences. You can access the onboarding anytime from the settings menu.',
        category: 'Getting Started',
    },
    {
        id: '2',
        question: 'How do I upload media files?',
        answer: 'Use the Media Upload feature in the main interface. You can upload images, videos, documents, and audio files. Simply tap the upload buttons and select your files from your device.',
        category: 'Features',
    },
    {
        id: '3',
        question: 'Can I customize Sallie\'s personality?',
        answer: 'Yes! Sallie AI adapts to your preferences over time. You can also manually adjust personality settings in the Profile section to customize the interaction style.',
        category: 'Personalization',
    },
    {
        id: '4',
        question: 'How do I provide feedback?',
        answer: 'You can submit feedback through the Feedback section in settings. We appreciate your input to help improve Sallie AI!',
        category: 'Support',
    },
    {
        id: '5',
        question: 'Is my data secure?',
        answer: 'Yes, we take privacy seriously. All data is encrypted and stored securely. You can review our privacy policy in the settings menu.',
        category: 'Privacy',
    },
];

const tutorialData: TutorialItem[] = [
    {
        id: '1',
        title: 'Getting Started with Sallie AI',
        description: 'Learn the basics of interacting with your AI companion',
        duration: '5 min',
        difficulty: 'Beginner',
        steps: [
            'Complete the onboarding process',
            'Set up your profile preferences',
            'Explore the main interface',
            'Try your first conversation',
        ],
    },
    {
        id: '2',
        title: 'Media Upload and Management',
        description: 'Master uploading and organizing your media files',
        duration: '8 min',
        difficulty: 'Beginner',
        steps: [
            'Access the media upload feature',
            'Select files from your device',
            'Choose upload options',
            'Organize uploaded content',
        ],
    },
    {
        id: '3',
        title: 'Customizing Your Experience',
        description: 'Personalize Sallie AI to match your preferences',
        duration: '10 min',
        difficulty: 'Intermediate',
        steps: [
            'Navigate to profile settings',
            'Adjust personality parameters',
            'Configure notification preferences',
            'Set up custom themes',
        ],
    },
];

const contactOptions: ContactOption[] = [
    {
        id: '1',
        title: 'Email Support',
        description: 'Send us an email for detailed assistance',
        icon: '📧',
        action: () => {
            const email = 'support@sallie.ai';
            const subject = 'Sallie AI Support Request';
            const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
            Linking.canOpenURL(url).then(supported => {
                if (supported) {
                    Linking.openURL(url);
                } else {
                    Alert.alert('Error', 'Unable to open email client');
                }
            });
        },
    },
    {
        id: '2',
        title: 'Live Chat',
        description: 'Chat with our support team in real-time',
        icon: '💬',
        action: () => {
            Alert.alert('Coming Soon', 'Live chat support will be available soon!');
        },
    },
    {
        id: '3',
        title: 'Community Forum',
        description: 'Connect with other users and share experiences',
        icon: '👥',
        action: () => {
            const url = 'https://community.sallie.ai';
            Linking.canOpenURL(url).then(supported => {
                if (supported) {
                    Linking.openURL(url);
                } else {
                    Alert.alert('Error', 'Unable to open community forum');
                }
            });
        },
    },
    {
        id: '4',
        title: 'Documentation',
        description: 'Browse our comprehensive documentation',
        icon: '📚',
        action: () => {
            const url = 'https://docs.sallie.ai';
            Linking.canOpenURL(url).then(supported => {
                if (supported) {
                    Linking.openURL(url);
                } else {
                    Alert.alert('Error', 'Unable to open documentation');
                }
            });
        },
    },
];

export function HelpSupport() {
    const { currentTheme } = useThemeStore();
    const isDark = currentTheme.name.toLowerCase().includes('dark');

    const [activeTab, setActiveTab] = useState<'faq' | 'tutorials' | 'contact'>('faq');
    const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

    const toggleFAQ = (id: string) => {
        setExpandedFAQ(expandedFAQ === id ? null : id);
    };

    const renderFAQ = () => (
        <ScrollView style={styles.contentContainer}>
            {faqData.map(item => (
                <EnhancedCard
                    key={item.id}
                    variant="glass"
                    style={styles.faqCard}
                >
                    <TouchableOpacity
                        style={styles.faqHeader}
                        onPress={() => toggleFAQ(item.id)}
                    >
                        <Text style={styles.faqQuestion}>{item.question}</Text>
                        <Text style={styles.faqToggle}>
                            {expandedFAQ === item.id ? '−' : '+'}
                        </Text>
                    </TouchableOpacity>

                    {expandedFAQ === item.id && (
                        <View style={styles.faqAnswer}>
                            <Text style={styles.faqAnswerText}>{item.answer}</Text>
                            <Text style={styles.faqCategory}>{item.category}</Text>
                        </View>
                    )}
                </EnhancedCard>
            ))}
        </ScrollView>
    );

    const renderTutorials = () => (
        <ScrollView style={styles.contentContainer}>
            {tutorialData.map(item => (
                <EnhancedCard
                    key={item.id}
                    variant="glass"
                    style={styles.tutorialCard}
                >
                    <View style={styles.tutorialHeader}>
                        <Text style={styles.tutorialTitle}>{item.title}</Text>
                        <View style={styles.tutorialMeta}>
                            <Text style={styles.tutorialDuration}>{item.duration}</Text>
                            <Text style={[
                                styles.tutorialDifficulty,
                                {
                                    color: item.difficulty === 'Beginner' ? '#10B981' :
                                        item.difficulty === 'Intermediate' ? '#F59E0B' : '#EF4444'
                                }
                            ]}>
                                {item.difficulty}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.tutorialDescription}>{item.description}</Text>

                    <View style={styles.tutorialSteps}>
                        <Text style={styles.stepsTitle}>Steps:</Text>
                        {item.steps.map((step, index) => (
                            <Text key={index} style={styles.stepText}>
                                {index + 1}. {step}
                            </Text>
                        ))}
                    </View>

                    <EnhancedButton
                        title="Start Tutorial"
                        variant="outline"
                        onPress={() => Alert.alert('Tutorial', `Starting: ${item.title}`)}
                        style={styles.startTutorialButton}
                    />
                </EnhancedCard>
            ))}
        </ScrollView>
    );

    const renderContact = () => (
        <ScrollView style={styles.contentContainer}>
            {contactOptions.map(item => (
                <EnhancedCard
                    key={item.id}
                    variant="glass"
                    style={styles.contactCard}
                    onPress={item.action}
                >
                    <View style={styles.contactContent}>
                        <Text style={styles.contactIcon}>{item.icon}</Text>
                        <View style={styles.contactText}>
                            <Text style={styles.contactTitle}>{item.title}</Text>
                            <Text style={styles.contactDescription}>{item.description}</Text>
                        </View>
                    </View>
                </EnhancedCard>
            ))}
        </ScrollView>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Help & Support</Text>

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'faq' && styles.activeTab]}
                    onPress={() => setActiveTab('faq')}
                >
                    <Text style={[styles.tabText, activeTab === 'faq' && styles.activeTabText]}>
                        FAQ
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'tutorials' && styles.activeTab]}
                    onPress={() => setActiveTab('tutorials')}
                >
                    <Text style={[styles.tabText, activeTab === 'tutorials' && styles.activeTabText]}>
                        Tutorials
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'contact' && styles.activeTab]}
                    onPress={() => setActiveTab('contact')}
                >
                    <Text style={[styles.tabText, activeTab === 'contact' && styles.activeTabText]}>
                        Contact
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            {activeTab === 'faq' && renderFAQ()}
            {activeTab === 'tutorials' && renderTutorials()}
            {activeTab === 'contact' && renderContact()}

            {/* Quick Actions */}
            <View style={styles.quickActions}>
                <EnhancedButton
                    title="Report a Bug"
                    variant="outline"
                    onPress={() => Alert.alert('Bug Report', 'Bug reporting feature coming soon!')}
                    style={styles.quickActionButton}
                />
                <EnhancedButton
                    title="Feature Request"
                    variant="outline"
                    onPress={() => Alert.alert('Feature Request', 'Feature request form coming soon!')}
                    style={styles.quickActionButton}
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
    faqCard: {
        marginBottom: 8,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    faqQuestion: {
        fontSize: 16,
        color: '#f5f5f5',
        flex: 1,
        fontFamily: 'SpaceMono',
    },
    faqToggle: {
        fontSize: 18,
        color: '#FFD700',
        fontWeight: 'bold',
    },
    faqAnswer: {
        padding: 16,
        paddingTop: 0,
    },
    faqAnswerText: {
        fontSize: 14,
        color: '#ccc',
        lineHeight: 20,
        marginBottom: 8,
        fontFamily: 'SpaceMono',
    },
    faqCategory: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic',
        fontFamily: 'SpaceMono',
    },
    tutorialCard: {
        marginBottom: 16,
    },
    tutorialHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    tutorialTitle: {
        fontSize: 18,
        color: '#f5f5f5',
        flex: 1,
        fontFamily: 'SpaceMono',
    },
    tutorialMeta: {
        alignItems: 'flex-end',
    },
    tutorialDuration: {
        fontSize: 12,
        color: '#888',
        fontFamily: 'SpaceMono',
    },
    tutorialDifficulty: {
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'SpaceMono',
    },
    tutorialDescription: {
        fontSize: 14,
        color: '#ccc',
        marginBottom: 12,
        lineHeight: 20,
        fontFamily: 'SpaceMono',
    },
    tutorialSteps: {
        marginBottom: 16,
    },
    stepsTitle: {
        fontSize: 14,
        color: '#f5f5f5',
        fontWeight: 'bold',
        marginBottom: 8,
        fontFamily: 'SpaceMono',
    },
    stepText: {
        fontSize: 14,
        color: '#ccc',
        marginBottom: 4,
        lineHeight: 20,
        fontFamily: 'SpaceMono',
    },
    startTutorialButton: {
        marginTop: 8,
    },
    contactCard: {
        marginBottom: 8,
    },
    contactContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    contactIcon: {
        fontSize: 32,
        marginRight: 16,
    },
    contactText: {
        flex: 1,
    },
    contactTitle: {
        fontSize: 16,
        color: '#f5f5f5',
        fontWeight: 'bold',
        marginBottom: 4,
        fontFamily: 'SpaceMono',
    },
    contactDescription: {
        fontSize: 14,
        color: '#ccc',
        fontFamily: 'SpaceMono',
    },
    quickActions: {
        flexDirection: 'row',
        gap: 8,
    },
    quickActionButton: {
        flex: 1,
    },
});
