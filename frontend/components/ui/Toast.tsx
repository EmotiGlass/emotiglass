import React, { createContext, useState, useContext, useEffect, useRef, ReactNode } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';
import { ToastContextType, ToastOptions } from '../../types/index';

// Default duration for toast messages
const DEFAULT_DURATION = 3000;

// Create context for toast
const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  hideToast: () => {},
});

// Toast provider component
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastOptions['type']>('info');
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Show toast message
  const showToast = (
    message: string,
    type: ToastOptions['type'] = 'info',
    duration: number = DEFAULT_DURATION
  ) => {
    // Clear any existing timeout
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }

    // Update state
    setMessage(message);
    setType(type);
    setVisible(true);

    // Animate in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Set timeout to hide toast
    const timeout = setTimeout(() => {
      hideToast();
    }, duration);
    setHideTimeout(timeout);
  };

  // Hide toast message
  const hideToast = () => {
    // Animate out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
    });

    // Clear timeout
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [hideTimeout]);

  // Get icon and color based on toast type
  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          color: theme.colors.success,
        };
      case 'error':
        return {
          icon: 'alert-circle' as const,
          color: theme.colors.error,
        };
      case 'warning':
        return {
          icon: 'warning' as const,
          color: theme.colors.warning,
        };
      case 'info':
      default:
        return {
          icon: 'information-circle' as const,
          color: theme.colors.info,
        };
    }
  };

  const { icon, color } = getToastStyles();

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {visible && (
        <SafeAreaView style={styles.container} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.toast,
              { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0]
              }) }] }
            ]}
          >
            <View style={[styles.toastContent, { borderLeftColor: color }]}>
              <Ionicons name={icon} size={24} color={color} style={styles.icon} />
              <Text style={styles.message}>{message}</Text>
              <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
                <Ionicons name="close" size={20} color={theme.colors.textLight} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </SafeAreaView>
      )}
    </ToastContext.Provider>
  );
};

// Custom hook to use toast
export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: theme.zIndices.toast,
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  toast: {
    width: '100%',
    maxWidth: 500,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    borderLeftWidth: 4,
    ...theme.shadows.medium,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  message: {
    flex: 1,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
}); 