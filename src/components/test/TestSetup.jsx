import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Testgreet from "./Testgreet";
import StepSelector from "./StepSelector";
import CategoryAndSettings from "./CategoryAndSettings";
import SummaryPanel from "./SummaryPanel";
import CustomTestSelector from "./CustomTestSelector";

import { generateNewTest } from "../../services/testAttemptService"; 
import { getAnalyticsData, calculateStrengthsWeaknesses } from "../../services/analyticsService";

const sampleQuestions = [
  { question: "What is the capital of the Philippines?", options: ["Cebu", "Davao", "Manila", "Baguio"], answer: 2, category: "Verbal Ability" },
  { question: "2 + 2 * 2 = ?", options: ["4", "6", "8", "10"], answer: 1, category: "Numerical Ability" },
  { question: "Which is a programming language?", options: ["HTML", "CSS", "JavaScript", "Photoshop"], answer: 2, category: "Verbal Ability" },
  { question: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: 3, category: "Verbal Ability" },
  { question: "Who wrote 'Noli Me Tangere'?", options: ["Andres Bonifacio", "Jose Rizal", "Emilio Aguinaldo", "Apolinario Mabini"], answer: 1, category: "Verbal Ability" },
];

const Testsetup = ({ theme = "dark" }) => {
  const navigate = useNavigate();

  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedType, setSelectedType] = useState("AI-Generated");
  const [timeLimit, setTimeLimit] = useState("180");
  const [printExam, setPrintExam] = useState(false);
  const [file, setFile] = useState(null);
  
  const [isMockExamGenerating, setIsMockExamGenerating] = useState(false);
  const [isRegularExamGenerating, setIsRegularExamGenerating] = useState(false);
  
  const [showCustomTestSelector, setShowCustomTestSelector] = useState(false);
  
  const [error, setError] = useState("");
  const [categories, setCategories] = useState({
    "Verbal Ability": { checked: false, difficulty: "Easy" },
    "Numerical Ability": { checked: false, difficulty: "Easy" },
    "Analytical Ability": { checked: false, difficulty: "Easy" },
    "General Knowledge": { checked: false, difficulty: "Easy" },
    "Clerical Ability": { checked: false, difficulty: "Easy" },
    "Numerical Reasoning": { checked: false, difficulty: "Easy" },
    "Philippine Constitution": { checked: false, difficulty: "Easy" },
  });

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await getAnalyticsData();
        setAnalyticsData(data);
      } catch (err) {
        console.error("Failed to load analytics data:", err);
      }
    };
    loadAnalytics();
  }, []);
  
  const generateQuestionsAndNavigate = async (categoriesToGenerate, type, isGeneratingStateSetter) => {
    if (categoriesToGenerate.length === 0) {
      setError("Please select at least one category.");
      return;
    }
    isGeneratingStateSetter(true);
    setError("");
    
    let allQuestions = [];
    
    try {
      const response = await generateNewTest({ categories: categoriesToGenerate });
      
      console.log("=== API RESPONSE ===");
      console.log("Success:", response.success);
      console.log("Questions count:", response.questions?.length);
      console.log("Sample question structure:", response.questions?.[0]);
      
      if (!response.success || !response.questions || response.questions.length === 0) {
        throw new Error(response.message || 'Failed to generate questions');
      }
      
      allQuestions = response.questions.map((q, index) => {
        try {
          let optionsArray = [];
          
          if (Array.isArray(q.options)) {
            optionsArray = q.options;
          } else if (typeof q.options === 'object' && q.options !== null) {
            optionsArray = Object.values(q.options);
          } else if (typeof q.options === 'string') {
            try {
              const parsed = JSON.parse(q.options);
              optionsArray = Array.isArray(parsed) ? parsed : Object.values(parsed);
            } catch {
              console.error(`Question ${index}: options is a string but not valid JSON`);
              optionsArray = [];
            }
          }
          
          let answerIndex = -1;
          
          if (q.correctAnswer !== undefined) {
            if (typeof q.correctAnswer === 'string') {
              answerIndex = optionsArray.findIndex(opt => 
                opt && typeof opt === 'string' && opt.trim().startsWith(q.correctAnswer.trim())
              );
              
              if (answerIndex === -1) {
                answerIndex = optionsArray.findIndex(opt => 
                  opt && typeof opt === 'string' && opt.trim() === q.correctAnswer.trim()
                );
              }
              
              if (answerIndex === -1 && q.correctAnswer.length === 1) {
                const letterIndex = q.correctAnswer.toUpperCase().charCodeAt(0) - 65;
                if (letterIndex >= 0 && letterIndex < optionsArray.length) {
                  answerIndex = letterIndex;
                }
              }
            } else if (typeof q.correctAnswer === 'number') {
              answerIndex = q.correctAnswer;
            }
          }
          
          if (answerIndex === -1 && q.answer !== undefined) {
            answerIndex = typeof q.answer === 'number' ? q.answer : parseInt(q.answer, 10);
          }
          
          if (answerIndex < 0 || answerIndex >= optionsArray.length) {
            console.warn(`Question ${index}: Invalid answer index (${answerIndex}). Defaulting to 0.`);
            answerIndex = 0;
          }
          
          return {
            question: q.question || "Question text missing", 
            options: optionsArray.length > 0 ? optionsArray : ["Option A", "Option B", "Option C", "Option D"],
            answer: answerIndex,
            category: q.category || "General", 
            explanation: q.explanation || "No explanation provided",
            _id: q._id  
          };
        } catch (err) {
          console.error(`Error processing question ${index}:`, err);
          return {
            question: q.question || "Error loading question",
            options: ["Option A", "Option B", "Option C", "Option D"],
            answer: 0,
            category: q.category || "General",
            explanation: "Error processing this question",
            _id: q._id
          };
        }
      });
      
      console.log("✅ Processed questions:", allQuestions.length);
      
    } catch (err) {
      console.error('Error generating questions:', err);
      allQuestions = sampleQuestions;
      setError("AI generation failed. Starting a sample test.");
    }
    
    isGeneratingStateSetter(false);
    navigate("/actualtest", {
      state: {
        selectedType: type, 
        timeLimit: parseInt(timeLimit),
        categories: categoriesToGenerate.map(c => c.topic),
        questions: allQuestions,
        theme,
        isMockExam: type === "AI-Mock Exam"
      }
    });
  };

  const handleStartMockExam = async () => {
    const TOTAL_MOCK_QUESTIONS = 70;
    let categoriesToGenerate = [];

    const ALL_CATEGORIES = [
      "Verbal Ability",
      "Numerical Ability",
      "Analytical Ability",
      "General Knowledge",
      "Clerical Ability",
      "Numerical Reasoning",
      "Philippine Constitution"
    ];

    console.log('🎯 Mock Exam: Using ALL 7 categories regardless of checkboxes');

    const strengthsAndWeaknesses = analyticsData ? calculateStrengthsWeaknesses(analyticsData.sections) : [];
    
    const weakestSection = strengthsAndWeaknesses.reduce(
      (min, section) => (section.value < min.value ? section : min),
      { label: "Balanced", value: 100 }
    );

    const getAdaptiveDifficulty = () => {
      if (!analyticsData?.avgScore) return "Normal";
      if (analyticsData.avgScore >= 85) return "Hard";
      if (analyticsData.avgScore >= 75) return "Normal";
      if (analyticsData.avgScore >= 65) return "Normal";
      return "Easy";
    };

    const adaptiveDifficulty = getAdaptiveDifficulty();
    console.log(`🎯 Adaptive difficulty set to: ${adaptiveDifficulty} (based on avg score: ${analyticsData?.avgScore || 0})`);

    if (weakestSection && weakestSection.value > 0 && weakestSection.value < 75 && ALL_CATEGORIES.includes(weakestSection.label)) {
      console.log(`📊 Weakest section identified: ${weakestSection.label} (${weakestSection.value}%)`);
      
      const numWeakQuestions = Math.round(TOTAL_MOCK_QUESTIONS * 0.4);
      const numOtherQuestions = TOTAL_MOCK_QUESTIONS - numWeakQuestions;

      categoriesToGenerate.push({
        topic: weakestSection.label,
        difficulty: adaptiveDifficulty,
        count: numWeakQuestions
      });

      const otherCategories = ALL_CATEGORIES.filter(cat => cat !== weakestSection.label);

      if (otherCategories.length > 0) {
        const questionsPerOtherCat = Math.floor(numOtherQuestions / otherCategories.length);
        const remainder = numOtherQuestions % otherCategories.length;
        
        otherCategories.forEach((cat, index) => {
          categoriesToGenerate.push({
            topic: cat,
            difficulty: adaptiveDifficulty,
            count: questionsPerOtherCat + (index < remainder ? 1 : 0)
          });
        });
      }
    } else {
      console.log("📊 Creating a balanced mock exam with ALL 7 categories.");
      
      const questionsPerCat = Math.floor(TOTAL_MOCK_QUESTIONS / ALL_CATEGORIES.length);
      const remainder = TOTAL_MOCK_QUESTIONS % ALL_CATEGORIES.length;
      
      ALL_CATEGORIES.forEach((cat, index) => {
        categoriesToGenerate.push({
          topic: cat,
          difficulty: adaptiveDifficulty,
          count: questionsPerCat + (index < remainder ? 1 : 0)
        });
      });
    }

    console.log('📝 Generating mock exam with adaptive difficulty:', categoriesToGenerate);

    await generateQuestionsAndNavigate(categoriesToGenerate, "AI-Mock Exam", setIsMockExamGenerating);
  };

  const handleCustomTestSelect = (customTest) => {
    console.log('🎯 Loading custom test:', customTest);
    
    const allQuestions = [];
    const categories = new Set();
    
    if (customTest.sets && Array.isArray(customTest.sets)) {
      customTest.sets.forEach(set => {
        if (set.questions && Array.isArray(set.questions)) {
          set.questions.forEach(q => {
            const convertedQuestion = {
              question: q.question,
              options: q.options,
              answer: convertLetterToIndex(q.correctAnswer),
              category: q.category || "Custom",
              explanation: q.explanation || "No explanation provided",
              _id: q._id || `custom_${Date.now()}_${Math.random()}`
            };
            
            allQuestions.push(convertedQuestion);
            categories.add(q.category || "Custom");
          });
        }
      });
    }
    
    console.log(`✅ Loaded ${allQuestions.length} questions from custom test`);
    
    if (allQuestions.length === 0) {
      setError("This custom test has no questions.");
      return;
    }
    
    navigate("/actualtest", {
      state: {
        selectedType: "Custom",
        timeLimit: customTest.timeLimit || parseInt(timeLimit),
        categories: Array.from(categories),
        questions: allQuestions,
        theme,
        isMockExam: false,
        customTestTitle: customTest.title
      }
    });
  };
  
  const convertLetterToIndex = (letter) => {
    if (typeof letter === 'number') return letter;
    if (typeof letter === 'string' && letter.length === 1) {
      const index = letter.toUpperCase().charCodeAt(0) - 65;
      return index >= 0 && index <= 3 ? index : 0;
    }
    return 0;
  };

  const handleStartExam = () => {
    if (selectedType === "AI-Generated") {
      const manualCategories = Object.entries(categories)
        .filter(([, v]) => v.checked)
        .map(([k, v]) => ({ topic: k, difficulty: v.difficulty, count: 5 }));
      
      if (manualCategories.length === 0) {
        setError("Please select at least one category.");
        return;
      }
      
      generateQuestionsAndNavigate(manualCategories, "AI-Generated", setIsRegularExamGenerating);
    } else if (selectedType === "Custom") {
      setShowCustomTestSelector(true);
    } else if (selectedType === "Admin") {
      setError("Admin questionnaires feature coming soon!");
    }
  };

  const isDark = theme === "dark";

  return (
    <main className={`${isDark ? "text-gray-100" : "text-gray-900"} transition-colors duration-500 relative overflow-hidden`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(63,167,214,0.08)_1px,_transparent_1px)] bg-[size:40px_40px]"
        />
      </div>

      {/* Mount animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Testgreet 
          theme={theme}
          onStartMockExam={handleStartMockExam}
          isGenerating={isMockExamGenerating}
        />
      </motion.div>
      
      <div className="relative z-10 p-6 lg:p-10">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-6">

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-2 p-4 rounded-xl ${error.includes("select at least one") ? "bg-red-500/20 border-red-500/50" : "bg-yellow-500/20 border-yellow-500/50"}`}
            >
              <AlertCircle className={`w-5 h-5 ${error.includes("select at least one") ? "text-red-500" : "text-yellow-500"}`} />
              <span className={`text-sm ${error.includes("select at least one") ? "text-red-500" : "text-yellow-500"}`}>{error}</span>
            </motion.div>
          )}

          {/* Staggered animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex flex-col lg:w-[75%] gap-6">
                <StepSelector
                  theme={theme}
                  selectedType={selectedType}
                  setSelectedType={setSelectedType}
                />
                <CategoryAndSettings
                  theme={theme}
                  categories={categories}
                  setCategories={setCategories}
                  timeLimit={timeLimit}
                  setTimeLimit={setTimeLimit}
                  printExam={printExam}
                  setPrintExam={setPrintExam}
                  file={file}
                  setFile={setFile}
                />
              </div>
              <SummaryPanel
                theme={theme}
                selectedType={selectedType}
                timeLimit={timeLimit}
                categories={categories}
                file={file}
                handleStartExam={handleStartExam}
                isGenerating={isRegularExamGenerating}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Custom Test Selector Modal */}
      <CustomTestSelector
        theme={theme}
        isOpen={showCustomTestSelector}
        onClose={() => setShowCustomTestSelector(false)}
        onSelectTest={handleCustomTestSelect}
      />
    </main>
  );
};

export default Testsetup;