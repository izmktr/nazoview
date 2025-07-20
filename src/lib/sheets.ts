import { google } from 'googleapis';
import { EventData } from '@/types';

const sheets = google.sheets('v4');

// 参加日で降順にソートする関数
export function sortEventsByDate(events: EventData[]): EventData[] {
  return [...events].sort((a, b) => {
    // 参加日を日付として比較
    const dateA = new Date(a.participationDate);
    const dateB = new Date(b.participationDate);
    
    // 無効な日付は最後に配置
    if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
    if (isNaN(dateA.getTime())) return 1;
    if (isNaN(dateB.getTime())) return -1;
    
    // 降順ソート（新しい日付が先頭）
    return dateB.getTime() - dateA.getTime();
  });
}

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
    
    const events = dataRows.map((row, index): EventData => ({
      timestamp: row[0] || '',
      participationDate: row[1] || '',
      title: row[2] || '',
      organization: row[3] || '',
      format: row[4] || '',
      story: row[5] || '',
      memorableThings: row[6] || '',
      finalMystery: row[7] || '',
      originalIndex: index, // 元の配列でのインデックスを保存
    }));

    // 参加日で降順にソート
    return sortEventsByDate(events);
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw new Error('Failed to fetch sheet data');
  }
}

// ソートされていない元のデータを取得する関数
export async function getRawSheetData(): Promise<EventData[]> {
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
    
    return dataRows.map((row, index): EventData => ({
      timestamp: row[0] || '',
      participationDate: row[1] || '',
      title: row[2] || '',
      organization: row[3] || '',
      format: row[4] || '',
      story: row[5] || '',
      memorableThings: row[6] || '',
      finalMystery: row[7] || '',
      originalIndex: index, // 元の配列でのインデックスを保存
    }));
  } catch (error) {
    console.error('Error fetching raw sheet data:', error);
    throw new Error('Failed to fetch raw sheet data');
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

  // フィルター後も参加日で降順にソート
  return sortEventsByDate(filtered);
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
