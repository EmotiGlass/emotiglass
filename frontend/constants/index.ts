export * from './theme';

export const APP_NAME = 'EmotiGlass';
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.emotiglass.com' 
  : 'http://localhost:3000'; // Use local server for development 