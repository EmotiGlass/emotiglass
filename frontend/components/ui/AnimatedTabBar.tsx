import React from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  Dimensions,
  ViewStyle,
  StyleProp
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  interpolateColor,
  AnimatedStyleProp
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';

interface TabItem {
  key: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface AnimatedTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (tabKey: string) => void;
  style?: StyleProp<ViewStyle>;
}

const { width } = Dimensions.get('window');

export const AnimatedTabBar: React.FC<AnimatedTabBarProps> = ({
  tabs,
  activeTab,
  onTabPress,
  style
}) => {
  // Calculate tab width based on number of tabs
  const tabWidth = width / tabs.length;
  
  // Shared value for the active tab index
  const activeIndex = useSharedValue(tabs.findIndex(tab => tab.key === activeTab) || 0);
  
  // Update active index when activeTab changes
  React.useEffect(() => {
    const newIndex = tabs.findIndex(tab => tab.key === activeTab);
    if (newIndex !== -1) {
      activeIndex.value = withTiming(newIndex, { duration: 300 });
    }
  }, [activeTab, tabs, activeIndex]);
  
  // Animated style for the indicator
  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withSpring(activeIndex.value * tabWidth) }],
      width: tabWidth,
    } as AnimatedStyleProp<ViewStyle>;
  });
  
  return React.createElement(
    View, 
    { style: [styles.container, style] },
    React.createElement(
      View, 
      { style: styles.blurContainer },
      [
        // Animated indicator
        React.createElement(
          Animated.View, 
          { key: 'indicator', style: [styles.indicator, indicatorStyle] }
        ),
        
        // Tab items
        React.createElement(
          View, 
          { key: 'tabs-container', style: styles.tabsContainer },
          tabs.map((tab, index) => {
            const isActive = tab.key === activeTab;
            
            return React.createElement(
              TouchableOpacity,
              {
                key: tab.key,
                style: [styles.tabItem, { width: tabWidth }],
                onPress: () => onTabPress(tab.key),
                activeOpacity: 0.7
              },
              [
                React.createElement(
                  Ionicons,
                  {
                    key: 'icon',
                    name: tab.icon,
                    size: 24,
                    color: isActive ? theme.colors.primary : theme.colors.textLight
                  }
                ),
                React.createElement(
                  Text,
                  {
                    key: 'text',
                    style: [
                      styles.tabText,
                      { color: isActive ? theme.colors.primary : theme.colors.textLight }
                    ]
                  },
                  tab.title
                )
              ]
            );
          })
        )
      ]
    )
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    paddingBottom: 20, // For safe area
    backgroundColor: 'transparent',
  },
  blurContainer: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    borderTopLeftRadius: theme.radii.lg,
    borderTopRightRadius: theme.radii.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Simulating blur with semi-transparent white
  },
  indicator: {
    position: 'absolute',
    height: 4,
    backgroundColor: theme.colors.primary,
    top: 0,
    borderRadius: theme.radii.full,
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
  },
  tabText: {
    fontSize: theme.typography.fontSizes.xs,
    marginTop: theme.spacing.xs,
    fontWeight: '500',
  },
});

export default AnimatedTabBar; 