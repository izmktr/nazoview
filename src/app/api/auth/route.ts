import { NextRequest, NextResponse } from 'next/server';
import { validatePassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'パスワードが入力されていません' },
        { status: 400 }
      );
    }

    const isValid = validatePassword(password);

    if (isValid) {
      // セッションクッキーを設定
      const response = NextResponse.json({ success: true });
      response.cookies.set('authenticated', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24時間
      });
      return response;
    } else {
      return NextResponse.json(
        { error: 'パスワードが正しくありません' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: '認証エラーが発生しました' },
      { status: 500 }
    );
  }
}
