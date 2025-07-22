import { NextRequest, NextResponse } from 'next/server';
import { getSingleEventByRowNumber } from '@/lib/sheets';
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

    // Google Sheets から特定の行のデータを直接取得
    const event = await getSingleEventByRowNumber(eventId);

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
