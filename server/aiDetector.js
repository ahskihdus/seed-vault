// server/aiDetector.js - PROPER AI DETECTION
const { pipeline } = require('@xenova/transformers');

let classifier = null;

/**
 * Initialize the AI detection model (lazy loading)
 * Uses RoBERTa model specifically trained to detect GPT-2 generated text
 */
async function initClassifier() {
  if (!classifier) {
    console.log('[AI DETECTOR] Loading AI detection model...');
    console.log('[AI DETECTOR] This may take 10-30 seconds on first load...');
    
    // Using proper GPT detection model
    classifier = await pipeline(
      'text-classification',
      'Xenova/roberta-base-openai-detector'
    );
    
    console.log('[AI DETECTOR] Model loaded successfully');
  }
  return classifier;
}

/**
 * Detect if text content is AI-generated
 * @param {string} text - Text content to analyze
 * @returns {Promise<{isAI: boolean, confidence: number, label: string}>}
 */
async function detectAIContent(text) {
  try {
    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return {
        isAI: false,
        confidence: 0,
        label: 'INSUFFICIENT_TEXT',
        error: 'No text content provided'
      };
    }

    // Initialize classifier
    const model = await initClassifier();
    
    // Truncate text if too long (model limit ~512 tokens)
    const truncatedText = text.substring(0, 2000);
    
    // Run detection
    const result = await model(truncatedText);
    
    console.log('[AI DETECTOR] Analysis result:', result);
    
    // Parse result
    // RoBERTa OpenAI detector returns:
    // - label: "Real" or "Fake" (Fake = AI-generated)
    // - score: confidence (0-1)
    
    let isAI = false;
    let confidence = 0;
    let label = 'UNKNOWN';
    
    if (Array.isArray(result) && result.length > 0) {
      // Get the prediction with highest score
      const predictions = result.sort((a, b) => b.score - a.score);
      const topPrediction = predictions[0];
      
      label = topPrediction.label;
      confidence = topPrediction.score;
      
      // Check if labeled as Fake/AI-generated
      isAI = (label.toLowerCase() === 'fake' || 
              label.toLowerCase().includes('ai') || 
              label.toLowerCase().includes('generated'));
              
      console.log('[AI DETECTOR] Detection:', {
        label: label,
        confidence: (confidence * 100).toFixed(1) + '%',
        isAI: isAI
      });
    }
    
    return {
      isAI: isAI,
      confidence: confidence,
      label: label,
      rawResult: result
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
 * @param {Object} file - Multer file object
 * @returns {Promise<string|null>}
 */
async function extractTextFromFile(file) {
  const fs = require('fs');
  
  try {
    const mimetype = file.mimetype;
    
    // Handle text files
    if (mimetype === 'text/plain') {
      return fs.readFileSync(file.path, 'utf8');
    }
    
    // Handle PDF files
    if (mimetype === 'application/pdf') {
      try {
        const pdfParse = require('pdf-parse');
        const dataBuffer = fs.readFileSync(file.path);
        const data = await pdfParse(dataBuffer);
        
        console.log(`[AI DETECTOR] Extracted ${data.text.length} characters from PDF`);
        return data.text;
      } catch (pdfError) {
        console.error('[AI DETECTOR] PDF parsing error:', pdfError.message);
        console.log('[AI DETECTOR] Install pdf-parse: npm install pdf-parse');
        return null;
      }
    }
    
    // Cannot extract text from images, audio, video
    return null;
    
  } catch (error) {
    console.error('[AI DETECTOR] Text extraction error:', error);
    return null;
  }
}

/**
 * Validate uploaded file for AI-generated content
 * @param {Object} file - Multer file object
 * @param {string} description - User-provided description
 * @returns {Promise<{passed: boolean, reason?: string, details?: Object}>}
 */
async function validateUpload(file, description) {
  try {
    console.log('[AI DETECTOR] Validating upload...');
    
    // Check 1: Analyze description
    if (description && description.length > 50) {
      console.log('[AI DETECTOR] Analyzing description...');
      const descResult = await detectAIContent(description);
      
      // Reject if AI-generated with high confidence
      if (descResult.isAI && descResult.confidence > 0.7) {
        console.log(`[AI DETECTOR] ❌ REJECTED - Description flagged as AI (${(descResult.confidence * 100).toFixed(1)}% confidence)`);
        return {
          passed: false,
          reason: 'Description appears to be AI-generated',
          details: {
            confidence: (descResult.confidence * 100).toFixed(1) + '%',
            classification: descResult.label
          }
        };
      } else {
        console.log(`[AI DETECTOR] ✅ Description appears human-written (${descResult.label}, ${(descResult.confidence * 100).toFixed(1)}%)`);
      }
    }
    
    // Check 2: Analyze file content (if text-based)
    const fileText = await extractTextFromFile(file);
    if (fileText && fileText.length > 100) {
      console.log('[AI DETECTOR] Analyzing file content...');
      const contentResult = await detectAIContent(fileText);
      
      // Reject if AI-generated with high confidence
      if (contentResult.isAI && contentResult.confidence > 0.7) {
        console.log(`[AI DETECTOR] ❌ REJECTED - File content flagged as AI (${(contentResult.confidence * 100).toFixed(1)}% confidence)`);
        return {
          passed: false,
          reason: 'File content appears to be AI-generated',
          details: {
            confidence: (contentResult.confidence * 100).toFixed(1) + '%',
            classification: contentResult.label
          }
        };
      } else {
        console.log(`[AI DETECTOR] ✅ File content appears human-written (${contentResult.label}, ${(contentResult.confidence * 100).toFixed(1)}%)`);
      }
    }
    
    // All checks passed
    console.log('[AI DETECTOR] ✅ Validation passed - content appears authentic');
    return {
      passed: true
    };
    
  } catch (error) {
    console.error('[AI DETECTOR] Validation error:', error);
    // On error, allow upload (fail open for better UX)
    console.log('[AI DETECTOR] ⚠️  Error occurred, allowing upload to proceed');
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
