import { NextRequest, NextResponse } from 'next/server';
import { getSheetData } from '@/lib/sheets';
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

    // キャッシュから全データを取得（キャッシュヒット時は超高速）
    const allEvents = await getSheetData();
    
    // originalIndexでイベントを検索
    const event = allEvents.find(event => event.originalIndex === eventId);

    if (!event) {
      return NextResponse.json(
        { error: 'イベントが見つかりません' },
        { status: 404 }
      );
    }

    return new NextResponse(
      JSON.stringify(event),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          // 個別イベントも短時間キャッシュ
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'データの取得に失敗しました' },
      { status: 500 }
    );
  }
}
