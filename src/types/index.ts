export interface EventData {
  timestamp: string;
  participationDate: string;
  title: string;
  organization: string;
  format: string;
  story: string;
  memorableThings: string;
  finalMystery: string;
}

export interface FilterParams {
  format?: string;
  searchText?: string;
  contentSearch?: string;
  organization?: string;
  page?: number;
}
