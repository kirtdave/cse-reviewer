// src/utils/kpiUtils.js

/**
 * Generate KPI data from analytics data
 * Can be used in Analytics, Dashboard, or any other component
 */
export const generateKPIData = (data) => {
  return [
    { 
      title: "Accuracy", 
      value: `${data?.accuracy || 0}%`, 
      percent: data?.accuracy || 0, 
      icon: "fa-bullseye", 
      note: "Overall test accuracy", 
      gradient: "from-blue-500 to-cyan-500" 
    },
    { 
      title: "Speed", 
      value: `${data?.timeMetrics?.avgTimePerQuestion || 0} sec/q`, 
      percent: data?.timeMetrics?.speedScore || 0, 
      icon: "fa-bolt", 
      note: "Avg time per question", 
      gradient: "from-green-500 to-emerald-500" 
    },
    { 
      title: "Consistency", 
      value: `${data?.timeMetrics?.consistency || 0}%`, 
      percent: data?.timeMetrics?.consistency || 0, 
      icon: "fa-chart-line", 
      note: "Score stability", 
      gradient: "from-purple-500 to-pink-500" 
    },
    { 
      title: "Average Score", 
      value: `${data?.avgScore || 0}%`, 
      percent: data?.avgScore || 0, 
      icon: "fa-trophy", 
      note: `${data?.totalExams || 0} total exams`, 
      gradient: "from-orange-500 to-red-500" 
    },
  ];
};

/**
 * Get individual KPI by key
 */
export const getKPIByKey = (data, key) => {
  const kpis = generateKPIData(data);
  const keyMap = {
    accuracy: 0,
    speed: 1,
    consistency: 2,
    avgScore: 3
  };
  
  return kpis[keyMap[key]] || kpis[0];
};

/**
 * Get top KPIs for dashboard summary (first 3 or 4)
 */
export const getTopKPIs = (data, count = 4) => {
  const allKPIs = generateKPIData(data);
  return allKPIs.slice(0, count);
};

/**
 * Format KPI value for display
 */
export const formatKPIValue = (value, type = "percent") => {
  if (type === "percent") return `${value}%`;
  if (type === "time") return `${value} sec/q`;
  if (type === "count") return value.toString();
  return value;
};

// ======== ✨ NEW FUNCTIONS - ADD THESE ========

/**
 * ✨ NEW: Generate category breakdown data (all 7 categories)
 */
export const generateCategoryBreakdown = (data) => {
  if (!data?.sections) return [];

  const categories = [
    { name: 'Verbal Ability', key: 'verbal', icon: 'fa-spell-check', color: 'blue' },
    { name: 'Numerical Ability', key: 'numerical', icon: 'fa-calculator', color: 'green' },
    { name: 'Analytical Ability', key: 'analytical', icon: 'fa-brain', color: 'purple' },
    { name: 'General Knowledge', key: 'generalInfo', icon: 'fa-book', color: 'orange' },
    { name: 'Clerical Ability', key: 'clerical', icon: 'fa-file-pen', color: 'pink' },
    { name: 'Numerical Reasoning', key: 'numericalReasoning', icon: 'fa-chart-line', color: 'cyan' },
    { name: 'Philippine Constitution', key: 'constitution', icon: 'fa-gavel', color: 'red' }
  ];

  return categories
    .map(cat => ({
      name: cat.name,
      score: data.sections[cat.key] || 0,
      icon: cat.icon,
      color: cat.color,
      status: (data.sections[cat.key] || 0) >= 75 ? 'strong' : 
              (data.sections[cat.key] || 0) >= 60 ? 'average' : 'weak'
    }))
    .filter(cat => cat.score > 0); // Only show categories with data
};

/**
 * ✨ NEW: Generate question type breakdown data
 */
export const generateQuestionTypeBreakdown = (data) => {
  if (!data?.questionTypes) return [];

  const types = [
    { name: 'Multiple Choice', key: 'multipleChoice', icon: 'fa-list-check', color: 'blue' },
    { name: 'Essay', key: 'essay', icon: 'fa-pen-to-square', color: 'purple' },
    { name: 'Situational', key: 'situational', icon: 'fa-sitemap', color: 'orange' }
  ];

  return types
    .map(type => ({
      name: type.name,
      score: data.questionTypes[type.key] || 0,
      icon: type.icon,
      color: type.color,
      status: (data.questionTypes[type.key] || 0) >= 75 ? 'strong' : 
              (data.questionTypes[type.key] || 0) >= 60 ? 'average' : 'weak'
    }))
    .filter(type => type.score > 0); // Only show types with data
};

/**
 * ✨ NEW: Calculate performance trends
 */
export const calculatePerformanceTrends = (data) => {
  if (!data?.trend || data.trend.length < 2) {
    return {
      direction: 'stable',
      change: 0,
      message: 'Not enough data to calculate trend'
    };
  }

  const recentScores = data.trend.slice(0, 3).map(t => t.score);
  const olderScores = data.trend.slice(-3).map(t => t.score);

  const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;

  const change = Math.round(recentAvg - olderAvg);

  return {
    direction: change > 5 ? 'improving' : change < -5 ? 'declining' : 'stable',
    change: Math.abs(change),
    message: change > 5 
      ? `Improving by ${change}% recently`
      : change < -5
      ? `Declining by ${Math.abs(change)}% recently`
      : 'Performance is stable'
  };
};