import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getSheetData } from '@/lib/sheets';

interface OrganizationData {
  name: string;
  totalEvents: number;
  formatCounts: { [format: string]: number };
}

export async function GET(request: NextRequest) {
  // 認証チェック
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  try {
    // Google Sheetsからデータを取得
    const sheetData = await getSheetData();
    
    if (!sheetData || sheetData.length === 0) {
      return NextResponse.json([]);
    }

    // 団体別のデータを集計
    const organizationMap = new Map<string, OrganizationData>();

    sheetData.forEach((row) => {
      const organizationRaw = row.organization?.trim();
      const format = row.format?.trim();
      
      if (!organizationRaw) return;

      // カンマで団体名を分割（共同公演の場合）
      const organizations = organizationRaw.split(',').map(org => org.trim()).filter(org => org.length > 0);

      // 各団体の公演数をカウント
      organizations.forEach((organization) => {
        if (!organizationMap.has(organization)) {
          organizationMap.set(organization, {
            name: organization,
            totalEvents: 0,
            formatCounts: {}
          });
        }

        const orgData = organizationMap.get(organization)!;
        orgData.totalEvents++;

        if (format) {
          orgData.formatCounts[format] = (orgData.formatCounts[format] || 0) + 1;
        }
      });
    });

    // MapをArrayに変換
    const organizations = Array.from(organizationMap.values());

    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'データの取得に失敗しました' },
      { status: 500 }
    );
  }
}
