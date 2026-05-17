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
