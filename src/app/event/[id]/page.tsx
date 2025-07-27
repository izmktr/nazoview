'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LinkIcon } from '@heroicons/react/24/outline';
import { EventData } from '@/types';

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export default function EventPage({ params }: EventPageProps) {
  const router = useRouter();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eventId, setEventId] = useState<string>('');
  const [dashboardReturnURL, setDashboardReturnURL] = useState('/dashboard');

  // URLを検出する関数
  const extractUrls = (text: string): string[] => {
    if (!text) return [];
    const urlRegex = /https?:\/\/[^\s]+/gi;
    return text.match(urlRegex) || [];
  };

  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params;
      setEventId(resolvedParams.id);
    };
    initializeParams();
    
    // セッションストレージからダッシュボードの状態を復元
    const savedState = sessionStorage.getItem('dashboardState');
    if (savedState) {
      try {
        const { filters, currentPage } = JSON.parse(savedState);
        const params = new URLSearchParams();
        
        if (filters.format) params.set('format', filters.format);
        if (filters.searchText) params.set('searchText', filters.searchText);
        if (filters.contentSearch) params.set('contentSearch', filters.contentSearch);
        if (filters.organization) params.set('organization', filters.organization);
        if (currentPage > 1) params.set('page', currentPage.toString());
        
        const queryString = params.toString();
        const returnURL = queryString ? `/dashboard?${queryString}` : '/dashboard';
        setDashboardReturnURL(returnURL);
      } catch (e) {
        console.error('Failed to parse saved dashboard state:', e);
      }
    }
  }, [params]);

  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/');
            return;
          }
          if (response.status === 404) {
            setError('イベントが見つかりません');
            return;
          }
          throw new Error('データの取得に失敗しました');
        }

        const data: EventData = await response.json();
        setEvent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">データを読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <Link
            href={dashboardReturnURL}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 mb-4">イベントが見つかりません</div>
          <Link
            href={dashboardReturnURL}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ダッシュボードに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-3 sm:gap-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              イベント詳細
            </h1>
            <Link
              href={dashboardReturnURL}
              className="text-blue-600 hover:text-blue-800 underline text-sm sm:text-base"
            >
              ← ダッシュボードに戻る
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="py-4 sm:py-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 sm:px-6 py-6 sm:py-8">
              {/* タイトルと基本情報 */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight flex-1">
                    {event.title}
                  </h2>
                  
                  {/* URLリンクアイコン */}
                  {(() => {
                    const memorableUrls = extractUrls(event.memorableThings || '');
                    const finalMysteryUrls = extractUrls(event.finalMystery || '');
                    const allUrls = [...memorableUrls, ...finalMysteryUrls];
                    
                    if (allUrls.length > 0) {
                      return (
                        <div className="flex space-x-2 flex-shrink-0">
                          {allUrls.map((url, index) => (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title={url}
                            >
                              <LinkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                            </a>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      参加日
                    </h3>
                    <p className="text-base sm:text-lg text-gray-900">
                      {event.participationDate}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      団体
                    </h3>
                    <p className="text-base sm:text-lg text-gray-900">
                      {event.organization}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg sm:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      形式
                    </h3>
                    <p className="text-base sm:text-lg text-gray-900">
                      {event.format}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg sm:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      記録日時
                    </h3>
                    <p className="text-base sm:text-lg text-gray-900">
                      {event.timestamp}
                    </p>
                  </div>
                </div>
              </div>

              {/* ストーリー */}
              {event.story && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                    ストーリー
                  </h3>
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                    <p className="text-sm sm:text-base text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {event.story}
                    </p>
                  </div>
                </div>
              )}

              {/* 印象的なこと */}
              {event.memorableThings && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                    印象的なこと
                  </h3>
                  <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                    <p className="text-sm sm:text-base text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {event.memorableThings}
                    </p>
                  </div>
                </div>
              )}

              {/* ラス謎 */}
              {event.finalMystery && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                    ラス謎
                  </h3>
                  <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
                    <p className="text-sm sm:text-base text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {event.finalMystery}
                    </p>
                  </div>
                </div>
              )}

              {/* フッターアクション */}
              <div className="border-t pt-4 sm:pt-6 mt-6 sm:mt-8">
                <div className="flex justify-center sm:justify-between">
                  <Link
                    href={dashboardReturnURL}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    ← 一覧に戻る
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
