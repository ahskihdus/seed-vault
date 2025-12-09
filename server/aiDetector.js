// server/aiDetector.js - PROPER AI DETECTION
const { pipeline } = require('@xenova/transformers');

let classifier = null;

/**
 * Initialize the AI detection model (lazy loading)
 * Uses better AI detection model
 */
async function initClassifier() {
  if (!classifier) {
    console.log('[AI DETECTOR] Loading AI detection model...');
    console.log('[AI DETECTOR] This may take 10-30 seconds on first load...');
    
    // Using GPT-3.5 Detector model - better at detecting modern AI
    try {
      classifier = await pipeline(
        'text-classification',
        'Xenova/albert-base-v2-finetuned-ai-generated-text'
      );
    } catch (e) {
      console.log('[AI DETECTOR] Falling back to RoBERTa detector...');
      classifier = await pipeline(
        'text-classification',
        'Xenova/roberta-base-openai-detector'
      );
    }
    
    console.log('[AI DETECTOR] Model loaded successfully');
  }
  return classifier;
}

/**
 * Heuristic analysis for AI writing patterns
 * @param {string} text - Text to analyze
 * @returns {Object} - AI indicators and score
 */
function analyzeWritingPatterns(text) {
  const indicators = {
    score: 0,
    flags: []
  };
  
  // 1. Check for AI filler phrases
  const aiPhrases = [
    'comprehensive synthesis',
    'multifaceted approach',
    'in examining',
    'furthermore,',
    'moreover,',
    'in conclusion',
    'it is important to note',
    'as a matter of fact',
    'intricate interplay',
    'nuanced complexities',
    'fundamental paradigms',
    'systematic implementation',
    'profound significance',
    'diverse perspectives',
    'simultaneously acknowledging',
    'cross-cultural knowledge',
    'ancestral craftsmanship',
    'elucidates the',
    'seamlessly integrate',
    'innovative approach',
    'cutting-edge technology',
    'revolutionary method'
  ];
  
  const lowerText = text.toLowerCase();
  let phraseCount = 0;
  aiPhrases.forEach(phrase => {
    const matches = lowerText.split(phrase).length - 1;
    phraseCount += matches;
  });
  
  if (phraseCount > 2) {
    indicators.score += 35;
    indicators.flags.push(`Heavy use of filler phrases (${phraseCount} detected)`);
  }
  
  // 2. Check sentence complexity (very complex = suspicious)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgWordsPerSentence = text.split(/\s+/).length / sentences.length;
  if (avgWordsPerSentence > 20) {
    indicators.score += 20;
    indicators.flags.push(`Unusually long sentences (avg ${avgWordsPerSentence.toFixed(1)} words)`);
  }
  
  // 3. Check for passive voice overuse
  const passivePatterns = /\b(is|are|was|were)\s+\w+ed\b/gi;
  const passiveCount = (text.match(passivePatterns) || []).length;
  const passiveRatio = passiveCount / sentences.length;
  if (passiveRatio > 0.3) {
    indicators.score += 20;
    indicators.flags.push(`Excessive passive voice (${(passiveRatio * 100).toFixed(1)}% of sentences)`);
  }
  
  // 4. Check vocabulary repetition
  const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const uniqueWords = new Set(words);
  const vocabularyDiversity = uniqueWords.size / words.length;
  if (vocabularyDiversity > 0.65 && text.length > 200) {
    indicators.score += 15;
    indicators.flags.push(`Very high vocabulary diversity (possible overuse of thesaurus)`);
  }
  
  // 5. Check for overuse of hedging language
  const hedgingPhrases = ['arguably', 'it could be argued', 'in some sense', 'somewhat', 'relatively', 'quite', 'fairly'];
  const hedgingCount = hedgingPhrases.filter(phrase => 
    lowerText.includes(phrase)
  ).length;
  if (hedgingCount > 1) {
    indicators.score += 15;
    indicators.flags.push(`Multiple hedging phrases detected (${hedgingCount})`);
  }
  
  // 6. Check for repetitive structure
  const sentenceStarts = sentences.map(s => s.trim().split(/\s+/)[0]);
  const repeatedStarts = sentenceStarts.filter(
    (start, idx) => sentenceStarts.indexOf(start) !== idx
  ).length;
  if (repeatedStarts > 1) {
    indicators.score += 15;
    indicators.flags.push(`Repetitive sentence structures (${repeatedStarts} repeated)`);
  }
  
  return indicators;
}

/**
 * Detect if text content is AI-generated
 * @param {string} text - Text content to analyze
 * @returns {Promise<{isAI: boolean, confidence: number, label: string, analysis: Object}>}
 */
async function detectAIContent(text) {
  // Validate input
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return {
      isAI: false,
      confidence: 0,
      label: 'INSUFFICIENT_TEXT',
      error: 'No text content provided'
    };
  }

  // STEP 1: Heuristic Analysis (always runs, no errors expected)
  const heuristicAnalysis = analyzeWritingPatterns(text);
  const heuristicScore = heuristicAnalysis.score / 100;
  
  console.log('[AI DETECTOR] Heuristic Analysis:', {
    score: heuristicAnalysis.score,
    flags: heuristicAnalysis.flags
  });
  
  // STEP 2: Model-based Detection (wrapped in try-catch, optional)
  let modelScore = 0;
  let isAI = false;
  let label = 'UNKNOWN';
  let result = null;
  
  try {
    const model = await initClassifier();
    
    // Truncate text if too long (model limit ~512 tokens)
    const truncatedText = text.substring(0, 2000);
    
    // Run model detection
    result = await model(truncatedText);
    
    console.log('[AI DETECTOR] Model Analysis result:', result);
    
    if (Array.isArray(result) && result.length > 0) {
      const predictions = result.sort((a, b) => b.score - a.score);
      const topPrediction = predictions[0];
      
      label = topPrediction.label;
      modelScore = topPrediction.score;
      
      isAI = (label.toLowerCase() === 'fake' || 
              label.toLowerCase().includes('ai') || 
              label.toLowerCase().includes('generated'));
    }
  } catch (error) {
    console.error('[AI DETECTOR] Model loading error (using heuristic fallback):', error.message);
    label = 'MODEL_UNAVAILABLE';
  }
  
  // STEP 3: Combine scores (weighted average)
  // 60% model + 40% heuristic
  const combinedConfidence = (modelScore * 0.6) + (heuristicScore * 0.4);
  
  // Flag as AI if:
  // 1. Model explicitly classifies as AI/Fake, OR
  // 2. Combined score >= 0.50, OR
  // 3. Heuristic score alone >= 0.50 (50+ points = multiple strong indicators)
  const flaggedByAI = isAI;
  const flaggedByCombined = combinedConfidence >= 0.50;
  const flaggedByHeuristic = heuristicScore >= 0.50;
  const finalIsAI = flaggedByAI || flaggedByCombined || flaggedByHeuristic;
  
  // Use highest relevant score for confidence
  const finalConfidence = Math.max(combinedConfidence, heuristicScore);
  
  console.log('[AI DETECTOR] Combined Detection:', {
    modelScore: (modelScore * 100).toFixed(1) + '%',
    heuristicScore: (heuristicAnalysis.score) + '%',
    combinedConfidence: (combinedConfidence * 100).toFixed(1) + '%',
    finalConfidence: (finalConfidence * 100).toFixed(1) + '%',
    flaggedByAI: flaggedByAI,
    flaggedByCombined: flaggedByCombined,
    flaggedByHeuristic: flaggedByHeuristic,
    isAI: finalIsAI
  });
  
  return {
    isAI: finalIsAI,
    confidence: finalConfidence,
    label: label,
    modelScore: modelScore,
    heuristicScore: heuristicScore,
    heuristicFlags: heuristicAnalysis.flags,
    rawResult: result
  };
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
      
      // Reject if AI-generated (score >= 0.50)
      if (descResult.isAI && descResult.confidence >= 0.50) {
        console.log(`[AI DETECTOR] ❌ REJECTED - Description flagged as AI (${(descResult.confidence * 100).toFixed(1)}% confidence)`);
        return {
          passed: false,
          reason: 'Description appears to be AI-generated',
          details: {
            confidence: (descResult.confidence * 100).toFixed(1) + '%',
            modelScore: (descResult.modelScore * 100).toFixed(1) + '%',
            heuristicScore: descResult.heuristicScore * 100 + '%',
            flags: descResult.heuristicFlags
          }
        };
      } else {
        console.log(`[AI DETECTOR] ✅ Description appears authentic (${(descResult.confidence * 100).toFixed(1)}% confidence)`);
      }
    }
    
    // Check 2: Analyze file content (if text-based)
    const fileText = await extractTextFromFile(file);
    if (fileText && fileText.length > 100) {
      console.log('[AI DETECTOR] Analyzing file content...');
      const contentResult = await detectAIContent(fileText);
      
      // Reject if AI-generated (score >= 0.50)
      if (contentResult.isAI && contentResult.confidence >= 0.50) {
        console.log(`[AI DETECTOR] ❌ REJECTED - File content flagged as AI (${(contentResult.confidence * 100).toFixed(1)}% confidence)`);
        return {
          passed: false,
          reason: 'File content appears to be AI-generated',
          details: {
            confidence: (contentResult.confidence * 100).toFixed(1) + '%',
            modelScore: (contentResult.modelScore * 100).toFixed(1) + '%',
            heuristicScore: contentResult.heuristicScore * 100 + '%',
            flags: contentResult.heuristicFlags
          }
        };
      } else {
        console.log(`[AI DETECTOR] ✅ File content appears authentic (${(contentResult.confidence * 100).toFixed(1)}% confidence)`);
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
