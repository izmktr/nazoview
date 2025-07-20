import { NextRequest, NextResponse } from 'next/server';
import { getSheetData, filterEvents, paginateEvents } from '@/lib/sheets';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const cookieStore = await cookies();
    const isAuthenticated = cookieStore.get('authenticated')?.value === 'true';
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // クエリパラメータを取得
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || undefined;
    const searchText = searchParams.get('searchText') || undefined;
    const contentSearch = searchParams.get('contentSearch') || undefined;
    const organization = searchParams.get('organization') || undefined;
    const page = parseInt(searchParams.get('page') || '1');

    // Google Sheets からデータ取得
    const allEvents = await getSheetData();

    // フィルタリング
    const filteredEvents = filterEvents(allEvents, {
      format,
      searchText,
      contentSearch,
      organization,
    });

    // ページネーション
    const paginatedResult = paginateEvents(filteredEvents, page, 30);

    // ユニークな形式一覧を取得（フィルタ用）
    const uniqueFormats = [...new Set(allEvents.map(event => event.format))].filter(Boolean);

    return NextResponse.json({
      ...paginatedResult,
      uniqueFormats,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'データの取得に失敗しました' },
      { status: 500 }
    );
  }
}
