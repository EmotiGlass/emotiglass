import React from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, StyleProp, ViewStyle } from 'react-native';
import theme from '../../constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const Button: React.FC<ButtonProps> = ({ 
  title, 
  variant = 'primary', 
  style, 
  ...props 
}) => {
  return React.createElement(
    TouchableOpacity,
    {
      style: [styles.button, styles[variant], style],
      ...props
    },
    React.createElement(
      Text,
      {
        style: [styles.text, variant === 'outline' && styles.outlineText]
      },
      title
    )
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  text: {
    color: 'white',
    fontSize: theme.typography.fontSizes.md,
    fontWeight: '500' as const,
  },
  outlineText: {
    color: theme.colors.primary,
  },
}); 