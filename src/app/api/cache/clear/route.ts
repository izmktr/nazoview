import { NextRequest, NextResponse } from 'next/server';
import { clearCache } from '@/lib/sheets';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
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

    // キャッシュをクリア
    clearCache();

    return NextResponse.json({ 
      message: 'キャッシュが正常にクリアされました',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { error: 'キャッシュのクリアに失敗しました' },
      { status: 500 }
    );
  }
}
