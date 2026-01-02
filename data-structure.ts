// Core Node Types
interface BaseNode {
id: string;
type: NodeType;
createdAt: Date;
updatedAt: Date;
metadata: NodeMetadata;
}

enum NodeType {
MEME = ‘MEME’,
AXIOM = ‘AXIOM’,
EVENT = ‘EVENT’,
STATISTIC = ‘STATISTIC’,
TEXT = ‘TEXT’,
PERSON = ‘PERSON’,
CONCEPT = ‘CONCEPT’
}

interface NodeMetadata {
title: string;
description?: string;
tags: string[];
citadelScore: number; // Number of verified source connections
controversyLevel: ‘low’ | ‘medium’ | ‘high’;
}

// Meme Node (Visual Entry Point)
interface MemeNode extends BaseNode {
type: NodeType.MEME;
content: {
imageUrl: string;
imageHash: string; // For integrity verification
caption?: string;
altText: string;
};
}

// Text Node (Books, Articles, Documents)
interface TextNode extends BaseNode {
type: NodeType.TEXT;
content: {
text: string;
excerpt?: string;
};
provenance: SourceProvenance;
}

// Axiom Node (Philosophical Principles)
interface AxiomNode extends BaseNode {
type: NodeType.AXIOM;
content: {
statement: string;
formalLogic?: string;
};
tradition?: string;
}

// Event Node (Historical Events)
interface EventNode extends BaseNode {
type: NodeType.EVENT;
content: {
description: string;
location?: string;
};
timeframe: {
startDate: Date;
endDate?: Date;
precision: ‘year’ | ‘month’ | ‘day’ | ‘approximate’;
};
}

// Statistic Node (Data Points)
interface StatisticNode extends BaseNode {
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

// Source Provenance (Immutable Attribution)
interface SourceProvenance {
author: string;
title: string;
publicationYear: number;
publisher?: string;
edition?: string;
pages?: string;
isbn?: string;
doi?: string;
url?: string;
archiveHash?: string; // IPFS/Arweave hash for immutable storage
verifiedScanUrl?: string;
retrievedDate?: Date;
}

// Edge Types (Relationships)
interface BaseEdge {
id: string;
sourceId: string;
targetId: string;
type: EdgeType;
weight: number; // Strength of connection (0-1)
createdBy: string; // User ID
verifiedBy?: string[]; // Other users who verified
metadata: EdgeMetadata;
}

enum EdgeType {
SUPPORTS = ‘SUPPORTS’,
CONTRADICTS = ‘CONTRADICTS’,
DERIVES_FROM = ‘DERIVES_FROM’,
INSPIRED_BY = ‘INSPIRED_BY’,
EXEMPLIFIES = ‘EXEMPLIFIES’,
CRITIQUES = ‘CRITIQUES’,
PRECEDED = ‘PRECEDED’,
CAUSED = ‘CAUSED’,
RELATED_TO = ‘RELATED_TO’
}

interface EdgeMetadata {
reasoning: string;
confidence: number; // 0-1 scale
citations?: string[];
disputedBy?: string[]; // IDs of counter-arguments
}

// User Contribution Tracking
interface UserContribution {
userId: string;
nodeId: string;
contributionType: ‘create’ | ‘verify’ | ‘dispute’ | ‘enhance’;
timestamp: Date;
reputationGained: number;
}

// Graph Query Types
interface GraphQuery {
startNodeId: string;
maxDepth: number;
edgeTypes?: EdgeType[];
minWeight?: number;
excludeDisputed?: boolean;
}

interface GraphPath {
nodes: BaseNode[];
edges: BaseEdge[];
pathStrength: number;
narrative?: string; // Auto-generated explanation
}

// API Response Types
interface CitadelScoreBreakdown {
totalConnections: number;
verifiedSources: number;
primarySources: number;
secondarySources: number;
userVerifications: number;
}

interface NodeWithDepth extends BaseNode {
depth: number;
pathFromRoot: string[];
supportingEvidence: BaseNode[];
contradictingEvidence: BaseNode[];
}

export type {
BaseNode,
MemeNode,
TextNode,
AxiomNode,
EventNode,
StatisticNode,
SourceProvenance,
BaseEdge,
EdgeMetadata,
UserContribution,
GraphQuery,
GraphPath,
CitadelScoreBreakdown,
NodeWithDepth
};

export { NodeType, EdgeType };