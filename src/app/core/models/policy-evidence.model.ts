export interface PolicyEvidence {
  policyId?: string;
  title?: string;
  similarityScore?: number;
  matchedText?: string;
  sourceDocument?: string;
  policyName?: string;
  excerpt?: string;
  relevanceScore?: number;
  sourceChunkId?: string;
}
