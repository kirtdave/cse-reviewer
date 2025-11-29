const axios = require('axios');

// ==================== RETRY LOGIC WITH EXPONENTIAL BACKOFF ====================
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
      console.log(`⏳ Gemini API overloaded or timed out. Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// ==================== GEMINI API CALLER WITH RETRY ====================
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

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      requestBody,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 30000
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

// ==================== ✅ ENHANCED JSON PARSER WITH CLEANUP ====================
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
      console.warn("⚠️ JSON cleanup failed, attempting partial recovery...");
      
      try {
        const objectMatches = text.match(/{[^{}]*}/g);
        if (objectMatches && objectMatches.length > 0) {
          const validObjects = [];
          
          for (const match of objectMatches) {
            try {
              const obj = JSON.parse(match);
              if (obj.question && obj.options && obj.correctAnswer) {
                validObjects.push(obj);
              }
            } catch (e) {
              continue;
            }
          }
          
          if (validObjects.length > 0) {
            console.log(`✅ Recovered ${validObjects.length} valid questions from partial JSON`);
            return validObjects;
          }
        }
      } catch (recoveryError) {
        console.error("❌ Could not recover any valid questions");
      }
      
      console.error("❌ All JSON parsing attempts failed:", text.substring(0, 500));
      throw new Error('AI_INVALID_JSON: AI generated an unreadable or incomplete JSON response.');
    }
  }
}

// ==================== 1. GENERATE CSE PRACTICE QUESTIONS (WITH SUB-TOPIC & DUPLICATE PREVENTION) ====================
exports.generateQuestions = async (topic, difficulty, count = 5, avoidQuestions = [], subTopic = "") => {
  try {
    const batchSize = Math.min(count, 20);
    const batches = Math.ceil(count / batchSize);
    const allQuestions = [];
    
    for (let i = 0; i < batches; i++) {
      const questionsInBatch = i === batches - 1 ? count - (i * batchSize) : batchSize;
      
      // ✅ BUILD PROMPT WITH SUB-TOPIC FOCUS
      let prompt = `You are a system that generates exam questions. Your ONLY output must be a raw JSON array of objects.

Each object must have these exact keys: "question", "options", "correctAnswer", "explanation".
- "options" must be an array of 4 strings, starting with "A)", "B)", "C)", or "D)".
- "correctAnswer" must be the correct letter (e.g., "C").
- "explanation" MUST be a concise, single-line string.
- DO NOT add trailing commas after the last item in arrays or objects.
- Ensure the JSON is complete and properly closed.

Generate ${questionsInBatch} Civil Service Exam multiple-choice questions for the topic "${topic}" at "${difficulty}" difficulty.`;

      // ✅ ADD SUB-TOPIC FOCUS IF PROVIDED
      if (subTopic && subTopic.trim() !== "") {
        prompt += `\n\n🎯 SPECIFIC FOCUS: Your questions MUST be about "${subTopic}".
Focus ONLY on this specific sub-topic within ${topic}. Do NOT generate general ${topic} questions.

Examples of what to generate:
- If sub-topic is "basic logical reasoning and simple syllogisms", generate questions specifically about syllogisms and basic logic
- If sub-topic is "number series, letter series, and pattern recognition", generate ONLY pattern and sequence questions
- If sub-topic is "reading comprehension passages with context clues", include short passages with comprehension questions

Make sure every question directly relates to: ${subTopic}`;
      }

      // ✅ ADD CRITICAL AVOID SECTION IF THERE ARE PREVIOUS QUESTIONS
      if (avoidQuestions && avoidQuestions.length > 0) {
        prompt += `\n\n🚫 CRITICAL INSTRUCTION - DO NOT REPEAT THESE QUESTIONS:
The user has already answered these questions. You MUST generate COMPLETELY DIFFERENT questions:

`;
        avoidQuestions.slice(0, 10).forEach((q, idx) => {
          prompt += `${idx + 1}. ${q}\n`;
        });
        
        prompt += `\n✅ YOUR TASK: Generate ${questionsInBatch} NEW questions that are:
- About DIFFERENT concepts/scenarios within "${subTopic || topic}"
- NOT similar to any of the questions listed above
- Unique and fresh content
- Same difficulty level: "${difficulty}"`;
      }

      prompt += `\n\nCRITICAL: Return ONLY valid JSON array. No extra text, no markdown, no explanations.`;

      console.log(`📝 Generating batch ${i + 1}/${batches}${subTopic ? ` (Sub-topic: ${subTopic})` : ''}`);
      if (avoidQuestions.length > 0) {
        console.log(`🚫 Avoiding ${avoidQuestions.length} previous questions`);
      }

      const rawTextResponse = await callGeminiAPI(prompt, true);
      const batchQuestions = parseJsonFromAiResponse(rawTextResponse);
      
      if (Array.isArray(batchQuestions)) {
        console.log(`✅ Batch ${i + 1}: Generated ${batchQuestions.length} new questions`);
        allQuestions.push(...batchQuestions);
      } else if (typeof batchQuestions === 'object') {
        allQuestions.push(batchQuestions);
      }
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

Provide a clear, friendly explanation of why the correct answer is right and any key concepts to remember. Keep it concise.`;

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

Your response MUST be ONLY a single, raw JSON object with keys: "priorities" (array), "schedule" (object), "methods" (array), "tips" (array).`;

    const rawTextResponse = await callGeminiAPI(prompt, true);
    return parseJsonFromAiResponse(rawTextResponse);
  } catch (error) {
    console.error('Error generating recommendations:', error.message);
    if (error.message.startsWith('AI_')) throw error;
    return generateFallbackRecommendations(weakTopics, strongTopics, recentScores);
  }
};

// ==================== 4. CHATBOT FOR CSE QUESTIONS ====================
exports.chatWithAI = async (userMessage, conversationHistory = []) => {
  try {
    const systemContext = `You are a helpful and friendly Civil Service Exam tutor for the Philippines.

IMPORTANT STYLE RULE: You must write your entire response in short but concise straight to the point and complete, flowing paragraphs. Do NOT use any markdown like bullet points with asterisks (*) or lists with dashes (-). Structure your answer as a continuous, conversational block of text, as if you were speaking directly to the student.

Answer questions about exam topics, study tips, and exam procedures. Be clear and educational.`;

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

// ==================== 5. HELP WITH SPECIFIC QUESTION ====================
exports.helpWithQuestion = async (questionData, userMessage = null) => {
  try {
    const { questionText, category, isCorrect, userAnswer, correctAnswer, explanation } = questionData;
    
    let contextPrompt = `You are a helpful Civil Service Exam tutor for the Philippines. A student needs help with this question.

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