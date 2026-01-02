/**
 * AEGIS MEME CITADEL - Core Data Schema
 * All TypeScript interfaces and types for the system
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum NodeType {
  MEME = 'MEME',
  AXIOM = 'AXIOM',
  EVENT = 'EVENT',
  STATISTIC = 'STATISTIC',
  TEXT = 'TEXT',
  PERSON = 'PERSON',
  CONCEPT = 'CONCEPT'
}

export enum EdgeType {
  SUPPORTS = 'SUPPORTS',
  DISPUTES = 'DISPUTES',
  CONTEXT = 'CONTEXT',
  RELATED = 'RELATED',
  CITES = 'CITES',
  REFUTES = 'REFUTES',
  EXPANDS = 'EXPANDS'
}

// ============================================================================
// CORE INTERFACES
// ============================================================================

export interface NodeMetadata {
  title: string;
  description?: string;
  tags: string[];
  citadelScore: number;
  controversyLevel: 'low' | 'medium' | 'high';
}

export interface BaseNode {
  id: string;
  type: NodeType;
  createdAt: Date;
  updatedAt: Date;
  metadata: NodeMetadata;
}

export interface SourceProvenance {
  author: string;
  title: string;
  publicationYear: number;
  publisher?: string;
  edition?: string;
  pages?: string;
  isbn?: string;
  doi?: string;
  url?: string;
  archiveHash?: string;
  verifiedScanUrl?: string;
  retrievedDate?: Date;
}

// ============================================================================
// NODE TYPES
// ============================================================================

export interface MemeNode extends BaseNode {
  type: NodeType.MEME;
  content: {
    imageUrl: string;
    imageHash: string;
    caption?: string;
    altText: string;
  };
}

export interface TextNode extends BaseNode {
  type: NodeType.TEXT;
  content: {
    text: string;
    excerpt?: string;
  };
  provenance: SourceProvenance;
}

export interface AxiomNode extends BaseNode {
  type: NodeType.AXIOM;
  content: {
    statement: string;
    formalLogic?: string;
  };
  tradition?: string;
}

export interface EventNode extends BaseNode {
  type: NodeType.EVENT;
  content: {
    description: string;
    location?: string;
  };
  timeframe: {
    startDate: Date;
    endDate?: Date;
    precision: 'year' | 'month' | 'day' | 'approximate';
  };
}

export interface StatisticNode extends BaseNode {
  type: NodeType.STATISTIC;
  content: {
    value: number | string;
    metric: string;
    unit?: string;
    context: string;
  };
  methodology?: string;
  provenance: SourceProvenance;
}

export interface PersonNode extends BaseNode {
  type: NodeType.PERSON;
  content: {
    name: string;
    biography: string;
    notableworks?: string[];
  };
  timeframe?: {
    born?: Date;
    died?: Date;
  };
}

export interface ConceptNode extends BaseNode {
  type: NodeType.CONCEPT;
  content: {
    definition: string;
    etymology?: string;
    relatedConcepts?: string[];
  };
}

export type AnyNode = 
  | MemeNode 
  | TextNode 
  | AxiomNode 
  | EventNode 
  | StatisticNode 
  | PersonNode 
  | ConceptNode;

// ============================================================================
// EDGES & RELATIONSHIPS
// ============================================================================

export interface BaseEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: EdgeType;
  weight: number;
  createdBy: string;
  createdAt: Date;
  metadata: {
    explanation?: string;
    strength: 'weak' | 'moderate' | 'strong';
    verified: boolean;
    verifiedBy?: string[];
  };
}

// ============================================================================
// GRAPH & QUERY STRUCTURES
// ============================================================================

export interface CitadelScoreBreakdown {
  total: number;
  verifiedSources: number;
  disputedSources: number;
  pendingVerification: number;
  trustWeightedScore: number;
}

export interface GraphQuery {
  nodeId?: string;
  nodeType?: NodeType;
  edgeType?: EdgeType;
  maxDepth?: number;
  limit?: number;
  offset?: number;
}

export interface GraphPath {
  nodes: AnyNode[];
  edges: BaseEdge[];
  totalWeight: number;
}

// ============================================================================
// EVIDENCE & VERIFICATION
// ============================================================================

export interface Evidence {
  id: string;
  type: NodeType;
  title: string;
  author?: string;
  year?: number;
  excerpt?: string;
  url?: string;
  archiveUrl?: string;
  contentType: 'PDF' | 'VIDEO' | 'ARTICLE' | 'PASTEBIN' | 'DATA' | 'BOOK';
  metadata: {
    verified: boolean;
    verifiedAt?: Date;
    verifiedBy?: string;
  };
}

export interface VerificationVote {
  id: string;
  evidenceId: string;
  voterId: string;
  vote: 'verify' | 'dispute' | 'needsReview';
  stake: number;
  reasoning: string;
  timestamp: Date;
}

// ============================================================================
// FINGERPRINTING & IDENTITY
// ============================================================================

export interface FingerprintComponents {
  ip: string;
  geolocation: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timezone: string;
  };
  rtt: number;
  browserFingerprint: {
    userAgent: string;
    screenResolution: string;
    timezone: string;
    language: string;
    platform: string;
    hardwareConcurrency: number;
    deviceMemory?: number;
    colorDepth: number;
    pixelRatio: number;
    webglVendor?: string;
    webglRenderer?: string;
    canvasFingerprint?: string;
    fonts?: string[];
    plugins?: any[];
    mimeTypes?: string[];
    doNotTrack?: string;
    cookieEnabled?: boolean;
    battery?: any;
    connection?: any;
    mediaDevices?: any;
    webrtcIPs?: string[];
    permissions?: any;
    storage?: any;
    webglParams?: any;
    webglExtensions?: string[];
  };
  timestamp: Date;
}

export interface IdentityFingerprint {
  publicId: string;
  internalHash: string;
  trustScore: number;
  metadata: {
    created: Date;
    lastSeen: Date;
    geohash: string;
    rttBucket: string;
    visitCount: number;
  };
  flags: {
    vpn: boolean;
    tor: boolean;
    proxy: boolean;
    multipleAccounts: boolean;
  };
  reputation: {
    accountAge: number;
    contributionCount: number;
    verificationRate: number;
  };
}

export interface CookieFingerprint {
  persistentId: string;
  sessionId: string;
  installationId: string;
  firstSeen: Date;
  lastSeen: Date;
  visitCount: number;
  storageSignature: string;
}

export interface StorageCapabilities {
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
  cookies: boolean;
  webSQL: boolean;
  cacheAPI: boolean;
}

// ============================================================================
// STORAGE & ARCHIVAL
// ============================================================================

export interface StorageResult {
  hash: string;
  url: string;
  timestamp: Date;
  size: number;
  storageType: 'ipfs' | 'arweave';
}

export interface SourceArchive {
  originalUrl?: string;
  content: Buffer | string;
  contentType: string;
  metadata: {
    title: string;
    author?: string;
    publicationDate?: string;
    archiveReason: string;
  };
}

export default {
  NodeType,
  EdgeType
};
