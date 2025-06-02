import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  ViewStyle, 
  StyleProp 
} from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { Path as PathType, Point } from '../../types';
import theme from '../../constants/theme';

interface DrawingThumbnailProps {
  drawingData?: string | null; // JSON string of paths
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
}

/**
 * Component to display a thumbnail preview of a drawing
 */
export const DrawingThumbnail: React.FC<DrawingThumbnailProps> = ({
  drawingData,
  width = 80,
  height = 80,
  style,
  backgroundColor = theme.colors.cardBackground,
}) => {
  const [paths, setPaths] = useState<PathType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!drawingData) {
      setLoading(false);
      return;
    }

    try {
      const parsedPaths = JSON.parse(drawingData) as PathType[];
      setPaths(parsedPaths);
    } catch (error) {
      console.error('Failed to parse drawing data:', error);
    } finally {
      setLoading(false);
    }
  }, [drawingData]);

  // Helper function to create a path from points
  const createPath = (points: Point[], strokeWidth: number) => {
    const path = Skia.Path.Make();
    
    if (points.length === 0) return path;
    
    // For a single point, draw a dot
    if (points.length === 1) {
      const p = points[0];
      path.addCircle(p.x, p.y, strokeWidth / 2);
      return path;
    }
    
    // For a normal path
    path.moveTo(points[0].x, points[0].y);
    
    // Use quadratic curves for smoother lines
    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1];
      const p2 = points[i];
      
      // For just two points, use a line
      if (points.length === 2) {
        path.lineTo(p2.x, p2.y);
      } else {
        // For more points, use quadratic curves for smoothing
        const cpX = (p1.x + p2.x) / 2;
        const cpY = (p1.y + p2.y) / 2;
        
        if (i === 1) {
          path.lineTo(cpX, cpY);
        } else {
          path.quadTo(p1.x, p1.y, cpX, cpY);
        }
        
        if (i === points.length - 1) {
          path.lineTo(p2.x, p2.y);
        }
      }
    }
    
    return path;
  };

  // Scale points to fit in the thumbnail
  const scalePaths = (pathsToScale: PathType[]) => {
    if (pathsToScale.length === 0) return [];
    
    // Find bounding box of all points
    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;
    let maxX = Number.MIN_VALUE;
    let maxY = Number.MIN_VALUE;
    
    pathsToScale.forEach(path => {
      path.points.forEach(point => {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      });
    });
    
    // Calculate scale factors and padding
    const padding = 8;
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const scaleX = (width - padding * 2) / Math.max(1, contentWidth);
    const scaleY = (height - padding * 2) / Math.max(1, contentHeight);
    const scale = Math.min(scaleX, scaleY);
    
    // Calculate offset to center the drawing
    const offsetX = (width - contentWidth * scale) / 2 - minX * scale;
    const offsetY = (height - contentHeight * scale) / 2 - minY * scale;
    
    // Create scaled paths
    return pathsToScale.map(path => {
      const scaledPoints = path.points.map(point => ({
        x: point.x * scale + offsetX,
        y: point.y * scale + offsetY
      }));
      
      return {
        ...path,
        points: scaledPoints,
        width: path.width * scale
      };
    });
  };

  const scaledPaths = scalePaths(paths);

  return React.createElement(
    View,
    { 
      style: [
        styles.container, 
        { width, height, backgroundColor },
        style
      ]
    },
    loading 
      ? React.createElement(ActivityIndicator, { size: "small", color: theme.colors.primary })
      : React.createElement(
          Canvas, 
          { style: { width, height } },
          ...scaledPaths.map((path, index) => 
            React.createElement(Path, {
              key: index,
              path: createPath(path.points, path.width),
              color: path.color,
              style: "stroke",
              strokeWidth: path.width,
              strokeCap: "round",
              strokeJoin: "round",
            })
          )
        )
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radii.sm,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
}); 