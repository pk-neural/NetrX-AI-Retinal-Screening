/**
 * NetrX API Service
 * 
 * Handles all communication with the FastAPI backend.
 */

// If using vite proxy, this can just be '/api'
const BASE_URL = '/api';

/**
 * Check backend health status
 */
export async function getHealth() {
  try {
    const response = await fetch(`${BASE_URL}/health`);
    if (!response.ok) throw new Error('Health check failed');
    return await response.json();
  } catch (error) {
    console.error('API Health Check Error:', error);
    return { status: 'error', message: error.message };
  }
}

/**
 * Run only the YOLO domain check
 * @param {File} file - The uploaded image file
 */
export async function analyzeDomain(file) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${BASE_URL}/domain-check`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Domain check failed');
    }

    return data;
  } catch (error) {
    console.error('API Domain Check Error:', error);
    throw error;
  }
}

/**
 * Run the full NetrX AI analysis pipeline
 * @param {File} file - The uploaded image file
 */
export async function analyzeImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${BASE_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Analysis failed');
    }

    return data;
  } catch (error) {
    console.error('API Analysis Error:', error);
    throw error;
  }
}
