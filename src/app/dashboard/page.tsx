'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { EventData } from '@/types';

interface EventsResponse {
  events: EventData[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  uniqueFormats: string[];
}

export default function Dashboard() {
  const router = useRouter();
  
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [uniqueFormats, setUniqueFormats] = useState<string[]>([]);
  
  // フィルター状態
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [searchText, setSearchText] = useState('');
  const [contentSearch, setContentSearch] = useState('');
  
  // 実際に検索に使用する状態（ボタンを押したときのみ更新）
  const [activeSearchText, setActiveSearchText] = useState('');
  const [activeContentSearch, setActiveContentSearch] = useState('');

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedFormat, selectedOrganization, activeSearchText, activeContentSearch, router]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearch = () => {
    setCurrentPage(1);
    setActiveSearchText(searchText);
  };

  const handleContentSearch = () => {
    setCurrentPage(1);
    setActiveContentSearch(contentSearch);
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

  const handleLogout = async () => {
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
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              謎解きイベント記録
            </h1>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* フィルターとサーチ */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            {/* 選択された組織の表示 */}
            {selectedOrganization && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">
                    団体フィルタ: <strong>{selectedOrganization}</strong>
                  </span>
                  <button
                    onClick={() => setSelectedOrganization('')}
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    解除
                  </button>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* 形式フィルター */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  形式で絞り込み
                </label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タイトル・団体名検索
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="検索キーワード"
                  />
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="検索"
                  >
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* 内容検索 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  内容検索
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={contentSearch}
                    onChange={(e) => setContentSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleContentSearch()}
                    className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ストーリー・印象等"
                  />
                  <button
                    onClick={handleContentSearch}
                    className="px-4 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    title="内容検索"
                  >
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* リセット */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedFormat('');
                    setSelectedOrganization('');
                    setSearchText('');
                    setContentSearch('');
                    setActiveSearchText('');
                    setActiveContentSearch('');
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  リセット
                </button>
              </div>
            </div>
          </div>

          {/* 結果表示 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                イベント一覧 ({totalItems}件)
              </h2>
            </div>

            <div className="overflow-x-auto">
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.participationDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/event/${event.originalIndex ?? index}`}
                          className="text-sm text-blue-600 hover:text-blue-900 hover:underline"
                        >
                          {event.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleOrganizationClick(event.organization)}
                          className="text-sm text-green-600 hover:text-green-900 hover:underline"
                        >
                          {event.organization}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.format}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ページネーション */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    ページ {currentPage} / {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      前へ
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
