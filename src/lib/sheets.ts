import { google } from 'googleapis';
import { EventData } from '@/types';

const sheets = google.sheets('v4');

export async function getSheetData(): Promise<EventData[]> {
  try {
    const response = await sheets.spreadsheets.values.get({
      auth: process.env.GOOGLE_SHEETS_API_KEY,
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'A:H', // A列からH列まで（8項目）
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    // ヘッダー行をスキップ
    const dataRows = rows.slice(1);
    
    return dataRows.map((row): EventData => ({
      timestamp: row[0] || '',
      participationDate: row[1] || '',
      title: row[2] || '',
      organization: row[3] || '',
      format: row[4] || '',
      story: row[5] || '',
      memorableThings: row[6] || '',
      finalMystery: row[7] || '',
    }));
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw new Error('Failed to fetch sheet data');
  }
}

export function filterEvents(events: EventData[], filters: {
  format?: string;
  searchText?: string;
  contentSearch?: string;
  organization?: string;
}): EventData[] {
  let filtered = [...events];

  if (filters.format) {
    filtered = filtered.filter(event => event.format === filters.format);
  }

  if (filters.organization) {
    filtered = filtered.filter(event => event.organization === filters.organization);
  }

  if (filters.searchText) {
    const searchLower = filters.searchText.toLowerCase();
    filtered = filtered.filter(event => 
      event.title.toLowerCase().includes(searchLower) ||
      event.organization.toLowerCase().includes(searchLower)
    );
  }

  if (filters.contentSearch) {
    const searchLower = filters.contentSearch.toLowerCase();
    filtered = filtered.filter(event => 
      event.story.toLowerCase().includes(searchLower) ||
      event.memorableThings.toLowerCase().includes(searchLower) ||
      event.finalMystery.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
}

export function paginateEvents(events: EventData[], page: number = 1, pageSize: number = 30) {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    events: events.slice(startIndex, endIndex),
    totalPages: Math.ceil(events.length / pageSize),
    currentPage: page,
    totalItems: events.length,
  };
}
