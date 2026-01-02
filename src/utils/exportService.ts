import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { JournalData } from '../types/journal';
import { JournalEntry } from '../types/journalEntry';

export const exportService = {
  /**
   * Export all journal data as JSON file
   */
  async exportAsJSON(
    journalData: JournalData,
    journalEntries: JournalEntry[]
  ): Promise<void> {
    try {
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        journalData,
        journalEntries,
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const filename = `radiant-backup-${Date.now()}.json`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, jsonString);

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Save Radiant Backup',
          UTI: 'public.json',
        });
      } else {
        throw new Error('Sharing is not available on this device');
      }
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
    journalEntries: JournalEntry[]
  ): Promise<void> {
    try {
      // Generate HTML content for the journal
      const htmlContent = this.generateHTMLContent(journalData, journalEntries);

      const filename = `radiant-journal-${Date.now()}.html`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      await FileSystem.writeAsStringAsync(fileUri, htmlContent);

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/html',
          dialogTitle: 'Save Radiant Journal',
        });
      } else {
        throw new Error('Sharing is not available on this device');
      }
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
    journalEntries: JournalEntry[]
  ): string {
    const sortedEntries = [...journalEntries].sort(
      (a, b) => b.createdAt - a.createdAt
    );

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
    ${journalData.affirmations.map((aff) => `<div class="affirmation">${aff}</div>`).join('')}
  </div>
  ` : ''}

  ${journalData.goals.wealth || journalData.goals.business || journalData.goals.healthFitness || journalData.goals.personalBehavior ? `
  <div class="section">
    <h2>🎯 My Goals</h2>
    ${journalData.goals.wealth ? `<div class="goal"><span class="goal-label">Wealth & Abundance:</span> ${journalData.goals.wealth}</div>` : ''}
    ${journalData.goals.business ? `<div class="goal"><span class="goal-label">Business & Career:</span> ${journalData.goals.business}</div>` : ''}
    ${journalData.goals.healthFitness ? `<div class="goal"><span class="goal-label">Health & Fitness:</span> ${journalData.goals.healthFitness}</div>` : ''}
    ${journalData.goals.personalBehavior ? `<div class="goal"><span class="goal-label">Personal Growth:</span> ${journalData.goals.personalBehavior}</div>` : ''}
  </div>
  ` : ''}

  ${journalData.traits.length > 0 ? `
  <div class="section">
    <h2>🌟 Who I'm Becoming</h2>
    <ul>
      ${journalData.traits.map((trait) => `<li>${trait}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  ${journalData.standards.length > 0 ? `
  <div class="section">
    <h2>⚡ My Standards</h2>
    <ul>
      ${journalData.standards.map((standard) => `<li>${standard}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  ${journalData.morningRoutine ? `
  <div class="section">
    <h2>🌅 Morning Routine</h2>
    <p>${journalData.morningRoutine}</p>
  </div>
  ` : ''}

  ${journalData.eveningRoutine ? `
  <div class="section">
    <h2>🌙 Evening Routine</h2>
    <p>${journalData.eveningRoutine}</p>
  </div>
  ` : ''}

  <h2>📔 Journal Entries</h2>
  ${sortedEntries.length > 0 ? sortedEntries.map((entry) => `
    <div class="entry">
      <div class="entry-date">${new Date(entry.createdAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}</div>
      ${entry.mood ? `<div class="entry-mood">Mood: ${entry.mood}</div>` : ''}
      ${entry.gratitude.length > 0 ? `
        <h3>Grateful For:</h3>
        ${entry.gratitude.map((item) => `<div class="gratitude-item">${item}</div>`).join('')}
      ` : ''}
      ${entry.wins.length > 0 ? `
        <h3>Today's Wins:</h3>
        <ul>
          ${entry.wins.map((win) => `<li>${win}</li>`).join('')}
        </ul>
      ` : ''}
      ${entry.improvements.length > 0 ? `
        <h3>What I'll Improve:</h3>
        <ul>
          ${entry.improvements.map((imp) => `<li>${imp}</li>`).join('')}
        </ul>
      ` : ''}
    </div>
  `).join('') : '<p>No journal entries yet.</p>'}

  <div style="margin-top: 60px; text-align: center; color: #7F8C8D; font-size: 14px;">
    <p>Generated by Radiant - Your Self-Transcendence Journal</p>
  </div>
</body>
</html>
    `.trim();
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
