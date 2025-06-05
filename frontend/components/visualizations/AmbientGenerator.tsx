import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated, 
  Easing, 
  Dimensions,
  TouchableOpacity,
  Text
} from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { EmotionData } from '../../types';
import theme from '../../constants/theme';
import { generateCombinedAmbient, updateAmbientVisuals } from '../../services/ambientGenerator';

interface AmbientGeneratorProps {
  emotionData: EmotionData;
  isPlaying?: boolean;
  onTogglePlay?: (isPlaying: boolean) => void;
  style?: any;
}

interface Particle {
  id: string;
  x: Animated.Value;
  y: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
  color: string;
  speed: number;
  size: number;
}

interface AmbientVisualParams {
  backgroundColors: string[];
  particleCount: number;
  particleColors: string[];
  particleSize: number;
  particleSpeed: number;
  movementPattern: 'flowing' | 'pulsing' | 'expanding' | 'contracting' | 'random';
}

export const AmbientGenerator: React.FC<AmbientGeneratorProps> = ({
  emotionData,
  isPlaying = true,
  onTogglePlay,
  style
}) => {
  // State
  const [particles, setParticles] = useState<Particle[]>([]);
  const [backgroundColors, setBackgroundColors] = useState<string[]>(['#000000', '#111111']);
  const [dominantEmotion, setDominantEmotion] = useState<string>('neutral');
  const [soundLoaded, setSoundLoaded] = useState(false);
  const [visualParams, setVisualParams] = useState<AmbientVisualParams | null>(null);
  
  // Refs
  const soundRef = useRef<Audio.Sound | null>(null);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const { width, height } = Dimensions.get('window');
  
  // Generate ambient visuals and sounds based on emotion data
  useEffect(() => {
    if (!emotionData) return;
    
    // Generate combined ambient parameters
    const loadAmbient = async () => {
      try {
        const ambientParams = await generateCombinedAmbient(emotionData);
        
        // Update state with visual parameters
        setVisualParams(ambientParams.visual);
        setBackgroundColors(ambientParams.visual.backgroundColors);
        setDominantEmotion(ambientParams.visual.movementPattern === 'expanding' ? 'joy' : 
                          ambientParams.visual.movementPattern === 'flowing' ? 'contentment' : 
                          ambientParams.visual.movementPattern === 'pulsing' ? 'anger' : 
                          ambientParams.visual.movementPattern === 'contracting' ? 'fear' : 
                          ambientParams.visual.movementPattern === 'random' ? 'surprise' : 'neutral');
        
        // Generate particles based on visual parameters
        generateParticles(
          ambientParams.visual.particleCount,
          ambientParams.visual.particleColors,
          ambientParams.visual.particleSize,
          ambientParams.visual.particleSpeed
        );
        
        // Load ambient sound
        await loadAmbientSound(ambientParams.audio.uri, ambientParams.audio.volume);
      } catch (error) {
        console.error('Error loading ambient parameters:', error);
      }
    };
    
    loadAmbient();
    
    // Clean up on unmount or when emotion data changes
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [emotionData]);
  
  // Handle play/pause
  useEffect(() => {
    if (soundRef.current && soundLoaded) {
      if (isPlaying) {
        soundRef.current.playAsync();
        startParticleAnimation();
      } else {
        soundRef.current.pauseAsync();
        if (animationRef.current) {
          animationRef.current.stop();
        }
      }
    }
  }, [isPlaying, soundLoaded]);
  
  // Load ambient sound
  const loadAmbientSound = async (soundUri: string, volume: number = 0.7) => {
    try {
      // Unload previous sound if exists
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      
      // For development, use a placeholder sound if URI is not accessible
      // In production, this would be a real sound file
      const soundSource = { uri: soundUri };
      
      // Load the sound
      const { sound } = await Audio.Sound.createAsync(
        soundSource,
        { isLooping: true, volume },
        onSoundStatusUpdate
      );
      
      soundRef.current = sound;
      setSoundLoaded(true);
      
      // Play if isPlaying is true
      if (isPlaying) {
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Error loading ambient sound:', error);
      // Fallback to a default sound in case of error
      console.log('Using fallback sound');
    }
  };
  
  // Sound status update callback
  const onSoundStatusUpdate = (status: Audio.PlaybackStatus) => {
    if (!status.isLoaded) return;
    // You can add additional sound control logic here
  };
  
  // Generate particles based on emotion
  const generateParticles = (
    count: number, 
    colors: string[], 
    size: number,
    speed: number
  ) => {
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < count; i++) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const randomSize = size * (0.5 + Math.random());
      const randomSpeed = speed * (0.8 + Math.random() * 0.4);
      
      newParticles.push({
        id: `particle-${i}-${Date.now()}`,
        x: new Animated.Value(Math.random() * width),
        y: new Animated.Value(Math.random() * height),
        scale: new Animated.Value(0),
        opacity: new Animated.Value(0),
        color: randomColor,
        speed: randomSpeed,
        size: randomSize
      });
    }
    
    setParticles(newParticles);
  };
  
  // Animate particles
  const startParticleAnimation = () => {
    if (particles.length === 0 || !visualParams) return;
    
    const animations: Animated.CompositeAnimation[] = [];
    const movementPattern = visualParams.movementPattern;
    
    particles.forEach(particle => {
      // Different animation based on movement pattern
      let destX, destY, duration;
      
      switch (movementPattern) {
        case 'flowing':
          // Gentle horizontal flow
          destX = (particle.x as any)._value > width/2 ? -50 : width + 50;
          destY = (particle.y as any)._value + (Math.random() - 0.5) * 100;
          duration = 10000 / particle.speed;
          break;
          
        case 'pulsing':
          // Pulsating from center
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * 200 + 100;
          destX = width/2 + Math.cos(angle) * distance;
          destY = height/2 + Math.sin(angle) * distance;
          duration = 3000 / particle.speed;
          break;
          
        case 'expanding':
          // Expanding from center
          const centerX = width/2;
          const centerY = height/2;
          const currentX = (particle.x as any)._value;
          const currentY = (particle.y as any)._value;
          const dx = currentX - centerX;
          const dy = currentY - centerY;
          const factor = 2;
          destX = centerX + dx * factor;
          destY = centerY + dy * factor;
          duration = 7000 / particle.speed;
          break;
          
        case 'contracting':
          // Contracting to center
          destX = width/2 + (Math.random() - 0.5) * 100;
          destY = height/2 + (Math.random() - 0.5) * 100;
          duration = 8000 / particle.speed;
          break;
          
        case 'random':
        default:
          // Random movement
          destX = Math.random() * width;
          destY = Math.random() * height;
          duration = 5000 / particle.speed;
      }
      
      // Fade in and scale up
      const fadeIn = Animated.timing(particle.opacity, {
        toValue: 0.7,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.ease
      });
      
      const scaleUp = Animated.timing(particle.scale, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.ease
      });
      
      // Move to destination
      const moveX = Animated.timing(particle.x, {
        toValue: destX,
        duration,
        useNativeDriver: true,
        easing: Easing.linear
      });
      
      const moveY = Animated.timing(particle.y, {
        toValue: destY,
        duration,
        useNativeDriver: true,
        easing: Easing.linear
      });
      
      // Fade out and scale down
      const fadeOut = Animated.timing(particle.opacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.ease,
        delay: duration - 1000
      });
      
      const scaleDown = Animated.timing(particle.scale, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.ease,
        delay: duration - 1000
      });
      
      // Combine animations
      const particleAnimation = Animated.parallel([
        Animated.sequence([fadeIn, fadeOut]),
        Animated.sequence([scaleUp, scaleDown]),
        moveX,
        moveY
      ]);
      
      animations.push(particleAnimation);
    });
    
    // Run all particle animations in parallel
    animationRef.current = Animated.stagger(100, animations);
    animationRef.current.start(() => {
      // When animations complete, generate new particles
      if (isPlaying && visualParams) {
        generateParticles(
          visualParams.particleCount, 
          visualParams.particleColors,
          visualParams.particleSize,
          visualParams.particleSpeed
        );
      }
    });
  };
  
  // Toggle play/pause
  const handleTogglePlay = () => {
    if (onTogglePlay) {
      onTogglePlay(!isPlaying);
    }
  };
  
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={backgroundColors}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Particles */}
        {particles.map(particle => (
          <Animated.View
            key={particle.id}
            style={[
              styles.particle,
              {
                backgroundColor: particle.color,
                width: particle.size,
                height: particle.size,
                borderRadius: particle.size / 2,
                transform: [
                  { translateX: particle.x },
                  { translateY: particle.y },
                  { scale: particle.scale }
                ],
                opacity: particle.opacity
              }
            ]}
          />
        ))}
        
        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={handleTogglePlay}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
          
          <View style={styles.emotionIndicator}>
            <Text style={styles.emotionText}>
              {dominantEmotion.charAt(0).toUpperCase() + dominantEmotion.slice(1)}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#fff',
  },
  controls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emotionIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  emotionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  }
}); 