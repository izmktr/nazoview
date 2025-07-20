# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a Next.js project that displays Google Spreadsheet data in a blog-like format.

## Project Overview
- **Framework**: Next.js 15 with TypeScript and Tailwind CSS
- **Authentication**: Password-based authentication with environment variables
- **Data Source**: Google Sheets API
- **Features**: Search, filtering, pagination, individual post pages
- **Deployment**: Vercel with automatic deployment

## Key Features to Implement
1. Password authentication screen
2. Main dashboard with table view of Google Sheets data
3. Pagination (30 rows per page)
4. Filtering by "形式" (format)
5. Text search in title and organization
6. Content search in story, memorable moments, and final mystery
7. Individual detail pages for each entry
8. Organization filtering when clicked

## Google Sheets Structure
- タイムスタンプ (Timestamp)
- 参加日 (Participation Date)
- タイトル (Title)
- 団体 (Organization)
- 形式 (Format)
- ストーリー (Story)
- 印象的なこと (Memorable Things)
- ラス謎 (Final Mystery)

## Technical Requirements
- Use Next.js App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Google Sheets API for data fetching
- Environment variables for sensitive data
- Responsive design
- Server-side rendering where appropriate
