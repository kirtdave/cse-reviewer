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
        description: "Master vocabulary, grammar, reading comprehension, and paragraph organization",
        keyTopics: ["Vocabulary (Synonyms/Antonyms)", "Grammar & Correct Usage", "Paragraph Organization (Jumbled Sentences)", "Reading Comprehension", "Analogies (Prof Level)"],
        difficulty: "Medium",
        studyTime: "30-45 min/day"
      },
      strategies: [
        {
          title: "Paragraph Organization",
          icon: "📄",
          tips: [
            "Find the 'Independent Sentence' first (usually the topic sentence)",
            "Look for signal words (However, Therefore, Secondly)",
            "Group sentences by chronological order or cause-and-effect",
            "Check the flow of pronouns (Antecedent before Pronoun)",
            "Read the final arrangement to check for smoothness"
          ]
        },
        {
          title: "Vocabulary Building",
          icon: "📚",
          tips: [
            "Focus on high-frequency academic words",
            "Use context clues to determine meaning",
            "Master common prefixes (un-, mal-, bene-) and suffixes",
            "Practice distinguishing slight nuances between synonyms",
            "Review paired analogies (Part to Whole, Cause to Effect)"
          ]
        },
        {
          title: "Reading Comprehension",
          icon: "📖",
          tips: [
            "Read the questions FIRST before the passage",
            "Identify Main Idea vs. Supporting Details",
            "Watch out for absolute words like 'Always' or 'Never' (usually wrong)",
            "Do not use outside knowledge; answer ONLY based on the text",
            "Practice skimming for keywords"
          ]
        }
      ],
      resources: [
        { name: "Grammar Mastery", time: 15, difficulty: "Easy", description: "Subject-verb agreement and errors", subTopic: "subject-verb agreement, sentence correction, and error spotting" },
        { name: "Vocabulary & Analogies", time: 20, difficulty: "Normal", description: "Word relationships and meaning", subTopic: "synonyms, antonyms, and word analogies" },
        { name: "Paragraph Org.", time: 25, difficulty: "Hard", description: "Arranging jumbled sentences", subTopic: "paragraph organization and arranging jumbled sentences" },
        { name: "Reading Comp.", time: 30, difficulty: "Hard", description: "Analyzing passages", subTopic: "reading comprehension and identifying main ideas" }
      ]
    },
    "Numerical Ability": {
      overview: {
        title: "Numerical Ability Overview",
        description: "Master word problems, basic operations, and data interpretation",
        keyTopics: ["Basic Operations (PEMDAS)", "Word Problems (Age, Work, Mixture)", "Fractions, Decimals, Percents", "Ratio and Proportion", "Graph & Chart Analysis"],
        difficulty: "Medium-Hard",
        studyTime: "45-60 min/day"
      },
      strategies: [
        {
          title: "Word Problem Mastery",
          icon: "🧮",
          tips: [
            "Translate English words into Math equations (e.g., 'is' = '=')",
            "Memorize the Work Formula: 1/A + 1/B = 1/T",
            "Master the Distance Formula: D = R × T",
            "For Age problems, set up a 'Past-Present-Future' table",
            "Always check units (minutes vs hours)"
          ]
        },
        {
          title: "Speed Math",
          icon: "⚡",
          tips: [
            "Master converting fractions to decimals/percents (e.g., 1/8 = 12.5%)",
            "Use estimation for Multiple Choice questions",
            "Simplify fractions before multiplying",
            "Practice mental multiplication",
            "Work backwards from the answer choices"
          ]
        },
        {
          title: "Data Interpretation",
          icon: "📊",
          tips: [
            "Read the graph title and legends first",
            "Look for trends (increasing/decreasing) before calculating",
            "Watch out for 'Not' or 'Except' in questions",
            "Use the edge of your paper as a ruler for bar graphs",
            "Compare visual sizes for pie charts to estimate"
          ]
        }
      ],
      resources: [
        { name: "Basic Math & Fractions", time: 15, difficulty: "Easy", description: "PEMDAS, Fractions, Decimals", subTopic: "basic arithmetic, PEMDAS, fractions, and decimals" },
        { name: "Word Problems I", time: 25, difficulty: "Normal", description: "Age, Mixture, and Number problems", subTopic: "word problems involving age, mixtures, and numbers" },
        { name: "Word Problems II", time: 30, difficulty: "Hard", description: "Work, Distance, and Interest", subTopic: "work, distance, speed, and simple interest problems" },
        { name: "Graph Analysis", time: 20, difficulty: "Normal", description: "Charts and Data Interpretation", subTopic: "interpreting bar graphs, pie charts, and line graphs" }
      ]
    },
    "Analytical Ability": {
      overview: {
        title: "Analytical Ability Overview",
        description: "Develop logical reasoning and pattern recognition (Professional Level focus)",
        keyTopics: ["Word Association", "Identifying Assumptions", "Logic Puzzles", "Number & Letter Series", "Data Sufficiency"],
        difficulty: "Hard",
        studyTime: "40-60 min/day"
      },
      strategies: [
        {
          title: "Logic & Assumptions",
          icon: "🧠",
          tips: [
            "Distinguish between 'Fact' and 'Opinion'",
            "Identify the 'hidden premise' in arguments",
            "In syllogisms, draw Venn Diagrams (All A are B)",
            "Watch out for logical fallacies",
            "Accept the premise as true, even if it sounds weird"
          ]
        },
        {
          title: "Series & Patterns",
          icon: "🔍",
          tips: [
            "Check differences between adjacent numbers first",
            "Look for 'Prime Number' sequences",
            "Check for alternating patterns (skip one)",
            "Convert letters to numbers (A=1, B=2) for letter series",
            "Look for squares and cubes (4, 9, 16, 25...)"
          ]
        },
        {
          title: "Problem Solving",
          icon: "🧩",
          tips: [
            "For seating arrangements, draw the table",
            "Use elimination for 'Data Sufficiency' questions",
            "Look for relationships in 'Word Association' (synonyms, category, part-whole)",
            "Identify the 'odd one out' in groups",
            "Practice 'Blood Relation' family trees"
          ]
        }
      ],
      resources: [
        { name: "Logic & Syllogisms", time: 20, difficulty: "Easy", description: "Validating arguments", subTopic: "logic, syllogisms, and valid arguments" },
        { name: "Number Series", time: 25, difficulty: "Normal", description: "Finding the next number", subTopic: "number series and mathematical patterns" },
        { name: "Word Association", time: 20, difficulty: "Hard", description: "Finding related words", subTopic: "word association and identifying related concepts" },
        { name: "Assumption/Conclusion", time: 30, difficulty: "Hard", description: "Critical thinking", subTopic: "identifying assumptions and drawing conclusions" }
      ]
    },
    "Philippine Constitution": {
      overview: {
        title: "Philippine Constitution Overview",
        description: "Master the 1987 Constitution and Government structure (Organic Law)",
        keyTopics: ["Bill of Rights (Art. III)", "Duties of State & Citizens", "3 Branches of Govt", "Constitutional Commissions", "Citizenship & Suffrage"],
        difficulty: "Medium-Hard",
        studyTime: "30 min/day"
      },
      strategies: [
        {
          title: "Bill of Rights (Art. III)",
          icon: "⚖️",
          tips: [
            "Memorize the concept of 'Due Process'",
            "Understand 'Search and Seizure' laws (Warrants)",
            "Know the rights of the accused (Miranda Rights)",
            "Study Double Jeopardy exceptions",
            "Understand Eminent Domain (Govt taking property)"
          ]
        },
        {
          title: "Government Structure",
          icon: "🏛️",
          tips: [
            "Know qualifications for President, Senator, Congressman",
            "Understand the 'Checks and Balances' system",
            "Memorize the 3 Constitutional Commissions (COA, CSC, COMELEC)",
            "Learn who can declare Martial Law",
            "Study the succession line for President"
          ]
        },
        {
          title: "Citizenship",
          icon: "🇵🇭",
          tips: [
            "Distinguish Natural-Born vs Naturalized",
            "Understand how citizenship is lost or reacquired",
            "Know the residency requirements for voting",
            "Study Dual Citizenship laws",
            "Learn about the National Territory"
          ]
        }
      ],
      resources: [
        { name: "Bill of Rights", time: 25, difficulty: "Normal", description: "Civil and Political Rights", subTopic: "Bill of Rights (Article III) and civil liberties" },
        { name: "Govt Branches", time: 30, difficulty: "Hard", description: "Exec, Legis, Judiciary", subTopic: "three branches of government and their powers" },
        { name: "Const. Commissions", time: 20, difficulty: "Normal", description: "COA, CSC, COMELEC", subTopic: "Constitutional Commissions: COA, CSC, COMELEC" },
        { name: "Citizenship", time: 15, difficulty: "Easy", description: "Art. IV and Suffrage", subTopic: "Philippine citizenship and right to suffrage" }
      ]
    },
    "Clerical Ability": {
      overview: {
        title: "Clerical Ability Overview",
        description: "Focus on Filing, Spelling, and Speed (Sub-Professional Only)",
        keyTopics: ["Alphabetical Filing", "Numerical Filing", "Spelling", "Data Checking", "Office Procedures"],
        difficulty: "Easy-Medium",
        studyTime: "20-30 min/day"
      },
      strategies: [
        {
          title: "Filing Rules",
          icon: "📁",
          tips: [
            "Rule 1: Last Name, First Name, Middle Name",
            "Ignore hyphens in names",
            "Treat numbers as if spelled out (usually)",
            "File 'Nothing' before 'Something' (Brown vs Browne)",
            "Practice filing common Filipino names (De la Cruz, Delos Santos)"
          ]
        },
        {
          title: "Spelling & Checking",
          icon: "✅",
          tips: [
            "Spot errors in names and ID numbers quickly",
            "Check for transposed numbers (19 vs 91)",
            "Review commonly misspelled words (Privilege, Separate)",
            "Practice rapid visual comparison of two lists",
            "Don't rush—accuracy is worth more than speed here"
          ]
        },
        {
          title: "Office Procedures",
          icon: "🏢",
          tips: [
            "Know basic email etiquette",
            "Understand CC vs BCC",
            "Learn standard record management",
            "Familiarize with privacy laws",
            "Understand basic office hierarchy"
          ]
        }
      ],
      resources: [
        { name: "Alphabetical Filing", time: 20, difficulty: "Easy", description: "Sorting names correctly", subTopic: "alphabetical filing rules and name sorting" },
        { name: "Clerical Operations", time: 25, difficulty: "Normal", description: "Office procedures", subTopic: "clerical operations and office procedures" },
        { name: "Spelling Drill", time: 15, difficulty: "Easy", description: "Commonly misspelled words", subTopic: "English spelling and commonly misspelled words" },
        { name: "Data Checking", time: 30, difficulty: "Hard", description: "Spotting errors in lists", subTopic: "data checking and error spotting in lists" }
      ]
    },
    "General Knowledge": {
      overview: {
        title: "General Knowledge Overview",
        description: "Covers specific laws (RA 6713), Environment, and Peace (distinct from Constitution)",
        keyTopics: ["RA 6713 (Code of Conduct)", "Peace & Human Rights", "Environment Protection", "Current Events"],
        difficulty: "Easy-Medium",
        studyTime: "20-30 min/day"
      },
      strategies: [
        {
          title: "RA 6713 (Ethics)",
          icon: "📜",
          tips: [
            "Memorize the 8 Norms of Conduct",
            "Understand 'Conflict of Interest'",
            "Know the prohibited acts for public officials",
            "Study the rules on filing SALN",
            "Learn the duties of a public servant"
          ]
        },
        {
          title: "Environment & Peace",
          icon: "🌿",
          tips: [
            "Review the Clean Air Act & Clean Water Act",
            "Understand Ecological Solid Waste Management (RA 9003)",
            "Study basic Human Rights concepts",
            "Know the role of CHR (Commission on Human Rights)",
            "Be aware of indigenous people's rights"
          ]
        },
        {
          title: "Current Events",
          icon: "📰",
          tips: [
            "Know the current Heads of State",
            "Review major laws passed in the last 2 years",
            "Know the National Heroes and Symbols",
            "Be aware of major international events affecting PH",
            "Review recent Supreme Court landmark decisions"
          ]
        }
      ],
      resources: [
        { name: "RA 6713 Ethics", time: 25, difficulty: "Normal", description: "Code of Conduct", subTopic: "RA 6713 Code of Conduct and Ethical Standards" },
        { name: "Environmental Laws", time: 20, difficulty: "Normal", description: "Waste, Air, Water Acts", subTopic: "Philippine environmental laws and protection" },
        { name: "Peace & Human Rights", time: 15, difficulty: "Easy", description: "Basic Rights & Laws", subTopic: "peace education and human rights concepts" },
        { name: "Current Events", time: 15, difficulty: "Easy", description: "General Information", subTopic: "current events and general information" }
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