'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoLogging, setIsAutoLogging] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const router = useRouter();

  // 自動ログインを試行する関数
  const tryAutoLogin = async (savedPassword: string) => {
    setIsAutoLogging(true);
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: savedPassword }),
      });

      if (response.ok) {
        // 自動ログイン成功
        router.push('/dashboard');
        return true;
      } else {
        // パスワードが無効になった場合は保存されたパスワードを削除
        localStorage.removeItem('nazoview_password');
        localStorage.removeItem('nazoview_password_expiry');
        setPassword('');
        setRememberPassword(false);
        return false;
      }
    } catch {
      // ネットワークエラーの場合は自動ログインをスキップ
      return false;
    } finally {
      setIsAutoLogging(false);
    }
  };

  // コンポーネントマウント時に保存されたパスワードを読み込み
  useEffect(() => {
    const savedPassword = localStorage.getItem('nazoview_password');
    const passwordExpiry = localStorage.getItem('nazoview_password_expiry');
    
    if (savedPassword && passwordExpiry) {
      const now = new Date().getTime();
      if (now < parseInt(passwordExpiry)) {
        setPassword(savedPassword);
        setRememberPassword(true);
        
        // 保存されたパスワードで自動ログインを試行
        tryAutoLogin(savedPassword);
      } else {
        // 期限切れの場合は削除
        localStorage.removeItem('nazoview_password');
        localStorage.removeItem('nazoview_password_expiry');
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // パスワード変更時の処理
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    // パスワードが手動でクリアされた場合、記憶設定もリセット
    if (newPassword === '' && rememberPassword) {
      setRememberPassword(false);
      localStorage.removeItem('nazoview_password');
      localStorage.removeItem('nazoview_password_expiry');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        // ログイン成功時にパスワードを記憶する設定の場合は保存
        if (rememberPassword) {
          const expiryTime = new Date().getTime() + (7 * 24 * 60 * 60 * 1000); // 7日間
          localStorage.setItem('nazoview_password', password);
          localStorage.setItem('nazoview_password_expiry', expiryTime.toString());
        } else {
          // チェックボックスがオフの場合は保存されたパスワードを削除
          localStorage.removeItem('nazoview_password');
          localStorage.removeItem('nazoview_password_expiry');
        }
        
        router.push('/dashboard');
      } else {
        setError(data.error || 'ログインに失敗しました');
      }
    } catch {
      setError('ネットワークエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8 p-4 sm:p-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            謎解きイベント記録
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {isAutoLogging ? '自動ログイン中...' : 'ログインしてイベント記録を閲覧してください'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="password" className="sr-only">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="パスワードを入力してください"
              className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base sm:text-sm"
              disabled={isAutoLogging}
              required
            />
          </div>

          {/* パスワード記憶チェックボックス */}
          <div className="flex items-center">
            <input
              id="remember-password"
              type="checkbox"
              checked={rememberPassword}
              onChange={(e) => setRememberPassword(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isAutoLogging}
            />
            <label htmlFor="remember-password" className="ml-2 block text-sm text-gray-700">
              パスワードを7日間記憶する
            </label>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || isAutoLogging}
            className="w-full flex justify-center py-3 sm:py-2 px-4 border border-transparent rounded-md shadow-sm text-base sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAutoLogging ? '自動ログイン中...' : isLoading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  );
}
