import * as FileSystem from 'expo-file-system';
import { Path, Point } from '../types';
import { 
  APP_DIRECTORY, 
  createDirectoryIfNeeded, 
  safeWriteToFile 
} from '../utils/fileSystemUtils';

// Define ML data directory
export const ML_DATA_DIR = `${APP_DIRECTORY}ml_data/`;

// Interface for ML training data
export interface DrawingMLData {
  id: string;
  timestamp: number;
  paths: Path[];
  metadata: {
    totalPoints: number;
    totalPaths: number;
    drawingDuration: number; // in milliseconds
    pointsPerSecond: number;
    avgStrokeWidth: number;
    colors: string[];
    canvasWidth: number;
    canvasHeight: number;
    boundingBox: {
      minX: number;
      minY: number;
      maxX: number;
      maxY: number;
      width: number;
      height: number;
    };
    metrics: {
      totalLength: number;
      avgStrokeLength: number;
      directionChanges: number;
      curvature: number;
      pressure: number; // estimated from stroke width
      speed: number[]; // array of point-to-point speeds
      acceleration: number[]; // changes in speed
      pauseDurations: number[]; // time between strokes in ms
    };
    deviceInfo: {
      platform: string;
      screenWidth: number;
      screenHeight: number;
    };
    userInput?: {
      emotion?: string;
      intensity?: number;
      label?: string;
    };
  }
}

/**
 * Initialize ML data storage
 * @returns Whether initialization was successful
 */
export const initMLDataStorage = async (): Promise<boolean> => {
  console.log('[drawingMLLogger] Initializing ML data storage...');
  try {
    // Create ML data directory if it doesn't exist
    const dirCreated = await createDirectoryIfNeeded(ML_DATA_DIR);
    
    if (dirCreated) {
      console.log('[drawingMLLogger] ML data storage initialized successfully');
    } else {
      console.error('[drawingMLLogger] Failed to initialize ML data storage');
    }
    
    return dirCreated;
  } catch (error) {
    console.error('[drawingMLLogger] Failed to initialize ML data storage:', error);
    return false;
  }
};

/**
 * Calculate distance between two points
 */
const calculateDistance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

/**
 * Calculate angle between three points
 */
const calculateAngle = (p1: Point, p2: Point, p3: Point): number => {
  const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
  return Math.abs(angle2 - angle1);
};

/**
 * Process drawing data to extract ML-relevant features
 * @param drawingData JSON string of drawing paths
 * @param startTime Drawing start timestamp
 * @param endTime Drawing end timestamp
 * @param canvasWidth Width of the canvas
 * @param canvasHeight Height of the canvas
 * @param userLabel Optional user-provided label for the drawing
 * @returns Processed ML data
 */
export const processDrawingForML = (
  drawingData: string,
  startTime: number,
  endTime: number,
  canvasWidth: number,
  canvasHeight: number,
  userLabel?: { emotion?: string; intensity?: number; label?: string }
): DrawingMLData => {
  // Parse drawing data
  const paths = JSON.parse(drawingData) as Path[];
  
  // Calculate drawing duration
  const drawingDuration = endTime - startTime;
  
  // Count total points
  const totalPoints = paths.reduce((sum, path) => sum + path.points.length, 0);
  
  // Calculate points per second
  const pointsPerSecond = totalPoints / (drawingDuration / 1000);
  
  // Get unique colors
  const colors = Array.from(new Set(paths.map(path => path.color)));
  
  // Calculate average stroke width
  const avgStrokeWidth = paths.reduce((sum, path) => sum + path.width, 0) / paths.length;
  
  // Calculate bounding box
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  
  paths.forEach(path => {
    path.points.forEach(point => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });
  });
  
  // Calculate advanced metrics
  let totalLength = 0;
  let directionChanges = 0;
  let totalCurvature = 0;
  const speeds: number[] = [];
  const accelerations: number[] = [];
  const pauseDurations: number[] = [];
  
  // Process each path
  paths.forEach((path, pathIndex) => {
    let pathLength = 0;
    
    // Calculate path metrics
    for (let i = 1; i < path.points.length; i++) {
      const p1 = path.points[i - 1];
      const p2 = path.points[i];
      
      // Distance between points
      const segmentLength = calculateDistance(p1, p2);
      pathLength += segmentLength;
      
      // Calculate speed (if timestamps were available, we'd use those)
      // Here we estimate based on average drawing duration per point
      const pointDuration = drawingDuration / totalPoints;
      const speed = segmentLength / (pointDuration / 1000);
      speeds.push(speed);
      
      // Calculate acceleration
      if (speeds.length > 1) {
        const acceleration = speeds[speeds.length - 1] - speeds[speeds.length - 2];
        accelerations.push(acceleration);
      }
      
      // Detect direction changes
      if (i > 1) {
        const p0 = path.points[i - 2];
        const angle = calculateAngle(p0, p1, p2);
        
        // If angle difference is significant, count as direction change
        if (angle > 0.3) { // ~17 degrees
          directionChanges++;
          totalCurvature += angle;
        }
      }
    }
    
    totalLength += pathLength;
    
    // Calculate pause between strokes (if not the first path)
    if (pathIndex > 0) {
      // Estimate pause duration based on drawing duration and number of paths
      // In a real implementation, we'd use actual timestamps
      const avgPauseDuration = drawingDuration / (paths.length - 1);
      pauseDurations.push(avgPauseDuration);
    }
  });
  
  // Calculate average path length
  const avgStrokeLength = totalLength / paths.length;
  
  // Create ML data object
  const mlData: DrawingMLData = {
    id: `drawing_${Date.now()}`,
    timestamp: startTime,
    paths,
    metadata: {
      totalPoints,
      totalPaths: paths.length,
      drawingDuration,
      pointsPerSecond,
      avgStrokeWidth,
      colors,
      canvasWidth,
      canvasHeight,
      boundingBox: {
        minX,
        minY,
        maxX,
        maxY,
        width: maxX - minX,
        height: maxY - minY
      },
      metrics: {
        totalLength,
        avgStrokeLength,
        directionChanges,
        curvature: totalCurvature / paths.length,
        pressure: avgStrokeWidth, // Estimated from stroke width
        speed: speeds,
        acceleration: accelerations,
        pauseDurations
      },
      deviceInfo: {
        platform: Platform.OS,
        screenWidth: Dimensions.get('window').width,
        screenHeight: Dimensions.get('window').height
      },
      userInput: userLabel
    }
  };
  
  return mlData;
};

/**
 * Save ML data to file system
 * @param mlData Processed ML data
 * @returns URI of saved ML data file
 */
export const saveMLData = async (mlData: DrawingMLData): Promise<string | null> => {
  console.log('[drawingMLLogger] Saving ML data...');
  
  try {
    // Generate unique filename based on timestamp
    const timestamp = Date.now();
    const fileName = `ml_data_${timestamp}.json`;
    const fileUri = ML_DATA_DIR + fileName;
    
    console.log(`[drawingMLLogger] Writing ML data to: ${fileUri}`);
    
    // Write ML data to file
    const writeSuccess = await safeWriteToFile(fileUri, JSON.stringify(mlData, null, 2));
    
    if (!writeSuccess) {
      console.error(`[drawingMLLogger] Failed to write ML data to: ${fileUri}`);
      return null;
    }
    
    console.log(`[drawingMLLogger] ML data saved to: ${fileUri}`);
    return fileUri;
  } catch (error) {
    console.error('[drawingMLLogger] Failed to save ML data:', error);
    return null;
  }
};

/**
 * Log drawing data for ML training
 * @param drawingData JSON string of drawing paths
 * @param startTime Drawing start timestamp
 * @param endTime Drawing end timestamp
 * @param canvasWidth Width of the canvas
 * @param canvasHeight Height of the canvas
 * @param userLabel Optional user-provided label for the drawing
 * @returns URI of saved ML data file
 */
export const logDrawingForML = async (
  drawingData: string,
  startTime: number,
  endTime: number,
  canvasWidth: number,
  canvasHeight: number,
  userLabel?: { emotion?: string; intensity?: number; label?: string }
): Promise<string | null> => {
  try {
    // Initialize ML data storage
    await initMLDataStorage();
    
    // Process drawing data for ML
    const mlData = processDrawingForML(
      drawingData,
      startTime,
      endTime,
      canvasWidth,
      canvasHeight,
      userLabel
    );
    
    // Log ML data to console for debugging/training
    console.log('[ML_TRAINING_DATA]', JSON.stringify(mlData));
    
    // Save ML data to file
    const fileUri = await saveMLData(mlData);
    
    return fileUri;
  } catch (error) {
    console.error('[drawingMLLogger] Failed to log drawing for ML:', error);
    return null;
  }
};

// Export a function to get all ML data files
export const getAllMLDataFiles = async (): Promise<string[]> => {
  try {
    // Ensure directory exists
    const dirCreated = await createDirectoryIfNeeded(ML_DATA_DIR);
    if (!dirCreated) {
      console.error('[drawingMLLogger] Failed to ensure ML data directory exists');
      return [];
    }
    
    // Get all files in ML data directory
    const files = await FileSystem.readDirectoryAsync(ML_DATA_DIR);
    console.log(`[drawingMLLogger] Found ${files.length} ML data files`);
    
    // Filter for ML data files
    const mlDataFiles = files.filter(file => file.startsWith('ml_data_') && file.endsWith('.json'));
    
    // Convert to full URIs
    const mlDataUris = mlDataFiles.map(file => ML_DATA_DIR + file);
    
    return mlDataUris;
  } catch (error) {
    console.error('[drawingMLLogger] Failed to get ML data files:', error);
    return [];
  }
};

import { Platform, Dimensions } from 'react-native'; 