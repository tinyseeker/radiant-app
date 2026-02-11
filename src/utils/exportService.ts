import { File, Paths } from 'expo-file-system/next';
import * as Sharing from 'expo-sharing';
import { JournalData } from '../types/journal';
import { UserActivity } from '../types/activity';

// Helper function to escape HTML special characters
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export const exportService = {
  /**
   * Export all journal data as JSON file
   */
  async exportAsJSON(
    journalData: JournalData,
    activityData: UserActivity
  ): Promise<void> {
    try {
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        journalData,
        activityData,
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const filename = `radiant-backup-${Date.now()}.json`;

      // Use new File System API
      const file = new File(Paths.cache, filename);
      await file.create();
      await file.write(jsonString);

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/json',
          dialogTitle: 'Save Radiant Backup',
          UTI: 'public.json',
        });
      } else {
        throw new Error('Sharing is not available on this device');
      }

      // Clean up temporary file after sharing
      await file.delete();
    } catch (error) {
      console.error('Error exporting JSON:', error);
      throw error;
    }
  },

  /**
   * Export journal as PDF (text-based)
   * Note: For a more polished PDF, you'd use a library like react-native-pdf or expo-print
   */
  async exportAsPDF(
    journalData: JournalData,
    activityData: UserActivity
  ): Promise<void> {
    try {
      // Generate HTML content for the journal
      const htmlContent = this.generateHTMLContent(journalData, activityData);

      const filename = `radiant-journal-${Date.now()}.html`;

      // Use new File System API
      const file = new File(Paths.cache, filename);
      await file.create();
      await file.write(htmlContent);

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/html',
          dialogTitle: 'Save Radiant Journal',
        });
      } else {
        throw new Error('Sharing is not available on this device');
      }

      // Clean up temporary file after sharing
      await file.delete();
    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw error;
    }
  },

  /**
   * Generate HTML content for journal export
   */
  generateHTMLContent(
    journalData: JournalData,
    activityData: UserActivity
  ): string {
    try {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Radiant Journal</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      font-family: 'Quicksand', -apple-system, BlinkMacSystemFont, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background: linear-gradient(135deg, #F8F5FC 0%, #EDE8F5 50%, #E0DAF0 100%);
      color: #2E2654;
      min-height: 100vh;
    }
    .header {
      text-align: center;
      margin-bottom: 50px;
      padding: 40px 20px;
      background: linear-gradient(135deg, #2E2654 0%, #433B6B 50%, #7B68EE 100%);
      border-radius: 24px;
      box-shadow: 0 8px 32px rgba(123, 104, 238, 0.3);
    }
    h1 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      color: #FFFFFF;
      font-size: 48px;
      margin: 0 0 10px 0;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .export-date {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      font-weight: 500;
    }
    h2 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      color: #2E2654;
      font-size: 28px;
      font-weight: 600;
      margin: 40px 0 20px 0;
      padding-bottom: 12px;
      border-bottom: 2px solid #9B7ED9;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    h3 {
      font-family: 'Quicksand', sans-serif;
      color: #5D5680;
      font-size: 18px;
      font-weight: 600;
      margin: 20px 0 12px 0;
    }
    .section {
      background: #FFFFFF;
      border-radius: 16px;
      padding: 24px;
      margin: 20px 0;
      box-shadow: 0 4px 16px rgba(46, 38, 84, 0.08);
      border: 1px solid rgba(155, 126, 217, 0.1);
    }
    .affirmation {
      padding: 16px 20px;
      background: linear-gradient(135deg, #F8F5FC 0%, #FAF8FD 100%);
      border-left: 4px solid #7B68EE;
      border-radius: 0 12px 12px 0;
      margin: 12px 0;
      font-size: 16px;
      line-height: 1.6;
      font-style: italic;
      color: #2E2654;
    }
    .goal {
      margin: 16px 0;
      padding: 16px;
      background: #FAF8FD;
      border-radius: 12px;
    }
    .goal-label {
      font-weight: 600;
      color: #7B68EE;
      display: block;
      margin-bottom: 6px;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .goal-text {
      color: #2E2654;
      line-height: 1.6;
    }
    .trait-list, .standard-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      padding: 0;
      margin: 0;
      list-style: none;
    }
    .trait-item, .standard-item {
      background: linear-gradient(135deg, #7B68EE 0%, #9B7ED9 100%);
      color: #FFFFFF;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
    }
    .standard-item {
      background: linear-gradient(135deg, #5D5680 0%, #7B68EE 100%);
    }
    .routine-text {
      color: #5D5680;
      line-height: 1.8;
      white-space: pre-wrap;
      font-size: 15px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .stat-card {
      background: linear-gradient(135deg, #7B68EE 0%, #9B7ED9 100%);
      border-radius: 16px;
      padding: 20px;
      text-align: center;
      color: #FFFFFF;
    }
    .stat-value {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 36px;
      font-weight: 700;
      display: block;
      margin-bottom: 4px;
    }
    .stat-label {
      font-size: 12px;
      font-weight: 500;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .habit-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .habit-item {
      background: #EDE8F5;
      color: #5D5680;
      padding: 6px 14px;
      border-radius: 16px;
      font-size: 13px;
      font-weight: 500;
    }
    .reminder-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .reminder-item {
      padding: 12px 16px;
      background: #FAF8FD;
      border-radius: 8px;
      margin: 8px 0;
      color: #2E2654;
      border-left: 3px solid #9B7ED9;
    }
    .footer {
      margin-top: 60px;
      text-align: center;
      padding: 30px;
      background: linear-gradient(135deg, #2E2654 0%, #433B6B 100%);
      border-radius: 16px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
    }
    .footer strong {
      color: #FFFFFF;
    }
    @media print {
      body {
        background: white;
        padding: 20px;
      }
      .header {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .section, .entry {
        box-shadow: none;
        border: 1px solid #EDE8F5;
        break-inside: avoid;
      }
      .stat-card, .trait-item, .standard-item {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
    @media (max-width: 600px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
      h1 {
        font-size: 36px;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>My Radiant Journal</h1>
    <p class="export-date">Exported on ${new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}</p>
  </div>

  <h2>📊 My Progress</h2>
  <div class="section">
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-value">${activityData.streakData.currentStreak}</span>
        <span class="stat-label">Current Streak</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${activityData.streakData.longestStreak}</span>
        <span class="stat-label">Best Streak</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${activityData.streakData.totalCheckIns}</span>
        <span class="stat-label">Total Check-ins</span>
      </div>
    </div>
  </div>

  ${journalData.affirmations.length > 0 ? `
  <h2>💫 My Affirmations</h2>
  <div class="section">
    ${journalData.affirmations.map((aff) => `<div class="affirmation">${escapeHtml(aff)}</div>`).join('')}
  </div>
  ` : ''}

  ${journalData.goals.wealth || journalData.goals.business || journalData.goals.healthFitness || journalData.goals.personalBehavior ? `
  <h2>🎯 My Goals</h2>
  <div class="section">
    ${journalData.goals.wealth ? `<div class="goal"><span class="goal-label">💰 Wealth & Abundance</span><span class="goal-text">${escapeHtml(journalData.goals.wealth)}</span></div>` : ''}
    ${journalData.goals.business ? `<div class="goal"><span class="goal-label">💼 Business & Career</span><span class="goal-text">${escapeHtml(journalData.goals.business)}</span></div>` : ''}
    ${journalData.goals.healthFitness ? `<div class="goal"><span class="goal-label">💪 Health & Fitness</span><span class="goal-text">${escapeHtml(journalData.goals.healthFitness)}</span></div>` : ''}
    ${journalData.goals.personalBehavior ? `<div class="goal"><span class="goal-label">🌱 Personal Growth</span><span class="goal-text">${escapeHtml(journalData.goals.personalBehavior)}</span></div>` : ''}
  </div>
  ` : ''}

  ${journalData.traits.length > 0 ? `
  <h2>🌟 Who I'm Becoming</h2>
  <div class="section">
    <ul class="trait-list">
      ${journalData.traits.map((trait) => `<li class="trait-item">${escapeHtml(trait)}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  ${journalData.standards.length > 0 ? `
  <h2>⚡ My Standards</h2>
  <div class="section">
    <ul class="standard-list">
      ${journalData.standards.map((standard) => `<li class="standard-item">${escapeHtml(standard)}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  ${journalData.morningRoutine ? `
  <h2>🌅 Morning Routine</h2>
  <div class="section">
    <p class="routine-text">${escapeHtml(journalData.morningRoutine)}</p>
  </div>
  ` : ''}

  ${journalData.eveningRoutine ? `
  <h2>🌙 Evening Routine</h2>
  <div class="section">
    <p class="routine-text">${escapeHtml(journalData.eveningRoutine)}</p>
  </div>
  ` : ''}

  ${journalData.dailyHabits && journalData.dailyHabits.length > 0 ? `
  <h2>✅ Daily Habits</h2>
  <div class="section">
    <ul class="habit-list">
      ${journalData.dailyHabits.map((habit) => `<li class="habit-item">${escapeHtml(habit)}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  ${journalData.dailyReminders && journalData.dailyReminders.length > 0 ? `
  <h2>🔔 Daily Reminders</h2>
  <div class="section">
    <ul class="reminder-list">
      ${journalData.dailyReminders.map((reminder) => `<li class="reminder-item">${escapeHtml(reminder)}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  <div class="footer">
    <p>Generated by <strong>Radiant</strong></p>
    <p>Your Self-Transcendence Journal</p>
  </div>
</body>
</html>
    `.trim();
    } catch (error) {
      console.error('Error generating HTML:', error);
      throw new Error(`Failed to generate HTML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Get file size in human-readable format
   */
  getFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  },
};
