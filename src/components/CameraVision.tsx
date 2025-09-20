import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  Modal,
  ScrollView,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { Camera, CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { VisionService, VisionAnalysis } from './services/VisionService';
import { useMemoryStore } from '../store/memory';
import { usePersonaStore } from '../store/persona';
import { useThemeStore } from '../store/theme';

const { width, height } = Dimensions.get('window');

interface CameraVisionProps {
  onClose?: () => void;
  initialMode?: 'camera' | 'analysis';
  embedded?: boolean;
}

export default function CameraVision({ 
  onClose, 
  initialMode = 'camera',
  embedded = false 
}: CameraVisionProps) {
  // Camera and permissions
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [showAnalysis, setShowAnalysis] = useState(initialMode === 'analysis');
  
  // Services and state
  const [visionService] = useState(() => new VisionService());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<VisionAnalysis | null>(null);
  const [quickMode, setQuickMode] = useState(true);
  
  // Stores
  const { addEpisodic } = useMemoryStore();
  const { emotion } = usePersonaStore();
  const { currentTheme } = useThemeStore();
  
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    // Start with fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (isAnalyzing) {
      // Start pulse animation during analysis
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      
      return () => pulseAnimation.stop();
    }
  }, [isAnalyzing]);

  const handleCaptureAndAnalyze = async () => {
    if (!cameraRef.current || !permission?.granted) {
      Alert.alert('Camera Error', 'Camera permissions not granted or camera not ready');
      return;
    }

    try {
      setIsAnalyzing(true);
      
      // Haptic feedback
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Capture photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: true,
      });

      if (!photo) {
        throw new Error('Failed to capture photo');
      }

      // Analyze with VisionService
      const analysis = await visionService.analyzeImage(photo.uri);
      
      if (analysis) {
        setLastAnalysis(analysis);
        setShowAnalysis(true);

        // Save to memory
        addEpisodic({
          content: `Analyzed image: ${analysis.description}`,
          importance: 0.7,
          tags: ['vision', 'camera', 'analysis'],
          emotion: emotion,
          confidence: analysis.confidence,
          context: {
            scene: analysis.scene,
            objects: analysis.objects.length,
            faces: analysis.faces.length,
          },
        });

        // Success haptic
        if (Platform.OS !== 'web') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error('Camera vision error:', error);
      Alert.alert(
        'Analysis Failed', 
        'I had trouble seeing that clearly. Could you try again?'
      );
      
      // Error haptic
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuickDescribe = async () => {
    if (!lastAnalysis) {
      await handleCaptureAndAnalyze();
      return;
    }

    Alert.alert(
      'Quick Look',
      lastAnalysis.description,
      [
        { text: 'More Details', onPress: () => setShowAnalysis(true) },
        { text: 'OK', style: 'cancel' },
      ]
    );
  };

  const toggleCamera = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const renderPermissionView = () => (
    <View style={styles.permissionContainer}>
      <LinearGradient
        colors={(currentTheme.gradients.sallie || ['#E6E6FA', '#9370DB', '#4B0082']) as readonly [string, string, ...string[]]}
        style={styles.permissionGradient}
      >
        <Ionicons name="camera-outline" size={64} color="white" />
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionText}>
          Sallie needs camera access to see and understand your world. 
          This enables visual analysis and contextual assistance.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  const renderCameraView = () => (
    <View style={styles.cameraContainer}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        animateShutter={false}
      >
        {/* Header */}
        <View style={styles.cameraHeader}>
          {onClose && (
            <TouchableOpacity style={styles.headerButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          )}
          
          <Text style={styles.headerTitle}>Sallie Vision</Text>
          
          <TouchableOpacity style={styles.headerButton} onPress={toggleCamera}>
            <Ionicons name="camera-reverse" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Center Overlay */}
        <View style={styles.cameraOverlay}>
          <View style={styles.viewfinderContainer}>
            <View style={styles.viewfinder}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            
            {isAnalyzing && (
              <View style={styles.analyzingOverlay}>
                <Animated.View style={[styles.analyzingIndicator, { transform: [{ scale: pulseAnim }] }]}>
                  <Ionicons name="eye" size={32} color="white" />
                </Animated.View>
                <Text style={styles.analyzingText}>Analyzing...</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bottom Controls */}
        <View style={styles.cameraControls}>
          <TouchableOpacity
            style={styles.analysisButton}
            onPress={() => lastAnalysis && setShowAnalysis(true)}
            disabled={!lastAnalysis}
          >
            <Ionicons 
              name="document-text" 
              size={24} 
              color={lastAnalysis ? "white" : "rgba(255,255,255,0.5)"} 
            />
          </TouchableOpacity>

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[styles.captureButton, isAnalyzing && styles.captureButtonAnalyzing]}
              onPress={handleCaptureAndAnalyze}
              disabled={isAnalyzing}
            >
              <LinearGradient
                colors={(isAnalyzing ? ['#666', '#444'] : (currentTheme.gradients.sallie || ['#E6E6FA', '#9370DB', '#4B0082'])) as readonly [string, string, ...string[]]}
                style={styles.captureButtonGradient}
              >
                <Ionicons 
                  name={isAnalyzing ? "eye" : "camera"} 
                  size={32} 
                  color="white" 
                />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={styles.quickButton}
            onPress={handleQuickDescribe}
          >
            <Ionicons name="flash" size={24} color="white" />
            <Text style={styles.quickButtonText}>Quick</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );

  const renderAnalysisModal = () => (
    <Modal
      visible={showAnalysis}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.analysisContainer}>
        <LinearGradient
          colors={(currentTheme.gradients.sallie || ['#E6E6FA', '#9370DB', '#4B0082']) as readonly [string, string, ...string[]]}
          style={styles.analysisHeader}
        >
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowAnalysis(false)}
          >
            <Ionicons name="chevron-down" size={24} color="white" />
          </TouchableOpacity>
          
          <Text style={styles.analysisTitle}>Visual Analysis</Text>
          
          <TouchableOpacity
            style={styles.modalActionButton}
            onPress={handleCaptureAndAnalyze}
            disabled={isAnalyzing}
          >
            <Ionicons name="refresh" size={20} color="white" />
          </TouchableOpacity>
        </LinearGradient>

        {lastAnalysis && (
          <ScrollView style={styles.analysisContent} showsVerticalScrollIndicator={false}>
            {/* Main Description */}
            <View style={styles.analysisSection}>
              <Text style={styles.sectionTitle}>What I See</Text>
              <Text style={styles.descriptionText}>{lastAnalysis.description}</Text>
            </View>

            {/* Scene Analysis */}
            <View style={styles.analysisSection}>
              <Text style={styles.sectionTitle}>Scene Details</Text>
              <View style={styles.sceneGrid}>
                <View style={styles.sceneItem}>
                  <Text style={styles.sceneLabel}>Setting</Text>
                  <Text style={styles.sceneValue}>{lastAnalysis.scene.setting}</Text>
                </View>
                <View style={styles.sceneItem}>
                  <Text style={styles.sceneLabel}>Mood</Text>
                  <Text style={styles.sceneValue}>{lastAnalysis.scene.mood}</Text>
                </View>
                <View style={styles.sceneItem}>
                  <Text style={styles.sceneLabel}>Lighting</Text>
                  <Text style={styles.sceneValue}>{lastAnalysis.scene.lighting}</Text>
                </View>
                <View style={styles.sceneItem}>
                  <Text style={styles.sceneLabel}>Activity</Text>
                  <Text style={styles.sceneValue}>{lastAnalysis.scene.activity}</Text>
                </View>
              </View>
            </View>

            {/* Objects */}
            {lastAnalysis.objects.length > 0 && (
              <View style={styles.analysisSection}>
                <Text style={styles.sectionTitle}>Objects Detected</Text>
                <View style={styles.objectsContainer}>
                  {lastAnalysis.objects.slice(0, 8).map((obj, index) => (
                    <View key={index} style={styles.objectChip}>
                      <Text style={styles.objectName}>{obj.name}</Text>
                      <Text style={styles.objectConfidence}>
                        {Math.round(obj.confidence * 100)}%
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Faces & Emotions */}
            {lastAnalysis.faces.length > 0 && (
              <View style={styles.analysisSection}>
                <Text style={styles.sectionTitle}>Faces & Emotions</Text>
                {lastAnalysis.faces.map((face, index) => (
                  <View key={index} style={styles.faceContainer}>
                    <Text style={styles.faceTitle}>Person {index + 1}</Text>
                    <View style={styles.emotionsContainer}>
                      {face.emotions.map((emotion, emotionIndex) => (
                        <Text key={emotionIndex} style={styles.emotionText}>
                          {emotion.emotion} ({Math.round(emotion.confidence * 100)}%)
                        </Text>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Insights */}
            {lastAnalysis.contextualInsights.length > 0 && (
              <View style={styles.analysisSection}>
                <Text style={styles.sectionTitle}>Insights</Text>
                {lastAnalysis.contextualInsights.map((insight, index) => (
                  <View key={index} style={styles.insightItem}>
                    <Ionicons name="bulb" size={16} color={currentTheme.colors.primary} />
                    <Text style={styles.insightText}>{insight}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Accessibility */}
            <View style={styles.analysisSection}>
              <Text style={styles.sectionTitle}>Accessibility Description</Text>
              <Text style={styles.accessibilityText}>
                {lastAnalysis.accessibility.detailedDescription}
              </Text>
            </View>

            {/* Confidence */}
            <View style={styles.analysisSection}>
              <Text style={styles.sectionTitle}>Analysis Confidence</Text>
              <View style={styles.confidenceContainer}>
                <View style={styles.confidenceBar}>
                  <View 
                    style={[
                      styles.confidenceFill, 
                      { width: `${lastAnalysis.confidence * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.confidenceText}>
                  {Math.round(lastAnalysis.confidence * 100)}%
                </Text>
              </View>
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return renderPermissionView();
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {renderCameraView()}
      {renderAnalysisModal()}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
  },
  permissionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewfinderContainer: {
    position: 'relative',
  },
  viewfinder: {
    width: width * 0.7,
    height: width * 0.7,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: 'white',
    borderWidth: 2,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  analyzingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingIndicator: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  analyzingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  analysisButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'white',
    padding: 4,
  },
  captureButtonAnalyzing: {
    borderColor: 'rgba(255,255,255,0.5)',
  },
  captureButtonGradient: {
    flex: 1,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
  },
  quickButtonText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  analysisContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 15,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analysisTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  analysisContent: {
    flex: 1,
    padding: 20,
  },
  analysisSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  sceneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sceneItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  sceneLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sceneValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  objectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  objectChip: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  objectName: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  objectConfidence: {
    fontSize: 12,
    color: '#1976d2',
    opacity: 0.7,
  },
  faceContainer: {
    marginBottom: 12,
  },
  faceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  emotionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emotionText: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  accessibilityText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  confidenceBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    minWidth: 40,
  },
});