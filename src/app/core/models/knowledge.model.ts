export interface KnowledgeDocumentRequest {
  title: string;
  sourceType: string;
  content: string;
  tags: string[];
  metadata: Record<string, unknown>;
}

export interface KnowledgeDocumentResponse {
  message: string;
  documentId: string;
  title: string;
}

export interface KnowledgeSearchResult {
  documentId: string;
  documentTitle: string;
  chunkIndex: number;
  text: string;
}

export interface KnowledgeDocumentSummary {
  id: string;
  title: string;
  sourceType: string;
  content: string;
  tags: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface KnowledgeDocumentPage {
  items: KnowledgeDocumentSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
