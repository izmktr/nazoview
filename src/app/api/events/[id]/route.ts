import { NextRequest, NextResponse } from 'next/server';
import { getRawSheetData } from '@/lib/sheets';
import { EventData } from '@/types';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const eventId = parseInt(resolvedParams.id);
    
    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: '無効なIDです' },
        { status: 400 }
      );
    }

    // Google Sheets からデータ取得（ソート前の元データ）
    const allEvents = await getRawSheetData();
    
    // originalIndexを使ってイベントを検索
    const event = allEvents.find((event: EventData) => event.originalIndex === eventId);

    if (!event) {
      return NextResponse.json(
        { error: 'イベントが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'データの取得に失敗しました' },
      { status: 500 }
    );
  }
}
