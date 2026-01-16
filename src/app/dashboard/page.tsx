'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MagnifyingGlassIcon, LinkIcon } from '@heroicons/react/24/outline';
import { EventData } from '@/types';

interface EventsResponse {
  events: EventData[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  uniqueFormats: string[];
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URLを検出する関数
  const extractUrls = (text: string): string[] => {
    if (!text) return [];
    const urlRegex = /https?:\/\/[^\s]+/gi;
    return text.match(urlRegex) || [];
  };
  
  // 団体名をレンダリングする関数（カンマ区切り対応）
  const renderOrganizations = (organizationText: string) => {
    const organizations = organizationText.split(',').map(org => org.trim()).filter(org => org.length > 0);
    
    if (organizations.length === 0) {
      return null;
    }
    
    if (organizations.length === 1) {
      return (
        <button
          onClick={() => handleOrganizationClick(organizations[0])}
          className="text-sm text-green-600 hover:text-green-900 hover:underline"
        >
          {organizations[0]}
        </button>
      );
    }
    
    return (
      <div className="flex flex-wrap gap-1 items-center">
        {organizations.map((org, idx) => (
          <span key={idx} className="inline-flex items-center">
            <button
              onClick={() => handleOrganizationClick(org)}
              className="text-sm text-green-600 hover:text-green-900 hover:underline"
            >
              {org}
            </button>
            {idx < organizations.length - 1 && (
              <span className="text-sm text-gray-400 mx-1">,</span>
            )}
          </span>
        ))}
      </div>
    );
  };
  
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [uniqueFormats, setUniqueFormats] = useState<string[]>([]);
  
  // フィルター状態をURLパラメータから初期化
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [searchText, setSearchText] = useState('');
  const [contentSearch, setContentSearch] = useState('');
  
  // 実際に検索に使用する状態
  const [activeSearchText, setActiveSearchText] = useState('');
  const [activeContentSearch, setActiveContentSearch] = useState('');
  
  // 初期化フラグ
  const [isInitialized, setIsInitialized] = useState(false);

  // URLパラメータを更新する関数
  const updateURL = (filters: {
    selectedFormat: string;
    selectedOrganization: string;
    activeSearchText: string;
    activeContentSearch: string;
    searchText?: string;
    contentSearch?: string;
  }, page: number) => {
    const params = new URLSearchParams();
    
    if (filters.selectedFormat) params.set('format', filters.selectedFormat);
    if (filters.selectedOrganization) params.set('organization', filters.selectedOrganization);
    if (filters.activeSearchText) params.set('searchText', filters.activeSearchText);
    if (filters.activeContentSearch) params.set('contentSearch', filters.activeContentSearch);
    if (page > 1) params.set('page', page.toString());
    
    const queryString = params.toString();
    const newURL = queryString ? `/dashboard?${queryString}` : '/dashboard';
    
    // ブラウザ履歴を更新（リロードなし）
    window.history.replaceState({}, '', newURL);
    
    // セッションストレージにも状態を保存
    const state = {
      filters: {
        selectedFormat: filters.selectedFormat,
        selectedOrganization: filters.selectedOrganization,
        activeSearchText: filters.activeSearchText,
        activeContentSearch: filters.activeContentSearch,
        searchText: filters.searchText || filters.activeSearchText,
        contentSearch: filters.contentSearch || filters.activeContentSearch,
      },
      currentPage: page,
      scrollPosition: window.scrollY
    };
    sessionStorage.setItem('dashboardState', JSON.stringify(state));
  };

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedFormat) params.append('format', selectedFormat);
      if (selectedOrganization) params.append('organization', selectedOrganization);
      if (activeSearchText) params.append('searchText', activeSearchText);
      if (activeContentSearch) params.append('contentSearch', activeContentSearch);
      params.append('page', currentPage.toString());

      const response = await fetch(`/api/events?${params}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/');
          return;
        }
        throw new Error('データの取得に失敗しました');
      }

      const data: EventsResponse = await response.json();
      setEvents(data.events);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
      setUniqueFormats(data.uniqueFormats);

      // URLとセッションストレージを更新
      updateURL({
        selectedFormat,
        selectedOrganization,
        activeSearchText,
        activeContentSearch,
        searchText,
        contentSearch
      }, currentPage);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedFormat, selectedOrganization, activeSearchText, activeContentSearch, router]);

  // 初期化とURLパラメータ処理
  useEffect(() => {
    if (!isInitialized) {
      // URLパラメータから初期値を設定
      const format = searchParams.get('format') || '';
      const organization = searchParams.get('organization') || '';
      const searchTextParam = searchParams.get('searchText') || '';
      const contentSearchParam = searchParams.get('contentSearch') || '';
      const page = parseInt(searchParams.get('page') || '1');

      setSelectedFormat(format);
      setSelectedOrganization(organization);
      setSearchText(searchTextParam);
      setContentSearch(contentSearchParam);
      setActiveSearchText(searchTextParam);
      setActiveContentSearch(contentSearchParam);
      setCurrentPage(page);
      
      setIsInitialized(true);
    }
  }, [searchParams, isInitialized]);

  // ページ戻り時のスクロール位置復元
  useEffect(() => {
    if (isInitialized && !loading) {
      const savedState = sessionStorage.getItem('dashboardState');
      if (savedState) {
        try {
          const { scrollPosition } = JSON.parse(savedState);
          if (scrollPosition) {
            setTimeout(() => {
              window.scrollTo(0, scrollPosition);
            }, 100);
          }
        } catch (e) {
          console.error('Failed to restore scroll position:', e);
        }
      }
    }
  }, [isInitialized, loading]);

  useEffect(() => {
    // 初期化が完了してからデータを取得
    if (isInitialized) {
      fetchEvents();
    }
  }, [fetchEvents, isInitialized]);

  const handleSearch = () => {
    setCurrentPage(1);
    setActiveSearchText(searchText);
  };

  const handleContentSearch = () => {
    setCurrentPage(1);
    setActiveContentSearch(contentSearch);
  };

  const handleFormatChange = (format: string) => {
    setSelectedFormat(format);
    setCurrentPage(1);
  };

  const handleOrganizationClick = (organization: string) => {
    setSelectedFormat('');
    setSelectedOrganization(organization);
    setSearchText('');
    setContentSearch('');
    setActiveSearchText('');
    setActiveContentSearch('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleReset = () => {
    setSelectedFormat('');
    setSelectedOrganization('');
    setSearchText('');
    setContentSearch('');
    setActiveSearchText('');
    setActiveContentSearch('');
    setCurrentPage(1);
    
    // URLパラメータもクリア
    window.history.replaceState({}, '', '/dashboard');
    
    // セッションストレージもクリア
    sessionStorage.removeItem('dashboardState');
  };

  // イベント詳細ページへの遷移（状態保存付き）
  const navigateToEvent = (eventId: number) => {
    // 現在の状態をセッションストレージに保存
    const currentState = {
      filters: {
        selectedFormat,
        selectedOrganization,
        activeSearchText,
        activeContentSearch,
        searchText,
        contentSearch,
      },
      currentPage,
      scrollPosition: window.scrollY
    };
    sessionStorage.setItem('dashboardState', JSON.stringify(currentState));
    
    router.push(`/event/${eventId}`);
  };

  const handleLogout = async () => {
    // セッションストレージをクリア
    sessionStorage.removeItem('dashboardState');
    
    // 認証Cookieを削除
    document.cookie = 'authenticated=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    router.push('/');
  };

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
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-3 sm:gap-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              謎解きイベント記録
            </h1>
            <div className="flex items-center gap-4 self-end sm:self-auto">
              <Link
                href="/organizations"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                団体別公演数
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="py-4 sm:py-6">
          {/* フィルターとサーチ */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-4 sm:mb-6">
            {/* 選択された組織の表示 */}
            {selectedOrganization && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-sm text-blue-800">
                    団体フィルタ: <strong>{selectedOrganization}</strong>
                  </span>
                  <button
                    onClick={() => setSelectedOrganization('')}
                    className="text-blue-600 hover:text-blue-800 text-sm underline self-start sm:self-auto"
                  >
                    解除
                  </button>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 形式フィルター */}
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  形式で絞り込み
                </label>
                <select
                  value={selectedFormat}
                  onChange={(e) => handleFormatChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base sm:text-sm"
                >
                  <option value="">全て</option>
                  {uniqueFormats.map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
              </div>

              {/* テキスト検索 */}
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タイトル・団体名検索
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base sm:text-sm"
                    placeholder="検索キーワード"
                  />
                  <button
                    onClick={handleSearch}
                    className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="検索"
                  >
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* 内容検索 */}
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  内容検索
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={contentSearch}
                    onChange={(e) => setContentSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleContentSearch()}
                    className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base sm:text-sm"
                    placeholder="ストーリー・印象等"
                  />
                  <button
                    onClick={handleContentSearch}
                    className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    title="内容検索"
                  >
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* リセット */}
              <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                <button
                  onClick={handleReset}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 text-base sm:text-sm"
                >
                  リセット
                </button>
              </div>
            </div>
          </div>

          {/* 結果表示 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                イベント一覧 ({totalItems}件)
              </h2>
            </div>

            {/* デスクトップ用テーブル */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      参加日 ↓
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      タイトル
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      団体
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      形式
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      リンク
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event, index) => {
                    const memorableUrls = extractUrls(event.memorableThings || '');
                    const finalMysteryUrls = extractUrls(event.finalMystery || '');
                    const allUrls = [...memorableUrls, ...finalMysteryUrls];
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {event.participationDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => navigateToEvent(event.originalIndex ?? index)}
                            className="text-sm text-blue-600 hover:text-blue-900 hover:underline text-left"
                          >
                            {event.title}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          {renderOrganizations(event.organization)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {event.format}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {allUrls.length > 0 && (
                            <div className="flex space-x-2">
                              {allUrls.map((url, urlIndex) => (
                                <a
                                  key={urlIndex}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-900"
                                  title={url}
                                >
                                  <LinkIcon className="h-4 w-4" />
                                </a>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* モバイル用カードレイアウト */}
            <div className="sm:hidden divide-y divide-gray-200">
              {events.map((event, index) => {
                const memorableUrls = extractUrls(event.memorableThings || '');
                const finalMysteryUrls = extractUrls(event.finalMystery || '');
                const allUrls = [...memorableUrls, ...finalMysteryUrls];
                
                return (
                  <div key={index} className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <button
                          onClick={() => navigateToEvent(event.originalIndex ?? index)}
                          className="text-blue-600 hover:text-blue-900 hover:underline font-medium text-sm line-clamp-2 text-left"
                        >
                          {event.title}
                        </button>
                        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                          {allUrls.length > 0 && (
                            <div className="flex space-x-1">
                              {allUrls.map((url, urlIndex) => (
                                <a
                                  key={urlIndex}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-900"
                                  title={url}
                                >
                                  <LinkIcon className="h-4 w-4" />
                                </a>
                              ))}
                            </div>
                          )}
                          <span className="text-xs text-gray-500">
                            {event.participationDate}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {event.organization.split(',').map(org => org.trim()).filter(org => org.length > 0).map((org, orgIdx) => (
                          <button
                            key={orgIdx}
                            onClick={() => handleOrganizationClick(org)}
                            className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                          >
                            {org}
                          </button>
                        ))}
                        <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                          {event.format}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ページネーション */}
            {totalPages > 1 && (
              <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                  <div className="text-sm text-gray-700">
                    ページ {currentPage} / {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      前へ
                    </button>
                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      次へ
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
