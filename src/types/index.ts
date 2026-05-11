export type KnowledgeType = 'note' | 'link' | 'insight';

export interface Knowledge {
  id: string;
  title: string;
  content: string;
  type: KnowledgeType;
  tags: string[];
  summary?: string;
  sourceUrl?: string;
  createdAt: string;
}

export interface KnowledgeFormData {
  title: string;
  content: string;
  type: KnowledgeType;
  tags: string;
  sourceUrl: string;
}

export type SortOrder = 'newest' | 'oldest';
export type ViewMode = 'grid' | 'list';

export interface QueryResult {
  answer: string;
  sources: Array<{ id: string; title: string }>;
}

export interface FilterState {
  type: KnowledgeType | 'all';
  tags: string[];
  sort: SortOrder;
  search: string;
}
