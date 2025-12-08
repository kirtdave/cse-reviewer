// services/aiService.js - FINAL PRODUCTION VERSION (ENGLISH DEFAULT)
const axios = require('axios');

// ==================== ⚙️ MODEL CONFIGURATION ====================
// OPTION 1: The Newest/Fastest (Based on your list)
const GEMINI_MODEL = "gemini-2.5-flash"; 

// OPTION 2: The Old Reliable (Use this if Option 1 gives 404 or 503 errors)
// const GEMINI_MODEL = "gemini-pro"; 

// ==================== RETRY LOGIC ====================
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isRateLimitOrOverload =
        error.response?.status === 503 ||
        error.response?.status === 429 ||
        error.response?.data?.error?.status === 'UNAVAILABLE' ||
        error.code === 'ECONNABORTED';

      if (!isRateLimitOrOverload || attempt === maxRetries) {
        throw error;
      }

      const delay = initialDelay * Math.pow(2, attempt - 1);
      console.log(`⏳ Gemini API overloaded. Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// ==================== GEMINI API CALLER ====================
async function callGeminiAPI(prompt, expectJson = false) {
  const makeRequest = async () => {
    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    if (expectJson) {
      requestBody.generationConfig = {
        responseMimeType: "application/json",
      };
    }

    // ✅ Uses the GEMINI_MODEL constant defined at the top
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      requestBody,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 45000 
      }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("AI generated an empty or invalid response.");
    }

    return text;
  };

  try {
    return await retryWithBackoff(makeRequest, 3, 2000);
  } catch (error) {
    console.error('❌ Gemini API Error:', error.response?.data || error.message);
    
    // Check for Model Not Found
    if (error.response?.status === 404) {
      throw new Error(`AI_MODEL_ERROR: The model '${GEMINI_MODEL}' was not found. Try switching to 'gemini-pro' in aiService.js`);
    }

    const isOverloadError =
      error.response?.status === 503 ||
      error.response?.status === 429 ||
      error.response?.data?.error?.status === 'UNAVAILABLE' ||
      error.code === 'ECONNABORTED';

    if (isOverloadError) {
      throw new Error('AI_OVERLOAD: AI service is currently overloaded or unresponsive. Please try again later.');
    }
    throw new Error('AI_GENERIC_ERROR: Failed to get response from AI service. Please try again.');
  }
}

// ==================== JSON PARSER ====================
function parseJsonFromAiResponse(text) {
  try {
    return JSON.parse(text);
  } catch (parseError) {
    console.warn("⚠️ Initial JSON parse failed, attempting cleanup...");
    
    try {
      let cleaned = text.trim();
      cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
      cleaned = cleaned.replace(/}\s*{/g, '},{');
      
      const jsonStart = Math.min(
        cleaned.indexOf('[') !== -1 ? cleaned.indexOf('[') : Infinity,
        cleaned.indexOf('{') !== -1 ? cleaned.indexOf('{') : Infinity
      );
      if (jsonStart !== Infinity && jsonStart > 0) {
        cleaned = cleaned.substring(jsonStart);
      }
      
      const parsed = JSON.parse(cleaned);
      console.log("✅ JSON cleanup successful");
      return parsed;
      
    } catch (cleanupError) {
      try {
        const objectMatches = text.match(/{[^{}]*}/g);
        if (objectMatches && objectMatches.length > 0) {
          const validObjects = [];
          for (const match of objectMatches) {
            try {
              const obj = JSON.parse(match);
              if (obj.question && obj.options) validObjects.push(obj);
            } catch (e) { continue; }
          }
          if (validObjects.length > 0) return validObjects;
        }
      } catch (recErr) { /* ignore */ }

      console.error("❌ All JSON parsing attempts failed:", text.substring(0, 500));
      throw new Error('AI_INVALID_JSON: AI generated an unreadable or incomplete JSON response.');
    }
  }
}

// ==================== ✅ GENERATE QUESTIONS FROM PDF ====================
exports.generateQuestionsFromPDF = async (pdfText, category, count = 10, userCommand = '') => {
  try {
    console.log(`📚 Generating ${count} questions from PDF (${pdfText.length} chars)`);
    
    let prompt = `You are a system that generates exam questions. Your ONLY output must be a raw JSON array of objects.

Each object must have these exact keys: "question", "options", "correctAnswer", "explanation", "category", "difficulty".
- "options" must be an array of exactly 4 strings.
- "correctAnswer" must be one of: "A", "B", "C", or "D"
- "explanation" MUST be a concise string.
- DO NOT add trailing commas.

🔴 FORMATTING RULES (CRITICAL):
1. **NO VISUAL REFERENCES**: Do NOT use words like "underlined", "bolded", "italicized".
2. **USE CAPS INSTEAD**: If referring to a specific word, write it in CAPS or 'QUOTES'. 

Generate ${count} multiple-choice questions based on the following PDF content:

PDF CONTENT:
"""
${pdfText}
"""

${userCommand ? `\nADDITIONAL INSTRUCTIONS: ${userCommand}\n` : ''}

CRITICAL: Return ONLY the JSON array.`;

    const rawTextResponse = await callGeminiAPI(prompt, true);
    console.log('🔍 Raw AI Response (first 500 chars):', rawTextResponse.substring(0, 500));
    
    const questions = parseJsonFromAiResponse(rawTextResponse);
    
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('AI generated no valid questions from PDF');
    }
    
    // ✅ VALIDATE: Ensure every question has proper structure
    const validatedQuestions = questions.map((q, idx) => {
      let finalOptions = Array.isArray(q.options) && q.options.length === 4 
          ? q.options 
          : ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"];

      const formattedOptions = finalOptions.map((opt, i) => {
        const prefix = ['A)', 'B)', 'C)', 'D)'][i];
        let cleanOpt = opt.replace(/^[A-D]\)\s*/i, '').trim();
        return `${prefix} ${cleanOpt}`;
      });

      return {
        question: q.question || `Question ${idx + 1}`,
        options: formattedOptions,
        correctAnswer: q.correctAnswer ? q.correctAnswer.charAt(0).toUpperCase() : 'A',
        explanation: q.explanation || 'See study materials.',
        category: category,
        difficulty: q.difficulty || 'Normal'
      };
    });
    
    return validatedQuestions;

  } catch (error) {
    console.error('❌ Error in generateQuestionsFromPDF:', error.message);
    if (error.message.startsWith('AI_')) throw error;
    throw new Error(`Failed to generate questions from PDF: ${error.message}`);
  }
};

// ==================== 1. GENERATE CSE PRACTICE QUESTIONS (UPDATED CONTEXT) ====================
exports.generateQuestions = async (topic, difficulty, count = 5, avoidQuestions = [], subTopic = "") => {
  try {
    const batchSize = Math.min(count, 10);
    const batches = Math.ceil(count / batchSize);
    const allQuestions = [];
    
    for (let i = 0; i < batches; i++) {
      const questionsInBatch = i === batches - 1 ? count - (i * batchSize) : batchSize;
      
      // ✅ IMPROVEMENT: Strong Philippines Context + Visual Safety Rules
      let prompt = `You are an expert exam question generator for the PHILIPPINES Civil Service Examination (CSE). 
Your ONLY output must be a raw JSON array of objects.

Each object must have these exact keys: "question", "options", "correctAnswer", "explanation".
- "options" must be an array of 4 strings.
- "correctAnswer" must be the correct letter ONLY (e.g., "C").
- "explanation" MUST be a concise, single-line string.

Generate ${questionsInBatch} multiple-choice questions for the topic "${topic}" at "${difficulty}" difficulty.

🔴 FORMATTING RULES (CRITICAL):
1. **NO VISUAL REFERENCES**: Do NOT use words like "underlined", "bolded", or "italicized". The user cannot see formatting.
2. **USE CAPS INSTEAD**: If you need to highlight a word, write it in CAPITAL LETTERS or put it in 'SINGLE QUOTES'.

🌍 CONTEXT RULES (CRITICAL - FOLLOW STRICTLY):
1. **Philippine Constitution**: Focus on Art. III (Bill of Rights), Citizenship, and 3 Branches of Govt.
2. **General Knowledge**: Focus ONLY on RA 6713 (Code of Conduct), Peace & Human Rights, and Environmental Laws.
3. **Numerical Ability**: Use Word Problems (Age, Work, Motion), Fractions, and Basic Operations. Use Peso (PHP).
4. **Verbal Ability**: Focus on Grammar, Vocabulary, and Paragraph Organization.
5. **Analytical Ability**: Focus on Logic, Assumptions, Data Sufficiency, and Word Association.
6. **Clerical Ability**: Focus on Alphabetical Filing Rules, Spelling, and Data Checking (Sub-Professional Level).`;

      // 🎯 SUB-TOPIC LOGIC: This captures the data sent from your Study Guide
      if (subTopic && subTopic.trim() !== "") {
        prompt += `\n\n🎯 SPECIFIC FOCUS: Your questions MUST be about "${subTopic}".
Focus ONLY on this specific sub-topic within ${topic}. Do NOT generate general ${topic} questions.

Make sure every question directly relates to: ${subTopic}`;
      }

      if (avoidQuestions && avoidQuestions.length > 0) {
        prompt += `\n\n🚫 DO NOT REPEAT THESE QUESTIONS (Generate NEW content):\n`;
        avoidQuestions.slice(0, 10).forEach((q, idx) => {
          prompt += `${idx + 1}. ${q}\n`;
        });
      }

      prompt += `\n\nCRITICAL: Return ONLY valid JSON array. No extra text.`;

      console.log(`📝 Generating batch ${i + 1}/${batches}${subTopic ? ` (Sub-topic: ${subTopic})` : ''} (Model: ${GEMINI_MODEL})`);

      const rawTextResponse = await callGeminiAPI(prompt, true);
      const batchQuestions = parseJsonFromAiResponse(rawTextResponse);
      
      let rawList = [];
      if (Array.isArray(batchQuestions)) {
        rawList = batchQuestions;
      } else if (typeof batchQuestions === 'object' && batchQuestions !== null) {
        rawList = [batchQuestions];
      }

      // ✅ VALIDATION: Fix A) B) C) D) formatting and Answers
      const validatedBatch = rawList.map((q, idx) => {
        let finalOptions = Array.isArray(q.options) && q.options.length === 4 
          ? q.options 
          : ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"];

        finalOptions = finalOptions.map((opt, k) => {
          const prefix = ['A)', 'B)', 'C)', 'D)'][k];
          let cleanOpt = opt.replace(/^[A-D]\)\s*/i, '').trim();
          return `${prefix} ${cleanOpt}`;
        });

        let cleanAnswer = 'A';
        if (q.correctAnswer) {
          const match = q.correctAnswer.match(/[A-D]/i);
          if (match) cleanAnswer = match[0].toUpperCase();
        }

        return {
          question: q.question || `Question ${idx + 1}`,
          options: finalOptions,
          correctAnswer: cleanAnswer,
          explanation: q.explanation || "See study materials for details.",
          category: topic, 
          difficulty: difficulty
        };
      });
      
      console.log(`✅ Batch ${i + 1}: Generated and Validated ${validatedBatch.length} questions`);
      allQuestions.push(...validatedBatch);
    }
    
    return allQuestions;

  } catch (error) {
    console.error('Error generating questions:', error.message);
    if (error.message.startsWith('AI_')) throw error;
    return getFallbackQuestions(topic, difficulty, count);
  }
};

// ==================== 2. EXPLAIN ANSWER TO STUDENT ====================
exports.explainAnswer = async (question, studentAnswer, correctAnswer) => {
  try {
    const prompt = `As a Civil Service Exam tutor, explain this question:

Question: ${question}
Student's Answer: ${studentAnswer}
Correct Answer: ${correctAnswer}

Provide a clear, friendly explanation of why the correct answer is right and any key concepts to remember. Keep it concise.
IMPORTANT: Respond in English unless the student asks in Tagalog.`;

    return await callGeminiAPI(prompt, false);
  } catch (error) {
    console.error('Error explaining answer:', error.message);
    if (error.message.startsWith('AI_')) throw error;
    return "I'm having trouble connecting right now. Please review the explanation in your study materials.";
  }
};

// ==================== 3. PERSONALIZED STUDY RECOMMENDATIONS ====================
exports.getStudyRecommendations = async (weakTopics, strongTopics, recentScores) => {
  try {
    const prompt = `As an advisor, provide personalized recommendations based on this data:
- Weak Topics: ${weakTopics.join(', ') || 'None specified'}
- Strong Topics: ${strongTopics.join(', ') || 'None specified'}
- Recent Scores: ${recentScores.join(', ') || 'None specified'}%

Your response MUST be ONLY a single, raw JSON object with keys: "priorities" (array), "schedule" (object), "methods" (array), "tips" (array).
IMPORTANT: The content inside the JSON must be in English.`;

    const rawTextResponse = await callGeminiAPI(prompt, true);
    return parseJsonFromAiResponse(rawTextResponse);
  } catch (error) {
    console.error('Error generating recommendations:', error.message);
    if (error.message.startsWith('AI_')) throw error;
    return generateFallbackRecommendations(weakTopics, strongTopics, recentScores);
  }
};

// ==================== 4. CHATBOT FOR CSE QUESTIONS (ENGLISH DEFAULT) ====================
exports.chatWithAI = async (userMessage, conversationHistory = [], userData = null) => {
  try {
    let systemContext = `You are a helpful and friendly Civil Service Exam tutor for the Philippines.

🔴 LANGUAGE RULE: You must speak in ENGLISH by default. Only use Tagalog/Filipino if the user explicitly asks for it or speaks to you in Tagalog first.

IMPORTANT STYLE RULE: You must write your entire response in short but concise straight to the point and complete, flowing paragraphs. Do NOT use any markdown like bullet points with asterisks (*) or lists with dashes (-). Structure your answer as a continuous, conversational block of text, as if you were speaking directly to the student.

Answer questions about exam topics, study tips, and exam procedures. Be clear and educational.`;

    if (userData && userData.avgScore !== undefined) {
      systemContext += `\n\n📊 STUDENT PERFORMANCE DATA (Use this to provide personalized insights):
- Average Score: ${userData.avgScore}%
- Total Mock Exams Taken: ${userData.totalExams}
- Section Performance:
  * Verbal Ability: ${userData.sections?.verbal || 0}%
  * Numerical Ability: ${userData.sections?.numerical || 0}%
  * Analytical Ability: ${userData.sections?.analytical || 0}%
  * General Knowledge: ${userData.sections?.generalInfo || 0}%
  * Clerical Ability: ${userData.sections?.clerical || 0}%
  * Philippine Constitution: ${userData.sections?.constitution || 0}%
- Time Performance:
  * Average Time per Question: ${userData.timeMetrics?.avgTimePerQuestion || 0} seconds
  * Consistency Score: ${userData.timeMetrics?.consistency || 0}%
  * Speed Score: ${userData.timeMetrics?.speedScore || 0}%`;

      if (userData.recentAttempts && userData.recentAttempts.length > 0) {
        systemContext += `\n- Recent Test Results:`;
        userData.recentAttempts.slice(0, 3).forEach((attempt, idx) => {
          systemContext += `\n  ${idx + 1}. ${attempt.title}: ${attempt.score}% (${attempt.result})`;
        });
      }

      systemContext += `\n\n🎯 WHEN THE STUDENT ASKS ABOUT THEIR PROGRESS:
- Analyze the data above
- Identify specific strengths (sections with 75%+)
- Identify weaknesses (sections below 65%)
- Give concrete, actionable recommendations
- Mention their overall average (${userData.avgScore}%)
- Comment on time management if relevant
- Be encouraging but honest

DO NOT ask for more information - you have all the data you need above. Provide a complete analysis based on this data.`;
    }

    let fullPrompt = systemContext + "\n\n";
    conversationHistory.forEach(msg => {
      fullPrompt += `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}\n`;
    });
    fullPrompt += `Student: ${userMessage}\nTutor:`;

    const response = await callGeminiAPI(fullPrompt, false);
    return response;
  } catch (error) {
    console.error('❌ AI Chat Error:', error.message);
    if (error.message.startsWith('AI_')) throw error;
    return "I'm having trouble connecting to my AI brain right now 🤖💭 Try asking again in a moment!";
  }
};

// ==================== 5. HELP WITH SPECIFIC QUESTION (ENGLISH DEFAULT) ====================
exports.helpWithQuestion = async (questionData, userMessage = null) => {
  try {
    const { questionText, category, isCorrect, userAnswer, correctAnswer, explanation } = questionData;
    
    let contextPrompt = `You are a helpful Civil Service Exam tutor for the Philippines. A student needs help with this question.

🔴 LANGUAGE RULE: Respond in ENGLISH. Only use Tagalog if the student explicitly requests it.

IMPORTANT STYLE RULE: Write your entire response in short but concise straight to the point complete, flowing paragraphs. Do NOT use any markdown like bullet points with asterisks (*) or lists with dashes (-). Structure your answer as a continuous, conversational block of text, as if you were speaking directly to the student.

Question: ${questionText}
Category: ${category}
Student's Answer: ${isCorrect ? 'Correct ✓' : 'Wrong ✗'}`;

    if (!isCorrect && correctAnswer) {
      contextPrompt += `\nCorrect Answer: ${correctAnswer}`;
    }

    if (explanation) {
      contextPrompt += `\nExplanation: ${explanation}`;
    }

    if (userMessage) {
      contextPrompt += `\n\nStudent asks: ${userMessage}`;
    } else {
      contextPrompt += `\n\nProvide an encouraging explanation to help the student understand this question better. ${
        isCorrect 
          ? 'Praise their correct answer and explain why it is right.' 
          : 'Explain why they got it wrong and help them understand the correct concept.'
      }`;
    }

    contextPrompt += `\n\nBe conversational and encouraging. Keep your response concise and easy to understand.`;

    const response = await callGeminiAPI(contextPrompt, false);
    return response;

  } catch (error) {
    console.error('Error helping with question:', error.message);
    if (error.message.startsWith('AI_')) throw error;
    return "I'm having trouble connecting right now. Please review the explanation provided with the question, or try asking again in a moment.";
  }
};

// ==================== 6. GENERATE ANSWER CHOICES - FORCED RANDOMIZATION ====================
exports.generateAnswerChoices = async (questionText, category) => {
  try {
    const prompt = `You are generating multiple choice answers for a Civil Service Exam question.

Question: "${questionText}"
Category: ${category}

STEP 1: Identify the correct answer
STEP 2: Generate 3 plausible wrong answers
STEP 3: Your response MUST be a JSON object with:
{
  "correctAnswerText": "the actual correct answer text",
  "wrongAnswers": ["wrong answer 1", "wrong answer 2", "wrong answer 3"],
  "explanation": "Brief explanation why the correct answer is right"
}

RULES:
- correctAnswerText: The actual correct answer (plain text, no prefixes)
- wrongAnswers: Array of 3 plausible but incorrect answers
- explanation: Single-line explanation
- Return ONLY valid JSON

Example:
{
  "correctAnswerText": "Manila",
  "wrongAnswers": ["Cebu City", "Quezon City", "Davao City"],
  "explanation": "Manila is the capital city of the Philippines."
}

Generate now.`;

    const rawResponse = await callGeminiAPI(prompt, true);
    
    console.log('🔍 Raw AI Response:', rawResponse.substring(0, 300));
    
    let parsed = parseJsonFromAiResponse(rawResponse);
    
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('AI returned invalid data structure');
    }

    const correctAnswerText = parsed.correctAnswerText || parsed.correct || '';
    const wrongAnswers = Array.isArray(parsed.wrongAnswers) 
      ? parsed.wrongAnswers 
      : (Array.isArray(parsed.wrong) ? parsed.wrong : []);
    
    if (!correctAnswerText || wrongAnswers.length < 3) {
      throw new Error('AI did not provide correct answer and 3 wrong answers');
    }

    // ✅ FORCE RANDOMIZATION
    const positions = ['A', 'B', 'C', 'D'];
    const correctPosition = positions[Math.floor(Math.random() * 4)];
    const correctIndex = correctPosition.charCodeAt(0) - 65;

    const choices = [];
    let wrongIndex = 0;
    
    for (let i = 0; i < 4; i++) {
      if (i === correctIndex) {
        choices.push(correctAnswerText.trim());
      } else {
        choices.push(wrongAnswers[wrongIndex] ? wrongAnswers[wrongIndex].trim() : `Option ${i + 1}`);
        wrongIndex++;
      }
    }

    const explanation = parsed.explanation || 'This is the correct answer.';

    console.log('✅ Final result (RANDOMIZED):', {
      choices,
      correctAnswer: correctPosition,
      correctAnswerText: choices[correctIndex],
      explanation: explanation.substring(0, 80)
    });

    return {
      choices,
      correctAnswer: correctPosition,
      explanation: explanation.replace(/\n/g, ' ').trim()
    };

  } catch (error) {
    console.error('❌ Error generating answer choices:', error.message);
    
    if (error.message.startsWith('AI_')) {
      throw error;
    }
    
    const randomCorrect = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];
    
    return {
      choices: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correctAnswer: randomCorrect,
      explanation: 'AI service temporarily unavailable. Please enter answers manually.'
    };
  }
};

// ==================== FALLBACK FUNCTIONS ====================
function getFallbackQuestions(topic, difficulty, count) {
  const templates = [{
    question: `What is a key concept in ${topic}? (AI Fallback)`,
    options: ["A) Concept 1", "B) Concept 2", "C) Concept 3", "D) Concept 4"],
    correctAnswer: "A",
    explanation: `The AI service is temporarily unavailable. This is a general question about ${topic}.`
  }];
  return Array(count).fill(null).map((_, i) => ({ ...templates[0], question: `${topic} Question ${i + 1} (AI Fallback)`}));
}

function generateFallbackRecommendations(weakTopics, strongTopics, recentScores) {
  const priorities = weakTopics.length > 0 ? weakTopics.slice(0, 2) : ["General review", "Practice tests"];
  const schedule = {};
  priorities.forEach((topic, i) => { schedule[topic] = i === 0 ? "2 hours/day" : "1 hour/day"; });
  return {
    priorities, schedule,
    methods: ["Focus on understanding concepts", "Take practice tests regularly"],
    tips: ["Take short breaks to maintain focus", "Review mistakes thoroughly"]
  };
}