import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { VisionService, VisionAnalysis } from './services/VisionService';

interface VisionDemoProps {
  onClose?: () => void;
}

export default function VisionDemo({ onClose }: VisionDemoProps) {
  const [visionService] = useState(() => new VisionService());
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<VisionAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleTakePhoto = async () => {
    try {
      setIsAnalyzing(true);
      const result = await visionService.analyzeCurrentView();
      
      if (result) {
        setAnalysis(result);
        setCurrentImage(result.timestamp.toString()); // Using timestamp as placeholder
        Alert.alert('Success', 'Photo analyzed successfully!');
      } else {
        Alert.alert('Error', 'Failed to capture and analyze photo');
      }
    } catch (error) {
      console.error('Vision demo error:', error);
      Alert.alert('Error', 'Failed to analyze photo');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuickLook = async () => {
    try {
      if (!currentImage) {
        Alert.alert('No Image', 'Please take a photo first');
        return;
      }
      
      setIsAnalyzing(true);
      const description = await visionService.quickLook(currentImage);
      Alert.alert('Quick Description', description);
    } catch (error) {
      console.error('Quick look error:', error);
      Alert.alert('Error', 'Failed to get quick description');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeFromGallery = async () => {
    try {
      setIsAnalyzing(true);
      const result = await visionService.analyzeFromGallery();
      
      if (result) {
        setAnalysis(result);
        Alert.alert('Success', 'Gallery image analyzed successfully!');
      } else {
        Alert.alert('Cancelled', 'No image selected from gallery');
      }
    } catch (error) {
      console.error('Gallery analysis error:', error);
      Alert.alert('Error', 'Failed to analyze gallery image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const testVisionService = async () => {
    try {
      const isWorking = await visionService.testVisionService();
      Alert.alert(
        'Vision Service Test',
        isWorking ? 'Vision service is working correctly!' : 'Vision service has issues'
      );
    } catch (error) {
      Alert.alert('Test Failed', 'Unable to test vision service');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sallie Vision Demo</Text>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isAnalyzing && styles.buttonDisabled]}
          onPress={handleTakePhoto}
          disabled={isAnalyzing}
        >
          <Text style={styles.buttonText}>
            {isAnalyzing ? 'Analyzing...' : '📷 Take Photo & Analyze'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, isAnalyzing && styles.buttonDisabled]}
          onPress={handleAnalyzeFromGallery}
          disabled={isAnalyzing}
        >
          <Text style={styles.buttonText}>🖼️ Analyze from Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, (!currentImage || isAnalyzing) && styles.buttonDisabled]}
          onPress={handleQuickLook}
          disabled={!currentImage || isAnalyzing}
        >
          <Text style={styles.buttonText}>👁️ Quick Look</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.testButton]}
          onPress={testVisionService}
        >
          <Text style={styles.buttonText}>🔧 Test Vision Service</Text>
        </TouchableOpacity>
      </View>

      {analysis && (
        <View style={styles.analysisContainer}>
          <Text style={styles.analysisTitle}>Analysis Results</Text>
          
          <View style={styles.analysisSection}>
            <Text style={styles.sectionTitle}>Description:</Text>
            <Text style={styles.analysisText}>{analysis.description}</Text>
          </View>

          <View style={styles.analysisSection}>
            <Text style={styles.sectionTitle}>Scene Information:</Text>
            <Text style={styles.analysisText}>
              Setting: {analysis.scene.setting}{'\n'}
              Mood: {analysis.scene.mood}{'\n'}
              Lighting: {analysis.scene.lighting}{'\n'}
              Activity: {analysis.scene.activity}
            </Text>
          </View>

          {analysis.objects.length > 0 && (
            <View style={styles.analysisSection}>
              <Text style={styles.sectionTitle}>Objects Detected:</Text>
              {analysis.objects.map((obj, index) => (
                <Text key={index} style={styles.analysisText}>
                  • {obj.name} ({Math.round(obj.confidence * 100)}% confidence)
                </Text>
              ))}
            </View>
          )}

          {analysis.faces.length > 0 && (
            <View style={styles.analysisSection}>
              <Text style={styles.sectionTitle}>Faces & Emotions:</Text>
              {analysis.faces.map((face, index) => (
                <Text key={index} style={styles.analysisText}>
                  Face {index + 1}: {face.emotions.map(e => `${e.emotion} (${Math.round(e.confidence * 100)}%)`).join(', ')}
                </Text>
              ))}
            </View>
          )}

          {analysis.contextualInsights.length > 0 && (
            <View style={styles.analysisSection}>
              <Text style={styles.sectionTitle}>Insights:</Text>
              {analysis.contextualInsights.map((insight, index) => (
                <Text key={index} style={styles.analysisText}>• {insight}</Text>
              ))}
            </View>
          )}

          <View style={styles.analysisSection}>
            <Text style={styles.sectionTitle}>Accessibility Description:</Text>
            <Text style={styles.analysisText}>{analysis.accessibility.detailedDescription}</Text>
          </View>

          <View style={styles.analysisSection}>
            <Text style={styles.sectionTitle}>Analysis Confidence:</Text>
            <Text style={styles.analysisText}>{Math.round(analysis.confidence * 100)}%</Text>
          </View>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.infoText}>
          This demo showcases Sallie's AI vision capabilities. The service integrates with your camera
          and uses advanced AI to understand and describe what it sees, including objects, emotions, 
          and contextual information.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  testButton: {
    backgroundColor: '#FF9500',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  analysisContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  analysisSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 5,
  },
  analysisText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  info: {
    backgroundColor: '#e8f4fd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    textAlign: 'center',
  },
});