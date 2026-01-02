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
      // Convert check-ins to array and sort by date
      const checkInDates = Object.keys(activityData.checkIns).sort().reverse();

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Radiant Journal</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background: linear-gradient(135deg, #FFF9F5 0%, #FFE8DC 100%);
      color: #2C3E50;
    }
    h1 {
      color: #FF6B9D;
      font-size: 42px;
      margin-bottom: 10px;
    }
    h2 {
      color: #FF9A76;
      border-bottom: 2px solid #FFB6A3;
      padding-bottom: 10px;
      margin-top: 40px;
    }
    h3 {
      color: #FF6B9D;
      margin-top: 30px;
    }
    .export-date {
      color: #7F8C8D;
      font-size: 14px;
      margin-bottom: 40px;
    }
    .section {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .affirmation {
      padding: 10px 0;
      border-left: 3px solid #FF9A76;
      padding-left: 15px;
      margin: 10px 0;
    }
    .goal {
      margin: 15px 0;
    }
    .goal-label {
      font-weight: 600;
      color: #FF6B9D;
    }
    .entry {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin: 15px 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .entry-date {
      color: #FF9A76;
      font-weight: 600;
      font-size: 18px;
      margin-bottom: 10px;
    }
    .entry-mood {
      display: inline-block;
      background: #FFE8DC;
      padding: 5px 15px;
      border-radius: 20px;
      margin: 10px 0;
      font-size: 14px;
    }
    .gratitude-item {
      margin: 8px 0;
      padding-left: 20px;
      position: relative;
    }
    .gratitude-item:before {
      content: "✨";
      position: absolute;
      left: 0;
    }
    ul {
      list-style: none;
      padding: 0;
    }
    li {
      margin: 8px 0;
    }
    @media print {
      body {
        background: white;
      }
      .section, .entry {
        box-shadow: none;
        border: 1px solid #E0E0E0;
      }
    }
  </style>
</head>
<body>
  <h1>✨ My Radiant Journal</h1>
  <p class="export-date">Exported on ${new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}</p>

  ${journalData.affirmations.length > 0 ? `
  <div class="section">
    <h2>💫 My Affirmations</h2>
    ${journalData.affirmations.map((aff) => `<div class="affirmation">${escapeHtml(aff)}</div>`).join('')}
  </div>
  ` : ''}

  ${journalData.goals.wealth || journalData.goals.business || journalData.goals.healthFitness || journalData.goals.personalBehavior ? `
  <div class="section">
    <h2>🎯 My Goals</h2>
    ${journalData.goals.wealth ? `<div class="goal"><span class="goal-label">Wealth & Abundance:</span> ${escapeHtml(journalData.goals.wealth)}</div>` : ''}
    ${journalData.goals.business ? `<div class="goal"><span class="goal-label">Business & Career:</span> ${escapeHtml(journalData.goals.business)}</div>` : ''}
    ${journalData.goals.healthFitness ? `<div class="goal"><span class="goal-label">Health & Fitness:</span> ${escapeHtml(journalData.goals.healthFitness)}</div>` : ''}
    ${journalData.goals.personalBehavior ? `<div class="goal"><span class="goal-label">Personal Growth:</span> ${escapeHtml(journalData.goals.personalBehavior)}</div>` : ''}
  </div>
  ` : ''}

  ${journalData.traits.length > 0 ? `
  <div class="section">
    <h2>🌟 Who I'm Becoming</h2>
    <ul>
      ${journalData.traits.map((trait) => `<li>${escapeHtml(trait)}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  ${journalData.standards.length > 0 ? `
  <div class="section">
    <h2>⚡ My Standards</h2>
    <ul>
      ${journalData.standards.map((standard) => `<li>${escapeHtml(standard)}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  ${journalData.morningRoutine ? `
  <div class="section">
    <h2>🌅 Morning Routine</h2>
    <p>${escapeHtml(journalData.morningRoutine)}</p>
  </div>
  ` : ''}

  ${journalData.eveningRoutine ? `
  <div class="section">
    <h2>🌙 Evening Routine</h2>
    <p>${escapeHtml(journalData.eveningRoutine)}</p>
  </div>
  ` : ''}

  <h2>📊 My Progress</h2>
  <div class="section">
    <div class="goal">
      <span class="goal-label">Current Streak:</span> ${activityData.streakData.currentStreak} days
    </div>
    <div class="goal">
      <span class="goal-label">Longest Streak:</span> ${activityData.streakData.longestStreak} days
    </div>
    <div class="goal">
      <span class="goal-label">Total Check-ins:</span> ${activityData.streakData.totalCheckIns} days
    </div>
  </div>

  <h2>📅 Check-in History</h2>
  ${checkInDates.length > 0 ? checkInDates.map((dateStr) => `
    <div class="entry">
      <div class="entry-date">${new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}</div>
      <div class="gratitude-item">Checked in at ${new Date(activityData.checkIns[dateStr].timestamp).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })}</div>
    </div>
  `).join('') : '<p>No check-ins yet.</p>'}

  <div style="margin-top: 60px; text-align: center; color: #7F8C8D; font-size: 14px;">
    <p>Generated by Radiant - Your Self-Transcendence Journal</p>
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
