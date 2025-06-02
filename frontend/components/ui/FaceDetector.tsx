import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform
} from 'react-native';
import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';

// Define FaceDetectionResult interface since it's not exported from expo-camera
interface FaceDetectionResult {
  faces: Array<{
    smilingProbability?: number;
    leftEyeOpenProbability?: number;
    rightEyeOpenProbability?: number;
    bounds?: {
      origin: {
        x: number;
        y: number;
      };
      size: {
        width: number;
        height: number;
      };
    };
  }>;
}

// Interface for face detection data
export interface FaceDetectionData {
  smilingProbability: number;
  leftEyeOpenProbability: number;
  rightEyeOpenProbability: number;
  headEulerAngleX: number; // Head tilt (pitch)
  headEulerAngleY: number; // Head rotation (yaw)
  headEulerAngleZ: number; // Head roll
}

interface FaceDetectorProps {
  onFaceDetected: (faceData: FaceDetectionData | null) => void;
  showPreview?: boolean;
}

const FaceDetectorComponent: React.FC<FaceDetectorProps> = ({ 
  onFaceDetected, 
  showPreview = true 
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [detectedFace, setDetectedFace] = useState<FaceDetectionData | null>(null);
  const cameraRef = useRef(null);

  // Request camera and face detection permissions
  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'web') {
        console.warn('Face detection not fully supported on web');
        onFaceDetected(null);
        return;
      }

      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (error) {
        console.error('Error requesting camera permissions:', error);
        setHasPermission(false);
      }
    };

    requestPermissions();
  }, []);

  // Handle face detection
  const handleFacesDetected = (result: FaceDetectionResult) => {
    try {
      if (result.faces && result.faces.length > 0) {
        const face = result.faces[0] as any; // Use type assertion to bypass strict type checking

        // Safely extract face features with default values
        const faceData: FaceDetectionData = {
          smilingProbability: face.smilingProbability ?? 0,
          leftEyeOpenProbability: face.leftEyeOpenProbability ?? 0,
          rightEyeOpenProbability: face.rightEyeOpenProbability ?? 0,
          headEulerAngleX: 0, // Not directly available in expo-face-detector
          headEulerAngleY: 0, // Not directly available in expo-face-detector
          headEulerAngleZ: 0  // Not directly available in expo-face-detector
        };

        setDetectedFace(faceData);
        onFaceDetected(faceData);
      } else {
        setDetectedFace(null);
        onFaceDetected(null);
      }
    } catch (error) {
      console.error('Error processing face detection:', error);
      setDetectedFace(null);
      onFaceDetected(null);
    }
  };

  // Web fallback
  const webFallback = () => {
    const dummyFaceData: FaceDetectionData = {
      smilingProbability: 0.5,
      leftEyeOpenProbability: 0.8,
      rightEyeOpenProbability: 0.8,
      headEulerAngleX: 0,
      headEulerAngleY: 0,
      headEulerAngleZ: 0
    };
    onFaceDetected(dummyFaceData);
  };

  // Render component
  if (Platform.OS === 'web') {
    return React.createElement(
      View, 
      { style: styles.container },
      React.createElement(
        Text, 
        { style: styles.warningText },
        'Face Detection Not Fully Supported on Web'
      ),
      React.createElement(
        View, 
        { style: styles.buttonContainer },
        React.createElement(
          TouchableOpacity, 
          { 
            style: styles.fallbackButton,
            onPress: webFallback 
          },
          React.createElement(
            Text,
            { style: styles.buttonText },
            'Use Dummy Face Data'
          )
        )
      )
    );
  }

  // Mobile-specific rendering
  if (hasPermission === null) {
    return React.createElement(
      View, 
      { style: styles.container },
      React.createElement(
        Text, 
        { style: styles.warningText },
        'Requesting Camera Permission...'
      )
    );
  }

  if (hasPermission === false) {
    return React.createElement(
      View, 
      { style: styles.container },
      React.createElement(
        Text, 
        { style: styles.warningText },
        'No access to camera'
      )
    );
  }

  return React.createElement(
    View, 
    { style: styles.container },
    showPreview && React.createElement(
      Camera,
      {
        style: styles.camera,
        type: "front",
        ref: cameraRef,
        onFacesDetected: handleFacesDetected,
        faceDetectorSettings: {
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
          runClassifications: FaceDetector.FaceDetectorClassifications.all,
        }
      }
    ),
    detectedFace && React.createElement(
      View, 
      { style: styles.faceDataContainer },
      React.createElement(
        Text, 
        { style: styles.faceDataText },
        `Smile: ${(detectedFace.smilingProbability * 100).toFixed(2)}%`
      ),
      React.createElement(
        Text, 
        { style: styles.faceDataText },
        `Left Eye Open: ${(detectedFace.leftEyeOpenProbability * 100).toFixed(2)}%`
      ),
      React.createElement(
        Text, 
        { style: styles.faceDataText },
        `Right Eye Open: ${(detectedFace.rightEyeOpenProbability * 100).toFixed(2)}%`
      )
    )
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  camera: {
    width: Dimensions.get('window').width * 0.9,
    height: Dimensions.get('window').height * 0.6,
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
  },
  warningText: {
    color: theme.colors.textLight,
    fontSize: theme.typography.fontSizes.md,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  buttonContainer: {
    marginTop: theme.spacing.md,
  },
  fallbackButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
  },
  buttonText: {
    color: theme.colors.cardBackground,
    textAlign: 'center',
  },
  faceDataContainer: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.radii.md,
    ...theme.shadows.light,
  },
  faceDataText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.sm,
    marginBottom: theme.spacing.xs,
  },
});

export default FaceDetectorComponent; 