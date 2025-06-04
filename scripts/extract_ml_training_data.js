#!/usr/bin/env node

/**
 * ML Training Data Extractor
 * 
 * This script extracts drawing data from the app's ML data directory and
 * converts it into formats suitable for machine learning model training.
 * 
 * Usage:
 *   node extract_ml_training_data.js [options]
 * 
 * Options:
 *   --format=<format>   Output format (json, csv, tfjs) [default: json]
 *   --output=<path>     Output directory [default: ./ml-training-data]
 *   --filter=<emotion>  Filter by emotion label
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Constants
const ML_DATA_DIR = process.env.ML_DATA_DIR || '../frontend/ml_data/';
const DEFAULT_OUTPUT_DIR = './ml-training-data';
const LOG_PATTERN = /\[ML_TRAINING_DATA\] (.*)/;

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  format: 'json',
  output: DEFAULT_OUTPUT_DIR,
  filter: null
};

args.forEach(arg => {
  if (arg.startsWith('--format=')) {
    options.format = arg.split('=')[1];
  } else if (arg.startsWith('--output=')) {
    options.output = arg.split('=')[1];
  } else if (arg.startsWith('--filter=')) {
    options.filter = arg.split('=')[1];
  }
});

// Ensure output directory exists
if (!fs.existsSync(options.output)) {
  fs.mkdirSync(options.output, { recursive: true });
}

/**
 * Extract ML data from log files or ML data directory
 */
async function extractMLData() {
  console.log('Extracting ML training data...');
  
  let mlDataFiles = [];
  
  // Check if ML_DATA_DIR exists
  if (fs.existsSync(ML_DATA_DIR)) {
    console.log(`Reading ML data from directory: ${ML_DATA_DIR}`);
    
    // Read all JSON files in the ML data directory
    const files = fs.readdirSync(ML_DATA_DIR);
    mlDataFiles = files
      .filter(file => file.startsWith('ml_data_') && file.endsWith('.json'))
      .map(file => path.join(ML_DATA_DIR, file));
      
    console.log(`Found ${mlDataFiles.length} ML data files`);
  } else {
    console.log(`ML data directory not found: ${ML_DATA_DIR}`);
    console.log('Searching for ML data in log files...');
    
    // If ML data directory doesn't exist, try to extract from log files
    mlDataFiles = await extractFromLogs();
  }
  
  if (mlDataFiles.length === 0) {
    console.log('No ML data files found');
    return;
  }
  
  // Process each ML data file
  const allData = [];
  
  for (const file of mlDataFiles) {
    try {
      const rawData = fs.readFileSync(file, 'utf8');
      const data = JSON.parse(rawData);
      
      // Apply filter if specified
      if (options.filter && 
          (!data.metadata.userInput || 
           !data.metadata.userInput.emotion || 
           data.metadata.userInput.emotion !== options.filter)) {
        continue;
      }
      
      allData.push(data);
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
    }
  }
  
  console.log(`Processed ${allData.length} ML data entries`);
  
  // Save data in the specified format
  saveData(allData);
}

/**
 * Extract ML data from log files
 */
async function extractFromLogs() {
  const logDir = '../logs';
  const mlDataFiles = [];
  
  if (!fs.existsSync(logDir)) {
    console.log('Log directory not found');
    return mlDataFiles;
  }
  
  const logFiles = fs.readdirSync(logDir)
    .filter(file => file.endsWith('.log'))
    .map(file => path.join(logDir, file));
    
  console.log(`Found ${logFiles.length} log files`);
  
  // Process each log file
  for (const logFile of logFiles) {
    const fileStream = fs.createReadStream(logFile);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    
    for await (const line of rl) {
      const match = line.match(LOG_PATTERN);
      if (match) {
        try {
          const data = JSON.parse(match[1]);
          
          // Save to a temporary file
          const tempFile = path.join(options.output, `extracted_${Date.now()}_${Math.floor(Math.random() * 10000)}.json`);
          fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
          
          mlDataFiles.push(tempFile);
        } catch (error) {
          console.error('Error parsing ML data from log:', error);
        }
      }
    }
  }
  
  return mlDataFiles;
}

/**
 * Save data in the specified format
 */
function saveData(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  switch (options.format.toLowerCase()) {
    case 'json':
      saveAsJson(data, timestamp);
      break;
    case 'csv':
      saveAsCsv(data, timestamp);
      break;
    case 'tfjs':
      saveAsTfjs(data, timestamp);
      break;
    default:
      console.error(`Unsupported format: ${options.format}`);
      saveAsJson(data, timestamp);
  }
}

/**
 * Save data as JSON
 */
function saveAsJson(data, timestamp) {
  const outputFile = path.join(options.output, `ml_training_data_${timestamp}.json`);
  
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
  
  console.log(`Saved JSON data to: ${outputFile}`);
}

/**
 * Save data as CSV
 */
function saveAsCsv(data, timestamp) {
  const outputFile = path.join(options.output, `ml_training_data_${timestamp}.csv`);
  
  // Extract features for CSV format
  const rows = data.map(item => {
    const metadata = item.metadata;
    const metrics = metadata.metrics;
    
    // Basic features
    const features = {
      id: item.id,
      timestamp: item.timestamp,
      totalPoints: metadata.totalPoints,
      totalPaths: metadata.totalPaths,
      drawingDuration: metadata.drawingDuration,
      pointsPerSecond: metadata.pointsPerSecond,
      avgStrokeWidth: metadata.avgStrokeWidth,
      canvasWidth: metadata.canvasWidth,
      canvasHeight: metadata.canvasHeight,
      boundingBoxWidth: metadata.boundingBox.width,
      boundingBoxHeight: metadata.boundingBox.height,
      totalLength: metrics.totalLength,
      avgStrokeLength: metrics.avgStrokeLength,
      directionChanges: metrics.directionChanges,
      curvature: metrics.curvature,
      pressure: metrics.pressure,
      avgSpeed: metrics.speed.reduce((sum, val) => sum + val, 0) / metrics.speed.length,
      maxSpeed: Math.max(...metrics.speed),
      minSpeed: Math.min(...metrics.speed),
      avgAcceleration: metrics.acceleration.reduce((sum, val) => sum + val, 0) / metrics.acceleration.length,
      platform: metadata.deviceInfo.platform,
    };
    
    // Add user input if available
    if (metadata.userInput) {
      features.emotion = metadata.userInput.emotion || '';
      features.intensity = metadata.userInput.intensity || 0;
      features.label = metadata.userInput.label || '';
    }
    
    return features;
  });
  
  // Create CSV header and rows
  const header = Object.keys(rows[0]).join(',');
  const csvRows = rows.map(row => Object.values(row).map(value => {
    // Wrap strings in quotes
    if (typeof value === 'string') {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }).join(','));
  
  // Write CSV file
  fs.writeFileSync(outputFile, [header, ...csvRows].join('\n'));
  
  console.log(`Saved CSV data to: ${outputFile}`);
}

/**
 * Save data in TensorFlow.js format
 */
function saveAsTfjs(data, timestamp) {
  const outputDir = path.join(options.output, `tfjs_data_${timestamp}`);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Create a metadata.json file for TensorFlow.js
  const metadata = {
    datasetName: 'EmotiGlass Drawing Dataset',
    description: 'Drawing data for emotion recognition',
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    totalSamples: data.length,
    features: [
      { name: 'paths', type: 'array' },
      { name: 'totalPoints', type: 'number' },
      { name: 'totalPaths', type: 'number' },
      { name: 'drawingDuration', type: 'number' },
      { name: 'totalLength', type: 'number' },
      { name: 'directionChanges', type: 'number' },
      { name: 'curvature', type: 'number' },
      { name: 'pressure', type: 'number' },
      { name: 'speed', type: 'array' },
      { name: 'acceleration', type: 'array' }
    ],
    labels: Array.from(new Set(
      data
        .filter(item => item.metadata.userInput && item.metadata.userInput.emotion)
        .map(item => item.metadata.userInput.emotion)
    ))
  };
  
  fs.writeFileSync(path.join(outputDir, 'metadata.json'), JSON.stringify(metadata, null, 2));
  
  // Create data files
  data.forEach((item, index) => {
    const sampleDir = path.join(outputDir, `sample_${index}`);
    fs.mkdirSync(sampleDir, { recursive: true });
    
    // Save features
    fs.writeFileSync(
      path.join(sampleDir, 'features.json'),
      JSON.stringify({
        paths: item.paths,
        metadata: item.metadata
      }, null, 2)
    );
    
    // Save label if available
    if (item.metadata.userInput && item.metadata.userInput.emotion) {
      fs.writeFileSync(
        path.join(sampleDir, 'label.txt'),
        item.metadata.userInput.emotion
      );
    }
  });
  
  console.log(`Saved TensorFlow.js data to: ${outputDir}`);
}

// Run the extraction process
extractMLData().catch(error => {
  console.error('Error extracting ML data:', error);
  process.exit(1);
}); 