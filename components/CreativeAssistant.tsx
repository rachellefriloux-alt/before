import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { EnhancedButton } from '../components/EnhancedButton';
import { EnhancedCard } from '../components/EnhancedCard';
import { EnhancedInput } from '../components/EnhancedInput';

export interface CreativeProject {
    id: string;
    title: string;
    type: CreativeProjectType;
    description: string;
    content: string;
    status: 'draft' | 'in_progress' | 'completed' | 'published';
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    wordCount?: number;
    inspiration?: string[];
    collaborators?: string[];
}

export interface WritingPrompt {
    id: string;
    category: string;
    prompt: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: number; // minutes
    tags: string[];
}

export type CreativeProjectType =
    | 'writing'
    | 'poetry'
    | 'story'
    | 'novel'
    | 'screenplay'
    | 'blog_post'
    | 'article'
    | 'journal'
    | 'art_concept'
    | 'music_lyrics'
    | 'other';

interface CreativeAssistantProps {
    onProjectSave?: (project: CreativeProject) => void;
    onProjectComplete?: (project: CreativeProject) => void;
}

export const CreativeAssistant: React.FC<CreativeAssistantProps> = ({
    onProjectSave,
    onProjectComplete
}) => {
    const [projects, setProjects] = useState<CreativeProject[]>([]);
    const [currentProject, setCurrentProject] = useState<CreativeProject | null>(null);
    const [writingPrompts, setWritingPrompts] = useState<WritingPrompt[]>([]);
    const [showPrompts, setShowPrompts] = useState(false);
    const [showNewProject, setShowNewProject] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

    useEffect(() => {
        loadProjects();
        loadWritingPrompts();
    }, []);

    const loadProjects = async () => {
        try {
            const stored = await AsyncStorage.getItem('creative_projects');
            if (stored) {
                const parsedProjects = JSON.parse(stored).map((p: any) => ({
                    ...p,
                    createdAt: new Date(p.createdAt),
                    updatedAt: new Date(p.updatedAt)
                }));
                setProjects(parsedProjects);
            }
        } catch (error) {
            console.error('Error loading creative projects:', error);
        }
    };

    const saveProjects = async (projectsToSave: CreativeProject[]) => {
        try {
            await AsyncStorage.setItem('creative_projects', JSON.stringify(projectsToSave));
        } catch (error) {
            console.error('Error saving creative projects:', error);
        }
    };

    const loadWritingPrompts = async () => {
        const defaultPrompts: WritingPrompt[] = [
            {
                id: '1',
                category: 'Character Development',
                prompt: 'Write about a character who discovers they have a hidden talent. How does this change their life?',
                difficulty: 'beginner',
                estimatedTime: 30,
                tags: ['character', 'discovery', 'growth']
            },
            {
                id: '2',
                category: 'World Building',
                prompt: 'Describe a society where emotions are currency. How does this affect relationships?',
                difficulty: 'intermediate',
                estimatedTime: 45,
                tags: ['world-building', 'society', 'emotions']
            },
            {
                id: '3',
                category: 'Dialogue',
                prompt: 'Write a conversation between two characters who haven\'t seen each other for 10 years.',
                difficulty: 'beginner',
                estimatedTime: 20,
                tags: ['dialogue', 'relationships', 'reunion']
            },
            {
                id: '4',
                category: 'Plot Twist',
                prompt: 'Your protagonist wakes up to discover the last 5 years of their life were a dream. What do they do?',
                difficulty: 'advanced',
                estimatedTime: 60,
                tags: ['plot-twist', 'reality', 'dreams']
            }
        ];
        setWritingPrompts(defaultPrompts);
    };

    const createNewProject = (type: CreativeProjectType, title: string) => {
        const newProject: CreativeProject = {
            id: Date.now().toString(),
            title,
            type,
            description: '',
            content: '',
            status: 'draft',
            tags: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const updatedProjects = [...projects, newProject];
        setProjects(updatedProjects);
        saveProjects(updatedProjects);
        setCurrentProject(newProject);
        setShowNewProject(false);
    };

    const updateProject = (projectId: string, updates: Partial<CreativeProject>) => {
        const updatedProjects = projects.map(project => {
            if (project.id === projectId) {
                const updated = {
                    ...project,
                    ...updates,
                    updatedAt: new Date(),
                    wordCount: updates.content ? updates.content.split(' ').length : project.wordCount
                };
                onProjectSave?.(updated);
                return updated;
            }
            return project;
        });

        setProjects(updatedProjects);
        saveProjects(updatedProjects);

        if (currentProject?.id === projectId) {
            setCurrentProject(updatedProjects.find(p => p.id === projectId) || null);
        }
    };

    const generateAiSuggestions = async (content: string, type: CreativeProjectType) => {
        // Simulate AI suggestions based on content type
        const suggestions: string[] = [];

        if (type === 'writing' || type === 'story') {
            suggestions.push('Consider adding more sensory details to immerse the reader');
            suggestions.push('Try varying your sentence length for better rhythm');
            suggestions.push('Consider the character\'s motivation in this scene');
        } else if (type === 'poetry') {
            suggestions.push('Experiment with different rhyme schemes');
            suggestions.push('Consider the poem\'s meter and flow');
            suggestions.push('Try using metaphors to enhance imagery');
        }

        setAiSuggestions(suggestions);
    };

    const getRandomPrompt = () => {
        const randomIndex = Math.floor(Math.random() * writingPrompts.length);
        return writingPrompts[randomIndex];
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <ThemedText style={styles.title}>Creative Assistant</ThemedText>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <EnhancedButton
                        label="New Project"
                        onPress={() => setShowNewProject(true)}
                        style={styles.actionButton}
                    />
                    <EnhancedButton
                        label="Writing Prompts"
                        onPress={() => setShowPrompts(true)}
                        style={styles.actionButton}
                    />
                    <EnhancedButton
                        label="Get Inspiration"
                        onPress={() => {
                            const prompt = getRandomPrompt();
                            Alert.alert('Writing Prompt', `${prompt.category}: ${prompt.prompt}`);
                        }}
                        style={styles.actionButton}
                    />
                </View>

                {/* Current Project */}
                {currentProject && (
                    <EnhancedCard style={styles.currentProject}>
                        <ThemedText style={styles.projectTitle}>{currentProject.title}</ThemedText>
                        <ThemedText style={styles.projectType}>{currentProject.type}</ThemedText>

                        <TextInput
                            style={styles.contentInput}
                            multiline
                            placeholder="Start writing your creative project..."
                            value={currentProject.content}
                            onChangeText={(text) => updateProject(currentProject.id, { content: text })}
                        />

                        {currentProject.wordCount && (
                            <ThemedText style={styles.wordCount}>
                                Words: {currentProject.wordCount}
                            </ThemedText>
                        )}

                        {/* AI Suggestions */}
                        {aiSuggestions.length > 0 && (
                            <View style={styles.suggestions}>
                                <ThemedText style={styles.suggestionsTitle}>AI Suggestions:</ThemedText>
                                {aiSuggestions.map((suggestion, index) => (
                                    <ThemedText key={index} style={styles.suggestion}>
                                        • {suggestion}
                                    </ThemedText>
                                ))}
                            </View>
                        )}

                        <View style={styles.projectActions}>
                            <EnhancedButton
                                label="Generate Suggestions"
                                onPress={() => generateAiSuggestions(currentProject.content, currentProject.type)}
                                style={styles.suggestionButton}
                            />
                            <EnhancedButton
                                label="Mark Complete"
                                onPress={() => {
                                    updateProject(currentProject.id, { status: 'completed' });
                                    onProjectComplete?.(currentProject);
                                }}
                                style={styles.completeButton}
                            />
                        </View>
                    </EnhancedCard>
                )}

                {/* Project List */}
                <View style={styles.projectList}>
                    <ThemedText style={styles.sectionTitle}>Your Projects</ThemedText>
                    {projects.map(project => (
                        <EnhancedCard key={project.id} style={styles.projectCard}>
                            <View style={styles.projectHeader}>
                                <ThemedText style={styles.projectTitle}>{project.title}</ThemedText>
                                <ThemedText style={styles.projectStatus}>{project.status}</ThemedText>
                            </View>
                            <ThemedText style={styles.projectType}>{project.type}</ThemedText>
                            {project.wordCount && (
                                <ThemedText style={styles.projectWords}>Words: {project.wordCount}</ThemedText>
                            )}
                            <EnhancedButton
                                label="Open"
                                onPress={() => setCurrentProject(project)}
                                style={styles.openButton}
                            />
                        </EnhancedCard>
                    ))}
                </View>

                {/* Writing Prompts Modal */}
                {showPrompts && (
                    <EnhancedCard style={styles.promptsModal}>
                        <ThemedText style={styles.modalTitle}>Writing Prompts</ThemedText>
                        {writingPrompts.map(prompt => (
                            <View key={prompt.id} style={styles.promptCard}>
                                <ThemedText style={styles.promptCategory}>{prompt.category}</ThemedText>
                                <ThemedText style={styles.promptText}>{prompt.prompt}</ThemedText>
                                <View style={styles.promptMeta}>
                                    <ThemedText style={styles.promptDifficulty}>{prompt.difficulty}</ThemedText>
                                    <ThemedText style={styles.promptTime}>{prompt.estimatedTime}min</ThemedText>
                                </View>
                            </View>
                        ))}
                        <EnhancedButton
                            label="Close"
                            onPress={() => setShowPrompts(false)}
                            style={styles.closeButton}
                        />
                    </EnhancedCard>
                )}

                {/* New Project Modal */}
                {showNewProject && (
                    <EnhancedCard style={styles.newProjectModal}>
                        <ThemedText style={styles.modalTitle}>Create New Project</ThemedText>
                        <ProjectTypeSelector onSelect={(type, title) => createNewProject(type, title)} />
                        <EnhancedButton
                            label="Cancel"
                            onPress={() => setShowNewProject(false)}
                            style={styles.cancelButton}
                        />
                    </EnhancedCard>
                )}
            </ScrollView>
        </ThemedView>
    );
};

const ProjectTypeSelector: React.FC<{
    onSelect: (type: CreativeProjectType, title: string) => void
}> = ({ onSelect }) => {
    const [selectedType, setSelectedType] = useState<CreativeProjectType>('writing');
    const [title, setTitle] = useState('');

    const projectTypes: { value: CreativeProjectType; label: string }[] = [
        { value: 'writing', label: 'General Writing' },
        { value: 'story', label: 'Short Story' },
        { value: 'novel', label: 'Novel' },
        { value: 'poetry', label: 'Poetry' },
        { value: 'blog_post', label: 'Blog Post' },
        { value: 'article', label: 'Article' },
        { value: 'journal', label: 'Journal Entry' },
        { value: 'art_concept', label: 'Art Concept' },
        { value: 'music_lyrics', label: 'Music Lyrics' },
        { value: 'other', label: 'Other' }
    ];

    return (
        <View style={styles.typeSelector}>
            <EnhancedInput
                placeholder="Project Title"
                value={title}
                onChangeText={setTitle}
                style={styles.titleInput}
            />
            <ScrollView horizontal style={styles.typeScroll}>
                {projectTypes.map(type => (
                    <EnhancedButton
                        key={type.value}
                        label={type.label}
                        onPress={() => setSelectedType(type.value)}
                        style={[
                            styles.typeButton,
                            selectedType === type.value && styles.selectedTypeButton
                        ]}
                    />
                ))}
            </ScrollView>
            <EnhancedButton
                label="Create Project"
                onPress={() => {
                    if (title.trim()) {
                        onSelect(selectedType, title.trim());
                    }
                }}
                style={styles.createButton}
                disabled={!title.trim()}
            />
        </View>
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
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 5,
    },
    currentProject: {
        marginBottom: 20,
        padding: 16,
    },
    projectTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    projectType: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    contentInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        minHeight: 200,
        textAlignVertical: 'top',
        marginBottom: 12,
    },
    wordCount: {
        fontSize: 12,
        color: '#666',
        marginBottom: 12,
    },
    suggestions: {
        marginBottom: 12,
    },
    suggestionsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    suggestion: {
        fontSize: 14,
        marginBottom: 4,
        paddingLeft: 8,
    },
    projectActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    suggestionButton: {
        flex: 1,
        marginRight: 8,
    },
    completeButton: {
        flex: 1,
        marginLeft: 8,
    },
    projectList: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    projectCard: {
        marginBottom: 12,
        padding: 12,
    },
    projectHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    projectStatus: {
        fontSize: 12,
        color: '#666',
    },
    projectWords: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    openButton: {
        alignSelf: 'flex-start',
    },
    promptsModal: {
        position: 'absolute',
        top: 50,
        left: 16,
        right: 16,
        maxHeight: 400,
        zIndex: 1000,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    promptCard: {
        marginBottom: 12,
        padding: 12,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
    },
    promptCategory: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 4,
    },
    promptText: {
        fontSize: 14,
        marginBottom: 8,
    },
    promptMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    promptDifficulty: {
        fontSize: 12,
        color: '#666',
    },
    promptTime: {
        fontSize: 12,
        color: '#666',
    },
    closeButton: {
        marginTop: 12,
    },
    newProjectModal: {
        position: 'absolute',
        top: 100,
        left: 16,
        right: 16,
        zIndex: 1000,
    },
    typeSelector: {
        marginBottom: 12,
    },
    titleInput: {
        marginBottom: 12,
    },
    typeScroll: {
        marginBottom: 12,
    },
    typeButton: {
        marginRight: 8,
        minWidth: 100,
    },
    selectedTypeButton: {
        backgroundColor: '#007AFF',
    },
    createButton: {
        marginTop: 12,
    },
    cancelButton: {
        marginTop: 8,
    },
});

export default CreativeAssistant;
