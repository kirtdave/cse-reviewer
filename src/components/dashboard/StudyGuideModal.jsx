import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, CheckCircle, Clock, Target } from "lucide-react";

export function StudyGuideModal({ isOpen, onClose, theme = "light", category = "Verbal Ability" }) {
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // ALL GUIDE CONTENT - EXACT SAME DATA, JUST MOBILE STYLING
  const guides = {
    "Verbal Ability": {
      overview: {
        title: "Verbal Ability Overview",
        description: "Master reading comprehension, vocabulary, grammar, and verbal reasoning",
        keyTopics: ["Reading Comprehension", "Vocabulary Building", "Grammar Rules", "Synonyms & Antonyms", "Sentence Correction", "Analogies"],
        difficulty: "Medium",
        studyTime: "30-45 min/day"
      },
      strategies: [
        {
          title: "Reading Comprehension",
          icon: "📖",
          tips: [
            "Read the passage first, then questions - understand context before details",
            "Identify main ideas and supporting details as you read",
            "Practice skimming techniques for longer passages",
            "Focus on transition words (however, therefore, moreover)",
            "Eliminate obviously wrong answers first"
          ]
        },
        {
          title: "Vocabulary Building",
          icon: "📚",
          tips: [
            "Learn 10 new words daily with context sentences",
            "Use flashcards with synonyms and antonyms",
            "Read newspapers/articles to see words in context",
            "Practice word roots, prefixes, and suffixes",
            "Review words in groups by theme (emotions, business, etc.)"
          ]
        },
        {
          title: "Grammar Mastery",
          icon: "✍️",
          tips: [
            "Review subject-verb agreement rules thoroughly",
            "Master tense consistency in sentences",
            "Study common error types (pronoun reference, modifiers)",
            "Practice identifying sentence fragments and run-ons",
            "Learn idioms and common phrases"
          ]
        }
      ],
      resources: [
        { name: "Quick Warm-up", time: 10, difficulty: "Easy", description: "Basic grammar and simple vocabulary", subTopic: "basic grammar and simple vocabulary questions" },
        { name: "Reading Practice", time: 20, difficulty: "Normal", description: "Comprehension passages and context", subTopic: "reading comprehension passages with context clues" },
        { name: "Vocabulary Drill", time: 25, difficulty: "Normal", description: "Synonyms, antonyms, and word usage", subTopic: "synonyms, antonyms, and advanced vocabulary" },
        { name: "Grammar Master", time: 30, difficulty: "Hard", description: "Complex sentence structures", subTopic: "advanced grammar rules and sentence correction" }
      ]
    },
    "Numerical Ability": {
      overview: {
        title: "Numerical Ability Overview",
        description: "Master arithmetic, algebra, data interpretation, and problem-solving",
        keyTopics: ["Basic Arithmetic", "Percentages & Ratios", "Data Interpretation", "Number Series", "Simplification", "Time & Work Problems"],
        difficulty: "Medium-Hard",
        studyTime: "45-60 min/day"
      },
      strategies: [
        {
          title: "Speed Calculations",
          icon: "⚡",
          tips: [
            "Learn multiplication tables up to 20",
            "Master percentage shortcuts (10%, 25%, 50%)",
            "Practice mental math daily",
            "Use approximation for quick estimates",
            "Learn Vedic math tricks"
          ]
        },
        {
          title: "Problem-Solving Approach",
          icon: "🧮",
          tips: [
            "Read the problem twice before solving",
            "Identify what's given and what's asked",
            "Draw diagrams for complex problems",
            "Break complex problems into smaller steps",
            "Verify answers by working backwards"
          ]
        },
        {
          title: "Data Interpretation",
          icon: "📊",
          tips: [
            "Understand different chart types (bar, pie, line)",
            "Practice reading values quickly and accurately",
            "Learn to calculate percentages from charts",
            "Identify trends and patterns",
            "Focus on comparative analysis"
          ]
        }
      ],
      resources: [
        { name: "Math Fundamentals", time: 15, difficulty: "Easy", description: "Basic arithmetic operations", subTopic: "basic arithmetic like addition, subtraction, multiplication, and division" },
        { name: "Percentages & Ratios", time: 25, difficulty: "Normal", description: "Percentage calculations and ratios", subTopic: "percentage problems, ratios, and proportions" },
        { name: "Word Problems", time: 30, difficulty: "Normal", description: "Real-world application problems", subTopic: "word problems involving time, distance, work, and money" },
        { name: "Data Interpretation", time: 35, difficulty: "Hard", description: "Charts, graphs, and tables", subTopic: "data interpretation from charts, graphs, and tables" }
      ]
    },
    "Analytical Ability": {
      overview: {
        title: "Analytical Ability Overview",
        description: "Develop logical reasoning, pattern recognition, and critical thinking",
        keyTopics: ["Logical Reasoning", "Pattern Recognition", "Syllogisms", "Critical Thinking", "Puzzles & Arrangements", "Coding-Decoding"],
        difficulty: "Hard",
        studyTime: "40-60 min/day"
      },
      strategies: [
        {
          title: "Logical Reasoning",
          icon: "🧩",
          tips: [
            "Draw Venn diagrams for syllogisms",
            "Practice deductive reasoning daily",
            "Learn common logical fallacies",
            "Use elimination method systematically",
            "Time yourself to build speed"
          ]
        },
        {
          title: "Pattern Recognition",
          icon: "🔍",
          tips: [
            "Look for arithmetic/geometric progressions",
            "Identify odd-one-out patterns",
            "Practice number, letter, and figure series",
            "Learn common sequence types",
            "Work backwards from answer choices"
          ]
        },
        {
          title: "Critical Thinking",
          icon: "💭",
          tips: [
            "Analyze assumptions in arguments",
            "Evaluate cause and effect relationships",
            "Practice strengthening/weakening arguments",
            "Read editorials for critical analysis practice",
            "Question everything methodically"
          ]
        }
      ],
      resources: [
        { name: "Logic Basics", time: 20, difficulty: "Easy", description: "Introduction to logical reasoning", subTopic: "basic logical reasoning and simple syllogisms" },
        { name: "Pattern Practice", time: 25, difficulty: "Normal", description: "Number and letter sequences", subTopic: "number series, letter series, and pattern recognition" },
        { name: "Advanced Puzzles", time: 35, difficulty: "Hard", description: "Complex logical problems", subTopic: "complex puzzles, arrangements, and coding-decoding" },
        { name: "Quick Thinking", time: 15, difficulty: "Normal", description: "Fast-paced brain teasers", subTopic: "quick logical puzzles and brain teasers" }
      ]
    },
    "Philippine Constitution": {
      overview: {
        title: "Philippine Constitution Overview",
        description: "Master the 1987 Philippine Constitution, government structure, and constitutional law",
        keyTopics: ["Bill of Rights (Art. III)", "Three Branches of Government", "Suffrage & Elections", "National Territory", "Constitutional Amendments", "Local Government Code"],
        difficulty: "Medium-Hard",
        studyTime: "45-60 min/day"
      },
      strategies: [
        {
          title: "Memorization Techniques",
          icon: "📜",
          tips: [
            "Learn the Preamble by heart - it's frequently tested",
            "Create acronyms for the Bill of Rights articles",
            "Use flashcards for important constitutional provisions",
            "Study Article numbers with their main topics",
            "Focus on amendments and their ratification dates"
          ]
        },
        {
          title: "Constitutional Structure",
          icon: "🏛️",
          tips: [
            "Understand the three branches: Executive, Legislative, Judicial",
            "Learn the system of checks and balances",
            "Study qualifications for public offices",
            "Know the impeachment process step-by-step",
            "Memorize term limits for each position"
          ]
        },
        {
          title: "Bill of Rights Focus",
          icon: "⚖️",
          tips: [
            "Article III contains 22 sections - know them all",
            "Understand rights vs. privileges distinctions",
            "Study landmark Supreme Court cases",
            "Know exceptions to rights (e.g., warrantless arrests)",
            "Learn the writ of habeas corpus and amparo"
          ]
        }
      ],
      resources: [
        { name: "Constitution Basics", time: 20, difficulty: "Easy", description: "Preamble, National Territory, Declaration of Principles", subTopic: "Philippine Constitution preamble, national territory, and basic principles" },
        { name: "Bill of Rights", time: 30, difficulty: "Normal", description: "Article III - All 22 sections", subTopic: "Bill of Rights (Article III) - civil and political rights" },
        { name: "Government Structure", time: 35, difficulty: "Normal", description: "Executive, Legislative, Judicial branches", subTopic: "three branches of government, powers, and functions" },
        { name: "Advanced Topics", time: 40, difficulty: "Hard", description: "Amendments, Local Gov't, Constitutional Bodies", subTopic: "constitutional amendments, local government code, and constitutional commissions" }
      ]
    },
    "Clerical Ability": {
      overview: {
        title: "Clerical Ability Overview",
        description: "Master filing systems, office procedures, data organization, and clerical tasks",
        keyTopics: ["Alphabetical Filing", "Numerical Filing", "Name & Address Sorting", "Data Coding", "Office Procedures", "Document Management"],
        difficulty: "Easy-Medium",
        studyTime: "30-40 min/day"
      },
      strategies: [
        {
          title: "Filing Systems",
          icon: "📁",
          tips: [
            "Master alphabetical order rules (surname first)",
            "Learn numerical filing: straight, terminal, middle digit",
            "Practice with Filipino names (de, del, dela, etc.)",
            "Understand chronological filing principles",
            "Study geographic filing by province/city"
          ]
        },
        {
          title: "Speed & Accuracy",
          icon: "⚡",
          tips: [
            "Practice timed exercises daily",
            "Use finger to track items quickly",
            "Check answer twice before moving on",
            "Eliminate obviously wrong options first",
            "Don't rush - accuracy is more important"
          ]
        },
        {
          title: "Office Procedures",
          icon: "🏢",
          tips: [
            "Learn basic office correspondence formats",
            "Understand document routing procedures",
            "Study common office forms and their uses",
            "Know proper telephone etiquette",
            "Memorize standard filing codes"
          ]
        }
      ],
      resources: [
        { name: "Filing Basics", time: 15, difficulty: "Easy", description: "Alphabetical and numerical sorting", subTopic: "alphabetical filing and basic sorting techniques" },
        { name: "Name Sorting", time: 25, difficulty: "Normal", description: "Filipino names, prefixes, suffixes", subTopic: "sorting Filipino names with prefixes like de, del, dela, san, etc." },
        { name: "Data Coding", time: 30, difficulty: "Normal", description: "Code matching and error spotting", subTopic: "data coding, code matching, and error detection" },
        { name: "Speed Test", time: 20, difficulty: "Hard", description: "Rapid filing under time pressure", subTopic: "speed filing and rapid data organization" }
      ]
    },
    "Numerical Reasoning": {
      overview: {
        title: "Numerical Reasoning Overview",
        description: "Advanced numerical problem-solving, data analysis, and quantitative reasoning",
        keyTopics: ["Number Sequences", "Ratio & Proportion", "Data Sufficiency", "Logical Deduction", "Quantitative Comparisons", "Problem Solving"],
        difficulty: "Hard",
        studyTime: "50-60 min/day"
      },
      strategies: [
        {
          title: "Pattern Recognition",
          icon: "🔢",
          tips: [
            "Look for arithmetic progressions (+, -, ×, ÷)",
            "Check for geometric sequences (powers, squares)",
            "Identify alternating patterns",
            "Look for Fibonacci-type sequences",
            "Test with simple numbers first"
          ]
        },
        {
          title: "Data Analysis",
          icon: "📊",
          tips: [
            "Read all given information carefully",
            "Identify what's asked vs what's given",
            "Determine if data is sufficient",
            "Look for relationships between numbers",
            "Eliminate impossible answer choices"
          ]
        },
        {
          title: "Problem-Solving",
          icon: "🧮",
          tips: [
            "Break complex problems into steps",
            "Use logical reasoning, not just formulas",
            "Check if answer makes logical sense",
            "Practice mental math shortcuts",
            "Work backwards from answer choices"
          ]
        }
      ],
      resources: [
        { name: "Sequences", time: 20, difficulty: "Easy", description: "Number and pattern sequences", subTopic: "number sequences and pattern recognition" },
        { name: "Ratios & Proportions", time: 30, difficulty: "Normal", description: "Ratio problems and proportional reasoning", subTopic: "ratios, proportions, and comparative analysis" },
        { name: "Data Sufficiency", time: 35, difficulty: "Hard", description: "Logical deduction from data", subTopic: "data sufficiency and logical reasoning" },
        { name: "Advanced Problems", time: 40, difficulty: "Hard", description: "Complex quantitative reasoning", subTopic: "advanced numerical reasoning and quantitative comparisons" }
      ]
    },
    "General Knowledge": {
      overview: {
        title: "General Knowledge Overview",
        description: "Build awareness of current affairs, history, geography, and general science",
        keyTopics: ["Current Affairs", "Philippine History", "World Geography", "General Science", "Government & Politics", "Economy Basics"],
        difficulty: "Easy-Medium",
        studyTime: "30-40 min/day"
      },
      strategies: [
        {
          title: "Current Affairs",
          icon: "📰",
          tips: [
            "Read newspapers daily (at least headlines)",
            "Follow reliable news sources online",
            "Make notes of important events",
            "Focus on national and international news",
            "Review weekly current affairs summaries"
          ]
        },
        {
          title: "Retention Techniques",
          icon: "🧠",
          tips: [
            "Use mnemonics for facts and dates",
            "Create mind maps for related topics",
            "Review notes weekly to reinforce memory",
            "Connect new info to what you already know",
            "Teach concepts to others to solidify learning"
          ]
        },
        {
          title: "Focused Learning",
          icon: "🎯",
          tips: [
            "Focus on Philippines-specific knowledge",
            "Study government structure and functions",
            "Learn key historical dates and events",
            "Understand basic economic concepts",
            "Review science fundamentals regularly"
          ]
        }
      ],
      resources: [
        { name: "Current Events", time: 15, difficulty: "Easy", description: "Recent news and happenings", subTopic: "current affairs and recent news events" },
        { name: "Philippine History", time: 25, difficulty: "Normal", description: "Historical events and figures", subTopic: "Philippine history, heroes, and important events" },
        { name: "Geography Focus", time: 20, difficulty: "Normal", description: "World and Philippine geography", subTopic: "geography of the Philippines and world countries" },
        { name: "Science Basics", time: 30, difficulty: "Normal", description: "General science concepts", subTopic: "basic science concepts in biology, chemistry, and physics" }
      ]
    }
  };

  const currentGuide = guides[category] || guides["Verbal Ability"];
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'strategies', label: 'Strategies', icon: Target },
    { id: 'resources', label: 'Resources', icon: Clock }
  ];

  const handleResourceClick = (resource, e) => {
    e.stopPropagation();
    onClose();
    navigate('/actualtest', {
      state: {
        selectedType: "Scheduled Practice",
        timeLimit: resource.time,
        categories: [category],
        subTopic: resource.subTopic,
        questions: [],
        theme,
        isScheduledPractice: true,
        scheduleType: resource.name,
        difficulty: resource.difficulty,
        continuousGeneration: true
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-20 sm:pt-4 bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`${isDark ? "bg-gray-900" : "bg-white"} rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 max-w-4xl w-full shadow-2xl max-h-[85vh] overflow-hidden flex flex-col`}>
            <div className="flex items-center justify-between mb-4 sm:mb-5 lg:mb-6">
              <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 sm:w-5.5 sm:h-5.5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className={`text-base sm:text-lg lg:text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} truncate`}>{category} Study Guide</h3>
                  <p className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"} truncate`}>Comprehensive learning strategies</p>
                </div>
              </div>
              <button onClick={onClose} className={`p-1.5 sm:p-2 rounded-lg ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition-colors flex-shrink-0`}><X className="w-4 h-4 sm:w-5 sm:h-5" /></button>
            </div>

            <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-5 lg:mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all relative whitespace-nowrap ${activeTab === tab.id ? `${isDark ? "text-orange-400" : "text-orange-600"}` : `${isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-600 hover:text-gray-800"}`}`}>
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{tab.label}</span>
                    {activeTab === tab.id && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-500" />}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <div className={`p-4 sm:p-5 lg:p-6 rounded-lg lg:rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-50"} mb-4 sm:mb-5 lg:mb-6`}>
                      <h4 className={`text-sm sm:text-base lg:text-lg font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>{currentGuide.overview.title}</h4>
                      <p className={`text-xs sm:text-sm mb-3 sm:mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>{currentGuide.overview.description}</p>
                      <div className="flex gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm flex-wrap">
                        <div className={`px-2 py-1 sm:px-3 rounded-full ${isDark ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-700"}`}>📊 {currentGuide.overview.difficulty}</div>
                        <div className={`px-2 py-1 sm:px-3 rounded-full ${isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700"}`}>⏱️ {currentGuide.overview.studyTime}</div>
                      </div>
                    </div>
                    <h5 className={`text-xs sm:text-sm lg:text-md font-semibold mb-2 sm:mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>Key Topics to Master</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 lg:gap-3">
                      {currentGuide.overview.keyTopics.map((topic, i) => (
                        <div key={i} className={`flex items-center gap-2 p-2.5 sm:p-3 rounded-lg ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                          <span className={`text-xs sm:text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{topic}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                {activeTab === 'strategies' && (
                  <motion.div key="strategies" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3 sm:space-y-4 lg:space-y-6">
                    {currentGuide.strategies.map((strategy, i) => (
                      <div key={i} className={`p-4 sm:p-4.5 lg:p-5 rounded-lg lg:rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-50"} border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                        <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 mb-2.5 sm:mb-3 lg:mb-4">
                          <span className="text-2xl sm:text-2xl lg:text-3xl">{strategy.icon}</span>
                          <h5 className={`text-sm sm:text-base lg:text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{strategy.title}</h5>
                        </div>
                        <ul className="space-y-1.5 sm:space-y-2">
                          {strategy.tips.map((tip, j) => (
                            <li key={j} className="flex items-start gap-2">
                              <span className="text-orange-500 mt-0.5">•</span>
                              <span className={`text-xs sm:text-sm ${isDark ? "text-gray-300" : "text-gray-700"} leading-relaxed`}>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </motion.div>
                )}
                {activeTab === 'resources' && (
                  <motion.div key="resources" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <div className={`p-3 sm:p-3.5 lg:p-4 rounded-lg lg:rounded-xl ${isDark ? "bg-blue-500/10" : "bg-blue-50"} border ${isDark ? "border-blue-500/20" : "border-blue-200"} mb-4 sm:mb-5 lg:mb-6`}>
                      <p className={`text-xs sm:text-sm ${isDark ? "text-blue-300" : "text-blue-700"}`}>💡 <span className="font-semibold">Tip:</span> Each session focuses on different sub-topics. Choose based on what you need to practice!</p>
                    </div>
                    <div className="space-y-2 sm:space-y-2.5 lg:space-y-3">
                      {currentGuide.resources.map((resource, i) => (
                        <motion.div key={i} whileHover={{ scale: 1.002 }} onClick={(e) => handleResourceClick(resource, e)} className={`p-3 sm:p-3.5 lg:p-4 rounded-lg lg:rounded-xl ${isDark ? "bg-gray-800 hover:bg-gray-750" : "bg-gray-50 hover:bg-gray-100"} border ${isDark ? "border-gray-700" : "border-gray-200"} flex items-center justify-between hover:shadow-lg transition-all cursor-pointer group`}>
                          <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 flex-1 min-w-0">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h6 className={`font-semibold text-xs sm:text-sm lg:text-base ${isDark ? "text-white" : "text-gray-900"} truncate`}>{resource.name}</h6>
                              <p className={`text-[10px] sm:text-xs ${isDark ? "text-gray-400" : "text-gray-600"} mb-0.5 sm:mb-1 line-clamp-1`}>{resource.description}</p>
                              <p className={`text-[10px] sm:text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>⏱️ {resource.time} min • {resource.difficulty}</p>
                            </div>
                          </div>
                          <button className="hidden sm:block px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs lg:text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">Start →</button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-3 sm:mt-4 lg:mt-6 flex gap-2 sm:gap-3">
              <button onClick={onClose} className={`flex-1 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg lg:rounded-xl border-2 font-semibold transition-all ${isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-700 hover:bg-gray-100"}`}>Close</button>
              <button onClick={() => { onClose(); window.location.href = '/test'; }} className="flex-1 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg lg:rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:shadow-xl transition-all">View All Tests →</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}