import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Toast notification component for user feedback
 */
export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onDismiss,
  style,
}) => {
  const [isVisible, setIsVisible] = useState(visible);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Icons and colors based on toast type
  const toastConfig: Record<ToastType, { icon: string; color: string }> = {
    success: { icon: 'checkmark-circle', color: theme.colors.success },
    error: { icon: 'alert-circle', color: theme.colors.error },
    info: { icon: 'information-circle', color: theme.colors.info },
    warning: { icon: 'warning', color: theme.colors.warning },
  };

  const { icon, color } = toastConfig[type];

  // Show or hide toast when visibility changes
  useEffect(() => {
    if (visible && !isVisible) {
      setIsVisible(true);

      // Set timeout to hide toast
      if (duration > 0) {
        timeoutRef.current = setTimeout(() => {
          hideToast();
        }, duration);
      }
    } else if (!visible && isVisible) {
      hideToast();
    }

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible, isVisible, duration]);

  // Hide toast with animation
  const hideToast = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  // If not visible, don't render anything
  if (!isVisible) {
    return null;
  }

  return React.createElement(
    'View',
    { 
      style: [
        styles.container,
        { borderLeftColor: color },
        style,
      ]
    },
    [
      React.createElement(
        'View',
        { key: 'content', style: styles.content },
        [
          React.createElement(
            'Ionicons',
            { 
              key: 'icon', 
              name: icon, 
              size: 24, 
              color: color, 
              style: styles.icon 
            }
          ),
          React.createElement(
            'Text',
            { key: 'message', style: styles.message },
            message
          )
        ]
      ),
      React.createElement(
        'TouchableOpacity',
        { 
          key: 'closeButton', 
          style: styles.closeButton, 
          onPress: hideToast 
        },
        React.createElement(
          'Ionicons',
          { 
            name: "close", 
            size: 20, 
            color: theme.colors.textLight 
          }
        )
      )
    ]
  );
};

// Create a provider and hook for managing toast messages
type ToastContextType = {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: () => void;
};

export const ToastContext = React.createContext<ToastContextType>({
  showToast: () => {},
  hideToast: () => {},
});

/**
 * Provider component for managing toast messages throughout the app
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toastConfig, setToastConfig] = useState({
    visible: false,
    message: '',
    type: 'info' as ToastType,
    duration: 3000,
  });

  const showToast = (message: string, type: ToastType = 'info', duration: number = 3000) => {
    setToastConfig({
      visible: true,
      message,
      type,
      duration,
    });
  };

  const hideToast = () => {
    setToastConfig(prev => ({ ...prev, visible: false }));
  };

  return React.createElement(
    ToastContext.Provider,
    { value: { showToast, hideToast } },
    [
      children,
      React.createElement(
        Toast,
        {
          key: 'toast',
          visible: toastConfig.visible,
          message: toastConfig.message,
          type: toastConfig.type,
          duration: toastConfig.duration,
          onDismiss: hideToast,
          style: styles.toastPosition
        }
      )
    ]
  );
};

/**
 * Hook for using toast functionality in any component
 */
export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.radii.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderLeftWidth: 4,
    ...theme.shadows.medium,
    minWidth: 200,
    maxWidth: '90%',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  message: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text,
    flex: 1,
  },
  closeButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  toastPosition: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    alignSelf: 'center',
    zIndex: 9999,
  },
}); 