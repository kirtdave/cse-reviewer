// ActualTest.jsx - WITH SUB-TOPIC SUPPORT FOR FOCUSED PRACTICE

import React, { useState, useEffect, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ThemeContext } from "../../components/aaGLOBAL/ThemeContext";
import { generateNewTest } from '../../services/testAttemptService';

// import local components
import Header from "./Header";
import QuestionsList from "./QuestionsList";
import SidebarPanel from "./SidebarPanel";
import SubmitModal from "./SubmitModal";

// sample questions (fallback if no AI questions)
const sampleQuestions = [
  {
    question: "What is the capital of the Philippines?",
    options: ["Cebu", "Davao", "Manila", "Baguio"],
    answer: 2,
    category: "Verbal Ability",
  },
  {
    question: "2 + 2 * 2 = ?",
    options: ["4", "6", "8", "10"],
    answer: 1,
    category: "Numerical Ability",
  },
  {
    question: "Which is a programming language?",
    options: ["HTML", "CSS", "JavaScript", "Photoshop"],
    answer: 2,
    category: "Verbal Ability",
  },
  {
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
    answer: 3,
    category: "Verbal Ability",
  },
  {
    question: "Who wrote 'Noli Me Tangere'?",
    options: ["Andres Bonifacio", "Jose Rizal", "Emilio Aguinaldo", "Apolinario Mabini"],
    answer: 1,
    category: "Verbal Ability",
  },
];

export default function ActualTest() {
  const { theme } = useContext(ThemeContext);
  const location = useLocation();
  const navState = location.state || {};
  
  // ✅ Detect scheduled practice mode
  const isScheduledPractice = navState.isScheduledPractice || false;
  const continuousGeneration = navState.continuousGeneration || false;
  const difficulty = navState.difficulty || "Normal";
  const scheduleType = navState.scheduleType || "";
  const subTopic = navState.subTopic || ""; // ✅ NEW: Get sub-topic filter
  
  // ✅ Use state for questions (so we can add more dynamically)
  const [questions, setQuestions] = useState(
    navState.questions && navState.questions.length > 0 
      ? navState.questions 
      : (isScheduledPractice ? [] : sampleQuestions)
  );
  
  const [isLoadingNextQuestion, setIsLoadingNextQuestion] = useState(false);
  
  // ✅ Prevent double-loading with ref
  const hasLoadedFirstQuestion = useRef(false);
  
  // ✅ Track asked questions to avoid repeats - NOW STORES QUESTION TEXT
  const askedQuestionsRef = useRef(new Set());
  
  // ✅ Generate unique session ID for this practice session
  const sessionIdRef = useRef(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const questionNumberRef = useRef(0);
  
  const timeLimit = navState.timeLimit || 30;
  const categories = navState.categories || ["Verbal Ability", "Numerical Ability"];
  const isMockExam = navState.isMockExam || false;
  const isDark = theme === "dark";

  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const initialSeconds = Math.max(1, Math.floor(timeLimit)) * 60;
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [submitted, setSubmitted] = useState(false);
  const [fadeQuestions, setFadeQuestions] = useState({});
  const [testStartTime] = useState(new Date());

  // ✅ Load first question only once
  useEffect(() => {
    if (isScheduledPractice && questions.length === 0 && !hasLoadedFirstQuestion.current) {
      hasLoadedFirstQuestion.current = true;
      loadNextQuestion();
    }
  }, []);

  // ✅ Function to load next question with SUB-TOPIC support
  const loadNextQuestion = async () => {
    if (!continuousGeneration) return;
    
    setIsLoadingNextQuestion(true);
    questionNumberRef.current += 1;
    
    try {
      // ✅ BUILD ARRAY OF QUESTION TEXTS TO AVOID
      const avoidQuestions = Array.from(askedQuestionsRef.current);
      
      console.log(`🔄 Loading question #${questionNumberRef.current}`);
      console.log(`📝 Sub-topic: "${subTopic}"`);
      console.log(`🚫 Avoiding ${avoidQuestions.length} previous questions`);
      
      const response = await generateNewTest({
        categories: [{ 
          topic: categories[0], 
          difficulty: difficulty, 
          count: 1,
          subTopic: subTopic // ✅ NEW: Pass sub-topic to backend
        }],
        // ✅ CRITICAL: Pass questions to avoid
        avoidQuestions: avoidQuestions,
        sessionId: sessionIdRef.current,
        questionNumber: questionNumberRef.current
      });
      
      console.log('✅ API Response:', response);
      
      if (response.success && response.questions && response.questions.length > 0) {
        const newQuestion = response.questions[0];
        
        // ✅ FIX: Convert options to array if it's an object
        let optionsArray = newQuestion.options;
        if (!Array.isArray(optionsArray)) {
          if (typeof optionsArray === 'object' && optionsArray !== null) {
            optionsArray = Object.values(optionsArray);
          } else {
            optionsArray = ["Option A", "Option B", "Option C", "Option D"];
          }
        }
        
        // ✅ FIX: Convert correctAnswer letter to index
        let answerIndex = newQuestion.answer;
        if (newQuestion.correctAnswer !== undefined) {
          if (typeof newQuestion.correctAnswer === 'string') {
            const letter = newQuestion.correctAnswer.toUpperCase();
            answerIndex = letter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
          } else if (typeof newQuestion.correctAnswer === 'number') {
            answerIndex = newQuestion.correctAnswer;
          }
        }
        
        const questionText = newQuestion.question || newQuestion.questionText || "Question text missing";
        
        // ✅ CHECK: Skip if we've already seen this exact question
        if (askedQuestionsRef.current.has(questionText)) {
          console.warn('⚠️ Received duplicate question from API, requesting another...');
          // Retry once
          setTimeout(() => loadNextQuestion(), 500);
          return;
        }
        
        // ✅ ADD to tracking set
        askedQuestionsRef.current.add(questionText);
        
        const formattedQuestion = {
          question: questionText,
          options: optionsArray,
          answer: answerIndex,
          category: newQuestion.category || categories[0],
          explanation: newQuestion.explanation || "No explanation provided",
          _id: newQuestion._id
        };
        
        console.log('✅ Adding unique question:', formattedQuestion.question.substring(0, 60) + '...');
        setQuestions(prev => [...prev, formattedQuestion]);
        
      } else {
        console.warn('⚠️ No question returned from API');
        // Use fallback but still track it
        const fallback = sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)];
        askedQuestionsRef.current.add(fallback.question);
        setQuestions(prev => [...prev, fallback]);
      }
    } catch (error) {
      console.error('❌ Failed to load next question:', error);
      // Use fallback but still track it
      const fallback = sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)];
      askedQuestionsRef.current.add(fallback.question);
      setQuestions(prev => [...prev, fallback]);
    } finally {
      setIsLoadingNextQuestion(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (submitted) return;
    setTimeLeft(initialSeconds);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted, initialSeconds]);

  // ✅ Handle select with auto-load for scheduled practice
  const handleSelect = (qIndex, optIndex) => {
    if (answers[qIndex] !== undefined || submitted) return;
    const correctIndex = questions[qIndex].answer;
    const isCorrect = optIndex === correctIndex;

    setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
    setResults((prev) => ({ ...prev, [qIndex]: isCorrect ? "correct" : "wrong" }));

    setTimeout(() => {
      setFadeQuestions((prev) => ({ ...prev, [qIndex]: true }));
    }, 1000);

    // ✅ Auto-load next question in scheduled practice mode
    if (continuousGeneration && !submitted) {
      setTimeout(() => {
        loadNextQuestion();
      }, 1500);
    }
  };

  const handleSubmit = () => {
    if (submitted) return;
    setSubmitted(true);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = questions.length > 0 ? (Object.keys(answers).length / questions.length) * 100 : 0;
  const correctCount = Object.values(results).filter((r) => r === "correct").length;
  const wrongCount = Object.values(results).filter((r) => r === "wrong").length;
  const remainingCount = questions.length - Object.keys(answers).length;
  const timeWarning = timeLeft <= initialSeconds * 0.33;

  return (
    <main className={`min-h-screen relative transition-colors duration-500 ${isDark ? "bg-gray-950" : "bg-gray-50"}`}>
      <div className="relative z-10">
        <Header
          isDark={isDark}
          sampleQuestionsCount={questions.length}
          categories={categories}
          minutes={minutes}
          seconds={seconds}
          timeWarning={timeWarning}
          submitted={submitted}
          onSubmit={handleSubmit}
          answersCount={Object.keys(answers).length}
          progress={progress}
          isScheduledPractice={isScheduledPractice}
          scheduleType={scheduleType}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <QuestionsList
                sampleQuestions={questions}
                answers={answers}
                results={results}
                fadeQuestions={fadeQuestions}
                isDark={isDark}
                onSelect={handleSelect}
                isLoadingNextQuestion={isLoadingNextQuestion}
              />
            </div>

            <div>
              <SidebarPanel
                isDark={isDark}
                correctCount={correctCount}
                wrongCount={wrongCount}
                remainingCount={remainingCount}
                sampleQuestions={questions}
                results={results}
              />
            </div>
          </div>
        </div>
      </div>

      <SubmitModal
        isOpen={submitted}
        isDark={isDark}
        correctCount={correctCount}
        total={questions.length}
        timeLimit={timeLimit}
        timeLeft={timeLeft}
        questions={questions}
        answers={answers}
        results={results}
        categories={categories}
        testStartTime={testStartTime}
        onClose={() => window.location.href = '/dashboard'}
        isMockExam={isMockExam}
      />
    </main>
  );
}