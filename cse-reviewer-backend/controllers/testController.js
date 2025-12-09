// controllers/testController.js - WITH SUB-TOPIC SUPPORT AND RETRY LOGIC
const { Op } = require('sequelize');
const { Question } = require('../models');
const aiService = require('../services/aiService');

exports.generateTest = async (req, res) => {
  try {
    // ✅ EXTRACT PARAMETERS INCLUDING SUB-TOPIC
    const { categories, avoidQuestions, sessionId, questionNumber } = req.body;

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Categories array is required'
      });
    }

    console.log('🤖 ========== GENERATING TEST ==========');
    console.log('Categories:', JSON.stringify(categories, null, 2));
    
    // ✅ LOG SESSION INFO AND AVOID LIST
    if (sessionId) {
      console.log(`📝 Session ID: ${sessionId}, Question #${questionNumber || 1}`);
    }
    if (avoidQuestions && avoidQuestions.length > 0) {
      console.log(`🚫 Avoiding ${avoidQuestions.length} previous questions:`);
      avoidQuestions.slice(0, 3).forEach((q, i) => {
        console.log(`   ${i + 1}. ${q.substring(0, 60)}...`);
      });
    }

    const allQuestions = [];
    const usedQuestionIds = new Set();

    for (const category of categories) {
      const { topic, difficulty, count, subTopic } = category; // ✅ Extract subTopic

      if (!topic || !difficulty || !count) {
        console.warn(`⚠️ Skipping invalid category:`, category);
        continue;
      }

      // ✅ LOG SUB-TOPIC IF PROVIDED
      if (subTopic) {
        console.log(`\n📝 Processing: ${count} ${difficulty} questions for "${topic}" (Sub-topic: "${subTopic}")`);
      } else {
        console.log(`\n📝 Processing: ${count} ${difficulty} questions for "${topic}"`);
      }

      try {
        const questionsForCategory = [];

        // ✅ STEP 1: Try to generate NEW questions with AI FIRST (WITH AVOID LIST & SUB-TOPIC)
        console.log(`  🤖 Generating ${count} NEW questions with AI...`);
        
        try {
          // ✅ PASS SUB-TOPIC TO AI SERVICE
          const newQuestions = await aiService.generateQuestions(
            topic, 
            difficulty, 
            count,
            avoidQuestions || [],
            subTopic || "" // ✅ Pass sub-topic filter
          );
          
          if (subTopic) {
            console.log(`  ✅ AI generated ${newQuestions.length} questions focused on: ${subTopic}`);
          } else {
            console.log(`  ✅ AI generated ${newQuestions.length} unique questions`);
          }
          
          // ✅ STEP 2: Save each new question to database
          let savedCount = 0;
          let skippedCount = 0;
          let duplicateCount = 0;
          let failedCount = 0;

          for (const q of newQuestions) {
            try {
              // Check if question already exists in database
              const exists = await Question.questionExists(q.question, topic);
              
              if (exists) {
                console.log(`  ⏭️  Question already exists in DB, skipping...`);
                skippedCount++;
                continue;
              }

              // Save to database
              const savedQuestion = await Question.create({
                questionText: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                category: topic,
                difficulty: difficulty,
                subCategory: subTopic || null, // ✅ NEW: Save sub-topic
                usageCount: 1,
                source: 'AI'
              });

              const questionId = savedQuestion.id;

              // ✅ CHECK: Skip if already used in THIS test
              if (usedQuestionIds.has(questionId)) {
                console.log(`  🔄 Question already used in this test, skipping...`);
                duplicateCount++;
                continue;
              }

              // ✅ Add to used set and questions list
              usedQuestionIds.add(questionId);
              
              questionsForCategory.push({
                question: savedQuestion.questionText,
                options: savedQuestion.options,
                correctAnswer: savedQuestion.correctAnswer,
                explanation: savedQuestion.explanation,
                category: topic,
                _id: questionId
              });

              savedCount++;
              console.log(`  💾 [${savedCount}/${newQuestions.length}] Saved with ID: ${questionId}`);

            } catch (saveError) {
              console.error(`  ❌ Failed to save question:`, saveError.message);
              failedCount++;
              
              // Add question without ID as fallback (only if not duplicate)
              questionsForCategory.push({
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                category: topic,
                _id: null
              });
            }
          }

          console.log(`  📊 AI Questions Summary:`);
          console.log(`     ✅ Saved: ${savedCount}`);
          console.log(`     ⏭️  Skipped (DB duplicates): ${skippedCount}`);
          console.log(`     🔄 Skipped (test duplicates): ${duplicateCount}`);
          console.log(`     ❌ Failed: ${failedCount}`);

          // ✅ STEP 3: If we don't have enough questions, use existing ones as FALLBACK
          const needMore = count - questionsForCategory.length;
          
          if (needMore > 0) {
            console.log(`  🔄 Need ${needMore} more questions, checking database...`);
            
            // ✅ Get more questions than needed to filter duplicates
            const existingQuestions = await Question.getByFilters(topic, difficulty, needMore * 3);
            console.log(`  ✅ Found ${existingQuestions.length} existing questions in DB`);

            let addedFromDB = 0;
            for (const dbQuestion of existingQuestions) {
              const questionId = dbQuestion.id;
              
              // ✅ Skip if already used in this test
              if (usedQuestionIds.has(questionId)) {
                console.log(`  🔄 DB question already used, skipping...`);
                continue;
              }

              // ✅ Stop when we have enough questions
              if (addedFromDB >= needMore) {
                break;
              }

              await dbQuestion.increment('usageCount');
              
              usedQuestionIds.add(questionId);
              
              questionsForCategory.push({
                question: dbQuestion.questionText,
                options: dbQuestion.options,
                correctAnswer: dbQuestion.correctAnswer,
                explanation: dbQuestion.explanation,
                category: topic,
                _id: questionId
              });

              addedFromDB++;
            }

            console.log(`  ✅ Added ${addedFromDB} unique questions from database`);
          }

          // ✅ STEP 4: RETRY LOOP - Keep generating until we hit the target
          let retryAttempts = 0;
          const maxRetries = 3;

          while (questionsForCategory.length < count && retryAttempts < maxRetries) {
            const stillNeed = count - questionsForCategory.length;
            retryAttempts++;
            
            console.log(`  🔄 Retry #${retryAttempts}: Still need ${stillNeed} more questions, generating...`);
            
            try {
              // Generate exactly what we need (with small buffer for duplicates)
              const retryQuestions = await aiService.generateQuestions(
                topic, 
                difficulty, 
                Math.min(stillNeed + 2, 10), // Add buffer but cap at 10
                avoidQuestions || [],
                subTopic || ""
              );
              
              console.log(`  ✅ Retry generated ${retryQuestions.length} questions`);
              
              // Save and add them
              let addedInRetry = 0;
              for (const q of retryQuestions) {
                if (questionsForCategory.length >= count) break; // Stop when we hit target
                
                try {
                  const exists = await Question.questionExists(q.question, topic);
                  
                  if (exists) {
                    console.log(`  ⏭️  Retry question already exists, skipping...`);
                    continue;
                  }

                  const savedQuestion = await Question.create({
                    questionText: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation,
                    category: topic,
                    difficulty: difficulty,
                    subCategory: subTopic || null,
                    usageCount: 1,
                    source: 'AI'
                  });

                  const questionId = savedQuestion.id;

                  if (usedQuestionIds.has(questionId)) {
                    console.log(`  🔄 Retry question already used, skipping...`);
                    continue;
                  }

                  usedQuestionIds.add(questionId);
                  
                  questionsForCategory.push({
                    question: savedQuestion.questionText,
                    options: savedQuestion.options,
                    correctAnswer: savedQuestion.correctAnswer,
                    explanation: savedQuestion.explanation,
                    category: topic,
                    _id: questionId
                  });

                  addedInRetry++;
                  console.log(`  💾 Retry [${addedInRetry}] Saved with ID: ${questionId}`);

                } catch (saveError) {
                  console.error(`  ❌ Failed to save retry question:`, saveError.message);
                }
              }
              
              console.log(`  📊 Retry #${retryAttempts} added ${addedInRetry} questions`);
              
              if (addedInRetry === 0) {
                console.log(`  ⚠️  Retry produced no new unique questions, stopping retries`);
                break;
              }
              
            } catch (retryError) {
              console.error(`  ❌ Retry #${retryAttempts} failed:`, retryError.message);
              break;
            }
          }

          // Final count check
          if (questionsForCategory.length < count) {
            console.warn(`  ⚠️  Could only generate ${questionsForCategory.length}/${count} questions after ${retryAttempts} retries`);
          }

        } catch (aiError) {
          console.error(`  ❌ AI generation failed:`, aiError.message);
          
          // ✅ FALLBACK: Use existing questions from DB when AI completely fails
          console.log(`  🔄 AI failed, falling back to database questions...`);
          const existingQuestions = await Question.getByFilters(topic, difficulty, count * 2);
          console.log(`  ✅ Found ${existingQuestions.length} existing questions in DB`);

          let addedFromDB = 0;
          for (const dbQuestion of existingQuestions) {
            const questionId = dbQuestion.id;
            
            // ✅ Skip if already used in this test
            if (usedQuestionIds.has(questionId)) {
              continue;
            }

            // ✅ Stop when we have enough questions
            if (addedFromDB >= count) {
              break;
            }

            await dbQuestion.increment('usageCount');
            
            usedQuestionIds.add(questionId);
            
            questionsForCategory.push({
              question: dbQuestion.questionText,
              options: dbQuestion.options,
              correctAnswer: dbQuestion.correctAnswer,
              explanation: dbQuestion.explanation,
              category: topic,
              _id: questionId
            });

            addedFromDB++;
          }

          if (addedFromDB === 0) {
            console.error(`  ❌ No fallback questions available for ${topic}`);
          }
        }

        allQuestions.push(...questionsForCategory);
        
        const withIds = questionsForCategory.filter(q => q._id).length;
        console.log(`  ✅ Total for "${topic}": ${questionsForCategory.length} questions (${withIds} with IDs)\n`);

      } catch (error) {
        console.error(`  ❌ Error processing "${topic}":`, error.message);
      }
    }

    // Final summary
    console.log('========================================');
    console.log('📊 FINAL SUMMARY:');
    console.log(`   Total questions: ${allQuestions.length}`);
    console.log(`   Unique questions: ${usedQuestionIds.size}`);
    const questionsWithIds = allQuestions.filter(q => q._id).length;
    console.log(`   Questions with IDs: ${questionsWithIds}/${allQuestions.length}`);
    console.log(`   Questions without IDs: ${allQuestions.length - questionsWithIds}`);
    console.log('========================================\n');

    if (allQuestions.length === 0) {
      return res.status(503).json({
        success: false,
        message: 'AI service is currently overloaded. Please try again in a moment.'
      });
    }

    res.json({
      success: true,
      questions: allQuestions,
      message: `Successfully generated ${allQuestions.length} unique questions`
    });

  } catch (error) {
    console.error('❌ FATAL ERROR in generateTest:', error);
    console.error('Stack trace:', error.stack);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate test questions'
    });
  }
};