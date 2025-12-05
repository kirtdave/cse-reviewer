// components/TestSetup/Testsetup.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Testgreet from "./Testgreet";
import StepSelector from "./StepSelector";
import CategoryAndSettings from "./CategoryAndSettings";
import SummaryPanel from "./SummaryPanel";
import CustomTestSelector from "./CustomTestSelector";
import AdminTestTypeModal from "./AdminTestTypeModal"; // ✅ NEW
import AdminTestSelector from "./AdminTestSelector"; // ✅ NEW

import { generateNewTest } from "../../services/testAttemptService"; 
import { getAnalyticsData, calculateStrengthsWeaknesses } from "../../services/analyticsService";

const sampleQuestions = [
  { question: "What is the capital of the Philippines?", options: ["Cebu", "Davao", "Manila", "Baguio"], answer: 2, category: "Verbal Ability" },
  { question: "2 + 2 * 2 = ?", options: ["4", "6", "8", "10"], answer: 1, category: "Numerical Ability" },
  { question: "Which is a programming language?", options: ["HTML", "CSS", "JavaScript", "Photoshop"], answer: 2, category: "Verbal Ability" },
  { question: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: 3, category: "Verbal Ability" },
  { question: "Who wrote 'Noli Me Tangere'?", options: ["Andres Bonifacio", "Jose Rizal", "Emilio Aguinaldo", "Apolinario Mabini"], answer: 1, category: "Verbal Ability" },
];

// ✅ Printable PDF Generator Function
const generatePrintablePDF = async (questionsData, selectedType, timeLimit, categories) => {
  try {
    const selectedCategories = Object.entries(categories)
      .filter(([, v]) => v.checked)
      .map(([k, v]) => `${k} (${v.difficulty})`)
      .join(', ');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Test Questionnaire - ${selectedType}</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #6366f1;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 { color: #6366f1; margin: 0 0 10px 0; font-size: 28px; }
          .header .meta { color: #666; font-size: 14px; margin-top: 10px; }
          .instructions {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin-bottom: 30px;
            border-radius: 4px;
          }
          .instructions h3 { margin: 0 0 10px 0; color: #d97706; font-size: 16px; }
          .instructions ul { margin: 0; padding-left: 20px; }
          .instructions li { margin-bottom: 5px; font-size: 13px; }
          .question-block {
            margin-bottom: 35px;
            page-break-inside: avoid;
            border-left: 4px solid #e5e7eb;
            padding-left: 15px;
          }
          .question-number {
            color: #6366f1;
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 8px;
          }
          .question-text {
            font-size: 15px;
            font-weight: 500;
            margin-bottom: 12px;
            color: #1f2937;
          }
          .category-badge {
            display: inline-block;
            background: #e0e7ff;
            color: #6366f1;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 10px;
          }
          .options { margin: 15px 0; padding-left: 0; }
          .option {
            list-style: none;
            padding: 10px 15px;
            margin-bottom: 8px;
            background: #f9fafb;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            font-size: 14px;
          }
          .option-letter {
            font-weight: bold;
            color: #6366f1;
            margin-right: 8px;
          }
          .answer-space {
            margin-top: 15px;
            padding: 15px;
            background: #fff;
            border: 2px dashed #d1d5db;
            border-radius: 8px;
          }
          .answer-label { font-size: 13px; color: #6b7280; font-weight: 600; }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
          }
          .student-info {
            border: 2px solid #e5e7eb;
            padding: 20px;
            margin-bottom: 30px;
            border-radius: 8px;
            background: #f9fafb;
          }
          .student-info .field { margin-bottom: 15px; }
          .student-info .field label {
            font-weight: bold;
            color: #4b5563;
            display: inline-block;
            width: 120px;
          }
          .student-info .field .line {
            display: inline-block;
            border-bottom: 1px solid #9ca3af;
            width: 300px;
            margin-left: 10px;
          }
          @media print {
            body { padding: 0; }
            .question-block { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📝 Test Questionnaire</h1>
          <div class="meta">
            <strong>Test Type:</strong> ${selectedType}<br>
            <strong>Time Limit:</strong> ${timeLimit} minutes<br>
            <strong>Categories:</strong> ${selectedCategories || 'All Categories'}<br>
            <strong>Total Questions:</strong> ${questionsData.length}
          </div>
        </div>

        <div class="student-info">
          <div class="field"><label>Name:</label><span class="line"></span></div>
          <div class="field"><label>Date:</label><span class="line"></span></div>
          <div class="field"><label>Section:</label><span class="line"></span></div>
        </div>

        <div class="instructions">
          <h3>⚠️ Instructions</h3>
          <ul>
            <li>Read each question carefully before answering</li>
            <li>Choose the best answer from the options provided</li>
            <li>Write your answer clearly in the space provided</li>
            <li>You have <strong>${timeLimit} minutes</strong> to complete this test</li>
            <li>Use pencil or pen with black or blue ink</li>
            <li>Do not make any stray marks on this questionnaire</li>
          </ul>
        </div>

        ${questionsData.map((q, idx) => `
          <div class="question-block">
            <div class="question-number">Question ${idx + 1} of ${questionsData.length}</div>
            <div class="category-badge">${q.category || 'General'}</div>
            <div class="question-text">${q.question}</div>
            <ul class="options">
              ${q.options.map((opt, optIdx) => `
                <li class="option">
                  <span class="option-letter">${String.fromCharCode(65 + optIdx)}.</span>
                  ${opt}
                </li>
              `).join('')}
            </ul>
            <div class="answer-space">
              <span class="answer-label">Your Answer:</span> __________
            </div>
          </div>
        `).join('')}

        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p><strong>Good luck! 🍀</strong></p>
          <p style="margin-top: 20px; font-size: 10px; color: #6b7280;">
            To print: Open this file in your browser and press Ctrl+P (Windows) or Cmd+P (Mac).<br>
            You can also save as PDF by selecting "Save as PDF" in the print dialog.
          </p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `questionnaire-${selectedType.replace(/\s+/g, '-')}-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    return true;
  } catch (error) {
    console.error('Error generating printable questionnaire:', error);
    return false;
  }
};

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
  
  // ✅ NEW: Admin test modals
  const [showAdminTestTypeModal, setShowAdminTestTypeModal] = useState(false);
  const [showAdminTestSelector, setShowAdminTestSelector] = useState(false);
  const [selectedAdminTestType, setSelectedAdminTestType] = useState(null);
  
  const [error, setError] = useState("");
  const [categories, setCategories] = useState({
    "Verbal Ability": { checked: false, difficulty: "Easy" },
    "Numerical Ability": { checked: false, difficulty: "Easy" },
    "Analytical Ability": { checked: false, difficulty: "Easy" },
    "General Knowledge": { checked: false, difficulty: "Easy" },
    "Clerical Ability": { checked: false, difficulty: "Easy" },
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
    
    if (printExam && allQuestions.length > 0) {
      console.log('📄 Generating printable questionnaire...');
      const pdfSuccess = await generatePrintablePDF(
        allQuestions, 
        type, 
        timeLimit, 
        categories
      );
      
      if (pdfSuccess) {
        console.log('✅ Questionnaire downloaded successfully!');
        setError("✅ Questionnaire downloaded! Check your downloads folder.");
        await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        console.warn('⚠️ Failed to generate questionnaire');
        setError("⚠️ Failed to generate questionnaire, but continuing with test...");
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
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
    const TOTAL_MOCK_QUESTIONS = 180;
    let categoriesToGenerate = [];

    const ALL_CATEGORIES = [
      "Verbal Ability",
      "Numerical Ability",
      "Analytical Ability",
      "General Knowledge",
      "Clerical Ability",
      "Philippine Constitution"
    ];

    console.log('🎯 Mock Exam: Using ALL 6 categories for 180-question CSE simulation');

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
    console.log(`🎯 Adaptive difficulty: ${adaptiveDifficulty} (avg score: ${analyticsData?.avgScore || 0})`);

    if (weakestSection && weakestSection.value > 0 && weakestSection.value < 75 && ALL_CATEGORIES.includes(weakestSection.label)) {
      console.log(`📊 Weakest section: ${weakestSection.label} (${weakestSection.value}%)`);
      
      const numWeakQuestions = Math.round(TOTAL_MOCK_QUESTIONS * 0.25);
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
      console.log("📊 Creating balanced 180-question mock exam");
      
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

    console.log('📝 Generating 180-question mock exam:', categoriesToGenerate);

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

  // ✅ NEW: Handle admin test selection
  const handleAdminTestTypeSelect = (testType) => {
    console.log('🎯 Selected admin test type:', testType);
    setSelectedAdminTestType(testType);
    setShowAdminTestSelector(true);
  };

  // ✅ NEW: Handle admin test selection
  const handleAdminTestSelect = (adminTest) => {
    console.log('🎯 Loading admin test:', adminTest);
    
    const allQuestions = [];
    const categories = new Set();
    
    if (adminTest.sets && Array.isArray(adminTest.sets)) {
      adminTest.sets.forEach(set => {
        if (set.questions && Array.isArray(set.questions)) {
          set.questions.forEach(q => {
            const convertedQuestion = {
              question: q.question,
              options: q.options,
              answer: convertLetterToIndex(q.correctAnswer),
              category: q.category || "Admin",
              explanation: q.explanation || "No explanation provided",
              _id: q._id || `admin_${Date.now()}_${Math.random()}`
            };
            
            allQuestions.push(convertedQuestion);
            categories.add(q.category || "Admin");
          });
        }
      });
    }
    
    console.log(`✅ Loaded ${allQuestions.length} questions from admin test`);
    
    if (allQuestions.length === 0) {
      setError("This admin test has no questions.");
      return;
    }
    
    navigate("/actualtest", {
      state: {
        selectedType: "Admin",
        timeLimit: adminTest.timeLimit || parseInt(timeLimit),
        categories: Array.from(categories),
        questions: allQuestions,
        theme,
        isMockExam: adminTest.testType === 'Mock',
        adminTestTitle: adminTest.title,
        adminTestType: adminTest.testType
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
      // ✅ NEW: Show admin test type modal
      setShowAdminTestTypeModal(true);
    }
  };

  const isDark = theme === "dark";

  return (
    <main className={`${isDark ? "text-gray-100" : "text-gray-900"} transition-colors duration-500 relative overflow-hidden`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(63,167,214,0.08)_1px,_transparent_1px)] bg-[size:40px_40px]"
        />
      </div>

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
      
      <div className="relative z-10 p-6 lg:p-10 pb-32 lg:pb-10">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-6">

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-2 p-4 rounded-xl ${
                error.includes("✅") 
                  ? "bg-green-500/20 border-green-500/50" 
                  : error.includes("select at least one") 
                  ? "bg-red-500/20 border-red-500/50" 
                  : "bg-yellow-500/20 border-yellow-500/50"
              }`}
            >
              <AlertCircle className={`w-5 h-5 ${
                error.includes("✅") 
                  ? "text-green-500" 
                  : error.includes("select at least one") 
                  ? "text-red-500" 
                  : "text-yellow-500"
              }`} />
              <span className={`text-sm ${
                error.includes("✅") 
                  ? "text-green-500" 
                  : error.includes("select at least one") 
                  ? "text-red-500" 
                  : "text-yellow-500"
              }`}>{error}</span>
            </motion.div>
          )}

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
                printExam={printExam}
                handleStartExam={handleStartExam}
                isGenerating={isRegularExamGenerating}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ✅ Existing Custom Test Selector */}
      <CustomTestSelector
        theme={theme}
        isOpen={showCustomTestSelector}
        onClose={() => setShowCustomTestSelector(false)}
        onSelectTest={handleCustomTestSelect}
      />

      {/* ✅ NEW: Admin Test Type Modal */}
      <AdminTestTypeModal
        theme={theme}
        isOpen={showAdminTestTypeModal}
        onClose={() => setShowAdminTestTypeModal(false)}
        onSelectType={handleAdminTestTypeSelect}
      />

      {/* ✅ NEW: Admin Test Selector */}
      <AdminTestSelector
        theme={theme}
        isOpen={showAdminTestSelector}
        onClose={() => {
          setShowAdminTestSelector(false);
          setSelectedAdminTestType(null);
        }}
        onSelectTest={handleAdminTestSelect}
        testType={selectedAdminTestType}
      />
    </main>
  );
};

export default Testsetup;
