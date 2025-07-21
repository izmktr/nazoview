'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface OrganizationData {
  name: string;
  totalEvents: number;
  formatCounts: { [format: string]: number };
}

type SortField = 'name' | 'totalEvents';
type SortOrder = 'asc' | 'desc';

export default function OrganizationsPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<OrganizationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortField, setSortField] = useState<SortField>('totalEvents');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    fetchOrganizations();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/organizations');
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/');
          return;
        }
        throw new Error('データの取得に失敗しました');
      }

      const data: OrganizationData[] = await response.json();
      setOrganizations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedOrganizations = [...organizations].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'name') {
      comparison = a.name.localeCompare(b.name, 'ja');
    } else if (sortField === 'totalEvents') {
      comparison = a.totalEvents - b.totalEvents;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return '↕️';
    }
    return sortOrder === 'asc' ? '↑' : '↓';
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
              団体別公演数
            </h1>
            <div className="flex gap-3">
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                ← ダッシュボード
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="py-4 sm:py-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                団体一覧 ({organizations.length}団体)
              </h2>
            </div>

            {/* デスクトップ用テーブル */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      団体名 {getSortIcon('name')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('totalEvents')}
                    >
                      公演数 {getSortIcon('totalEvents')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedOrganizations.map((org, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/dashboard?organization=${encodeURIComponent(org.name)}`}
                          className="text-sm text-blue-600 hover:text-blue-900 hover:underline font-medium"
                        >
                          {org.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap relative group">
                        <span className="text-sm text-gray-900 font-medium">
                          {org.totalEvents}
                        </span>
                        
                        {/* ホバー時の詳細表示 - 上部3行は下に表示、それ以外は上に表示 */}
                        <div className={`absolute left-0 hidden group-hover:block z-20 ${
                          index < 3 
                            ? 'top-full mt-2' 
                            : 'bottom-full mb-2'
                        }`}>
                          <div className="bg-gray-800 text-white text-xs rounded-lg py-2 px-3 shadow-lg min-w-max">
                            <div className="font-semibold mb-1">形式別内訳:</div>
                            {Object.entries(org.formatCounts)
                              .sort(([,a], [,b]) => b - a)
                              .map(([format, count]) => (
                                <div key={format} className="flex justify-between gap-3">
                                  <span>{format}:</span>
                                  <span className="font-medium">{count}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* モバイル用カードレイアウト */}
            <div className="sm:hidden divide-y divide-gray-200">
              <div className="p-4 bg-gray-50 border-b">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex-1 px-3 py-2 text-xs bg-white border rounded-md hover:bg-gray-50"
                  >
                    団体名順 {getSortIcon('name')}
                  </button>
                  <button
                    onClick={() => handleSort('totalEvents')}
                    className="flex-1 px-3 py-2 text-xs bg-white border rounded-md hover:bg-gray-50"
                  >
                    公演数順 {getSortIcon('totalEvents')}
                  </button>
                </div>
              </div>
              
              {sortedOrganizations.map((org, index) => (
                <div key={index} className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <Link
                        href={`/dashboard?organization=${encodeURIComponent(org.name)}`}
                        className="text-blue-600 hover:text-blue-900 hover:underline font-medium text-sm flex-1 mr-2"
                      >
                        {org.name}
                      </Link>
                      <span className="text-lg font-bold text-gray-900 flex-shrink-0">
                        {org.totalEvents}
                      </span>
                    </div>
                    
                    {/* モバイルでの形式別内訳 */}
                    <div className="text-xs text-gray-600">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(org.formatCounts)
                          .sort(([,a], [,b]) => b - a)
                          .map(([format, count]) => (
                            <span key={format} className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-full">
                              {format}: {count}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
