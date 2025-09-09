/*
 * Sallie AI Help & Support Component
 * Comprehensive help system with FAQs and support
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Linking,
    Alert,
    Dimensions,
    TextInput,
    FlatList,
} from 'react-native';
import { useTheme } from './ThemeSystem';
import { getFontStyle } from './FontManager';
import { usePressAnimation } from './AnimationSystem';
import { Feather, MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category: string;
}

interface SupportContact {
    id: string;
    type: 'email' | 'phone' | 'website' | 'social';
    label: string;
    value: string;
    icon: string;
}

interface HelpSectionProps {
    onContactSupport?: (contact: SupportContact) => void;
    onReportBug?: () => void;
    onRequestFeature?: () => void;
    style?: any;
}

export const HelpSection: React.FC<HelpSectionProps> = ({
    onContactSupport,
    onReportBug,
    onRequestFeature,
    style,
}) => {
    const { theme } = useTheme();
    const [activeSections, setActiveSections] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // FAQ Data
    const faqs: FAQItem[] = [
        {
            id: '1',
            question: 'How do I get started with Sallie AI?',
            answer: 'Welcome to Sallie AI! To get started, create your profile in the settings, explore the different features like chat, media playback, and customization options. You can access the main features through the navigation tabs.',
            category: 'Getting Started',
        },
        {
            id: '2',
            question: 'How do I customize my experience?',
            answer: 'You can customize Sallie AI through the Settings screen. Change themes, adjust preferences for notifications, sound effects, and more. You can also personalize your profile with an avatar and bio.',
            category: 'Customization',
        },
        {
            id: '3',
            question: 'How do I upload and manage media files?',
            answer: 'Use the Media Upload component to select files from your gallery, camera, or documents. You can upload images, videos, audio files, and documents. The app includes caching for offline access and playlist management for media files.',
            category: 'Media',
        },
        {
            id: '4',
            question: 'What features are available for audio playback?',
            answer: 'Sallie AI includes an advanced audio player with playlist support, playback controls, and progress tracking. You can create and manage playlists, adjust playback speed, and enjoy offline playback with cached files.',
            category: 'Audio',
        },
        {
            id: '5',
            question: 'How do I use the video player?',
            answer: 'The video player supports various formats with full playback controls, fullscreen mode, and playlist integration. You can adjust playback speed, seek through content, and manage video playlists.',
            category: 'Video',
        },
        {
            id: '6',
            question: 'How does the theme system work?',
            answer: 'Sallie AI features a comprehensive theming system with multiple preset themes and customization options. You can switch between light/dark modes, choose from various color schemes, and even create custom themes.',
            category: 'Themes',
        },
        {
            id: '7',
            question: 'What privacy options are available?',
            answer: 'You have full control over your privacy settings. You can manage analytics, crash reporting, data sharing preferences, and control what information is stored locally or shared with services.',
            category: 'Privacy',
        },
        {
            id: '8',
            question: 'How do I backup or export my data?',
            answer: 'You can export your data through the Settings screen under the Data section. This includes your profile, preferences, playlists, and other user data. Data is exported in a secure format for backup purposes.',
            category: 'Data Management',
        },
        {
            id: '9',
            question: 'What should I do if the app crashes or freezes?',
            answer: 'If you experience crashes, first try restarting the app. If the issue persists, check for updates, clear the app cache through Settings, or report the bug using the support contact options.',
            category: 'Troubleshooting',
        },
        {
            id: '10',
            question: 'How do I report bugs or request features?',
            answer: 'You can report bugs or request features through the support contact options. Include detailed information about the issue or feature request, including steps to reproduce and your device information.',
            category: 'Support',
        },
    ];

    // Support Contacts
    const supportContacts: SupportContact[] = [
        {
            id: '1',
            type: 'email',
            label: 'Email Support',
            value: 'support@sallie-ai.com',
            icon: 'email',
        },
        {
            id: '2',
            type: 'website',
            label: 'Help Center',
            value: 'https://sallie-ai.com/help',
            icon: 'web',
        },
        {
            id: '3',
            type: 'social',
            label: 'Twitter Support',
            value: 'https://twitter.com/sallie_ai',
            icon: 'twitter',
        },
        {
            id: '4',
            type: 'social',
            label: 'Discord Community',
            value: 'https://discord.gg/sallie-ai',
            icon: 'chat',
        },
    ];

    // Filter FAQs based on search
    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group FAQs by category
    const faqCategories = [...new Set(faqs.map(faq => faq.category))];

    // Handle contact press
    const handleContactPress = async (contact: SupportContact) => {
        try {
            let url = '';

            switch (contact.type) {
                case 'email':
                    url = `mailto:${contact.value}`;
                    break;
                case 'phone':
                    url = `tel:${contact.value}`;
                    break;
                case 'website':
                case 'social':
                    url = contact.value;
                    break;
            }

            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Error', `Cannot open ${contact.label}`);
            }
        } catch (error) {
            console.error('Failed to open contact:', error);
            Alert.alert('Error', 'Failed to open contact method');
        }

        onContactSupport?.(contact);
    };

    // Simple accordion state management
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    // Toggle section expansion
    const toggleSection = (sectionId: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(sectionId)) {
            newExpanded.delete(sectionId);
        } else {
            newExpanded.add(sectionId);
        }
        setExpandedSections(newExpanded);
    };

    // Render FAQ header
    const renderFaqHeader = (section: FAQItem) => {
        const isExpanded = expandedSections.has(section.id);

        return (
            <TouchableOpacity
                style={styles.faqHeader}
                onPress={() => toggleSection(section.id)}
                activeOpacity={0.7}
            >
                <View style={styles.faqHeaderContent}>
                    <Text style={styles.faqQuestion}>{section.question}</Text>
                    <Text style={styles.faqCategory}>{section.category}</Text>
                </View>
                <Feather
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={theme.colors.text.secondary}
                />
            </TouchableOpacity>
        );
    };

    // Render FAQ content
    const renderFaqContent = (section: FAQItem) => (
        <View style={styles.faqContent}>
            <Text style={styles.faqAnswer}>{section.answer}</Text>
        </View>
    );

    // Render FAQ item for FlatList
    const renderFaqItem = ({ item }: { item: FAQItem }) => {
        const isExpanded = expandedSections.has(item.id);

        return (
            <View style={styles.faqItem}>
                <TouchableOpacity
                    style={styles.faqHeader}
                    onPress={() => toggleSection(item.id)}
                    activeOpacity={0.7}
                >
                    <View style={styles.faqHeaderContent}>
                        <Text style={styles.faqQuestion}>{item.question}</Text>
                        <Text style={styles.faqCategory}>{item.category}</Text>
                    </View>
                    <Feather
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={theme.colors.text.secondary}
                    />
                </TouchableOpacity>
                {isExpanded && (
                    <View style={styles.faqContent}>
                        <Text style={styles.faqAnswer}>{item.answer}</Text>
                    </View>
                )}
            </View>
        );
    };

    // Render support contact
    const renderSupportContact = (contact: SupportContact) => {
        return (
            <TouchableOpacity
                key={contact.id}
                style={styles.contactItem}
                onPress={() => handleContactPress(contact)}
                activeOpacity={0.7}
            >
                <View style={styles.contactIcon}>
                    <MaterialIcons
                        name={contact.icon as any}
                        size={24}
                        color={theme.colors.primary}
                    />
                </View>
                <View style={styles.contactInfo}>
                    <Text style={styles.contactLabel}>{contact.label}</Text>
                    <Text style={styles.contactValue}>{contact.value}</Text>
                </View>
                <Feather name="external-link" size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
        );
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            padding: theme.spacing.m,
        },
        searchContainer: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.medium,
            padding: theme.spacing.m,
            marginBottom: theme.spacing.m,
        },
        searchInput: {
            ...getFontStyle(theme.type, 'regular'),
            fontSize: theme.typography.sizes.body1,
            color: theme.colors.text.primary,
            paddingVertical: theme.spacing.s,
        },
        section: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.medium,
            marginBottom: theme.spacing.m,
            overflow: 'hidden',
        },
        sectionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.m,
            backgroundColor: theme.colors.background,
            borderBottomWidth: 1,
            borderBottomColor: '#E0E0E0',
        },
        sectionIcon: {
            marginRight: theme.spacing.s,
        },
        sectionTitle: {
            ...getFontStyle(theme.type, 'medium'),
            fontSize: theme.typography.sizes.subtitle,
            color: theme.colors.text.primary,
        },
        faqHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.m,
            borderBottomWidth: 1,
            borderBottomColor: '#E0E0E0',
        },
        faqItem: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.medium,
            marginBottom: theme.spacing.s,
            overflow: 'hidden',
        },
        faqHeaderContent: {
            flex: 1,
        },
        faqQuestion: {
            ...getFontStyle(theme.type, 'medium'),
            fontSize: theme.typography.sizes.body1,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.xs,
        },
        faqCategory: {
            ...getFontStyle(theme.type, 'regular'),
            fontSize: theme.typography.sizes.caption,
            color: theme.colors.primary,
        },
        faqContent: {
            padding: theme.spacing.m,
            backgroundColor: theme.colors.background,
        },
        faqAnswer: {
            ...getFontStyle(theme.type, 'regular'),
            fontSize: theme.typography.sizes.body1,
            color: theme.colors.text.secondary,
            lineHeight: 20,
        },
        quickActions: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginBottom: theme.spacing.m,
        },
        quickActionButton: {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.medium,
            padding: theme.spacing.m,
            alignItems: 'center',
            flex: 1,
            marginHorizontal: theme.spacing.xs,
        },
        quickActionIcon: {
            marginBottom: theme.spacing.xs,
        },
        quickActionText: {
            ...getFontStyle(theme.type, 'medium'),
            fontSize: theme.typography.sizes.caption,
            color: theme.colors.text.primary,
            textAlign: 'center',
        },
        contactItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.m,
            borderBottomWidth: 1,
            borderBottomColor: '#E0E0E0',
        },
        contactIcon: {
            marginRight: theme.spacing.m,
        },
        contactInfo: {
            flex: 1,
        },
        contactLabel: {
            ...getFontStyle(theme.type, 'medium'),
            fontSize: theme.typography.sizes.body1,
            color: theme.colors.text.primary,
        },
        contactValue: {
            ...getFontStyle(theme.type, 'regular'),
            fontSize: theme.typography.sizes.caption,
            color: theme.colors.text.secondary,
        },
        categoriesContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: theme.spacing.m,
        },
        categoryChip: {
            backgroundColor: theme.colors.background,
            borderRadius: theme.borderRadius.small,
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.xs,
            marginRight: theme.spacing.s,
            marginBottom: theme.spacing.s,
        },
        categoryText: {
            ...getFontStyle(theme.type, 'regular'),
            fontSize: theme.typography.sizes.caption,
            color: theme.colors.text.primary,
        },
        emptyState: {
            alignItems: 'center',
            padding: theme.spacing.l,
        },
        emptyText: {
            ...getFontStyle(theme.type, 'regular'),
            fontSize: theme.typography.sizes.body1,
            color: theme.colors.text.secondary,
            textAlign: 'center',
        },
    });

    return (
        <View style={[styles.container, style]}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Search */}
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search FAQs..."
                        placeholderTextColor={theme.colors.text.secondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={onReportBug}
                    >
                        <Feather name="help-circle" size={24} color={theme.colors.primary} style={styles.quickActionIcon} />
                        <Text style={styles.quickActionText}>Report Bug</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={onRequestFeature}
                    >
                        <Feather name="plus-circle" size={24} color={theme.colors.primary} style={styles.quickActionIcon} />
                        <Text style={styles.quickActionText}>Request Feature</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => handleContactPress(supportContacts[0])}
                    >
                        <Feather name="message-circle" size={24} color={theme.colors.primary} style={styles.quickActionIcon} />
                        <Text style={styles.quickActionText}>Contact Support</Text>
                    </TouchableOpacity>
                </View>

                {/* FAQ Categories */}
                {searchQuery === '' && (
                    <View style={styles.categoriesContainer}>
                        {faqCategories.map(category => (
                            <View key={category} style={styles.categoryChip}>
                                <Text style={styles.categoryText}>{category}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* FAQs */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="help" size={20} color={theme.colors.primary} style={styles.sectionIcon} />
                        <Text style={styles.sectionTitle}>
                            Frequently Asked Questions ({filteredFaqs.length})
                        </Text>
                    </View>

                    {filteredFaqs.length > 0 ? (
                        <FlatList
                            data={filteredFaqs}
                            keyExtractor={(item, index) => `${item.category}-${index}`}
                            renderItem={renderFaqItem}
                            showsVerticalScrollIndicator={false}
                        />
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>
                                No FAQs found matching your search.
                            </Text>
                        </View>
                    )}
                </View>

                {/* Support Contacts */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="contact-support" size={20} color={theme.colors.primary} style={styles.sectionIcon} />
                        <Text style={styles.sectionTitle}>Contact Support</Text>
                    </View>

                    {supportContacts.map(renderSupportContact)}
                </View>

                {/* User Guide Link */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.contactItem}
                        onPress={() => handleContactPress(supportContacts[1])}
                        activeOpacity={0.7}
                    >
                        <View style={styles.contactIcon}>
                            <MaterialIcons name="menu-book" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactLabel}>User Guide</Text>
                            <Text style={styles.contactValue}>Complete documentation and tutorials</Text>
                        </View>
                        <Feather name="external-link" size={20} color={theme.colors.text.secondary} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

export default HelpSection;
