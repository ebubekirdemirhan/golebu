import type { Match, MatchDataSource, SourceHealth } from './types';

export interface FetchRange {
  from: string;
  to: string;
}

export interface SourceFetchResult {
  source: MatchDataSource;
  matches: Match[];
  health: SourceHealth;
}

export interface MatchSourceProvider {
  name: MatchDataSource;
  fetch(range: FetchRange): Promise<SourceFetchResult>;
}
