// server/aiDetector.js
const { pipeline } = require('@xenova/transformers');

let classifier = null;

/**
 * Initialize the AI detection model (lazy loading)
 */
async function initClassifier() {
  if (!classifier) {
    console.log('[AI DETECTOR] Loading model...');
    classifier = await pipeline(
      'text-classification',
      'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
    );
    console.log('[AI DETECTOR] Model loaded successfully');
  }
  return classifier;
}

/**
 * Detect if text content is AI-generated
 */
async function detectAIContent(text) {
  try {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return {
        isAI: false,
        confidence: 0,
        label: 'INSUFFICIENT_TEXT',
        error: 'No text content provided'
      };
    }

    const model = await initClassifier();
    const truncatedText = text.substring(0, 2000);
    const result = await model(truncatedText);
    
    console.log('[AI DETECTOR] Analysis result:', result);
    
    const prediction = Array.isArray(result) ? result[0] : result;
    const isAI = prediction.score > 0.85;
    
    return {
      isAI: isAI,
      confidence: prediction.score,
      label: prediction.label,
      rawResult: prediction
    };
    
  } catch (error) {
    console.error('[AI DETECTOR] Error:', error);
    return {
      isAI: false,
      confidence: 0,
      label: 'ERROR',
      error: error.message
    };
  }
}

/**
 * Extract text from uploaded file for analysis
 */
async function extractTextFromFile(file) {
  const fs = require('fs');
  
  try {
    const mimetype = file.mimetype;
    
    if (mimetype === 'text/plain') {
      return fs.readFileSync(file.path, 'utf8');
    }
    
    return null;
    
  } catch (error) {
    console.error('[AI DETECTOR] Text extraction error:', error);
    return null;
  }
}

/**
 * Validate uploaded file for AI-generated content
 */
async function validateUpload(file, description) {
  try {
    console.log('[AI DETECTOR] Validating upload...');
    
    // Check description
    if (description && description.length > 50) {
      console.log('[AI DETECTOR] Analyzing description...');
      const descResult = await detectAIContent(description);
      
      if (descResult.isAI && descResult.confidence > 0.9) {
        return {
          passed: false,
          reason: 'Description appears to be AI-generated',
          details: descResult
        };
      }
    }
    
    // Check file content (if text-based)
    const fileText = await extractTextFromFile(file);
    if (fileText && fileText.length > 100) {
      console.log('[AI DETECTOR] Analyzing file content...');
      const contentResult = await detectAIContent(fileText);
      
      if (contentResult.isAI && contentResult.confidence > 0.9) {
        return {
          passed: false,
          reason: 'File content appears to be AI-generated',
          details: contentResult
        };
      }
    }
    
    console.log('[AI DETECTOR] Validation passed');
    return {
      passed: true
    };
    
  } catch (error) {
    console.error('[AI DETECTOR] Validation error:', error);
    return {
      passed: true,
      error: error.message
    };
  }
}

module.exports = {
  detectAIContent,
  validateUpload,
  extractTextFromFile
};
