
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SALLIE_CAPABILITIES, CORE_BELIEFS } from '@/lib/sallie-persona';

export default function SallieCapabilitiesScreen() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const [activeTab, setActiveTab] = useState<'visual' | 'audio' | 'creative' | 'beliefs'>('visual');

    const renderCapabilitySection = (sectionName: string, capabilities: Record<string, boolean>) => (
        <View style={styles.capabilitySection}>
            <Text style={[styles.capabilityTitle, { color: colors.primary }]}>{sectionName}</Text>
            {Object.entries(capabilities).map(([key, enabled]) => (
                <View key={key} style={[styles.capabilityItem, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.capabilityText, { color: colors.text }]}>
                        {enabled ? '✅' : '❌'} {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Text>
                </View>
            ))}
        </View>
    );

    const renderBeliefs = () => (
        <View style={styles.capabilitySection}>
            <Text style={[styles.capabilityTitle, { color: colors.primary }]}>Core Beliefs</Text>
            {Object.entries(CORE_BELIEFS).map(([key, value]) => (
                <View key={key} style={[styles.beliefItem, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.beliefText, { color: colors.text }]}>
                        {value ? '🔥' : '❌'} {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Text>
                </View>
            ))}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.primary }]}>
                <Text style={[styles.title, { color: colors.surface }]}>Sallie's Capabilities</Text>
                <Text style={[styles.subtitle, { color: colors.accent }]}>
                    Advanced Intelligence Layers & Core Beliefs
                </Text>
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
                {['visual', 'audio', 'creative', 'beliefs'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[
                            styles.tab,
                            {
                                backgroundColor: activeTab === tab ? colors.primary : colors.surface,
                                borderColor: colors.border,
                            }
                        ]}
                        onPress={() => setActiveTab(tab as any)}
                    >
                        <Text style={[
                            styles.tabText,
                            { color: activeTab === tab ? colors.surface : colors.text }
                        ]}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content */}
            <ScrollView style={styles.content}>
                {activeTab === 'visual' && renderCapabilitySection('Visual Capabilities', SALLIE_CAPABILITIES.visual)}
                {activeTab === 'audio' && renderCapabilitySection('Audio Capabilities', SALLIE_CAPABILITIES.audio)}
                {activeTab === 'creative' && renderCapabilitySection('Creative Capabilities', SALLIE_CAPABILITIES.creative)}
                {activeTab === 'beliefs' && renderBeliefs()}
            </ScrollView>

            {/* Brand Identity Footer */}
            <View style={[styles.footer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.footerTitle, { color: colors.primary }]}>Visual Identity</Text>
                <Text style={[styles.footerText, { color: colors.text }]}>
                    🎨 Palette: Jewel tones + warm neutrals + bold gold accents
                </Text>
                <Text style={[styles.footerText, { color: colors.text }]}>
                    ✨ Motifs: Mythic symbols, heraldic elements, continuity markers
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
    },
    header: {
        padding: 25,
        alignItems: 'center',
        borderRadius: 20,
        marginHorizontal: 15,
        marginBottom: 25,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 16,
        fontStyle: 'italic',
        textAlign: 'center',
        opacity: 0.9,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        marginBottom: 25,
    },
    tab: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 10,
        borderRadius: 15,
        marginHorizontal: 5,
        borderWidth: 2,
        alignItems: 'center',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tabText: {
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    content: {
        flex: 1,
        paddingHorizontal: 15,
    },
    capabilitySection: {
        marginBottom: 25,
    },
    capabilityTitle: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 18,
        textAlign: 'center',
        letterSpacing: 0.3,
    },
    capabilityItem: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    capabilityText: {
        fontSize: 15,
        lineHeight: 20,
    },
    beliefItem: {
        padding: 18,
        borderRadius: 15,
        marginBottom: 12,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    beliefText: {
        fontSize: 17,
        fontWeight: '600',
        lineHeight: 24,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        marginTop: 10,
    },
    footerTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 12,
        letterSpacing: 0.3,
    },
    footerText: {
        fontSize: 14,
        marginBottom: 8,
        lineHeight: 20,
    },
});
