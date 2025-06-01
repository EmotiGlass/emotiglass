import React from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  Dimensions, 
  TouchableOpacity, 
  ScrollView,
  TextStyle,
  ViewStyle,
  ImageStyle
} from 'react-native';

import { LineChart, BarChart, PieChart, ProgressChart, ContributionGraph } from 'react-native-chart-kit';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, AnimatedStyleProp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../constants/theme';
import { TrendAnalysisResult } from '../../services/trendAnalysis';
import { Card } from './Card';

interface MoodTrendChartsProps {
  trendData: TrendAnalysisResult;
  days: number;
}

export const MoodTrendCharts: React.FC<MoodTrendChartsProps> = ({ 
  trendData, 
  days 
}) => {
  const { width } = Dimensions.get('window');
  const chartWidth = width - theme.spacing.lg * 2;
  
  // Chart types
  const chartTypes = ['line', 'pie', 'bar', 'radar', 'heatmap'] as const;
  type ChartType = typeof chartTypes[number];
  
  // Active chart state
  const [activeChart, setActiveChart] = React.useState<ChartType>('line');
  
  // Animation values for chart switching
  const chartOpacity = useSharedValue(1);
  const chartTranslateY = useSharedValue(0);
  
  // Generate labels for the line chart (last N days)
  const generateDateLabels = () => {
    const labels = [];
    const today = new Date();
    
    // If we have fewer entries than days, adjust the number of labels
    const numLabels = Math.min(days, trendData.moodFactorsTimeline.dates.length);
    
    for (let i = 0; i < numLabels; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (numLabels - 1 - i));
      labels.push(date.getDate().toString());
    }
    
    return labels;
  };
  
  // Prepare emotion frequency data for pie chart
  const prepareEmotionData = () => {
    const emotionColors = {
      joy: '#FFD700',
      contentment: '#4682B4',
      anger: '#B22222',
      sadness: '#4169E1',
      fear: '#556B2F',
      surprise: '#9932CC',
      disgust: '#228B22',
      neutral: '#A9A9A9',
    };
    
    return Object.entries(trendData.emotionFrequency).map(([name, count]) => ({
      name,
      count,
      color: emotionColors[name as keyof typeof emotionColors] || '#A9A9A9',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }));
  };
  
  // Prepare time of day data for bar chart
  const prepareTimeOfDayData = () => {
    return {
      labels: ['Morning', 'Afternoon', 'Evening', 'Night'],
      datasets: [
        {
          data: [
            trendData.inputMethodUsage.sliders || 0,
            trendData.inputMethodUsage.drawing || 0,
            trendData.inputMethodUsage.voice || 0,
            trendData.inputMethodUsage.face || 0,
          ],
        },
      ],
    };
  };
  
  // Prepare radar chart data for emotion parameters
  const prepareRadarData = () => {
    // For ProgressChart, data needs to be between 0-1
    const data = {
      data: [
        trendData.moodFactorsTimeline.energy.length > 0 
          ? trendData.stats.averageEnergy / 100 
          : 0,
        trendData.moodFactorsTimeline.calmness.length > 0 
          ? trendData.stats.averageCalmness / 100 
          : 0,
        trendData.moodFactorsTimeline.tension.length > 0 
          ? trendData.stats.averageTension / 100 
          : 0,
        // Get the latest values for the basic emotions (normalized to 0-1)
        Object.entries(trendData.emotionFrequency).find(([emotion]) => emotion === 'joy')?.[1] || 0,
        Object.entries(trendData.emotionFrequency).find(([emotion]) => emotion === 'sadness')?.[1] || 0,
        Object.entries(trendData.emotionFrequency).find(([emotion]) => emotion === 'anger')?.[1] || 0,
      ]
    };
    
    return data;
  };
  
  // Prepare mood heatmap data
  const prepareMoodHeatmapData = () => {
    // Mock contribution data (in a real app, this would be generated from actual mood entries)
    const mockData = [];
    const today = new Date();
    
    // Generate mock data for the last 3 months
    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Format date as YYYY-MM-DD
      const dateStr = date.toISOString().split('T')[0];
      
      // Generate count based on day of week (higher on weekends)
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const count = isWeekend ? 
        Math.floor(Math.random() * 5) + 1 : 
        Math.floor(Math.random() * 3);
      
      if (count > 0) {
        mockData.push({
          date: dateStr,
          count,
        });
      }
    }
    
    return mockData;
  };
  
  // Change chart type with animation
  const changeChartType = (type: ChartType) => {
    // Animate out
    chartOpacity.value = withTiming(0, { 
      duration: 300,
      easing: Easing.out(Easing.ease)
    });
    
    chartTranslateY.value = withTiming(50, { 
      duration: 300,
      easing: Easing.out(Easing.ease)
    }, () => {
      // Change chart type
      setActiveChart(type);
      
      // Animate in
      chartOpacity.value = withTiming(1, { 
        duration: 300,
        easing: Easing.in(Easing.ease)
      });
      
      chartTranslateY.value = withTiming(0, { 
        duration: 300,
        easing: Easing.in(Easing.ease)
      });
    });
  };
  
  // Animated chart container style
  const animatedChartStyle = useAnimatedStyle(() => {
    return {
      opacity: chartOpacity.value,
      transform: [
        { translateY: chartTranslateY.value }
      ]
    };
  });
  
  // Render current chart based on active type
  const renderCurrentChart = () => {
    switch (activeChart) {
      case 'line':
        return [
          React.createElement(Text, { key: 'title', style: styles.chartTitle as TextStyle }, 'Emotion Parameters Over Time'),
          React.createElement(LineChart as any, {
            key: 'chart',
            data: {
              labels: generateDateLabels(),
              datasets: [
                {
                  data: trendData.moodFactorsTimeline.energy.length > 0 
                    ? trendData.moodFactorsTimeline.energy 
                    : [0],
                  color: () => '#FFD700', // Energy color
                  strokeWidth: 2,
                },
                {
                  data: trendData.moodFactorsTimeline.calmness.length > 0 
                    ? trendData.moodFactorsTimeline.calmness 
                    : [0],
                  color: () => '#4682B4', // Calmness color
                  strokeWidth: 2,
                },
                {
                  data: trendData.moodFactorsTimeline.tension.length > 0 
                    ? trendData.moodFactorsTimeline.tension 
                    : [0],
                  color: () => '#B22222', // Tension color
                  strokeWidth: 2,
                },
              ],
              legend: ['Energy', 'Calmness', 'Tension'],
            },
            width: chartWidth,
            height: 220,
            chartConfig: {
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '1',
                stroke: '#fafafa',
              },
            },
            style: styles.chart,
            bezier: true
          })
        ];
        
      case 'pie':
        return [
          React.createElement(Text, { key: 'title', style: styles.chartTitle as TextStyle }, 'Emotion Distribution'),
          React.createElement(PieChart as any, {
            key: 'chart',
            data: prepareEmotionData(),
            width: chartWidth,
            height: 220,
            chartConfig: {
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            },
            accessor: "count",
            backgroundColor: "transparent",
            paddingLeft: "15",
            absolute: true
          })
        ];
        
      case 'bar':
        return [
          React.createElement(Text, { key: 'title', style: styles.chartTitle as TextStyle }, 'Input Method Distribution'),
          React.createElement(BarChart as any, {
            key: 'chart',
            data: prepareTimeOfDayData(),
            width: chartWidth,
            height: 220,
            yAxisLabel: "",
            yAxisSuffix: "",
            chartConfig: {
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            },
            style: styles.chart
          })
        ];
        
      case 'radar':
        return [
          React.createElement(Text, { key: 'title', style: styles.chartTitle as TextStyle }, 'Current Emotional Profile'),
          React.createElement(ProgressChart as any, {
            key: 'chart',
            data: prepareRadarData(),
            width: chartWidth,
            height: 220,
            chartConfig: {
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            },
            style: styles.chart,
            strokeWidth: 5,
            radius: 32,
            hideLegend: false
          })
        ];
        
      case 'heatmap':
        return [
          React.createElement(Text, { key: 'title', style: styles.chartTitle as TextStyle }, 'Mood Activity Calendar'),
          React.createElement(ContributionGraph as any, {
            key: 'chart',
            values: prepareMoodHeatmapData(),
            endDate: new Date(),
            numDays: 90,
            width: chartWidth,
            height: 220,
            chartConfig: {
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            },
            style: styles.chart,
            tooltipDataAttrs: (value: any) => ({
              fill: 'rgba(0, 0, 0, 0.7)',
              fontSize: 10,
              fontWeight: 'bold',
            })
          })
        ];
        
      default:
        return null;
    }
  };
  
  return React.createElement(
    View, 
    { style: styles.container },
    [
      React.createElement(Text, { key: 'title', style: styles.title as TextStyle }, 'Your Mood Trends'),
      
      // Chart type selector
      React.createElement(
        ScrollView,
        {
          key: 'chart-selector',
          horizontal: true,
          showsHorizontalScrollIndicator: false,
          contentContainerStyle: styles.chartTypesContainer
        },
        chartTypes.map((type) => 
          React.createElement(
            TouchableOpacity,
            {
              key: type,
              style: [
                styles.chartTypeButton,
                activeChart === type && styles.activeChartTypeButton
              ],
              onPress: () => changeChartType(type)
            },
            [
              React.createElement(
                Ionicons as any,
                {
                  key: 'icon',
                  name: type === 'line' ? 'analytics' :
                        type === 'pie' ? 'pie-chart' :
                        type === 'bar' ? 'stats-chart' :
                        type === 'radar' ? 'radio' : 'calendar',
                  size: 20,
                  color: activeChart === type ? '#fff' : theme.colors.text
                }
              ),
              React.createElement(
                Text,
                {
                  key: 'text',
                  style: [
                    styles.chartTypeText,
                    activeChart === type && styles.activeChartTypeText
                  ]
                },
                type.charAt(0).toUpperCase() + type.slice(1)
              )
            ]
          )
        )
      ),
      
      // Current chart
      React.createElement(
        Animated.View as any,
        {
          key: 'chart-container',
          style: [styles.chartContainer, animatedChartStyle]
        },
        renderCurrentChart()
      ),
      
      // Insights
      React.createElement(
        View,
        { key: 'insights', style: styles.insightsContainer },
        [
          React.createElement(Text, { key: 'insights-title', style: styles.sectionTitle as TextStyle }, 'Insights'),
          React.createElement(
            View,
            {
              key: 'insight-item',
              style: [
                styles.insightItem,
                {
                  backgroundColor: 
                    trendData.weeklySummary.changePercentage > 0 
                      ? 'rgba(46, 204, 113, 0.1)' 
                      : trendData.weeklySummary.changePercentage < 0 
                        ? 'rgba(231, 76, 60, 0.1)' 
                        : 'rgba(52, 152, 219, 0.1)'
                }
              ]
            },
            [
              React.createElement(
                Ionicons as any,
                {
                  key: 'insight-icon',
                  name: trendData.weeklySummary.changePercentage > 0 ? 'trending-up' :
                        trendData.weeklySummary.changePercentage < 0 ? 'trending-down' : 'information-circle',
                  size: 20,
                  color: trendData.weeklySummary.changePercentage > 0 ? '#2ecc71' :
                         trendData.weeklySummary.changePercentage < 0 ? '#e74c3c' : '#3498db',
                  style: styles.insightIcon
                }
              ),
              React.createElement(
                Text,
                { key: 'insight-text', style: styles.insightText },
                `This week's dominant emotion is ${trendData.weeklySummary.thisWeek.dominantEmotion} with ${trendData.weeklySummary.thisWeek.entriesCount} entries`
              )
            ]
          )
        ]
      )
    ]
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold as '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  chartTypesContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  chartTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 16,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeChartTypeButton: {
    backgroundColor: theme.colors.primary,
  },
  chartTypeText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.sm,
    marginLeft: theme.spacing.xs,
  },
  activeChartTypeText: {
    color: '#fff',
  },
  chartContainer: {
    marginBottom: theme.spacing.xl,
    backgroundColor: '#fff',
    padding: theme.spacing.md,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium as '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold as '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  chart: {
    marginVertical: theme.spacing.md,
    borderRadius: 8,
  },
  insightsContainer: {
    marginBottom: theme.spacing.xl,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: 8,
    marginBottom: theme.spacing.sm,
  },
  insightIcon: {
    marginRight: theme.spacing.sm,
  },
  insightText: {
    flex: 1,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
  },
}); 

export default MoodTrendCharts; 