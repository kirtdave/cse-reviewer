// src/services/exportService.js

/**
 * Export test review in GATE-style test paper format
 * Similar to the image: "Q.1 - 30 Carry One Mark Each"
 */
export const exportAsTestPaper = (testData) => {
  const { name, questions, userAnswers, correctAnswers, score, totalQuestions, accuracy, timeSpent } = testData;
  
  // Generate test paper content
  let content = '';
  
  // Header
  content += '═══════════════════════════════════════════════════════\n';
  content += `                    ${name.toUpperCase()}\n`;
  content += '                    TEST REVIEW REPORT\n';
  content += '═══════════════════════════════════════════════════════\n\n';
  
  // Summary
  content += `Generated: ${new Date().toLocaleString()}\n`;
  content += `Score: ${score}/${totalQuestions} (${accuracy}%)\n`;
  content += `Time Spent: ${timeSpent} minutes\n`;
  content += `Status: ${accuracy >= 70 ? 'PASSED ✓' : 'FAILED ✗'}\n`;
  content += '\n═══════════════════════════════════════════════════════\n\n';
  
  // Group questions by category
  const categorizedQuestions = {};
  questions.forEach((q, idx) => {
    const category = q.category || 'General';
    if (!categorizedQuestions[category]) {
      categorizedQuestions[category] = [];
    }
    categorizedQuestions[category].push({ question: q, index: idx });
  });
  
  // Print questions by category
  Object.entries(categorizedQuestions).forEach(([category, items]) => {
    content += `\n${category.toUpperCase()} - ${items.length} Question${items.length > 1 ? 's' : ''}\n`;
    content += '─────────────────────────────────────────────────────\n\n';
    
    items.forEach(({ question, index }) => {
      const userAnswer = userAnswers[index];
      const correctAnswer = correctAnswers[index];
      const isCorrect = userAnswer === correctAnswer && userAnswer !== null;
      const isUnanswered = userAnswer === null || userAnswer === undefined;
      
      // Question number and text
      content += `Q.${index + 1} ${question.question}\n\n`;
      
      // Options with labels
      const optionLabels = ['(A)', '(B)', '(C)', '(D)', '(E)', '(F)'];
      question.options.forEach((option, optIdx) => {
        let marker = '   ';
        
        // Mark user's answer
        if (userAnswer === optIdx) {
          marker = isCorrect ? ' ✓ ' : ' ✗ ';
        }
        // Mark correct answer if different from user's
        if (correctAnswer === optIdx && !isCorrect) {
          marker = ' → ';
        }
        
        content += `    ${marker}${optionLabels[optIdx]} ${option}\n`;
      });
      
      // Result indicator
      content += '\n';
      if (isUnanswered) {
        content += '    ⚠ NOT ANSWERED\n';
      } else if (isCorrect) {
        content += '    ✓ CORRECT\n';
      } else {
        content += `    ✗ WRONG - Correct answer: ${optionLabels[correctAnswer]}\n`;
      }
      
      // Explanation
      if (question.explanation) {
        content += `\n    💡 Explanation:\n`;
        content += `    ${question.explanation.replace(/\n/g, '\n    ')}\n`;
      }
      
      content += '\n─────────────────────────────────────────────────────\n\n';
    });
  });
  
  // Footer with statistics
  content += '\n═══════════════════════════════════════════════════════\n';
  content += '                    DETAILED STATISTICS\n';
  content += '═══════════════════════════════════════════════════════\n\n';
  
  const correctCount = userAnswers.filter((ans, idx) => ans === correctAnswers[idx] && ans !== null).length;
  const wrongCount = userAnswers.filter((ans, idx) => ans !== correctAnswers[idx] && ans !== null).length;
  const unansweredCount = userAnswers.filter(ans => ans === null || ans === undefined).length;
  
  content += `Total Questions:    ${totalQuestions}\n`;
  content += `Correct Answers:    ${correctCount} ✓\n`;
  content += `Wrong Answers:      ${wrongCount} ✗\n`;
  content += `Not Answered:       ${unansweredCount} ⚠\n`;
  content += `Accuracy:           ${accuracy}%\n`;
  content += `Time Spent:         ${timeSpent} minutes\n`;
  content += `Final Result:       ${accuracy >= 70 ? 'PASSED' : 'FAILED'}\n`;
  
  // Category-wise breakdown
  content += '\n\nCATEGORY-WISE PERFORMANCE:\n';
  content += '─────────────────────────────────────────────────────\n';
  
  Object.entries(categorizedQuestions).forEach(([category, items]) => {
    const categoryCorrect = items.filter(({ index }) => 
      userAnswers[index] === correctAnswers[index] && userAnswers[index] !== null
    ).length;
    const categoryAccuracy = Math.round((categoryCorrect / items.length) * 100);
    
    content += `${category.padEnd(25)} ${categoryCorrect}/${items.length} (${categoryAccuracy}%)\n`;
  });
  
  content += '\n═══════════════════════════════════════════════════════\n';
  content += '             End of Test Review Report\n';
  content += '           Generated by CSE Reviewer App\n';
  content += '═══════════════════════════════════════════════════════\n';
  
  return content;
};

/**
 * Download test paper as text file
 */
export const downloadTestPaper = (testData) => {
  const content = exportAsTestPaper(testData);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${testData.name.replace(/\s+/g, '_')}_TestPaper.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Print test paper (formatted for printing)
 */
export const printTestPaper = (testData) => {
  const content = exportAsTestPaper(testData);
  
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${testData.name} - Test Review</title>
      <style>
        @page {
          size: A4;
          margin: 2cm;
        }
        body {
          font-family: 'Courier New', monospace;
          font-size: 12pt;
          line-height: 1.6;
          color: #000;
          background: #fff;
          white-space: pre-wrap;
          max-width: 21cm;
          margin: 0 auto;
          padding: 1cm;
        }
        @media print {
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>${content}</body>
    </html>
  `);
  printWindow.document.close();
  
  // Wait for content to load then print
  printWindow.onload = () => {
    printWindow.print();
  };
};

/**
 * Copy test paper to clipboard
 */
export const copyTestPaperToClipboard = async (testData) => {
  const content = exportAsTestPaper(testData);
  
  try {
    await navigator.clipboard.writeText(content);
    return { success: true, message: 'Test paper copied to clipboard!' };
  } catch (error) {
    console.error('Failed to copy:', error);
    return { success: false, message: 'Failed to copy to clipboard' };
  }
};