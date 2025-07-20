import { EventData } from '@/types';

export async function getSheetDataCSV(): Promise<EventData[]> {
  try {
    // Google SheetsのCSVエクスポートURL
    const csvUrl = `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID}/export?format=csv`;
    
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n');
    
    // ヘッダー行をスキップ
    const dataLines = lines.slice(1).filter(line => line.trim());
    
    return dataLines.map((line): EventData => {
      const columns = line.split(',').map(col => col.replace(/"/g, '').trim());
      
      return {
        timestamp: columns[0] || '',
        participationDate: columns[1] || '',
        title: columns[2] || '',
        organization: columns[3] || '',
        format: columns[4] || '',
        story: columns[5] || '',
        memorableThings: columns[6] || '',
        finalMystery: columns[7] || '',
      };
    });
  } catch (error) {
    console.error('Error fetching CSV data:', error);
    throw new Error('Failed to fetch CSV data');
  }
}
