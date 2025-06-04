# ML Data Logging for Drawing Analysis

This document explains how the ML data logging system works for the drawing feature in EmotiGlass.

## Overview

The ML data logging system captures detailed information about user drawings to enable machine learning model training for emotion recognition from drawings. The system logs various metrics and features that can be used to train models to recognize emotional patterns in drawing behavior.

## Data Structure

Each drawing session generates an ML data object with the following structure:

```typescript
interface DrawingMLData {
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
```

## Features Captured

The system captures the following features that are relevant for ML training:

1. **Path Data**:
   - Complete path information including points, colors, and stroke widths
   - Total number of paths and points

2. **Temporal Features**:
   - Drawing duration
   - Points per second
   - Pause durations between strokes
   - Speed and acceleration

3. **Spatial Features**:
   - Bounding box dimensions
   - Total path length
   - Direction changes
   - Curvature

4. **Style Features**:
   - Stroke width
   - Color usage
   - Pressure (estimated from stroke width)

5. **Context Information**:
   - Device type and screen dimensions
   - Canvas dimensions
   - Timestamp

6. **User Labels** (if provided):
   - Emotion category
   - Emotion intensity
   - Custom label

## How It Works

1. When a user draws on the `DrawingCanvas`, the component tracks:
   - When drawing starts
   - Each point in the drawing
   - When drawing ends

2. Upon drawing completion, the `logDrawingForML` function is called with:
   - The drawing data (JSON string of paths)
   - Start and end timestamps
   - Canvas dimensions
   - Any user-provided labels

3. The function processes the drawing data to extract ML-relevant features

4. The processed data is:
   - Logged to the console with the prefix `[ML_TRAINING_DATA]`
   - Saved to the file system in the `ml_data` directory

## Data Extraction

To extract and process the logged ML data for training, use the `extract_ml_training_data.js` script in the `scripts` directory:

```bash
node scripts/extract_ml_training_data.js [options]
```

Options:
- `--format=<format>`: Output format (json, csv, tfjs) [default: json]
- `--output=<path>`: Output directory [default: ./ml-training-data]
- `--filter=<emotion>`: Filter by emotion label

The script can extract data from:
- The `ml_data` directory
- Log files containing the `[ML_TRAINING_DATA]` prefix

## Using the Data for Training

The extracted data can be used to train various types of machine learning models:

1. **Emotion Recognition Models**:
   - Classify drawings into emotion categories
   - Predict emotion intensity from drawing features

2. **Drawing Style Analysis**:
   - Identify personal drawing styles
   - Detect changes in drawing behavior over time

3. **Temporal Pattern Recognition**:
   - Analyze speed and rhythm patterns
   - Identify hesitation or confidence markers

## Enabling/Disabling ML Logging

ML data logging can be enabled or disabled by setting the `enableMLLogging` prop on the `DrawingCanvas` component:

```jsx
<DrawingCanvas
  enableMLLogging={true}
  userLabel={{ emotion: 'joy', intensity: 0.8 }}
/>
```

## Privacy Considerations

The ML data logging system captures detailed information about user drawing behavior. Consider the following privacy measures:

1. Inform users that their drawing data may be used for ML training
2. Provide an option to opt out of data collection
3. Ensure data is stored securely and anonymized when appropriate
4. Follow applicable data protection regulations

## Extending the System

To extend the ML data logging system:

1. Add new metrics to the `processDrawingForML` function in `drawingMLLogger.ts`
2. Update the `DrawingMLData` interface to include new fields
3. Modify the extraction script to handle the new data fields 